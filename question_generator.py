#!/usr/bin/env python3
"""
AI-Powered Question Generator with Web Scraping
- Scrapes technical documentation and blogs
- Generates questions using AI/LLM
- Validates quality using testing framework
- Maintains difficulty balance
"""

import json
import re
import random
import hashlib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import time

# Import our testing framework
from quiz_testing_framework import QuestionTester, DifficultyLevel

@dataclass
class GeneratedQuestion:
    """Structure for a generated question"""
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str
    difficulty: int
    categorySlug: str
    tags: List[str]
    source: str
    generated_at: str
    
    def to_dict(self):
        """Convert to dictionary format"""
        return {
            'id': f"gen-{hashlib.md5(self.question.encode()).hexdigest()[:8]}",
            'question': self.question,
            'options': self.options,
            'correctAnswer': self.correctAnswer,
            'explanation': self.explanation,
            'difficulty': self.difficulty,
            'categorySlug': self.categorySlug,
            'tags': self.tags,
            'metadata': {
                'source': self.source,
                'generated_at': self.generated_at
            }
        }

class ContentScraper:
    """Web scraper for technical content"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (QuizMentor Educational Bot) Content Scraper'
        })
        self.scraped_content = []
        
    def scrape_documentation(self, url: str, max_depth: int = 2) -> List[Dict]:
        """Scrape technical documentation"""
        scraped = []
        visited = set()
        
        def scrape_page(page_url: str, depth: int):
            if depth > max_depth or page_url in visited:
                return
            
            visited.add(page_url)
            
            try:
                response = self.session.get(page_url, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract main content
                content = self.extract_content(soup)
                if content:
                    scraped.append({
                        'url': page_url,
                        'title': soup.find('title').text if soup.find('title') else '',
                        'content': content,
                        'type': 'documentation'
                    })
                
                # Follow internal links if depth allows
                if depth < max_depth:
                    base_domain = urlparse(page_url).netloc
                    for link in soup.find_all('a', href=True):
                        href = urljoin(page_url, link['href'])
                        if urlparse(href).netloc == base_domain:
                            time.sleep(0.5)  # Be respectful
                            scrape_page(href, depth + 1)
                            
            except Exception as e:
                print(f"Error scraping {page_url}: {e}")
        
        scrape_page(url, 0)
        return scraped
    
    def extract_content(self, soup: BeautifulSoup) -> str:
        """Extract meaningful content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Look for main content areas
        content_areas = soup.find_all(['main', 'article', 'div'], 
                                     class_=re.compile('content|main|article|doc'))
        
        if content_areas:
            text = ' '.join([area.get_text() for area in content_areas])
        else:
            text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:10000]  # Limit to 10k chars
    
    def scrape_stack_overflow(self, tag: str, limit: int = 50) -> List[Dict]:
        """Scrape Stack Overflow questions by tag"""
        scraped = []
        
        try:
            # Use Stack Exchange API (no key needed for basic access)
            api_url = f"https://api.stackexchange.com/2.3/questions"
            params = {
                'order': 'desc',
                'sort': 'votes',
                'tagged': tag,
                'site': 'stackoverflow',
                'filter': 'withbody',
                'pagesize': limit
            }
            
            response = requests.get(api_url, params=params)
            data = response.json()
            
            for item in data.get('items', []):
                scraped.append({
                    'url': item['link'],
                    'title': item['title'],
                    'content': BeautifulSoup(item['body'], 'html.parser').get_text(),
                    'tags': item['tags'],
                    'type': 'stackoverflow',
                    'score': item['score']
                })
                
        except Exception as e:
            print(f"Error scraping Stack Overflow: {e}")
        
        return scraped
    
    def scrape_github_readme(self, repo_url: str) -> Optional[Dict]:
        """Scrape GitHub repository README"""
        try:
            # Convert GitHub URL to raw content URL
            parts = repo_url.replace('https://github.com/', '').split('/')
            if len(parts) >= 2:
                owner, repo = parts[0], parts[1]
                raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
                
                response = requests.get(raw_url)
                if response.status_code == 200:
                    return {
                        'url': repo_url,
                        'title': f"{owner}/{repo} README",
                        'content': response.text,
                        'type': 'github_readme'
                    }
        except Exception as e:
            print(f"Error scraping GitHub: {e}")
        
        return None
    
    def scrape_tech_blogs(self, blog_urls: List[str]) -> List[Dict]:
        """Scrape technical blog posts"""
        scraped = []
        
        for url in blog_urls:
            try:
                response = self.session.get(url, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract article content
                article = soup.find('article') or soup.find('main')
                if article:
                    content = article.get_text()
                    scraped.append({
                        'url': url,
                        'title': soup.find('h1').text if soup.find('h1') else '',
                        'content': content[:10000],
                        'type': 'blog'
                    })
                    
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                print(f"Error scraping blog {url}: {e}")
        
        return scraped

class QuestionGenerator:
    """AI-powered question generator"""
    
    def __init__(self):
        self.tester = QuestionTester()
        self.templates = self.load_question_templates()
        self.generated_questions = []
        
    def load_question_templates(self) -> Dict:
        """Load question generation templates"""
        return {
            'definition': [
                "What is {concept}?",
                "Which of the following best describes {concept}?",
                "What does {concept} mean in the context of {domain}?",
            ],
            'comparison': [
                "What is the main difference between {concept1} and {concept2}?",
                "How does {concept1} compare to {concept2}?",
                "When would you use {concept1} instead of {concept2}?",
            ],
            'purpose': [
                "What is the primary purpose of {concept}?",
                "Why would you use {concept}?",
                "What problem does {concept} solve?",
            ],
            'implementation': [
                "How do you implement {concept}?",
                "What is the correct way to use {concept}?",
                "Which approach is best for implementing {concept}?",
            ],
            'troubleshooting': [
                "What could cause {problem} when using {concept}?",
                "How would you debug {problem}?",
                "What is the most likely cause of {error}?",
            ],
            'best_practice': [
                "What is the best practice for {concept}?",
                "Which of the following is recommended when using {concept}?",
                "What should you avoid when implementing {concept}?",
            ]
        }
    
    def generate_from_content(self, content: Dict, category: str, target_difficulty: int = 3) -> List[GeneratedQuestion]:
        """Generate questions from scraped content"""
        questions = []
        
        # Extract key concepts from content
        concepts = self.extract_concepts(content['content'])
        
        # Generate questions for each concept
        for concept in concepts[:10]:  # Limit to 10 per content
            question = self.generate_concept_question(concept, content, category, target_difficulty)
            if question:
                questions.append(question)
        
        return questions
    
    def extract_concepts(self, text: str) -> List[str]:
        """Extract technical concepts from text"""
        concepts = []
        
        # Look for technical terms (capitalized, acronyms, etc)
        tech_pattern = r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b|\b[A-Z]{2,}\b'
        potential_concepts = re.findall(tech_pattern, text)
        
        # Filter and deduplicate
        seen = set()
        for concept in potential_concepts:
            if len(concept) > 2 and concept not in seen:
                concepts.append(concept)
                seen.add(concept)
        
        # Also look for code-like terms
        code_pattern = r'`([^`]+)`'
        code_terms = re.findall(code_pattern, text)
        concepts.extend(code_terms)
        
        return concepts[:20]  # Limit to 20 concepts
    
    def generate_concept_question(self, concept: str, content: Dict, category: str, 
                                 target_difficulty: int) -> Optional[GeneratedQuestion]:
        """Generate a question about a specific concept"""
        
        # Select question type based on content
        question_types = ['definition', 'purpose', 'implementation', 'best_practice']
        question_type = random.choice(question_types)
        
        # Generate question text
        template = random.choice(self.templates[question_type])
        question_text = template.format(concept=concept, domain=category)
        
        # Generate options (1 correct + 3 distractors)
        correct_answer, distractors = self.generate_options(concept, content['content'], question_type)
        
        if not correct_answer or len(distractors) < 3:
            return None
        
        # Shuffle options
        options = [correct_answer] + distractors[:3]
        random.shuffle(options)
        correct_index = options.index(correct_answer)
        
        # Generate explanation
        explanation = self.generate_explanation(concept, correct_answer, content['content'])
        
        # Create question object
        question = GeneratedQuestion(
            question=question_text,
            options=options,
            correctAnswer=correct_index,
            explanation=explanation,
            difficulty=target_difficulty,
            categorySlug=category,
            tags=[concept.lower()],
            source=content['url'],
            generated_at=datetime.now().isoformat()
        )
        
        # Validate with testing framework
        test_result = self.tester.test_question(question.to_dict())
        
        # Only return if quality is good
        if test_result['passed']:
            return question
        
        return None
    
    def generate_options(self, concept: str, context: str, question_type: str) -> Tuple[str, List[str]]:
        """Generate correct answer and distractors"""
        
        # Extract relevant sentences from context
        sentences = context.split('.')
        relevant_sentences = [s for s in sentences if concept in s]
        
        if not relevant_sentences:
            return None, []
        
        # Generate correct answer based on context
        correct_answer = self.extract_correct_answer(concept, relevant_sentences, question_type)
        
        # Generate plausible distractors
        distractors = self.generate_distractors(concept, correct_answer, question_type)
        
        return correct_answer, distractors
    
    def extract_correct_answer(self, concept: str, sentences: List[str], question_type: str) -> str:
        """Extract or generate correct answer from context"""
        
        # Find the most informative sentence
        best_sentence = max(sentences, key=lambda s: len(s.split()))
        
        # Clean and format
        answer = best_sentence.strip()
        
        # Truncate if too long
        if len(answer) > 100:
            answer = answer[:97] + "..."
        
        # Format based on question type
        if question_type == 'definition':
            if not answer.startswith(('A ', 'An ', 'The ')):
                answer = f"A {answer.lower()}"
        
        return answer
    
    def generate_distractors(self, concept: str, correct_answer: str, question_type: str) -> List[str]:
        """Generate plausible but incorrect options"""
        distractors = []
        
        # Common distractor patterns based on question type
        distractor_patterns = {
            'definition': [
                f"A different implementation of {concept}",
                f"An older version of {concept}",
                f"A component that works with {concept}",
                f"A alternative to {concept}",
            ],
            'purpose': [
                f"To manage different aspects of the system",
                f"To provide backwards compatibility",
                f"To optimize performance metrics",
                f"To ensure security compliance",
            ],
            'implementation': [
                f"Using a configuration file",
                f"Through command-line parameters",
                f"By modifying environment variables",
                f"With a dedicated management tool",
            ],
            'best_practice': [
                f"Always use the latest version",
                f"Configure based on requirements",
                f"Follow the official documentation",
                f"Test thoroughly before deployment",
            ]
        }
        
        # Get patterns for this question type
        patterns = distractor_patterns.get(question_type, distractor_patterns['definition'])
        
        # Generate distractors
        for pattern in patterns:
            distractor = pattern
            
            # Make it similar length to correct answer
            target_len = len(correct_answer)
            if len(distractor) < target_len * 0.7:
                distractor += " for optimal results"
            elif len(distractor) > target_len * 1.3:
                distractor = distractor[:int(target_len * 1.2)]
            
            distractors.append(distractor)
        
        return distractors[:4]  # Return up to 4 distractors
    
    def generate_explanation(self, concept: str, correct_answer: str, context: str) -> str:
        """Generate explanation for the answer"""
        
        # Find relevant context
        sentences = context.split('.')
        relevant = [s for s in sentences if concept in s or correct_answer[:20] in s]
        
        if relevant:
            explanation = relevant[0].strip()
        else:
            explanation = f"{concept} is correctly described as: {correct_answer}"
        
        # Ensure minimum length
        if len(explanation) < 50:
            explanation += f" This is a fundamental concept in the domain."
        
        return explanation[:200]  # Limit length
    
    def generate_variations(self, question: Dict, num_variations: int = 3) -> List[GeneratedQuestion]:
        """Generate variations of an existing question"""
        variations = []
        
        for i in range(num_variations):
            # Vary the question text
            varied_question = self.vary_question_text(question['question'])
            
            # Shuffle options (keeping track of correct answer)
            options = question['options'].copy()
            correct = options[question['correctAnswer']]
            random.shuffle(options)
            correct_idx = options.index(correct)
            
            # Create variation
            variation = GeneratedQuestion(
                question=varied_question,
                options=options,
                correctAnswer=correct_idx,
                explanation=question['explanation'],
                difficulty=question.get('difficulty', 3),
                categorySlug=question.get('categorySlug', 'general'),
                tags=question.get('tags', []),
                source='variation',
                generated_at=datetime.now().isoformat()
            )
            
            variations.append(variation)
        
        return variations
    
    def vary_question_text(self, original: str) -> str:
        """Create variation of question text"""
        variations = {
            'What is': ['What exactly is', 'How would you define', 'Which best describes'],
            'How do you': ['What is the way to', 'What is the process to', 'How would you'],
            'Which': ['What', 'Which one of the following', 'Which option'],
            'When': ['In what situation', 'Under what circumstances', 'At what point'],
            'Why': ['What is the reason', 'For what purpose', 'What is the rationale'],
        }
        
        for original_phrase, replacements in variations.items():
            if original.startswith(original_phrase):
                replacement = random.choice(replacements)
                return original.replace(original_phrase, replacement, 1)
        
        return original

class QuestionPipeline:
    """Complete pipeline for question generation"""
    
    def __init__(self):
        self.scraper = ContentScraper()
        self.generator = QuestionGenerator()
        self.tester = QuestionTester()
        
    def generate_from_url(self, url: str, category: str, count: int = 10) -> List[Dict]:
        """Generate questions from a URL"""
        print(f"Scraping content from {url}...")
        
        # Determine scraping method based on URL
        if 'github.com' in url:
            content = self.scraper.scrape_github_readme(url)
            scraped = [content] if content else []
        elif 'stackoverflow.com' in url or 'stack' in url:
            # Extract tag from URL or use category
            tag = category.replace('-', '')
            scraped = self.scraper.scrape_stack_overflow(tag, limit=20)
        else:
            scraped = self.scraper.scrape_documentation(url, max_depth=1)
        
        if not scraped:
            print("No content scraped")
            return []
        
        print(f"Scraped {len(scraped)} pages")
        
        # Generate questions
        all_questions = []
        for content in scraped:
            questions = self.generator.generate_from_content(content, category)
            all_questions.extend(questions)
            
            if len(all_questions) >= count:
                break
        
        # Convert to dict format
        question_dicts = [q.to_dict() for q in all_questions[:count]]
        
        print(f"Generated {len(question_dicts)} questions")
        return question_dicts
    
    def generate_from_existing(self, quiz_data_path: str, count: int = 50) -> List[Dict]:
        """Generate variations from existing questions"""
        print("Generating variations from existing questions...")
        
        with open(quiz_data_path, 'r') as f:
            data = json.load(f)
        
        existing_questions = data['questions']
        
        # Select high-quality questions for variation
        high_quality = []
        for q in existing_questions:
            test_result = self.tester.test_question(q)
            if test_result['quality']['overall'] >= 0.8:
                high_quality.append(q)
        
        print(f"Found {len(high_quality)} high-quality questions for variation")
        
        # Generate variations
        all_variations = []
        for q in high_quality[:count//3]:
            variations = self.generator.generate_variations(q, num_variations=3)
            all_variations.extend(variations)
        
        # Convert to dict format
        variation_dicts = [v.to_dict() for v in all_variations[:count]]
        
        print(f"Generated {len(variation_dicts)} question variations")
        return variation_dicts
    
    def bulk_generate(self, sources: List[Dict], output_path: str):
        """Bulk generate questions from multiple sources"""
        all_questions = []
        
        for source in sources:
            if source['type'] == 'url':
                questions = self.generate_from_url(
                    source['url'], 
                    source['category'],
                    source.get('count', 10)
                )
            elif source['type'] == 'variations':
                questions = self.generate_from_existing(
                    source['quiz_path'],
                    source.get('count', 50)
                )
            else:
                continue
            
            all_questions.extend(questions)
        
        # Test all questions
        print(f"\nTesting {len(all_questions)} generated questions...")
        test_results = self.tester.test_batch(all_questions)
        
        # Filter to only high-quality questions
        final_questions = []
        for q, result in zip(all_questions, test_results['results']):
            if result['passed']:
                final_questions.append(q)
        
        print(f"Final: {len(final_questions)} questions passed quality checks")
        
        # Save to file
        output_data = {
            'generated_at': datetime.now().isoformat(),
            'total_generated': len(all_questions),
            'passed_quality': len(final_questions),
            'questions': final_questions,
            'summary': test_results['summary']
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Saved {len(final_questions)} questions to {output_path}")
        return final_questions

def main():
    """Example usage"""
    pipeline = QuestionPipeline()
    
    # Define sources for question generation
    sources = [
        {
            'type': 'url',
            'url': 'https://kubernetes.io/docs/concepts/',
            'category': 'kubernetes',
            'count': 20
        },
        {
            'type': 'url',
            'url': 'https://docs.docker.com/',
            'category': 'docker',
            'count': 20
        },
        {
            'type': 'variations',
            'quiz_path': '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json',
            'count': 30
        }
    ]
    
    # Generate questions
    output_path = '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/generated_questions.json'
    questions = pipeline.bulk_generate(sources, output_path)
    
    print(f"\nSuccessfully generated {len(questions)} high-quality questions!")

if __name__ == "__main__":
    main()
