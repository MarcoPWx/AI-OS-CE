#!/usr/bin/env python3
"""
Blackboard Pattern Engine for Multi-Agent Quiz Generation
Coordinates multiple AI agents to create high-quality questions
"""

import json
import time
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from datetime import datetime
import threading
import queue
from pathlib import Path

from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich.layout import Layout

console = Console()

class AgentRole(Enum):
    """Types of agents in the system"""
    CONTENT_SCRAPER = "content_scraper"
    KNOWLEDGE_EXTRACTOR = "knowledge_extractor"
    QUESTION_CRAFTER = "question_crafter"
    DISTRACTOR_GENERATOR = "distractor_generator"
    QUALITY_VALIDATOR = "quality_validator"
    DIFFICULTY_ASSESSOR = "difficulty_assessor"
    FACT_CHECKER = "fact_checker"
    PEDAGOGY_EXPERT = "pedagogy_expert"
    FINAL_REVIEWER = "final_reviewer"

class BlackboardState(Enum):
    """States of items on the blackboard"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    NEEDS_REVISION = "needs_revision"
    VALIDATED = "validated"
    REJECTED = "rejected"
    COMPLETED = "completed"

@dataclass
class BlackboardItem:
    """An item on the blackboard"""
    id: str
    type: str
    state: BlackboardState
    data: Dict[str, Any]
    created_at: str
    updated_at: str
    agent_contributions: Dict[str, Any] = field(default_factory=dict)
    quality_scores: Dict[str, float] = field(default_factory=dict)
    revision_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AgentContribution:
    """A contribution from an agent"""
    agent_role: AgentRole
    timestamp: str
    action: str
    data: Dict[str, Any]
    confidence: float
    reasoning: str

class Blackboard:
    """Central blackboard for multi-agent coordination"""
    
    def __init__(self):
        self.items: Dict[str, BlackboardItem] = {}
        self.lock = threading.Lock()
        self.event_queue = queue.Queue()
        self.agent_registry: Dict[AgentRole, Any] = {}
        self.statistics = {
            "total_items": 0,
            "completed_items": 0,
            "rejected_items": 0,
            "average_quality": 0.0,
            "agent_contributions": {}
        }
    
    def register_agent(self, role: AgentRole, agent):
        """Register an agent with the blackboard"""
        self.agent_registry[role] = agent
        self.statistics["agent_contributions"][role.value] = 0
        console.print(f"[green]✓ Registered agent: {role.value}[/green]")
    
    def post_item(self, item_type: str, data: Dict[str, Any]) -> str:
        """Post a new item to the blackboard"""
        with self.lock:
            item_id = hashlib.md5(
                f"{item_type}{json.dumps(data)}{time.time()}".encode()
            ).hexdigest()[:12]
            
            item = BlackboardItem(
                id=item_id,
                type=item_type,
                state=BlackboardState.PENDING,
                data=data,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            self.items[item_id] = item
            self.statistics["total_items"] += 1
            self.event_queue.put(("new_item", item_id))
            
            return item_id
    
    def get_item(self, item_id: str) -> Optional[BlackboardItem]:
        """Get an item from the blackboard"""
        return self.items.get(item_id)
    
    def update_item(self, item_id: str, updates: Dict[str, Any], 
                   agent_role: AgentRole = None):
        """Update an item on the blackboard"""
        with self.lock:
            if item_id in self.items:
                item = self.items[item_id]
                
                # Update data
                for key, value in updates.items():
                    if key == "state":
                        item.state = value
                    elif key == "data":
                        item.data.update(value)
                    elif key == "quality_score":
                        item.quality_scores[agent_role.value] = value
                    else:
                        setattr(item, key, value)
                
                item.updated_at = datetime.now().isoformat()
                
                # Track agent contribution
                if agent_role:
                    self.statistics["agent_contributions"][agent_role.value] += 1
                
                self.event_queue.put(("item_updated", item_id))
    
    def add_contribution(self, item_id: str, contribution: AgentContribution):
        """Add an agent's contribution to an item"""
        with self.lock:
            if item_id in self.items:
                item = self.items[item_id]
                role = contribution.agent_role.value
                
                if role not in item.agent_contributions:
                    item.agent_contributions[role] = []
                
                item.agent_contributions[role].append(asdict(contribution))
                item.updated_at = datetime.now().isoformat()
    
    def get_pending_items(self, item_type: str = None, 
                         for_agent: AgentRole = None) -> List[BlackboardItem]:
        """Get pending items, optionally filtered"""
        items = []
        
        for item in self.items.values():
            if item.state == BlackboardState.PENDING:
                if item_type and item.type != item_type:
                    continue
                    
                # Check if this agent has already processed this item
                if for_agent and for_agent.value in item.agent_contributions:
                    continue
                    
                items.append(item)
        
        return items
    
    def get_items_needing_revision(self) -> List[BlackboardItem]:
        """Get items that need revision"""
        return [
            item for item in self.items.values()
            if item.state == BlackboardState.NEEDS_REVISION
        ]
    
    def calculate_item_quality(self, item_id: str) -> float:
        """Calculate overall quality score for an item"""
        if item_id not in self.items:
            return 0.0
        
        item = self.items[item_id]
        if not item.quality_scores:
            return 0.0
        
        # Weighted average based on agent importance
        weights = {
            AgentRole.QUALITY_VALIDATOR.value: 2.0,
            AgentRole.FACT_CHECKER.value: 1.8,
            AgentRole.PEDAGOGY_EXPERT.value: 1.5,
            AgentRole.DIFFICULTY_ASSESSOR.value: 1.2,
            AgentRole.FINAL_REVIEWER.value: 2.5
        }
        
        total_score = 0
        total_weight = 0
        
        for agent, score in item.quality_scores.items():
            weight = weights.get(agent, 1.0)
            total_score += score * weight
            total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get blackboard statistics"""
        completed = [i for i in self.items.values() 
                    if i.state == BlackboardState.COMPLETED]
        rejected = [i for i in self.items.values() 
                   if i.state == BlackboardState.REJECTED]
        
        avg_quality = 0
        if completed:
            qualities = [self.calculate_item_quality(i.id) for i in completed]
            avg_quality = sum(qualities) / len(qualities)
        
        self.statistics.update({
            "completed_items": len(completed),
            "rejected_items": len(rejected),
            "average_quality": avg_quality,
            "pending_items": len(self.get_pending_items()),
            "items_in_revision": len(self.get_items_needing_revision())
        })
        
        return self.statistics
    
    def display_status(self):
        """Display current blackboard status"""
        stats = self.get_statistics()
        
        table = Table(title="Blackboard Status", show_header=True)
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Total Items", str(stats["total_items"]))
        table.add_row("Completed", str(stats["completed_items"]))
        table.add_row("Pending", str(stats["pending_items"]))
        table.add_row("In Revision", str(stats["items_in_revision"]))
        table.add_row("Rejected", str(stats["rejected_items"]))
        table.add_row("Avg Quality", f"{stats['average_quality']:.2%}")
        
        console.print(table)
        
        # Agent contributions
        if stats["agent_contributions"]:
            contrib_table = Table(title="Agent Contributions", show_header=True)
            contrib_table.add_column("Agent", style="cyan")
            contrib_table.add_column("Contributions", style="green")
            
            for agent, count in stats["agent_contributions"].items():
                contrib_table.add_row(agent, str(count))
            
            console.print(contrib_table)

class BlackboardOrchestrator:
    """Orchestrates the multi-agent process"""
    
    def __init__(self, blackboard: Blackboard):
        self.blackboard = blackboard
        self.running = False
        self.threads = []
        self.processing_pipeline = [
            AgentRole.CONTENT_SCRAPER,
            AgentRole.KNOWLEDGE_EXTRACTOR,
            AgentRole.QUESTION_CRAFTER,
            AgentRole.DISTRACTOR_GENERATOR,
            AgentRole.DIFFICULTY_ASSESSOR,
            AgentRole.QUALITY_VALIDATOR,
            AgentRole.FACT_CHECKER,
            AgentRole.PEDAGOGY_EXPERT,
            AgentRole.FINAL_REVIEWER
        ]
    
    def process_item(self, item_id: str):
        """Process an item through the agent pipeline"""
        item = self.blackboard.get_item(item_id)
        if not item:
            return
        
        console.print(f"\n[cyan]Processing item {item_id}...[/cyan]")
        
        # Run through each agent in the pipeline
        for agent_role in self.processing_pipeline:
            if agent_role not in self.blackboard.agent_registry:
                continue
            
            agent = self.blackboard.agent_registry[agent_role]
            
            # Skip if agent has already processed this item
            if agent_role.value in item.agent_contributions:
                continue
            
            try:
                # Process with agent
                console.print(f"  → {agent_role.value} processing...")
                result = agent.process(item)
                
                if result:
                    # Add contribution
                    contribution = AgentContribution(
                        agent_role=agent_role,
                        timestamp=datetime.now().isoformat(),
                        action=result.get("action", "processed"),
                        data=result.get("data", {}),
                        confidence=result.get("confidence", 0.8),
                        reasoning=result.get("reasoning", "")
                    )
                    
                    self.blackboard.add_contribution(item_id, contribution)
                    
                    # Update item based on result
                    if "updates" in result:
                        self.blackboard.update_item(
                            item_id, 
                            result["updates"],
                            agent_role
                        )
                    
                    # Check if item needs revision
                    if result.get("needs_revision", False):
                        self.blackboard.update_item(
                            item_id,
                            {"state": BlackboardState.NEEDS_REVISION},
                            agent_role
                        )
                        console.print(f"    [yellow]! Needs revision[/yellow]")
                        break
                    
                    # Update quality score
                    if "quality_score" in result:
                        self.blackboard.update_item(
                            item_id,
                            {"quality_score": result["quality_score"]},
                            agent_role
                        )
                
            except Exception as e:
                console.print(f"    [red]✗ Error: {e}[/red]")
        
        # Final assessment
        quality = self.blackboard.calculate_item_quality(item_id)
        
        if quality >= 0.8:
            self.blackboard.update_item(
                item_id,
                {"state": BlackboardState.COMPLETED}
            )
            console.print(f"[green]✓ Item completed with quality: {quality:.2%}[/green]")
        elif quality >= 0.6 and item.revision_count < 3:
            self.blackboard.update_item(
                item_id,
                {
                    "state": BlackboardState.NEEDS_REVISION,
                    "revision_count": item.revision_count + 1
                }
            )
            console.print(f"[yellow]⟳ Item needs revision (quality: {quality:.2%})[/yellow]")
        else:
            self.blackboard.update_item(
                item_id,
                {"state": BlackboardState.REJECTED}
            )
            console.print(f"[red]✗ Item rejected (quality: {quality:.2%})[/red]")
    
    def run(self, max_iterations: int = 10):
        """Run the orchestrator"""
        self.running = True
        iterations = 0
        
        console.print("\n[bold cyan]Starting Blackboard Orchestrator[/bold cyan]")
        
        while self.running and iterations < max_iterations:
            # Process pending items
            pending = self.blackboard.get_pending_items()
            
            for item in pending:
                self.process_item(item.id)
            
            # Process items needing revision
            revisions = self.blackboard.get_items_needing_revision()
            
            for item in revisions:
                console.print(f"\n[yellow]Revising item {item.id}...[/yellow]")
                self.blackboard.update_item(
                    item.id,
                    {"state": BlackboardState.PENDING}
                )
                self.process_item(item.id)
            
            iterations += 1
            
            # Check if we have work to do
            if not pending and not revisions:
                console.print("\n[green]No more items to process[/green]")
                break
            
            time.sleep(0.5)
        
        self.running = False
        
        # Display final statistics
        console.print("\n[bold cyan]Final Statistics:[/bold cyan]")
        self.blackboard.display_status()

def create_blackboard_system() -> Tuple[Blackboard, BlackboardOrchestrator]:
    """Create and initialize the blackboard system"""
    blackboard = Blackboard()
    orchestrator = BlackboardOrchestrator(blackboard)
    
    console.print("""
[bold cyan]╔══════════════════════════════════════════════════════════╗
║         BLACKBOARD PATTERN MULTI-AGENT SYSTEM             ║
║                                                            ║
║  Features:                                                 ║
║  • Coordinated multi-agent processing                     ║
║  • Quality validation at each step                        ║
║  • Iterative refinement                                   ║
║  • Comprehensive reasoning                                ║
╚══════════════════════════════════════════════════════════╝[/bold cyan]
    """)
    
    return blackboard, orchestrator

if __name__ == "__main__":
    # Example usage
    blackboard, orchestrator = create_blackboard_system()
    
    # Add sample item
    item_id = blackboard.post_item("question_request", {
        "topic": "Python",
        "category": "Programming",
        "difficulty_target": 3
    })
    
    console.print(f"Posted item: {item_id}")
    blackboard.display_status()
