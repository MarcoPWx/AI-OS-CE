/**
 * Mock Supabase Client for Demo/Offline Mode
 * Provides fallback functionality when Supabase is not available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoService } from '../services/demoService';

export class SupabaseMock {
  private demoService = DemoService.getInstance();

  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock auth: signInWithPassword', email);
      // Simulate auth delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo, accept any credentials
      if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
        const user = await this.demoService.initializeDemoMode();
        return {
          data: {
            user: { id: user.id, email: user.email, created_at: new Date().toISOString() },
            session: { access_token: 'demo-token', refresh_token: 'demo-refresh', expires_in: 3600 },
          },
          error: null,
        };
      }
      return { data: null, error: new Error('Authentication is disabled in demo mode') };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock auth: signUp', email);
      if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
        return { data: null, error: new Error('Sign up is disabled in demo mode. Please use "Quick Start Demo"') };
      }
      return { data: null, error: new Error('Authentication is disabled') };
    },

    signOut: async () => {
      console.log('Mock auth: signOut');
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('demo_mode');
      return { error: null };
    },

    getUser: async () => {
      console.log('Mock auth: getUser');
      const userStr = await AsyncStorage.getItem('current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return { data: { user: { id: user.id, email: user.email, created_at: new Date().toISOString() } }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    getSession: async () => {
      console.log('Mock auth: getSession');
      const userStr = await AsyncStorage.getItem('current_user');
      if (userStr) {
        return { data: { session: { access_token: 'demo-token', refresh_token: 'demo-refresh', expires_in: 3600 } }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    signInWithOAuth: async ({ provider }: { provider: string }) => {
      console.log('Mock auth: OAuth with', provider);
      return { data: null, error: new Error(`${provider} authentication is not available in demo mode`) };
    },

    refreshSession: async () => ({ data: { session: { access_token: 'demo-token' } }, error: null }),
  };

  from = (table: string) => {
    console.log('Mock Supabase: from', table);

    // Seed questions from devQuizData for more realistic behavior
    const { devQuizData } = require('../services/devQuizData');
    const flatQuestions: any[] = devQuizData.flatMap((cat: any) =>
      (cat.questions || []).map((q: any, idx: number) => ({
        id: q.id ?? `${cat.id}_${idx}`,
        category_id: cat.id,
        question: q.question,
        options: q.options,
        correct_answer: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation ?? '',
        difficulty: q.difficulty === 'easy' ? 2 : q.difficulty === 'hard' ? 4 : 3,
        tags: [],
        image_url: null,
        time_limit: null,
        points: 10,
        metadata: {},
        created_at: new Date().toISOString(),
        topic: q.topic || undefined,
      }))
    );

    const mockData: Record<string, any[]> = {
      profiles: [],
      user_learning_profiles: [],
      user_question_history: [],
      questions: flatQuestions,
      categories: devQuizData.map((c: any) => ({ id: c.id, name: c.name, slug: c.id, icon: c.icon })),
      quiz_sessions: [],
      achievements: [],
      leaderboard: [],
      analytics_events: [],
    };

    // Chainable query builder (thenable)
    const createBuilder = (initialRows: any[]) => {
      let rows = [...initialRows];
      const api: any = {
        select: (_cols?: string) => api,
        eq: (column: string, value: any) => { rows = rows.filter((r: any) => r[column] === value); return api; },
        in: (column: string, values: any[]) => { rows = rows.filter((r: any) => values.includes(r[column])); return api; },
        match: (filter: Record<string, any>) => { rows = rows.filter((r: any) => Object.entries(filter).every(([k, v]) => r[k] === v)); return api; },
        not: (column: string, operator: string, value: string) => {
          if (operator === 'in') {
            const list = value.replace(/[()]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
            rows = rows.filter((r: any) => !list.includes(r[column]));
          }
          return api;
        },
        gte: (column: string, value: any) => { rows = rows.filter((r: any) => r[column] >= value); return api; },
        lte: (column: string, value: any) => { rows = rows.filter((r: any) => r[column] <= value); return api; },
        order: (column: string, options?: any) => {
          if (column === 'RANDOM()') {
            rows.sort(() => Math.random() - 0.5);
          } else {
            const asc = options?.ascending !== false;
            rows.sort((a, b) => (a[column] > b[column] ? 1 : -1) * (asc ? 1 : -1));
          }
          return api;
        },
        limit: async (count: number) => ({ data: rows.slice(0, count), error: null }),
        single: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: any, reject?: any) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
      };
      return api;
    };

    return {
      select: (_cols?: string) => createBuilder(mockData[table] || []),
      insert: async (data: any) => {
        // Persist to AsyncStorage for demo purposes
        const key = `mock_${table}_data`;
        const existing = await AsyncStorage.getItem(key);
        const items = existing ? JSON.parse(existing) : [];
        const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
        items.push(newItem);
        await AsyncStorage.setItem(key, JSON.stringify(items));
        return { data: newItem, error: null };
      },
      update: async (data: any) => ({ data: { ...data, updated_at: new Date().toISOString() }, error: null, eq: () => ({ data: null, error: null }) }),
      upsert: async (data: any) => ({ data: { ...data, updated_at: new Date().toISOString() }, error: null }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    } as any;
  };

  // Realtime subscriptions (no-op in mock)
  channel = (name: string) => ({
    on: (event: string, callback: Function) => ({
      subscribe: () => {
        console.log('Mock Supabase: subscribe to channel', name);
        return {
          unsubscribe: () => {
            console.log('Mock Supabase: unsubscribe from channel', name);
          },
        };
      },
    }),
  });

  // Storage (mock implementation)
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        console.log('Mock Storage: upload to', bucket, path);
        return {
          data: { path: `${bucket}/${path}` },
          error: null,
        };
      },
      download: async (path: string) => {
        console.log('Mock Storage: download from', bucket, path);
        return {
          data: null,
          error: new Error('Storage not available in demo mode'),
        };
      },
      remove: async (paths: string[]) => {
        console.log('Mock Storage: remove from', bucket, paths);
        return {
          data: paths,
          error: null,
        };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://placeholder.com/${bucket}/${path}` },
      }),
    }),
  };

  // Functions (mock implementation)
  functions = {
    invoke: async (functionName: string, options?: any) => {
      console.log('Mock Functions: invoke', functionName, options);
      return {
        data: { success: true, message: 'Function executed in demo mode' },
        error: null,
      };
    },
  };
}

// Create singleton instance
const supabaseMock = new SupabaseMock();

export default supabaseMock;
      },
    }),
  });

  // Storage (mock implementation)
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        console.log('Mock Storage: upload to', bucket, path);
        return {
          data: { path: `${bucket}/${path}` },
          error: null,
        };
      },
      download: async (path: string) => {
        console.log('Mock Storage: download from', bucket, path);
        return {
          data: null,
          error: new Error('Storage not available in demo mode'),
        };
      },
      remove: async (paths: string[]) => {
        console.log('Mock Storage: remove from', bucket, paths);
        return {
          data: paths,
          error: null,
        };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://placeholder.com/${bucket}/${path}` },
      }),
    }),
  };

  // Functions (mock implementation)
  functions = {
    invoke: async (functionName: string, options?: any) => {
      console.log('Mock Functions: invoke', functionName, options);
      return {
        data: { success: true, message: 'Function executed in demo mode' },
        error: null,
      };
    },
  };
}

// Create singleton instance
const supabaseMock = new SupabaseMock();

export default supabaseMock;
