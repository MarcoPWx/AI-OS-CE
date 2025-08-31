/**
 * Demo Service for offline/demo mode functionality
 * Provides mock data and local storage persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  lives: number;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface DemoQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category?: string;
  difficulty?: number;
}

export interface DemoProgress {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  timestamp: number;
  category?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  level?: number;
  streak?: number;
}

export class DemoService {
  private static instance: DemoService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new DemoService();
    }
    return this.instance;
  }

  async initializeDemoMode(): Promise<DemoUser> {
    const demoUser: DemoUser = {
      id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@quizmentor.local',
      level: 5,
      xp: 1250,
      streak: 7,
      lives: 3,
      interests: ['javascript', 'react', 'typescript'],
      skillLevel: 'intermediate',
    };

    await AsyncStorage.setItem('current_user', JSON.stringify(demoUser));
    await AsyncStorage.setItem('demo_mode', 'true');

    return demoUser;
  }

  async getDemoQuestions(category: string, count: number = 10): Promise<DemoQuestion[]> {
    // Comprehensive question bank for demo
    const questions: DemoQuestion[] = [
      // JavaScript Questions
      {
        id: 'js-1',
        question: 'What is the correct way to declare a constant in JavaScript?',
        options: [
          'const myVar = value',
          'let myVar = value',
          'var myVar = value',
          'constant myVar = value',
        ],
        correct: 0,
        explanation:
          'The const keyword is used to declare constants in JavaScript that cannot be reassigned.',
        category: 'javascript',
        difficulty: 1,
      },
      {
        id: 'js-2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['append()', 'push()', 'add()', 'insert()'],
        correct: 1,
        explanation: 'The push() method adds one or more elements to the end of an array.',
        category: 'javascript',
        difficulty: 1,
      },
      {
        id: 'js-3',
        question: 'What does the "===" operator do in JavaScript?',
        options: [
          'Assignment',
          'Equality without type checking',
          'Strict equality with type checking',
          'Not equal',
        ],
        correct: 2,
        explanation: 'The === operator checks for strict equality, comparing both value and type.',
        category: 'javascript',
        difficulty: 2,
      },

      // React Questions
      {
        id: 'react-1',
        question: 'What is React?',
        options: [
          'A JavaScript library for building UIs',
          'A database management system',
          'A CSS framework',
          'A testing framework',
        ],
        correct: 0,
        explanation:
          'React is a JavaScript library for building user interfaces, developed by Facebook.',
        category: 'react',
        difficulty: 1,
      },
      {
        id: 'react-2',
        question: 'What does useState return?',
        options: ['A single value', 'An array with two elements', 'An object', 'A function'],
        correct: 1,
        explanation:
          'useState returns an array with two elements: the current state value and a setter function.',
        category: 'react',
        difficulty: 2,
      },
      {
        id: 'react-3',
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correct: 1,
        explanation:
          'useEffect is the hook used for handling side effects in functional components.',
        category: 'react',
        difficulty: 2,
      },

      // TypeScript Questions
      {
        id: 'ts-1',
        question: 'What is TypeScript?',
        options: [
          'A superset of JavaScript with static typing',
          'A database query language',
          'A CSS preprocessor',
          'A testing framework',
        ],
        correct: 0,
        explanation:
          'TypeScript is a superset of JavaScript that adds static typing and other features.',
        category: 'typescript',
        difficulty: 1,
      },
      {
        id: 'ts-2',
        question: 'How do you define an interface in TypeScript?',
        options: [
          'class MyInterface {}',
          'interface MyInterface {}',
          'type MyInterface = {}',
          'define MyInterface {}',
        ],
        correct: 1,
        explanation: 'Interfaces in TypeScript are defined using the interface keyword.',
        category: 'typescript',
        difficulty: 2,
      },

      // Node.js Questions
      {
        id: 'node-1',
        question: 'What is Node.js?',
        options: [
          "A JavaScript runtime built on Chrome's V8 engine",
          'A web browser',
          'A database',
          'A CSS framework',
        ],
        correct: 0,
        explanation:
          'Node.js is a JavaScript runtime that allows you to run JavaScript on the server.',
        category: 'nodejs',
        difficulty: 1,
      },
      {
        id: 'node-2',
        question: 'Which module is used for file system operations in Node.js?',
        options: ['file', 'fs', 'filesystem', 'io'],
        correct: 1,
        explanation:
          'The fs (file system) module provides an API for interacting with the file system.',
        category: 'nodejs',
        difficulty: 2,
      },
    ];

    // Filter by category if specified
    let filteredQuestions = questions;
    if (category && category !== 'all') {
      filteredQuestions = questions.filter((q) => q.category === category);
    }

    // If not enough questions in category, use all questions
    if (filteredQuestions.length < count) {
      filteredQuestions = questions;
    }

    // Shuffle and return requested count
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async saveDemoProgress(progress: DemoProgress): Promise<void> {
    try {
      // Get existing progress history
      const historyStr = await AsyncStorage.getItem('demo_progress_history');
      const history = historyStr ? JSON.parse(historyStr) : [];

      // Add new progress
      history.push(progress);

      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      await AsyncStorage.setItem('demo_progress', JSON.stringify(progress));
      await AsyncStorage.setItem('demo_progress_history', JSON.stringify(history));

      // Update user XP
      await this.updateUserXP(progress.score);
    } catch (error) {
      console.error('Failed to save demo progress:', error);
    }
  }

  async getDemoProgress(): Promise<DemoProgress | null> {
    try {
      const progressStr = await AsyncStorage.getItem('demo_progress');
      return progressStr ? JSON.parse(progressStr) : null;
    } catch (error) {
      console.error('Failed to get demo progress:', error);
      return null;
    }
  }

  async updateUserXP(xpToAdd: number): Promise<void> {
    try {
      const userStr = await AsyncStorage.getItem('current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.xp += xpToAdd;

        // Level up logic
        const xpPerLevel = 500;
        const newLevel = Math.floor(user.xp / xpPerLevel) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
          console.log(`Level up! Now level ${newLevel}`);
        }

        await AsyncStorage.setItem('current_user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to update XP:', error);
    }
  }

  async getDemoLeaderboard(): Promise<LeaderboardEntry[]> {
    // Generate realistic-looking leaderboard data
    const names = [
      'Alex Dev',
      'Sarah Code',
      'Mike JS',
      'Lisa React',
      'Tom Node',
      'Emma Python',
      'Chris Vue',
      'Anna Swift',
      'David Rust',
      'Sophie Go',
    ];

    const avatars = ['👨‍💻', '👩‍💻', '🚀', '⚛️', '🎯', '💡', '🔥', '⭐', '💎', '🏆'];

    const leaderboard: LeaderboardEntry[] = [];

    // Add top players
    for (let i = 0; i < 10; i++) {
      leaderboard.push({
        rank: i + 1,
        name: names[i],
        score: Math.max(9850 - i * 350 + Math.floor(Math.random() * 100), 1000),
        avatar: avatars[i],
        level: Math.max(20 - i, 5),
        streak: Math.floor(Math.random() * 30) + 1,
      });
    }

    // Insert current user at position 3
    const userStr = await AsyncStorage.getItem('current_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const progressStr = await AsyncStorage.getItem('demo_progress');
      const progress = progressStr ? JSON.parse(progressStr) : { score: 0 };

      leaderboard.splice(2, 0, {
        rank: 3,
        name: `${user.name} (You)`,
        score: progress.score || 7500,
        avatar: '🎮',
        level: user.level,
        streak: user.streak,
      });

      // Adjust ranks
      for (let i = 3; i < leaderboard.length; i++) {
        leaderboard[i].rank = i + 1;
      }
    }

    return leaderboard.slice(0, 10);
  }

  async getDemoAchievements() {
    return [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first quiz',
        unlocked: true,
        icon: '🎯',
      },
      {
        id: '2',
        name: 'Quick Learner',
        description: 'Answer 10 questions correctly',
        unlocked: true,
        icon: '🚀',
      },
      {
        id: '3',
        name: 'Streak Master',
        description: 'Maintain a 7-day streak',
        unlocked: true,
        icon: '🔥',
      },
      {
        id: '4',
        name: 'JavaScript Ninja',
        description: 'Master JavaScript category',
        unlocked: false,
        icon: '⚡',
      },
      {
        id: '5',
        name: 'React Expert',
        description: 'Score 100% in React quiz',
        unlocked: false,
        icon: '⚛️',
      },
      {
        id: '6',
        name: 'Speed Demon',
        description: 'Complete a quiz in under 60 seconds',
        unlocked: false,
        icon: '⏱️',
      },
    ];
  }

  async clearDemoData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'current_user',
        'demo_mode',
        'demo_progress',
        'demo_progress_history',
      ]);
    } catch (error) {
      console.error('Failed to clear demo data:', error);
    }
  }
}

export default DemoService;
