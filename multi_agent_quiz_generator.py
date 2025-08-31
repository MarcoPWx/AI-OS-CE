#!/usr/bin/env python3
"""
Multi-Agent Quiz Generator with Blackboard Pattern
High-quality question generation through collaborative AI agents
"""

import sys
import json
import sqlite3
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Add agents directory to path
sys.path.append(str(Path(__file__).parent))

import requests
from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

# Import our modules
from blackboard_engine import (
    Blackboard, BlackboardOrchestrator, AgentRole,
    create_blackboard_system
)
from agents.content_agents import (
    ContentScraperAgent, KnowledgeExtractorAgent, QuestionCrafterAgent
)
from agents.validation_agents import (
    DistractorGeneratorAgent, QualityValidatorAgent, 
    DifficultyAssessorAgent, PedagogyExpertAgent, FinalReviewerAgent
)

console = Console()

class FactCheckerAgent:
    """Simple fact checker agent"""
    
    def __init__(self, ollama_model: str = "llama2"):
        self.model = ollama_model
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Check factual accuracy"""
        question = blackboard_item.data.get("question", "")
        answer = blackboard_item.data.get("correct_answer", "")
        topic = blackboard_item.data.get("topic", "")
        
        # Simple heuristic check
        accuracy_score = 0.8  # Default
        
        if question and answer:
            # Use AI to verify
            prompt = f"""Is this quiz question and answer factually correct?
Topic: {topic}
Question: {question}
Answer: {answer}

Respond with just: CORRECT, MOSTLY_CORRECT, or INCORRECT"""
            
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.1, "num_predict": 20}
                    },
                    timeout=15
                )
                
                if response.status_code == 200:
                    result = response.json().get('response', '').strip().upper()
                    if "CORRECT" in result:
                        accuracy_score = 0.95 if "MOSTLY" not in result else 0.75
                    elif "INCORRECT" in result:
                        accuracy_score = 0.3
            except:
                pass
        
        return {
            "action": "fact_checked",
            "confidence": 0.8,
            "quality_score": accuracy_score,
            "reasoning": f"Factual accuracy: {accuracy_score:.2%}"
        }

class MultiAgentQuizGenerator:
    """Main orchestrator for multi-agent quiz generation"""
    
    def __init__(self):
        self.blackboard = None
        self.orchestrator = None
        self.db_path = Path("harvest_output") / "multi_agent_quiz.db"
        self.db_path.parent.mkdir(exist_ok=True)
        self.init_database()
        self.setup_system()
    
    def init_database(self):
        """Initialize database for storing generated questions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS multi_agent_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer INTEGER NOT NULL,
                explanation TEXT,
                topic TEXT,
                category TEXT,
                difficulty INTEGER,
                final_score REAL,
                agent_contributions TEXT,
                quality_breakdown TEXT,
                created_at TIMESTAMP,
                blackboard_id TEXT UNIQUE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def setup_system(self):
        """Initialize the blackboard system and register agents"""
        console.print("\n[bold cyan]Initializing Multi-Agent System...[/bold cyan]")
        
        # Create blackboard system
        self.blackboard, self.orchestrator = create_blackboard_system()
        
        # Initialize and register agents
        console.print("\n[cyan]Registering agents...[/cyan]")
        
        # Content agents
        self.blackboard.register_agent(
            AgentRole.CONTENT_SCRAPER, 
            ContentScraperAgent()
        )
        self.blackboard.register_agent(
            AgentRole.KNOWLEDGE_EXTRACTOR,
            KnowledgeExtractorAgent()
        )
        self.blackboard.register_agent(
            AgentRole.QUESTION_CRAFTER,
            QuestionCrafterAgent()
        )
        
        # Validation agents
        self.blackboard.register_agent(
            AgentRole.DISTRACTOR_GENERATOR,
            DistractorGeneratorAgent()
        )
        self.blackboard.register_agent(
            AgentRole.QUALITY_VALIDATOR,
            QualityValidatorAgent()
        )
        self.blackboard.register_agent(
            AgentRole.DIFFICULTY_ASSESSOR,
            DifficultyAssessorAgent()
        )
        self.blackboard.register_agent(
            AgentRole.PEDAGOGY_EXPERT,
            PedagogyExpertAgent()
        )
        self.blackboard.register_agent(
            AgentRole.FACT_CHECKER,
            FactCheckerAgent()
        )
        self.blackboard.register_agent(
            AgentRole.FINAL_REVIEWER,
            FinalReviewerAgent()
        )
        
        console.print("[green]✓ All agents registered successfully[/green]\n")
    
    def generate_question(self, topic: str, category: str, difficulty: int) -> Optional[Dict[str, Any]]:
        """Generate a single question using the multi-agent system"""
        
        # Post request to blackboard
        item_id = self.blackboard.post_item("question_request", {
            "topic": topic,
            "category": category,
            "difficulty_target": difficulty
        })
        
        console.print(f"\n[cyan]Question request posted: {item_id}[/cyan]")
        
        # Process through orchestrator
        self.orchestrator.process_item(item_id)
        
        # Get final result
        item = self.blackboard.get_item(item_id)
        
        if item and item.data.get("approved", False):
            return self._extract_question_data(item)
        
        return None
    
    def _extract_question_data(self, blackboard_item) -> Dict[str, Any]:
        """Extract question data from blackboard item"""
        data = blackboard_item.data
        
        return {
            "question": data.get("question", ""),
            "options": data.get("answer_options", []),
            "correct_answer": data.get("correct_answer_index", 0),
            "explanation": data.get("final_explanation", ""),
            "topic": data.get("topic", ""),
            "category": data.get("category", ""),
            "difficulty": data.get("assessed_difficulty", data.get("difficulty_target", 3)),
            "final_score": data.get("final_score", 0),
            "agent_contributions": blackboard_item.agent_contributions,
            "quality_breakdown": {
                "quality_validation": data.get("quality_total", 0),
                "distractor_quality": data.get("distractor_quality", 0),
                "pedagogy_score": data.get("pedagogy_score", 0),
                "difficulty_match": data.get("difficulty_match", False),
                "factual_accuracy": blackboard_item.quality_scores.get(AgentRole.FACT_CHECKER.value, 0)
            },
            "blackboard_id": blackboard_item.id
        }
    
    def save_question(self, question_data: Dict[str, Any]):
        """Save generated question to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO multi_agent_questions 
                (question, options, correct_answer, explanation, topic, category,
                 difficulty, final_score, agent_contributions, quality_breakdown,
                 created_at, blackboard_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                question_data["question"],
                json.dumps(question_data["options"]),
                question_data["correct_answer"],
                question_data.get("explanation", ""),
                question_data["topic"],
                question_data["category"],
                question_data["difficulty"],
                question_data["final_score"],
                json.dumps(question_data["agent_contributions"]),
                json.dumps(question_data["quality_breakdown"]),
                datetime.now().isoformat(),
                question_data["blackboard_id"]
            ))
            
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()
    
    def interactive_generation(self):
        """Interactive question generation interface"""
        
        console.print("""
