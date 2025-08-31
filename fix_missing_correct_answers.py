#!/usr/bin/env python3
"""
Fix missing correctAnswer fields in quiz data
"""

import json
import re

def infer_correct_answer(question, options, explanation):
    """Infer correct answer from explanation text"""
    explanation_lower = explanation.lower()
    
    # Score each option based on similarity to explanation
    scores = []
    for i, opt in enumerate(options):
        opt_lower = opt.lower()
        score = 0
        
        # Check for key words from option in explanation
        opt_words = set(word for word in opt_lower.split() if len(word) > 3)
        exp_words = set(word for word in explanation_lower.split() if len(word) > 3)
        
        # Count matching words
        common_words = opt_words & exp_words
        score = len(common_words)
        
        # Bonus for exact phrases
        if any(phrase in explanation_lower for phrase in [opt_lower[:20], opt_lower[-20:]] if len(phrase) > 10):
            score += 5
        
        scores.append(score)
    
    # Return index with highest score
    return scores.index(max(scores))

# Manual mappings for backend questions based on their explanations
manual_mappings = {
    'backend-architecture-0': 1,  # "Separation of concerns and testability"
    'backend-architecture-1': 2,  # "Service Mesh provides advanced traffic management"
    'backend-architecture-2': 1,  # "Automatically updates all containers"
    'backend-architecture-3': 1,  # "Automatically scales based on traffic"
    'backend-auth-security-0': 1,  # "JWT (JSON Web Tokens) enable stateless authentication"
    'backend-auth-security-1': 2,  # "OAuth 2.0 with JWT for token-based authentication"
    'backend-auth-security-2': 1,  # "bcrypt or Argon2 for secure password hashing"
    'backend-caching-0': 1,  # "Redis for session storage and caching"
    'backend-caching-1': 2,  # "Cache-Aside pattern"
    'backend-caching-2': 1,  # "TTL (Time To Live) defines cache expiration"
    'backend-caching-3': 1,  # "Event-based invalidation triggers cache updates"
    'backend-resilience-0': 2,  # "Circuit breaker pattern prevents cascading failures"
    'backend-resilience-1': 1,  # "Retry with exponential backoff"
    'backend-resilience-2': 2,  # "Health checks verify service availability"
    'backend-resilience-3': 1,  # "Graceful degradation maintains core functionality"
    'backend-rate-limiting-0': 1,  # "Token bucket algorithm for flexible rate limiting"
    'backend-rate-limiting-1': 2,  # "429 Too Many Requests"
    'backend-rate-limiting-2': 1,  # "Redis for distributed rate limiting"
    'backend-data-patterns-0': 1,  # "CQRS separates read and write models"
    'backend-data-patterns-1': 2,  # "Event Sourcing stores all state changes as events"
    'backend-data-patterns-2': 1,  # "Saga pattern manages distributed transactions"
    'backend-data-patterns-3': 2,  # "Outbox pattern ensures reliable message publishing"
    'backend-data-patterns-4': 1,  # "Database per service ensures loose coupling"
    'backend-async-processing-0': 1,  # "Message queues enable reliable async processing"
    'backend-async-processing-1': 2,  # "Publish-Subscribe pattern for event-driven architecture"
    'backend-async-processing-2': 1,  # "Idempotency keys prevent duplicate processing"
    'backend-async-processing-3': 1,  # "Dead letter queues capture failed messages"
    'backend-observability-0': 1,  # "Distributed tracing tracks requests across services"
    'backend-observability-1': 2,  # "Structured logging with correlation IDs"
    'backend-observability-2': 1,  # "Prometheus for metrics collection"
    'backend-observability-3': 2,  # "OpenTelemetry for vendor-agnostic observability"
    'backend-observability-4': 1,  # "Alerts notify of critical issues requiring attention"
    'backend-api-design-0': 1,  # "RESTful principles ensure consistent API design"
    'backend-api-design-1': 2,  # "API versioning maintains backward compatibility"
    'backend-api-design-2': 1,  # "GraphQL allows clients to request specific data"
    'backend-api-design-3': 1,  # "OpenAPI/Swagger for API documentation"
    'backend-scaling-0': 1,  # "Horizontal scaling adds more servers"
    'backend-scaling-1': 2,  # "Load balancing distributes traffic across servers"
    'backend-scaling-2': 1,  # "Database sharding partitions data horizontally"
    'backend-scaling-3': 1,  # "CDN reduces load on origin servers"
    'backend-scaling-4': 2,  # "Connection pooling reuses database connections"
    'backend-testing-0': 1,  # "Unit tests verify individual components"
    'backend-testing-1': 2,  # "Integration tests verify component interactions"
    'backend-testing-2': 1,  # "Contract testing ensures API compatibility"
    'backend-deployment-0': 1,  # "Blue-green deployment minimizes downtime"
    'backend-deployment-1': 2,  # "Feature flags enable gradual rollouts"
    'backend-deployment-2': 1,  # "Rollback strategy quickly reverts bad deployments"
    'backend-deployment-3': 1,  # "Infrastructure as Code ensures reproducible deployments"
}

def main():
    # Load quiz data
    with open('/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json', 'r') as f:
        data = json.load(f)
    
    fixed_count = 0
    
    for q in data['questions']:
        if 'correctAnswer' not in q:
            qid = q['id']
            
            if qid in manual_mappings:
                # Use manual mapping
                q['correctAnswer'] = manual_mappings[qid]
                fixed_count += 1
                print(f"Fixed {qid}: correctAnswer = {q['correctAnswer']}")
            else:
                # Try to infer from explanation
                inferred = infer_correct_answer(q['question'], q['options'], q['explanation'])
                q['correctAnswer'] = inferred
                fixed_count += 1
                print(f"Inferred {qid}: correctAnswer = {inferred}")
    
    # Save fixed data
    with open('/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nFixed {fixed_count} questions with missing correctAnswer fields")

if __name__ == "__main__":
    main()
