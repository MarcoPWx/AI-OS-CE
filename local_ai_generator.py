#!/usr/bin/env python3
"""
Local AI Quiz Generator - Uses Ollama for high-quality question generation
No API keys required!
"""

import json
import sqlite3
import hashlib
import time
import re
import random
import subprocess
import os
import html
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

import requests
import pandas as pd
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn

console = Console()

@dataclass
class LocalAIQuestion:
    """High-quality locally AI-generated question"""
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    category: str
    subcategory: str
    difficulty: int
    concepts: List[str]
    quality_score: float
    ai_model: str
    created_at: str

class LocalAIQuizGenerator:
    """Generate high-quality quiz questions using local Ollama"""
    
    def __init__(self):
        self.setup_ollama()
        
        # Database setup
        self.db_path = Path("harvest_output") / "local_ai_quiz.db"
        self.db_path.parent.mkdir(exist_ok=True)
        self.init_database()
        
        # Question types for variety
        self.question_types = [
            "conceptual understanding",
            "practical application", 
            "problem-solving",
            "best practices",
            "common mistakes to avoid",
            "real-world scenario",
            "debugging situation",
            "performance optimization",
            "security consideration",
            "architectural decision"
        ]
    
    def setup_ollama(self):
        """Setup and verify Ollama is running"""
        console.print("[bold cyan]Setting up Ollama for local AI generation...[/bold cyan]")
        
        # Check if Ollama is running
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get('models', [])
                if models:
                    console.print(f"[green]✓ Ollama is running with models: {', '.join([m['name'] for m in models])}[/green]")
                    self.available_models = [m['name'] for m in models]
                else:
                    console.print("[yellow]No models found. Installing llama3...[/yellow]")
                    self.install_model("llama3")
            else:
                self.start_ollama()
        except:
            console.print("[yellow]Ollama not running. Starting it...[/yellow]")
            self.start_ollama()
    
    def start_ollama(self):
        """Start Ollama service"""
        try:
            # Try to start Ollama in background
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(3)
            
            # Install a model if needed
            self.install_model("llama3")
            
        except FileNotFoundError:
            console.print("""
[red]Ollama is not installed![/red]

Please install Ollama first:
1. Visit: https://ollama.ai/download
2. Download and install Ollama for macOS
3. Run: ollama pull llama3
4. Then run this script again

Alternative: Use the manual mode (option 2 in menu)
""")
            self.use_manual_mode = True
    
    def install_model(self, model_name: str):
        """Install an Ollama model"""
        console.print(f"[cyan]Installing {model_name} model...[/cyan]")
        try:
            result = subprocess.run(["ollama", "pull", model_name], capture_output=True, text=True)
            if result.returncode == 0:
                console.print(f"[green]✓ Model {model_name} installed successfully[/green]")
                self.model = model_name
            else:
                console.print(f"[red]Failed to install model: {result.stderr}[/red]")
                self.use_manual_mode = True
        except:
            self.use_manual_mode = True
    
    def init_database(self):
        """Initialize database for questions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS local_ai_questions (
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
                ai_model TEXT,
                created_at TIMESTAMP,
                fingerprint TEXT UNIQUE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def call_ollama(self, prompt: str, model: str = "llama2") -> Optional[str]:
        """Call Ollama API to generate content"""
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 1000
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json().get('response', '')
            else:
                console.print(f"[red]Ollama API error: {response.status_code}[/red]")
                return None
                
        except requests.exceptions.Timeout:
            console.print("[yellow]Request timed out. Using fallback generation...[/yellow]")
            return self.fallback_generation(prompt)
        except Exception as e:
            console.print(f"[red]Error calling Ollama: {e}[/red]")
            return self.fallback_generation(prompt)
    
    def fallback_generation(self, prompt: str) -> str:
        """Fallback question generation when Ollama isn't available"""
        # Extract topic from prompt
        topic_match = re.search(r'about ([^.]+)', prompt)
        topic = topic_match.group(1) if topic_match else "technology"
        
        # Generate a structured question
        templates = {
            "conceptual": {
                "questions": [
                    f"What is the primary purpose of {topic} in modern software development?",
                    f"Which of the following best describes {topic}?",
                    f"What problem does {topic} solve?",
                ],
                "correct_answers": [
                    f"It provides a solution for managing complexity in large-scale systems",
                    f"A technology that enables efficient resource utilization",
                    f"It helps developers build more maintainable applications",
                ],
                "distractors": [
                    "It's primarily used for legacy system maintenance",
                    "It only works with specific programming languages",
                    "It's an experimental technology not ready for production",
                    "It requires specialized hardware to function",
                    "It's mainly for small-scale applications",
                    "It's deprecated in favor of newer alternatives"
                ]
            },
            "practical": {
                "questions": [
                    f"When implementing {topic}, what is the most important consideration?",
                    f"In a production environment, how should {topic} be configured?",
                    f"What is the best practice for using {topic}?",
                ],
                "correct_answers": [
                    f"Ensuring proper error handling and monitoring",
                    f"Following security best practices and regular updates",
                    f"Optimizing for performance while maintaining readability",
                ],
                "distractors": [
                    "Using the default configuration without changes",
                    "Maximizing feature usage regardless of need",
                    "Prioritizing speed over security",
                    "Avoiding documentation to save time",
                    "Implementing without testing",
                    "Using outdated versions for stability"
                ]
            }
        }
        
        # Select template
        template_type = random.choice(list(templates.keys()))
        template = templates[template_type]
        
        # Generate question
        question = random.choice(template["questions"])
        correct = random.choice(template["correct_answers"])
        wrong = random.sample(template["distractors"], 3)
        
        # Create options and shuffle
        options = [correct] + wrong
        random.shuffle(options)
        correct_idx = options.index(correct)
        
        # Create JSON response
        response = {
            "question": question,
            "options": options,
            "correct_answer": correct_idx,
            "explanation": f"The correct answer is '{correct}' because it represents a fundamental principle of {topic}. The other options are either incorrect assumptions or anti-patterns that should be avoided.",
            "concepts": [topic, template_type]
        }
        
        return json.dumps(response)
    
    def create_question_prompt(self, topic: str, category: str, question_type: str, difficulty: int) -> str:
        """Create a structured prompt for Ollama"""
        
        difficulty_descriptions = {
            1: "beginner (basic concepts)",
            2: "intermediate (practical application)",
            3: "advanced (complex scenarios)",
            4: "expert (optimization and edge cases)",
            5: "master (architecture and design)"
        }
        
        prompt = f"""Generate a high-quality multiple-choice quiz question about {topic} in {category}.

Requirements:
- Question type: {question_type}
- Difficulty: {difficulty_descriptions.get(difficulty, 'intermediate')}
- Test real understanding, not memorization
- Have exactly 4 options (A, B, C, D)
- Only ONE correct answer
- Wrong answers should be plausible but incorrect

Return ONLY a JSON object with this exact structure:
{{
    "question": "Clear question text here",
    "options": [
        "Option A text",
        "Option B text", 
        "Option C text",
        "Option D text"
    ],
    "correct_answer": 0,
    "explanation": "Why this answer is correct",
    "concepts": ["concept1", "concept2"]
}}

Make the question practical and valuable for professionals."""
        
        return prompt
    
    def parse_ai_response(self, response: str, topic: str, category: str, difficulty: int) -> Optional[LocalAIQuestion]:
        """Parse AI response into question object"""
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                # Try to parse entire response as JSON
                data = json.loads(response)
            
            # Validate required fields
            if not all(field in data for field in ["question", "options", "correct_answer"]):
                console.print("[yellow]Missing fields, using defaults[/yellow]")
                return None
            
            # Ensure we have 4 options
            options = data["options"]
            while len(options) < 4:
                options.append(f"Alternative option {len(options) + 1}")
            options = options[:4]
            
            # Create question object
            return LocalAIQuestion(
                question=data["question"],
                options=options,
                correct_answer=int(data["correct_answer"]) % 4,  # Ensure valid index
                explanation=data.get("explanation", "This is the correct answer based on best practices."),
                category=category,
                subcategory=topic,
                difficulty=difficulty,
                concepts=data.get("concepts", [topic]),
                quality_score=0.8,
                ai_model="ollama-local",
                created_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            console.print(f"[yellow]Parse error: {e}. Using fallback.[/yellow]")
            return None
    
    def generate_questions_batch(self, topic: str, category: str, num_questions: int = 5, 
                                difficulty_range: Tuple[int, int] = (1, 3)) -> List[LocalAIQuestion]:
        """Generate a batch of questions"""
        questions = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task(f"[cyan]Generating {topic} questions...", total=num_questions)
            
            for i in range(num_questions):
                # Select random question type and difficulty
                question_type = random.choice(self.question_types)
                difficulty = random.randint(*difficulty_range)
                
                # Create prompt
                prompt = self.create_question_prompt(topic, category, question_type, difficulty)
                
                # Generate with Ollama or fallback
                response = self.call_ollama(prompt)
                
                if response:
                    question = self.parse_ai_response(response, topic, category, difficulty)
                    if question:
                        questions.append(question)
                        progress.advance(task)
                        console.print(f"[green]✓ Generated question {i+1}/{num_questions}[/green]")
                    else:
                        # Use fallback generation
                        response = self.fallback_generation(prompt)
                        question = self.parse_ai_response(response, topic, category, difficulty)
                        if question:
                            questions.append(question)
                            progress.advance(task)
                
                # Small delay to not overwhelm local model
                time.sleep(0.5)
        
        return questions
    
    def save_questions(self, questions: List[LocalAIQuestion]):
        """Save questions to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        for q in questions:
            fingerprint = hashlib.md5(f"{q.question}{q.options}".encode()).hexdigest()
            
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO local_ai_questions 
                    (question, options, correct_answer, explanation, category, 
                     subcategory, difficulty, concepts, quality_score, ai_model,
                     created_at, fingerprint)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    q.ai_model,
                    q.created_at,
                    fingerprint
                ))
                if cursor.rowcount > 0:
                    saved_count += 1
            except sqlite3.IntegrityError:
                pass
        
        conn.commit()
        conn.close()
        
        console.print(f"[green]✓ Saved {saved_count} new questions to database[/green]")
    
    def generate_interactive(self):
        """Interactive question generation"""
        
        console.print("""
[bold cyan]╔══════════════════════════════════════════════════════════╗
║           LOCAL AI QUIZ GENERATOR (Ollama)                 ║
║                                                            ║
║  Features:                                                 ║
║  • No API keys required - runs locally                    ║
║  • Uses Ollama for AI generation                          ║
║  • Fallback generation if Ollama unavailable              ║
║  • Generates practical, meaningful questions              ║
╚══════════════════════════════════════════════════════════╝[/bold cyan]
        """)
        
        # Categories and topics
        categories = {
            "1": ("Cloud Computing", ["AWS", "Azure", "GCP", "Kubernetes", "Docker", "Terraform", "CloudFormation"]),
            "2": ("Programming", ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "C++", "Swift"]),
            "3": ("Databases", ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch", "DynamoDB", "Cassandra"]),
            "4": ("DevOps", ["CI/CD", "Jenkins", "GitLab CI", "GitHub Actions", "Ansible", "Monitoring", "Logging"]),
            "5": ("Web Development", ["React", "Vue", "Angular", "Node.js", "REST APIs", "GraphQL", "WebSockets"]),
            "6": ("Security", ["OWASP", "Authentication", "Encryption", "OAuth", "JWT", "Network Security", "Cloud Security"]),
            "7": ("System Design", ["Microservices", "Load Balancing", "Caching", "Message Queues", "Scalability", "CAP Theorem"]),
            "8": ("Data Engineering", ["Apache Spark", "Kafka", "Airflow", "ETL", "Data Lakes", "Stream Processing"])
        }
        
        while True:
            console.print("\n[bold yellow]Select a category:[/bold yellow]")
            for key, (cat, _) in categories.items():
                console.print(f"  {key}. {cat}")
            console.print("  0. Exit")
            
            choice = Prompt.ask("Enter choice", choices=["0"] + list(categories.keys()))
            
            if choice == "0":
                break
            
            category, topics = categories[choice]
            
            console.print(f"\n[bold cyan]Category: {category}[/bold cyan]")
            console.print("Topics:", ", ".join(topics))
            
            # Select topics
            console.print("\n[yellow]Select topics (comma-separated) or 'all':[/yellow]")
            topic_input = Prompt.ask("Topics", default="all")
            
            if topic_input.lower() == "all":
                selected_topics = topics
            else:
                selected_topics = [t.strip() for t in topic_input.split(",")]
            
            # Number of questions
            num_questions = int(Prompt.ask("Questions per topic", default="3"))
            
            # Difficulty
            console.print("\nDifficulty: 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master")
            min_diff = int(Prompt.ask("Min difficulty", choices=["1","2","3","4","5"], default="1"))
            max_diff = int(Prompt.ask("Max difficulty", choices=["1","2","3","4","5"], default="3"))
            
            # Validate difficulty range
            if min_diff > max_diff:
                console.print("[yellow]Min difficulty was higher than max. Swapping values.[/yellow]")
                min_diff, max_diff = max_diff, min_diff
            
            # Generate questions
            all_questions = []
            for topic in selected_topics:
                console.print(f"\n[bold cyan]Generating questions for: {topic}[/bold cyan]")
                questions = self.generate_questions_batch(
                    topic=topic,
                    category=category,
                    num_questions=num_questions,
                    difficulty_range=(min_diff, max_diff)
                )
                all_questions.extend(questions)
            
            # Save questions
            if all_questions:
                self.save_questions(all_questions)
                self.show_summary(all_questions)
            
            # Continue?
            if not Confirm.ask("\n[yellow]Generate more questions?[/yellow]"):
                break
        
        # Final report
        if Confirm.ask("\n[cyan]Generate HTML report?[/cyan]"):
            self.generate_html_report()
    
    def show_summary(self, questions: List[LocalAIQuestion]):
        """Show summary of generated questions"""
        
        table = Table(title="Generation Summary", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        # Statistics
        total = len(questions)
        categories = {}
        difficulties = {}
        
        for q in questions:
            categories[q.category] = categories.get(q.category, 0) + 1
            difficulties[q.difficulty] = difficulties.get(q.difficulty, 0) + 1
        
        table.add_row("Total Questions", str(total))
        table.add_row("Average Quality", f"{sum(q.quality_score for q in questions)/total:.2f}")
        table.add_row("", "")
        
        table.add_row("Categories", "")
        for cat, count in categories.items():
            table.add_row(f"  {cat}", str(count))
        
        table.add_row("", "")
        table.add_row("Difficulty", "")
        for diff in sorted(difficulties.keys()):
            table.add_row(f"  Level {diff}", str(difficulties[diff]))
        
        console.print(table)
        
        # Show sample question
        if questions:
            q = random.choice(questions)
            console.print("\n[bold cyan]Sample Question:[/bold cyan]")
            console.print(f"Q: {q.question}")
            for i, opt in enumerate(q.options):
                marker = "✓" if i == q.correct_answer else " "
                console.print(f"  {marker} {chr(65+i)}. {opt}")
            console.print(f"\n[dim]Explanation: {q.explanation}[/dim]")
    
    def generate_html_report(self):
        """Generate HTML report of all questions"""
        conn = sqlite3.connect(self.db_path)
        df = pd.read_sql_query("SELECT * FROM local_ai_questions ORDER BY created_at DESC", conn)
        conn.close()
        
        if df.empty:
            console.print("[yellow]No questions to report[/yellow]")
            return
        
        # Parse JSON fields
        df['options'] = df['options'].apply(json.loads)
        df['concepts'] = df['concepts'].apply(lambda x: json.loads(x) if x else [])
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Local AI Quiz Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .stat-number {{ font-size: 2em; color: #667eea; font-weight: bold; }}
        .question-card {{ background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }}
        .option {{ padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; }}
        .correct {{ background: #d4edda; border: 1px solid #28a745; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Local AI Quiz Generation Report</h1>
        <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">{len(df)}</div>
            <div>Total Questions</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{df['category'].nunique()}</div>
            <div>Categories</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{df['quality_score'].mean():.1%}</div>
            <div>Avg Quality</div>
        </div>
    </div>
    
    <h2>Sample Questions</h2>
"""
        
        # Add sample questions
        for _, row in df.head(10).iterrows():
            options_html = ""
            for i, opt in enumerate(row['options']):
                correct_class = "correct" if i == row['correct_answer'] else ""
                options_html += f'<div class="option {correct_class}">{chr(65+i)}. {html.escape(str(opt))}</div>'
            
            html_content += f"""
    <div class="question-card">
        <h3>{html.escape(row['question'])}</h3>
        {options_html}
        <p><strong>Explanation:</strong> {html.escape(row['explanation'])}</p>
        <p><small>Category: {row['category']} | Difficulty: {row['difficulty']} | Topics: {', '.join(row['concepts'] if row['concepts'] else [])}</small></p>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        report_path = "local_ai_quiz_report.html"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        console.print(f"[green]✓ Report generated: {report_path}[/green]")
        
        # Try to open in browser
        try:
            import webbrowser
            webbrowser.open(f"file://{os.path.abspath(report_path)}")
        except:
            pass

def main():
    """Main entry point"""
    generator = LocalAIQuizGenerator()
    generator.generate_interactive()

if __name__ == "__main__":
    main()
