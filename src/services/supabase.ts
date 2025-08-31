/**
 * Supabase Client
 * Currently using mock implementation
 * Will be replaced with real Supabase client in production
 */

// Minimal chainable PostgREST-style query builder for tests
function createQueryBuilder(table: string) {
  let _data: any = null;
  const builder: any = {
    select: (columns?: string) => builder,
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => ({
      eq: (_column: string, _value: any) => Promise.resolve({ data, error: null }),
    }),
    delete: () => ({
      eq: (_column: string, _value: any) => Promise.resolve({ data: null, error: null }),
    }),
    eq: (_column: string, _value: any) => builder,
    in: (_column: string, _values: any[]) => builder,
    gte: (_column: string, _value: any) => builder,
    lte: (_column: string, _value: any) => builder,
    not: (_col: string, _op: string, _val: any) => builder,
    order: (_col: string, _opts?: any) => builder,
    limit: (_n: number) => builder,
    match: (_filter: any) => builder,
    single: () => Promise.resolve({ data: _data ?? {}, error: null }),
    maybeSingle: () => Promise.resolve({ data: _data, error: null }),
    // Allow setting mock data for tests if needed
    __setData: (d: any) => {
      _data = d;
      return builder;
    },
  };
  return builder;
}

// Mock Supabase client for development
export const supabase = {
  from: (table: string) => createQueryBuilder(table),

  auth: {
    signIn: async (_credentials: any) => ({
      user: null,
      session: null,
      error: null,
    }),
    signOut: async () => ({
      error: null,
    }),
    getSession: async () => ({
      session: null,
      error: null,
    }),
  },
};

// Export type for use in other files
export type SupabaseClient = typeof supabase;
