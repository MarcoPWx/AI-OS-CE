# QuizMentor API Documentation

## Overview

QuizMentor API provides endpoints for quiz functionality, user management, analytics, multiplayer features, and ecosystem integration.

Note: The mobile app primarily talks to Supabase (Auth + REST) with Row Level Security. In local development, HTTP is mocked via MSW (web/tests) and a MockEngine (React Native). The Node API described here is optional and can be adopted incrementally.

**Base URL**: `http://localhost:3002/api` (Development)
**Production URL**: `https://api.quizmentor.com` (Production)

## Authentication

### Endpoints

#### GitHub OAuth

```http
POST /api/auth/github
Content-Type: application/json

{
  "code": "github_oauth_code",
  "state": "csrf_state_token"
}
```

**Response**:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": {
      "display_name": "John Doe",
      "avatar_url": "https://github.com/avatar.jpg"
    }
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

#### Mock Authentication (Development Only)

```http
POST /api/auth/mock
Content-Type: application/json

{
  "user_type": "developer" | "student" | "premium"
}
```

## Quiz Management

### Get Quiz Categories

```http
GET /api/quiz/categories
```

**Response**:

```json
{
  "categories": [
    {
      "id": "javascript",
      "name": "JavaScript",
      "description": "Modern JavaScript concepts",
      "question_count": 150,
      "difficulty_levels": ["beginner", "intermediate", "advanced"],
      "completion_rate": 0.78,
      "trending": true
    }
  ]
}
```

### Create Quiz Session

```http
POST /api/quiz/session
Content-Type: application/json

{
  "category_id": "javascript",
  "difficulty": "intermediate",
  "question_count": 10,
  "mode": "practice" | "multiplayer" | "challenge"
}
```

**Response**:

```json
{
  "session_id": "session_uuid",
  "questions": [
    {
      "id": "question_id",
      "text": "What is closure in JavaScript?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "difficulty": "intermediate",
      "category": "javascript",
      "time_limit": 30
    }
  ],
  "session_config": {
    "total_questions": 10,
    "time_per_question": 30,
    "scoring_method": "standard"
  }
}
```

### Submit Answer

```http
POST /api/quiz/answer
Content-Type: application/json

{
  "session_id": "session_uuid",
  "question_id": "question_id",
  "selected_answer": 2,
  "response_time": 15000,
  "confidence_level": 0.8
}
```

**Response**:

```json
{
  "correct": true,
  "explanation": "Detailed explanation of the answer",
  "xp_gained": 15,
  "combo_multiplier": 1.5,
  "achievements": [
    {
      "id": "streak_5",
      "name": "5 Streak",
      "description": "Answer 5 questions correctly in a row"
    }
  ],
  "trust_impact": 0.01,
  "feedback": "Great job! You're building strong fundamentals."
}
```

## Gamification & Analytics

### Get User Stats

```http
GET /api/user/stats
Authorization: Bearer {jwt_token}
```

**Response**:

