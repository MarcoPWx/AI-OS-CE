import { AuthService } from '../authService';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorReporter } from '../../lib/api';
import {
  createMockUser,
  createMockProfile,
  createMockAuthSession,
  createMockLoginRequest,
  createMockSignupRequest,
  resetIdCounter,
} from '../../tests/factories';
import { ServiceError, ServiceErrorType } from '../interfaces';

// Mock dependencies
jest.mock('../../lib/supabase');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../lib/api');

describe('AuthService', () => {
  let authService: AuthService;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = AuthService.getInstance();
    // Reset singleton instance
    (AuthService as any).instance = null;
    authService = AuthService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = createMockUser();
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      };
      const mockProfile = {
        id: mockUser.id,
        username: mockUser.username,
        display_name: mockUser.displayName,
        avatar_url: mockUser.avatarUrl,
        updated_at: mockUser.updatedAt.toISOString(),
      };

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
          session: mockSession,
        },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const loginRequest = createMockLoginRequest();
      const result = await authService.login(loginRequest);

      expect(result).toMatchObject({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        }),
        accessToken: mockSession.access_token,
        refreshToken: mockSession.refresh_token,
        expiresIn: mockSession.expires_in,
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: loginRequest.email,
        password: loginRequest.password,
      });
    });

    it('should throw error on invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const loginRequest = createMockLoginRequest();

      await expect(authService.login(loginRequest)).rejects.toThrow();
    });

    it('should store tokens after successful login', async () => {
      const mockUser = createMockUser();
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      };

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
          session: mockSession,
        },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                username: mockUser.username,
                display_name: mockUser.displayName,
                avatar_url: mockUser.avatarUrl,
                updated_at: mockUser.updatedAt.toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      const loginRequest = createMockLoginRequest({ rememberMe: true });
      await authService.login(loginRequest);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['access_token', mockSession.access_token],
        ['refresh_token', mockSession.refresh_token],
      ]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('remember_me', 'true');
    });
  });

  describe('signup', () => {
    it('should successfully create new account', async () => {
      const signupRequest = createMockSignupRequest();
      const mockUser = createMockUser({
        email: signupRequest.email,
        username: signupRequest.username,
        displayName: signupRequest.displayName,
      });
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      };

      // Mock username availability check
      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null, // Username is available
                  error: null,
                }),
                single: jest.fn().mockResolvedValue({
                  data: {
                    username: mockUser.username,
                    display_name: mockUser.displayName,
                  },
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({
              error: null,
            }),
          };
        }
        return {};
      });

      mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
          session: mockSession,
        },
        error: null,
      });

      const result = await authService.signup(signupRequest);

      expect(result).toMatchObject({
        user: expect.objectContaining({
          email: signupRequest.email,
          username: signupRequest.username,
          displayName: signupRequest.displayName,
        }),
        accessToken: mockSession.access_token,
        refreshToken: mockSession.refresh_token,
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: signupRequest.email,
        password: signupRequest.password,
        options: {
          data: {
            username: signupRequest.username,
            display_name: signupRequest.displayName,
          },
        },
      });
    });

    it('should throw error if username is taken', async () => {
      const signupRequest = createMockSignupRequest();

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { username: signupRequest.username }, // Username exists
              error: null,
            }),
          }),
        }),
      });

      await expect(authService.signup(signupRequest)).rejects.toThrow('Username is already taken');
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear tokens', async () => {
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({
        error: null,
      });

      await authService.logout();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access_token', 'refresh_token']);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('remember_me');
    });

    it('should throw error if logout fails', async () => {
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({
        error: { message: 'Logout failed' },
      });

      await expect(authService.logout()).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if authenticated', async () => {
      const mockUser = createMockUser();

      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
        },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                username: mockUser.username,
                display_name: mockUser.displayName,
                avatar_url: mockUser.avatarUrl,
                updated_at: mockUser.updatedAt.toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await authService.getCurrentUser();

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        displayName: mockUser.displayName,
      });
    });

    it('should return null if not authenticated', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return cached user on subsequent calls', async () => {
      const mockUser = createMockUser();

      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
        },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                username: mockUser.username,
                display_name: mockUser.displayName,
                avatar_url: mockUser.avatarUrl,
                updated_at: mockUser.updatedAt.toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      // First call
      await authService.getCurrentUser();
      // Second call should use cache
      const result = await authService.getCurrentUser();

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
      });
      // Should only call getUser once due to caching
      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkUsernameAvailability', () => {
    it('should return true if username is available', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await authService.checkUsernameAvailability('newusername');
      expect(result).toBe(true);
    });

    it('should return false if username is taken', async () => {
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { username: 'existinguser' },
              error: null,
            }),
          }),
        }),
      });

      const result = await authService.checkUsernameAvailability('existinguser');
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail = jest.fn().mockResolvedValue({
        error: null,
      });

      await authService.resetPassword({ email: 'test@example.com' });

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        }),
      );
    });

    it('should throw error if reset fails', async () => {
      mockSupabase.auth.resetPasswordForEmail = jest.fn().mockResolvedValue({
        error: { message: 'Reset failed' },
      });

      await expect(authService.resetPassword({ email: 'test@example.com' })).rejects.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if session exists', async () => {
      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'token',
            refresh_token: 'refresh',
          },
        },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false if no session', async () => {
      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockSupabase.auth.getSession = jest.fn().mockRejectedValue(new Error('Failed'));

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const mockUser = createMockUser();
      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      };

      mockSupabase.auth.refreshSession = jest.fn().mockResolvedValue({
        data: { session: newSession },
        error: null,
      });

      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: mockUser.createdAt.toISOString(),
          },
        },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                username: mockUser.username,
                display_name: mockUser.displayName,
                avatar_url: mockUser.avatarUrl,
                updated_at: mockUser.updatedAt.toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await authService.refreshAccessToken();

      expect(result).toMatchObject({
        accessToken: newSession.access_token,
        refreshToken: newSession.refresh_token,
        expiresIn: newSession.expires_in,
      });

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['access_token', newSession.access_token],
        ['refresh_token', newSession.refresh_token],
      ]);
    });

    it('should return null if refresh fails', async () => {
      mockSupabase.auth.refreshSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh failed' },
      });

      const result = await authService.refreshAccessToken();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const unsubscribe = authService.onAuthStateChange(mockCallback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();

      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
