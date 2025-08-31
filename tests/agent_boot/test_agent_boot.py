#!/usr/bin/env python3
"""
Test Suite for Agent Boot System
================================
Comprehensive tests following TDD principles.
Tests serve as living documentation.

WHY THIS STRUCTURE:
- Unit tests for isolated components
- Integration tests for module interactions
- End-to-end tests for complete workflows
- Performance tests for optimization validation
"""

import asyncio
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timezone

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import agent_boot
from agent_boot import (
    AgentBoot, AgentContext, AgentStatus, Priority,
    DocumentationManager, EpicManager, Epic,
    SecurityLab, PerformanceMonitor,
    TaskResult, ConfigDict
)

# ============================================================================
# TEST FIXTURES AND UTILITIES
# ============================================================================

class TestBase(unittest.TestCase):
    """
    Base test class with common setup and utilities.
    WHY: DRY principle - avoid repeating setup code.
    """
    
    def setUp(self):
        """Set up test environment with isolated filesystem"""
        self.test_dir = tempfile.mkdtemp(prefix="agent_boot_test_")
        self.config = ConfigDict(
            project_root=self.test_dir,
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
        
    def tearDown(self):
        """Clean up test environment"""
        import shutil
        if Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def create_test_file(self, relative_path: str, content: str = "") -> Path:
        """Helper to create test files"""
        file_path = Path(self.test_dir) / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content)
        return file_path

# ============================================================================
# UNIT TESTS - Test individual components in isolation
# ============================================================================

class TestAgentContext(TestBase):
    """
    Test AgentContext state management.
    WHY: Context is the single source of truth for agent state.
    """
    
    def test_context_initialization(self):
        """GIVEN empty context WHEN initialized THEN has correct defaults"""
        context = AgentContext()
        
        self.assertEqual(context.status, AgentStatus.INITIALIZING)
        self.assertEqual(len(context.tasks_completed), 0)
        self.assertEqual(len(context.errors), 0)
        self.assertIsNotNone(context.session_id)
        self.assertEqual(len(context.session_id), 8)
    
    def test_context_serialization(self):
        """GIVEN context with data WHEN serialized THEN contains all fields"""
        context = AgentContext()
        context.tasks_completed = ['task1', 'task2']
        context.errors = [{'error': 'test'}]
        context.metrics = {'test_metric': 42.0}
        
        result = context.to_dict()
        
        self.assertIn('session_id', result)
        self.assertEqual(result['status'], 'INITIALIZING')
        self.assertEqual(result['tasks_completed'], 2)
        self.assertEqual(result['errors'], 1)
        self.assertEqual(result['metrics']['test_metric'], 42.0)

class TestDocumentationManager(TestBase):
    """
    Test documentation management functionality.
    WHY: Documentation is code and must be tested.
    """
    
    def setUp(self):
        super().setUp()
        self.context = AgentContext(config=self.config)
        self.docs_manager = DocumentationManager(self.context)
    
    async def test_update_devlog_creates_file(self):
        """GIVEN no devlog WHEN updated THEN creates file with entry"""
        result = await self.docs_manager.update_devlog("Test entry")
        
        self.assertTrue(result['success'])
        devlog_path = Path(self.test_dir) / 'docs' / 'status' / 'DEVLOG.md'
        self.assertTrue(devlog_path.exists())
        
        content = devlog_path.read_text()
        self.assertIn("Test entry", content)
        self.assertIn(self.context.session_id, content)
    
    async def test_update_devlog_appends_to_existing(self):
        """GIVEN existing devlog WHEN updated THEN appends new entry"""
        # Create existing devlog
        existing_content = "# Existing DevLog\n\nPrevious content"
        self.create_test_file('docs/status/DEVLOG.md', existing_content)
        
        result = await self.docs_manager.update_devlog("New entry")
        
        self.assertTrue(result['success'])
        devlog_path = Path(self.test_dir) / 'docs' / 'status' / 'DEVLOG.md'
        content = devlog_path.read_text()
        
        self.assertIn("Previous content", content)
        self.assertIn("New entry", content)
    
    async def test_update_system_status(self):
        """GIVEN context with metrics WHEN status updated THEN includes metrics"""
        self.context.metrics = {
            'avg_response_time': 150.5,
            'avg_memory_usage': 75.2
        }
        self.context.tasks_completed = ['task1', 'task2', 'task3']
        
        result = await self.docs_manager.update_system_status()
        
        self.assertTrue(result['success'])
        status_path = Path(self.test_dir) / 'docs' / 'SYSTEM_STATUS.md'
        self.assertTrue(status_path.exists())
        
        content = status_path.read_text()
        self.assertIn("Tasks Completed: 3", content)
        self.assertIn("avg_response_time: 150.50", content)
        self.assertIn("avg_memory_usage: 75.20", content)

