import type { Meta, StoryObj } from '@storybook/react';
import { S2SDashboard } from './S2SDashboard';

const meta: Meta<typeof S2SDashboard> = {
  title: 'Architecture/S2S Service Mesh',
  component: S2SDashboard,
  parameters: {
    layout: 'fullscreen',
    helpDocs: [
      { href: '?path=/story/labs-technology-overview-lab--page', title: 'Technology Overview Lab' },
    ],
    docs: {
      description: {
        component: `
## 🌐 Service-to-Service (S2S) Architecture

Microservices event-driven architecture with comprehensive service mesh, event sourcing, and distributed tracing.

### System Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                    (Kong / AWS API GW)                      │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
    ┌────────▼────────┐                 ┌────────▼────────┐
    │  Auth Service   │◄────────────────►│  User Service   │
    │  (Cognito/Auth0)│                 │   (Profile)     │
    └────────┬────────┘                 └────────┬────────┘
             │                                    │
    ┌────────▼────────────────────────────────────▼────────┐
    │                    Event Bus (Kafka/SNS)             │
    └──┬──────┬──────┬──────┬──────┬──────┬──────┬────────┘
       │      │      │      │      │      │      │
    ┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐┌──▼──┐
    │Quiz ││Gami-││Audit││Noti-││Analy││Lead-││Pay- │
    │Svc  ││fica ││Log  ││fica ││tics ││board││ment │
    └─────┘└─────┘└─────┘└─────┘└─────┘└─────┘└─────┘
\`\`\`

### Core Services

#### 🔐 Authentication Service
- **Responsibilities**: User auth, JWT tokens, MFA, session management
- **Events Published**: auth.login, auth.logout, auth.token.refresh
- **Events Consumed**: user.created, user.deleted, security.alert
- **SLA**: 99.99% uptime, <50ms response

#### 👤 User Service
- **Responsibilities**: Profile management, preferences, settings
- **Events Published**: user.created, user.updated, user.deleted, user.preference.changed
- **Events Consumed**: auth.login, gamification.achievement
- **SLA**: 99.9% uptime, <100ms response

#### 📝 Quiz Service
- **Responsibilities**: Quiz CRUD, questions, answers, scoring
- **Events Published**: quiz.started, quiz.completed, quiz.abandoned, question.answered
- **Events Consumed**: user.created, gamification.xp.calculated
- **SLA**: 99.9% uptime, <200ms response

#### 🎮 Gamification Service
- **Responsibilities**: XP, achievements, streaks, quests, rewards
- **Events Published**: xp.earned, achievement.unlocked, streak.updated, quest.completed
- **Events Consumed**: quiz.completed, user.action, daily.login
- **SLA**: 99.5% uptime, <300ms response

#### 📊 Analytics Service
- **Responsibilities**: Metrics, reporting, insights, ML predictions
- **Events Published**: report.generated, insight.discovered, prediction.made
- **Events Consumed**: ALL events (event store pattern)
- **SLA**: 95% uptime, <5s response (batch)

#### 🔔 Notification Service
- **Responsibilities**: Email, push, SMS, in-app notifications
- **Events Published**: notification.sent, notification.failed, notification.opened
- **Events Consumed**: achievement.unlocked, streak.warning, quest.available
- **SLA**: 99% uptime, <1s delivery

#### 🏆 Leaderboard Service
- **Responsibilities**: Rankings, competitions, tournaments
- **Events Published**: rank.changed, tournament.started, competition.ended
- **Events Consumed**: xp.earned, quiz.completed, achievement.unlocked
- **SLA**: 99% uptime, <500ms response

#### 💳 Payment Service
- **Responsibilities**: Subscriptions, purchases, billing
- **Events Published**: payment.processed, subscription.created, payment.failed
- **Events Consumed**: user.created, subscription.expired
- **SLA**: 99.99% uptime, <2s response

### Event Schemas

#### Base Event Structure
\`\`\`typescript
interface S2SEvent<T = any> {
  // Identification
  eventId: string;           // UUID v4
  eventType: string;         // service.entity.action
  eventVersion: string;      // Semantic versioning
  timestamp: string;         // ISO 8601
  
  // Source
  source: {
    service: string;         // Service name
    instance: string;        // Instance/pod ID
    environment: string;     // dev/staging/prod
    region?: string;         // AWS region
  };
  
  // Context
  context: {
    correlationId: string;   // Request trace ID
    causationId?: string;    // Parent event ID
    userId?: string;         // User identifier
    sessionId?: string;      // Session ID
    tenantId?: string;       // Multi-tenant ID
    requestId?: string;      // Original request ID
  };
  
  // Payload
  data: T;                   // Type-safe payload
  
  // Metadata
  metadata: {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ttl?: number;            // Time to live (seconds)
    retry?: number;          // Retry attempt
    sensitive?: boolean;     // Contains PII
    encrypted?: boolean;     // Payload encrypted
  };
}
\`\`\`

### Communication Patterns

#### 1. Request-Response (Synchronous)
\`\`\`
Client → API Gateway → Service A → Response
         Rate Limit    Business     JSON
         Auth Check    Logic        
\`\`\`

#### 2. Event-Driven (Asynchronous)
\`\`\`
Service A → Event → Event Bus → Service B
           Publish   (Kafka)     Subscribe
                                 Process
\`\`\`

#### 3. Command Query Responsibility Segregation (CQRS)
\`\`\`
Write Path:  Client → Command → Write Service → Event Store
Read Path:   Client → Query → Read Service → Materialized View
\`\`\`

#### 4. Saga Pattern (Distributed Transactions)
\`\`\`
Order Saga:
1. Quiz Completed → Gamification (Calculate XP)
2. XP Calculated → Achievement (Check Unlocks)  
3. Achievement Unlocked → Notification (Send Alert)
4. Notification Sent → Analytics (Track Event)

Compensation on failure at any step
\`\`\`

### Service Contracts

#### Quiz Completion Contract
\`\`\`typescript
// Event: quiz.completed
interface QuizCompletedEvent {
  quizId: string;
  userId: string;
  score: number;
  timeSpent: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  answers: Array<{
    questionId: string;
    answer: string;
    correct: boolean;
    timeSpent: number;
  }>;
}

// Expected Consumers & Actions:
// - Gamification: Calculate XP, check achievements
// - Analytics: Update user statistics
// - Leaderboard: Update rankings
// - Notification: Send completion alert (if enabled)
\`\`\`

### Resilience Patterns

#### Circuit Breaker
\`\`\`typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = new Date();
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
      }
      throw error;
    }
  }
}
\`\`\`

#### Retry with Exponential Backoff
\`\`\`typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
    }
  }
}
\`\`\`

### Monitoring & Observability

#### Distributed Tracing
\`\`\`
Request ID: req-123abc
│
├─► Auth Service (15ms)
│   └─► User DB (8ms)
│
├─► Quiz Service (45ms)
│   ├─► Question DB (12ms)
│   └─► Cache (2ms)
│
├─► Gamification Service (78ms)
│   ├─► XP Calculation (5ms)
│   ├─► Achievement Check (23ms)
│   └─► Event Publish (10ms)
│
└─► Total: 138ms
\`\`\`

#### Health Checks
\`\`\`typescript
// GET /health
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 3600,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "kafka": "degraded",
    "s3": "healthy"
  },
  "metrics": {
    "requests_per_second": 1250,
    "average_latency_ms": 45,
    "error_rate": 0.001
  }
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'Architecture Overview',
};

export const EventCatalog: Story = {
  name: 'Complete Event Catalog',
  parameters: {
    docs: {
      description: {
        story: `
### 📚 Complete S2S Event Catalog

#### Authentication Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| auth.login.success | User logged in | userId, method, ip, device | User, Gamification, Analytics, Audit |
| auth.login.failed | Login attempt failed | email, reason, ip | Audit, Security, Analytics |
| auth.logout | User logged out | userId, sessionDuration | Analytics, Audit |
| auth.token.refresh | JWT token refreshed | userId, oldToken, newToken | Audit |
| auth.mfa.enabled | MFA activated | userId, method | User, Audit, Notification |
| auth.password.reset | Password reset | userId, ip | Notification, Audit, Security |
| auth.session.expired | Session timeout | userId, lastActivity | Analytics, Audit |
| auth.account.locked | Account locked | userId, reason, duration | Notification, Security, Audit |

#### User Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| user.created | New user registered | userId, email, source | All services |
| user.updated | Profile updated | userId, changes | Gamification, Notification |
| user.deleted | Account deleted | userId, reason | All services |
| user.verified | Email verified | userId, email | Notification, Gamification |
| user.preference.changed | Settings updated | userId, preferences | Notification, Quiz |
| user.avatar.changed | Avatar updated | userId, avatarUrl | Leaderboard, Social |
| user.subscription.changed | Plan changed | userId, plan, tier | Payment, Features |
| user.onboarding.completed | Finished onboarding | userId, steps | Gamification, Analytics |

#### Quiz Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| quiz.created | New quiz created | quizId, category, difficulty | Analytics, Search |
| quiz.started | User started quiz | userId, quizId, timestamp | Gamification, Analytics |
| quiz.question.answered | Answer submitted | userId, questionId, answer, correct | Analytics, Gamification |
| quiz.completed | Quiz finished | userId, quizId, score, duration | Gamification, Leaderboard, Analytics |
| quiz.abandoned | Quiz not finished | userId, quizId, progress | Analytics, Gamification |
| quiz.shared | Quiz shared | userId, quizId, platform | Social, Analytics |
| quiz.rated | Quiz rated | userId, quizId, rating | Analytics, Recommendation |
| quiz.reported | Quiz flagged | userId, quizId, reason | Moderation, Admin |

#### Gamification Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| gamification.xp.earned | XP awarded | userId, amount, source, multipliers | Leaderboard, User, Analytics |
| gamification.level.up | Level increased | userId, oldLevel, newLevel, rewards | Notification, User, Analytics |
| gamification.achievement.unlocked | Achievement earned | userId, achievementId, xpReward | Notification, User, Social |
| gamification.streak.updated | Streak changed | userId, days, bonus | Notification, Analytics |
| gamification.streak.broken | Streak lost | userId, previousDays | Notification, Analytics |
| gamification.quest.assigned | Quest given | userId, questId, requirements | Notification, User |
| gamification.quest.progress | Quest updated | userId, questId, progress | User, Analytics |
| gamification.quest.completed | Quest finished | userId, questId, rewards | Notification, User, Analytics |
| gamification.reward.granted | Reward given | userId, type, value | User, Notification |
| gamification.powerup.used | Power-up activated | userId, powerupId, effect | Analytics, Quiz |

#### Leaderboard Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| leaderboard.rank.changed | Rank updated | userId, oldRank, newRank, board | Notification, Analytics |
| leaderboard.top10.entered | Entered top 10 | userId, rank, board | Notification, Social |
| leaderboard.friend.passed | Passed friend | userId, friendId, board | Notification, Social |
| leaderboard.tournament.started | Tournament began | tournamentId, participants | Notification, Gamification |
| leaderboard.tournament.ended | Tournament finished | tournamentId, winners, prizes | Notification, Payment |
| leaderboard.season.reset | Season reset | season, finalRanks | Notification, Analytics |

#### Notification Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| notification.sent | Notification sent | userId, type, channel, content | Analytics, Audit |
| notification.delivered | Confirmed delivery | notificationId, timestamp | Analytics |
| notification.opened | User opened | notificationId, userId, timestamp | Analytics |
| notification.clicked | Link clicked | notificationId, userId, action | Analytics |
| notification.failed | Send failed | notificationId, reason, retries | Audit, Monitoring |
| notification.unsubscribed | User opted out | userId, channel, reason | User, Analytics |

#### Payment Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| payment.initiated | Payment started | userId, amount, method | Audit, Analytics |
| payment.processed | Payment success | userId, transactionId, amount | User, Notification, Analytics |
| payment.failed | Payment failed | userId, reason, amount | Notification, Audit |
| payment.refunded | Refund issued | userId, transactionId, amount | User, Notification, Accounting |
| subscription.created | New subscription | userId, plan, period | User, Features, Analytics |
| subscription.renewed | Auto-renewal | userId, subscriptionId | Notification, Analytics |
| subscription.cancelled | Cancellation | userId, reason, endDate | User, Notification, Analytics |
| subscription.expired | Subscription ended | userId, subscriptionId | User, Features, Notification |

#### Analytics Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| analytics.pageview | Page viewed | userId, page, duration, referrer | Analytics |
| analytics.event | Custom event | userId, category, action, label | Analytics |
| analytics.error | Error tracked | userId, error, context | Monitoring, Audit |
| analytics.performance | Performance metric | metric, value, context | Monitoring |
| analytics.funnel.step | Funnel progression | userId, funnel, step | Analytics |
| analytics.ab.exposure | A/B test exposure | userId, experiment, variant | Analytics |

#### System Events
| Event Type | Description | Payload | Consumers |
|------------|-------------|---------|-----------|
| system.health.degraded | Service degraded | service, reason, impact | Monitoring, Notification |
| system.deployment.started | Deploy began | service, version, environment | Audit, Monitoring |
| system.deployment.completed | Deploy finished | service, version, duration | Audit, Monitoring |
| system.error.critical | Critical error | service, error, stackTrace | Monitoring, PagerDuty |
| system.resource.exhausted | Resource limit | service, resource, usage | Monitoring, AutoScaling |
| system.backup.completed | Backup done | service, size, duration | Audit, Monitoring |
        `,
      },
    },
  },
};

export const ServiceContracts: Story = {
  name: 'Service Contracts & APIs',
  parameters: {
    docs: {
      description: {
        story: `
### 📋 Service Contracts

#### REST API Contracts

##### User Service API
\`\`\`typescript
// GET /api/v1/users/:userId
interface GetUserResponse {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
  };
  stats: {
    level: number;
    totalXP: number;
    quizzesCompleted: number;
    achievements: number;
  };
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

// POST /api/v1/users
interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

// PATCH /api/v1/users/:userId
interface UpdateUserRequest {
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}
\`\`\`

##### Quiz Service API
\`\`\`typescript
// GET /api/v1/quizzes
interface GetQuizzesRequest {
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  limit?: number;
  offset?: number;
  sort?: 'popular' | 'recent' | 'difficulty';
}

interface GetQuizzesResponse {
  quizzes: Quiz[];
  total: number;
  hasMore: boolean;
}

// POST /api/v1/quizzes/:quizId/start
interface StartQuizRequest {
  userId: string;
  mode?: 'practice' | 'competitive' | 'timed';
}

interface StartQuizResponse {
  sessionId: string;
  questions: Question[];
  timeLimit?: number;
  powerUps?: PowerUp[];
}

// POST /api/v1/quizzes/:quizId/submit
interface SubmitQuizRequest {
  sessionId: string;
  answers: Array<{
    questionId: string;
    answer: string;
    timeSpent: number;
  }>;
}

interface SubmitQuizResponse {
  score: number;
  correct: number;
  total: number;
  xpEarned: number;
  achievements: Achievement[];
  leaderboardPosition?: number;
}
\`\`\`

#### GraphQL Contracts

##### User Queries
\`\`\`graphql
type Query {
  user(id: ID!): User
  users(filter: UserFilter, limit: Int, offset: Int): UserConnection
  currentUser: User
  userStats(userId: ID!): UserStats
  userAchievements(userId: ID!): [Achievement]
}

type User {
  id: ID!
  email: String!
  username: String!
  profile: UserProfile!
  stats: UserStats!
  preferences: UserPreferences!
  friends: [User]
  achievements: [Achievement]
  quizHistory: [QuizResult]
}

type UserStats {
  level: Int!
  currentXP: Int!
  nextLevelXP: Int!
  totalXP: Int!
  rank: Int!
  streakDays: Int!
  quizzesCompleted: Int!
  perfectScores: Int!
  averageScore: Float!
}
\`\`\`

##### Gamification Mutations
\`\`\`graphql
type Mutation {
  claimDailyReward(userId: ID!): RewardResult!
  activatePowerUp(userId: ID!, powerUpId: ID!): PowerUpResult!
  acceptQuest(userId: ID!, questId: ID!): Quest!
  purchaseItem(userId: ID!, itemId: ID!): PurchaseResult!
}

type RewardResult {
  success: Boolean!
  rewards: [Reward]!
  nextClaimTime: DateTime
}

type Reward {
  type: RewardType!
  value: Int!
  description: String!
}

enum RewardType {
  XP
  COINS
  POWER_UP
  BADGE
  MYSTERY_BOX
}
\`\`\`

#### gRPC Contracts

##### Analytics Service
\`\`\`protobuf
syntax = "proto3";

service AnalyticsService {
  rpc TrackEvent(TrackEventRequest) returns (TrackEventResponse);
  rpc GetUserMetrics(GetUserMetricsRequest) returns (UserMetrics);
  rpc GetSystemMetrics(GetSystemMetricsRequest) returns (SystemMetrics);
  rpc StreamEvents(StreamEventsRequest) returns (stream Event);
}

message TrackEventRequest {
  string user_id = 1;
  string event_type = 2;
  string category = 3;
  string action = 4;
  map<string, string> properties = 5;
  int64 timestamp = 6;
}

message UserMetrics {
  string user_id = 1;
  int32 total_events = 2;
  int32 daily_active_days = 3;
  float engagement_score = 4;
  repeated MetricPoint time_series = 5;
}

message SystemMetrics {
  int32 total_users = 1;
  int32 active_users = 2;
  float error_rate = 3;
  float average_latency = 4;
  int32 requests_per_second = 5;
}
\`\`\`

#### WebSocket Contracts

##### Real-time Events
\`\`\`typescript
// WebSocket connection
const ws = new WebSocket('wss://api.quizmentor.com/realtime');

// Subscribe to events
ws.send(JSON.stringify({
  type: 'SUBSCRIBE',
  channels: ['quiz', 'leaderboard', 'notifications'],
  userId: 'user-123'
}));

// Receive events
ws.on('message', (data) => {
  const event = JSON.parse(data);
  switch(event.type) {
    case 'QUIZ_UPDATE':
      // Real-time quiz progress
      updateQuizUI(event.data);
      break;
    case 'LEADERBOARD_CHANGE':
      // Live leaderboard updates
      updateLeaderboard(event.data);
      break;
    case 'ACHIEVEMENT_UNLOCKED':
      // Instant achievement notification
      showAchievement(event.data);
      break;
  }
});

// Event structures
interface QuizUpdateEvent {
  type: 'QUIZ_UPDATE';
  data: {
    sessionId: string;
    currentQuestion: number;
    totalQuestions: number;
    participants: Array<{
      userId: string;
      username: string;
      progress: number;
      score: number;
    }>;
  };
}

interface LeaderboardChangeEvent {
  type: 'LEADERBOARD_CHANGE';
  data: {
    board: 'daily' | 'weekly' | 'all-time';
    changes: Array<{
      userId: string;
      oldRank: number;
      newRank: number;
      score: number;
    }>;
  };
}
\`\`\`

#### Message Queue Contracts

##### Kafka Topics & Schemas
\`\`\`typescript
// Topic: quiz-events
interface QuizEventMessage {
  key: string; // userId
  value: {
    eventType: 'started' | 'completed' | 'abandoned';
    userId: string;
    quizId: string;
    timestamp: string;
    data: Record<string, any>;
  };
  headers: {
    correlationId: string;
    source: string;
    version: string;
  };
}

// Topic: gamification-events
interface GamificationEventMessage {
  key: string; // userId
  value: {
    eventType: string;
    userId: string;
    timestamp: string;
    rewards?: {
      xp?: number;
      achievements?: string[];
      items?: string[];
    };
  };
}

// Topic: notification-queue
interface NotificationMessage {
  key: string; // userId
  value: {
    userId: string;
    type: 'email' | 'push' | 'sms' | 'in-app';
    template: string;
    data: Record<string, any>;
    priority: 'low' | 'medium' | 'high';
    scheduledAt?: string;
  };
}
\`\`\`
        `,
      },
    },
  },
};