[bold cyan]╔══════════════════════════════════════════════════════════╗
║      MULTI-AGENT QUIZ GENERATOR (Blackboard Pattern)      ║
║                                                            ║
║  Features:                                                 ║
║  • Web scraping for real content                          ║
║  • Knowledge extraction and structuring                   ║
║  • AI-powered question crafting                           ║
║  • Intelligent distractor generation                      ║
║  • Multi-layer quality validation                         ║
║  • Pedagogical assessment                                 ║
║  • Iterative refinement                                   ║
╚══════════════════════════════════════════════════════════╝[/bold cyan]
        """)
        
        categories = {
            "1": ("Programming", ["Python", "JavaScript", "Go", "Rust", "Java"]),
            "2": ("Cloud Computing", ["AWS", "Azure", "Docker", "Kubernetes"]),
            "3": ("Databases", ["PostgreSQL", "MongoDB", "Redis", "MySQL"]),
            "4": ("Web Development", ["React", "Vue", "Node.js", "REST APIs"]),
            "5": ("DevOps", ["CI/CD", "Jenkins", "GitHub Actions", "Terraform"])
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
            console.print("Available topics:", ", ".join(topics))
            
            topic = Prompt.ask("Select topic", choices=topics, default=topics[0])
            
            # Difficulty selection
            console.print("\n[yellow]Difficulty levels:[/yellow]")
            console.print("  1 - Basic (Remember/Understand)")
            console.print("  2 - Intermediate (Understand/Apply)")
            console.print("  3 - Advanced (Apply/Analyze)")
            console.print("  4 - Expert (Analyze/Evaluate)")
            console.print("  5 - Master (Evaluate/Create)")
            
            difficulty = int(Prompt.ask("Select difficulty", choices=["1","2","3","4","5"], default="3"))
            
            # Number of questions
            num_questions = int(Prompt.ask("How many questions", default="1"))
            
            # Generate questions
            console.print(f"\n[cyan]Generating {num_questions} question(s) about {topic}...[/cyan]")
            
            generated = []
            for i in range(num_questions):
                console.print(f"\n[bold]Question {i+1}/{num_questions}[/bold]")
                
                with Progress(
                    SpinnerColumn(),
                    TextColumn("[progress.description]{task.description}"),
                    console=console
                ) as progress:
                    task = progress.add_task("[cyan]Multi-agent processing...", total=None)
                    
                    question_data = self.generate_question(topic, category, difficulty)
                    
                    if question_data:
                        generated.append(question_data)
                        self.save_question(question_data)
                        progress.update(task, description="[green]✓ Question generated successfully")
                    else:
                        progress.update(task, description="[red]✗ Generation failed")
            
            # Show results
            if generated:
                self.display_results(generated)
            
            # Continue?
            if not Confirm.ask("\n[yellow]Generate more questions?[/yellow]"):
                break
        
        # Final statistics
        self.display_final_statistics()
    
    def display_results(self, questions: List[Dict[str, Any]]):
        """Display generated questions"""
        
        for q in questions:
            panel_content = f"""
