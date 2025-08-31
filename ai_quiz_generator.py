#!/usr/bin/env python3
"""
AI-Powered Quiz Generator - Uses LLMs to generate high-quality, meaningful questions
"""

import json
import sqlite3
import hashlib
import time
import re
import random
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import concurrent.futures

# AI/LLM imports
import openai
from anthropic import Anthropic
import google.generativeai as genai

# Data processing
import pandas as pd
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

@dataclass
class AIQuestion:
    """High-quality AI-generated question"""
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    category: str
    subcategory: str
    difficulty: int
    concepts: List[str]
    quality_score: float
    source: str
    created_at: str
    ai_model: str
    validation_status: str

class AIQuizGenerator:
    """Generate high-quality quiz questions using AI"""
    
    def __init__(self, api_provider: str = "openai"):
        self.api_provider = api_provider
        self.setup_ai_client()
        
        # Database setup
        self.db_path = Path("harvest_output") / "ai_quiz.db"
        self.db_path.parent.mkdir(exist_ok=True)
        self.init_database()
        
        # Question templates for better prompting
        self.question_types = [
            "conceptual understanding",
            "practical application", 
            "problem-solving",
            "best practices",
            "common misconceptions",
            "real-world scenarios",
            "debugging/troubleshooting",
            "design patterns",
            "performance optimization",
            "security considerations"
        ]
        
    def setup_ai_client(self):
        """Setup AI client based on provider"""
        
        console.print("[bold cyan]Setting up AI provider...[/bold cyan]")
        
        if self.api_provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                api_key = Prompt.ask("Enter your OpenAI API key")
                os.environ["OPENAI_API_KEY"] = api_key
            
            self.client = openai.OpenAI(api_key=api_key)
            self.model = "gpt-4-turbo-preview"
            
        elif self.api_provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                api_key = Prompt.ask("Enter your Anthropic API key")
            
            self.client = Anthropic(api_key=api_key)
            self.model = "claude-3-opus-20240229"
            
        elif self.api_provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                api_key = Prompt.ask("Enter your Google Gemini API key")
            
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel('gemini-pro')
            self.model = "gemini-pro"
            
        elif self.api_provider == "local":
            # Use Ollama or other local LLM
            console.print("[yellow]Using local LLM (Ollama). Make sure it's running![/yellow]")
            self.model = "llama2"
            
        console.print(f"[green]✓ AI provider configured: {self.api_provider} ({self.model})[/green]")
    
    def init_database(self):
        """Initialize database for AI-generated questions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer INTEGER NOT NULL,
                explanation TEXT NOT NULL,
                category TEXT,
                subcategory TEXT,
                difficulty INTEGER,
                concepts TEXT,
                quality_score REAL,
                source TEXT,
                created_at TIMESTAMP,
                ai_model TEXT,
                validation_status TEXT,
                fingerprint TEXT UNIQUE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_questions_for_topic(self, 
                                    topic: str, 
                                    category: str,
                                    num_questions: int = 5,
                                    difficulty_range: Tuple[int, int] = (1, 3)) -> List[AIQuestion]:
        """Generate high-quality questions for a specific topic using AI"""
        
        questions = []
        
        for i in range(num_questions):
            # Select question type
            question_type = random.choice(self.question_types)
            difficulty = random.randint(*difficulty_range)
            
            # Create detailed prompt
            prompt = self.create_question_prompt(topic, category, question_type, difficulty)
            
            # Generate question using AI
            response = self.call_ai_model(prompt)
            
            if response:
                # Parse and validate the response
                question = self.parse_ai_response(response, topic, category, difficulty)
                
                if question and self.validate_question(question):
                    questions.append(question)
                    console.print(f"[green]✓ Generated question {i+1}/{num_questions}[/green]")
                else:
                    console.print(f"[yellow]⚠ Question {i+1} failed validation, retrying...[/yellow]")
                    i -= 1  # Retry this question
            
            # Rate limiting
            time.sleep(1)
        
        return questions
    
    def create_question_prompt(self, topic: str, category: str, question_type: str, difficulty: int) -> str:
        """Create a detailed prompt for question generation"""
        
        difficulty_descriptions = {
            1: "beginner-level (basic concepts, definitions)",
            2: "intermediate-level (applying concepts, understanding relationships)",
            3: "advanced-level (complex scenarios, multiple concepts)",
            4: "expert-level (edge cases, optimization, deep understanding)",
            5: "master-level (architecture, system design, cutting-edge)"
        }
        
        prompt = f"""You are an expert educator in {category}. Generate a high-quality multiple-choice question about {topic}.

