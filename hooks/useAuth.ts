import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import authService from '../services/authService';
import {
  LoginRequest,
  SignupRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  AuthResponse,
} from '../types/api';
import { User } from '../types/domain';
import { queryKeys, resetQueries } from '../providers/QueryProvider';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // Consider user data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

// Hook to check authentication status
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
    onSuccess: (data: AuthResponse) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() });

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Logged in as ${data.user.displayName}`,
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigate to home
      router.replace('/(tabs)/home');
    },
    onError: (error: any) => {
      const message = error.message || 'Login failed. Please check your credentials.';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook for signup
export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (request: SignupRequest) => authService.signup(request),
    onSuccess: (data: AuthResponse) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Welcome to QuizMentor!',
        position: 'top',
        visibilityTime: 3000,
      });

      // Navigate to onboarding or home
      router.replace('/(onboarding)/welcome');
    },
    onError: (error: any) => {
      const message = error.message || 'Signup failed. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: message,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook for social login
export const useSocialLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (provider: 'google' | 'apple' | 'facebook') =>
      authService.loginWithProvider(provider),
    onSuccess: () => {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      // Navigate to home
      router.replace('/(tabs)/home');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Social Login Failed',
        text2: error.message || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all queries
      resetQueries();

      // Show message
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'See you soon!',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigate to login
      router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    },
  });
};

// Hook for password reset
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) => authService.resetPassword(request),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Password Reset Email Sent',
        text2: 'Please check your email for instructions',
        position: 'top',
        visibilityTime: 5000,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Password Reset Failed',
        text2: error.message || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook for updating password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (request: UpdatePasswordRequest) => authService.updatePassword(request),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Your password has been changed successfully',
        position: 'top',
        visibilityTime: 3000,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Password Update Failed',
        text2: error.message || 'Please check your current password',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook to check username availability
export const useCheckUsername = () => {
  return useMutation({
    mutationFn: (username: string) => authService.checkUsernameAvailability(username),
  });
};

// Hook for deleting account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      // Clear all queries
      resetQueries();

      Toast.show({
        type: 'info',
        text1: 'Account Deleted',
        text2: 'Your account has been permanently deleted',
        position: 'top',
        visibilityTime: 3000,
      });

      // Navigate to login
      router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.message || 'Could not delete account',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });
};

// Hook to listen to auth state changes
export const useAuthStateChange = (callback?: (user: User | null) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.auth.user(), user);

      // Call custom callback if provided
      if (callback) {
        callback(user);
      }

      // Invalidate dependent queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.list(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(user.id) });
      } else {
        // User logged out - clear all queries
        resetQueries();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, callback]);
};

// Hook to refresh access token
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.refreshAccessToken(),
    onSuccess: (data) => {
      if (data) {
        // Update user in cache
        queryClient.setQueryData(queryKeys.auth.user(), data.user);
      }
    },
  });
};

// Protected route hook
export const useRequireAuth = (redirectTo: string = '/(auth)/login') => {
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, user };
};