export const IntegrationPatterns: Story = {
  name: 'Integration Patterns',
  parameters: {
    docs: {
      description: {
        story: `
### 🔄 S2S Integration Patterns

#### 1. Synchronous Request-Response
\`\`\`typescript
// Direct HTTP call with circuit breaker
class QuizService {
  private userServiceClient = new HttpClient({
    baseURL: 'https://user-service.internal',
    timeout: 5000,
    circuitBreaker: {
      threshold: 5,
      timeout: 30000
    }
  });
  
  async startQuiz(quizId: string, userId: string) {
    // Verify user exists and is active
    const user = await this.userServiceClient.get(\`/users/\${userId}\`);
    if (!user.active) {
      throw new Error('User is not active');
    }
    
    // Start quiz session
    const session = await this.createSession(quizId, userId);
    
    // Notify other services asynchronously
    await this.eventBus.publish('quiz.started', {
      userId,
      quizId,
      sessionId: session.id
    });
    
    return session;
  }
}
\`\`\`

#### 2. Event-Driven Choreography
\`\`\`typescript
// Each service reacts to events independently
class GamificationService {
  constructor(private eventBus: EventBus) {
    // Subscribe to relevant events
    eventBus.subscribe('quiz.completed', this.handleQuizCompleted);
    eventBus.subscribe('user.login', this.handleUserLogin);
    eventBus.subscribe('achievement.unlocked', this.handleAchievement);
  }
  
  private handleQuizCompleted = async (event: QuizCompletedEvent) => {
    // Calculate XP
    const xp = await this.calculateXP(event);
    
    // Check achievements
    const achievements = await this.checkAchievements(event.userId);
    
    // Update streak
    const streak = await this.updateStreak(event.userId);
    
    // Publish results
    await this.eventBus.publish('gamification.rewards.calculated', {
      userId: event.userId,
      xp,
      achievements,
      streak
    });
  };
}
\`\`\`

#### 3. Orchestration with Saga
\`\`\`typescript
// Centralized workflow coordination
class QuizCompletionSaga {
  private steps = [
    { service: 'quiz', action: 'finalize', compensate: 'reopen' },
    { service: 'gamification', action: 'calculate', compensate: 'revert' },
    { service: 'leaderboard', action: 'update', compensate: 'restore' },
    { service: 'notification', action: 'send', compensate: 'cancel' }
  ];
  
  async execute(context: QuizContext) {
    const completed: string[] = [];
    
    try {
      for (const step of this.steps) {
        await this.executeStep(step, context);
        completed.push(step.service);
      }
      
      // All steps successful
      await this.eventBus.publish('saga.completed', {
        saga: 'quiz-completion',
        context
      });
    } catch (error) {
      // Compensate in reverse order
      await this.compensate(completed.reverse(), context);
      throw new SagaFailedError('Quiz completion saga failed', error);
    }
  }
  
  private async compensate(services: string[], context: QuizContext) {
    for (const service of services) {
      const step = this.steps.find(s => s.service === service);
      if (step?.compensate) {
        await this.executeCompensation(step, context);
      }
    }
  }
}
\`\`\`

#### 4. CQRS Pattern
\`\`\`typescript
// Command side (write)
class QuizCommandService {
  async createQuiz(command: CreateQuizCommand): Promise<void> {
    // Validate command
    this.validator.validate(command);
    
    // Create quiz aggregate
    const quiz = new QuizAggregate(command);
    
    // Store events
    const events = quiz.getUncommittedEvents();
    await this.eventStore.save(events);
    
    // Publish to event bus
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }
}

// Query side (read)
class QuizQueryService {
  constructor(private readModel: QuizReadModel) {
    // Subscribe to events to update read model
    eventBus.subscribe('quiz.created', this.handleQuizCreated);
    eventBus.subscribe('quiz.updated', this.handleQuizUpdated);
  }
  
  async getQuiz(quizId: string): Promise<QuizDTO> {
    // Query optimized read model
    return this.readModel.findById(quizId);
  }
  
  async searchQuizzes(criteria: SearchCriteria): Promise<QuizDTO[]> {
    // Complex query on denormalized data
    return this.readModel.search(criteria);
  }
}
\`\`\`

#### 5. Event Sourcing
\`\`\`typescript
// Store all state changes as events
class UserAggregate {
  private events: DomainEvent[] = [];
  private version = 0;
  
  constructor(private userId: string) {}
  
  // Rebuild state from events
  static fromEvents(userId: string, events: DomainEvent[]): UserAggregate {
    const aggregate = new UserAggregate(userId);
    for (const event of events) {
      aggregate.apply(event, false);
    }
    return aggregate;
  }
  
  // Command handler
  completeQuiz(quizId: string, score: number) {
    // Business logic validation
    if (score < 0 || score > 100) {
      throw new Error('Invalid score');
    }
    
    // Create event
    const event = new QuizCompletedEvent({
      userId: this.userId,
      quizId,
      score,
      timestamp: new Date()
    });
    
    // Apply event
    this.apply(event, true);
  }
  
  private apply(event: DomainEvent, isNew = false) {
    // Update state based on event type
    switch(event.type) {
      case 'QuizCompleted':
        this.totalQuizzes++;
        this.totalScore += event.data.score;
        break;
      // ... other event handlers
    }
    
    if (isNew) {
      this.events.push(event);
    }
    this.version++;
  }
}
\`\`\`

#### 6. Distributed Cache Pattern
\`\`\`typescript
// Shared cache across services
class CacheManager {
  private redis = new Redis({
    cluster: ['redis-1:6379', 'redis-2:6379', 'redis-3:6379']
  });
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    
    return JSON.parse(data);
  }
  
  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
    
    // Notify cache invalidation
    await this.eventBus.publish('cache.updated', { key });
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Broadcast invalidation
    await this.eventBus.publish('cache.invalidated', { pattern });
  }
}

// Service usage
class LeaderboardService {
  async getTopPlayers(limit = 10): Promise<Player[]> {
    const cacheKey = \`leaderboard:top:\${limit}\`;
    
    // Try cache first
    let players = await this.cache.get<Player[]>(cacheKey);
    if (players) return players;
    
    // Cache miss - fetch from database
    players = await this.db.query(
      'SELECT * FROM players ORDER BY score DESC LIMIT ?',
      [limit]
    );
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, players, 300);
    
    return players;
  }
}
\`\`\`

#### 7. API Gateway Pattern
\`\`\`typescript
// Centralized API management
class APIGateway {
  private services = {
    user: 'http://user-service:3000',
    quiz: 'http://quiz-service:3001',
    gamification: 'http://gamification-service:3002'
  };
  
  async handleRequest(req: Request): Promise<Response> {
    // Authentication
    const user = await this.authenticate(req);
    if (!user) {
      return new Response(401, 'Unauthorized');
    }
    
    // Rate limiting
    if (!await this.rateLimiter.allow(user.id)) {
      return new Response(429, 'Too Many Requests');
    }
    
    // Route to appropriate service
    const route = this.router.match(req.path);
    if (!route) {
      return new Response(404, 'Not Found');
    }
    
    // Add correlation ID
    req.headers['X-Correlation-ID'] = uuid();
    req.headers['X-User-ID'] = user.id;
    
    // Forward request
    const response = await this.forward(route.service, req);
    
    // Log and return
    await this.auditLog(req, response);
    return response;
  }
}
\`\`\`
        `,
      },
    },
  },
};

