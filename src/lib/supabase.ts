/**
 * Supabase Client Configuration
 * Central configuration for all Supabase interactions
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web-compatible storage for development
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }
  return AsyncStorage;
};

// Database types (will be generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          level: number;
          xp: number;
          total_points: number;
          current_streak: number;
          longest_streak: number;
          theme: 'light' | 'dark';
          language: string;
          notifications_enabled: boolean;
          sound_enabled: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          difficulty: 'easy' | 'medium' | 'hard' | 'expert';
          total_questions: number;
          correct_answers: number;
          score: number;
          xp_earned: number;
          points_earned: number;
          started_at: string;
          completed_at: string | null;
          time_spent: number | null;
          status: 'in_progress' | 'completed' | 'abandoned';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quiz_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['quiz_sessions']['Insert']>;
      };
      // Add more table types as needed
    };
    Views: {};
    Functions: {};
  };
}

// Get environment variables with fallback for development
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1' || process.env.USE_MOCKS === 'true';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Using placeholder Supabase configuration for development');
}

// Prefer mock Supabase when in mock mode to avoid any real network usage
import { supabase as mockSupabase } from '../services/supabase';

// Create Supabase client with web-compatible storage (real) or use mock
export const supabase = USE_MOCKS
  ? (mockSupabase as any)
  : createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable for React Native
      },
      global: {
        headers: {
          'x-platform': Platform.OS, // Track platform for analytics
        },
      },
    });

// Export types for use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'];

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    // Common error messages to user-friendly messages
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Incorrect email or password',
      'User already registered': 'An account with this email already exists',
      'Email not confirmed': 'Please verify your email before logging in',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Network error': 'Unable to connect. Please check your internet connection',
    };

    // Check if we have a user-friendly message
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return value;
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
