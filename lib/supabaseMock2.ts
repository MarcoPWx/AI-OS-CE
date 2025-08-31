/**
 * Mock Supabase Client for Demo/Offline Mode (fixed builder)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoService } from '../services/demoService';

export class SupabaseMock2 {
  private demoService = DemoService.getInstance();

  // RPC mock for function calls
  rpc = async (_fn: string, _params?: any) => {
    // Simulate success for any RPC used in tests
    return { data: { success: true }, error: null };
  };

  auth = {
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      await new Promise((res) => setTimeout(res, 100));
      if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
        const user = await this.demoService.initializeDemoMode();
        return {
          data: {
            user: { id: user.id, email: user.email },
            session: { access_token: 'demo-token' },
          },
          error: null,
        };
      }
      return { data: null, error: new Error('Authentication is disabled in demo mode') };
    },
    signUp: async () => ({
      data: null,
      error: new Error('Sign up is disabled in demo mode. Please use "Quick Start Demo"'),
    }),
    signOut: async () => {
      await AsyncStorage.multiRemove(['current_user', 'demo_mode']);
      return { error: null };
    },
    getUser: async () => {
      const userStr = await AsyncStorage.getItem('current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return { data: { user: { id: user.id, email: user.email } }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
      const userStr = await AsyncStorage.getItem('current_user');
      return { data: { session: userStr ? { access_token: 'demo-token' } : null }, error: null };
    },
    signInWithOAuth: async ({ provider }: { provider: string }) => ({
      data: null,
      error: new Error(`${provider} authentication is not available in demo mode`),
    }),
    refreshSession: async () => ({
      data: { session: { access_token: 'demo-token' } },
      error: null,
    }),
  };

  from = (table: string) => {
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
      })),
    );

    const mockData: Record<string, any[]> = {
      profiles: [],
      user_learning_profiles: [],
      user_question_history: [],
      questions: flatQuestions,
      categories: devQuizData.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.id,
        icon: c.icon,
      })),
      quiz_sessions: [],
      achievements: [],
      leaderboard: [],
      analytics_events: [],
    };

    const createBuilder = (initialRows: any[]) => {
      let rows = [...initialRows];
      let appliedLimit: number | null = null;
      const api: any = {
        select: () => api,
        eq: (column: string, value: any) => {
          rows = rows.filter((r: any) => r[column] === value);
          return api;
        },
        in: (column: string, values: any[]) => {
          rows = rows.filter((r: any) => values.includes(r[column]));
          return api;
        },
        match: (filter: Record<string, any>) => {
          rows = rows.filter((r: any) => Object.entries(filter).every(([k, v]) => r[k] === v));
          return api;
        },
        not: (column: string, operator: string, value: string) => {
          if (operator === 'in') {
            const list = value
              .replace(/[()]/g, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            rows = rows.filter((r: any) => !list.includes(r[column]));
          }
          return api;
        },
        gte: (column: string, value: any) => {
          rows = rows.filter((r: any) => r[column] >= value);
          return api;
        },
        lte: (column: string, value: any) => {
          rows = rows.filter((r: any) => r[column] <= value);
          return api;
        },
        order: (column: string, options?: any) => {
          if (column === 'RANDOM()') {
            rows.sort(() => Math.random() - 0.5);
          } else {
            const asc = options?.ascending !== false;
            rows.sort((a, b) => (a[column] > b[column] ? 1 : -1) * (asc ? 1 : -1));
          }
          return api;
        },
        limit: (count: number) => {
          appliedLimit = count;
          rows = rows.slice(0, count);
          return api;
        },
        single: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: any, reject?: any) => {
          const finalRows = appliedLimit != null ? rows.slice(0, appliedLimit) : rows;
          return Promise.resolve({ data: finalRows, error: null }).then(resolve, reject);
        },
      };
      return api;
    };

    return {
      select: () => createBuilder(mockData[table] || []),
      insert: async (data: any) => {
        const key = `mock_${table}_data`;
        const existing = await AsyncStorage.getItem(key);
        const items = existing ? JSON.parse(existing) : [];
        const newItem = {
          ...data,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        items.push(newItem);
        await AsyncStorage.setItem(key, JSON.stringify(items));
        // Return a chainable interface similar to Supabase: .select().single()
        return {
          select: () => ({
            single: async () => ({ data: newItem, error: null }),
            then: (resolve: any, reject?: any) =>
              Promise.resolve({ data: [newItem], error: null }).then(resolve, reject),
          }),
          then: (resolve: any, reject?: any) =>
            Promise.resolve({ data: newItem, error: null }).then(resolve, reject),
        } as any;
      },
      update: (data: any) => ({
        eq: (_column: string, _value: any) => ({
          select: () => ({
            single: async () => ({
              data: { ...data, updated_at: new Date().toISOString() },
              error: null,
            }),
          }),
        }),
      }),
      upsert: async (data: any) => ({
        data: { ...data, updated_at: new Date().toISOString() },
        error: null,
      }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    } as any;
  };

  channel = (_name: string) => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) });

  storage = {
    from: (_bucket: string) => ({
      upload: async (path: string) => ({ data: { path }, error: null }),
      download: async (_p: string) => ({
        data: null,
        error: new Error('Storage not available in demo mode'),
      }),
      remove: async (paths: string[]) => ({ data: paths, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://placeholder.com/${path}` } }),
    }),
  };

  functions = {
    invoke: async (_fn: string, _opt?: any) => ({ data: { success: true }, error: null }),
  };
}

const supabaseMock2 = new SupabaseMock2();
export default supabaseMock2;