export const FailureScenarios: Story = {
  name: 'Failure Handling',
  parameters: {
    docs: {
      description: {
        story: `
### 🚨 Failure Scenarios & Recovery

#### Service Failure Matrix

| Failure Type | Detection | Recovery | Impact | SLA Impact |
|--------------|-----------|----------|--------|------------|
| Service Down | Health check fails | Circuit breaker opens, fallback | Degraded functionality | Yes |
| Slow Response | Latency > threshold | Timeout, retry with backoff | User experience degraded | No |
| Data Corruption | Checksum mismatch | Restore from backup, replay events | Data loss possible | Yes |
| Network Partition | Split brain detection | Quorum-based decisions | Temporary inconsistency | No |
| Resource Exhaustion | Metrics threshold | Auto-scaling, load shedding | Performance degradation | Yes |
| Cascading Failure | Error rate spike | Circuit breakers, bulkheads | Multiple service impact | Yes |
| Byzantine Failure | Inconsistent responses | Consensus protocol, voting | Data inconsistency | Yes |

#### Failure Recovery Strategies

##### 1. Database Failure
\`\`\`typescript
class DatabaseFailureHandler {
  async handleFailure(error: DatabaseError) {
    // Categorize failure
    const severity = this.categorizeError(error);
    
    switch(severity) {
      case 'CONNECTION_LOST':
        // Try reconnection with exponential backoff
        return await this.reconnectWithBackoff();
        
      case 'DEADLOCK':
        // Retry transaction
        return await this.retryTransaction();
        
      case 'CORRUPTION':
        // Switch to replica and alert
        await this.switchToReplica();
        await this.alertOps('Database corruption detected');
        break;
        
      case 'REPLICATION_LAG':
        // Use eventual consistency mode
        this.enableEventualConsistency();
        break;
    }
  }
  
  private async switchToReplica() {
    // Promote read replica to primary
    await this.replicaManager.promote('replica-1');
    
    // Update connection pool
    this.connectionPool.updatePrimary('replica-1');
    
    // Notify other services
    await this.eventBus.publish('database.failover', {
      oldPrimary: 'primary-1',
      newPrimary: 'replica-1'
    });
  }
}
\`\`\`

##### 2. Message Queue Failure
\`\`\`typescript
class MessageQueueFailureHandler {
  private deadLetterQueue: Queue;
  private localBuffer: Message[] = [];
  
  async handlePublishFailure(message: Message, error: Error) {
    // Store locally if queue is down
    if (error.type === 'CONNECTION_FAILED') {
      this.localBuffer.push(message);
      
      // Schedule retry
      setTimeout(() => this.flushBuffer(), 5000);
      return;
    }
    
    // Message too large
    if (error.type === 'MESSAGE_TOO_LARGE') {
      // Split message or store in S3
      const url = await this.storeInS3(message);
      await this.publish({
        type: 'LARGE_MESSAGE_REFERENCE',
        url
      });
      return;
    }
    
    // Poison message
    if (message.retries >= 3) {
      await this.deadLetterQueue.add(message);
      await this.alert('Poison message detected', message);
    }
  }
}
\`\`\`

##### 3. Service Dependency Failure
\`\`\`typescript
class ServiceDependencyHandler {
  async handleServiceFailure(service: string): Promise<any> {
    // Check if cached data available
    const cached = await this.cache.get(\`fallback:\${service}\`);
    if (cached) {
      this.metrics.increment('fallback.cache.hit');
      return cached;
    }
    
    // Use default/static data
    const defaults = this.getDefaultResponse(service);
    if (defaults) {
      this.metrics.increment('fallback.default');
      return defaults;
    }
    
    // Degrade gracefully
    if (this.canDegradeGracefully(service)) {
      this.metrics.increment('fallback.degraded');
      return this.getDegradedResponse(service);
    }
    
    // Fail fast
    throw new ServiceUnavailableError(\`\${service} is required and unavailable\`);
  }
  
  private canDegradeGracefully(service: string): boolean {
    const nonCritical = ['recommendations', 'analytics', 'notifications'];
    return nonCritical.includes(service);
  }
}
\`\`\`

##### 4. Data Consistency Failure
\`\`\`typescript
class ConsistencyFailureHandler {
  async detectAndResolve() {
    // Run consistency check
    const inconsistencies = await this.runConsistencyCheck();
    
    for (const issue of inconsistencies) {
      switch(issue.type) {
        case 'MISSING_EVENT':
          // Replay from event store
          await this.replayEvents(issue.entityId, issue.fromVersion);
          break;
          
        case 'DUPLICATE_EVENT':
          // Deduplicate using idempotency key
          await this.deduplicateEvents(issue.events);
          break;
          
        case 'OUT_OF_ORDER':
          // Reorder based on timestamp
          await this.reorderEvents(issue.events);
          break;
          
        case 'CONFLICTING_STATE':
          // Use CRDT or last-write-wins
          await this.resolveConflict(issue);
          break;
      }
    }
  }
  
  private async resolveConflict(issue: ConsistencyIssue) {
    if (issue.resolutionStrategy === 'CRDT') {
      // Use Conflict-free Replicated Data Type
      const merged = this.crdtMerge(issue.states);
      await this.applyState(issue.entityId, merged);
    } else {
      // Last write wins
      const latest = issue.states.sort((a, b) => 
        b.timestamp - a.timestamp)[0];
      await this.applyState(issue.entityId, latest);
    }
  }
}
\`\`\`

##### 5. Security Breach Response
\`\`\`typescript
class SecurityBreachHandler {
  async handleBreach(breach: SecurityBreach) {
    // Immediate containment
    await this.containBreach(breach);
    
    // Assess impact
    const impact = await this.assessImpact(breach);
    
    // Notify stakeholders
    await this.notifyStakeholders(impact);
    
    // Begin recovery
    await this.startRecovery(breach, impact);
    
    // Post-incident analysis
    await this.schedulePostMortem(breach);
  }
  
  private async containBreach(breach: SecurityBreach) {
    // Isolate affected services
    for (const service of breach.affectedServices) {
      await this.networkPolicy.isolate(service);
    }
    
    // Revoke compromised credentials
    for (const credential of breach.compromisedCredentials) {
      await this.authService.revoke(credential);
    }
    
    // Block malicious IPs
    for (const ip of breach.maliciousIPs) {
      await this.firewall.block(ip);
    }
    
    // Enable enhanced monitoring
    await this.monitoring.enableEnhancedMode();
  }
}
\`\`\`

#### Chaos Engineering Tests

\`\`\`typescript
// Intentionally inject failures to test resilience
class ChaosTests {
  @Test('Random service failure')
  async testRandomServiceFailure() {
    // Kill random service
    const service = this.selectRandomService();
    await this.chaos.killService(service);
    
    // Verify system continues functioning
    await this.verifySystemHealth();
    
    // Verify degraded mode activated
    await this.verifyDegradedMode(service);
    
    // Restore service
    await this.chaos.restoreService(service);
    
    // Verify recovery
    await this.verifyFullRecovery();
  }
  
  @Test('Network partition')
  async testNetworkPartition() {
    // Create network partition
    await this.chaos.createPartition(['zone-a'], ['zone-b']);
    
    // Verify split-brain handling
    await this.verifySplitBrainResolution();
    
    // Heal partition
    await this.chaos.healPartition();
    
    // Verify consistency
    await this.verifyEventualConsistency();
  }
  
  @Test('Resource exhaustion')
  async testResourceExhaustion() {
    // Consume all memory
    await this.chaos.consumeMemory('service-1', '90%');
    
    // Verify auto-scaling
    await this.verifyAutoScaling('service-1');
    
    // Verify load shedding
    await this.verifyLoadShedding();
  }
}
\`\`\`
        `,
      },
    },
  },
};
