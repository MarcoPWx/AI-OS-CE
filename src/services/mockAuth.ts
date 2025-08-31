// src/services/mockAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthUser, AuthState } from './auth';

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

export interface MockUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  isPremium: boolean;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'user_1',
    email: 'alex@dev.com',
    username: 'alexdev',
    displayName: 'Alex Developer',
    level: 15,
    xp: 2500,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    isPremium: true,
  },
  {
    id: 'user_2',
    email: 'sarah@dev.com',
    username: 'sarahcodes',
    displayName: 'Sarah Codes',
    level: 12,
    xp: 1800,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    isPremium: false,
  },
  {
    id: 'user_3',
    email: 'mike@dev.com',
    username: 'mikejs',
    displayName: 'Mike JavaScript',
    level: 20,
    xp: 4200,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    isPremium: true,
  },
  {
    id: 'user_4',
    email: 'emma@dev.com',
    username: 'emmareact',
    displayName: 'Emma React',
    level: 8,
    xp: 950,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    isPremium: false,
  },
  {
    id: 'user_5',
    email: 'demo@dev.com',
    username: 'demouser',
    displayName: 'Demo User',
    level: 5,
    xp: 650,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    isPremium: false,
  },
];

class MockAuthService {
  private static instance: MockAuthService;
  private currentUser: MockUser | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.loadStoredUser();
  }

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  private async loadStoredUser() {
    try {
      const storage = getStorage();
      const storedUser = await storage.getItem('mock_current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Failed to load stored mock user:', error);
    }
  }

  private async storeUser(user: MockUser | null) {
    try {
      const storage = getStorage();
      if (user) {
        await storage.setItem('mock_current_user', JSON.stringify(user));
      } else {
        await storage.removeItem('mock_current_user');
      }
    } catch (error) {
      console.warn('Failed to store mock user:', error);
    }
  }

  private notifyListeners() {
    const authState: AuthState = {
      user: this.currentUser ? this.convertToAuthUser(this.currentUser) : null,
      session: this.currentUser
        ? ({ user: this.convertToAuthUser(this.currentUser) } as any)
        : null,
      loading: false,
      initialized: true,
    };

    this.listeners.forEach((listener) => listener(authState));
  }

  private convertToAuthUser(mockUser: MockUser): AuthUser {
    return {
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: {
        username: mockUser.username,
        display_name: mockUser.displayName,
      },
      profile: {
        id: mockUser.id,
        username: mockUser.username,
        display_name: mockUser.displayName,
        avatar_url: mockUser.avatarUrl || null,
        bio: null,
        level: mockUser.level,
        xp: mockUser.xp,
        total_points: mockUser.xp * 10,
        current_streak: Math.floor(Math.random() * 15) + 1,
        longest_streak: Math.floor(Math.random() * 30) + 5,
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        sound_enabled: true,
        last_active_at: new Date().toISOString(),
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    } as AuthUser;
  }

  // Quick login methods for development
  async quickLogin(userIndex: number = 0): Promise<{ error?: any }> {
    if (userIndex < 0 || userIndex >= MOCK_USERS.length) {
      return { error: new Error('Invalid user index') };
    }

    const user = MOCK_USERS[userIndex];
    this.currentUser = user;
    await this.storeUser(user);
    this.notifyListeners();

    console.log(`🎭 Mock Login: ${user.displayName} (${user.email})`);
    return {};
  }

  async loginAsAlex(): Promise<{ error?: any }> {
    return this.quickLogin(0);
  }

  async loginAsSarah(): Promise<{ error?: any }> {
    return this.quickLogin(1);
  }

  async loginAsMike(): Promise<{ error?: any }> {
    return this.quickLogin(2);
  }

  async loginAsEmma(): Promise<{ error?: any }> {
    return this.quickLogin(3);
  }

  async loginAsDemo(): Promise<{ error?: any }> {
    return this.quickLogin(4);
  }

  // Random login for testing
  async loginAsRandom(): Promise<{ error?: any }> {
    const randomIndex = Math.floor(Math.random() * MOCK_USERS.length);
    return this.quickLogin(randomIndex);
  }

  // Sign out
  async signOut(): Promise<{ error?: any }> {
    this.currentUser = null;
    await this.storeUser(null);
    this.notifyListeners();
    console.log('🎭 Mock Logout');
    return {};
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current state
    this.notifyListeners();

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
    return {
      user: this.currentUser ? this.convertToAuthUser(this.currentUser) : null,
      session: this.currentUser
        ? ({ user: this.convertToAuthUser(this.currentUser) } as any)
        : null,
      loading: false,
      initialized: true,
    };
  }

  // Get all mock users (for development UI)
  getMockUsers(): MockUser[] {
    return [...MOCK_USERS];
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // Check if currently using mock auth
  isMockAuth(): boolean {
    return true; // Always true for mock service
  }
}

export default MockAuthService.getInstance();