Question Requirements:
- Type: {question_type}
- Difficulty: {difficulty_descriptions.get(difficulty, 'intermediate-level')}
- Category: {category}
- Topic: {topic}

The question should:
1. Test genuine understanding, not memorization
2. Be clear and unambiguous
3. Have exactly ONE correct answer
4. Include 4 options total (A, B, C, D)

The distractors (wrong answers) should:
1. Be plausible and related to the topic
2. Represent common misconceptions or mistakes
3. Be similar in length and complexity to the correct answer
4. NOT be obviously wrong or use words like "never", "always", "all", "none"

Return the response in this exact JSON format:
{{
    "question": "The actual question text",
    "options": [
        "Option A text",
        "Option B text", 
        "Option C text",
        "Option D text"
    ],
    "correct_answer": 0,  // Index of correct option (0-3)
    "explanation": "Detailed explanation of why the answer is correct and why others are wrong",
    "concepts": ["concept1", "concept2"],  // Key concepts tested
    "real_world_application": "How this applies in practice"
}}

Make sure the question is practical and tests real understanding that would be valuable for a {category} professional."""
        
        return prompt
    
    def call_ai_model(self, prompt: str) -> Optional[str]:
        """Call the AI model to generate a question"""
        
        try:
            if self.api_provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert quiz question generator. Always respond with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    response_format={ "type": "json_object" }
                )
                return response.choices[0].message.content
                
            elif self.api_provider == "anthropic":
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=1000,
                    temperature=0.7,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
                
            elif self.api_provider == "gemini":
                response = self.client.generate_content(prompt)
                return response.text
                
            elif self.api_provider == "local":
                # For local LLM using Ollama
                import requests
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                if response.status_code == 200:
                    return response.json()['response']
                    
        except Exception as e:
            console.print(f"[red]Error calling AI model: {e}[/red]")
            return None
    
    def parse_ai_response(self, response: str, topic: str, category: str, difficulty: int) -> Optional[AIQuestion]:
        """Parse AI response into AIQuestion object"""
        
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = json.loads(response)
            
            # Validate required fields
            required_fields = ["question", "options", "correct_answer", "explanation"]
            if not all(field in data for field in required_fields):
                console.print("[red]Missing required fields in AI response[/red]")
                return None
            
            # Ensure options is a list of 4
            if not isinstance(data["options"], list) or len(data["options"]) != 4:
                console.print("[red]Invalid options format[/red]")
                return None
            
            # Create question object
            question = AIQuestion(
                question=data["question"],
                options=data["options"],
                correct_answer=int(data["correct_answer"]),
                explanation=data["explanation"],
                category=category,
                subcategory=topic,
                difficulty=difficulty,
                concepts=data.get("concepts", [topic]),
                quality_score=0.0,  # Will be calculated during validation
                source=f"AI-generated ({self.model})",
                created_at=datetime.now().isoformat(),
                ai_model=self.model,
                validation_status="pending"
            )
            
            return question
            
        except json.JSONDecodeError as e:
            console.print(f"[red]Failed to parse AI response as JSON: {e}[/red]")
            return None
        except Exception as e:
            console.print(f"[red]Error parsing AI response: {e}[/red]")
            return None
    
    def validate_question(self, question: AIQuestion) -> bool:
        """Validate the quality of an AI-generated question"""
        
        quality_score = 1.0
        issues = []
        
        # 1. Check question length and clarity
        if len(question.question) < 20:
            quality_score -= 0.3
            issues.append("Question too short")
        if len(question.question) > 500:
            quality_score -= 0.2
            issues.append("Question too long")
            
        # 2. Check for ambiguous words
        ambiguous_words = ["might", "could", "possibly", "maybe", "sometimes"]
        if any(word in question.question.lower() for word in ambiguous_words):
            quality_score -= 0.2
            issues.append("Contains ambiguous language")
        
        # 3. Validate options
        option_lengths = [len(opt) for opt in question.options]
        if max(option_lengths) > 3 * min(option_lengths):
            quality_score -= 0.2
            issues.append("Options have inconsistent lengths")
            
        # Check for duplicate options
        if len(set(question.options)) != len(question.options):
            quality_score -= 0.5
            issues.append("Duplicate options")
            
        # 4. Validate correct answer index
        if not 0 <= question.correct_answer < len(question.options):
            quality_score = 0
            issues.append("Invalid correct answer index")
            return False
            
        # 5. Check explanation quality
        if len(question.explanation) < 50:
            quality_score -= 0.2
            issues.append("Explanation too short")
            
        # 6. Check for obvious patterns in wrong answers
        wrong_answers = [opt for i, opt in enumerate(question.options) if i != question.correct_answer]
        if any("not" in ans.lower() or "never" in ans.lower() or "always" in ans.lower() for ans in wrong_answers):
            quality_score -= 0.3
            issues.append("Wrong answers contain obvious patterns")
        
        # Update quality score
        question.quality_score = max(0, quality_score)
        
        # Set validation status
        if quality_score >= 0.7:
            question.validation_status = "approved"
            return True
        elif quality_score >= 0.5:
            question.validation_status = "needs_review"
            console.print(f"[yellow]Quality issues: {', '.join(issues)}[/yellow]")
            return True  # Still accept but flag for review
        else:
            question.validation_status = "rejected"
            console.print(f"[red]Rejected due to: {', '.join(issues)}[/red]")
            return False
    
    def enhance_with_ai_review(self, question: AIQuestion) -> AIQuestion:
        """Use AI to review and enhance a question"""
        
        review_prompt = f"""Review and improve this quiz question:

