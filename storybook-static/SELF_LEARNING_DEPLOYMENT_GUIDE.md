# Self-Learning System: Testing & Production Deployment Guide

## 📋 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Cost-Effective Production Deployment](#cost-effective-production-deployment)
3. [Architecture Patterns](#architecture-patterns)
4. [Performance Optimization](#performance-optimization)
5. [Monitoring & Observability](#monitoring--observability)
6. [Quick Start Commands](#quick-start-commands)

---

## 🧪 Testing Strategy

### 1. Local Testing Setup

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Test specific features
npm run test:unit -- bloomsTaxonomy
npm run test:e2e -- self-learning.spec.ts

# Test with coverage
npm run test:coverage

# Interactive testing
npm run test:e2e:ui
```

### 2. Testing the Self-Learning Features

#### A. Unit Testing the Validators

```typescript
// test-bloom-validator.ts
import BloomsTaxonomyValidator from './services/bloomsTaxonomyValidator';

const testQuestions = [
  {
    text: 'What is the capital of France?',
    type: 'multiple-choice',
    difficulty: 1,
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
  },
  {
    text: 'Analyze the impact of climate change on biodiversity',
    type: 'essay',
    difficulty: 4,
  },
];

// Test classification
testQuestions.forEach((q) => {
  const result = BloomsTaxonomyValidator.getInstance().validateQuestion(q);
  console.log(`Question: ${q.text.substring(0, 50)}...`);
  console.log(`Bloom Level: ${result.level.name}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Suggestions: ${result.suggestions.join(', ')}\n`);
});
```

#### B. Integration Testing

```bash
# Run integration tests with real data
npm run test:integration

# Test with mock data
NODE_ENV=test npm run dev
```

#### C. Load Testing

```javascript
// load-test.js
import { SelfLearningOrchestrator } from './services/selfLearningOrchestrator';

async function loadTest() {
  const orchestrator = SelfLearningOrchestrator.getInstance();
  const userIds = Array.from({ length: 100 }, (_, i) => `user_${i}`);

  console.time('Load Test');

  const results = await Promise.all(
    userIds.map((userId) => orchestrator.generateOptimalSession(userId, 'math', {})),
  );

  console.timeEnd('Load Test');
  console.log(`Processed ${results.length} sessions`);
  console.log(
    `Average questions per session: ${
      results.reduce((sum, r) => sum + r.questions.length, 0) / results.length
    }`,
  );
}

loadTest();
```

### 3. Testing Checklist

```markdown
✅ Bloom's Taxonomy Classification

- [ ] Test all 6 levels (Remember to Create)
- [ ] Verify confidence scores
- [ ] Check suggestion generation
- [ ] Validate batch processing

✅ Adaptive Learning

- [ ] Test difficulty adjustment
- [ ] Verify flow state optimization
- [ ] Check spaced repetition
- [ ] Test knowledge gap detection

✅ Learning Plans

- [ ] Test milestone generation
- [ ] Verify time estimations
- [ ] Check prerequisite chains
- [ ] Test reward calculations

✅ Performance

- [ ] Response time < 2s
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] Handles 100+ concurrent users
```

---

## 💰 Cost-Effective Production Deployment

### 1. Infrastructure Architecture (Serverless + Edge)

```yaml
# serverless.yml - AWS Lambda deployment
service: quizmentor-learning

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}

  environment:
    STAGE: ${self:provider.stage}
    DYNAMODB_TABLE: ${self:service}-${self:provider.stage}
    REDIS_URL: ${env:REDIS_URL}

functions:
  validateQuestions:
    handler: handlers/bloom.validate
    events:
      - http:
          path: /validate
          method: POST
          cors: true
    memorySize: 256
    timeout: 10

  generateSession:
    handler: handlers/learning.generateSession
    events:
      - http:
          path: /session/generate
          method: POST
          cors: true
    memorySize: 512
    timeout: 30
    reservedConcurrency: 10

  processAnalytics:
    handler: handlers/analytics.process
    events:
      - sqs:
          arn: !GetAtt AnalyticsQueue.Arn
          batchSize: 10
    memorySize: 256
    timeout: 60

resources:
  Resources:
    QuestionsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_TABLE}-questions
        BillingMode: PAY_PER_REQUEST
        StreamSpecification:
          StreamViewType: NEW_AND_OLD_IMAGES

    UserProfilesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_TABLE}-profiles
        BillingMode: PAY_PER_REQUEST
        TimeToLiveSpecification:
          AttributeName: ttl
          Enabled: true
