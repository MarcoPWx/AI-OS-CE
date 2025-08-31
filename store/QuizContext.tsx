import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import quizData from '../data/quiz-data.json';

interface Question {
  id: string;
  categorySlug: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
  tags: string[];
}

interface Category {
  name: string;
  slug: string;
  description: string;
  questionCount: number;
}

interface QuizContextType {
  categories: Category[];
  getQuestionsByCategory: (categorySlug: string) => Question[];
  userStats: {
    totalScore: number;
    questionsAnswered: number;
    level: number;
    xp: number;
    stars: number;
  };
  updateStats: (correct: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories] = useState<Category[]>(quizData.categories);
  const [questions] = useState<Question[]>(quizData.questions);
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    questionsAnswered: 0,
    level: 1,
    xp: 0,
    stars: 0,
  });

  const getQuestionsByCategory = (categorySlug: string): Question[] => {
    return questions.filter((q) => q.categorySlug === categorySlug);
  };

  const updateStats = (correct: boolean) => {
    setUserStats((prev) => {
      const newStats = { ...prev };
      newStats.questionsAnswered += 1;

      if (correct) {
        newStats.totalScore += 1;
        newStats.xp += 10;
        newStats.stars += 1;

        // Level up every 100 XP
        newStats.level = Math.floor(newStats.xp / 100) + 1;
      }

      return newStats;
    });
  };

  return (
    <QuizContext.Provider
      value={{
        categories,
        getQuestionsByCategory,
        userStats,
        updateStats,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