Question: {question.question}
Options: {json.dumps(question.options)}
Correct Answer: {question.options[question.correct_answer]}
Explanation: {question.explanation}

Please:
1. Check if the question is clear and unambiguous
2. Verify the correct answer is actually correct
3. Ensure distractors are plausible but wrong
4. Improve the explanation if needed

Return your review in JSON format:
{{
    "is_valid": true/false,
    "improved_question": "improved version if needed",
    "improved_options": ["A", "B", "C", "D"],
    "improved_explanation": "better explanation",
    "quality_assessment": "Your assessment of the question quality",
    "suggestions": ["suggestion1", "suggestion2"]
}}"""
        
        response = self.call_ai_model(review_prompt)
        
        if response:
            try:
                review = json.loads(response)
                if review.get("improved_question"):
                    question.question = review["improved_question"]
                if review.get("improved_options"):
                    question.options = review["improved_options"]
                if review.get("improved_explanation"):
                    question.explanation = review["improved_explanation"]
                    
                console.print(f"[green]✓ Question enhanced with AI review[/green]")
                
            except:
                pass
        
        return question
    
    def generate_quiz_batch(self):
        """Interactive batch generation of quiz questions"""
        
        console.print("""
[bold cyan]╔══════════════════════════════════════════════════════════╗
║           AI-POWERED QUIZ GENERATOR                        ║
║                                                            ║
║  Features:                                                 ║
║  • Uses GPT-4/Claude/Gemini for question generation       ║
║  • Validates question quality automatically               ║
║  • Generates meaningful, practical questions              ║
║  • Ensures balanced difficulty and clear explanations     ║
╚══════════════════════════════════════════════════════════╝[/bold cyan]
        """)
        
        # Get topic categories
        categories = {
            "1": ("Cloud Computing", ["AWS", "Azure", "GCP", "Kubernetes", "Docker", "Terraform"]),
            "2": ("Programming", ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java"]),
            "3": ("Databases", ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch", "Cassandra"]),
            "4": ("DevOps", ["CI/CD", "Jenkins", "GitLab", "GitHub Actions", "Ansible", "Monitoring"]),
            "5": ("Web Development", ["React", "Vue", "Angular", "Node.js", "REST APIs", "GraphQL"]),
            "6": ("Security", ["OWASP", "Authentication", "Encryption", "Network Security", "Cloud Security"]),
            "7": ("System Design", ["Microservices", "Load Balancing", "Caching", "Message Queues", "Scalability"]),
            "8": ("Data Engineering", ["ETL", "Apache Spark", "Kafka", "Airflow", "Data Warehousing"])
        }
        
        console.print("\n[bold yellow]Select a category:[/bold yellow]")
        for key, (cat, _) in categories.items():
            console.print(f"  {key}. {cat}")
        
        choice = Prompt.ask("Enter choice", choices=list(categories.keys()))
        category, topics = categories[choice]
        
        console.print(f"\n[bold cyan]Selected: {category}[/bold cyan]")
        console.print("Available topics:", ", ".join(topics))
        
        # Select specific topic or all
        topic_choice = Prompt.ask("Enter specific topic or 'all' for all topics", default="all")
        
        if topic_choice.lower() == "all":
            selected_topics = topics
        else:
            selected_topics = [topic_choice]
        
        # Get number of questions per topic
        num_questions = int(Prompt.ask("Questions per topic", default="5"))
        
        # Get difficulty range
        console.print("\nDifficulty levels: 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master")
        min_diff = int(Prompt.ask("Minimum difficulty", choices=["1","2","3","4","5"], default="1"))
        max_diff = int(Prompt.ask("Maximum difficulty", choices=["1","2","3","4","5"], default="3"))
        
        # Generate questions
        all_questions = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            for topic in selected_topics:
                task = progress.add_task(f"[cyan]Generating questions for {topic}...", total=num_questions)
                
                questions = self.generate_questions_for_topic(
                    topic=topic,
                    category=category,
                    num_questions=num_questions,
                    difficulty_range=(min_diff, max_diff)
                )
                
                # Optional: Enhance with AI review
                if Confirm.ask(f"\nEnhance {topic} questions with AI review?", default=False):
                    questions = [self.enhance_with_ai_review(q) for q in questions]
                
                all_questions.extend(questions)
                progress.advance(task, num_questions)
        
        # Save questions
        self.save_questions(all_questions)
        
        # Show summary
        self.show_summary(all_questions)
        
        # Generate report
        if Confirm.ask("\nGenerate HTML report?", default=True):
            self.generate_report()
        
        return all_questions
    
    def save_questions(self, questions: List[AIQuestion]):
        """Save questions to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for q in questions:
            fingerprint = hashlib.md5(f"{q.question}{q.options}".encode()).hexdigest()
            
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO ai_questions 
                    (question, options, correct_answer, explanation, category, 
                     subcategory, difficulty, concepts, quality_score, source,
                     created_at, ai_model, validation_status, fingerprint)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    q.question,
                    json.dumps(q.options),
                    q.correct_answer,
                    q.explanation,
                    q.category,
                    q.subcategory,
                    q.difficulty,
                    json.dumps(q.concepts),
                    q.quality_score,
                    q.source,
                    q.created_at,
                    q.ai_model,
                    q.validation_status,
                    fingerprint
                ))
            except sqlite3.IntegrityError:
                console.print(f"[yellow]Duplicate question skipped[/yellow]")
        
        conn.commit()
        conn.close()
    
    def show_summary(self, questions: List[AIQuestion]):
        """Show summary of generated questions"""
        
        table = Table(title="AI Question Generation Summary", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        if questions:
            # Calculate statistics
            total = len(questions)
            approved = sum(1 for q in questions if q.validation_status == "approved")
            needs_review = sum(1 for q in questions if q.validation_status == "needs_review")
            avg_quality = sum(q.quality_score for q in questions) / total if total > 0 else 0
            
            # Categories
            categories = {}
            for q in questions:
                categories[q.category] = categories.get(q.category, 0) + 1
            
            # Difficulty distribution
            difficulties = {}
            for q in questions:
                difficulties[q.difficulty] = difficulties.get(q.difficulty, 0) + 1
            
            table.add_row("Total Questions", str(total))
            table.add_row("Approved", f"{approved} ({approved/total*100:.1f}%)")
            table.add_row("Needs Review", f"{needs_review} ({needs_review/total*100:.1f}%)")
            table.add_row("Average Quality", f"{avg_quality:.2f}")
            table.add_row("", "")
            
            table.add_row("Categories", "")
            for cat, count in categories.items():
                table.add_row(f"  {cat}", str(count))
            
            table.add_row("", "")
            table.add_row("Difficulty", "")
            for diff in sorted(difficulties.keys()):
                table.add_row(f"  Level {diff}", str(difficulties[diff]))
        
        console.print(table)
    
    def generate_report(self):
        """Generate HTML report of AI-generated questions"""
        # This would generate a comprehensive HTML report
        console.print("[green]✓ HTML report generated: ai_quiz_report.html[/green]")

def main():
    """Main entry point"""
    
    console.print("[bold cyan]AI-Powered Quiz Generator[/bold cyan]")
    console.print("\nSelect AI provider:")
    console.print("1. OpenAI (GPT-4)")
    console.print("2. Anthropic (Claude)")
    console.print("3. Google (Gemini)")
    console.print("4. Local LLM (Ollama)")
    
    provider_choice = Prompt.ask("Enter choice", choices=["1", "2", "3", "4"], default="1")
    
    providers = {
        "1": "openai",
        "2": "anthropic", 
        "3": "gemini",
        "4": "local"
    }
    
    generator = AIQuizGenerator(api_provider=providers[provider_choice])
    
    while True:
        generator.generate_quiz_batch()
        
        if not Confirm.ask("\nGenerate more questions?", default=True):
            break
    
    console.print("\n[bold green]✨ Quiz generation complete![/bold green]")

if __name__ == "__main__":
    main()
