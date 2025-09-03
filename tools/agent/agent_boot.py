#!/usr/bin/env python3
"""
Agent Boot System - Reference Implementation
============================================
A complete learning platform, not just a utility script.
Production-ready patterns that are educational by design.

WHY THIS EXISTS:
- Demonstrates microservice architecture patterns
- Shows complete business logic implementation
- Teaches through working examples
- Provides real development tools

ARCHITECTURAL DECISIONS:
- Modular design for maintainability
- Async-first for scalability
- Type hints for clarity
- Comprehensive error handling
- Performance optimized from start
"""

import asyncio
import json
import logging
import os
import sys
import subprocess
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, auto
from pathlib import Path
from typing import Any, Dict, List, Optional, Protocol, TypedDict, Union
import hashlib
import time
from functools import lru_cache, wraps
from contextlib import asynccontextmanager

# Performance: Configure logging efficiently
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('agent_boot.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# CORE PATTERNS - Teaching through implementation
# ============================================================================

class AgentStatus(Enum):
    """Status states following finite state machine pattern"""
    INITIALIZING = auto()
    READY = auto()
    RUNNING = auto()
    ERROR = auto()
    COMPLETED = auto()
    SHUTTING_DOWN = auto()

class Priority(Enum):
    """Task priority levels for queue management"""
    CRITICAL = 1
    HIGH = 2
    NORMAL = 3
    LOW = 4
    DEFERRED = 5

# Type definitions for clarity and IDE support
class ConfigDict(TypedDict):
    """Configuration structure - explicit is better than implicit"""
    project_root: str
    canonical_docs: Dict[str, str]
    test_coverage_threshold: float
    performance_budget_ms: int
    cache_ttl_seconds: int
    max_retries: int
    enable_telemetry: bool
    emit_events: bool
    events_file: str

class TaskResult(TypedDict):
    """Standard result structure for all operations"""
    success: bool
    data: Optional[Any]
    error: Optional[str]
    duration_ms: float
    timestamp: str

# ============================================================================
# PERFORMANCE UTILITIES - Optimize from the start
# ============================================================================

def measure_performance(func):
    """
    Decorator to measure function performance.
    WHY: Performance metrics should be built-in, not bolted on.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        try:
            result = await func(*args, **kwargs)
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.debug(f"{func.__name__} completed in {duration_ms:.2f}ms")
            return result
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(f"{func.__name__} failed after {duration_ms:.2f}ms: {e}")
            raise
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        try:
            result = func(*args, **kwargs)
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.debug(f"{func.__name__} completed in {duration_ms:.2f}ms")
            return result
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(f"{func.__name__} failed after {duration_ms:.2f}ms: {e}")
            raise
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

@lru_cache(maxsize=128)
def get_file_hash(filepath: Path) -> str:
    """
    Cache file hashes for change detection.
    WHY: Avoid redundant file reads for unchanged content.
    """
    if not filepath.exists():
        return ""
    
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

# ============================================================================
# CORE AGENT SYSTEM - Complete implementation
# ============================================================================

@dataclass
class AgentContext:
    """
    Complete context for agent operations.
    WHY: Single source of truth for all agent state.
    """
    status: AgentStatus = AgentStatus.INITIALIZING
    config: ConfigDict = field(default_factory=dict)
    tasks_completed: List[str] = field(default_factory=list)
    errors: List[Dict[str, Any]] = field(default_factory=list)
    metrics: Dict[str, float] = field(default_factory=dict)
    session_id: str = field(default_factory=lambda: hashlib.sha256(
        f"{datetime.now(timezone.utc).isoformat()}".encode()
    ).hexdigest()[:8])
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize context for logging/persistence"""
        return {
            'session_id': self.session_id,
            'status': self.status.name,
            'tasks_completed': len(self.tasks_completed),
            'errors': len(self.errors),
            'metrics': self.metrics
        }

class AgentModule(Protocol):
    """
    Protocol for all agent modules.
    WHY: Enforce consistent interface across all components.
    """
    async def initialize(self, context: AgentContext) -> None: ...
    async def execute(self, task: Dict[str, Any]) -> TaskResult: ...
    async def shutdown(self) -> None: ...

# ============================================================================
# GITHUB INTEGRATION - Full GitHub API integration
# ============================================================================

class GitHubIntegration:
    """
    GitHub API integration for issue and PR management.
    WHY: Seamless integration with GitHub workflow.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.repo = self._get_repo_info()
    
    def _get_repo_info(self) -> Dict[str, str]:
        """Extract GitHub repo info from git remote"""
        try:
            result = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'],
                capture_output=True, text=True, check=True
            )
            url = result.stdout.strip()
            # Parse owner/repo from URL
            match = re.search(r'github\.com[:/]([^/]+)/([^.]+)', url)
            if match:
                return {'owner': match.group(1), 'repo': match.group(2).replace('.git', '')}
        except Exception as e:
            logger.warning(f"Could not get repo info: {e}")
        return {'owner': '', 'repo': ''}
    
    async def create_issue(self, title: str, body: str, labels: List[str] = None) -> TaskResult:
        """
        Create a GitHub issue using gh CLI.
        WHY: Direct integration with development workflow.
        """
        try:
            cmd = ['gh', 'issue', 'create', '--title', title, '--body', body]
            if labels:
                cmd.extend(['--label', ','.join(labels)])
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                issue_url = result.stdout.strip()
                logger.info(f"✅ Created GitHub issue: {issue_url}")
                return TaskResult(
                    success=True,
                    data={'url': issue_url},
                    error=None,
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            else:
                raise Exception(result.stderr)
        except Exception as e:
            logger.error(f"Failed to create issue: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def list_issues(self, state: str = 'open') -> List[Dict[str, Any]]:
        """List GitHub issues"""
        try:
            result = subprocess.run(
                ['gh', 'issue', 'list', '--state', state, '--json', 'number,title,state,labels'],
                capture_output=True, text=True, check=True
            )
            return json.loads(result.stdout)
        except Exception as e:
            logger.error(f"Failed to list issues: {e}")
            return []

# ============================================================================
# USER JOURNEY: Documentation Management with Auto-Update
# ============================================================================

class DocumentationManager:
    """
    Complete documentation management system with auto-update capabilities.
    WHY: Documentation is code - treat it as first-class citizen.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.docs_path = Path(context.config.get('project_root', '.')) / 'docs'
        self.cache: Dict[str, tuple[str, str]] = {}  # path -> (hash, content)
    
    @measure_performance
    async def update_devlog(self, entry: str, auto_commit: bool = True) -> TaskResult:
        """
        Append to DEVLOG with proper formatting and optional auto-commit.
        WHY: Consistent documentation format enables automation.
        """
        try:
            devlog_path = self.docs_path / 'status' / 'DEVLOG.md'
            
            # Read existing content with caching
            current_hash = get_file_hash(devlog_path)
            if devlog_path.as_posix() in self.cache:
                cached_hash, cached_content = self.cache[devlog_path.as_posix()]
                if cached_hash == current_hash:
                    content = cached_content
                else:
                    content = devlog_path.read_text() if devlog_path.exists() else ""
                    self.cache[devlog_path.as_posix()] = (current_hash, content)
            else:
                content = devlog_path.read_text() if devlog_path.exists() else ""
                self.cache[devlog_path.as_posix()] = (current_hash, content)
            
            # Format new entry with proper structure
            date_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
            formatted_entry = f"\n## {date_str}: Agent Boot Session {self.context.session_id}\n\n{entry}\n"
            
            # Atomic write operation
            devlog_path.parent.mkdir(parents=True, exist_ok=True)
            with open(devlog_path, 'a', encoding='utf-8') as f:
                f.write(formatted_entry)
            
            # Invalidate cache
            if devlog_path.as_posix() in self.cache:
                del self.cache[devlog_path.as_posix()]
            
            return TaskResult(
                success=True,
                data={'path': str(devlog_path), 'entry_size': len(formatted_entry)},
                error=None,
                duration_ms=0,  # Set by decorator
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to update devlog: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    @measure_performance
    async def update_system_status(self) -> TaskResult:
        """
        Update system status with current metrics.
        WHY: Live monitoring enables proactive maintenance.
        """
        try:
            status_path = self.docs_path / 'SYSTEM_STATUS.md'
            
            # Generate comprehensive status report
            status_content = f"""# System Status

Last Updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
Session ID: {self.context.session_id}

## Current Status
- Agent Status: {self.context.status.name}
- Tasks Completed: {len(self.context.tasks_completed)}
- Active Errors: {len(self.context.errors)}

## Performance Metrics
"""
            
            for metric_name, value in self.context.metrics.items():
                status_content += f"- {metric_name}: {value:.2f}\n"
            
            # Add test coverage if available
            coverage_file = Path('coverage/coverage-summary.json')
            if coverage_file.exists():
                try:
                    coverage_data = json.loads(coverage_file.read_text())
                    status_content += f"""
## Test Coverage
- Lines: {coverage_data.get('total', {}).get('lines', {}).get('pct', 0)}%
- Branches: {coverage_data.get('total', {}).get('branches', {}).get('pct', 0)}%
- Functions: {coverage_data.get('total', {}).get('functions', {}).get('pct', 0)}%
- Statements: {coverage_data.get('total', {}).get('statements', {}).get('pct', 0)}%
"""
                except Exception as e:
                    logger.warning(f"Could not parse coverage data: {e}")
            
            # Write atomically
            status_path.parent.mkdir(parents=True, exist_ok=True)
            status_path.write_text(status_content)
            
            return TaskResult(
                success=True,
                data={'path': str(status_path)},
                error=None,
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to update system status: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )

# ============================================================================
# GITHUB INTEGRATION: Issue and PR Management
# ============================================================================

import subprocess
import shlex

class GitHubIntegration:
    """
    GitHub API integration for issue and PR management.
    WHY: Automate GitHub workflows directly from agent.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.gh_available = self._check_gh_cli()
    
    def _check_gh_cli(self) -> bool:
        """Check if GitHub CLI is available and authenticated"""
        try:
            result = subprocess.run(
                ['gh', 'auth', 'status'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.warning("GitHub CLI not available or not authenticated")
            return False
    
    async def create_issue_from_epic(self, epic: 'Epic') -> TaskResult:
        """
        Create GitHub issue from epic.
        WHY: Sync project management with GitHub.
        """
        if not self.gh_available:
            return TaskResult(
                success=False,
                data=None,
                error="GitHub CLI not available",
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        
        try:
            # Map priority to GitHub labels
            priority_label = f"priority:p{epic.priority.value - 1}"
            
            # Create issue body
            body = f"""{epic.description}

## Acceptance Criteria
- [ ] Implementation complete
- [ ] Tests added
- [ ] Documentation updated

## Epic Details
- **Status:** {epic.status}
- **Completion:** {epic.completion_percentage}%
- **Created:** {epic.created_at}
"""
            
            # Execute gh command
            cmd = [
                'gh', 'issue', 'create',
                '--title', f"📋 {epic.title}",
                '--body', body,
                '--label', priority_label
            ]
            
            if epic.tags:
                for tag in epic.tags:
                    cmd.extend(['--label', tag])
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                # Extract issue number from output
                issue_url = result.stdout.strip()
                issue_number = issue_url.split('/')[-1] if issue_url else None
                
                return TaskResult(
                    success=True,
                    data={'issue_number': issue_number, 'url': issue_url},
                    error=None,
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            else:
                return TaskResult(
                    success=False,
                    data=None,
                    error=result.stderr,
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
        except Exception as e:
            logger.error(f"Failed to create GitHub issue: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def check_pr_status(self) -> TaskResult:
        """
        Check status of open PRs.
        WHY: Monitor PR health and CI status.
        """
        if not self.gh_available:
            return TaskResult(
                success=False,
                data=None,
                error="GitHub CLI not available",
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        
        try:
            # Get PR list
            result = subprocess.run(
                ['gh', 'pr', 'list', '--json', 'number,title,state,statusCheckRollup'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                prs = json.loads(result.stdout) if result.stdout else []
                
                pr_summary = {
                    'total': len(prs),
                    'passing': 0,
                    'failing': 0,
                    'pending': 0,
                    'details': []
                }
                
                for pr in prs:
                    status = 'unknown'
                    checks = pr.get('statusCheckRollup', [])
                    
                    if checks:
                        if all(check.get('conclusion') == 'SUCCESS' for check in checks):
                            status = 'passing'
                            pr_summary['passing'] += 1
                        elif any(check.get('conclusion') == 'FAILURE' for check in checks):
                            status = 'failing'
                            pr_summary['failing'] += 1
                        else:
                            status = 'pending'
                            pr_summary['pending'] += 1
                    
                    pr_summary['details'].append({
                        'number': pr['number'],
                        'title': pr['title'],
                        'status': status
                    })
                
                return TaskResult(
                    success=True,
                    data=pr_summary,
                    error=None,
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            else:
                return TaskResult(
                    success=False,
                    data=None,
                    error=result.stderr,
                    duration_ms=0,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
        except Exception as e:
            logger.error(f"Failed to check PR status: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )

# ============================================================================
# DEV TOOLS: Epic Manager
# ============================================================================

@dataclass
class Epic:
    """
    Epic data structure with complete business logic.
    WHY: Real project management requires structured data.
    """
    id: str
    title: str
    description: str
    status: str = "TODO"
    priority: Priority = Priority.NORMAL
    assignee: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    tags: List[str] = field(default_factory=list)
    completion_percentage: float = 0.0
    acceptance_criteria: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority.value,
            'assignee': self.assignee,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'tags': self.tags,
            'completion_percentage': self.completion_percentage,
            'acceptance_criteria': self.acceptance_criteria
        }

class EpicManager:
    """
    Complete epic management with CRUD operations.
    WHY: Demonstrates state management patterns.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.epics_path = Path(context.config.get('project_root', '.')) / 'docs' / 'roadmap' / 'EPICS.md'
        self.epics: Dict[str, Epic] = {}
        self.github_issues: Dict[str, str] = {}  # epic_id -> issue_number
        self._load_epics()
    
    def _load_epics(self) -> None:
        """Load epics from markdown with error recovery and field parsing"""
        if not self.epics_path.exists():
            logger.info("No existing epics file found, starting fresh")
            return
        
        try:
            content = self.epics_path.read_text()
            current_epic: Optional[Epic] = None
            description_lines: List[str] = []
            
            def finalize_current():
                nonlocal current_epic, description_lines
                if current_epic is not None:
                    # Attach accumulated description (trim trailing whitespace)
                    desc = "\n".join(description_lines).strip()
                    current_epic.description = desc
                    # Recalculate completion from criteria if present
                    if current_epic.acceptance_criteria:
                        done = sum(1 for c in current_epic.acceptance_criteria if c.get('completed'))
                        total = len(current_epic.acceptance_criteria)
                        current_epic.completion_percentage = float(int((done / total) * 100)) if total else current_epic.completion_percentage
                    self.epics[current_epic.id] = current_epic
                # Reset
                current_epic = None
                description_lines = []
            
            for raw in content.split('\n'):
                line = raw.strip()
                if line.startswith('## '):
                    # New epic section: finalize previous
                    finalize_current()
                    header = line[3:].strip()
                    # Support both "EPIC-###: Title" and "Title"
                    if ':' in header and re.match(r'^[A-Za-z0-9_-]+:\s+.+', header):
                        id_part, title_part = header.split(':', 1)
                        epic_id = id_part.strip()
                        title = title_part.strip()
                    else:
                        title = header
                        epic_id = hashlib.md5(title.encode()).hexdigest()[:8]
                    current_epic = Epic(id=epic_id, title=title, description="")
                    continue
                
                if current_epic is None:
                    continue
                
                if line.startswith('**Status:**'):
                    status_val = line.split('**Status:**', 1)[1].strip().replace('  ', '').strip()
                    if status_val in ['TODO', 'IN_PROGRESS', 'DONE']:
                        current_epic.status = status_val
                    continue
                
                if line.startswith('**Priority:**'):
                    pr_str = line.split('**Priority:**', 1)[1].strip().replace('  ', '').strip()
                    try:
                        current_epic.priority = Priority[pr_str]
                    except Exception:
                        pass
                    continue
                
                if line.startswith('**Completion:**'):
                    comp = line.split('**Completion:**', 1)[1].strip().replace('%', '').replace('  ', '').strip()
                    try:
                        current_epic.completion_percentage = float(comp)
                    except Exception:
                        pass
                    continue
                
                if line.startswith('**Created:**'):
                    current_epic.created_at = line.split('**Created:**', 1)[1].strip()
                    continue
                
                if line.startswith('**Updated:**'):
                    current_epic.updated_at = line.split('**Updated:**', 1)[1].strip()
                    continue
                
                # Acceptance Criteria header (skip adding to description)
                if line.startswith('#### Acceptance Criteria'):
                    continue
                # Acceptance criteria checkboxes "- [ ] desc" or "- [x] desc"
                m = re.match(r'^- \[( |x|X)\] (.*)$', line)
                if m:
                    completed = m.group(1).lower() == 'x'
                    desc = m.group(2).strip()
                    current_epic.acceptance_criteria.append({'description': desc, 'completed': completed})
                    continue
                
                if line.startswith('---'):
                    # End of epic section (finalize when we see the next header)
                    continue
                
                # Accumulate description lines (preserve paragraph breaks)
                description_lines.append(raw if raw != '' else '')
            
            # Finalize last epic
            finalize_current()
        except Exception as e:
            logger.error(f"Failed to load epics: {e}")
    
    def find_epic_by_title(self, title: str) -> Optional[Epic]:
        """Find epic by title."""
        for epic in self.epics.values():
            if epic.title == title:
                return epic
        return None
    
    @measure_performance
    async def update_epic(self, epic_id: str, status: Optional[str] = None, 
                          completion: Optional[int] = None,
                          add_criteria: Optional[List[str]] = None,
                          check_indices: Optional[List[int]] = None,
                          uncheck_indices: Optional[List[int]] = None) -> TaskResult:
        """
        Update existing epic status, progress, and acceptance criteria.
        WHY: Track project progress over time.
        """
        try:
            if epic_id not in self.epics:
                raise ValueError(f"Epic {epic_id} not found")
            
            epic = self.epics[epic_id]
            updated = False
            
            if add_criteria:
                for c in add_criteria:
                    if c and c.strip():
                        epic.acceptance_criteria.append({'description': c.strip(), 'completed': False})
                        updated = True
            
            if check_indices:
                for idx in check_indices:
                    if 0 <= idx < len(epic.acceptance_criteria):
                        epic.acceptance_criteria[idx]['completed'] = True
                        updated = True
            
            if uncheck_indices:
                for idx in uncheck_indices:
                    if 0 <= idx < len(epic.acceptance_criteria):
                        epic.acceptance_criteria[idx]['completed'] = False
                        updated = True
            
            if status and status != epic.status:
                epic.status = status
                updated = True
                
                # Auto-update completion based on status
                if status == 'DONE' and completion is None:
                    epic.completion_percentage = 100.0
                elif status == 'IN_PROGRESS' and completion is None and not epic.acceptance_criteria:
                    epic.completion_percentage = max(epic.completion_percentage, 50.0)
            
            if completion is not None:
                epic.completion_percentage = float(min(100, max(0, completion)))
                updated = True
            
            # Recalculate completion from criteria if any were added/changed and completion not explicitly provided
            if (add_criteria or check_indices or uncheck_indices) and completion is None:
                done = sum(1 for c in epic.acceptance_criteria if c.get('completed'))
                total = len(epic.acceptance_criteria)
                epic.completion_percentage = float(int((done / total) * 100)) if total else epic.completion_percentage
            
            if updated:
                epic.updated_at = datetime.now(timezone.utc).isoformat()
                await self._persist_epics()
                
                # Update GitHub issue if it exists
                if epic_id in self.github_issues:
                    await self._update_github_issue(epic_id, epic)
            
            return TaskResult(
                success=True,
                data=epic.to_dict(),
                error=None,
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to update epic: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def _update_github_issue(self, epic_id: str, epic: Epic) -> None:
        """
        Update GitHub issue with epic progress.
        WHY: Keep GitHub in sync with local state.
        """
        try:
            issue_number = self.github_issues.get(epic_id)
            if not issue_number:
                return
            
            # Create progress bar
            progress = int(epic.completion_percentage)
            filled = '█' * (progress // 10)
            empty = '░' * (10 - (progress // 10))
            progress_bar = f"[{filled}{empty}] {progress}%"
            
            # Create comment body
            comment = f"""
### 📊 Epic Progress Update

**Status:** {epic.status}
**Progress:** {progress_bar}
**Updated:** {epic.updated_at}

---
*Updated by Agent Boot*
"""
            
            # Post comment to issue
            cmd = ['gh', 'issue', 'comment', issue_number, '--body', comment]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"Updated GitHub issue #{issue_number} with progress")
            else:
                logger.warning(f"Could not update GitHub issue: {result.stderr}")
                
        except Exception as e:
            logger.warning(f"GitHub update failed (non-critical): {e}")
    
    @measure_performance
    async def list_epics(self) -> TaskResult:
        """
        List all epics with their status.
        WHY: Overview of project state.
        """
        try:
            epic_list = []
            for epic in self.epics.values():
                epic_summary = {
                    'id': epic.id,
                    'title': epic.title,
                    'status': epic.status,
                    'completion': f"{epic.completion_percentage:.0f}%",
                    'github_issue': self.github_issues.get(epic.id)
                }
                epic_list.append(epic_summary)
            
            # Sort by status and completion
            epic_list.sort(key=lambda x: (x['status'] != 'IN_PROGRESS', x['status'] == 'DONE', x['title']))
            
            return TaskResult(
                success=True,
                data={'epics': epic_list, 'total': len(epic_list)},
                error=None,
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to list epics: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    @measure_performance
    async def sync_with_github(self) -> TaskResult:
        """
        Sync epic status with GitHub issues.
        WHY: Keep local and remote state consistent.
        """
        try:
            synced = 0
            
            # Get all issues
            result = subprocess.run(
                ['gh', 'issue', 'list', '--state', 'all', '--json', 'number,title,state,body'],
                capture_output=True, text=True
            )
            
            if result.returncode != 0:
                raise Exception(f"GitHub CLI failed: {result.stderr}")
            
            issues = json.loads(result.stdout) if result.stdout else []
            
            # Match issues to epics by title
            for issue in issues:
                for epic_id, epic in self.epics.items():
                    if epic.title in issue['title']:
                        # Update epic status based on issue state
                        if issue['state'] == 'CLOSED':
                            epic.status = 'DONE'
                            epic.completion_percentage = 100.0
                        elif issue['state'] == 'OPEN' and epic.status == 'TODO':
                            epic.status = 'IN_PROGRESS'
                            epic.completion_percentage = max(epic.completion_percentage, 10.0)
                        
                        # Store issue number
                        self.github_issues[epic_id] = str(issue['number'])
                        synced += 1
                        break
            
            # Save updates
            if synced > 0:
                await self._persist_epics()
            
            return TaskResult(
                success=True,
                data={'synced': synced, 'total_issues': len(issues)},
                error=None,
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"GitHub sync failed: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    @measure_performance
    async def create_epic(self, title: str, description: str, criteria: Optional[List[str]] = None, **kwargs) -> TaskResult:
        """
        Create new epic with validation.
        WHY: Input validation prevents downstream errors.
        """
        try:
            # Validate input
            if not title or len(title) < 3:
                raise ValueError("Title must be at least 3 characters")
            
            if len(title) > 200:
                raise ValueError("Title must be less than 200 characters")
            
            # Prefer EPIC-### style IDs; compute next number
            next_num = 1
            for e in self.epics.values():
                if isinstance(e.id, str) and e.id.startswith('EPIC-'):
                    try:
                        num = int(e.id.split('-')[1])
                        next_num = max(next_num, num + 1)
                    except Exception:
                        continue
            epic_id = f"EPIC-{next_num:03d}"
            
            # If an epic with same title exists (legacy md5-id path), update it instead
            existing = self.find_epic_by_title(title)
            if existing:
                epic = existing
                epic.description = description or epic.description
                # If it had a legacy id, keep it; otherwise use existing
            else:
                epic = Epic(
                    id=epic_id,
                    title=title,
                    description=description,
                    **kwargs
                )
            
            # Add acceptance criteria if provided
            if criteria:
                for c in criteria:
                    if c and c.strip():
                        epic.acceptance_criteria.append({'description': c.strip(), 'completed': False})
                # Recalculate completion from criteria
                done = 0
                total = len(epic.acceptance_criteria)
                epic.completion_percentage = float(int((done / total) * 100)) if total else epic.completion_percentage
            
            self.epics[epic.id] = epic
            await self._persist_epics()
            
            return TaskResult(
                success=True,
                data=epic.to_dict(),
                error=None,
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
        except Exception as e:
            logger.error(f"Failed to create epic: {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=0,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def _persist_epics(self) -> None:
        """
        Persist epics to markdown with atomic write.
        WHY: Data persistence must be reliable.
        """
        content = f"# Epics\n> Updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}\n\n"
        
        # Sort by priority and status
        sorted_epics = sorted(
            self.epics.values(),
            key=lambda e: (e.priority.value, e.status, e.created_at)
        )
        
        for epic in sorted_epics:
            content += f"""
## {epic.id}: {epic.title}

**Status:** {epic.status}  
**Priority:** {epic.priority.name}  
**Completion:** {epic.completion_percentage:.0f}%  
**Created:** {epic.created_at}  
**Updated:** {epic.updated_at}  

{epic.description}
"""
            # Acceptance Criteria
            if epic.acceptance_criteria:
                content += "\n#### Acceptance Criteria\n"
                for item in epic.acceptance_criteria:
                    check = 'x' if item.get('completed') else ' '
                    content += f"- [{check}] {item.get('description','').strip()}\n"
            content += "\n---\n"
        
        # Atomic write
        self.epics_path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = self.epics_path.with_suffix('.tmp')
        temp_path.write_text(content)
        temp_path.replace(self.epics_path)

# ============================================================================
# LABS: Security Testing
# ============================================================================

class SecurityLab:
    """
    Security testing laboratory.
    WHY: Learn security by testing in safe environment.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.test_results: List[Dict[str, Any]] = []
    
    @measure_performance
    async def test_input_validation(self, input_data: str) -> TaskResult:
        """
        Test input validation patterns.
        WHY: Input validation is first line of defense.
        """
        vulnerabilities = []
        
        # SQL Injection patterns
        sql_patterns = ["' OR '1'='1", "DROP TABLE", "UNION SELECT", "'; --"]
        for pattern in sql_patterns:
            if pattern.lower() in input_data.lower():
                vulnerabilities.append({
                    'type': 'SQL Injection',
                    'pattern': pattern,
                    'severity': 'HIGH'
                })
        
        # XSS patterns
        xss_patterns = ["<script>", "javascript:", "onerror=", "onclick="]
        for pattern in xss_patterns:
            if pattern.lower() in input_data.lower():
                vulnerabilities.append({
                    'type': 'XSS',
                    'pattern': pattern,
                    'severity': 'HIGH'
                })
        
        # Path traversal
        if "../" in input_data or "..%2F" in input_data:
            vulnerabilities.append({
                'type': 'Path Traversal',
                'pattern': '../',
                'severity': 'CRITICAL'
            })
        
        return TaskResult(
            success=len(vulnerabilities) == 0,
            data={
                'input': input_data[:100],  # Truncate for safety
                'vulnerabilities': vulnerabilities,
                'safe': len(vulnerabilities) == 0
            },
            error=None if len(vulnerabilities) == 0 else "Security vulnerabilities detected",
            duration_ms=0,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    @measure_performance
    async def test_rate_limiting(self, endpoint: str, requests_per_second: int) -> TaskResult:
        """
        Test rate limiting implementation.
        WHY: Rate limiting prevents abuse and ensures availability.
        """
        results = {
            'endpoint': endpoint,
            'target_rps': requests_per_second,
            'actual_rps': 0,
            'blocked_requests': 0,
            'allowed_requests': 0
        }
        
        # Simulate rate limiting test
        start_time = time.time()
        for i in range(requests_per_second * 2):  # Try double the limit
            # Simulate request
            await asyncio.sleep(0.01)  # Small delay
            
            # Simple rate limit check (in production, use proper rate limiter)
            current_time = time.time()
            elapsed = current_time - start_time
            current_rps = i / max(elapsed, 0.001)
            
            if current_rps <= requests_per_second:
                results['allowed_requests'] += 1
            else:
                results['blocked_requests'] += 1
        
        results['actual_rps'] = results['allowed_requests'] / max(time.time() - start_time, 0.001)
        
        return TaskResult(
            success=results['blocked_requests'] > 0,  # Should block some requests
            data=results,
            error=None,
            duration_ms=0,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

# ============================================================================
# PERFORMANCE MONITORING
# ============================================================================

class PerformanceMonitor:
    """
    Complete performance monitoring system.
    WHY: Performance is a feature, not an afterthought.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.metrics: Dict[str, List[float]] = {}
        self.thresholds = {
            'api_response_ms': 200,
            'render_time_ms': 16.67,  # 60 FPS
            'bundle_size_kb': 200,
            'memory_usage_mb': 100
        }
    
    async def record_metric(self, name: str, value: float) -> None:
        """Record performance metric with rolling window"""
        if name not in self.metrics:
            self.metrics[name] = []
        
        self.metrics[name].append(value)
        
        # Keep rolling window of last 100 measurements
        if len(self.metrics[name]) > 100:
            self.metrics[name] = self.metrics[name][-100:]
        
        # Update context metrics with average
        self.context.metrics[f"avg_{name}"] = sum(self.metrics[name]) / len(self.metrics[name])
        
        # Check threshold violations
        if name in self.thresholds and value > self.thresholds[name]:
            logger.warning(f"Performance threshold violated: {name}={value:.2f} (threshold={self.thresholds[name]})")
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        report = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metrics': {},
            'violations': []
        }
        
        for name, values in self.metrics.items():
            if values:
                report['metrics'][name] = {
                    'current': values[-1],
                    'average': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'p95': sorted(values)[int(len(values) * 0.95)] if len(values) > 1 else values[0]
                }
                
                # Check for violations
                if name in self.thresholds:
                    if report['metrics'][name]['average'] > self.thresholds[name]:
                        report['violations'].append({
                            'metric': name,
                            'average': report['metrics'][name]['average'],
                            'threshold': self.thresholds[name]
                        })
        
        return report

# ============================================================================
# MAIN AGENT ORCHESTRATOR
# ============================================================================

class TrackingEnforcer:
    """
    Enforces systematic tracking updates.
    WHY: Prevents context loss between sessions.
    
    ENFORCEMENT RULES:
    1. Every 3 changes = forced update
    2. Every 5 minutes = forced update
    3. Context switch = forced update
    4. Error occurrence = immediate update
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.last_update = time.time()
        self.pending_updates = []
        self.update_interval = 300  # 5 minutes
        self.changes_since_update = 0
        self.critical_threshold = 3  # Force update after 3 changes
        self.current_task = None
        self.task_start_time = None
    
    def track_change(self, change_type: str, description: str, **details) -> bool:
        """
        Track any significant change.
        WHY: Every change must be recorded immediately.
        """
        self.pending_updates.append({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': change_type,
            'description': description,
            'details': details
        })
        self.changes_since_update += 1
        
        # Force update if critical threshold reached
        if self.changes_since_update >= self.critical_threshold:
            logger.warning(f"🚨 TRACKING ENFORCEMENT: {self.changes_since_update} changes pending - forcing update")
            return True
        
        # Check time-based trigger
        if time.time() - self.last_update > self.update_interval:
            logger.warning(f"⏰ TRACKING ENFORCEMENT: {self.update_interval}s elapsed - forcing update")
            return True
        
        return False
    
    def detect_context_switch(self, new_task: str) -> bool:
        """
        Detect context switches that require immediate update.
        WHY: Context switches lose state if not tracked.
        """
        if self.current_task and self.current_task != new_task:
            logger.warning(f"🔄 CONTEXT SWITCH: {self.current_task} → {new_task} - forcing update")
            self.track_change(
                'context_switch',
                f"Switched from {self.current_task} to {new_task}",
                previous_task=self.current_task,
                new_task=new_task,
                task_duration=time.time() - self.task_start_time if self.task_start_time else 0
            )
            self.current_task = new_task
            self.task_start_time = time.time()
            return True
        
        if not self.current_task:
            self.current_task = new_task
            self.task_start_time = time.time()
        
        return False
    
    def track_error(self, error: str, context: str) -> bool:
        """
        Track errors for immediate update.
        WHY: Errors need immediate documentation.
        """
        logger.error(f"❌ ERROR TRACKED: {error} in {context}")
        self.track_change(
            'error',
            f"Error in {context}: {error}",
            error=error,
            context=context,
            severity='high'
        )
        return True  # Always force update on errors
    
    def get_pending_summary(self) -> str:
        """Generate summary of pending updates."""
        if not self.pending_updates:
            return "No pending updates"
        
        summary = f"\n📋 Pending Updates ({len(self.pending_updates)} items):\n"
        for update in self.pending_updates:
            summary += f"  • {update['type']}: {update['description']}\n"
        return summary
    
    def clear_pending(self) -> None:
        """Clear pending updates after writing."""
        self.pending_updates = []
        self.changes_since_update = 0
        self.last_update = time.time()

class AgentBoot:
    """
    Main agent orchestrator - coordinates all modules.
    WHY: Central coordination ensures consistency.
    """
    
    def __init__(self, config: Optional[ConfigDict] = None):
        # Default configuration with production values
        default_config = ConfigDict(
            project_root=os.getcwd(),
            canonical_docs={
                'devlog': 'docs/status/DEVLOG.md',
                'epics': 'docs/roadmap/EPICS.md',
                'status': 'docs/SYSTEM_STATUS.md'
            },
            test_coverage_threshold=80.0,
            performance_budget_ms=200,
            cache_ttl_seconds=300,
            max_retries=3,
            enable_telemetry=False,
            emit_events=False,
            events_file='logs/ce/events.jsonl'
        )
        
        # Merge with provided config
        if config:
            default_config.update(config)
        
        self.context = AgentContext(config=default_config)
        
        # Initialize all modules
        self.docs_manager = DocumentationManager(self.context)
        self.epic_manager = EpicManager(self.context)
        self.security_lab = SecurityLab(self.context)
        self.perf_monitor = PerformanceMonitor(self.context)
        self.github = GitHubIntegration(self.context)
        self.tracking_enforcer = TrackingEnforcer(self.context)
        
        # Task queue for async operations
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.workers: List[asyncio.Task] = []
        
        # Automatic tracking reminder
        self.tracking_task: Optional[asyncio.Task] = None
    
    async def initialize(self) -> None:
        """
        Initialize all systems with health checks.
        WHY: Fail fast if dependencies are missing.
        """
        logger.info(f"Initializing Agent Boot session {self.context.session_id}")
        self.context.status = AgentStatus.INITIALIZING
        
        try:
            # Verify project structure
            project_root = Path(self.context.config['project_root'])
            if not project_root.exists():
                raise FileNotFoundError(f"Project root not found: {project_root}")
            
            # Create required directories
            required_dirs = [
                project_root / 'docs' / 'status',
                project_root / 'docs' / 'roadmap'
            ]
            
            for dir_path in required_dirs:
                dir_path.mkdir(parents=True, exist_ok=True)
            
            # Start worker tasks
            for i in range(3):  # 3 concurrent workers
                worker = asyncio.create_task(self._task_worker(f"worker-{i}"))
                self.workers.append(worker)
            
            self.context.status = AgentStatus.READY
            logger.info("Agent Boot initialized successfully")
            
        except Exception as e:
            self.context.status = AgentStatus.ERROR
            self.context.errors.append({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'error': str(e),
                'phase': 'initialization'
            })
            logger.error(f"Initialization failed: {e}")
            raise
    
    async def _task_worker(self, worker_id: str) -> None:
        """
        Background task worker for async operations.
        WHY: Concurrent processing improves throughput.
        """
        logger.debug(f"Worker {worker_id} started")
        
        while self.context.status not in [AgentStatus.SHUTTING_DOWN, AgentStatus.ERROR]:
            try:
                # Wait for task with timeout
                task = await asyncio.wait_for(self.task_queue.get(), timeout=1.0)
                
                # Process task
                logger.debug(f"Worker {worker_id} processing task: {task.get('type')}")
                await self._process_task(task)
                
            except asyncio.TimeoutError:
                continue  # No task available, continue waiting
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
    
    async def _process_task(self, task: Dict[str, Any]) -> None:
        """Process individual task with error recovery"""
        task_type = task.get('type')
        
        try:
            if task_type == 'update_docs':
                await self.docs_manager.update_devlog(task.get('content', ''))
                await self.docs_manager.update_system_status()
                
            elif task_type == 'create_epic':
                await self.epic_manager.create_epic(
                    task.get('title'),
                    task.get('description')
                )
                
            elif task_type == 'security_test':
                await self.security_lab.test_input_validation(
                    task.get('input', '')
                )
                
            elif task_type == 'performance_check':
                await self.perf_monitor.record_metric(
                    task.get('metric_name'),
                    task.get('value')
                )
                
            self.context.tasks_completed.append(task_type)
            
        except Exception as e:
            logger.error(f"Task processing failed: {e}")
            self.context.errors.append({
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'task': task_type,
                'error': str(e)
            })
    
    async def execute_command(self, command: str, **kwargs) -> TaskResult:
        """
        Execute agent command with validation.
        WHY: Command pattern enables extensibility.
        """
        start_time = time.perf_counter()
        
        try:
            if command == "update_docs":
                # Update all documentation
                result = await self.docs_manager.update_devlog(kwargs.get('content', 'Session update'))
                await self.docs_manager.update_system_status()
                
            elif command == "create_epic":
                result = await self.epic_manager.create_epic(
                    kwargs.get('title'),
                    kwargs.get('description'),
                    criteria=kwargs.get('criteria')
                )
                # Optionally create GitHub issue
                if kwargs.get('create_issue', False) and result['success']:
                    epic_id = result['data']['id']
                    epic = self.epic_manager.epics.get(epic_id)
                    if epic:
                        github_result = await self.github.create_issue_from_epic(epic)
                        result['data']['github_issue'] = github_result['data']
                        if github_result['success'] and github_result['data']:
                            # Store the issue number for future updates
                            self.epic_manager.github_issues[epic_id] = github_result['data'].get('issue_number')
                
            elif command == "update_epic":
                result = await self.epic_manager.update_epic(
                    kwargs.get('epic_id'),
                    status=kwargs.get('status'),
                    completion=kwargs.get('completion'),
                    add_criteria=kwargs.get('add_criteria'),
                    check_indices=kwargs.get('check_indices'),
                    uncheck_indices=kwargs.get('uncheck_indices')
                )
                
            elif command == "list_epics":
                result = await self.epic_manager.list_epics()
                
            elif command == "sync_github":
                result = await self.epic_manager.sync_with_github()
                
            elif command == "test_security":
                result = await self.security_lab.test_input_validation(
                    kwargs.get('input', '')
                )
                
            elif command == "performance_report":
                report = self.perf_monitor.get_performance_report()
                result = TaskResult(
                    success=True,
                    data=report,
                    error=None,
                    duration_ms=(time.perf_counter() - start_time) * 1000,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
            elif command == "github_status":
                # Check GitHub PR and issue status
                pr_status = await self.github.check_pr_status()
                result = TaskResult(
                    success=True,
                    data={
                        'pr_status': pr_status['data'] if pr_status['success'] else None,
                        'github_available': self.github.gh_available
                    },
                    error=pr_status.get('error'),
                    duration_ms=(time.perf_counter() - start_time) * 1000,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
            elif command == "workflow_status":
                # Get comprehensive workflow status
                workflow_data = {
                    'session': self.context.to_dict(),
                    'performance': self.perf_monitor.get_performance_report(),
                    'github': {'available': self.github.gh_available}
                }
                
                if self.github.gh_available:
                    pr_status = await self.github.check_pr_status()
                    if pr_status['success']:
                        workflow_data['github']['prs'] = pr_status['data']
                
                result = TaskResult(
                    success=True,
                    data=workflow_data,
                    error=None,
                    duration_ms=(time.perf_counter() - start_time) * 1000,
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
            elif command == "watch":
                # Non-interactive watch: poll git status and log when changes are detected
                seconds = int(kwargs.get('seconds', 60) or 60)
                interval = int(kwargs.get('interval', 5) or 5)
                emit_events = bool(kwargs.get('emit_events', False))
                # Temporarily enable events if requested
                prev_emit = self.context.config.get('emit_events', False)
                if emit_events:
                    self.context.config['emit_events'] = True
                try:
                    result = await self._watch_loop(seconds=seconds, interval=interval)
                finally:
                    self.context.config['emit_events'] = prev_emit
            else:
                raise ValueError(f"Unknown command: {command}")
            
            # Record performance metric
            await self.perf_monitor.record_metric(
                f"command_{command}_ms",
                (time.perf_counter() - start_time) * 1000
            )
            
            # Emit an event line if enabled
            try:
                await self._emit_event(command, result)
            except Exception:
                pass
            
            return result
            
        except Exception as e:
            logger.error(f"Command execution failed: {command} - {e}")
            return TaskResult(
                success=False,
                data=None,
                error=str(e),
                duration_ms=(time.perf_counter() - start_time) * 1000,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def _emit_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        """Append a JSONL event if emit_events is enabled"""
        if not self.context.config.get('emit_events', False):
            return
        events_file = Path(self.context.config.get('events_file', 'logs/ce/events.jsonl'))
        events_file.parent.mkdir(parents=True, exist_ok=True)
        event = {
            'ts': datetime.now(timezone.utc).isoformat(),
            'session': self.context.session_id,
            'event': event_type,
            'payload': payload
        }
        with open(events_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(event) + "\n")
    
    async def _watch_loop(self, seconds: int = 60, interval: int = 5) -> TaskResult:
        """Poll git status and write docs updates when changes are detected"""
        start = time.time()
        last_status = None
        changes_count = 0
        while time.time() - start < seconds:
            try:
                proc = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, timeout=5)
                status_out = proc.stdout.strip()
            except Exception as e:
                status_out = f"error:{e}"
            if last_status is None:
                last_status = status_out
            elif status_out != last_status:
                diff_summary = status_out.splitlines()
                summary = f"Watch detected changes ({len(diff_summary)} lines). First line: {diff_summary[0] if diff_summary else 'n/a'}"
                await self.docs_manager.update_devlog(summary)
                await self.docs_manager.update_system_status()
                await self._emit_event('watch_change', {'lines': len(diff_summary)})
                changes_count += 1
                last_status = status_out
            await asyncio.sleep(max(1, interval))
        return TaskResult(
            success=True,
            data={'changes_detected': changes_count, 'duration_s': int(time.time() - start)},
            error=None,
            duration_ms=0,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    async def shutdown(self) -> None:
        """
        Graceful shutdown with cleanup.
        WHY: Clean shutdown prevents data corruption.
        """
        logger.info("Initiating Agent Boot shutdown")
        self.context.status = AgentStatus.SHUTTING_DOWN
        
        # Cancel all workers
        for worker in self.workers:
            worker.cancel()
        
        # Wait for workers to finish
        await asyncio.gather(*self.workers, return_exceptions=True)
        
        # Final status update
        await self.docs_manager.update_system_status()
        
        # Generate final report
        final_report = {
            'session_id': self.context.session_id,
            'tasks_completed': len(self.context.tasks_completed),
            'errors': len(self.context.errors),
            'performance': self.perf_monitor.get_performance_report()
        }
        
        logger.info(f"Agent Boot shutdown complete: {json.dumps(final_report, indent=2)}")
        self.context.status = AgentStatus.COMPLETED

# ============================================================================
# CLI INTERFACE
# ============================================================================

async def interactive_setup():
    """
    Interactive setup for first-time configuration.
    WHY: Projects have different branch strategies and configurations.
    """
    import json
    from pathlib import Path
    
    config_file = Path('.agent_boot.config.json')
    
    # Check if config exists
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                existing_config = json.load(f)
                print(f"\n📋 Found existing configuration:")
                print(f"  • Branch: {existing_config.get('default_branch', 'unknown')}")
                print(f"  • Project: {existing_config.get('project_name', 'unknown')}")
                
                response = input("\nUse existing configuration? (y/n) [y]: ").strip().lower()
                if response != 'n':
                    return existing_config
        except Exception as e:
            logger.warning(f"Could not load existing config: {e}")
    
    print("\n🚀 Agent Boot Setup\n" + "="*50)
    
    # Get current branch
    try:
        current_branch = subprocess.run(
            ['git', 'branch', '--show-current'],
            capture_output=True,
            text=True
        ).stdout.strip()
    except:
        current_branch = 'main'
    
    # Get remote branches
    try:
        remote_branches = subprocess.run(
            ['git', 'branch', '-r'],
            capture_output=True,
            text=True
        ).stdout.strip().split('\n')
        remote_branches = [b.strip().replace('origin/', '') for b in remote_branches if 'origin/' in b]
    except:
        remote_branches = ['main', 'dev', 'staging']
    
    print(f"\n📌 Current branch: {current_branch}")
    print(f"📦 Available branches: {', '.join(remote_branches[:5])}")
    
    # Questions
    config = {}
    
    # 1. Default branch
    print("\n1️⃣ Which branch should agent_boot work with?")
    print(f"   Options: {', '.join(remote_branches[:5])}")
    default_branch = input(f"   Branch [{current_branch}]: ").strip() or current_branch
    config['default_branch'] = default_branch
    
    # 2. Project name
    project_name = Path.cwd().name
    print(f"\n2️⃣ Project name [{project_name}]: ", end="")
    config['project_name'] = input().strip() or project_name
    
    # 3. GitHub integration
    print("\n3️⃣ Enable GitHub integration? (y/n) [y]: ", end="")
    enable_github = input().strip().lower() != 'n'
    config['github_integration'] = enable_github
    
    if enable_github:
        # Check if gh CLI is available
        try:
            gh_check = subprocess.run(['gh', 'auth', 'status'], capture_output=True)
            if gh_check.returncode != 0:
                print("   ⚠️  GitHub CLI not authenticated. Run: gh auth login")
        except:
            print("   ⚠️  GitHub CLI not found. Install from: https://cli.github.com")
    
    # 4. Test coverage threshold
    print("\n4️⃣ Minimum test coverage (%) [80]: ", end="")
    coverage_input = input().strip()
    config['test_coverage_threshold'] = float(coverage_input) if coverage_input else 80.0
    
    # 5. Development port
    print("\n5️⃣ Development server port [7007]: ", end="")
    port_input = input().strip()
    config['dev_port'] = int(port_input) if port_input else 7007
    
    # 6. Auto-pull on start
    print("\n6️⃣ Auto-pull latest changes on start? (y/n) [y]: ", end="")
    config['auto_pull'] = input().strip().lower() != 'n'
    
    # Save configuration
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"\n✅ Configuration saved to {config_file}")
    print(f"\n📝 Summary:")
    print(f"  • Working branch: {config['default_branch']}")
    print(f"  • Project: {config['project_name']}")
    print(f"  • GitHub: {'Enabled' if config['github_integration'] else 'Disabled'}")
    print(f"  • Coverage: {config['test_coverage_threshold']}%")
    print(f"  • Port: {config['dev_port']}")
    print(f"  • Auto-pull: {'Yes' if config['auto_pull'] else 'No'}")
    
    return config

async def ensure_correct_branch(config: dict) -> bool:
    """
    Ensure we're on the correct branch and it's up to date.
    WHY: Consistency across sessions prevents confusion.
    """
    default_branch = config.get('default_branch', 'dev')
    auto_pull = config.get('auto_pull', True)
    
    try:
        # Get current branch
        current_branch = subprocess.run(
            ['git', 'branch', '--show-current'],
            capture_output=True,
            text=True
        ).stdout.strip()
        
        # Switch if needed
        if current_branch != default_branch:
            print(f"\n🔄 Switching from {current_branch} to {default_branch}...")
            result = subprocess.run(
                ['git', 'checkout', default_branch],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                logger.error(f"Failed to switch to {default_branch}: {result.stderr}")
                return False
        
        # Pull latest if enabled
        if auto_pull:
            print(f"📥 Pulling latest changes from {default_branch}...")
            result = subprocess.run(
                ['git', 'pull', 'origin', default_branch],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"✅ Updated to latest {default_branch}")
            else:
                logger.warning(f"Could not pull latest: {result.stderr}")
        
        return True
        
    except Exception as e:
        logger.error(f"Git operations failed: {e}")
        return False

async def main():
    """
    Main entry point with comprehensive CLI.
    WHY: CLI provides immediate value without additional setup.
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Agent Boot - Reference Implementation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agent_boot.py init                            # Initialize agent system
  python agent_boot.py update-docs                     # Update all documentation
  python agent_boot.py create-epic "Title"             # Create new epic
  python agent_boot.py create-epic "Title" --create-issue # Create epic with GitHub issue
  python agent_boot.py test-security "<input>"         # Test input validation
  python agent_boot.py performance-report              # Generate performance report
  python agent_boot.py github-status                   # Check GitHub PR status
  python agent_boot.py workflow-status                 # Get complete workflow status
        """
    )
    
    parser.add_argument('command', choices=[
        'init', 'update-docs', 'create-epic', 'update-epic', 'list-epics', 'test-security', 'performance-report',
        'github-status', 'workflow-status', 'sync-github', 'watch'
    ], help='Command to execute')
    
    parser.add_argument('--title', help='Epic title')
    parser.add_argument('--description', help='Epic description')
    parser.add_argument('--epic-id', help='Epic ID to update')
    parser.add_argument('--status', choices=['TODO', 'IN_PROGRESS', 'DONE'], help='Epic status')
    parser.add_argument('--completion', type=int, help='Completion percentage (0-100)')
    parser.add_argument('--criterion', action='append', help='Acceptance criterion to add (repeatable, for create-epic)')
    parser.add_argument('--add-criterion', action='append', help='Acceptance criterion to add (repeatable, for update-epic)')
    parser.add_argument('--check-criterion', type=int, action='append', help='Mark criterion index as completed (0-based)')
    parser.add_argument('--uncheck-criterion', type=int, action='append', help='Mark criterion index as incomplete (0-based)')
    parser.add_argument('--input', help='Input to test')
    parser.add_argument('--content', help='Documentation content')
    parser.add_argument('--create-issue', action='store_true', help='Create GitHub issue for epic')
    parser.add_argument('--seconds', type=int, default=60, help='Watch duration in seconds (watch)')
    parser.add_argument('--interval', type=int, default=5, help='Polling interval in seconds (watch)')
    parser.add_argument('--emit-events', action='store_true', help='Enable event emission for this run (watch)')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Load or create configuration
    config_file = Path('.agent_boot.config.json')
    if args.command == 'init' or not config_file.exists():
        config = await interactive_setup()
    else:
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
        except:
            config = await interactive_setup()
    
    # Ensure we're on the right branch
    await ensure_correct_branch(config)
    
    # Initialize agent with loaded config
    agent_config = ConfigDict(
        project_root=os.getcwd(),
        canonical_docs={
            'devlog': 'docs/status/DEVLOG.md',
            'epics': 'docs/roadmap/EPICS.md',
            'status': 'docs/SYSTEM_STATUS.md'
        },
        test_coverage_threshold=config.get('test_coverage_threshold', 80.0),
        performance_budget_ms=200,
        cache_ttl_seconds=300,
        max_retries=3,
        enable_telemetry=False
    )
    
    agent = AgentBoot(agent_config)
    await agent.initialize()
    
    try:
        # Execute command
        if args.command == 'init':
            print(f"Agent Boot initialized - Session ID: {agent.context.session_id}")
            print(json.dumps(agent.context.to_dict(), indent=2))
            
        elif args.command == 'update-docs':
            result = await agent.execute_command(
                'update_docs',
                content=args.content or f"Updated via CLI at {datetime.now(timezone.utc).isoformat()}"
            )
            print(f"Documentation updated: {result['success']}")
            
        elif args.command == 'create-epic':
            if not args.title:
                print("Error: --title required for create-epic")
                sys.exit(1)
                
            result = await agent.execute_command(
                'create_epic',
                title=args.title,
                description=args.description or "",
                criteria=args.criterion,
                create_issue=args.create_issue
            )
            print(f"Epic created: {json.dumps(result, indent=2)}")
            
        elif args.command == 'update-epic':
            if not args.epic_id and not args.title:
                print("Error: --epic-id or --title required for update-epic")
                sys.exit(1)
            
            # Find epic by title if ID not provided
            epic_id = args.epic_id
            if not epic_id and args.title:
                # Find epic by title
                for e_id, epic in agent.epic_manager.epics.items():
                    if epic.title == args.title:
                        epic_id = e_id
                        break
            
            if not epic_id:
                print(f"Error: Epic not found with title '{args.title}'")
                sys.exit(1)
            
            result = await agent.execute_command(
                'update_epic',
                epic_id=epic_id,
                status=args.status,
                completion=args.completion,
                add_criteria=args.add_criterion,
                check_indices=args.check_criterion,
                uncheck_indices=args.uncheck_criterion
            )
            print(f"Epic updated: {json.dumps(result, indent=2)}")
            
        elif args.command == 'list-epics':
            result = await agent.execute_command('list_epics')
            print(f"\nEpics:\n{json.dumps(result['data'], indent=2)}")
            
        elif args.command == 'sync-github':
            result = await agent.execute_command('sync_github')
            print(f"GitHub sync result: {json.dumps(result, indent=2)}")
            
        elif args.command == 'test-security':
            result = await agent.execute_command(
                'test_security',
                input=args.input or "test input"
            )
            print(f"Security test result: {json.dumps(result, indent=2)}")
            
        elif args.command == 'performance-report':
            result = await agent.execute_command('performance_report')
            print(f"Performance Report:\n{json.dumps(result['data'], indent=2)}")
            
        elif args.command == 'github-status':
            result = await agent.execute_command('github_status')
            print(f"GitHub Status:\n{json.dumps(result['data'], indent=2)}")
            
        elif args.command == 'workflow-status':
            result = await agent.execute_command('workflow_status')
            print(f"Workflow Status:\n{json.dumps(result['data'], indent=2)}")
            
        elif args.command == 'watch':
            result = await agent.execute_command('watch', seconds=args.seconds, interval=args.interval, emit_events=args.emit_events)
            print(f"Watch finished: {json.dumps(result['data'], indent=2)}")
            
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
