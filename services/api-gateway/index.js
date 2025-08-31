const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Service URLs from environment
const services = {
  learningOrchestrator:
    process.env.LEARNING_ORCHESTRATOR_URL || 'http://learning-orchestrator:3010',
  adaptiveEngine: process.env.ADAPTIVE_ENGINE_URL || 'http://adaptive-engine:3011',
  bloomValidator: process.env.BLOOM_VALIDATOR_URL || 'http://bloom-validator:3012',
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Service health checks
app.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled([
    fetch(`${services.learningOrchestrator}/health`).then((r) => r.json()),
    fetch(`${services.adaptiveEngine}/health`).then((r) => r.json()),
    fetch(`${services.bloomValidator}/health`).then((r) => r.json()),
  ]);

  res.json({
    learningOrchestrator: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    adaptiveEngine: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    bloomValidator: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
  });
});

// Authentication middleware (placeholder)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT validation
  const token = req.headers.authorization?.split(' ')[1];
  if (!token && req.path !== '/health') {
    // return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = 'demo-user'; // Placeholder
  next();
};

// Apply authentication to protected routes
app.use('/api/*', authenticate);

// Route to Learning Orchestrator
app.use(
  '/api/sessions',
  createProxyMiddleware({
    target: services.learningOrchestrator,
    changeOrigin: true,
    pathRewrite: {
      '^/api/sessions': '/sessions',
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(502).json({ error: 'Service unavailable' });
    },
  }),
);

app.use(
  '/api/learning-paths',
  createProxyMiddleware({
    target: services.learningOrchestrator,
    changeOrigin: true,
    pathRewrite: {
      '^/api/learning-paths': '/learning-paths',
    },
  }),
);

// Route to Adaptive Engine
app.use(
  '/api/adapt',
  createProxyMiddleware({
    target: services.adaptiveEngine,
    changeOrigin: true,
    pathRewrite: {
      '^/api/adapt': '/adapt',
    },
  }),
);

app.use(
  '/api/recommendations',
  createProxyMiddleware({
    target: services.adaptiveEngine,
    changeOrigin: true,
    pathRewrite: {
      '^/api/recommendations': '/recommendations',
    },
  }),
);

app.use(
  '/api/analytics',
  createProxyMiddleware({
    target: services.adaptiveEngine,
    changeOrigin: true,
    pathRewrite: {
      '^/api/analytics': '/analytics',
    },
  }),
);

// Route to Bloom Validator
app.use(
  '/api/validate',
  createProxyMiddleware({
    target: services.bloomValidator,
    changeOrigin: true,
    pathRewrite: {
      '^/api/validate': '/validate',
    },
  }),
);

app.use(
  '/api/classify',
  createProxyMiddleware({
    target: services.bloomValidator,
    changeOrigin: true,
    pathRewrite: {
      '^/api/classify': '/classify',
    },
  }),
);

// Composite endpoints that orchestrate multiple services
app.post('/api/quiz/start', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const userId = req.userId;

    // 1. Get user profile from Adaptive Engine
    const profileResponse = await fetch(`${services.adaptiveEngine}/recommendations/${userId}`);
    const profile = await profileResponse.json();

    // 2. Start session with Learning Orchestrator
    const sessionResponse = await fetch(`${services.learningOrchestrator}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        topic,
        difficulty: difficulty || profile.recommendedDifficulty,
        learningStyle: profile.learningStyle,
      }),
    });
    const session = await sessionResponse.json();

    // 3. Validate questions with Bloom Validator
    const validationResponse = await fetch(`${services.bloomValidator}/validate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: session.questions }),
    });
    const validation = await validationResponse.json();

    res.json({
      sessionId: session.id,
      questions: session.questions,
      validation: validation.results,
      profile: profile,
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz session' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    availableEndpoints: [
      '/health',
      '/api/sessions/*',
      '/api/learning-paths/*',
      '/api/adapt/*',
      '/api/recommendations/*',
      '/api/analytics/*',
      '/api/validate/*',
      '/api/classify/*',
      '/api/quiz/start',
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`Connected services:`);
  console.log(`  - Learning Orchestrator: ${services.learningOrchestrator}`);
  console.log(`  - Adaptive Engine: ${services.adaptiveEngine}`);
  console.log(`  - Bloom Validator: ${services.bloomValidator}`);
});
