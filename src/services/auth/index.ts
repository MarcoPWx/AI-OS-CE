export type AuthUser = {
  id: string;
  email: string | null;
  name?: string | null;
  avatar_url?: string | null;
  provider?: 'github' | 'email' | 'anonymous';
  created_at?: string;
  metadata?: Record<string, any>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: 'bearer';
  user: AuthUser;
};

export type AuthResult = {
  user: AuthUser | null;
  session: AuthSession | null;
  error?: string | null;
};

export interface IAuthService {
  getSession(): Promise<AuthSession | null>;
  loginWithGitHub(redirectUrl?: string): Promise<AuthResult>;
  loginWithEmail(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, name?: string): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<AuthResult>;
  logout(): Promise<{ success: boolean }>;
  updateUser(updates: Partial<AuthUser>): Promise<{ user: AuthUser }>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  confirmPasswordReset(token: string, password: string): Promise<{ success: boolean }>;
}

export function createAuthService(opts?: { useMock?: boolean; baseUrl?: string }): IAuthService {
  const useMock =
    opts?.useMock ??
    (process.env.NX_USE_MOCK_AUTH === 'true' || process.env.REACT_APP_USE_MOCK_AUTH === 'true');
  const baseUrl = opts?.baseUrl ?? '';

  // Helper to fetch with auth header if session exists
  let currentSession: AuthSession | null = null;

  const withAuth = async (input: RequestInfo, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    if (currentSession?.access_token) {
      headers.set('Authorization', `Bearer ${currentSession.access_token}`);
    }
    return fetch(input, { ...init, headers });
  };

  // MOCK IMPLEMENTATION using our MSW endpoints
  const mockImpl: IAuthService = {
    async getSession() {
      if (!currentSession) return null;
      const res = await withAuth(`${baseUrl}/api/auth/session`);
      if (res.ok) {
        const data = await res.json();
        return {
          ...currentSession!,
          expires_at: data.expires_at,
        };
      }
      return null;
    },

    async loginWithGitHub(redirectUrl?: string) {
      // In mock, we jump directly to callback exchange
      const res = await fetch(`${baseUrl}/api/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'mock_github_code', redirect_url: redirectUrl }),
      });
      if (!res.ok) return { user: null, session: null, error: 'GitHub login failed' };
      const data = await res.json();
      currentSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: Date.now() + data.expires_in * 1000,
        token_type: 'bearer',
        user: data.user,
      };
      return { user: data.user, session: currentSession };
    },

    async loginWithEmail(email: string, password: string) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return { user: null, session: null, error: 'Invalid email or password' };
      const data = await res.json();
      currentSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: Date.now() + data.expires_in * 1000,
        token_type: 'bearer',
        user: data.user,
      };
      return { user: data.user, session: currentSession };
    },

    async signUp(email: string, password: string, name?: string) {
      const res = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) return { user: null, session: null, error: 'Signup failed' };
      const data = await res.json();
      currentSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: Date.now() + data.expires_in * 1000,
        token_type: 'bearer',
        user: data.user,
      };
      return { user: data.user, session: currentSession };
    },

    async refresh(refreshToken: string) {
      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return { user: null, session: null, error: 'Refresh failed' };
      const data = await res.json();
      currentSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: Date.now() + data.expires_in * 1000,
        token_type: 'bearer',
        user: data.user,
      };
      return { user: data.user, session: currentSession };
    },

    async logout() {
      await withAuth(`${baseUrl}/api/auth/logout`, { method: 'POST' });
      currentSession = null;
      return { success: true };
    },

    async updateUser(updates: Partial<AuthUser>) {
      const res = await withAuth(`${baseUrl}/api/auth/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const data = await res.json();
      if (currentSession) currentSession.user = data.user;
      return { user: data.user };
    },

    async requestPasswordReset(email: string) {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to request password reset');
      const data = await res.json();
      return { message: data.message };
    },

    async confirmPasswordReset(token: string, password: string) {
      const res = await fetch(`${baseUrl}/api/auth/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error('Failed to confirm password reset');
      const data = await res.json();
      return { success: data.success };
    },
  };

  // REAL IMPLEMENTATION (Supabase placeholder): wire up later
  const realImpl: IAuthService = {
    async getSession() {
      throw new Error('Real auth not implemented yet');
    },
    async loginWithGitHub() {
      throw new Error('Real auth not implemented yet');
    },
    async loginWithEmail() {
      throw new Error('Real auth not implemented yet');
    },
    async signUp() {
      throw new Error('Real auth not implemented yet');
    },
    async refresh() {
      throw new Error('Real auth not implemented yet');
    },
    async logout() {
      throw new Error('Real auth not implemented yet');
    },
    async updateUser() {
      throw new Error('Real auth not implemented yet');
    },
    async requestPasswordReset() {
      throw new Error('Real auth not implemented yet');
    },
    async confirmPasswordReset() {
      throw new Error('Real auth not implemented yet');
    },
  };

  return useMock ? mockImpl : realImpl;
}