class TestEpicManager(TestBase):
    """
    Test epic management functionality.
    WHY: Epic manager demonstrates CRUD patterns.
    """
    
    def setUp(self):
        super().setUp()
        self.context = AgentContext(config=self.config)
        self.epic_manager = EpicManager(self.context)
    
    async def test_create_epic_validation(self):
        """GIVEN invalid input WHEN creating epic THEN returns error"""
        # Test empty title
        result = await self.epic_manager.create_epic("", "Description")
        self.assertFalse(result['success'])
        self.assertIn("at least 3 characters", result['error'])
        
        # Test title too long
        long_title = "x" * 201
        result = await self.epic_manager.create_epic(long_title, "Description")
        self.assertFalse(result['success'])
        self.assertIn("less than 200 characters", result['error'])
    
    async def test_create_epic_success(self):
        """GIVEN valid input WHEN creating epic THEN creates and persists"""
        result = await self.epic_manager.create_epic(
            "Test Epic",
            "This is a test epic description"
        )
        
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['data'])
        self.assertEqual(result['data']['title'], "Test Epic")
        
        # Verify persistence
        epics_path = Path(self.test_dir) / 'docs' / 'roadmap' / 'EPICS.md'
        self.assertTrue(epics_path.exists())
        content = epics_path.read_text()
        self.assertIn("Test Epic", content)
        self.assertIn("This is a test epic description", content)
    
    def test_epic_priority_sorting(self):
        """GIVEN epics with priorities WHEN sorted THEN correct order"""
        epic1 = Epic("1", "Low Priority", "", priority=Priority.LOW)
        epic2 = Epic("2", "High Priority", "", priority=Priority.HIGH)
        epic3 = Epic("3", "Critical", "", priority=Priority.CRITICAL)
        
        epics = [epic1, epic2, epic3]
        sorted_epics = sorted(epics, key=lambda e: e.priority.value)
        
        self.assertEqual(sorted_epics[0].title, "Critical")
        self.assertEqual(sorted_epics[1].title, "High Priority")
        self.assertEqual(sorted_epics[2].title, "Low Priority")

