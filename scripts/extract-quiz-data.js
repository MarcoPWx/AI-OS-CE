#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to devmentor quiz system
const DEVMENTOR_PATH = '/Users/betolbook/Documents/github/NatureQuest/devmentor/quiz-system';

// Load all question modules
const modules = [
  'extended-questions.js',
  'api-architecture-questions.js',
  'k8s-troubleshooting-questions.js',
  'http-and-api-style-questions.js',
  'backend-mastery-questions.js',
  'design-patterns-questions.js',
  'ai-concepts-questions-improved.js',
  'k8s-debugging-questions-improved.js',
  'observability-questions.js',
  'runtime-control-drills.js',
  'kubernetes-ops-drills.js',
  'docker-container-drills.js',
  'devops-cicd-drills.js',
  'database-sql-drills.js',
  'cloud-platforms-drills.js',
];

let allQuestions = [];
let allCategories = {};

// Extract questions from each module
modules.forEach((moduleName) => {
  try {
    const modulePath = path.join(DEVMENTOR_PATH, moduleName);
    if (fs.existsSync(modulePath)) {
      const moduleData = require(modulePath);

      // Extract questions based on module structure
      Object.entries(moduleData).forEach(([key, value]) => {
        if (value && value.questions && Array.isArray(value.questions)) {
          const categorySlug = key.toLowerCase().replace(/[^a-z0-9]/g, '-');

          allCategories[categorySlug] = {
            name: value.name || key,
            slug: categorySlug,
            description: `Questions about ${value.name || key}`,
            questionCount: value.questions.length,
          };

          value.questions.forEach((q, index) => {
            allQuestions.push({
              id: `${categorySlug}-${index}`,
              categorySlug,
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              explanation: q.explanation || '',
              difficulty: q.difficulty || 3,
              tags: q.tags || [],
            });
          });
        }
      });
    }
  } catch (error) {
    console.log(`Could not load ${moduleName}:`, error.message);
  }
});

// Save extracted data
const outputData = {
  categories: Object.values(allCategories),
  questions: allQuestions,
  metadata: {
    totalQuestions: allQuestions.length,
    totalCategories: Object.keys(allCategories).length,
    extractedAt: new Date().toISOString(),
  },
};

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'quiz-data.json'),
  JSON.stringify(outputData, null, 2),
);

console.log(
  `✅ Extracted ${allQuestions.length} questions from ${Object.keys(allCategories).length} categories`,
);
console.log('📁 Saved to data/quiz-data.json');
