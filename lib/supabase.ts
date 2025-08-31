import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import supabaseMock from './supabaseMock2';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage for React Native
const customStorage = {
  getItem: async (key: string) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

// Use mock in demo mode, real client otherwise
const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const isOfflineMode = process.env.EXPO_PUBLIC_OFFLINE_MODE === 'true';
const isAllMocks = process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1' || process.env.USE_MOCKS === 'true';

// Create Supabase client with custom configuration
export const supabase =
  isDemoMode || isOfflineMode || isAllMocks || !supabaseUrl || supabaseUrl === ''
    ? (supabaseMock as any)
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: Platform.OS === 'web' ? undefined : customStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web',
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          level: number;
          total_xp: number;
          stars: number;
          rating: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string;
          hearts: number;
          unlimited_hearts: boolean;
          streak_freezes: number;
          is_premium: boolean;
          subscription_tier: 'free' | 'plus' | 'team' | 'lifetime';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          level?: number;
          total_xp?: number;
          stars?: number;
          rating?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string;
          hearts?: number;
          unlimited_hearts?: boolean;
          streak_freezes?: number;
          is_premium?: boolean;
          subscription_tier?: 'free' | 'plus' | 'team' | 'lifetime';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          level?: number;
          total_xp?: number;
          stars?: number;
          rating?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string;
          hearts?: number;
          unlimited_hearts?: boolean;
          streak_freezes?: number;
          is_premium?: boolean;
          subscription_tier?: 'free' | 'plus' | 'team' | 'lifetime';
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          difficulty: number;
          tags: string[];
          image_url: string | null;
          time_limit: number | null;
          points: number;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          difficulty: number;
          tags?: string[];
          image_url?: string | null;
          time_limit?: number | null;
          points?: number;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          question?: string;
          options?: string[];
          correct_answer?: number;
          explanation?: string;
          difficulty?: number;
          tags?: string[];
          image_url?: string | null;
          time_limit?: number | null;
          points?: number;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          color: string;
          order: number;
          parent_id: string | null;
          question_count: number;
          required_level: number | null;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          color: string;
          order?: number;
          parent_id?: string | null;
          question_count?: number;
          required_level?: number | null;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          icon?: string;
          color?: string;
          order?: number;
          parent_id?: string | null;
          question_count?: number;
          required_level?: number | null;
          is_premium?: boolean;
          created_at?: string;
        };
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: 'practice' | 'daily' | 'battle' | 'challenge';
          score: number;
          max_score: number;
          accuracy: number;
          time_spent: number;
          questions_answered: number;
          correct_answers: number;
          wrong_answers: number;
          skipped_questions: number;
          stars_earned: number;
          xp_earned: number;
          streak_bonus: number;
          perfect_bonus: number;
          speed_bonus: number;
          questions: Record<string, any>;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: 'practice' | 'daily' | 'battle' | 'challenge';
          score: number;
          max_score: number;
          accuracy: number;
          time_spent: number;
          questions_answered: number;
          correct_answers: number;
          wrong_answers: number;
          skipped_questions: number;
          stars_earned: number;
          xp_earned: number;
          streak_bonus?: number;
          perfect_bonus?: number;
          speed_bonus?: number;
          questions: Record<string, any>;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: 'practice' | 'daily' | 'battle' | 'challenge';
          score?: number;
          max_score?: number;
          accuracy?: number;
          time_spent?: number;
          questions_answered?: number;
          correct_answers?: number;
          wrong_answers?: number;
          skipped_questions?: number;
          stars_earned?: number;
          xp_earned?: number;
          streak_bonus?: number;
          perfect_bonus?: number;
          speed_bonus?: number;
          questions?: Record<string, any>;
          completed_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: 'speed' | 'accuracy' | 'dedication' | 'social' | 'special';
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          criteria: Record<string, any>;
          xp_reward: number;
          star_reward: number;
          badge_url: string | null;
          is_secret: boolean;
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          category: 'speed' | 'accuracy' | 'dedication' | 'social' | 'special';
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          criteria: Record<string, any>;
          xp_reward: number;
          star_reward: number;
          badge_url?: string | null;
          is_secret?: boolean;
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: 'speed' | 'accuracy' | 'dedication' | 'social' | 'special';
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          criteria?: Record<string, any>;
          xp_reward?: number;
          star_reward?: number;
          badge_url?: string | null;
          is_secret?: boolean;
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress: Record<string, any>;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          progress?: Record<string, any>;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          progress?: Record<string, any>;
        };
      };
      leaderboards: {
        Row: {
          id: string;
          user_id: string;
          period: 'daily' | 'weekly' | 'monthly' | 'all-time';
          category_id: string | null;
          score: number;
          rank: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period: 'daily' | 'weekly' | 'monthly' | 'all-time';
          category_id?: string | null;
          score: number;
          rank: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
          category_id?: string | null;
          score?: number;
          rank?: number;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          questions_answered: number;
          correct_answers: number;
          accuracy: number;
          current_streak: number;
          best_streak: number;
          category_rating: number;
          crowns_earned: number;
          max_crowns: number;
          last_activity: string;
          completion_percentage: number;
          unlocked_questions: string[];
          mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          questions_answered?: number;
          correct_answers?: number;
          accuracy?: number;
          current_streak?: number;
          best_streak?: number;
          category_rating?: number;
          crowns_earned?: number;
          max_crowns?: number;
          last_activity?: string;
          completion_percentage?: number;
          unlocked_questions?: string[];
          mastery_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          questions_answered?: number;
          correct_answers?: number;
          accuracy?: number;
          current_streak?: number;
          best_streak?: number;
          category_rating?: number;
          crowns_earned?: number;
          max_crowns?: number;
          last_activity?: string;
          completion_percentage?: number;
          unlocked_questions?: string[];
          mastery_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
        };
      };
      battles: {
        Row: {
          id: string;
          room_code: string;
          status: 'waiting' | 'starting' | 'in_progress' | 'completed';
          type: '1v1' | 'tournament' | 'team';
          category_id: string;
          participants: Record<string, any>[];
          questions: string[];
          current_question: number;
          time_per_question: number;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
          winner_id: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed';
          type: '1v1' | 'tournament' | 'team';
          category_id: string;
          participants?: Record<string, any>[];
          questions?: string[];
          current_question?: number;
          time_per_question?: number;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          winner_id?: string | null;
        };
        Update: {
          id?: string;
          room_code?: string;
          status?: 'waiting' | 'starting' | 'in_progress' | 'completed';
          type?: '1v1' | 'tournament' | 'team';
          category_id?: string;
          participants?: Record<string, any>[];
          questions?: string[];
          current_question?: number;
          time_per_question?: number;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          winner_id?: string | null;
        };
      };
      friends: {
        Row: {
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'blocked';
          shared_streak: number;
          challenges_played: number;
          challenges_won: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted' | 'blocked';
          shared_streak?: number;
          challenges_played?: number;
          challenges_won?: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted' | 'blocked';
          shared_streak?: number;
          challenges_played?: number;
          challenges_won?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | 'streak_reminder'
            | 'challenge_invite'
            | 'achievement'
            | 'friend_request'
            | 'promotion'
            | 'system';
          title: string;
          message: string;
          data: Record<string, any> | null;
          read: boolean;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | 'streak_reminder'
            | 'challenge_invite'
            | 'achievement'
            | 'friend_request'
            | 'promotion'
            | 'system';
          title: string;
          message: string;
          data?: Record<string, any> | null;
          read?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | 'streak_reminder'
            | 'challenge_invite'
            | 'achievement'
            | 'friend_request'
            | 'promotion'
            | 'system';
          title?: string;
          message?: string;
          data?: Record<string, any> | null;
          read?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_user_stats: {
        Args: {
          user_id: string;
          xp_to_add: number;
          stars_to_add: number;
        };
        Returns: void;
      };
      get_leaderboard: {
        Args: {
          period: 'daily' | 'weekly' | 'monthly' | 'all-time';
          category_id?: string;
          limit?: number;
        };
        Returns: {
          rank: number;
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          score: number;
          level: number;
        }[];
      };
      calculate_streak: {
        Args: {
          user_id: string;
        };
        Returns: {
          current_streak: number;
          longest_streak: number;
          today_completed: boolean;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper functions for real-time subscriptions
export const subscribeToChannel = (channel: string, callback: (payload: any) => void) => {
  return supabase
    .channel(channel)
    .on('postgres_changes', { event: '*', schema: 'public' }, callback)
    .subscribe();
};

export const unsubscribeFromChannel = (channel: string) => {
  return supabase.removeChannel(supabase.channel(channel));
};

// Auth helper functions
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
