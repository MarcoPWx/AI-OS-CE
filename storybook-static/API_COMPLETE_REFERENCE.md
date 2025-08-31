# 🔌 COMPLETE API & SERVICES REFERENCE

> **Status**: Complete | Version 3.0  
> **Last Updated**: 2025-08-28  
> **Base URL**: `https://api.quizmentor.com/v1`

## 📋 Table of Contents

1. [Authentication API](#authentication-api)
2. [User Management API](#user-management-api)
3. [Quiz API](#quiz-api)
4. [Analytics API](#analytics-api)
5. [Social Features API](#social-features-api)
6. [Premium/Payment API](#premium-payment-api)
7. [WebSocket Real-time API](#websocket-real-time-api)
8. [Admin API](#admin-api)
9. [Mock Services](#mock-services)
10. [Error Responses](#error-responses)

---

## 1. Authentication API

### POST /auth/register

**Create new user account**

```typescript
// Request
{
  email: string;
  password: string;
  username: string;
  referralCode?: string;
}

// Response
{
  user: {
    id: string;
    email: string;
    username: string;
    created_at: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

### POST /auth/login

**Authenticate user**

```typescript
// Request
{
  email: string;
  password: string;
  remember_me?: boolean;
}

// Response
{
  user: User;
  tokens: AuthTokens;
  session_id: string;
}
```

### POST /auth/oauth/{provider}

**OAuth authentication**

- **Providers**: google, github, facebook, apple

```typescript
// Request
{
  provider_token: string;
  provider_user_id: string;
}

// Response
{
  user: User;
  tokens: AuthTokens;
  is_new_user: boolean;
}
```

### POST /auth/refresh

**Refresh access token**

```typescript
// Request Header
Authorization: Bearer {refresh_token}

// Response
{
  access_token: string;
  expires_in: number;
}
```

### POST /auth/logout

**End user session**

```typescript
// Request Header
Authorization: Bearer {access_token}

// Response
{
  success: boolean;
  message: string;
}
```

### POST /auth/forgot-password

**Request password reset**

```typescript
// Request
{
  email: string;
}

// Response
{
  message: string;
  reset_token_sent: boolean;
}
```

---

## 2. User Management API

### GET /users/profile

**Get current user profile**

```typescript
// Response
{
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
    level: number;
    xp: number;
    total_points: number;
    streak: number;
    achievements: Achievement[];
    stats: UserStats;
    preferences: UserPreferences;
    created_at: string;
    updated_at: string;
  }
}
```

### PATCH /users/profile

**Update user profile**

```typescript
// Request
{
  username?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Partial<UserPreferences>;
}

// Response
{
  user: User;
  updated_fields: string[];
}
```

### GET /users/{userId}

**Get public user profile**

```typescript
// Response
{
  user: PublicUserProfile;
  is_friend: boolean;
  can_challenge: boolean;
}
```

### DELETE /users/account

**Delete user account**

```typescript
// Request
{
  password: string;
  reason?: string;
  feedback?: string;
}

// Response
{
  success: boolean;
  deletion_date: string;
  can_recover_until: string;
}
```

---

## 3. Quiz API

### GET /quiz/categories

**Get all quiz categories**

```typescript
// Query Params
?skill_level=beginner|intermediate|expert
&include_stats=true

// Response
{
  categories: [{
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty_levels: string[];
    question_count: number;
    user_stats?: {
      attempts: number;
      best_score: number;
      accuracy: number;
    };
  }];
}
```

### GET /quiz/questions

**Get quiz questions**

```typescript
// Query Params
?category=javascript
&difficulty=medium
&count=10
&exclude_ids=[]

// Response
{
  questions: [{
    id: string;
    category: string;
    difficulty: string;
    type: 'multiple_choice' | 'true_false' | 'code_completion';
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    points: number;
    time_limit: number;
    hints?: string[];
    media?: {
      type: 'image' | 'video' | 'code';
      url: string;
    };
  }];
  session_id: string;
}
```

### POST /quiz/start

**Start new quiz session**

```typescript
// Request
{
  category: string;
  difficulty: string;
  mode: 'classic' | 'timed' | 'survival' | 'multiplayer';
  settings?: {
    time_limit?: number;
    lives?: number;
    allow_hints?: boolean;
  };
}

// Response
{
  session: {
    id: string;
    questions: Question[];
    started_at: string;
    expires_at: string;
  };
}
```

### POST /quiz/answer

**Submit quiz answer**

```typescript
// Request
{
  session_id: string;
  question_id: string;
  answer: number;
  time_taken: number;
  hint_used: boolean;
}

// Response
{
  correct: boolean;
  correct_answer: number;
  explanation: string;
  points_earned: number;
  combo: number;
  lives_remaining?: number;
}
```

### POST /quiz/complete

**Complete quiz session**

```typescript
// Request
{
  session_id: string;
  answers: Answer[];
  total_time: number;
}

// Response
{
  results: {
    score: number;
    accuracy: number;
    time_taken: number;
    questions_answered: number;
    correct_answers: number;
    grade: string;
    xp_earned: number;
    achievements_unlocked: Achievement[];
    leaderboard_position?: number;
  };
}
```

---

## 4. Analytics API

### GET /analytics/dashboard

**Get user analytics dashboard**

```typescript
// Query Params
?period=week|month|year|all
&categories=[]

// Response
{
  overview: {
    total_quizzes: number;
    total_points: number;
    average_accuracy: number;
    time_spent: number;
    current_streak: number;
    best_streak: number;
  };
  performance: {
    by_date: ChartData[];
    by_category: ChartData[];
    by_difficulty: ChartData[];
  };
  improvements: {
    accuracy_trend: number;
    speed_trend: number;
    consistency_score: number;
  };
}
```

### GET /analytics/progress

**Get learning progress**

```typescript
// Response
{
  overall_progress: number;
  categories: [{
    id: string;
    name: string;
    progress: number;
    mastery_level: string;
    next_milestone: string;
  }];
  skills: [{
    name: string;
    level: number;
    xp_to_next: number;
  }];
}
```

### GET /analytics/reports

**Generate detailed reports**

```typescript
// Query Params
?type=weekly|monthly|custom
&format=json|pdf|csv
&start_date=2025-01-01
&end_date=2025-01-31

// Response
{
  report: {
    id: string;
    type: string;
    period: DateRange;
    data: DetailedAnalytics;
    download_url?: string;
  };
}
```

---

## 5. Social Features API

### GET /social/leaderboard

**Get leaderboard rankings**

```typescript
// Query Params
?scope=global|friends|country|category
&period=daily|weekly|monthly|all
&limit=100
&offset=0

// Response
{
  leaderboard: [{
    rank: number;
    user: PublicUserProfile;
    score: number;
    quizzes_played: number;
    accuracy: number;
    change: number; // Position change
  }];
  user_rank?: number;
}
```

### GET /social/friends

**Get friends list**

```typescript
// Response
{
  friends: [{
    id: string;
    username: string;
    avatar_url: string;
    status: 'online' | 'offline' | 'playing';
    level: number;
    last_seen?: string;
  }];
  pending_requests: FriendRequest[];
}
```

### POST /social/challenge

**Challenge another user**

```typescript
// Request
{
  challenged_user_id: string;
  category: string;
  difficulty: string;
  wager_points?: number;
  message?: string;
}

// Response
{
  challenge: {
    id: string;
    status: 'pending';
    expires_at: string;
  };
}
```

### POST /social/multiplayer/create

**Create multiplayer room**

```typescript
// Request
{
  name: string;
  category: string;
  difficulty: string;
  max_players: number;
  is_private: boolean;
  settings: MultiplayerSettings;
}

// Response
{
  room: {
    id: string;
    code: string;
    host_id: string;
    players: Player[];
    status: 'waiting';
    join_url: string;
  };
}
```

---

## 6. Premium/Payment API

### GET /premium/plans

**Get available subscription plans**

```typescript
// Response
{
  plans: [{
    id: string;
    name: string;
    price: number;
    currency: string;
    period: 'monthly' | 'yearly';
    features: string[];
    trial_days: number;
    discount_percentage?: number;
  }];
  current_plan?: string;
}
```

### POST /premium/subscribe

**Subscribe to premium plan**

```typescript
// Request
{
  plan_id: string;
  payment_method: 'card' | 'paypal' | 'apple' | 'google';
  payment_token: string;
  coupon_code?: string;
}

// Response
{
  subscription: {
    id: string;
    plan: string;
    status: 'active';
    started_at: string;
    renews_at: string;
    amount: number;
  };
  receipt: PaymentReceipt;
}
```

### POST /premium/cancel

**Cancel subscription**

```typescript
// Request
{
  reason?: string;
  immediate?: boolean;
}

// Response
{
  cancellation: {
    effective_date: string;
    can_reactivate_until: string;
    refund_amount?: number;
  };
}
```

---

## 7. WebSocket Real-time API

### Connection

```javascript
const ws = new WebSocket('wss://api.quizmentor.com/ws');

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: 'auth',
      token: accessToken,
    }),
  );
};
```

### Event Types

#### quiz.live

**Live quiz updates**

```typescript
// Incoming
{
  type: 'quiz.live',
  data: {
    event: 'player_joined' | 'player_answered' | 'round_complete';
    payload: any;
  }
}
```

#### notification

**Real-time notifications**

```typescript
{
  type: 'notification',
  data: {
    id: string;
    title: string;
    message: string;
    action?: string;
    priority: 'low' | 'medium' | 'high';
  }
}
```

#### presence

**User presence updates**

```typescript
{
  type: 'presence',
  data: {
    user_id: string;
    status: 'online' | 'offline' | 'away';
  }
}
```

---

## 8. Admin API

### GET /admin/stats

**Get platform statistics**

```typescript
// Response
{
  users: {
    total: number;
    active_daily: number;
    active_monthly: number;
    new_today: number;
  }
  quizzes: {
    total_played: number;
    today: number;
    average_per_user: number;
  }
  revenue: {
    monthly: number;
    yearly: number;
    arpu: number;
  }
}
```

### POST /admin/content/question

**Add new question**

```typescript
// Request
{
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  tags: string[];
  reviewed_by?: string;
}

// Response
{
  question: Question;
  validation_results: ValidationResult[];
}
```

### PATCH /admin/users/{userId}

**Moderate user account**

```typescript
// Request
{
  action: 'warn' | 'suspend' | 'ban' | 'restore';
  reason: string;
  duration?: number; // hours
  message?: string;
}

// Response
{
  user: User;
  action_taken: string;
  expires_at?: string;
}
```

---

## 9. Mock Services

### Mock Engine Configuration

```typescript
// services/mockEngine.ts
class MockEngine {
  private latency = 200; // ms
  private errorRate = 0.02; // 2% error rate

  async request(endpoint: string, options: RequestOptions) {
    // Simulate network latency
    await this.simulateLatency();

    // Simulate random errors
    if (Math.random() < this.errorRate) {
      throw new NetworkError('Simulated network error');
    }

    // Return mock data
    return this.getMockData(endpoint, options);
  }

  private getMockData(endpoint: string, options: RequestOptions) {
    const mockHandlers = {
      '/auth/login': this.mockLogin,
      '/quiz/questions': this.mockQuestions,
      '/analytics/dashboard': this.mockAnalytics,
      // ... more handlers
    };

    const handler = mockHandlers[endpoint];
    return handler ? handler(options) : this.defaultMock();
  }
}
```

### Mock Data Generators

```typescript
// services/mockDataGenerators.ts
export const generateMockUser = (): User => ({
  id: faker.datatype.uuid(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  level: faker.datatype.number({ min: 1, max: 50 }),
  xp: faker.datatype.number({ min: 0, max: 10000 }),
  // ... more fields
});

export const generateMockQuestion = (): Question => ({
  id: faker.datatype.uuid(),
  question: faker.lorem.sentence(),
  options: Array(4)
    .fill(null)
    .map(() => faker.lorem.words()),
  correct_answer: faker.datatype.number({ min: 0, max: 3 }),
  // ... more fields
});
```

---

## 10. Error Responses

### Standard Error Format

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
  }
}
```

### Error Codes

| Code       | HTTP Status | Description              |
| ---------- | ----------- | ------------------------ |
| AUTH_001   | 401         | Invalid credentials      |
| AUTH_002   | 401         | Token expired            |
| AUTH_003   | 403         | Insufficient permissions |
| USER_001   | 404         | User not found           |
| USER_002   | 409         | Username already exists  |
| QUIZ_001   | 404         | Quiz session not found   |
| QUIZ_002   | 400         | Invalid answer format    |
| QUIZ_003   | 410         | Quiz session expired     |
| PAY_001    | 402         | Payment required         |
| PAY_002    | 400         | Invalid payment method   |
| RATE_001   | 429         | Rate limit exceeded      |
| SERVER_001 | 500         | Internal server error    |
| SERVER_002 | 503         | Service unavailable      |

---

## 🔐 Authentication & Security

### Headers Required

```http
Authorization: Bearer {access_token}
X-API-Version: 1.0
X-Client-ID: {client_id}
X-Request-ID: {uuid}
```

### Rate Limiting

- **Anonymous**: 60 requests/hour
- **Authenticated**: 600 requests/hour
- **Premium**: 6000 requests/hour

### CORS Configuration

```typescript
{
  origin: ['https://app.quizmentor.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
```

---

## 📊 API Monitoring & SLAs

### Service Level Agreements

- **Uptime**: 99.9% (43.2 minutes downtime/month)
- **Response Time**: p95 < 200ms, p99 < 500ms
- **Error Rate**: < 1%

### Health Check Endpoints

- **GET /health**: Basic health check
- **GET /health/detailed**: Detailed system status
- **GET /metrics**: Prometheus metrics

---

## 🔗 Related Documentation

- [WebSocket Events Guide](./WEBSOCKET_GUIDE.md)
- [Authentication Flow](./flows/AUTH_FLOW.md)
- [Error Handling](./ERROR_HANDLING.md)
- [API Migration Guide](./API_MIGRATION.md)
