#!/usr/bin/env python3
"""
Autonomous Quiz Generation System
Self-learning, self-testing, self-deploying cloud service
"""

import json
import os
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import hashlib
import random

# Cloud service imports (install: pip install boto3 google-cloud-storage psycopg2 redis celery)
import boto3
import psycopg2
from redis import Redis
from celery import Celery
from celery.schedules import crontab
import requests
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Import our existing modules
import sys
sys.path.append('..')
from quiz_testing_framework import QuestionTester, DifficultyLevel
from question_generator import QuestionPipeline, GeneratedQuestion

Base = declarative_base()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
config = {
    'database_url': os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/quizdb'),
    'redis_url': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    'aws_region': os.getenv('AWS_REGION', 'us-east-1'),
    's3_bucket': os.getenv('S3_BUCKET', 'quiz-content-bucket'),
    'slack_webhook': os.getenv('SLACK_WEBHOOK_URL'),
    'openai_api_key': os.getenv('OPENAI_API_KEY'),
    'min_quality_score': float(os.getenv('MIN_QUALITY_SCORE', '0.75')),
    'auto_deploy_threshold': int(os.getenv('AUTO_DEPLOY_THRESHOLD', '10')),
    'feedback_learning_rate': float(os.getenv('FEEDBACK_LEARNING_RATE', '0.1'))
}

# Database Models
class QuestionModel(Base):
    __tablename__ = 'questions'
    
    id = Column(String, primary_key=True)
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answer = Column(Integer, nullable=False)
    explanation = Column(String)
    difficulty = Column(Integer)
    category = Column(String)
    tags = Column(JSON)
    
    # Quality metrics
    quality_score = Column(Float)
    clarity_score = Column(Float)
    difficulty_score = Column(Float)
    
    # Performance metrics
    times_shown = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    avg_response_time = Column(Float)
    user_rating = Column(Float)
    
    # Metadata
    source = Column(String)
    generated_at = Column(DateTime, default=datetime.utcnow)
    deployed_at = Column(DateTime)
    is_active = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    
class GenerationJob(Base):
    __tablename__ = 'generation_jobs'
    
    id = Column(String, primary_key=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    status = Column(String)  # pending, running, completed, failed
    source_type = Column(String)  # documentation, stackoverflow, github, etc
    source_url = Column(String)
    questions_generated = Column(Integer, default=0)
    questions_passed = Column(Integer, default=0)
    questions_deployed = Column(Integer, default=0)
    error_message = Column(String)
    metrics = Column(JSON)

class FeedbackModel(Base):
    __tablename__ = 'feedback'
    
    id = Column(String, primary_key=True)
    question_id = Column(String)
    user_id = Column(String)
    correct = Column(Boolean)
    response_time = Column(Float)
    rating = Column(Integer)
    reported_issue = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Celery configuration for async tasks
celery_app = Celery(
    'quiz_generator',
    broker=config['redis_url'],
    backend=config['redis_url']
)

# Celery beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'generate-morning-batch': {
        'task': 'tasks.generate_daily_batch',
        'schedule': crontab(hour=6, minute=0),  # 6 AM daily
    },
    'quality-check': {
        'task': 'tasks.quality_assessment',
        'schedule': crontab(hour=12, minute=0),  # Noon daily
    },
    'deploy-approved': {
        'task': 'tasks.auto_deploy',
        'schedule': crontab(hour=18, minute=0),  # 6 PM daily
    },
    'scrape-trending': {
        'task': 'tasks.scrape_trending_content',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    'learn-from-feedback': {
        'task': 'tasks.feedback_learning',
        'schedule': crontab(hour='*/4'),  # Every 4 hours
    },
    'health-check': {
        'task': 'tasks.system_health_check',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    }
}

