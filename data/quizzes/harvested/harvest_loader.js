// QuizMentor Harvest Loader
// Add this to your main quiz loader

import harvestIndex from './data/quizzes/harvested/harvest_index.json';

export async function loadHarvestedQuizzes() {
  const quizzes = [];
  
  for (const quiz of harvestIndex.quizzes) {
    const quizData = await import(quiz.file);
    quizzes.push(quizData);
  }
  
  return quizzes;
}

// Add to your quiz categories
export const HARVESTED_CATEGORIES = harvestIndex.categories;

// Integration example:
// const harvestedQuizzes = await loadHarvestedQuizzes();
// allQuizzes.push(...harvestedQuizzes);