```

### 2. Cost Optimization Strategies

#### A. Caching Strategy

```typescript
// cache-service.ts
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

class CacheService {
  private memoryCache: LRUCache<string, any>;
  private redisClient: Redis;

  constructor() {
    // L1 Cache: In-memory LRU
    this.memoryCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5, // 5 minutes
      updateAgeOnGet: true,
    });

    // L2 Cache: Redis (only in production)
    if (process.env.NODE_ENV === 'production') {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: 6379,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });
    }
  }

  async get(key: string): Promise<any> {
    // Check L1 cache first
    const memResult = this.memoryCache.get(key);
    if (memResult) return memResult;

    // Check L2 cache
    if (this.redisClient) {
      const redisResult = await this.redisClient.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        this.memoryCache.set(key, parsed);
        return parsed;
      }
    }

    return null;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, value);

    if (this.redisClient) {
      await this.redisClient.setex(key, ttl, JSON.stringify(value));
    }
  }

  // Cache warming for frequently accessed data
  async warmCache(): Promise<void> {
    const commonQueries = ['bloom:levels', 'learning:frameworks', 'questions:popular'];

    for (const query of commonQueries) {
      await this.get(query); // This will populate cache
    }
  }
}
```

#### B. Database Optimization

```typescript
// optimized-queries.ts

// Use projection to fetch only needed fields
async function getQuestionLite(questionId: string) {
  return await db.query({
    TableName: 'Questions',
    Key: { id: questionId },
    ProjectionExpression: 'id, #t, difficulty, bloomLevel',
    ExpressionAttributeNames: { '#t': 'text' },
  });
}

// Batch operations to reduce API calls
async function batchGetQuestions(questionIds: string[]) {
  const chunks = chunk(questionIds, 25); // DynamoDB limit

  const results = await Promise.all(
    chunks.map((chunk) =>
      db.batchGet({
        RequestItems: {
          Questions: {
            Keys: chunk.map((id) => ({ id })),
          },
        },
      }),
    ),
  );

  return results.flat();
}