class AutonomousQuizSystem:
    """Main autonomous system orchestrator"""
    
    def __init__(self):
        self.engine = create_engine(config['database_url'])
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        self.redis = Redis.from_url(config['redis_url'])
        self.s3 = boto3.client('s3', region_name=config['aws_region'])
        
        self.tester = QuestionTester()
        self.pipeline = QuestionPipeline()
        
        # Learning parameters
        self.quality_threshold = config['min_quality_score']
        self.learning_rate = config['feedback_learning_rate']
        
    def get_content_sources(self) -> List[Dict]:
        """Dynamically determine what content to scrape based on gaps"""
        
        # Analyze current question distribution
        category_counts = {}
        difficulty_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        questions = self.session.query(QuestionModel).filter_by(is_active=True).all()
        for q in questions:
            category_counts[q.category] = category_counts.get(q.category, 0) + 1
            difficulty_counts[q.difficulty] = difficulty_counts.get(q.difficulty, 0) + 1
        
        # Identify gaps
        target_per_category = 100
        target_per_difficulty = len(questions) / 5 if questions else 20
        
        sources = []
        
        # Add sources for underrepresented categories
        underrepresented = [
            cat for cat, count in category_counts.items() 
            if count < target_per_category
        ]
        
        # Priority sources based on gaps
        priority_sources = {
            'kubernetes': [
                'https://kubernetes.io/docs/concepts/',
                'https://kubernetes.io/docs/tasks/',
                'https://kubernetes.io/docs/tutorials/'
            ],
            'docker': [
                'https://docs.docker.com/engine/',
                'https://docs.docker.com/compose/',
                'https://docs.docker.com/best-practices/'
            ],
            'aws': [
                'https://docs.aws.amazon.com/ec2/',
                'https://docs.aws.amazon.com/lambda/',
                'https://docs.aws.amazon.com/s3/'
            ],
            'security': [
                'https://owasp.org/www-project-top-ten/',
                'https://cheatsheetseries.owasp.org/'
            ]
        }
        
        for category in underrepresented[:5]:  # Top 5 gaps
            if category in priority_sources:
                sources.append({
                    'type': 'documentation',
                    'urls': priority_sources[category],
                    'category': category,
                    'priority': 'high',
                    'target_count': target_per_category - category_counts.get(category, 0)
                })
        
        # Add trending content
        sources.append({
            'type': 'trending',
            'source': 'stackoverflow',
            'limit': 20,
            'priority': 'medium'
        })
        
        # Add variation generation for high-performing questions
        sources.append({
            'type': 'variations',
            'selection': 'top_rated',
            'count': 30,
            'priority': 'low'
        })
        
        return sources
    
    @celery_app.task
    def generate_daily_batch(self):
        """Main daily generation task"""
        job_id = hashlib.md5(str(datetime.utcnow()).encode()).hexdigest()[:8]
        
        job = GenerationJob(
            id=job_id,
            status='running',
            source_type='mixed'
        )
        self.session.add(job)
        self.session.commit()
        
        try:
            # Get dynamic sources based on gaps
            sources = self.get_content_sources()
            logger.info(f"Starting generation job {job_id} with {len(sources)} sources")
            
            all_questions = []
            
            for source in sources:
                if source['type'] == 'documentation':
                    questions = self.scrape_and_generate(source)
                elif source['type'] == 'trending':
                    questions = self.generate_from_trending(source)
                elif source['type'] == 'variations':
                    questions = self.generate_variations(source)
                else:
                    continue
                
                all_questions.extend(questions)
            
            # Test all questions
            passed_questions = self.test_and_filter(all_questions)
            
            # Store in staging
            staged_ids = self.stage_questions(passed_questions)
            
            # Update job
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            job.questions_generated = len(all_questions)
            job.questions_passed = len(passed_questions)
            job.metrics = {
                'pass_rate': len(passed_questions) / len(all_questions) if all_questions else 0,
                'sources_processed': len(sources),
                'staged_ids': staged_ids
            }
            
            self.session.commit()
            
            # Send notification
            self.notify_slack(
                f"✅ Generation Job {job_id} completed\n"
                f"Generated: {len(all_questions)}\n"
                f"Passed: {len(passed_questions)}\n"
                f"Pass Rate: {job.metrics['pass_rate']:.1%}"
            )
            
            return staged_ids
            
        except Exception as e:
            job.status = 'failed'
            job.error_message = str(e)
            self.session.commit()
            logger.error(f"Generation job {job_id} failed: {e}")
            self.notify_slack(f"❌ Generation Job {job_id} failed: {e}")
            raise
    
    def scrape_and_generate(self, source: Dict) -> List[Dict]:
        """Scrape documentation and generate questions"""
        questions = []
        
        for url in source['urls']:
            try:
                generated = self.pipeline.generate_from_url(
                    url, 
                    source['category'],
                    count=source.get('target_count', 20) // len(source['urls'])
                )
                questions.extend(generated)
            except Exception as e:
                logger.error(f"Failed to generate from {url}: {e}")
                continue
        
        return questions
    
    def generate_from_trending(self, source: Dict) -> List[Dict]:
        """Generate questions from trending content"""
        # Fetch trending topics from Stack Overflow
        trending_tags = self.get_trending_tags()
        questions = []
        
        for tag in trending_tags[:5]:
            try:
                generated = self.pipeline.scraper.scrape_stack_overflow(
                    tag, 
                    limit=source.get('limit', 10)
                )
                for content in generated:
                    q = self.pipeline.generator.generate_from_content(
                        content, 
                        tag.replace('-', '_'),
                        target_difficulty=3
                    )
                    questions.extend([ques.to_dict() for ques in q])
            except Exception as e:
                logger.error(f"Failed to generate from trending tag {tag}: {e}")
        
        return questions
    
    def generate_variations(self, source: Dict) -> List[Dict]:
        """Generate variations of high-performing questions"""
        # Get top-rated questions
        top_questions = self.session.query(QuestionModel)\
            .filter(QuestionModel.user_rating >= 4.0)\
            .filter(QuestionModel.times_shown >= 10)\
            .order_by(QuestionModel.user_rating.desc())\
            .limit(source.get('count', 10))\
            .all()
        
        variations = []
        for q in top_questions:
            q_dict = {
                'question': q.question,
                'options': q.options,
                'correctAnswer': q.correct_answer,
                'explanation': q.explanation,
                'difficulty': q.difficulty,
                'categorySlug': q.category,
                'tags': q.tags
            }
            
            vars = self.pipeline.generator.generate_variations(q_dict, num_variations=2)
            variations.extend([v.to_dict() for v in vars])
        
        return variations
    
    def test_and_filter(self, questions: List[Dict]) -> List[Dict]:
        """Test questions and filter based on quality"""
        passed = []
        
        for q in questions:
            test_result = self.tester.test_question(q)
            
            # Check if passes quality threshold
            if test_result['quality']['overall'] >= self.quality_threshold:
                # Add test results to question metadata
                q['test_results'] = test_result
                q['quality_score'] = test_result['quality']['overall']
                q['difficulty_assessed'] = test_result['difficulty']['level']
                passed.append(q)
        
        return passed
    
    def stage_questions(self, questions: List[Dict]) -> List[str]:
        """Stage questions for review/deployment"""
        staged_ids = []
        
        for q in questions:
            # Generate unique ID
            q_id = f"auto-{hashlib.md5(q['question'].encode()).hexdigest()[:8]}"
            
            # Check if already exists
            existing = self.session.query(QuestionModel).filter_by(id=q_id).first()
            if existing:
                continue
            
            # Create database entry
            question_model = QuestionModel(
                id=q_id,
                question=q['question'],
                options=q['options'],
                correct_answer=q['correctAnswer'],
                explanation=q.get('explanation', ''),
                difficulty=q.get('difficulty_assessed', 3),
                category=q.get('categorySlug', 'general'),
                tags=q.get('tags', []),
                quality_score=q.get('quality_score', 0),
                clarity_score=q.get('test_results', {}).get('quality', {}).get('clarity', 0),
                difficulty_score=q.get('test_results', {}).get('difficulty', {}).get('level', 3),
                source=q.get('metadata', {}).get('source', 'generated'),
                is_active=False  # Staged, not deployed
            )
            
            self.session.add(question_model)
            staged_ids.append(q_id)
        
        self.session.commit()
        
        # Cache in Redis for quick access
        for q_id in staged_ids:
            self.redis.sadd('staged_questions', q_id)
            self.redis.expire('staged_questions', 86400)  # 24 hour expiry
        
        return staged_ids
    
    @celery_app.task
    def auto_deploy(self):
        """Automatically deploy high-quality staged questions"""
        # Get staged questions
        staged_ids = self.redis.smembers('staged_questions')
        
        if not staged_ids:
            logger.info("No staged questions to deploy")
            return
        
        deployed_count = 0
        deployment_report = []
        
        for q_id in staged_ids:
            q_id = q_id.decode() if isinstance(q_id, bytes) else q_id
            
            question = self.session.query(QuestionModel).filter_by(id=q_id).first()
            if not question:
                continue
            
            # Auto-deploy if quality is exceptional
            if question.quality_score >= 0.85:
                question.is_active = True
                question.deployed_at = datetime.utcnow()
                deployed_count += 1
                
                deployment_report.append({
                    'id': q_id,
                    'question': question.question[:50],
                    'quality': question.quality_score,
                    'difficulty': question.difficulty
                })
                
                # Remove from staging
                self.redis.srem('staged_questions', q_id)
        
        self.session.commit()
        
        if deployed_count > 0:
            # Update main quiz data file
            self.update_quiz_data_file()
            
            # Send deployment notification
            self.notify_slack(
                f"🚀 Auto-deployed {deployed_count} questions\n"
                f"Quality range: {min(d['quality'] for d in deployment_report):.2f} - "
                f"{max(d['quality'] for d in deployment_report):.2f}"
            )
            
            # Backup to S3
            self.backup_to_s3()
        
        return deployed_count
    
    @celery_app.task
    def feedback_learning(self):
        """Learn from user feedback to improve generation"""
        # Get recent feedback
        recent_feedback = self.session.query(FeedbackModel)\
            .filter(FeedbackModel.timestamp >= datetime.utcnow() - timedelta(days=7))\
            .all()
        
        if not recent_feedback:
            return
        
        # Analyze patterns
        insights = {
            'low_rated_patterns': [],
            'high_rated_patterns': [],
            'common_issues': {},
            'difficulty_calibration': {}
        }
        
        for feedback in recent_feedback:
            question = self.session.query(QuestionModel).filter_by(id=feedback.question_id).first()
            if not question:
                continue
            
            # Update question metrics
            question.times_shown += 1
            if feedback.correct:
                question.times_correct += 1
            
            # Update average response time
            if question.avg_response_time:
                question.avg_response_time = (
                    question.avg_response_time * 0.9 + feedback.response_time * 0.1
                )
            else:
                question.avg_response_time = feedback.response_time
            
            # Update user rating
            if feedback.rating:
                if question.user_rating:
                    question.user_rating = (
                        question.user_rating * 0.9 + feedback.rating * 0.1
                    )
                else:
                    question.user_rating = feedback.rating
            
            # Collect patterns
            if feedback.rating and feedback.rating <= 2:
                insights['low_rated_patterns'].append({
                    'category': question.category,
                    'difficulty': question.difficulty,
                    'type': question.tags[0] if question.tags else 'unknown'
                })
            elif feedback.rating and feedback.rating >= 4:
                insights['high_rated_patterns'].append({
                    'category': question.category,
                    'difficulty': question.difficulty,
                    'type': question.tags[0] if question.tags else 'unknown'
                })
            
            # Track reported issues
            if feedback.reported_issue:
                insights['common_issues'][feedback.reported_issue] = \
                    insights['common_issues'].get(feedback.reported_issue, 0) + 1
        
        self.session.commit()
        
        # Adjust generation parameters based on insights
        self.adjust_generation_parameters(insights)
        
        # Deactivate consistently poor questions
        poor_questions = self.session.query(QuestionModel)\
            .filter(QuestionModel.user_rating < 2.5)\
            .filter(QuestionModel.times_shown >= 20)\
            .all()
        
        for q in poor_questions:
            q.is_active = False
            logger.info(f"Deactivated poor-performing question {q.id}")
        
        self.session.commit()
        
        return insights
    
    def adjust_generation_parameters(self, insights: Dict):
        """Adjust generation based on feedback insights"""
        # Store insights in Redis for next generation
        self.redis.set('generation_insights', json.dumps(insights))
        
        # Identify successful patterns
        if insights['high_rated_patterns']:
            high_rated_categories = [p['category'] for p in insights['high_rated_patterns']]
            most_successful = max(set(high_rated_categories), key=high_rated_categories.count)
            
            # Increase generation for successful categories
            self.redis.set('priority_category', most_successful)
        
        # Adjust difficulty targeting
        if insights['low_rated_patterns']:
            problematic_difficulties = [p['difficulty'] for p in insights['low_rated_patterns']]
            if problematic_difficulties:
                avg_problematic = sum(problematic_difficulties) / len(problematic_difficulties)
                
                # Avoid generating at problematic difficulty levels
                self.redis.set('avoid_difficulty', int(avg_problematic))
    
    @celery_app.task
    def system_health_check(self):
        """Monitor system health and performance"""
        health = {
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'healthy',
            'redis': 'healthy',
            's3': 'healthy',
            'generation_pipeline': 'healthy',
            'metrics': {}
        }
        
        try:
            # Check database
            question_count = self.session.query(QuestionModel).count()
            active_count = self.session.query(QuestionModel).filter_by(is_active=True).count()
            
            health['metrics']['total_questions'] = question_count
            health['metrics']['active_questions'] = active_count
            
            # Check Redis
            staged = self.redis.scard('staged_questions')
            health['metrics']['staged_questions'] = staged
            
            # Check recent generation jobs
            recent_job = self.session.query(GenerationJob)\
                .order_by(GenerationJob.started_at.desc())\
                .first()
            
            if recent_job:
                health['metrics']['last_generation'] = recent_job.started_at.isoformat()
                health['metrics']['last_generation_status'] = recent_job.status
            
            # Check quality metrics
            avg_quality = self.session.query(QuestionModel.quality_score)\
                .filter(QuestionModel.is_active == True)\
                .all()
            
            if avg_quality:
                health['metrics']['average_quality'] = sum(q[0] for q in avg_quality) / len(avg_quality)
            
            # Alert if issues
            if active_count < 100:
                health['alerts'] = ['Low active question count']
                self.notify_slack("⚠️ Alert: Low active question count")
            
            # Store health check
            self.redis.set('health_check', json.dumps(health))
            self.redis.expire('health_check', 600)  # 10 minute expiry
            
        except Exception as e:
            health['error'] = str(e)
            logger.error(f"Health check failed: {e}")
            self.notify_slack(f"❌ Health check failed: {e}")
        
        return health
    
    def update_quiz_data_file(self):
        """Update the main quiz data JSON file"""
        # Get all active questions
        active_questions = self.session.query(QuestionModel)\
            .filter_by(is_active=True)\
            .all()
        
        # Group by category
        categories = {}
        questions_list = []
        
        for q in active_questions:
            # Add to categories
            if q.category not in categories:
                categories[q.category] = {
                    'name': q.category.replace('-', ' ').title(),
                    'slug': q.category,
                    'description': f'Questions about {q.category}',
                    'questionCount': 0
                }
            categories[q.category]['questionCount'] += 1
            
            # Add to questions
            questions_list.append({
                'id': q.id,
                'categorySlug': q.category,
                'question': q.question,
                'options': q.options,
                'correctAnswer': q.correct_answer,
                'explanation': q.explanation,
                'difficulty': q.difficulty,
                'tags': q.tags or []
            })
        
        # Create final data structure
        quiz_data = {
            'categories': list(categories.values()),
            'questions': questions_list,
            'metadata': {
                'last_updated': datetime.utcnow().isoformat(),
                'total_questions': len(questions_list),
                'total_categories': len(categories),
                'version': '2.0-auto'
            }
        }
        
        # Save locally
        with open('/app/data/quiz-data.json', 'w') as f:
            json.dump(quiz_data, f, indent=2)
        
        # Backup to S3
        self.s3.put_object(
            Bucket=config['s3_bucket'],
            Key=f'quiz-data/quiz-data-{datetime.utcnow().strftime("%Y%m%d")}.json',
            Body=json.dumps(quiz_data),
            ContentType='application/json'
        )
        
        logger.info(f"Updated quiz data with {len(questions_list)} questions")
    
    def backup_to_s3(self):
        """Backup database to S3"""
        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
        
        # Export database to JSON
        all_questions = self.session.query(QuestionModel).all()
        backup_data = []
        
        for q in all_questions:
            backup_data.append({
                'id': q.id,
                'question': q.question,
                'options': q.options,
                'correct_answer': q.correct_answer,
                'explanation': q.explanation,
                'difficulty': q.difficulty,
                'category': q.category,
                'tags': q.tags,
                'quality_score': q.quality_score,
                'is_active': q.is_active,
                'metrics': {
                    'times_shown': q.times_shown,
                    'times_correct': q.times_correct,
                    'user_rating': q.user_rating
                }
            })
        
        # Upload to S3
        self.s3.put_object(
            Bucket=config['s3_bucket'],
            Key=f'backups/questions-backup-{timestamp}.json',
            Body=json.dumps(backup_data),
            ContentType='application/json'
        )
        
        logger.info(f"Backed up {len(backup_data)} questions to S3")
    
    def notify_slack(self, message: str):
        """Send notification to Slack"""
        if config['slack_webhook']:
            try:
                requests.post(config['slack_webhook'], json={'text': message})
            except Exception as e:
                logger.error(f"Failed to send Slack notification: {e}")
    
    def get_trending_tags(self) -> List[str]:
        """Get trending technology tags"""
        # This would connect to various APIs to get trending topics
        # For now, return common ones
        return ['kubernetes', 'docker', 'react', 'python', 'aws', 'typescript', 'rust', 'golang']

def main():
    """Initialize and run the autonomous system"""
    system = AutonomousQuizSystem()
    
    # Run initial health check
    health = system.system_health_check()
    print(f"System Health: {json.dumps(health, indent=2)}")
    
    # Start Celery workers (in production, these run separately)
    # celery -A autonomous_system worker --loglevel=info
    # celery -A autonomous_system beat --loglevel=info
    
    print("Autonomous Quiz System initialized")
    print("Celery workers should be started separately:")
    print("  Worker: celery -A autonomous_system worker --loglevel=info")
    print("  Beat: celery -A autonomous_system beat --loglevel=info")

if __name__ == "__main__":
    main()
