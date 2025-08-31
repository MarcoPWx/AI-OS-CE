# Caching Patterns Runbook

## Table of Contents

1. [Overview](#overview)
2. [Cache Architecture Layers](#cache-architecture-layers)
3. [Caching Strategies](#caching-strategies)
4. [Cache Key Design](#cache-key-design)
5. [Cache Invalidation Patterns](#cache-invalidation-patterns)
6. [Cache Warming Techniques](#cache-warming-techniques)
7. [Redis Configuration](#redis-configuration)
8. [CDN and Edge Caching](#cdn-and-edge-caching)
9. [Application-Level Caching](#application-level-caching)
10. [Monitoring and Debugging](#monitoring-and-debugging)

## Overview

This runbook provides comprehensive caching strategies to achieve the performance needed for 1000+ concurrent users with minimal database load.

### Why Caching Matters for Scale

```
Without Caching:
1000 users × 10 requests/min × 3 DB queries/request = 30,000 DB queries/min
Result: Database dies 💀

With Proper Caching (70% hit rate):
30,000 queries × 0.3 = 9,000 DB queries/min
Result: Database happy 😊
```

### Cache Performance Targets

| Metric                  | Target | Impact                        |
| ----------------------- | ------ | ----------------------------- |
| Overall Cache Hit Ratio | > 70%  | Reduces DB load by 70%        |
| CDN Hit Ratio           | > 90%  | Reduces origin traffic by 90% |
| Redis Hit Ratio         | > 80%  | Reduces complex computations  |
| Response Time (cached)  | < 10ms | 40x faster than DB            |
| Cache Availability      | 99.9%  | High reliability              |

## Cache Architecture Layers

### Multi-Layer Cache Strategy

```
User Request
    ↓
[Browser Cache]      ← Layer 1: 0ms (local)
    ↓ (miss)
[CDN/Edge Cache]     ← Layer 2: 5-20ms (global)
    ↓ (miss)
[API Gateway Cache]  ← Layer 3: 1-5ms (regional)
    ↓ (miss)
[Application Cache]  ← Layer 4: <1ms (in-memory)
    ↓ (miss)
[Redis Cache]        ← Layer 5: 1-3ms (distributed)
    ↓ (miss)
[Database]           ← Layer 6: 10-100ms (persistent)
```

### Layer Responsibilities

```yaml
Browser Cache:
  - Static assets (JS, CSS, images)
  - GET API responses (with proper headers)
  - TTL: 1 hour - 1 year

CDN/Edge:
  - Static files
  - API responses for public data
  - Generated content (PDFs, reports)
  - TTL: 5 minutes - 1 day

API Gateway:
  - Rate limiting counters
  - Authentication tokens
  - Common API responses
  - TTL: 1 - 60 minutes

Application:
  - Session data
  - Computed results
  - Frequently accessed objects
  - TTL: 1 - 30 minutes

Redis:
  - User sessions
  - Quiz results
  - Leaderboards
  - Real-time data
  - TTL: 1 minute - 24 hours

Database:
  - Query result cache
  - Prepared statements
  - Connection pools
  - TTL: Automatic management
```

## Caching Strategies

### 1. Cache-Aside (Lazy Loading)

```javascript
// Most common pattern - load on demand
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // Try cache first
  let user = await redis.get(cacheKey);
  if (user) {
    return JSON.parse(user);
  }

  // Cache miss - fetch from database
  user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  // Store in cache for next time
  await redis.setex(cacheKey, 3600, JSON.stringify(user)); // 1 hour TTL

  return user;
}
```

### 2. Write-Through Cache

```javascript
// Update cache when writing to database
async function updateUser(userId, data) {
  const cacheKey = `user:${userId}`;

  // Update database
  await db.query('UPDATE users SET ? WHERE id = ?', [data, userId]);

  // Update cache immediately
  const updatedUser = { ...data, id: userId };
  await redis.setex(cacheKey, 3600, JSON.stringify(updatedUser));

  return updatedUser;
}
```

### 3. Write-Behind (Write-Back) Cache

```javascript
// Queue writes for batch processing
async function recordQuizAnswer(userId, questionId, answer) {
  const cacheKey = `answer:${userId}:${questionId}`;

  // Write to cache immediately
  await redis.setex(
    cacheKey,
    300,
    JSON.stringify({
      userId,
      questionId,
      answer,
      timestamp: Date.now(),
    }),
  );

  // Queue for database write
  await redis.lpush('answer_write_queue', cacheKey);

  // Background worker processes the queue
  return { success: true, queued: true };
}

// Background worker
async function processAnswerQueue() {
  while (true) {
    const cacheKey = await redis.brpop('answer_write_queue', 0);
    const data = await redis.get(cacheKey);

    if (data) {
      const answer = JSON.parse(data);
      await db.query('INSERT INTO answers (user_id, question_id, answer) VALUES (?, ?, ?)', [
        answer.userId,
        answer.questionId,
        answer.answer,
      ]);
    }
  }
}
```

### 4. Refresh-Ahead Cache

```javascript
// Proactively refresh cache before expiration
class RefreshAheadCache {
  constructor(redis, refreshThreshold = 0.2) {
    this.redis = redis;
    this.refreshThreshold = refreshThreshold; // Refresh when 20% TTL remains
  }

  async get(key, fetchFn, ttl = 3600) {
    const data = await this.redis.get(key);
    const ttlRemaining = await this.redis.ttl(key);

    // Check if we should refresh
    if (ttlRemaining > 0 && ttlRemaining < ttl * this.refreshThreshold) {
      // Refresh in background
      this.refreshInBackground(key, fetchFn, ttl);
    }

    if (data) {
      return JSON.parse(data);
    }

    // Cache miss - fetch and store
    const fresh = await fetchFn();
    await this.redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }

  async refreshInBackground(key, fetchFn, ttl) {
    // Prevent multiple refresh attempts
    const lockKey = `refresh_lock:${key}`;
    const locked = await this.redis.set(lockKey, '1', 'NX', 'EX', 60);

    if (locked) {
      setTimeout(async () => {
        try {
          const fresh = await fetchFn();
          await this.redis.setex(key, ttl, JSON.stringify(fresh));
        } finally {
          await this.redis.del(lockKey);
        }
      }, 0);
    }
  }
}
```

## Cache Key Design

### 1. Key Naming Conventions

```javascript
// Hierarchical key structure
const keyPatterns = {
  // user:{userId}:{resource}
  userProfile: (userId) => `user:${userId}:profile`,
  userQuizzes: (userId) => `user:${userId}:quizzes`,
  userStats: (userId) => `user:${userId}:stats`,

  // quiz:{quizId}:{resource}
  quizData: (quizId) => `quiz:${quizId}:data`,
  quizQuestions: (quizId) => `quiz:${quizId}:questions`,
  quizLeaderboard: (quizId) => `quiz:${quizId}:leaderboard`,

  // session:{sessionId}
  session: (sessionId) => `session:${sessionId}`,

  // cache:{type}:{identifier}
  apiResponse: (endpoint, params) => `cache:api:${endpoint}:${md5(params)}`,
  computation: (type, input) => `cache:compute:${type}:${md5(input)}`,
};
```

### 2. Versioned Cache Keys

```javascript
// Include version in key for easy invalidation
const CACHE_VERSION = 'v2';

function versionedKey(key) {
  return `${CACHE_VERSION}:${key}`;
}

// Invalidate all v1 cache by changing version
async function invalidateAllCache() {
  CACHE_VERSION = `v${parseInt(CACHE_VERSION.slice(1)) + 1}`;
}
```

### 3. Tagged Cache Keys

```javascript
// Tag-based invalidation
class TaggedCache {
  constructor(redis) {
    this.redis = redis;
  }

  async set(key, value, ttl, tags = []) {
    // Store the value
    await this.redis.setex(key, ttl, JSON.stringify(value));

    // Store tags
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
      await this.redis.expire(`tag:${tag}`, ttl);
    }
  }

  async invalidateTag(tag) {
    // Get all keys with this tag
    const keys = await this.redis.smembers(`tag:${tag}`);

    if (keys.length > 0) {
      // Delete all tagged keys
      await this.redis.del(...keys);
    }

    // Delete the tag set
    await this.redis.del(`tag:${tag}`);
  }
}

// Usage
const cache = new TaggedCache(redis);
await cache.set('quiz:123', quizData, 3600, ['quizzes', 'user:456']);
await cache.invalidateTag('user:456'); // Invalidates all user's cache
```

## Cache Invalidation Patterns

### 1. TTL-Based Invalidation

```javascript
// Simple TTL management
const TTL_MATRIX = {
  // Static content
  staticAssets: 86400 * 30, // 30 days

  // Semi-dynamic content
  userProfile: 3600, // 1 hour
  quizList: 1800, // 30 minutes
  leaderboard: 300, // 5 minutes

  // Dynamic content
  activeSession: 60, // 1 minute
  realtimeStats: 10, // 10 seconds

  // Computed results
  recommendations: 3600, // 1 hour
  analytics: 1800, // 30 minutes
};

function getTTL(contentType, isAuthenticated = false) {
  let ttl = TTL_MATRIX[contentType] || 300;

  // Reduce TTL for authenticated content
  if (isAuthenticated) {
    ttl = Math.min(ttl, 1800); // Max 30 min for auth content
  }

  // Add jitter to prevent cache stampede
  const jitter = Math.random() * 0.1 * ttl;
  return Math.floor(ttl + jitter);
}
```

### 2. Event-Based Invalidation

```javascript
// Invalidate cache on specific events
class CacheInvalidator {
  constructor(redis, eventEmitter) {
    this.redis = redis;
    this.setupEventListeners(eventEmitter);
  }

  setupEventListeners(emitter) {
    // User events
    emitter.on('user.updated', async (userId) => {
      await this.invalidatePattern(`user:${userId}:*`);
    });

    // Quiz events
    emitter.on('quiz.completed', async ({ quizId, userId }) => {
      await this.redis.del(
        `quiz:${quizId}:leaderboard`,
        `user:${userId}:stats`,
        `user:${userId}:recent_quizzes`,
      );
    });

    // Question events
    emitter.on('question.answered', async ({ questionId, userId }) => {
      await this.redis.del(`question:${questionId}:stats`, `user:${userId}:progress`);
    });
  }

  async invalidatePattern(pattern) {
    // Use SCAN to find matching keys
    const stream = this.redis.scanStream({
      match: pattern,
      count: 100,
    });

    stream.on('data', async (keys) => {
      if (keys.length) {
        await this.redis.del(keys);
      }
    });
  }
}
```

### 3. Cascade Invalidation

```javascript
// Invalidate dependent caches
const CACHE_DEPENDENCIES = {
  'user:profile': ['user:stats', 'user:recommendations'],
  'quiz:data': ['quiz:leaderboard', 'quiz:analytics'],
  'question:data': ['question:stats', 'quiz:questions'],
};

async function invalidateWithDependencies(key) {
  const keysToDelete = [key];

  // Find all dependent keys
  for (const [parent, deps] of Object.entries(CACHE_DEPENDENCIES)) {
    if (key.includes(parent)) {
      keysToDelete.push(...deps.map((dep) => key.replace(parent, dep)));
    }
  }

  // Delete all keys
  await redis.del(...keysToDelete);

  console.log(`Invalidated ${keysToDelete.length} cache keys`);
}
```

### 4. Smart Invalidation

```javascript
// Invalidate only what's necessary
class SmartCacheInvalidator {
  async onUserUpdate(userId, changes) {
    const keysToInvalidate = [];

    // Invalidate based on what changed
    if (changes.profile) {
      keysToInvalidate.push(`user:${userId}:profile`);
    }

    if (changes.preferences) {
      keysToInvalidate.push(`user:${userId}:recommendations`, `user:${userId}:preferences`);
    }

    if (changes.score) {
      keysToInvalidate.push(`leaderboard:global`, `leaderboard:${changes.topic}`);
    }

    if (keysToInvalidate.length > 0) {
      await redis.del(...keysToInvalidate);
    }
  }
}
```

## Cache Warming Techniques

### 1. Startup Cache Warming

```javascript
// Warm cache on application startup
async function warmCacheOnStartup() {
  console.log('🔥 Starting cache warming...');

  const warmingTasks = [
    warmPopularQuizzes(),
    warmLeaderboards(),
    warmStaticContent(),
    warmUserSessions(),
  ];

  await Promise.all(warmingTasks);
  console.log('✅ Cache warming complete');
}

async function warmPopularQuizzes() {
  // Get top 100 popular quizzes
  const quizzes = await db.query(`
        SELECT * FROM quizzes 
        WHERE status = 'active' 
        ORDER BY view_count DESC 
        LIMIT 100
    `);

  for (const quiz of quizzes) {
    await redis.setex(`quiz:${quiz.id}:data`, TTL_MATRIX.quizList, JSON.stringify(quiz));
  }
}

async function warmLeaderboards() {
  // Pre-calculate leaderboards
  const topics = await db.query('SELECT DISTINCT topic FROM quizzes');

  for (const { topic } of topics) {
    const leaderboard = await db.query(
      `
            SELECT u.id, u.name, SUM(q.score) as total_score
            FROM users u
            JOIN quiz_results q ON u.id = q.user_id
            WHERE q.topic = ?
            GROUP BY u.id
            ORDER BY total_score DESC
            LIMIT 100
        `,
      [topic],
    );

    await redis.setex(`leaderboard:${topic}`, TTL_MATRIX.leaderboard, JSON.stringify(leaderboard));
  }
}
```

### 2. Scheduled Cache Warming

```javascript
// Cron job for periodic cache warming
const cron = require('node-cron');

// Every 5 minutes - refresh hot data
cron.schedule('*/5 * * * *', async () => {
  await warmFrequentlyAccessedData();
});

// Every hour - refresh medium priority data
cron.schedule('0 * * * *', async () => {
  await warmUserRecommendations();
  await warmAnalyticsData();
});

// Daily at 3 AM - refresh cold data
cron.schedule('0 3 * * *', async () => {
  await warmHistoricalData();
  await warmReports();
});

async function warmFrequentlyAccessedData() {
  // Track cache misses
  const missedKeys = await redis.zrevrange('cache_misses', 0, 50);

  for (const key of missedKeys) {
    const [type, id] = key.split(':');

    switch (type) {
      case 'user':
        await warmUser(id);
        break;
      case 'quiz':
        await warmQuiz(id);
        break;
    }
  }

  // Clear miss tracking
  await redis.del('cache_misses');
}
```

### 3. Predictive Cache Warming

```javascript
// Warm cache based on user behavior patterns
class PredictiveCacheWarmer {
  async warmForUser(userId) {
    const userPattern = await this.analyzeUserPattern(userId);

    // Warm based on time of day
    const hour = new Date().getHours();

    if (hour >= 18 && hour <= 22) {
      // Evening - users typically take quizzes
      await this.warmUserQuizzes(userId);
      await this.warmRecommendations(userId);
    } else if (hour >= 9 && hour <= 12) {
      // Morning - users check progress
      await this.warmUserStats(userId);
      await this.warmUserHistory(userId);
    }

    // Warm based on user preferences
    for (const topic of userPattern.favoriteTopics) {
      await this.warmTopicContent(topic);
    }
  }

  async analyzeUserPattern(userId) {
    return (
      (await redis.get(`pattern:${userId}`)) || {
        favoriteTopics: [],
        activeHours: [],
        avgSessionLength: 0,
      }
    );
  }
}
```

### 4. Lazy Cache Warming

```javascript
// Warm cache in background after miss
class LazyCacheWarmer {
  constructor(redis, db) {
    this.redis = redis;
    this.db = db;
    this.warmingQueue = [];
    this.isProcessing = false;
  }

  async get(key, fetchFn) {
    const cached = await this.redis.get(key);

    if (!cached) {
      // Track miss
      await this.redis.zincrby('cache_misses', 1, key);

      // Fetch data
      const data = await fetchFn();

      // Queue for warming related data
      this.queueRelatedWarming(key, data);

      return data;
    }

    return JSON.parse(cached);
  }

  queueRelatedWarming(key, data) {
    // Queue related data for warming
    if (key.includes('quiz:')) {
      this.warmingQueue.push({
        type: 'quiz_related',
        quizId: data.id,
        topics: data.topics,
      });
    }

    if (!this.isProcessing) {
      this.processWarmingQueue();
    }
  }

  async processWarmingQueue() {
    this.isProcessing = true;

    while (this.warmingQueue.length > 0) {
      const task = this.warmingQueue.shift();

      // Process in background
      setImmediate(async () => {
        await this.warmRelatedData(task);
      });
    }

    this.isProcessing = false;
  }
}
```

## Redis Configuration

### 1. Redis Configuration for QuizMentor

```conf
# redis.conf optimized for caching

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru  # Evict any key using LRU

# Persistence (disable for cache-only)
save ""
appendonly no

# Performance
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Client connections
maxclients 10000

# Threading (Redis 6+)
io-threads 4
io-threads-do-reads yes

# Key eviction
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes

# Replica settings (if using)
replica-lazy-flush yes
```

### 2. Redis Cluster Configuration

```yaml
# Redis cluster for high availability
redis_cluster:
  nodes:
    - master1:
        host: redis-master-1
        port: 6379
        replicas:
          - redis-replica-1a
          - redis-replica-1b

    - master2:
        host: redis-master-2
        port: 6379
        replicas:
          - redis-replica-2a
          - redis-replica-2b

    - master3:
        host: redis-master-3
        port: 6379
        replicas:
          - redis-replica-3a
          - redis-replica-3b

  configuration:
    cluster-enabled: yes
    cluster-config-file: nodes.conf
    cluster-node-timeout: 5000
    cluster-require-full-coverage: no
```

### 3. Connection Pool Configuration

```javascript
// Optimal Redis connection pool
const Redis = require('ioredis');

// Single instance
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,

  // Connection pool
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  reconnectOnError: (err) => err.message.includes('READONLY'),

  // Performance
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,

  // Command timeout
  commandTimeout: 5000,

  // Keep alive
  keepAlive: 10000,
});

// Cluster
const cluster = new Redis.Cluster(
  [
    { host: 'redis-1', port: 6379 },
    { host: 'redis-2', port: 6379 },
    { host: 'redis-3', port: 6379 },
  ],
  {
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
    clusterRetryStrategy: (times) => Math.min(times * 100, 3000),
  },
);
```

## CDN and Edge Caching

### 1. CDN Configuration

```javascript
// Cloudflare/Fastly CDN headers
function setCDNHeaders(res, contentType, maxAge = 3600) {
  // Browser cache
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);

  // CDN cache
  res.setHeader('CDN-Cache-Control', `max-age=${maxAge * 2}`);

  // Stale content handling
  res.setHeader('Stale-While-Revalidate', '86400');
  res.setHeader('Stale-If-Error', '604800');

  // Vary headers for correct caching
  res.setHeader('Vary', 'Accept-Encoding, Accept, Authorization');

  // ETag for validation
  res.setHeader('ETag', generateETag(res.body));
}

// API endpoint with CDN caching
app.get('/api/public/quizzes', async (req, res) => {
  const quizzes = await getPublicQuizzes();

  // Cache for 5 minutes
  setCDNHeaders(res, 'application/json', 300);

  res.json(quizzes);
});
```

### 2. Edge Cache Rules

```yaml
# Cloudflare Page Rules / Workers
cache_rules:
  - pattern: '*.js'
    cache_level: standard
    edge_cache_ttl: 2592000 # 30 days
    browser_cache_ttl: 86400 # 1 day

  - pattern: '*.css'
    cache_level: standard
    edge_cache_ttl: 2592000
    browser_cache_ttl: 86400

  - pattern: '/api/public/*'
    cache_level: standard
    edge_cache_ttl: 300 # 5 minutes
    respect_origin: true

  - pattern: '/api/user/*'
    cache_level: bypass # Don't cache authenticated

  - pattern: '/images/*'
    cache_level: aggressive
    edge_cache_ttl: 31536000 # 1 year
    polish: lossy # Optimize images
    webp: true # Convert to WebP
```

### 3. Edge Computing with Workers

```javascript
// Cloudflare Worker for edge caching
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);

  // Check cache
  let response = await cache.match(cacheKey);

  if (response) {
    // Cache hit - check if stale
    const age = getResponseAge(response);

    if (age < 300) {
      // Fresh for 5 minutes
      return response;
    }

    // Stale - revalidate in background
    event.waitUntil(
      fetch(request).then((res) => {
        if (res.ok) {
          cache.put(cacheKey, res.clone());
        }
      }),
    );

    // Return stale while revalidating
    return response;
  }

  // Cache miss - fetch from origin
  response = await fetch(request);

  // Cache if successful GET request
  if (request.method === 'GET' && response.ok) {
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
```

## Application-Level Caching

### 1. In-Memory Cache

```javascript
// LRU cache for application
class LRUCache {
  constructor(maxSize = 100, ttl = 300000) {
    // 5 min default
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key, value, ttl = this.ttl) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  clear(pattern) {
    if (pattern) {
      // Clear matching keys
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// Global application cache
const appCache = new LRUCache(500, 600000); // 500 items, 10 min TTL
```

### 2. Request Memoization

```javascript
// Memoize expensive computations
const memoize = (fn, keyFn = (...args) => JSON.stringify(args)) => {
  const cache = new LRUCache(100);

  return async (...args) => {
    const key = keyFn(...args);

    // Check cache
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    // Compute and cache
    const result = await fn(...args);
    cache.set(key, result);

    return result;
  };
};

// Usage
const getQuizAnalytics = memoize(
  async (quizId) => {
    // Expensive analytics computation
    return await computeAnalytics(quizId);
  },
  (quizId) => `analytics:${quizId}`,
);
```

### 3. Response Caching Middleware

```javascript
// Express middleware for response caching
const responseCacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Don't cache authenticated requests
    if (req.headers.authorization) {
      return next();
    }

    const key = `response:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data) {
      res.setHeader('X-Cache', 'MISS');

      // Cache the response
      redis.setex(key, ttl, JSON.stringify(data));

      // Send response
      return originalJson(data);
    };

    next();
  };
};

// Apply to routes
app.get(
  '/api/public/leaderboard',
  responseCacheMiddleware(300), // Cache for 5 minutes
  getLeaderboard,
);
```

## Monitoring and Debugging

### 1. Cache Metrics

```javascript
// Track cache performance
class CacheMetrics {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      latency: [],
    };
  }

  async track(operation, fn) {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.metrics.latency.push(duration);

      if (result) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }

      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getStats() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    const avgLatency =
      this.metrics.latency.length > 0
        ? this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length
        : 0;

    return {
      hitRate: hitRate.toFixed(2),
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      errors: this.metrics.errors,
      avgLatency: avgLatency.toFixed(2),
      total,
    };
  }
}

const cacheMetrics = new CacheMetrics();

// Wrap Redis calls
async function getCached(key) {
  return cacheMetrics.track('get', () => redis.get(key));
}
```

### 2. Cache Debugging Tools

```javascript
// Debug cache issues
class CacheDebugger {
  async analyzeKey(key) {
    const info = {
      exists: await redis.exists(key),
      ttl: await redis.ttl(key),
      type: await redis.type(key),
      memory: await redis.memory('USAGE', key),
      encoding: await redis.object('ENCODING', key),
      idletime: await redis.object('IDLETIME', key),
    };

    if (info.exists) {
      info.value = await redis.get(key);
      info.size = Buffer.byteLength(info.value || '');
    }

    return info;
  }

  async findLargeKeys(threshold = 1024 * 100) {
    // 100KB
    const keys = await redis.keys('*');
    const largeKeys = [];

    for (const key of keys) {
      const size = await redis.memory('USAGE', key);

      if (size > threshold) {
        largeKeys.push({ key, size });
      }
    }

    return largeKeys.sort((a, b) => b.size - a.size);
  }

  async getCacheReport() {
    const info = await redis.info('memory');
    const dbSize = await redis.dbsize();

    return {
      keys: dbSize,
      memory: info,
      hitRate: await this.getHitRate(),
      slowQueries: await redis.slowlog('GET', 10),
      largeKeys: await this.findLargeKeys(),
    };
  }
}
```

### 3. Cache Monitoring Dashboard

```javascript
// Express endpoint for cache monitoring
app.get('/admin/cache/stats', async (req, res) => {
  const stats = {
    redis: {
      connected: redis.status === 'ready',
      info: await redis.info(),
      dbSize: await redis.dbsize(),
      hitRate: cacheMetrics.getStats().hitRate,
    },
    application: {
      size: appCache.cache.size,
      maxSize: appCache.maxSize,
      stats: appCache.getStats(),
    },
    cdn: {
      hitRate: await getCDNHitRate(),
      bandwidth: await getCDNBandwidth(),
    },
  };

  res.json(stats);
});

// Cache operations endpoint
app.post('/admin/cache/flush', async (req, res) => {
  const { pattern, layer } = req.body;

  if (layer === 'redis' || layer === 'all') {
    if (pattern) {
      await invalidatePattern(pattern);
    } else {
      await redis.flushdb();
    }
  }

  if (layer === 'app' || layer === 'all') {
    appCache.clear(pattern);
  }

  if (layer === 'cdn' || layer === 'all') {
    await purgeCDNCache(pattern);
  }

  res.json({ success: true, pattern, layer });
});
```

## Cache Optimization Strategies

### 1. Cache Stampede Prevention

```javascript
// Prevent multiple processes from regenerating cache
async function getWithStampedePrevention(key, fetchFn, ttl = 3600) {
  const lockKey = `lock:${key}`;
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  // Try to acquire lock
  const locked = await redis.set(lockKey, '1', 'NX', 'EX', 30);

  if (!locked) {
    // Another process is regenerating, wait
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getWithStampedePrevention(key, fetchFn, ttl);
  }

  try {
    // Regenerate cache
    const data = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } finally {
    await redis.del(lockKey);
  }
}
```

### 2. Cache Compression

```javascript
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Compress large cache values
async function setCompressed(key, value, ttl) {
  const json = JSON.stringify(value);

  if (json.length > 1024) {
    // Compress if > 1KB
    const compressed = await gzip(json);
    await redis.setex(`${key}:gz`, ttl, compressed);
  } else {
    await redis.setex(key, ttl, json);
  }
}

async function getCompressed(key) {
  // Check for compressed version
  const compressed = await redis.getBuffer(`${key}:gz`);

  if (compressed) {
    const json = await gunzip(compressed);
    return JSON.parse(json);
  }

  // Try uncompressed
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}
```

## Best Practices Summary

1. **Design for cache failure** - System should work without cache
2. **Use appropriate TTLs** - Shorter for dynamic, longer for static
3. **Monitor hit rates** - Target >70% overall hit rate
4. **Implement cache warming** - Prevent cold starts
5. **Use multiple layers** - Browser → CDN → App → Redis → DB
6. **Invalidate smartly** - Only invalidate what changed
7. **Prevent stampedes** - Use locks or jittered TTLs
8. **Compress large values** - Reduce memory usage
9. **Version cache keys** - Easy bulk invalidation
10. **Track metrics** - Monitor and optimize continuously
