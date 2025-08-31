/**
 * Unified Quiz Data Service for BETA Environment
 * Combines all quiz categories from different sources
 */

import { Category, Question } from './devQuizData';
import { devQuizData } from './devQuizData';
import { expandedQuizData } from './expandedQuizData';
import { quizData } from './quizData';

// Combine all quiz categories
export const allQuizCategories: Category[] = [
  ...quizData, // Original categories (Geography, Science, History, etc.)
  ...devQuizData, // Development categories (JavaScript, React, Node.js, Docker)
  ...expandedQuizData, // BETA categories (SRE, K8s, Load Testing, Cloud, etc.)
];

// Get all unique category IDs
export const getAllCategoryIds = (): string[] => {
  return allQuizCategories.map((cat) => cat.id);
};

// Get category by ID
export const getCategoryById = (categoryId: string): Category | undefined => {
  return allQuizCategories.find((cat) => cat.id === categoryId);
};

// Get questions by category
export const getQuestionsByCategory = (categoryId: string): Question[] => {
  const category = getCategoryById(categoryId);
  return category ? category.questions : [];
};

// Get all questions across all categories
export const getAllQuestions = (): Question[] => {
  return allQuizCategories.flatMap((cat) => cat.questions);
};

// Get questions by difficulty across all categories
export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
  return getAllQuestions().filter((q) => q.difficulty === difficulty);
};

// Get random questions from a specific category
export const getRandomQuestions = (categoryId: string, count: number): Question[] => {
  const questions = getQuestionsByCategory(categoryId);
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get random questions from all categories
export const getRandomQuestionsFromAll = (count: number): Question[] => {
  const allQuestions = getAllQuestions();
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get adaptive questions based on user performance
export const getAdaptiveQuestions = (
  userLevel: number,
  categoryId: string | null,
  count: number,
): Question[] => {
  // Determine difficulty distribution based on user level
  const distribution = {
    easy: userLevel < 5 ? 0.5 : userLevel < 10 ? 0.3 : 0.2,
    medium: userLevel < 5 ? 0.3 : userLevel < 10 ? 0.4 : 0.4,
    hard: userLevel < 5 ? 0.2 : userLevel < 10 ? 0.3 : 0.4,
  };

  const questions: Question[] = [];
  const easyCount = Math.floor(count * distribution.easy);
  const mediumCount = Math.floor(count * distribution.medium);
  const hardCount = count - easyCount - mediumCount;

  const sourceQuestions = categoryId ? getQuestionsByCategory(categoryId) : getAllQuestions();

  const easyQuestions = sourceQuestions.filter((q) => q.difficulty === 'easy');
  const mediumQuestions = sourceQuestions.filter((q) => q.difficulty === 'medium');
  const hardQuestions = sourceQuestions.filter((q) => q.difficulty === 'hard');

  // Shuffle and pick questions
  questions.push(...easyQuestions.sort(() => 0.5 - Math.random()).slice(0, easyCount));
  questions.push(...mediumQuestions.sort(() => 0.5 - Math.random()).slice(0, mediumCount));
  questions.push(...hardQuestions.sort(() => 0.5 - Math.random()).slice(0, hardCount));

  return questions.sort(() => 0.5 - Math.random());
};

// Search questions across all categories
export const searchQuestions = (query: string): Question[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllQuestions().filter(
    (q) =>
      q.question.toLowerCase().includes(lowercaseQuery) ||
      q.explanation?.toLowerCase().includes(lowercaseQuery),
  );
};

// Get category statistics
export const getCategoryStats = (): Array<{
  id: string;
  name: string;
  icon: string;
  totalQuestions: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}> => {
  return allQuizCategories.map((cat) => {
    const questions = cat.questions;
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      totalQuestions: questions.length,
      difficulty: {
        easy: questions.filter((q) => q.difficulty === 'easy').length,
        medium: questions.filter((q) => q.difficulty === 'medium').length,
        hard: questions.filter((q) => q.difficulty === 'hard').length,
      },
    };
  });
};

// Get questions for specific learning paths
export const getLearningPathQuestions = (path: string): Question[] => {
  const pathMapping: Record<string, string[]> = {
    frontend: ['javascript', 'react', 'performance', 'security'],
    backend: ['nodejs', 'database-optimization', 'api-design', 'security'],
    devops: ['docker', 'kubernetes-orchestration', 'cicd-automation', 'cloud-platforms'],
    sre: ['sre-operations', 'monitoring-observability', 'load-testing-performance'],
    fullstack: ['javascript', 'react', 'nodejs', 'docker', 'cloud-platforms'],
    cloud: ['cloud-platforms', 'kubernetes-orchestration', 'cloud-devops'],
    mobile: ['mobile-dev', 'react', 'performance'],
    ai: ['ai-ml', 'database-optimization'],
    security: ['security', 'security-compliance'],
    blockchain: ['web3'],
  };

  const categories = pathMapping[path.toLowerCase()] || [];
  return categories.flatMap((catId) => getQuestionsByCategory(catId));
};

// Export summary statistics
export const getQuizStatsSummary = () => {
  const totalCategories = allQuizCategories.length;
  const totalQuestions = getAllQuestions().length;
  const difficulties = {
    easy: getQuestionsByDifficulty('easy').length,
    medium: getQuestionsByDifficulty('medium').length,
    hard: getQuestionsByDifficulty('hard').length,
  };

  const categoriesBySource = {
    original: quizData.length,
    development: devQuizData.length,
    beta: expandedQuizData.length,
  };

  return {
    totalCategories,
    totalQuestions,
    difficulties,
    categoriesBySource,
    categories: getCategoryStats(),
  };
};

// Create a unified quiz data object for easy access
export const unifiedQuizData = {
  allQuizCategories,
  getAllCategoryIds,
  getCategoryById,
  getQuestionsByCategory,
  getAllQuestions,
  getQuestionsByDifficulty,
  getRandomQuestions,
  getRandomQuestionsFromAll,
  getAdaptiveQuestions,
  searchQuestions,
  getCategoryStats,
  getLearningPathQuestions,
  getQuizStatsSummary,
};

// Export all consolidated data
export { allQuizCategories, Category, Question };

export default unifiedQuizData;
