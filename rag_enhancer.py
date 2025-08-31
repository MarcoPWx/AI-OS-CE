#!/usr/bin/env python3
"""
RAG (Retrieval-Augmented Generation) Enhancement for Quiz Generation
Uses Qdrant vector database for semantic search and deduplication
"""

import numpy as np
import hashlib
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance, VectorParams, PointStruct, 
        Filter, FieldCondition, Range, MatchValue
    )
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("Warning: Qdrant not installed. Install with: pip install qdrant-client")

try:
    from sentence_transformers import SentenceTransformer
    TRANSFORMER_AVAILABLE = True
except ImportError:
    TRANSFORMER_AVAILABLE = False
    print("Warning: Sentence transformers not installed. Install with: pip install sentence-transformers")

from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

class RAGEnhancer:
    """
    Retrieval-Augmented Generation enhancer for quiz questions
    """
    
    def __init__(self, use_docker: bool = False, qdrant_host: str = "localhost", qdrant_port: int = 6333):
        """
        Initialize RAG enhancer
        
        Args:
            use_docker: Whether Qdrant is running in Docker
            qdrant_host: Qdrant host address
            qdrant_port: Qdrant port
        """
        self.use_docker = use_docker
        
        if not QDRANT_AVAILABLE:
            console.print("[yellow]Warning: Qdrant not available. Running in limited mode.[/yellow]")
            self.client = None
            self.encoder = None
            return
        
        if not TRANSFORMER_AVAILABLE:
            console.print("[yellow]Warning: Sentence transformers not available. Running in limited mode.[/yellow]")
            self.client = None
            self.encoder = None
            return
        
        # Initialize Qdrant client
        if use_docker:
            self.client = QdrantClient(host=qdrant_host, port=qdrant_port)
        else:
            # In-memory mode for testing
            self.client = QdrantClient(":memory:")
        
        # Initialize embedding model
        console.print("[cyan]Loading embedding model...[/cyan]")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_dim = 384  # all-MiniLM-L6-v2 dimension
        
        # Setup collections
        self.setup_collections()
        
        # Cache for embeddings
        self.embedding_cache = {}
        
        console.print("[green]✓ RAG Enhancer initialized successfully[/green]")
    
    def setup_collections(self):
        """Setup Qdrant collections for questions and knowledge"""
        if not self.client:
            return
        
        collections = [
            {
                "name": "quiz_questions",
                "description": "Stores generated quiz questions"
            },
            {
                "name": "knowledge_base",
                "description": "Stores scraped knowledge and documentation"
            },
            {
                "name": "question_patterns",
                "description": "Stores successful question patterns"
            }
        ]
        
        existing_collections = [c.name for c in self.client.get_collections().collections]
        
        for collection in collections:
            if collection["name"] not in existing_collections:
                console.print(f"[cyan]Creating collection: {collection['name']}[/cyan]")
                
                self.client.create_collection(
                    collection_name=collection["name"],
                    vectors_config=VectorParams(
                        size=self.embedding_dim,
                        distance=Distance.COSINE
                    )
                )
                
                # Create indices for efficient filtering
                self.client.create_payload_index(
                    collection_name=collection["name"],
                    field_name="category",
                    field_schema="keyword"
                )
                
                self.client.create_payload_index(
                    collection_name=collection["name"],
                    field_name="difficulty",
                    field_schema="integer"
                )
                
                self.client.create_payload_index(
                    collection_name=collection["name"],
                    field_name="quality_score",
                    field_schema="float"
                )
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for text with caching
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if not self.encoder:
            return np.random.randn(self.embedding_dim)  # Fallback random embedding
        
        # Check cache
        text_hash = hashlib.md5(text.encode()).hexdigest()
        if text_hash in self.embedding_cache:
            return self.embedding_cache[text_hash]
        
        # Generate embedding
        embedding = self.encoder.encode(text, convert_to_numpy=True)
        
        # Cache it
        self.embedding_cache[text_hash] = embedding
        
        return embedding
    
    def index_question(self, question_data: Dict[str, Any]) -> bool:
        """
        Index a question in Qdrant
        
        Args:
            question_data: Question data to index
            
        Returns:
            Success status
        """
        if not self.client:
            return False
        
        try:
            # Generate embedding for question
            text = f"{question_data['question']} {' '.join(question_data.get('options', []))}"
            embedding = self.generate_embedding(text)
            
            # Create unique ID
            question_id = abs(hash(question_data['question'])) % (10**8)
            
            # Create point
            point = PointStruct(
                id=question_id,
                vector=embedding.tolist(),
                payload={
                    "question": question_data['question'],
                    "options": question_data.get('options', []),
                    "correct_answer": question_data.get('correct_answer', 0),
                    "category": question_data.get('category', 'unknown'),
                    "topic": question_data.get('topic', 'unknown'),
                    "difficulty": question_data.get('difficulty', 3),
                    "quality_score": question_data.get('final_score', 0.0),
                    "created_at": question_data.get('created_at', datetime.now().isoformat()),
                    "metadata": question_data.get('metadata', {})
                }
            )
            
            # Upsert to Qdrant
            self.client.upsert(
                collection_name="quiz_questions",
                points=[point]
            )
            
            return True
            
        except Exception as e:
            console.print(f"[red]Error indexing question: {e}[/red]")
            return False
    
    def index_knowledge(self, knowledge_data: Dict[str, Any]) -> bool:
        """
        Index knowledge/documentation in Qdrant
        
        Args:
            knowledge_data: Knowledge to index
            
        Returns:
            Success status
        """
        if not self.client:
            return False
        
        try:
            # Generate embedding
            text = f"{knowledge_data.get('title', '')} {knowledge_data.get('content', '')}"
            embedding = self.generate_embedding(text)
            
            # Create ID
            knowledge_id = abs(hash(text)) % (10**8)
            
            # Create point
            point = PointStruct(
                id=knowledge_id,
                vector=embedding.tolist(),
                payload={
                    "title": knowledge_data.get('title', ''),
                    "content": knowledge_data.get('content', ''),
                    "source": knowledge_data.get('source', ''),
                    "category": knowledge_data.get('category', 'unknown'),
                    "topic": knowledge_data.get('topic', 'unknown'),
                    "type": knowledge_data.get('type', 'documentation'),
                    "created_at": datetime.now().isoformat()
                }
            )
            
            # Upsert to Qdrant
            self.client.upsert(
                collection_name="knowledge_base",
                points=[point]
            )
            
            return True
            
        except Exception as e:
            console.print(f"[red]Error indexing knowledge: {e}[/red]")
            return False
    
    def find_similar_questions(self, query_text: str, category: Optional[str] = None, 
                              limit: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar questions using semantic search
        
        Args:
            query_text: Query text
            category: Optional category filter
            limit: Number of results
            
        Returns:
            List of similar questions with scores
        """
        if not self.client:
            return []
        
        try:
            # Generate query embedding
            query_vector = self.generate_embedding(query_text).tolist()
            
            # Build filter
            filter_conditions = []
            if category:
                filter_conditions.append(
                    FieldCondition(
                        key="category",
                        match=MatchValue(value=category)
                    )
                )
            
            # Search
            results = self.client.search(
                collection_name="quiz_questions",
                query_vector=query_vector,
                query_filter=Filter(must=filter_conditions) if filter_conditions else None,
                limit=limit,
                with_payload=True
            )
            
            # Format results
            similar_questions = []
            for result in results:
                similar_questions.append({
                    "question": result.payload.get("question", ""),
                    "score": result.score,
                    "category": result.payload.get("category", ""),
                    "difficulty": result.payload.get("difficulty", 0),
                    "quality_score": result.payload.get("quality_score", 0)
                })
            
            return similar_questions
            
        except Exception as e:
            console.print(f"[red]Error searching questions: {e}[/red]")
            return []
    
    def check_uniqueness(self, question_text: str, threshold: float = 0.85) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Check if a question is unique enough
        
        Args:
            question_text: Question to check
            threshold: Similarity threshold (0-1)
            
        Returns:
            (is_unique, most_similar_question)
        """
        similar = self.find_similar_questions(question_text, limit=1)
        
        if similar and similar[0]['score'] > threshold:
            return False, similar[0]
        
        return True, None
    
    def get_context_for_topic(self, topic: str, category: str, limit: int = 10) -> Dict[str, Any]:
        """
        Get relevant context for question generation
        
        Args:
            topic: Topic to search
            category: Category to search
            limit: Number of results
            
        Returns:
            Context dictionary with examples and patterns
        """
        if not self.client:
            return {"example_questions": [], "knowledge": [], "patterns": []}
        
        try:
            # Search for relevant questions
            query_vector = self.generate_embedding(f"{topic} {category}").tolist()
            
            # Search questions
            question_results = self.client.search(
                collection_name="quiz_questions",
                query_vector=query_vector,
                query_filter=Filter(
                    must=[
                        FieldCondition(
                            key="quality_score",
                            range=Range(gte=0.8)
                        )
                    ]
                ),
                limit=limit,
                with_payload=True
            )
            
            # Search knowledge
            knowledge_results = self.client.search(
                collection_name="knowledge_base",
                query_vector=query_vector,
                limit=limit//2,
                with_payload=True
            )
            
            # Extract context
            context = {
                "example_questions": [],
                "knowledge": [],
                "common_distractors": [],
                "difficulty_distribution": {},
                "quality_patterns": []
            }
            
            for result in question_results:
                payload = result.payload
                context["example_questions"].append(payload.get("question", ""))
                context["common_distractors"].extend(payload.get("options", []))
                
                diff = payload.get("difficulty", 3)
                context["difficulty_distribution"][diff] = context["difficulty_distribution"].get(diff, 0) + 1
                
                if payload.get("quality_score", 0) >= 0.9:
                    context["quality_patterns"].append({
                        "question": payload.get("question", ""),
                        "structure": self._analyze_question_structure(payload.get("question", ""))
                    })
            
            for result in knowledge_results:
                payload = result.payload
                context["knowledge"].append({
                    "title": payload.get("title", ""),
                    "content": payload.get("content", "")[:500],  # Limit content length
                    "source": payload.get("source", "")
                })
            
            return context
            
        except Exception as e:
            console.print(f"[red]Error getting context: {e}[/red]")
            return {"example_questions": [], "knowledge": [], "patterns": []}
    
    def _analyze_question_structure(self, question: str) -> Dict[str, Any]:
        """
        Analyze question structure for pattern learning
        
        Args:
            question: Question text
            
        Returns:
            Structure analysis
        """
        structure = {
            "starts_with": question.split()[0].lower() if question else "",
            "word_count": len(question.split()),
            "has_code": "```" in question or "code" in question.lower(),
            "question_type": "unknown"
        }
        
        # Determine question type
        if question.lower().startswith(("what", "which")):
            structure["question_type"] = "factual"
        elif question.lower().startswith(("how", "when")):
            structure["question_type"] = "procedural"
        elif question.lower().startswith("why"):
            structure["question_type"] = "conceptual"
        elif "compare" in question.lower() or "difference" in question.lower():
            structure["question_type"] = "comparative"
        
        return structure
    
    def enhance_blackboard_item(self, blackboard_item: Any) -> Any:
        """
        Enhance a blackboard item with RAG context
        
        Args:
            blackboard_item: Item from blackboard
            
        Returns:
            Enhanced blackboard item
        """
        if not self.client:
            return blackboard_item
        
        topic = blackboard_item.data.get("topic", "")
        category = blackboard_item.data.get("category", "")
        
        # Get context from vector database
        context = self.get_context_for_topic(topic, category)
        
        # Add context to blackboard item
        blackboard_item.data["rag_context"] = context
        
        # Check uniqueness if question exists
        if "question" in blackboard_item.data:
            is_unique, similar = self.check_uniqueness(blackboard_item.data["question"])
            
            if not is_unique:
                blackboard_item.data["needs_revision"] = True
                blackboard_item.data["revision_reason"] = f"Too similar (score: {similar['score']:.2f}) to: {similar['question']}"
                console.print(f"[yellow]⚠ Question too similar to existing one (score: {similar['score']:.2f})[/yellow]")
        
        # Add quality insights from similar high-quality questions
        if context["quality_patterns"]:
            blackboard_item.data["quality_insights"] = {
                "avg_word_count": np.mean([p["structure"]["word_count"] for p in context["quality_patterns"]]),
                "common_types": [p["structure"]["question_type"] for p in context["quality_patterns"]],
                "best_practices": self._extract_best_practices(context["quality_patterns"])
            }
        
        return blackboard_item
    
    def _extract_best_practices(self, patterns: List[Dict[str, Any]]) -> List[str]:
        """
        Extract best practices from high-quality patterns
        
        Args:
            patterns: List of quality patterns
            
        Returns:
            List of best practices
        """
        practices = []
        
        # Analyze patterns
        avg_words = np.mean([p["structure"]["word_count"] for p in patterns])
        if 15 <= avg_words <= 30:
            practices.append("Keep questions between 15-30 words")
        
        # Check question types
        types = [p["structure"]["question_type"] for p in patterns]
        if "conceptual" in types and "procedural" in types:
            practices.append("Mix conceptual and procedural questions")
        
        # Check for code examples
        has_code = sum(1 for p in patterns if p["structure"]["has_code"]) / len(patterns)
        if has_code > 0.3:
            practices.append("Include code examples when relevant")
        
        return practices
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get RAG system statistics
        
        Returns:
            Statistics dictionary
        """
        if not self.client:
            return {"status": "offline"}
        
        try:
            # Get collection info
            questions_info = self.client.get_collection("quiz_questions")
            knowledge_info = self.client.get_collection("knowledge_base")
            
            stats = {
                "status": "online",
                "questions_indexed": questions_info.points_count,
                "knowledge_items": knowledge_info.points_count,
                "embedding_cache_size": len(self.embedding_cache),
                "collections": {
                    "quiz_questions": {
                        "count": questions_info.points_count,
                        "vector_dim": questions_info.config.params.vectors.size
                    },
                    "knowledge_base": {
                        "count": knowledge_info.points_count,
                        "vector_dim": knowledge_info.config.params.vectors.size
                    }
                }
            }
            
            return stats
            
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def display_statistics(self):
        """Display RAG statistics in a formatted table"""
        stats = self.get_statistics()
        
        table = Table(title="RAG System Statistics", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Status", stats.get("status", "unknown"))
        
        if stats.get("status") == "online":
            table.add_row("Questions Indexed", str(stats.get("questions_indexed", 0)))
            table.add_row("Knowledge Items", str(stats.get("knowledge_items", 0)))
            table.add_row("Embedding Cache", str(stats.get("embedding_cache_size", 0)))
            
            for collection, info in stats.get("collections", {}).items():
                table.add_row(f"{collection} count", str(info.get("count", 0)))
        
        console.print(table)
    
    def bulk_index_from_database(self, db_path: str, table_name: str = "multi_agent_questions"):
        """
        Bulk index questions from SQLite database
        
        Args:
            db_path: Path to SQLite database
            table_name: Table name to index from
        """
        if not self.client:
            console.print("[red]RAG system not available[/red]")
            return
        
        import sqlite3
        import pandas as pd
        
        console.print(f"[cyan]Indexing questions from {db_path}...[/cyan]")
        
        try:
            conn = sqlite3.connect(db_path)
            df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
            conn.close()
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task(f"[cyan]Indexing {len(df)} questions...", total=len(df))
                
                for _, row in df.iterrows():
                    question_data = {
                        "question": row.get("question", ""),
                        "options": json.loads(row.get("options", "[]")),
                        "correct_answer": row.get("correct_answer", 0),
                        "category": row.get("category", "unknown"),
                        "topic": row.get("topic", "unknown"),
                        "difficulty": row.get("difficulty", 3),
                        "final_score": row.get("final_score", 0.0)
                    }
                    
                    self.index_question(question_data)
                    progress.advance(task)
            
            console.print(f"[green]✓ Indexed {len(df)} questions successfully[/green]")
            
        except Exception as e:
            console.print(f"[red]Error indexing from database: {e}[/red]")


class RAGBenchmark:
    """Benchmark RAG performance"""
    
    def __init__(self, rag_enhancer: RAGEnhancer):
        self.rag = rag_enhancer
        self.results = {}
    
    def run_benchmark(self):
        """Run comprehensive benchmark"""
        console.print("\n[bold cyan]Running RAG Benchmark...[/bold cyan]")
        
        # Test embedding generation
        self._benchmark_embedding()
        
        # Test similarity search
        self._benchmark_search()
        
        # Test uniqueness checking
        self._benchmark_uniqueness()
        
        # Display results
        self._display_results()
    
    def _benchmark_embedding(self):
        """Benchmark embedding generation"""
        import time
        
        test_texts = [
            "What is Python?",
            "How does machine learning work?",
            "Explain the difference between supervised and unsupervised learning",
            "What are the best practices for writing clean code?"
        ]
        
        times = []
        for text in test_texts:
            start = time.time()
            self.rag.generate_embedding(text)
            times.append(time.time() - start)
        
        self.results["embedding"] = {
            "avg_time": np.mean(times),
            "min_time": np.min(times),
            "max_time": np.max(times)
        }
    
    def _benchmark_search(self):
        """Benchmark similarity search"""
        import time
        
        # Index sample questions first
        sample_questions = [
            {
                "question": "What is a Python list comprehension?",
                "category": "Programming",
                "topic": "Python",
                "difficulty": 2,
                "final_score": 0.9
            },
            {
                "question": "How do you implement a binary search tree?",
                "category": "Programming",
                "topic": "Data Structures",
                "difficulty": 3,
                "final_score": 0.85
            }
        ]
        
        for q in sample_questions:
            self.rag.index_question(q)
        
        # Test search
        start = time.time()
        results = self.rag.find_similar_questions("Python list", limit=5)
        search_time = time.time() - start
        
        self.results["search"] = {
            "time": search_time,
            "results_count": len(results)
        }
    
    def _benchmark_uniqueness(self):
        """Benchmark uniqueness checking"""
        import time
        
        test_questions = [
            "What is a Python list comprehension?",  # Should be duplicate
            "How do you create a virtual environment in Python?",  # Should be unique
        ]
        
        times = []
        results = []
        
        for question in test_questions:
            start = time.time()
            is_unique, similar = self.rag.check_uniqueness(question)
            times.append(time.time() - start)
            results.append(is_unique)
        
        self.results["uniqueness"] = {
            "avg_time": np.mean(times),
            "accuracy": sum(1 for i, r in enumerate(results) if r == (i == 1)) / len(results)
        }
    
    def _display_results(self):
        """Display benchmark results"""
        table = Table(title="RAG Performance Benchmark", show_header=True)
        table.add_column("Operation", style="cyan")
        table.add_column("Metric", style="yellow")
        table.add_column("Value", style="green")
        
        # Embedding results
        if "embedding" in self.results:
            table.add_row("Embedding Generation", "Avg Time", f"{self.results['embedding']['avg_time']*1000:.2f}ms")
            table.add_row("", "Min Time", f"{self.results['embedding']['min_time']*1000:.2f}ms")
            table.add_row("", "Max Time", f"{self.results['embedding']['max_time']*1000:.2f}ms")
        
        # Search results
        if "search" in self.results:
            table.add_row("Similarity Search", "Time", f"{self.results['search']['time']*1000:.2f}ms")
            table.add_row("", "Results", str(self.results['search']['results_count']))
        
        # Uniqueness results
        if "uniqueness" in self.results:
            table.add_row("Uniqueness Check", "Avg Time", f"{self.results['uniqueness']['avg_time']*1000:.2f}ms")
            table.add_row("", "Accuracy", f"{self.results['uniqueness']['accuracy']:.0%}")
        
        console.print(table)


def main():
    """Main function for testing RAG enhancer"""
    
    console.print("""
[bold cyan]╔══════════════════════════════════════════════════════════╗
║              RAG ENHANCER FOR QUIZ GENERATION             ║
║                                                            ║
║  Features:                                                 ║
║  • Semantic search with Qdrant                           ║
║  • Automatic deduplication                               ║
║  • Context-aware generation                              ║
║  • Quality pattern learning                              ║
╚══════════════════════════════════════════════════════════╝[/bold cyan]
    """)
    
    # Initialize RAG enhancer
    rag = RAGEnhancer(use_docker=False)  # Use in-memory for testing
    
    # Display statistics
    rag.display_statistics()
    
    # Run benchmark
    benchmark = RAGBenchmark(rag)
    benchmark.run_benchmark()
    
    # Test functionality
    console.print("\n[bold cyan]Testing RAG Functionality:[/bold cyan]")
    
    # Index a sample question
    sample_question = {
        "question": "What is the time complexity of quicksort in the average case?",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        "correct_answer": 1,
        "category": "Computer Science",
        "topic": "Algorithms",
        "difficulty": 3,
        "final_score": 0.92
    }
    
    success = rag.index_question(sample_question)
    console.print(f"Index question: {'✓' if success else '✗'}")
    
    # Check uniqueness
    is_unique, similar = rag.check_uniqueness("What is the time complexity of quicksort?")
    if is_unique:
        console.print("Uniqueness check: Unique")
    else:
        console.print(f"Uniqueness check: Duplicate (score: {similar['score']:.2f})")
    
    # Get context
    context = rag.get_context_for_topic("Algorithms", "Computer Science")
    console.print(f"Context retrieved: {len(context['example_questions'])} examples, {len(context['knowledge'])} knowledge items")
    
    # Final statistics
    console.print("\n[bold cyan]Final Statistics:[/bold cyan]")
    rag.display_statistics()


if __name__ == "__main__":
    main()
