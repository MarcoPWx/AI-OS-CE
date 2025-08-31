#!/usr/bin/env python3
"""
Quiz Testing Framework
- Automated difficulty assessment
- Question quality validation
- AI-powered reasoning about questions
- Integration with question generation
"""

import json
import re
import statistics
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import hashlib
from datetime import datetime

class DifficultyLevel(Enum):
    BEGINNER = 1
    EASY = 2
    MEDIUM = 3
    HARD = 4
    EXPERT = 5

@dataclass
class DifficultyMetrics:
    """Metrics used to assess question difficulty"""
    technical_term_count: int
    concept_complexity: float
    prerequisite_knowledge: List[str]
    cognitive_load: float
    average_word_length: float
    sentence_complexity: float
    ambiguity_score: float
    specificity_score: float
    
@dataclass
class QuestionQuality:
    """Quality assessment of a question"""
    clarity_score: float  # 0-1
    relevance_score: float  # 0-1
    distractor_quality: float  # 0-1
    balance_score: float  # 0-1
    educational_value: float  # 0-1
    overall_quality: float  # 0-1
    issues: List[str]
    suggestions: List[str]

class QuestionTester:
    def __init__(self):
        self.technical_terms = self.load_technical_terms()
        self.concept_hierarchy = self.load_concept_hierarchy()
        self.test_results = []
        
    def load_technical_terms(self) -> Dict[str, int]:
        """Load technical terms with complexity scores"""
        return {
            # Basic terms (score 1)
            'variable': 1, 'function': 1, 'loop': 1, 'array': 1, 'string': 1,
            'server': 1, 'client': 1, 'database': 1, 'file': 1, 'folder': 1,
            
            # Intermediate terms (score 2)
            'api': 2, 'rest': 2, 'json': 2, 'xml': 2, 'sql': 2,
            'docker': 2, 'container': 2, 'git': 2, 'branch': 2, 'merge': 2,
            'authentication': 2, 'authorization': 2, 'encryption': 2,
            
            # Advanced terms (score 3)
            'kubernetes': 3, 'microservices': 3, 'orchestration': 3,
            'load balancer': 3, 'reverse proxy': 3, 'cdn': 3,
            'oauth': 3, 'jwt': 3, 'saml': 3, 'ssl/tls': 3,
            'ci/cd': 3, 'pipeline': 3, 'terraform': 3,
            
            # Expert terms (score 4)
            'service mesh': 4, 'istio': 4, 'linkerd': 4, 'envoy': 4,
            'cqrs': 4, 'event sourcing': 4, 'saga pattern': 4,
            'circuit breaker': 4, 'bulkhead': 4, 'distributed tracing': 4,
            'chaos engineering': 4, 'gitops': 4, 'operator pattern': 4,
            
            # Specialist terms (score 5)
            'raft consensus': 5, 'paxos': 5, 'byzantine fault tolerance': 5,
            'vector clocks': 5, 'crdt': 5, 'cap theorem': 5,
            'merkle tree': 5, 'bloom filter': 5, 'hyperloglog': 5,
        }
    
    def load_concept_hierarchy(self) -> Dict[str, List[str]]:
        """Load concept prerequisites"""
        return {
            'kubernetes': ['docker', 'containers', 'orchestration'],
            'microservices': ['api', 'rest', 'distributed systems'],
            'ci/cd': ['git', 'automation', 'testing'],
            'oauth': ['authentication', 'tokens', 'http'],
            'service mesh': ['kubernetes', 'microservices', 'networking'],
            'distributed systems': ['networking', 'concurrency', 'databases'],
            'machine learning': ['statistics', 'python', 'mathematics'],
            'blockchain': ['cryptography', 'distributed systems', 'consensus'],
        }
    
    def assess_difficulty(self, question: Dict) -> Tuple[DifficultyLevel, DifficultyMetrics]:
        """Assess the difficulty of a question"""
        q_text = question['question']
        options = question['options']
        explanation = question.get('explanation', '')
        
        # Calculate metrics
        metrics = self.calculate_difficulty_metrics(q_text, options, explanation)
        
        # Determine difficulty level
        difficulty_score = self.calculate_difficulty_score(metrics)
        difficulty_level = self.score_to_level(difficulty_score)
        
        return difficulty_level, metrics
    
    def calculate_difficulty_metrics(self, q_text: str, options: List[str], explanation: str) -> DifficultyMetrics:
        """Calculate detailed difficulty metrics"""
        combined_text = q_text + ' ' + ' '.join(options) + ' ' + explanation
        combined_lower = combined_text.lower()
        
        # Count technical terms
        tech_count = 0
        tech_complexity = 0
        for term, score in self.technical_terms.items():
            if term in combined_lower:
                tech_count += 1
                tech_complexity += score
        
        # Identify prerequisites
        prerequisites = []
        for concept, prereqs in self.concept_hierarchy.items():
            if concept in combined_lower:
                prerequisites.extend(prereqs)
        prerequisites = list(set(prerequisites))
        
        # Calculate text complexity
        words = combined_text.split()
        avg_word_length = statistics.mean([len(w) for w in words]) if words else 0
        
        # Sentence complexity (words per sentence)
        sentences = re.split(r'[.!?]', combined_text)
        sentence_complexity = statistics.mean([len(s.split()) for s in sentences if s.strip()])
        
        # Cognitive load (based on options similarity)
        cognitive_load = self.calculate_cognitive_load(options)
        
        # Ambiguity score (presence of vague terms)
        vague_terms = ['sometimes', 'usually', 'often', 'might', 'could', 'possibly']
        ambiguity_score = sum(1 for term in vague_terms if term in combined_lower) / len(vague_terms)
        
        # Specificity score (presence of specific values, numbers, names)
        specificity_score = len(re.findall(r'\b\d+\b|\b[A-Z]{2,}\b', combined_text)) / len(words) if words else 0
        
        return DifficultyMetrics(
            technical_term_count=tech_count,
            concept_complexity=tech_complexity / max(tech_count, 1),
            prerequisite_knowledge=prerequisites,
            cognitive_load=cognitive_load,
            average_word_length=avg_word_length,
            sentence_complexity=sentence_complexity,
            ambiguity_score=ambiguity_score,
            specificity_score=specificity_score
        )
    
    def calculate_cognitive_load(self, options: List[str]) -> float:
        """Calculate cognitive load based on option similarity"""
        if len(options) < 2:
            return 0.0
        
        # Calculate similarity between options
        similarities = []
        for i in range(len(options)):
            for j in range(i + 1, len(options)):
                sim = self.text_similarity(options[i], options[j])
                similarities.append(sim)
        
        # Higher similarity = higher cognitive load (harder to distinguish)
        return statistics.mean(similarities) if similarities else 0.0
    
    def text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1 & words2
        union = words1 | words2
        
        return len(intersection) / len(union)
    
    def calculate_difficulty_score(self, metrics: DifficultyMetrics) -> float:
        """Calculate overall difficulty score from metrics"""
        score = 0.0
        
        # Technical complexity (30% weight)
        score += metrics.concept_complexity * 0.3
        
        # Prerequisites (20% weight)
        score += min(len(metrics.prerequisite_knowledge) / 3, 1.0) * 0.2
        
        # Cognitive load (20% weight)
        score += metrics.cognitive_load * 0.2
        
        # Text complexity (15% weight)
        score += min(metrics.sentence_complexity / 20, 1.0) * 0.15
        
        # Specificity (15% weight)
        score += metrics.specificity_score * 0.15
        
        return min(score * 5, 5.0)  # Scale to 1-5
    
    def score_to_level(self, score: float) -> DifficultyLevel:
        """Convert numerical score to difficulty level"""
        if score < 1.5:
            return DifficultyLevel.BEGINNER
        elif score < 2.5:
            return DifficultyLevel.EASY
        elif score < 3.5:
            return DifficultyLevel.MEDIUM
        elif score < 4.5:
            return DifficultyLevel.HARD
        else:
            return DifficultyLevel.EXPERT
    
    def assess_quality(self, question: Dict) -> QuestionQuality:
        """Assess the quality of a question"""
        issues = []
        suggestions = []
        
        q_text = question['question']
        options = question['options']
        correct_idx = question.get('correctAnswer', 0)
        explanation = question.get('explanation', '')
        
        # Clarity assessment
        clarity_score = self.assess_clarity(q_text, issues, suggestions)
        
        # Relevance assessment
        relevance_score = self.assess_relevance(question, issues, suggestions)
        
        # Distractor quality
        distractor_quality = self.assess_distractors(options, correct_idx, issues, suggestions)
        
        # Balance assessment
        balance_score = self.assess_balance(options, issues, suggestions)
        
        # Educational value
        educational_value = self.assess_educational_value(question, issues, suggestions)
        
        # Overall quality
        overall_quality = statistics.mean([
            clarity_score,
            relevance_score,
            distractor_quality,
            balance_score,
            educational_value
        ])
        
        return QuestionQuality(
            clarity_score=clarity_score,
            relevance_score=relevance_score,
            distractor_quality=distractor_quality,
            balance_score=balance_score,
            educational_value=educational_value,
            overall_quality=overall_quality,
            issues=issues,
            suggestions=suggestions
        )
    
    def assess_clarity(self, q_text: str, issues: List[str], suggestions: List[str]) -> float:
        """Assess question clarity"""
        score = 1.0
        
        # Check for ambiguous language
        ambiguous = ['it', 'this', 'that', 'they', 'them']
        for word in ambiguous:
            if word in q_text.lower().split():
                score -= 0.1
                issues.append(f"Ambiguous pronoun '{word}' in question")
                suggestions.append("Replace pronouns with specific references")
        
        # Check question structure
        if not q_text.strip().endswith('?'):
            score -= 0.2
            issues.append("Question doesn't end with question mark")
            suggestions.append("Ensure question ends with '?'")
        
        # Check for double negatives
        if 'not' in q_text.lower() and any(neg in q_text.lower() for neg in ['no', 'never', 'neither']):
            score -= 0.2
            issues.append("Double negative in question")
            suggestions.append("Rephrase to avoid double negatives")
        
        return max(score, 0.0)
    
    def assess_relevance(self, question: Dict, issues: List[str], suggestions: List[str]) -> float:
        """Assess question relevance to category"""
        score = 1.0
        
        category = question.get('categorySlug', '')
        q_text = question['question'].lower()
        
        # Check if question matches category
        if category and category not in q_text:
            # Check for related terms
            category_terms = category.split('-')
            if not any(term in q_text for term in category_terms):
                score -= 0.3
                issues.append(f"Question may not be relevant to category '{category}'")
                suggestions.append(f"Ensure question clearly relates to {category}")
        
        return max(score, 0.0)
    
    def assess_distractors(self, options: List[str], correct_idx: int, issues: List[str], suggestions: List[str]) -> float:
        """Assess quality of distractor options"""
        score = 1.0
        
        if len(options) < 3:
            score -= 0.5
            issues.append("Too few options")
            suggestions.append("Add more distractor options (minimum 3, ideally 4)")
            return score
        
        correct = options[correct_idx]
        distractors = [opt for i, opt in enumerate(options) if i != correct_idx]
        
        # Check for obviously wrong distractors
        joke_words = ['joke', 'funny', 'silly', 'impossible', 'never']
        for d in distractors:
            if any(word in d.lower() for word in joke_words):
                score -= 0.2
                issues.append(f"Distractor appears to be a joke: '{d[:30]}...'")
                suggestions.append("Replace joke answers with plausible distractors")
        
        # Check for duplicate/similar distractors
        for i, d1 in enumerate(distractors):
            for d2 in distractors[i+1:]:
                if self.text_similarity(d1, d2) > 0.8:
                    score -= 0.2
                    issues.append("Very similar distractors found")
                    suggestions.append("Make distractors more distinct")
                    break
        
        return max(score, 0.0)
    
    def assess_balance(self, options: List[str], issues: List[str], suggestions: List[str]) -> float:
        """Assess balance of options (length, format, etc)"""
        score = 1.0
        
        # Check length balance
        lengths = [len(opt) for opt in options]
        if max(lengths) > min(lengths) * 2:
            score -= 0.2
            issues.append("Options have unbalanced lengths")
            suggestions.append("Balance option lengths to avoid giving away the answer")
        
        # Check format consistency
        formats = []
        for opt in options:
            if opt[0].isupper():
                formats.append('capital')
            else:
                formats.append('lower')
        
        if len(set(formats)) > 1:
            score -= 0.1
            issues.append("Inconsistent capitalization in options")
            suggestions.append("Use consistent capitalization across all options")
        
        return max(score, 0.0)
    
    def assess_educational_value(self, question: Dict, issues: List[str], suggestions: List[str]) -> float:
        """Assess educational value of question"""
        score = 1.0
        
        explanation = question.get('explanation', '')
        
        if not explanation:
            score -= 0.3
            issues.append("No explanation provided")
            suggestions.append("Add explanation to enhance learning")
        elif len(explanation) < 50:
            score -= 0.1
            issues.append("Explanation is too brief")
            suggestions.append("Provide more detailed explanation")
        
        # Check if question tests understanding vs memorization
        q_text = question['question'].lower()
        understanding_words = ['why', 'how', 'explain', 'difference', 'compare', 'when']
        
        if not any(word in q_text for word in understanding_words):
            if 'what is' in q_text or 'which' in q_text:
                score -= 0.1
                suggestions.append("Consider rephrasing to test understanding rather than recall")
        
        return max(score, 0.0)
    
    def test_question(self, question: Dict) -> Dict:
        """Comprehensive test of a single question"""
        # Assess difficulty
        difficulty_level, difficulty_metrics = self.assess_difficulty(question)
        
        # Assess quality
        quality = self.assess_quality(question)
        
        # Generate test result
        result = {
            'question_id': question.get('id', 'unknown'),
            'timestamp': datetime.now().isoformat(),
            'difficulty': {
                'level': difficulty_level.value,
                'level_name': difficulty_level.name,
                'metrics': {
                    'technical_terms': difficulty_metrics.technical_term_count,
                    'complexity': difficulty_metrics.concept_complexity,
                    'prerequisites': difficulty_metrics.prerequisite_knowledge,
                    'cognitive_load': difficulty_metrics.cognitive_load,
                    'text_complexity': difficulty_metrics.sentence_complexity
                }
            },
            'quality': {
                'overall': quality.overall_quality,
                'clarity': quality.clarity_score,
                'relevance': quality.relevance_score,
                'distractors': quality.distractor_quality,
                'balance': quality.balance_score,
                'educational': quality.educational_value
            },
            'issues': quality.issues,
            'suggestions': quality.suggestions,
            'passed': quality.overall_quality >= 0.7 and len(quality.issues) <= 2
        }
        
        self.test_results.append(result)
        return result
    
    def test_batch(self, questions: List[Dict]) -> Dict:
        """Test a batch of questions"""
        results = []
        for q in questions:
            result = self.test_question(q)
            results.append(result)
        
        # Generate summary statistics
        summary = self.generate_summary(results)
        
        return {
            'summary': summary,
            'results': results
        }
    
    def generate_summary(self, results: List[Dict]) -> Dict:
        """Generate summary statistics from test results"""
        total = len(results)
        passed = sum(1 for r in results if r['passed'])
        
        # Difficulty distribution
        difficulty_dist = {}
        for r in results:
            level = r['difficulty']['level_name']
            difficulty_dist[level] = difficulty_dist.get(level, 0) + 1
        
        # Quality scores
        quality_scores = {
            'overall': statistics.mean([r['quality']['overall'] for r in results]),
            'clarity': statistics.mean([r['quality']['clarity'] for r in results]),
            'relevance': statistics.mean([r['quality']['relevance'] for r in results]),
            'distractors': statistics.mean([r['quality']['distractors'] for r in results]),
            'balance': statistics.mean([r['quality']['balance'] for r in results]),
            'educational': statistics.mean([r['quality']['educational'] for r in results])
        }
        
        # Common issues
        all_issues = []
        for r in results:
            all_issues.extend(r['issues'])
        
        issue_counts = {}
        for issue in all_issues:
            # Group similar issues
            key = issue.split(':')[0] if ':' in issue else issue
            issue_counts[key] = issue_counts.get(key, 0) + 1
        
        common_issues = sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_tested': total,
            'passed': passed,
            'pass_rate': passed / total if total > 0 else 0,
            'difficulty_distribution': difficulty_dist,
            'average_quality_scores': quality_scores,
            'common_issues': common_issues
        }
    
    def export_results(self, filepath: str):
        """Export test results to file"""
        with open(filepath, 'w') as f:
            json.dump(self.test_results, f, indent=2)
    
    def recommend_improvements(self, question: Dict, test_result: Dict) -> List[str]:
        """Generate specific improvement recommendations"""
        recommendations = []
        
        # Difficulty-based recommendations
        difficulty_level = test_result['difficulty']['level']
        if difficulty_level == 1:
            recommendations.append("Consider adding more technical depth")
            recommendations.append("Include more advanced concepts")
        elif difficulty_level == 5:
            recommendations.append("Consider breaking into multiple simpler questions")
            recommendations.append("Add more context or hints")
        
        # Quality-based recommendations
        quality = test_result['quality']
        if quality['clarity'] < 0.7:
            recommendations.append("Rewrite question for better clarity")
        if quality['distractors'] < 0.7:
            recommendations.append("Improve distractor quality - make them more plausible")
        if quality['balance'] < 0.7:
            recommendations.append("Balance option lengths and formats")
        if quality['educational'] < 0.7:
            recommendations.append("Add or improve explanation for better learning")
        
        return recommendations

def main():
    """Example usage"""
    # Load quiz data
    with open('/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json', 'r') as f:
        data = json.load(f)
    
    # Initialize tester
    tester = QuestionTester()
    
    # Test first 10 questions
    sample_questions = data['questions'][:10]
    results = tester.test_batch(sample_questions)
    
    # Print summary
    print("QUIZ TESTING FRAMEWORK - TEST RESULTS")
    print("=" * 50)
    print(f"Total Tested: {results['summary']['total_tested']}")
    print(f"Passed: {results['summary']['passed']}")
    print(f"Pass Rate: {results['summary']['pass_rate']:.1%}")
    print("\nDifficulty Distribution:")
    for level, count in results['summary']['difficulty_distribution'].items():
        print(f"  {level}: {count}")
    print("\nAverage Quality Scores:")
    for metric, score in results['summary']['average_quality_scores'].items():
        print(f"  {metric}: {score:.2f}")
    print("\nMost Common Issues:")
    for issue, count in results['summary']['common_issues']:
        print(f"  {issue}: {count} occurrences")
    
    # Export results
    tester.export_results('/Users/betolbook/Documents/github/NatureQuest/QuizMentor/test_results.json')
    print("\nDetailed results exported to test_results.json")

if __name__ == "__main__":
    main()