[bold]{q['question']}[/bold]

Options:
"""
            for i, option in enumerate(q['options']):
                marker = "✓" if i == q['correct_answer'] else " "
                panel_content += f"  {marker} {chr(65+i)}. {option}\n"
            
            panel_content += f"""
[dim]Explanation: {q.get('explanation', 'N/A')}[/dim]

Quality Metrics:
• Final Score: {q['final_score']:.2%}
• Difficulty: {q['difficulty']}/5
• Topic: {q['topic']}
"""
            
            console.print(Panel(
                panel_content,
                title=f"Generated Question (Score: {q['final_score']:.2%})",
                border_style="green" if q['final_score'] > 0.8 else "yellow"
            ))
    
    def display_final_statistics(self):
        """Display statistics from the generation session"""
        
        # Get statistics from blackboard
        stats = self.blackboard.get_statistics()
        
        console.print("\n[bold cyan]Session Statistics:[/bold cyan]")
        
        table = Table(show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Total Items Processed", str(stats["total_items"]))
        table.add_row("Completed Questions", str(stats["completed_items"]))
        table.add_row("Questions Rejected", str(stats["rejected_items"]))
        table.add_row("Average Quality", f"{stats['average_quality']:.2%}")
        table.add_row("Items Revised", str(stats["items_in_revision"]))
        
        console.print(table)
        
        # Agent contributions
        if stats["agent_contributions"]:
            console.print("\n[bold cyan]Agent Activity:[/bold cyan]")
            
            contrib_table = Table(show_header=True)
            contrib_table.add_column("Agent", style="cyan")
            contrib_table.add_column("Contributions", style="green")
            
            for agent, count in sorted(stats["agent_contributions"].items(), 
                                      key=lambda x: x[1], reverse=True):
                contrib_table.add_column(agent.replace("_", " ").title(), str(count))
            
            console.print(contrib_table)
        
        # Database statistics
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*), AVG(final_score) FROM multi_agent_questions")
        total_questions, avg_score = cursor.fetchone()
        
        cursor.execute("""
            SELECT category, COUNT(*), AVG(final_score) 
            FROM multi_agent_questions 
            GROUP BY category
        """)
        category_stats = cursor.fetchall()
        
        conn.close()
        
        if total_questions:
            console.print(f"\n[bold cyan]Database Statistics:[/bold cyan]")
            console.print(f"Total Questions: {total_questions}")
            console.print(f"Average Quality: {avg_score:.2%}")
            
            if category_stats:
                console.print("\n[cyan]By Category:[/cyan]")
                for cat, count, avg in category_stats:
                    console.print(f"  • {cat}: {count} questions (avg: {avg:.2%})")

def main():
    """Main entry point"""
    
    # Check if Ollama is running
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        if response.status_code != 200:
            console.print("[red]Ollama is not running! Please start it first.[/red]")
            console.print("Run: ollama serve")
            return
    except:
        console.print("[red]Cannot connect to Ollama. Please ensure it's running.[/red]")
        console.print("Run: ollama serve")
        return
    
    # Create and run generator
    generator = MultiAgentQuizGenerator()
    generator.interactive_generation()

if __name__ == "__main__":
    main()
