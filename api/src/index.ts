import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { Redis } from 'ioredis';
import * as Sentry from '@sentry/node';
import { PostHog } from 'posthog-node';

// Services
import { OpenAIService } from './services/openai.service';
import { QuizService } from './services/quiz.service';
import { AdaptiveEngine } from './services/adaptive.service';
import { CacheService } from './services/cache.service';
import { FeatureFlags } from './services/feature-flags.service';

// Routes
import quizRoutes from './routes/quiz.routes';
import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';

// Initialize environment
const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});

// Initialize PostHog for analytics & feature flags
const posthog = new PostHog(process.env.POSTHOG_API_KEY || '', { host: 'https://app.posthog.com' });

// Initialize Redis for caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Global middleware
app.use(Sentry.Handlers.requestHandler());
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check Redis connection
    await redis.ping();

    // Check database connection
    const dbHealthy = await checkDatabaseHealth();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'connected',
        database: dbHealthy ? 'connected' : 'disconnected',
        openai: 'ready',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// A/B Testing endpoint example
app.post('/api/generate-question', async (req, res) => {
  try {
    const { userId, topic, difficulty } = req.body;

    // Check feature flag for AI model selection
    const useGPT4 = await posthog.isFeatureEnabled('use-gpt4-generation', userId);

    const openAI = new OpenAIService({
      model: useGPT4 ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
      cacheService: new CacheService(redis),
    });

    // Track A/B test variant
    posthog.capture({
      distinctId: userId,
      event: 'question_generation_started',
      properties: {
        model: useGPT4 ? 'gpt-4' : 'gpt-3.5',
        topic,
        difficulty,
      },
    });

    const question = await openAI.generateQuestion({
      topic,
      difficulty,
      bloomLevel: req.body.bloomLevel || 'understanding',
    });

    res.json({ question, model: useGPT4 ? 'gpt-4' : 'gpt-3.5' });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    requestId: res.locals.requestId,
  });
});

// Database health check function
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Import your database client
    const { pool } = await import('./lib/database');
    const result = await pool.query('SELECT 1');
    return !!result.rows;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing connections...');

  // Flush PostHog events
  await posthog.shutdown();

  // Close Redis connection
  await redis.quit();

  // Close database connections
  const { pool } = await import('./lib/database');
  await pool.end();

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Feature flags: ${process.env.POSTHOG_API_KEY ? 'enabled' : 'disabled'}`);
  console.log(`🔍 Monitoring: ${process.env.SENTRY_DSN ? 'enabled' : 'disabled'}`);
  console.log(`🤖 AI Model: ${process.env.OPENAI_API_KEY ? 'connected' : 'not configured'}`);
});
