/**
 * Unified Authentication Client
 * Shared across all ecosystem products
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

export interface EcosystemUser extends User {
  profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
    products_used: string[];
    primary_product: string;
    subscription_tier: 'free' | 'pro' | 'enterprise';
  };
}

export interface ProductPermissions {
  quizmentor: {
    hasAccess: boolean;
    role: 'user' | 'admin' | 'premium';
    features: string[];
  };
  devmentor: {
    hasAccess: boolean;
    role: 'user' | 'admin' | 'premium';
    features: string[];
  };
  harvest: {
    hasAccess: boolean;
    role: 'user' | 'admin' | 'premium';
    features: string[];
  };
  omni: {
    hasAccess: boolean;
    role: 'user' | 'admin' | 'premium';
    features: string[];
  };
}

class UnifiedAuthClient {
  private supabase: SupabaseClient;
  private currentProduct: string;
  private redirectUrls: Record<string, string>;

  constructor() {
    // Use the SAME Supabase project for ALL products
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_UNIFIED_AUTH_URL!,
      process.env.NEXT_PUBLIC_UNIFIED_AUTH_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'ecosystem-auth-token', // Same key across all products
        },
      },
    );

    // Configure product-specific redirect URLs
    this.redirectUrls = {
      quizmentor: 'https://quizmentor.ai/auth/callback',
      devmentor: 'https://devmentor.ai/auth/callback',
      harvest: 'https://harvest.ai/auth/callback',
      omni: 'https://omni.dev/auth/callback',
    };

    // Detect current product from domain or config
    this.currentProduct = this.detectCurrentProduct();
  }

  private detectCurrentProduct(): string {
    if (typeof window === 'undefined') return 'quizmentor';

    const hostname = window.location.hostname;
    if (hostname.includes('quizmentor')) return 'quizmentor';
    if (hostname.includes('devmentor')) return 'devmentor';
    if (hostname.includes('harvest')) return 'harvest';
    if (hostname.includes('omni')) return 'omni';

    // Fallback to environment variable or config
    return process.env.NEXT_PUBLIC_PRODUCT_ID || 'quizmentor';
  }

  /**
   * Single Sign-On (SSO) login
   * User logs in once, gets access to all products
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{
    user: EcosystemUser | null;
    session: Session | null;
    permissions: ProductPermissions | null;
    error: Error | null;
  }> {
    try {
      // 1. Authenticate user
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Fetch unified profile
      const profile = await this.fetchUnifiedProfile(data.user!.id);

      // 3. Track product usage
      await this.trackProductUsage(data.user!.id, this.currentProduct);

      // 4. Get permissions for all products
      const permissions = await this.fetchProductPermissions(data.user!.id);

      // 5. Sync authentication state across all domains
      await this.syncAuthAcrossDomains(data.session!);

      return {
        user: { ...data.user!, profile } as EcosystemUser,
        session: data.session,
        permissions,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        permissions: null,
        error: error as Error,
      };
    }
  }

  /**
   * OAuth Sign-In (GitHub, Google, etc.)
   * Works across all products
   */
  async signInWithOAuth(provider: 'github' | 'google') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: this.redirectUrls[this.currentProduct],
        scopes: provider === 'github' ? 'read:user user:email' : 'email profile',
        queryParams: {
          prompt: 'select_account',
          product: this.currentProduct, // Track which product initiated login
        },
      },
    });

    return { data, error };
  }

  /**
   * Universal Sign-Up
   * Creates account with access to all products
   */
  async signUp(email: string, password: string, username: string) {
    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            signup_product: this.currentProduct,
            signup_timestamp: new Date().toISOString(),
          },
        },
      });

      if (authError) throw authError;

      // 2. Create unified profile
      const { error: profileError } = await this.supabase.from('ecosystem_profiles').insert({
        id: authData.user!.id,
        email,
        username,
        display_name: username,
        products_used: [this.currentProduct],
        primary_product: this.currentProduct,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // 3. Initialize product-specific data
      await this.initializeProductData(authData.user!.id);

      // 4. Send welcome email with product suite info
      await this.sendWelcomeEmail(email, username);

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Check if user is authenticated across ecosystem
   */
  async getSession(): Promise<{
    session: Session | null;
    user: EcosystemUser | null;
    permissions: ProductPermissions | null;
  }> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (!session) {
      return { session: null, user: null, permissions: null };
    }

    const profile = await this.fetchUnifiedProfile(session.user.id);
    const permissions = await this.fetchProductPermissions(session.user.id);

    return {
      session,
      user: { ...session.user, profile } as EcosystemUser,
      permissions,
    };
  }

  /**
   * Single Sign-Out
   * Logs out from all products
   */
  async signOut() {
    // 1. Sign out from Supabase
    await this.supabase.auth.signOut();

    // 2. Clear all product-specific data
    if (typeof window !== 'undefined') {
      // Clear all ecosystem-related localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('ecosystem-') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });

      // 3. Notify other products via broadcast channel
      const bc = new BroadcastChannel('ecosystem-auth');
      bc.postMessage({ type: 'LOGOUT', product: this.currentProduct });
      bc.close();
    }

    // 4. Redirect to unified login page
    if (typeof window !== 'undefined') {
      window.location.href = `https://accounts.yourcompany.com/logout?from=${this.currentProduct}`;
    }
  }

  /**
   * Fetch unified user profile
   */
  private async fetchUnifiedProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('ecosystem_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return data;
  }

  /**
   * Get user's permissions across all products
   */
  private async fetchProductPermissions(userId: string): Promise<ProductPermissions> {
    const { data, error } = await this.supabase
      .from('product_permissions')
      .select('*')
      .eq('user_id', userId);

    // Default permissions structure
    const permissions: ProductPermissions = {
      quizmentor: { hasAccess: true, role: 'user', features: ['basic'] },
      devmentor: { hasAccess: true, role: 'user', features: ['basic'] },
      harvest: { hasAccess: true, role: 'user', features: ['basic'] },
      omni: { hasAccess: true, role: 'user', features: ['basic'] },
    };

    // Override with actual permissions from database
    if (data) {
      data.forEach((perm: any) => {
        if (permissions[perm.product_id as keyof ProductPermissions]) {
          permissions[perm.product_id as keyof ProductPermissions] = {
            hasAccess: perm.has_access,
            role: perm.role,
            features: perm.features || [],
          };
        }
      });
    }

    return permissions;
  }

  /**
   * Track which products user is actively using
   */
  private async trackProductUsage(userId: string, product: string) {
    // Update last_used timestamp for product
    await this.supabase.from('product_usage').upsert({
      user_id: userId,
      product_id: product,
      last_used: new Date().toISOString(),
      usage_count: this.supabase.sql`usage_count + 1`,
    });

    // Add product to user's products_used array if not present
    await this.supabase.rpc('add_product_to_user', {
      user_id: userId,
      product_id: product,
    });
  }

  /**
   * Sync auth state across different domains
   */
  private async syncAuthAcrossDomains(session: Session) {
    if (typeof window === 'undefined') return;

    // Use BroadcastChannel API for same-origin products
    const bc = new BroadcastChannel('ecosystem-auth');
    bc.postMessage({
      type: 'AUTH_STATE_CHANGE',
      session: session,
      product: this.currentProduct,
    });
    bc.close();

    // For cross-domain sync, use iframe postMessage
    const domains = [
      'https://quizmentor.ai',
      'https://devmentor.ai',
      'https://harvest.ai',
      'https://omni.dev',
    ];

    domains.forEach((domain) => {
      if (!window.location.origin.includes(domain)) {
        this.postMessageToIframe(domain, {
          type: 'SYNC_AUTH',
          session: session,
        });
      }
    });
  }

  /**
   * Cross-domain communication via iframe
   */
  private postMessageToIframe(targetDomain: string, message: any) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${targetDomain}/auth/sync`;

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(message, targetDomain);
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };

    document.body.appendChild(iframe);
  }

  /**
   * Initialize product-specific data for new user
   */
  private async initializeProductData(userId: string) {
    // Create default data for each product
    const promises = [];

    // QuizMentor profile
    promises.push(
      this.supabase.from('quizmentor_profiles').insert({
        user_id: userId,
        level: 1,
        xp: 0,
        total_points: 0,
      }),
    );

    // DevMentor profile
    promises.push(
      this.supabase.from('devmentor_profiles').insert({
        user_id: userId,
        coding_level: 'beginner',
        languages: [],
        ai_credits: 100, // Free credits to start
      }),
    );

    // Harvest profile
    promises.push(
      this.supabase.from('harvest_profiles').insert({
        user_id: userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        work_hours: { start: '09:00', end: '17:00' },
      }),
    );

    // Omni settings
    promises.push(
      this.supabase.from('omni_settings').insert({
        user_id: userId,
        preferred_ai_provider: 'openai',
        api_keys: {}, // User will add their own
      }),
    );

    await Promise.all(promises);
  }

  /**
   * Send welcome email showcasing all products
   */
  private async sendWelcomeEmail(email: string, username: string) {
    // This would call your email service
    await this.supabase.functions.invoke('send-welcome-email', {
      body: {
        email,
        username,
        products: ['quizmentor', 'devmentor', 'harvest', 'omni'],
        signup_product: this.currentProduct,
      },
    });
  }

  /**
   * Switch between products seamlessly
   */
  async switchProduct(targetProduct: 'quizmentor' | 'devmentor' | 'harvest' | 'omni') {
    const session = await this.getSession();

    if (!session.session) {
      // Not logged in, redirect to login
      window.location.href = `https://accounts.yourcompany.com/login?redirect=${targetProduct}`;
      return;
    }

    // Track product switch
    await this.trackProductUsage(session.user!.id, targetProduct);

    // Redirect to target product with session token
    const targetUrl = this.redirectUrls[targetProduct];
    window.location.href = `${targetUrl}?token=${session.session.access_token}`;
  }

  /**
   * Get user's activity across all products
   */
  async getEcosystemActivity(userId: string) {
    const { data, error } = await this.supabase
      .from('ecosystem_activity')
      .select(
        `
        *,
        quizmentor_stats:quizmentor_profiles(total_quizzes, level, xp),
        devmentor_stats:devmentor_profiles(projects_completed, lines_written),
        harvest_stats:harvest_profiles(hours_tracked, projects_count),
        omni_stats:omni_settings(total_completions, tokens_saved)
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return { data, error };
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      // Broadcast to other products
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('ecosystem-auth');
        bc.postMessage({ type: 'AUTH_STATE_CHANGE', event, session });
        bc.close();
      }

      callback(event, session);
    });
  }
}

// Export singleton instance
export const unifiedAuth = new UnifiedAuthClient();

// Export types
export type { Session, User } from '@supabase/supabase-js';
