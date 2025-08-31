"""
QuizMentor Load Testing Harness
Simulates real-world API usage patterns with authentication
"""

import json
import random
import time
from locust import HttpUser, task, between, TaskSet, events
from locust.env import Environment
import os

# Configuration from environment variables
API_TOKEN = os.getenv("QM_API_TOKEN", "")
USE_AUTH = os.getenv("QM_USE_AUTH", "false").lower() == "true"
DEBUG = os.getenv("QM_DEBUG", "false").lower() == "true"

# Test data pools
QUIZ_TOPICS = [
    "Mathematics", "Physics", "Chemistry", "Biology", "History",
    "Geography", "Literature", "Computer Science", "Economics", "Philosophy"
]

DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]

BLOOM_LEVELS = [
    "remember", "understand", "apply", "analyze", "evaluate", "create"
]

# Sample questions for validation endpoint
SAMPLE_QUESTIONS = [
    {
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctAnswer": 2,
        "topic": "Geography",
        "difficulty": "beginner",
        "bloomLevel": "remember"
    },
    {
        "question": "Solve for x: 2x + 5 = 15",
        "options": ["x = 5", "x = 10", "x = 7.5", "x = 20"],
        "correctAnswer": 0,
        "topic": "Mathematics",
        "difficulty": "intermediate",
        "bloomLevel": "apply"
    },
    {
        "question": "Analyze the impact of climate change on coastal ecosystems",
        "options": [
            "Rising sea levels threaten biodiversity",
            "No significant impact observed",
            "Only affects temperature",
            "Benefits marine life"
        ],
        "correctAnswer": 0,
        "topic": "Biology",
        "difficulty": "advanced",
        "bloomLevel": "analyze"
    }
]

class QuizMentorTaskSet(TaskSet):
    """Main task set for QuizMentor load testing"""
    
    def on_start(self):
        """Initialize user session"""
        self.session_id = None
        self.user_id = f"loadtest_user_{random.randint(1000, 9999)}"
        self.headers = {"Content-Type": "application/json"}
        
        if USE_AUTH and API_TOKEN:
            self.headers["Authorization"] = f"Bearer {API_TOKEN}"
        
        if DEBUG:
            print(f"User {self.user_id} starting with headers: {self.headers}")
    
    @task(5)
    def health_check(self):
        """Check API health status"""
        with self.client.get("/health", 
                            catch_response=True,
                            name="Health Check") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")
    
    @task(10)
    def validate_question(self):
        """Validate a quiz question"""
        question = random.choice(SAMPLE_QUESTIONS).copy()
        question["userId"] = self.user_id
        
        with self.client.post("/api/v1/questions/validate",
                             json=question,
                             headers=self.headers,
                             catch_response=True,
                             name="Validate Question") as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "isValid" in data:
                        response.success()
                    else:
                        response.failure("Invalid response format")
                except Exception as e:
                    response.failure(f"JSON parse error: {e}")
            else:
                response.failure(f"Validation failed: {response.status_code}")
    
    @task(15)
    def generate_learning_plan(self):
        """Generate a personalized learning plan"""
        payload = {
            "userId": self.user_id,
            "topic": random.choice(QUIZ_TOPICS),
            "currentLevel": random.choice(DIFFICULTY_LEVELS),
            "targetLevel": random.choice(["intermediate", "advanced", "expert"]),
            "timeframe": random.choice([7, 14, 30, 60]),  # days
            "focusAreas": random.sample(BLOOM_LEVELS, k=3)
        }
        
        with self.client.post("/api/v1/learning/plan",
                             json=payload,
                             headers=self.headers,
                             catch_response=True,
                             name="Generate Learning Plan") as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    if "planId" in data:
                        response.success()
                    else:
                        response.failure("No planId in response")
                except Exception as e:
                    response.failure(f"JSON parse error: {e}")
            else:
                response.failure(f"Plan generation failed: {response.status_code}")
    
    @task(20)
    def start_adaptive_session(self):
        """Start an adaptive learning session"""
        payload = {
            "userId": self.user_id,
            "topic": random.choice(QUIZ_TOPICS),
            "difficulty": random.choice(DIFFICULTY_LEVELS),
            "sessionType": "adaptive",
            "targetDuration": random.choice([15, 30, 45, 60])  # minutes
        }
        
        with self.client.post("/api/v1/sessions/start",
                             json=payload,
                             headers=self.headers,
                             catch_response=True,
                             name="Start Session") as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    if "sessionId" in data:
                        self.session_id = data["sessionId"]
                        response.success()
                    else:
                        response.failure("No sessionId in response")
                except Exception as e:
                    response.failure(f"JSON parse error: {e}")
            else:
                response.failure(f"Session start failed: {response.status_code}")
    
    @task(25)
    def get_next_question(self):
        """Get next question in adaptive session"""
        if not self.session_id:
            self.start_adaptive_session()
            return
        
        with self.client.get(f"/api/v1/sessions/{self.session_id}/next",
                            headers=self.headers,
                            catch_response=True,
                            name="Get Next Question") as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "question" in data:
                        response.success()
                        # Simulate thinking time
                        time.sleep(random.uniform(2, 5))
                        # Submit answer
                        self.submit_answer(data.get("questionId"))
                    else:
                        response.failure("No question in response")
                except Exception as e:
                    response.failure(f"JSON parse error: {e}")
            elif response.status_code == 404:
                # Session might have ended
                self.session_id = None
                response.success()
            else:
                response.failure(f"Get next question failed: {response.status_code}")
    
    def submit_answer(self, question_id=None):
        """Submit an answer to current question"""
        if not self.session_id:
            return
        
        payload = {
            "sessionId": self.session_id,
            "questionId": question_id or f"q_{random.randint(1000, 9999)}",
            "answer": random.randint(0, 3),
            "timeSpent": random.randint(5, 60),  # seconds
            "confidence": random.uniform(0.3, 1.0)
        }
        
        with self.client.post(f"/api/v1/sessions/{self.session_id}/submit",
                             json=payload,
                             headers=self.headers,
                             catch_response=True,
                             name="Submit Answer") as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Submit answer failed: {response.status_code}")
    
    @task(8)
    def get_analytics(self):
        """Fetch user analytics"""
        params = {
            "userId": self.user_id,
            "period": random.choice(["day", "week", "month", "all"]),
            "metrics": "performance,progress,engagement"
        }
        
        with self.client.get("/api/v1/analytics/user",
                            params=params,
                            headers=self.headers,
                            catch_response=True,
                            name="Get Analytics") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Analytics fetch failed: {response.status_code}")
    
    @task(3)
    def search_content(self):
        """Search for learning content"""
        params = {
            "q": random.choice(["calculus", "physics", "history", "programming", "biology"]),
            "type": random.choice(["quiz", "lesson", "practice", "all"]),
            "difficulty": random.choice(DIFFICULTY_LEVELS),
            "limit": 10
        }
        
        with self.client.get("/api/v1/search",
                            params=params,
                            headers=self.headers,
                            catch_response=True,
                            name="Search Content") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Search failed: {response.status_code}")
    
    @task(2)
    def get_recommendations(self):
        """Get personalized recommendations"""
        with self.client.get(f"/api/v1/recommendations/{self.user_id}",
                            headers=self.headers,
                            catch_response=True,
                            name="Get Recommendations") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Recommendations failed: {response.status_code}")
    
    def on_stop(self):
        """Clean up user session"""
        if self.session_id:
            # End session if still active
            self.client.post(f"/api/v1/sessions/{self.session_id}/end",
                           headers=self.headers,
                           name="End Session")

