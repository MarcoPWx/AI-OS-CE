// src/services/auth.ts
import { supabase, Profile, handleSupabaseError } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AuthUser extends User {
  profile?: Profile;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    session: null,
    loading: true,
    initialized: false,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initialize() {
    try {
      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn('Error getting initial session:', error);
      }

      if (session?.user) {
        const profile = await this.fetchUserProfile(session.user.id);
        this.updateAuthState({
          user: { ...session.user, profile },
          session,
          loading: false,
          initialized: true,
        });
      } else {
        this.updateAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          const profile = await this.fetchUserProfile(session.user.id);
          this.updateAuthState({
            user: { ...session.user, profile },
            session,
            loading: false,
            initialized: true,
          });
        } else {
          this.updateAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  }

  private updateAuthState(newState: Partial<AuthState>) {
    this.authState = { ...this.authState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.authState));
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current state
    listener(this.authState);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.authState;
  }

  // GitHub OAuth for web
  async signInWithGitHub(): Promise<{ error?: AuthError }> {
    try {
      this.updateAuthState({ loading: true });

      // Mock mode short-circuit
      if (process.env.USE_MOCKS === 'true') {
        const mockUser = {
          id: `user_${Date.now()}`,
          email: 'dev@quizmentor.local',
          user_metadata: { name: 'Dev User' },
        } as any;
        const mockProfile = await this.fetchUserProfile(mockUser.id);
        this.updateAuthState({
          user: { ...(mockUser as any), profile: mockProfile },
          session: {
            access_token: 'mock_access',
            refresh_token: 'mock_refresh',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: mockUser,
          } as any,
          loading: false,
          initialized: true,
        });
        return {};
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo:
            Platform.OS === 'web'
              ? `${window.location.origin}/auth/callback`
              : 'quizmentor://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        this.updateAuthState({ loading: false });
        return { error };
      }

      // For web, the redirect will handle the rest
      // For mobile, we need to handle the callback
      if (Platform.OS !== 'web') {
        // Mobile OAuth handling would go here
        this.updateAuthState({ loading: false });
      }

      return {};
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { error: error as AuthError };
    }
  }

  // Email/password sign in
  async signInWithEmail(email: string, password: string): Promise<{ error?: AuthError }> {
    try {
      this.updateAuthState({ loading: true });

      // Mock mode short-circuit
      if (process.env.USE_MOCKS === 'true') {
        const mockUser = {
          id: `user_${Date.now()}`,
          email,
          user_metadata: { name: email.split('@')[0] },
        } as any;
        const mockProfile = await this.fetchUserProfile(mockUser.id);
        this.updateAuthState({
          user: { ...(mockUser as any), profile: mockProfile },
          session: {
            access_token: 'mock_access',
            refresh_token: 'mock_refresh',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: mockUser,
          } as any,
          loading: false,
          initialized: true,
        });
        return {};
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.updateAuthState({ loading: false });
        return { error };
      }

      // Auth state will be updated via the listener
      return {};
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { error: error as AuthError };
    }
  }

  // Email/password sign up
  async signUpWithEmail(
    email: string,
    password: string,
    metadata?: any,
  ): Promise<{ error?: AuthError }> {
    try {
      this.updateAuthState({ loading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        this.updateAuthState({ loading: false });
        return { error };
      }

      // Create initial profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          username: email.split('@')[0],
          display_name: metadata?.display_name || email.split('@')[0],
          avatar_url: null,
          bio: null,
          level: 1,
          xp: 0,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          theme: 'light',
          language: 'en',
          notifications_enabled: true,
          sound_enabled: true,
          last_active_at: new Date().toISOString(),
        });
      }

      return {};
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { error: error as AuthError };
    }
  }

  // Sign out
  async signOut(): Promise<{ error?: AuthError }> {
    try {
      this.updateAuthState({ loading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        this.updateAuthState({ loading: false });
        return { error };
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['userStats', 'activeQuests', 'cachedQuestions']);

      return {};
    } catch (error) {
      this.updateAuthState({ loading: false });
      return { error: error as AuthError };
    }
  }

  // Fetch user profile
  private async fetchUserProfile(userId: string): Promise<Profile | undefined> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        console.warn('Error fetching user profile:', error);
        return undefined;
      }

      return data;
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      return undefined;
    }
  }

  // Create user profile
  private async createUserProfile(
    userId: string,
    profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<void> {
    try {
      const { error } = await supabase.from('profiles').insert({
        id: userId,
        ...profileData,
      });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Profile>): Promise<{ error?: AuthError }> {
    try {
      if (!this.authState.user) {
        return { error: new Error('No authenticated user') as AuthError };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.authState.user.id);

      if (error) {
        return { error: error as AuthError };
      }

      // Refresh user profile
      const profile = await this.fetchUserProfile(this.authState.user.id);
      this.updateAuthState({
        user: { ...this.authState.user, profile },
      });

      return {};
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          Platform.OS === 'web'
            ? `${window.location.origin}/auth/reset-password`
            : 'quizmentor://auth/reset-password',
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Update password
  async updatePassword(password: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Get user-friendly error message
  getErrorMessage(error: AuthError): string {
    return handleSupabaseError(error);
  }
}

export default AuthService.getInstance();

// Storybook-friendly minimal auth service API used by some docs/components
export type AuthSession = { user: any; refresh_token: string; expires_at: number };
export type AuthResult = { error?: string; session?: AuthSession; user?: any };
export interface IAuthService {
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  loginWithGitHub: (redirectUrl: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  getSession: () => Promise<AuthSession | null>;
  refresh: (refresh_token: string) => Promise<AuthResult>;
  updateUser: (updates: any) => Promise<{ user: any }>;
}

export function createAuthService(_opts?: { useMock?: boolean }): IAuthService {
  // Simple in-memory session for docs/stories
  let session: AuthSession | null = null;
  let user: any = null;
  return {
    async loginWithEmail(email: string) {
      user = { id: 'demo', email };
      session = { user, refresh_token: 'mock_refresh', expires_at: Date.now() + 60 * 60 * 1000 };
      return { session, user };
    },
    async signUp(email: string, _password: string, name?: string) {
      user = { id: 'demo', email, user_metadata: { name } };
      session = { user, refresh_token: 'mock_refresh', expires_at: Date.now() + 60 * 60 * 1000 };
      return { session, user };
    },
    async loginWithGitHub() {
      user = { id: 'demo', email: 'demo@quizmentor.local' };
      session = { user, refresh_token: 'mock_refresh', expires_at: Date.now() + 60 * 60 * 1000 };
      return { session, user };
    },
    async logout() {
      user = null;
      session = null;
    },
    async getSession() {
      return session;
    },
    async refresh(_token: string) {
      if (!user) return { error: 'no_session' };
      session = { user, refresh_token: 'mock_refresh', expires_at: Date.now() + 60 * 60 * 1000 };
      return { session, user };
    },
    async updateUser(updates: any) {
      user = { ...(user || { id: 'demo', email: 'demo@quizmentor.local' }), ...updates };
      if (session) session = { ...session, user };
      return { user };
    },
  };
}