// Use GSI for efficient queries
async function getQuestionsByBloomLevel(level: number) {
  return await db.query({
    TableName: 'Questions',
    IndexName: 'BloomLevelIndex',
    KeyConditionExpression: 'bloomLevel = :level',
    ExpressionAttributeValues: { ':level': level },
    Limit: 50,
  });
}
```

### 3. Deployment Options by Budget

#### Option 1: Minimal Cost ($0-10/month)

```yaml
# Vercel + Supabase deployment
# vercel.json
{
  'functions': { 'api/learning/*.ts': { 'maxDuration': 10, 'memory': 1024 } },
  'crons': [{ 'path': '/api/cron/cleanup', 'schedule': '0 2 * * *' }],
}
# Use Supabase free tier
# - 500MB database
# - 2GB bandwidth
# - 50,000 monthly active users
```

#### Option 2: Scalable ($50-200/month)

```bash
# AWS with auto-scaling
# terraform/main.tf
resource "aws_ecs_service" "quizmentor" {
  name            = "quizmentor-learning"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2

  deployment_configuration {
    minimum_healthy_percent = 50
    maximum_percent         = 200
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 2
    base             = 1
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# Use Spot instances for 70% cost savings
```

#### Option 3: Enterprise ($500+/month)

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quizmentor-learning
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: learning-service
          image: quizmentor/learning:latest
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
```

---

## 🏗️ Architecture Patterns

### 1. Event-Driven Architecture

```typescript
// event-bus.ts
import EventEmitter from 'events';

class LearningEventBus extends EventEmitter {
  async emitLearningEvent(event: LearningEvent) {
    // Local processing
    this.emit(event.type, event);

    // Queue for async processing
    if (event.priority === 'low') {
      await this.queueForProcessing(event);
    }
  }

  private async queueForProcessing(event: LearningEvent) {
    // Use SQS, RabbitMQ, or Redis Queue
    await queue.send({
      MessageBody: JSON.stringify(event),
      DelaySeconds: event.delay || 0,
    });
  }
}

// Usage
eventBus.on('session.completed', async (event) => {
  // Update user profile
  await updateUserProfile(event.userId, event.results);

  // Calculate new recommendations
  await generateRecommendations(event.userId);

  // Send analytics
  await trackAnalytics(event);
});
```

### 2. CQRS Pattern

```typescript
// Separate read and write models
class LearningCommandService {
  async createSession(command: CreateSessionCommand) {
    // Validate command
    await this.validator.validate(command);

    // Process business logic
    const session = await this.orchestrator.generateSession(command);

    // Emit events
    await this.eventBus.emit('session.created', session);

    return session.id;
  }
}

class LearningQueryService {
  async getSessionAnalytics(userId: string) {
    // Read from optimized read model
    return await this.readDb.query({
      TableName: 'SessionAnalytics',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    });
  }
}
```

### 3. Repository Pattern

```typescript
// repositories/question-repository.ts
interface IQuestionRepository {
  findById(id: string): Promise<Question>;
  findByBloomLevel(level: number): Promise<Question[]>;
  save(question: Question): Promise<void>;
}

class DynamoQuestionRepository implements IQuestionRepository {
  async findById(id: string): Promise<Question> {
    const cached = await cache.get(`question:${id}`);
    if (cached) return cached;

    const result = await dynamodb
      .get({
        TableName: 'Questions',
        Key: { id },
      })
      .promise();

    await cache.set(`question:${id}`, result.Item, 3600);
    return result.Item as Question;
  }

  async findByBloomLevel(level: number): Promise<Question[]> {
    // Implementation
  }

  async save(question: Question): Promise<void> {
    await dynamodb
      .put({
        TableName: 'Questions',
        Item: question,
      })
      .promise();

    await cache.delete(`question:${question.id}`);
  }
}
```

### 4. Strategy Pattern for Learning Algorithms

```typescript
// strategies/learning-strategy.ts
interface ILearningStrategy {
  selectQuestions(user: UserProfile, count: number): Promise<Question[]>;
  calculateDifficulty(user: UserProfile): number;
}

class SpacedRepetitionStrategy implements ILearningStrategy {
  async selectQuestions(user: UserProfile, count: number) {
    // SM-2 algorithm implementation
  }

  calculateDifficulty(user: UserProfile) {
    // Calculate based on forgetting curve
  }
}

class AdaptiveDifficultyStrategy implements ILearningStrategy {
  async selectQuestions(user: UserProfile, count: number) {
    // Elo-based selection
  }

  calculateDifficulty(user: UserProfile) {
    // Dynamic difficulty adjustment
  }
}

// Context
class LearningContext {
  private strategy: ILearningStrategy;

  setStrategy(strategy: ILearningStrategy) {
    this.strategy = strategy;
  }

  async generateSession(user: UserProfile) {
    return await this.strategy.selectQuestions(user, 7);
  }
}
```

---

## ⚡ Performance Optimization

### 1. Code Splitting & Lazy Loading

```typescript
// Lazy load heavy modules
const loadBloomValidator = () => import('./services/bloomsTaxonomyValidator');
const loadOrchestrator = () => import('./services/selfLearningOrchestrator');

// Use only when needed
export async function validateQuestion(question: Question) {
  const { default: validator } = await loadBloomValidator();
  return validator.validateQuestion(question);
}
```

### 2. Worker Threads for Heavy Processing

```typescript
// workers/bloom-worker.ts
import { parentPort, workerData } from 'worker_threads';

// Heavy processing in worker thread
const result = processBloomValidation(workerData);
parentPort?.postMessage(result);

// main.ts
import { Worker } from 'worker_threads';

async function validateInWorker(questions: Question[]) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/bloom-worker.ts', {
      workerData: questions,
    });

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

### 3. Database Connection Pooling

```typescript
// db-pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Reuse connections
export async function query(text: string, params: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  console.log('Query executed', { text, duration, rows: res.rowCount });
  return res;
}
```

---

## 📊 Monitoring & Observability

### 1. Application Performance Monitoring

```typescript
// monitoring/apm.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new ProfilingIntegration()],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

// Wrap functions with performance tracking
export function trackPerformance<T extends (...args: any[]) => any>(fn: T, name: string): T {
  return (async (...args: Parameters<T>) => {
    const transaction = Sentry.startTransaction({
      op: 'function',
      name,
    });

    try {
      const result = await fn(...args);
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      Sentry.captureException(error);
      throw error;
    } finally {
      transaction.finish();
    }
  }) as T;
}
```

### 2. Custom Metrics

```typescript
// metrics/learning-metrics.ts
import { StatsD } from 'node-statsd';

const metrics = new StatsD({
  host: process.env.STATSD_HOST,
  port: 8125,
  prefix: 'quizmentor.learning.',
});

export function trackLearningMetrics(event: LearningEvent) {
  // Track counters
  metrics.increment(`sessions.${event.type}`);

  // Track gauges
  metrics.gauge('active_users', getActiveUserCount());

  // Track histograms
  metrics.histogram('session.duration', event.duration);
  metrics.histogram('questions.per_session', event.questionCount);

  // Track timing
  metrics.timing('bloom.validation', event.validationTime);
}
```

### 3. Health Checks

```typescript
// health/checks.ts
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkCache(),
    checkExternalAPIs(),
    checkMemoryUsage(),
  ]);

  const status = checks.every((c) => c.status === 'fulfilled') ? 'healthy' : 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    checks: checks.map((c, i) => ({
      name: ['database', 'cache', 'api', 'memory'][i],
      status: c.status === 'fulfilled' ? 'ok' : 'error',
      message: c.status === 'rejected' ? c.reason : undefined,
    })),
  };
}
```

---

## 🚀 Quick Start Commands

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Test specific feature
npm run test -- --grep "Bloom"

# Generate test coverage report
npm run test:coverage

# Run E2E tests with UI
npm run test:e2e:ui
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel (free tier)
vercel --prod

# Deploy to AWS Lambda
serverless deploy --stage prod

# Deploy to Docker
docker build -t quizmentor-learning .
docker run -p 3000:3000 quizmentor-learning

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Monitoring

```bash
# View logs
npm run logs:prod

