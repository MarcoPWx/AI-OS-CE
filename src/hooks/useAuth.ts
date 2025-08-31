// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AuthService, { AuthState, AuthUser } from '../services/auth';
import { AuthError } from '@supabase/supabase-js';

export interface UseAuthReturn {
  // State
  user: AuthUser | null;
  session: any;
  loading: boolean;
  initialized: boolean;

  // Actions
  signInWithGitHub: () => Promise<{ error?: AuthError }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  updateProfile: (updates: any) => Promise<{ error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;

  // Utilities
  getErrorMessage: (error: AuthError) => string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(() => AuthService.getAuthState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = AuthService.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  // Derived state
  const isAuthenticated = !!authState.user;
  const isAdmin = authState.user?.profile?.level >= 100; // Admin level threshold
  const isPremium = authState.user?.email?.includes('premium') || false; // Placeholder logic

  return {
    // State
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,

    // Actions
    signInWithGitHub: AuthService.signInWithGitHub.bind(AuthService),
    signInWithEmail: AuthService.signInWithEmail.bind(AuthService),
    signUpWithEmail: AuthService.signUpWithEmail.bind(AuthService),
    signOut: AuthService.signOut.bind(AuthService),
    updateProfile: AuthService.updateProfile.bind(AuthService),
    resetPassword: AuthService.resetPassword.bind(AuthService),
    updatePassword: AuthService.updatePassword.bind(AuthService),

    // Utilities
    getErrorMessage: AuthService.getErrorMessage.bind(AuthService),
    isAuthenticated,
    isAdmin,
    isPremium,
  };
}
