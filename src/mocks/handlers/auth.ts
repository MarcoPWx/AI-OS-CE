import { http, HttpResponse } from 'msw';

// Mock user data
export const mockUser = {
  id: 'mock-user-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  created_at: '2024-01-01T00:00:00Z',
  metadata: {
    level: 5,
    xp: 2500,
    streak: 7,
    achievements: ['first_quiz', 'week_streak', 'perfect_score'],
  },
};

// Mock session data
export const mockSession = {
  access_token: 'mock_access_token_123',
  refresh_token: 'mock_refresh_token_456',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer' as const,
  user: mockUser,
};

// Store for mock sessions (in-memory)
const sessions = new Map<string, typeof mockSession>();

export const authHandlers = [
  // GitHub OAuth initiation
  http.get('/api/auth/github', async ({ request }) => {
    const url = new URL(request.url);
    const redirectUrl = url.searchParams.get('redirect_url') || '/';
    return new HttpResponse(null, {
      status: 302,
      headers: { Location: `${redirectUrl}?code=mock_github_code` },
    });
  }),

  // GitHub OAuth callback
  http.post('/api/auth/github/callback', async ({ request }) => {
    const { code } = await request.json().catch(() => ({}) as any);

    if (code === 'mock_github_code' || code === 'valid_code') {
      const session = {
        ...mockSession,
        user: {
          ...mockUser,
          provider: 'github' as const,
        },
      };
      sessions.set(session.access_token, session);

      return HttpResponse.json({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        user: session.user,
        session,
      });
    }

    return HttpResponse.json({ error: 'Invalid authorization code' }, { status: 401 });
  }),

  // Email/Password login
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json().catch(() => ({}) as any);

    // Basic validation
    if (!email || !password) {
      return HttpResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Mock validation (any email with password > 6 chars succeeds)
    if (typeof password === 'string' && password.length > 6) {
      const session = {
        ...mockSession,
        user: {
          ...mockUser,
          email,
          provider: 'email' as const,
        },
      };
      sessions.set(session.access_token, session);

      return HttpResponse.json({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        user: session.user,
        session,
      });
    }

    return HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }),

  // Sign up
  http.post('/api/auth/signup', async ({ request }) => {
    const { email, password, name } = await request.json().catch(() => ({}) as any);

    if (!email || !password || password.length < 6) {
      return HttpResponse.json(
        { error: 'Valid email and password (min 6 chars) required' },
        { status: 400 },
      );
    }

    const newUser = {
      ...mockUser,
      id: `mock-user-${Date.now()}`,
      email,
      name: name || (email?.split?.('@')?.[0] ?? 'user'),
      created_at: new Date().toISOString(),
      metadata: {
        level: 1,
        xp: 0,
        streak: 0,
        achievements: [],
      },
    };

    const session = {
      ...mockSession,
      user: newUser,
    };
    sessions.set(session.access_token, session);

    return HttpResponse.json(
      {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        user: newUser,
        session,
      },
      { status: 201 },
    );
  }),

  // Get current session
  http.get('/api/auth/session', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions.get(token);

    if (session) {
      // Check if expired
      if (session.expires_at < Date.now()) {
        sessions.delete(token);
        return HttpResponse.json({ error: 'Session expired' }, { status: 401 });
      }

      return HttpResponse.json({
        valid: true,
        user: session.user,
        expires_at: session.expires_at,
      });
    }

    return HttpResponse.json({ error: 'Invalid session' }, { status: 401 });
  }),

  // Refresh token
  http.post('/api/auth/refresh', async ({ request }) => {
    const { refresh_token } = await request.json().catch(() => ({}) as any);

    // Find session by refresh token
    let currentSession: typeof mockSession | undefined;
    for (const session of sessions.values()) {
      if (session.refresh_token === refresh_token) {
        currentSession = session;
        break;
      }
    }

    if (currentSession) {
      // Generate new tokens
      const newSession = {
        ...currentSession,
        access_token: `mock_access_token_${Date.now()}`,
        refresh_token: `mock_refresh_token_${Date.now()}`,
        expires_at: Date.now() + 3600000,
      };

      // Remove old session and add new
      sessions.delete(currentSession.access_token);
      sessions.set(newSession.access_token, newSession);

      return HttpResponse.json({
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
        expires_in: newSession.expires_in,
        user: newSession.user,
      });
    }

    return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }),

  // Sign out
  http.post('/api/auth/logout', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      sessions.delete(token);
    }

    return HttpResponse.json({ success: true });
  }),

  // Update user profile
  http.patch('/api/auth/user', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const updates = await request.json().catch(() => ({}) as any);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions.get(token);

    if (session) {
      // Update user data
      session.user = {
        ...session.user,
        ...updates,
        metadata: {
          ...session.user.metadata,
          ...(updates.metadata || {}),
        },
      };

      return HttpResponse.json({ user: session.user });
    }

    return HttpResponse.json({ error: 'Invalid session' }, { status: 401 });
  }),

  // Password reset request
  http.post('/api/auth/reset-password', async ({ request }) => {
    const { email } = await request.json().catch(() => ({}) as any);

    if (!email) {
      return HttpResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Always succeed in mock mode
    return HttpResponse.json({
      message: 'Password reset email sent',
      mock_reset_token: 'mock_reset_123',
    });
  }),

  // Confirm password reset
  http.post('/api/auth/reset-password/confirm', async ({ request }) => {
    const { token, password } = await request.json().catch(() => ({}) as any);

    if (token === 'mock_reset_123' && password && password.length > 6) {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json({ error: 'Invalid token or password' }, { status: 400 });
  }),
];

// Helper to clear all sessions (for testing)
export const clearAllSessions = () => {
  sessions.clear();
};

// Helper to get all active sessions (for testing)
export const getAllSessions = () => {
  return Array.from(sessions.values());
};