# Check health
curl https://api.quizmentor.com/health

# View metrics dashboard
open https://metrics.quizmentor.com

# Run performance test
npm run perf:test
```

---

## 📈 Cost Monitoring

### Monthly Cost Breakdown (Estimated)

```
Free Tier (0-1000 users):
- Vercel: $0
- Supabase: $0
- Total: $0/month

Growth (1000-10,000 users):
- AWS Lambda: $20
- DynamoDB: $25
- CloudFront: $10
- Redis: $15
- Total: ~$70/month

Scale (10,000+ users):
- ECS Fargate: $100
- RDS: $50
- ElastiCache: $30
- CloudWatch: $20
- Total: ~$200/month
```

### Cost Optimization Tips

1. Use AWS Spot instances (70% savings)
2. Implement aggressive caching
3. Use CloudFront for static assets
4. Compress all responses
5. Use pay-per-request pricing for DynamoDB
6. Schedule non-critical tasks during off-peak
7. Use Lambda@Edge for simple computations
8. Implement request throttling

---

## 🎯 Best Practices Checklist

### Code Quality

- [ ] TypeScript strict mode enabled
- [ ] ESLint configured with strict rules
- [ ] Prettier for consistent formatting
- [ ] Husky pre-commit hooks
- [ ] 80%+ test coverage
- [ ] Documentation for all public APIs

### Security

- [ ] Environment variables for secrets
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS properly configured

### Performance

- [ ] Response time < 200ms (p50)
- [ ] Response time < 1s (p99)
- [ ] Memory usage < 512MB
- [ ] CPU usage < 80%
- [ ] Cache hit rate > 80%
- [ ] Database query optimization

### Reliability

- [ ] Health checks implemented
- [ ] Graceful shutdown handling
- [ ] Circuit breakers for external calls
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queues for failed messages
- [ ] Backup and disaster recovery plan

---

## 📚 Additional Resources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Vercel Optimization Guide](https://vercel.com/docs/concepts/functions/optimization)
- [DynamoDB Design Patterns](https://www.alexdebrie.com/posts/dynamodb-patterns/)
- [Node.js Performance Tips](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Bloom's Taxonomy Research](https://www.tandfonline.com/doi/full/10.1080/00405841.2016.1148988)
