# Auth Implementation Plan (Mock-First)

## Overview

Implement authentication that works seamlessly with both MSW mocks and real Supabase, enabling parallel development and testing.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   UI Layer  │────▶│  AuthService │────▶│  Provider   │
│             │     │  (Adapter)   │     │ MSW/Supabase│
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                    ┌───────▼────────┐
                    │  Session Store │
                    │  (AsyncStorage)│
                    └────────────────┘
```

## Phase 1: Mock Implementation (Day 1)

### 1.1 MSW Auth Handlers

```typescript
// src/mocks/handlers/auth.ts
export const authHandlers = [
  // GitHub OAuth
  rest.post('/api/auth/github', async (req, res, ctx) => {
    const { code } = await req.json();
    if (code === 'valid_code') {
      return res(
        ctx.json({
          access_token: 'mock_token',
          user: mockUser,
          session: mockSession,
        }),
      );
    }
    return res(ctx.status(401));
  }),

  // Email/Password
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    if (email && password.length > 6) {
      return res(
        ctx.json({
          access_token: 'mock_token',
          user: { ...mockUser, email },
          session: mockSession,
        }),
      );
    }
    return res(ctx.status(401));
  }),

  // Session validation
  rest.get('/api/auth/session', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    if (token === 'Bearer mock_token') {
      return res(ctx.json({ valid: true, user: mockUser }));
    }
    return res(ctx.status(401));
  }),
];
```

### 1.2 Auth Service Adapter

```typescript
// src/services/authService.ts
interface AuthProvider {
  signInWithGitHub(): Promise<AuthResult>;
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
}

class AuthService {
  private provider: AuthProvider;

  constructor() {
    this.provider = USE_MOCKS ? new MockAuthProvider() : new SupabaseAuthProvider();
  }

  async signIn(method: 'github' | 'email', credentials?: Credentials) {
    // Common logic for both mock and real
    const result =
      method === 'github'
        ? await this.provider.signInWithGitHub()
        : await this.provider.signInWithEmail(credentials);

    // Store session
    await AsyncStorage.setItem('session', JSON.stringify(result.session));

    return result;
  }
}
```

## Phase 2: Supabase Integration (Day 2)

### 2.1 Environment Configuration

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
EXPO_PUBLIC_GITHUB_CLIENT_ID=xxx
EXPO_PUBLIC_REDIRECT_URL=exp://localhost:19000/--/auth/callback
```

### 2.2 Supabase Provider

```typescript
// src/services/providers/supabaseAuthProvider.ts
class SupabaseAuthProvider implements AuthProvider {
  async signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: process.env.EXPO_PUBLIC_REDIRECT_URL,
      },
    });

    if (error) throw error;
    return this.formatAuthResult(data);
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return this.formatAuthResult(data);
  }
}
```

## Phase 3: UI Integration (Day 3)

### 3.1 Auth Context

```typescript
// src/contexts/AuthContext.tsx
export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check stored session on mount
    authService.getSession().then(session => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 3.2 Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
export const ProtectedRoute: React.FC = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" />

  return <>{children}</>
}
```

## Testing Strategy

### E2E Tests (Already Created)

- ✅ Mock auth flow validation
- ✅ Session persistence tests
- ✅ Protected route tests
- ✅ Auth error handling

### Migration Tests

```typescript
// Run same tests against both mock and real
describe('Auth Migration Tests', () => {
  const providers = [
    { name: 'Mock', useMocks: true },
    { name: 'Supabase', useMocks: false },
  ];

  providers.forEach(({ name, useMocks }) => {
    describe(`Auth with ${name}`, () => {
      beforeEach(() => {
        process.env.USE_MOCKS = useMocks;
      });

      test('GitHub OAuth flow', async () => {
        // Same test works for both
      });

      test('Email/password flow', async () => {
        // Same test works for both
      });
    });
  });
});
```

## Rollout Plan

### Stage 1: Mock Only (Current)

- All auth flows use MSW mocks
- Full E2E test coverage
- No external dependencies

### Stage 2: Dual Mode (Next Sprint)

- Feature flag controls mock vs real
- Both modes fully tested
- Gradual rollout to team

### Stage 3: Production (Future)

- Real auth as default
- Mocks for development/testing
- Full monitoring and analytics

## Success Criteria

1. **Functional Requirements**
   - [ ] GitHub OAuth works in mock mode
   - [ ] Email/password works in mock mode
   - [ ] Session persists across app restarts
   - [ ] Protected routes enforce auth
   - [ ] Logout clears session properly

2. **Testing Requirements**
   - [ ] All auth E2E tests pass with mocks
   - [ ] Migration tests pass with both providers
   - [ ] Error scenarios handled gracefully
   - [ ] Performance benchmarks met

3. **Documentation Requirements**
   - [ ] Auth flow diagrams updated
   - [ ] API documentation complete
   - [ ] Setup guide for developers
   - [ ] Troubleshooting guide

## Risk Mitigation

| Risk                  | Mitigation                         |
| --------------------- | ---------------------------------- |
| Supabase downtime     | Mock fallback always available     |
| OAuth redirect issues | Deep link handling + fallback      |
| Session expiry        | Automatic refresh + re-auth prompt |
| Migration bugs        | Parallel testing of both modes     |

## Timeline

- **Day 1**: Mock implementation complete
- **Day 2**: Supabase provider integrated
- **Day 3**: UI integration and testing
- **Day 4**: Documentation and rollout

## Next Steps

1. Review and approve this plan
2. Set up MSW auth handlers
3. Implement AuthService adapter
4. Create auth UI components
5. Run comprehensive E2E tests
6. Document and deploy