```json
{
  "user_id": "user_id",
  "stats": {
    "xp": 1250,
    "level": 8,
    "streak": 12,
    "trust_score": 0.85,
    "motivation_state": "focused",
    "accuracy_history": [0.8, 0.9, 0.7, 0.95],
    "categories_mastered": ["javascript", "react"],
    "total_questions_answered": 456,
    "learning_velocity": 0.75
  },
  "achievements": [
    {
      "id": "trusted_learner",
      "name": "Trusted Learner",
      "rarity": "rare",
      "unlocked_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### Track Analytics Event

```http
POST /api/analytics/event
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "event_name": "quiz_completed",
  "properties": {
    "category": "javascript",
    "score": 85,
    "time_taken": 300,
    "difficulty": "intermediate"
  },
  "user_context": {
    "trust_score": 0.85,
    "motivation_state": "focused",
    "session_id": "session_uuid"
  }
}
```

### Get Trust Metrics

```http
GET /api/analytics/trust-metrics
Authorization: Bearer {jwt_token}
```

**Response**:

```json
{
  "trust_score": 0.85,
  "trust_trend": "increasing",
  "trust_factors": {
    "consistency": 0.9,
    "accuracy": 0.8,
    "engagement": 0.85,
    "progression": 0.9
  },
  "motivation_state": "focused",
  "confidence_level": 0.82,
  "recommendations": ["Continue current learning pace", "Try advanced JavaScript topics"]
}
```

## Multiplayer Features

### Get Active Rooms

```http
GET /api/multiplayer/rooms
```

**Response**:

```json
{
  "rooms": [
    {
      "id": "room_uuid",
      "name": "JavaScript Masters",
      "category": "javascript",
      "difficulty": "advanced",
      "players": 3,
      "max_players": 4,
      "status": "waiting",
      "created_by": "user_id",
      "created_at": "2024-12-27T15:30:00Z"
    }
  ]
}
```

### Create Room

```http
POST /api/multiplayer/rooms
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "React Quiz Battle",
  "category": "react",
  "difficulty": "intermediate",
  "max_players": 4,
  "time_per_question": 30,
  "question_count": 10,
  "is_private": false
}
```

### Join Room

```http
POST /api/multiplayer/rooms/{room_id}/join
Authorization: Bearer {jwt_token}
```

**Response**:

```json
{
  "success": true,
  "room": {
    "id": "room_uuid",
    "players": [
      {
        "id": "user_id",
        "display_name": "John Doe",
        "avatar_url": "https://avatar.url",
        "ready": false
      }
    ],
    "websocket_url": "ws://localhost:3002/multiplayer/{room_id}"
  }
}
```

## Ecosystem Integration

### Get Ecosystem Products

```http
GET /api/ecosystem/products
```

**Response**:

```json
{
  "products": [
    {
      "id": "devmentor",
      "name": "DevMentor",
      "tagline": "AI Development Assistant",
      "icon": "🧠",
      "gradient": ["#667eea", "#764ba2"],
      "url": "https://devmentor.ai",
      "status": "beta",
      "description": "AI assistant that learns your coding patterns"
    }
  ]
}
```

### Track Ecosystem Interaction

```http
POST /api/ecosystem/interaction
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "widget_action": "expand" | "product_click" | "minimize",
  "product_id": "devmentor",
  "source_product": "quizmentor",
  "user_context": {
    "trust_score": 0.85,
    "session_duration": 1200
  }
}
```

## Performance Monitoring

### Get Performance Metrics

```http
GET /api/performance/metrics
Authorization: Bearer {jwt_token}
```

**Response**:

```json
{
  "current_session": {
    "fps": 59.8,
    "memory_usage": 145.2,
    "network_requests": 12,
    "render_time": 16.7
  },
  "historical": {
    "avg_fps": 58.5,
    "avg_memory": 142.1,
    "performance_score": 0.92
  },
  "thresholds": {
    "fps_warning": 50,
    "fps_critical": 30,
    "memory_warning": 150,
    "memory_critical": 200
  }
}
```

## WebSocket Events (Multiplayer)

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3002/multiplayer/{room_id}');

// Authentication
ws.send(
  JSON.stringify({
    type: 'auth',
    token: 'jwt_token',
  }),
);
```

### Events

#### Player Joined

```json
{
  "type": "player_joined",
  "player": {
    "id": "user_id",
    "display_name": "Jane Doe",
    "avatar_url": "https://avatar.url"
  },
  "room_state": {
    "players": [...],
    "status": "waiting"
  }
}
```

#### Game Started

```json
{
  "type": "game_started",
  "question": {
    "id": "question_id",
    "text": "What is React?",
    "options": ["Library", "Framework", "Language", "Tool"],
    "time_limit": 30
  },
  "question_number": 1,
  "total_questions": 10
}
```

#### Answer Submitted

```json
{
  "type": "answer_submitted",
  "player_id": "user_id",
  "answer_index": 0,
  "response_time": 15000,
  "is_correct": true
}
```

#### Game Results

```json
{
  "type": "game_completed",
  "results": [
    {
      "player_id": "user_id",
      "display_name": "John Doe",
      "score": 85,
      "correct_answers": 8,
      "total_time": 240,
      "rank": 1
    }
  ],
  "room_stats": {
    "avg_score": 72,
    "completion_rate": 0.8
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "category_id",
      "reason": "Category not found"
    }
  },
  "request_id": "req_uuid"
}
```

### Error Codes

- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `VALIDATION_ERROR` - Invalid request parameters
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error
- `WEBSOCKET_ERROR` - WebSocket connection issues

## Rate Limiting

### Limits

- **Authentication**: 10 requests per minute
- **Quiz API**: 100 requests per minute
- **Analytics**: 1000 events per minute
- **Multiplayer**: 50 requests per minute

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Development Tools

### Health Check

```http
GET /api/health
```

**Response**:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected",
    "websocket": "active"
  },
  "uptime": 3600
}
```

### API Documentation

```http
GET /api/docs
```

Returns interactive API documentation (Swagger/OpenAPI).

---

**Last Updated**: December 2024
**API Version**: 1.0.0
**Support**: api-support@quizmentor.com
