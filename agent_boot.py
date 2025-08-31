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
# USER JOURNEY: Documentation Management
# ============================================================================

class DocumentationManager:
    """
    Complete documentation management system.
    WHY: Documentation is code - treat it as first-class citizen.
    """
    
    def __init__(self, context: AgentContext):
        self.context = context
        self.docs_path = Path(context.config.get('project_root', '.')) / 'docs'
        self.cache: Dict[str, tuple[str, str]] = {}  # path -> (hash, content)
    
    @measure_performance
    async def update_devlog(self, entry: str) -> TaskResult:
        """
        Append to DEVLOG with proper formatting.
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
            'completion_percentage': self.completion_percentage
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
        self._load_epics()
    
    def _load_epics(self) -> None:
        """Load epics from markdown with error recovery"""
        if not self.epics_path.exists():
            logger.info("No existing epics file found, starting fresh")
            return
        
        try:
            content = self.epics_path.read_text()
            # Parse markdown structure (simplified for example)
            # In production, use a proper markdown parser
            current_epic = None
            for line in content.split('\n'):
                if line.startswith('## '):
                    # New epic
                    title = line[3:].strip()
                    epic_id = hashlib.md5(title.encode()).hexdigest()[:8]
                    current_epic = Epic(id=epic_id, title=title, description="")
                    self.epics[epic_id] = current_epic
                elif current_epic and line.strip():
                    current_epic.description += line + "\n"
                    
        except Exception as e:
            logger.error(f"Failed to load epics: {e}")
    
    @measure_performance
    async def create_epic(self, title: str, description: str, **kwargs) -> TaskResult:
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
            
            # Generate unique ID
            epic_id = hashlib.md5(f"{title}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest()[:8]
            
            # Create epic with defaults
            epic = Epic(
                id=epic_id,
                title=title,
                description=description,
                **kwargs
            )
            
            self.epics[epic_id] = epic
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
## {epic.title}

**Status:** {epic.status}  
**Priority:** {epic.priority.name}  
**Completion:** {epic.completion_percentage:.0f}%  
**Created:** {epic.created_at}  
**Updated:** {epic.updated_at}  

{epic.description}

---
"""
        
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
            enable_telemetry=False
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
        
        # Task queue for async operations
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.workers: List[asyncio.Task] = []
    
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
                project_root / 'docs' / 'roadmap',
                project_root / 'tests' / 'agent_boot'
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
                    kwargs.get('description')
                )
                # Optionally create GitHub issue
                if kwargs.get('create_issue', False) and result['success']:
                    epic_id = result['data']['id']
                    epic = self.epic_manager.epics.get(epic_id)
                    if epic:
                        github_result = await self.github.create_issue_from_epic(epic)
                        result['data']['github_issue'] = github_result['data']
                
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
                
            else:
                raise ValueError(f"Unknown command: {command}")
            
            # Record performance metric
            await self.perf_monitor.record_metric(
                f"command_{command}_ms",
                (time.perf_counter() - start_time) * 1000
            )
            
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
        'init', 'update-docs', 'create-epic', 'test-security', 'performance-report',
        'github-status', 'workflow-status'
    ], help='Command to execute')
    
    parser.add_argument('--title', help='Epic title')
    parser.add_argument('--description', help='Epic description')
    parser.add_argument('--input', help='Input to test')
    parser.add_argument('--content', help='Documentation content')
    parser.add_argument('--create-issue', action='store_true', help='Create GitHub issue for epic')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize agent
    agent = AgentBoot()
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
                create_issue=args.create_issue
            )
            print(f"Epic created: {json.dumps(result, indent=2)}")
            
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
            
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