class TestSecurityLab(TestBase):
    """
    Test security validation functionality.
    WHY: Security must be tested to ensure it works.
    """
    
    def setUp(self):
        super().setUp()
        self.context = AgentContext(config=self.config)
        self.security_lab = SecurityLab(self.context)
    
    async def test_sql_injection_detection(self):
        """GIVEN SQL injection attempt WHEN validated THEN detected"""
        result = await self.security_lab.test_input_validation(
            "' OR '1'='1"
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(len(result['data']['vulnerabilities']), 1)
        self.assertEqual(result['data']['vulnerabilities'][0]['type'], 'SQL Injection')
    
    async def test_xss_detection(self):
        """GIVEN XSS attempt WHEN validated THEN detected"""
        result = await self.security_lab.test_input_validation(
            "<script>alert('xss')</script>"
        )
        
        self.assertFalse(result['success'])
        vulnerabilities = result['data']['vulnerabilities']
        self.assertTrue(any(v['type'] == 'XSS' for v in vulnerabilities))
    
    async def test_path_traversal_detection(self):
        """GIVEN path traversal attempt WHEN validated THEN detected"""
        result = await self.security_lab.test_input_validation(
            "../../etc/passwd"
        )
        
        self.assertFalse(result['success'])
        vulnerabilities = result['data']['vulnerabilities']
        self.assertTrue(any(v['type'] == 'Path Traversal' for v in vulnerabilities))
        self.assertTrue(any(v['severity'] == 'CRITICAL' for v in vulnerabilities))
    
    async def test_safe_input(self):
        """GIVEN safe input WHEN validated THEN passes"""
        result = await self.security_lab.test_input_validation(
            "This is a safe input string"
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(len(result['data']['vulnerabilities']), 0)
        self.assertTrue(result['data']['safe'])

class TestPerformanceMonitor(TestBase):
    """
    Test performance monitoring functionality.
    WHY: Performance must be measured to be improved.
    """
    
    def setUp(self):
        super().setUp()
        self.context = AgentContext(config=self.config)
        self.perf_monitor = PerformanceMonitor(self.context)
    
    async def test_record_metric(self):
        """GIVEN metrics WHEN recorded THEN stored and averaged"""
        await self.perf_monitor.record_metric('test_metric', 100.0)
        await self.perf_monitor.record_metric('test_metric', 200.0)
        await self.perf_monitor.record_metric('test_metric', 150.0)
        
        self.assertIn('avg_test_metric', self.context.metrics)
        self.assertEqual(self.context.metrics['avg_test_metric'], 150.0)
    
    async def test_threshold_violation_warning(self):
        """GIVEN metric exceeds threshold WHEN recorded THEN warns"""
        with self.assertLogs(level='WARNING') as log:
            await self.perf_monitor.record_metric('api_response_ms', 250.0)
            
        self.assertTrue(any('threshold violated' in msg for msg in log.output))
    
    def test_performance_report_generation(self):
        """GIVEN recorded metrics WHEN report generated THEN includes statistics"""
        asyncio.run(self.perf_monitor.record_metric('test_metric', 100.0))
        asyncio.run(self.perf_monitor.record_metric('test_metric', 200.0))
        asyncio.run(self.perf_monitor.record_metric('test_metric', 150.0))
        
        report = self.perf_monitor.get_performance_report()
        
        self.assertIn('metrics', report)
        self.assertIn('test_metric', report['metrics'])
        self.assertEqual(report['metrics']['test_metric']['average'], 150.0)
        self.assertEqual(report['metrics']['test_metric']['min'], 100.0)
        self.assertEqual(report['metrics']['test_metric']['max'], 200.0)

# ============================================================================
# INTEGRATION TESTS - Test module interactions
# ============================================================================

class TestAgentBootIntegration(TestBase):
    """
    Test AgentBoot orchestration of modules.
    WHY: Integration points are common failure points.
    """
    
    async def test_agent_initialization(self):
        """GIVEN config WHEN agent initialized THEN all modules ready"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            self.assertEqual(agent.context.status, AgentStatus.READY)
            self.assertIsNotNone(agent.docs_manager)
            self.assertIsNotNone(agent.epic_manager)
            self.assertIsNotNone(agent.security_lab)
            self.assertIsNotNone(agent.perf_monitor)
            
            # Verify directories created
            docs_dir = Path(self.test_dir) / 'docs'
            self.assertTrue(docs_dir.exists())
            self.assertTrue((docs_dir / 'status').exists())
            self.assertTrue((docs_dir / 'roadmap').exists())
            
        finally:
            await agent.shutdown()
    
    async def test_command_execution(self):
        """GIVEN initialized agent WHEN command executed THEN returns result"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            # Test update_docs command
            result = await agent.execute_command(
                'update_docs',
                content='Test documentation update'
            )
            self.assertTrue(result['success'])
            
            # Test create_epic command
            result = await agent.execute_command(
                'create_epic',
                title='Integration Test Epic',
                description='Testing integration'
            )
            self.assertTrue(result['success'])
            
            # Test performance_report command
            result = await agent.execute_command('performance_report')
            self.assertTrue(result['success'])
            self.assertIn('metrics', result['data'])
            
        finally:
            await agent.shutdown()
    
    async def test_graceful_shutdown(self):
        """GIVEN running agent WHEN shutdown THEN cleans up properly"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        initial_status = agent.context.status
        self.assertEqual(initial_status, AgentStatus.READY)
        
        await agent.shutdown()
        
        self.assertEqual(agent.context.status, AgentStatus.COMPLETED)
        # All workers should be cancelled
        for worker in agent.workers:
            self.assertTrue(worker.done() or worker.cancelled())

# ============================================================================
# END-TO-END TESTS - Test complete workflows
# ============================================================================

class TestEndToEndWorkflows(TestBase):
    """
    Test complete user workflows.
    WHY: E2E tests ensure the system works for real use cases.
    """
    
    async def test_complete_documentation_workflow(self):
        """GIVEN new session WHEN docs updated THEN all docs synchronized"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            # Create an epic
            epic_result = await agent.execute_command(
                'create_epic',
                title='E2E Test Epic',
                description='Testing complete workflow'
            )
            self.assertTrue(epic_result['success'])
            
            # Update documentation
            docs_result = await agent.execute_command(
                'update_docs',
                content='Completed E2E test workflow'
            )
            self.assertTrue(docs_result['success'])
            
            # Verify all documentation updated
            devlog_path = Path(self.test_dir) / 'docs' / 'status' / 'DEVLOG.md'
            status_path = Path(self.test_dir) / 'docs' / 'SYSTEM_STATUS.md'
            epics_path = Path(self.test_dir) / 'docs' / 'roadmap' / 'EPICS.md'
            
            self.assertTrue(devlog_path.exists())
            self.assertTrue(status_path.exists())
            self.assertTrue(epics_path.exists())
            
            # Verify content
            self.assertIn('E2E test workflow', devlog_path.read_text())
            self.assertIn('E2E Test Epic', epics_path.read_text())
            
        finally:
            await agent.shutdown()
    
    async def test_security_testing_workflow(self):
        """GIVEN security inputs WHEN tested THEN validates correctly"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            # Test various security inputs
            test_cases = [
                ("safe input", True),
                ("<script>alert('xss')</script>", False),
                ("' OR '1'='1", False),
                ("../../etc/passwd", False)
            ]
            
            for input_data, expected_safe in test_cases:
                result = await agent.execute_command(
                    'test_security',
                    input=input_data
                )
                
                self.assertEqual(
                    result['success'],
                    expected_safe,
                    f"Failed for input: {input_data}"
                )
                
        finally:
            await agent.shutdown()

# ============================================================================
# PERFORMANCE TESTS - Validate performance requirements
# ============================================================================

class TestPerformance(TestBase):
    """
    Test performance characteristics.
    WHY: Performance requirements must be validated.
    """
    
    async def test_documentation_update_performance(self):
        """GIVEN large content WHEN updated THEN within budget"""
        import time
        
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            # Generate large content
            large_content = "Test content line\n" * 1000
            
            start_time = time.perf_counter()
            result = await agent.execute_command(
                'update_docs',
                content=large_content
            )
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            self.assertTrue(result['success'])
            # Should complete within reasonable time (adjust as needed)
            self.assertLess(duration_ms, 1000, "Documentation update too slow")
            
        finally:
            await agent.shutdown()
    
    async def test_concurrent_operations(self):
        """GIVEN concurrent operations WHEN executed THEN handles correctly"""
        agent = AgentBoot(self.config)
        await agent.initialize()
        
        try:
            # Execute multiple operations concurrently
            tasks = [
                agent.execute_command('update_docs', content=f'Update {i}')
                for i in range(10)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # All should succeed without exceptions
            for i, result in enumerate(results):
                self.assertIsInstance(result, dict, f"Task {i} raised exception")
                self.assertTrue(result.get('success', False), f"Task {i} failed")
                
        finally:
            await agent.shutdown()

# ============================================================================
# TEST RUNNER
# ============================================================================

def run_tests():
    """Run all tests with proper async support"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test cases
    suite.addTests(loader.loadTestsFromTestCase(TestAgentContext))
    suite.addTests(loader.loadTestsFromTestCase(TestDocumentationManager))
    suite.addTests(loader.loadTestsFromTestCase(TestEpicManager))
    suite.addTests(loader.loadTestsFromTestCase(TestSecurityLab))
    suite.addTests(loader.loadTestsFromTestCase(TestPerformanceMonitor))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentBootIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestEndToEndWorkflows))
    suite.addTests(loader.loadTestsFromTestCase(TestPerformance))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == '__main__':
    # Set up async test running
    import asyncio
    
    # For Python 3.7+ compatibility
    if hasattr(asyncio, 'run'):
        # Run async tests properly
        unittest.main(verbosity=2)
    else:
        # Fallback for older Python versions
        sys.exit(run_tests())
