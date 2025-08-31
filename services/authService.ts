import { supabase } from '../lib/supabase';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  VerifyEmailRequest,
} from '../types/api';
import { User, UserProfile } from '../types/domain';
import { ApiErrorHandler } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login with email and password
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Login failed - no user or session returned');
      }

      // Get user profile
      const profile = await this.getUserProfile(data.user.id);

      // Store tokens
      await this.storeTokens(data.session.access_token, data.session.refresh_token);

      // Set remember me
      if (request.rememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
      }

      const authResponse: AuthResponse = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url || undefined,
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date(profile.updated_at),
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
      };

      this.currentUser = authResponse.user;
      return authResponse;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Sign up new user
  async signup(request: SignupRequest): Promise<AuthResponse> {
    try {
      // Check if username is available
      const usernameAvailable = await this.checkUsernameAvailability(request.username);
      if (!usernameAvailable) {
        throw new Error('Username is already taken');
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            username: request.username,
            display_name: request.displayName,
          },
        },
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Signup failed - no user or session returned');
      }

      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: request.username,
        display_name: request.displayName,
        level: 1,
        total_xp: 0,
        stars: 0,
        rating: 1200,
        current_streak: 0,
        longest_streak: 0,
        hearts: 5,
        unlimited_hearts: false,
        streak_freezes: 0,
        is_premium: false,
        subscription_tier: 'free',
        last_active_date: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Apply referral code if provided
      if (request.referralCode) {
        await this.applyReferralCode(data.user.id, request.referralCode);
      }

      // Store tokens
      await this.storeTokens(data.session.access_token, data.session.refresh_token);

      const authResponse: AuthResponse = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          username: request.username,
          displayName: request.displayName,
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date(),
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
      };

      this.currentUser = authResponse.user;
      return authResponse;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Login with social provider
  async loginWithProvider(provider: 'google' | 'apple' | 'facebook'): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.EXPO_PUBLIC_REDIRECT_URL,
        },
      });

      if (error) throw error;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear stored tokens
      await this.clearTokens();
      await AsyncStorage.removeItem('remember_me');

      this.currentUser = null;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const profile = await this.getUserProfile(user.id);

      this.currentUser = {
        id: user.id,
        email: user.email!,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url || undefined,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(profile.updated_at),
      };

      return this.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) throw error;
    return data;
  }

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      return !data;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Reset password
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: `${process.env.EXPO_PUBLIC_REDIRECT_URL}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Update password
  async updatePassword(request: UpdatePasswordRequest): Promise<void> {
    try {
      // First verify current password
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: request.currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: request.newPassword,
      });

      if (error) throw error;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Verify email
  async verifyEmail(request: VerifyEmailRequest): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token: request.token,
        type: 'email',
      });

      if (error) throw error;
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<AuthResponse | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (!data.session) return null;

      const user = await this.getCurrentUser();
      if (!user) return null;

      await this.storeTokens(data.session.access_token, data.session.refresh_token);

      return {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Delete user profile first
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);

      if (profileError) throw profileError;

      // Note: Actual user deletion should be handled by a server-side function
      // as Supabase doesn't allow direct user deletion from client

      await this.logout();
    } catch (error) {
      const apiErr = ApiErrorHandler.handle(error);
      throw new Error(apiErr.message);
    }
  }

  // Apply referral code
  private async applyReferralCode(userId: string, referralCode: string): Promise<void> {
    try {
      // Find referrer by code
      const { data: referrer, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (error || !referrer) {
        console.error('Invalid referral code');
        return;
      }

      // Create referral record
      await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referred_id: userId,
        status: 'pending',
      });

      // Award referral bonuses (handled by database trigger)
    } catch (error) {
      console.error('Error applying referral code:', error);
    }
  }

  // Store tokens securely
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        ['refresh_token', refreshToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Clear stored tokens
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }
}

export default AuthService.getInstance();
