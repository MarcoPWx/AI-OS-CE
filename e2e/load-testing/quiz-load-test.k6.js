/**
 * k6 Load Testing Scripts for QuizMentor
 * Run with: k6 run quiz-load-test.k6.js
 * Dashboard: k6 run --out influxdb=http://localhost:8086/k6 quiz-load-test.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const loginErrors = new Counter('login_errors');
const quizCompletions = new Counter('quiz_completions');
const apiErrors = new Rate('api_errors');
const quizDuration = new Trend('quiz_duration');
const questionResponseTime = new Trend('question_response_time');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test scenarios
export const options = {
  scenarios: {
    // Scenario 1: Smoke Test (minimal load)
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { scenario: 'smoke' },
      exec: 'smokeTest',
    },

    // Scenario 2: Load Test (normal load)
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 }, // Ramp up to 10 users
        { duration: '5m', target: 10 }, // Stay at 10 users
        { duration: '2m', target: 0 }, // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'load' },
      exec: 'loadTest',
    },

    // Scenario 3: Stress Test (high load)
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 }, // Ramp up to 50 users
        { duration: '5m', target: 50 }, // Stay at 50 users
        { duration: '2m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 0 }, // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'stress' },
      exec: 'stressTest',
      startTime: '10m', // Start after other tests
    },

    // Scenario 4: Spike Test (sudden load)
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 }, // Baseline load
        { duration: '1m', target: 5 }, // Stay at baseline
        { duration: '10s', target: 200 }, // Spike to 200 users
        { duration: '3m', target: 200 }, // Stay at spike
        { duration: '10s', target: 5 }, // Back to baseline
        { duration: '3m', target: 5 }, // Stay at baseline
        { duration: '10s', target: 0 }, // Ramp down
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'spike' },
      exec: 'spikeTest',
      startTime: '30m',
    },

    // Scenario 5: Soak Test (sustained load)
    soak_test: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30m',
      tags: { scenario: 'soak' },
      exec: 'soakTest',
      startTime: '45m',
    },
  },

  thresholds: {
    // API response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // API error rate threshold
    api_errors: ['rate<0.05'], // Less than 5% error rate

    // Custom metric thresholds
    quiz_duration: ['p(95)<60000'], // 95% of quizzes complete in under 60s
    question_response_time: ['p(95)<2000'], // 95% of questions answered in under 2s

    // Failure rate
    http_req_failed: ['rate<0.1'], // Less than 10% failure rate
  },
};

// Helper functions
function generateUser() {
  const timestamp = Date.now();
  const random = randomIntBetween(1000, 9999);
  return {
    email: `user${timestamp}${random}@test.com`,
    username: `user${timestamp}${random}`,
    password: 'TestPass123!',
  };
}

function loginUser() {
  const user = generateUser();

  const signupRes = http.post(
    `${API_URL}/auth/signup`,
    JSON.stringify({
      email: user.email,
      username: user.username,
      password: user.password,
      displayName: 'Test User',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (signupRes.status === 409) {
    // User exists, try login
    const loginRes = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const success = check(loginRes, {
      'login successful': (r) => r.status === 200,
    });

    if (!success) {
      loginErrors.add(1);
      return null;
    }

    const data = JSON.parse(loginRes.body);
    return data.data.tokens.accessToken;
  }

  const success = check(signupRes, {
    'signup successful': (r) => r.status === 201 || r.status === 200,
  });

  if (!success) {
    loginErrors.add(1);
    return null;
  }

  const data = JSON.parse(signupRes.body);
  return data.data.tokens.accessToken;
}

function getCategories(token) {
  const res = http.get(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  check(res, {
    'categories loaded': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    apiErrors.add(1);
    return [];
  }

  const data = JSON.parse(res.body);
  return data.data || [];
}

function startQuiz(token, categoryId) {
  const res = http.post(
    `${API_URL}/quiz/start`,
    JSON.stringify({
      categoryId: categoryId,
      difficulty: randomItem(['easy', 'medium', 'hard']),
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  check(res, {
    'quiz started': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    apiErrors.add(1);
    return null;
  }

  const data = JSON.parse(res.body);
  return data.data;
}

function answerQuestion(token, quizId, questionId, answerId) {
  const startTime = Date.now();

  const res = http.post(
    `${API_URL}/quiz/answer`,
    JSON.stringify({
      quizId: quizId,
      questionId: questionId,
      answerId: answerId,
      timeSpent: randomIntBetween(5, 30),
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const responseTime = Date.now() - startTime;
  questionResponseTime.add(responseTime);

  check(res, {
    'answer submitted': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    apiErrors.add(1);
  }
}

function completeQuiz(token, quizId) {
  const res = http.post(
    `${API_URL}/quiz/complete`,
    JSON.stringify({
      quizId: quizId,
    }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  check(res, {
    'quiz completed': (r) => r.status === 200,
  });

  if (res.status === 200) {
    quizCompletions.add(1);
  } else {
    apiErrors.add(1);
  }

  return res;
}

// Test scenarios
export function smokeTest() {
  const token = loginUser();
  if (!token) return;

  const categories = getCategories(token);
  if (categories.length === 0) return;

  const category = randomItem(categories);
  const quiz = startQuiz(token, category.id);
  if (!quiz) return;

  // Answer a few questions
  for (let i = 0; i < 3; i++) {
    if (quiz.questions && quiz.questions[i]) {
      const question = quiz.questions[i];
      const answer = randomItem(question.options);
      answerQuestion(token, quiz.id, question.id, answer.id);
      sleep(randomIntBetween(1, 3));
    }
  }

  completeQuiz(token, quiz.id);
}

export function loadTest() {
  group('User Journey', () => {
    const token = loginUser();
    if (!token) return;

    sleep(randomIntBetween(1, 3));

    group('Browse Categories', () => {
      const categories = getCategories(token);
      sleep(randomIntBetween(2, 5));
    });

    group('Take Quiz', () => {
      const categories = getCategories(token);
      if (categories.length === 0) return;

      const category = randomItem(categories);
      const quizStartTime = Date.now();
      const quiz = startQuiz(token, category.id);
      if (!quiz) return;

      // Simulate quiz taking
      const numQuestions = randomIntBetween(5, 10);
      for (let i = 0; i < numQuestions; i++) {
        if (quiz.questions && quiz.questions[i]) {
          const question = quiz.questions[i];
          const answer = randomItem(question.options);

          // Simulate thinking time
          sleep(randomIntBetween(3, 15));

          answerQuestion(token, quiz.id, question.id, answer.id);
        }
      }

      completeQuiz(token, quiz.id);

      const quizEndTime = Date.now();
      quizDuration.add(quizEndTime - quizStartTime);
    });

    group('View Results', () => {
      const res = http.get(`${API_URL}/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      check(res, {
        'stats loaded': (r) => r.status === 200,
      });

      sleep(randomIntBetween(2, 5));
    });
  });
}

export function stressTest() {
  // Similar to load test but with less sleep time
  const token = loginUser();
  if (!token) return;

  const categories = getCategories(token);
  if (categories.length === 0) return;

  // Rapid quiz taking
  for (let quizNum = 0; quizNum < 3; quizNum++) {
    const category = randomItem(categories);
    const quiz = startQuiz(token, category.id);
    if (!quiz) continue;

    // Answer questions rapidly
    for (let i = 0; i < 5; i++) {
      if (quiz.questions && quiz.questions[i]) {
        const question = quiz.questions[i];
        const answer = randomItem(question.options);
        answerQuestion(token, quiz.id, question.id, answer.id);
        sleep(0.5); // Minimal delay
      }
    }

    completeQuiz(token, quiz.id);
  }
}

export function spikeTest() {
  // Aggressive user behavior during spike
  const token = loginUser();
  if (!token) return;

  // Bombard with requests
  for (let i = 0; i < 10; i++) {
    http.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const categories = getCategories(token);
  if (categories.length > 0) {
    const category = randomItem(categories);
    startQuiz(token, category.id);
  }
}

export function soakTest() {
  // Sustained normal usage
  const token = loginUser();
  if (!token) return;

  while (true) {
    const categories = getCategories(token);
    sleep(randomIntBetween(10, 30));

    if (categories.length > 0 && Math.random() > 0.3) {
      const category = randomItem(categories);
      const quiz = startQuiz(token, category.id);

      if (quiz) {
        // Take a full quiz
        const numQuestions = Math.min(quiz.questions?.length || 10, 10);
        for (let i = 0; i < numQuestions; i++) {
          if (quiz.questions && quiz.questions[i]) {
            const question = quiz.questions[i];
            const answer = randomItem(question.options);
            sleep(randomIntBetween(5, 20));
            answerQuestion(token, quiz.id, question.id, answer.id);
          }
        }

        completeQuiz(token, quiz.id);
      }
    }

    // Check leaderboard occasionally
    if (Math.random() > 0.7) {
      http.get(`${API_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    sleep(randomIntBetween(30, 60));
  }
}

// Lifecycle hooks
export function setup() {
  // Setup code - create test data if needed
  console.log('Setting up load test...');

  // Check if API is reachable
  const res = http.get(`${API_URL}/health`);
  if (res.status !== 200) {
    throw new Error('API is not reachable');
  }

  return { startTime: Date.now() };
}

export function teardown(data) {
  // Cleanup code
  const duration = Date.now() - data.startTime;
  console.log(`Test completed in ${duration}ms`);

  // Could clean up test users here if needed
}

// Default function for simple run
export default function () {
  loadTest();
}