class QuizMentorUser(HttpUser):
    """QuizMentor API user for load testing"""
    tasks = [QuizMentorTaskSet]
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Global setup"""
        if DEBUG:
            print(f"Starting QuizMentor load test against {self.host}")

# Event handlers for reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test start event"""
    print(f"Load test starting - Target: {environment.host}")
    print(f"Users: {environment.parsed_options.num_users if environment.parsed_options else 'Not specified'}")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test stop event"""
    print("\nLoad test completed!")
    print(f"Total requests: {environment.stats.total.num_requests}")
    print(f"Failure rate: {environment.stats.total.fail_ratio:.2%}")
    print(f"Average response time: {environment.stats.total.avg_response_time:.2f}ms")
    print(f"RPS: {environment.stats.total.current_rps:.2f}")

# Custom failure threshold checker (for CI/CD integration)
@events.quitting.add_listener
def check_failure_threshold(environment, **kwargs):
    """Check if failure rate exceeds threshold"""
    threshold = float(os.getenv("QM_LOADTEST_THRESHOLD_FAIL_RATIO", "0.01"))  # 1% default
    p95_threshold = float(os.getenv("QM_LOADTEST_THRESHOLD_P95", "1000"))  # 1000ms default
    
    stats = environment.stats.total
    
    if stats.fail_ratio > threshold:
        print(f"\n❌ FAILURE: Error rate {stats.fail_ratio:.2%} exceeds threshold {threshold:.2%}")
        environment.process_exit_code = 1
    
    if stats.get_response_time_percentile(0.95) > p95_threshold:
        print(f"\n❌ FAILURE: P95 latency {stats.get_response_time_percentile(0.95):.2f}ms exceeds threshold {p95_threshold}ms")
        environment.process_exit_code = 1
    
    if environment.process_exit_code != 1:
        print(f"\n✅ SUCCESS: All thresholds passed!")
