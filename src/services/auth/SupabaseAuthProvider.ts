import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
  AuthService,
  User,
  AuthSession,
  AuthError,
  AuthChangeEvent,
  AuthChangeCallback,
} from './AuthService';

export class SupabaseAuthProvider implements AuthService {
  private supabase: SupabaseClient;
  private listeners: Set<AuthChangeCallback> = new Set();

  constructor(url: string, anonKey: string) {
    this.supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.notifyListeners(this.mapSupabaseEvent(event), this.mapSession(session));
    });
  }

  async signIn(email: string, password: string): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw this.mapError(error);
    }

    if (!data.user || !data.session) {
      throw new Error('Sign in failed - no user or session returned');
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)!,
    };
  }

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw this.mapError(error);
    }

    if (!data.user) {
      throw new Error('Sign up failed - no user returned');
    }

    // Note: session might be null if email confirmation is required
    if (!data.session) {
      return {
        user: this.mapUser(data.user),
        session: {
          accessToken: '',
          refreshToken: '',
          expiresAt: Date.now(),
          user: this.mapUser(data.user),
        },
      };
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)!,
    };
  }

  async signInWithGitHub(): Promise<{ url?: string; error?: AuthError }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: this.mapError(error) };
    }

    return { url: data.url };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw this.mapError(error);
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }

    return this.mapSession(data.session);
  }

  async refreshSession(): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.supabase.auth.refreshSession();

    if (error) {
      throw this.mapError(error);
    }

    if (!data.user || !data.session) {
      throw new Error('Failed to refresh session');
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)!,
    };
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase.auth.updateUser({
      data: {
        displayName: updates.displayName,
        avatarUrl: updates.avatarUrl,
        ...updates.metadata,
      },
    });

    if (error) {
      throw this.mapError(error);
    }

    if (!data.user) {
      throw new Error('Failed to update user');
    }

    return this.mapUser(data.user);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw this.mapError(error);
    }
  }

  async verifyOtp(email: string, token: string): Promise<{ user: User; session: AuthSession }> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw this.mapError(error);
    }

    if (!data.user || !data.session) {
      throw new Error('OTP verification failed');
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)!,
    };
  }

  onAuthStateChange(callback: AuthChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Helper methods
  private mapUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName:
        supabaseUser.user_metadata?.displayName ||
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split('@')[0] ||
        'User',
      avatarUrl: supabaseUser.user_metadata?.avatarUrl || supabaseUser.user_metadata?.avatar_url,
      metadata: {
        ...supabaseUser.user_metadata,
        emailVerified: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at,
        lastSignInAt: supabaseUser.last_sign_in_at,
      },
    };
  }

  private mapSession(session: Session | null): AuthSession | null {
    if (!session) return null;

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token || '',
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
      user: this.mapUser(session.user),
    };
  }

  private mapError(error: any): AuthError {
    return {
      code: error.code || 'unknown',
      message: error.message || 'An authentication error occurred',
      status: error.status,
    };
  }

  private mapSupabaseEvent(event: string): AuthChangeEvent {
    const eventMap: Record<string, AuthChangeEvent> = {
      INITIAL_SESSION: 'INITIAL_SESSION',
      SIGNED_IN: 'SIGNED_IN',
      SIGNED_OUT: 'SIGNED_OUT',
      USER_UPDATED: 'USER_UPDATED',
      TOKEN_REFRESHED: 'TOKEN_REFRESHED',
      PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
    };

    return eventMap[event] || 'SIGNED_OUT';
  }

  private notifyListeners(event: AuthChangeEvent, session: AuthSession | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event, session);
      } catch (error) {
        console.error('Error in auth state change callback:', error);
      }
    });
  }

  // Additional Supabase-specific methods
  async signInWithGoogle(): Promise<{ url?: string; error?: AuthError }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: this.mapError(error) };
    }

    return { url: data.url };
  }

  async signInWithMagicLink(email: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw this.mapError(error);
    }
  }

  async deleteUser(): Promise<void> {
    // Note: This requires service role key for full deletion
    // Client-side can only mark for deletion
    const { error } = await this.supabase.rpc('delete_user');

    if (error) {
      throw this.mapError(error);
    }
  }

  // Get the underlying Supabase client for advanced use cases
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
