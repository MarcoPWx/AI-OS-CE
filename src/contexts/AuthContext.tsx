import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  createAuthService,
  IAuthService,
  AuthUser,
  AuthSession,
  AuthResult,
} from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  useMock?: boolean;
}

const SESSION_STORAGE_KEY = 'quizmentor_auth_session';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, useMock }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authService] = useState<IAuthService>(() => createAuthService({ useMock }));

  // Helper functions
  const persistSessionData = (sessionData: AuthSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
  };

  const clearSessionData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Try to load persisted session
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession) as AuthSession;

            // Check if session is still valid
            if (parsedSession.expires_at > Date.now()) {
              setSession(parsedSession);
              setUser(parsedSession.user);
            } else {
              // Session expired, try to refresh
              const result = await authService.refresh(parsedSession.refresh_token);
              if (result.session && result.user) {
                setSession(result.session);
                setUser(result.user);
                persistSessionData(result.session);
              }
            }
          }
        }

        // Check current session from service
        const currentSession = await authService.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          persistSessionData(currentSession);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [authService]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session) return;

    const refreshTime = session.expires_at - 60000; // Refresh 1 minute before expiry
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh <= 0) {
      // Already expired or about to expire, refresh immediately
      refreshSession();
      return;
    }

    const timer = setTimeout(() => {
      refreshSession();
    }, timeUntilRefresh);

    return () => clearTimeout(timer);
  }, [session]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await authService.loginWithEmail(email, password);
        if (result.error) {
          setError(result.error);
          throw new Error(result.error);
        } else if (result.session && result.user) {
          setSession(result.session);
          setUser(result.user);
          persistSessionData(result.session);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Login failed';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await authService.signUp(email, password, name);
        if (result.error) {
          setError(result.error);
          throw new Error(result.error);
        } else if (result.session && result.user) {
          setSession(result.session);
          setUser(result.user);
          persistSessionData(result.session);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Signup failed';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const signInWithGitHub = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.loginWithGitHub(window.location.href);
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      } else if (result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
        persistSessionData(result.session);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'GitHub login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
      setSession(null);
      clearSessionData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await authService.updateUser(updates);
        setUser(result.user);
        if (session) {
          const updatedSession = { ...session, user: result.user };
          setSession(updatedSession);
          persistSessionData(updatedSession);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authService, session],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        setError(null);
        await authService.requestPasswordReset(email);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to request password reset';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const confirmPasswordReset = useCallback(
    async (token: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        await authService.confirmPasswordReset(token, password);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to reset password';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authService],
  );

  const refreshSession = useCallback(async () => {
    if (!session?.refresh_token) return;

    try {
      setLoading(true);
      setError(null);
      const result = await authService.refresh(session.refresh_token);
      if (result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
        persistSessionData(result.session);
      } else if (result.error) {
        // Refresh failed, clear session
        setUser(null);
        setSession(null);
        clearSessionData();
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to refresh session:', err);
      // Clear session on refresh failure
      setUser(null);
      setSession(null);
      clearSessionData();
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh session';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [authService, session]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGitHub,
    signOut,
    updateProfile,
    resetPassword,
    confirmPasswordReset,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// HOC for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType,
) => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent />;
      }
      return <div>Please sign in to continue</div>;
    }

    return <Component {...props} />;
  };
};
