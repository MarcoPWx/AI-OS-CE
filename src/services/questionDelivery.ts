// src/services/questionDelivery.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  category_id: string;
  text: string;
  options: string[];
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  points: number;
  order_index: number;
  metadata?: Record<string, any>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  order_index: number;
  question_count?: number;
}

interface QuestionBatch {
  category_id: string;
  questions: Question[];
  timestamp: number;
  version: string;
}

interface CacheMetadata {
  lastSync: number;
  version: string;
  categories: string[];
  totalQuestions: number;
}

class QuestionDeliveryService {
  private static instance: QuestionDeliveryService;
  private cacheKeyPrefix = '@quiz_questions_';
  private metadataKey = '@quiz_metadata';
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;
  private batchSize = 20; // Questions per batch
  private cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
  private syncFrequency = 60 * 60 * 1000; // 1 hour

  private constructor() {
    this.initializeNetworkListener();
    this.startPeriodicSync();
  }

  static getInstance(): QuestionDeliveryService {
    if (!QuestionDeliveryService.instance) {
      QuestionDeliveryService.instance = new QuestionDeliveryService();
    }
    return QuestionDeliveryService.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.syncInBackground();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncInBackground();
      }
    }, this.syncFrequency);
  }

  /**
   * Get all categories with question counts
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Try to get from cache first
      const cachedCategories = await this.getCachedCategories();
      if (cachedCategories && cachedCategories.length > 0) {
        return cachedCategories;
      }

      // If online, fetch from Supabase
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('question_categories')
          .select(
            `
            *,
            questions:questions(count)
          `,
          )
          .order('order_index');

        if (data && !error) {
          const categories = data.map((cat) => ({
            ...cat,
            question_count: cat.questions?.[0]?.count || 0,
          }));

          await this.cacheCategories(categories);
          return categories;
        }
      }

      // Fallback to local data
      return this.getLocalCategories();
    } catch (error) {
      console.error('Failed to get categories:', error);
      return this.getLocalCategories();
    }
  }

  /**
   * Get questions for a category with smart batching
   */
  async getQuestions(
    categoryId: string,
    options: {
      difficulty?: 'easy' | 'medium' | 'hard';
      limit?: number;
      offset?: number;
      random?: boolean;
    } = {},
  ): Promise<Question[]> {
    const { difficulty, limit = this.batchSize, offset = 0, random = false } = options;

    try {
      // Check cache first
      const cachedBatch = await this.getCachedBatch(categoryId, offset);
      if (cachedBatch && this.isCacheValid(cachedBatch.timestamp)) {
        let questions = cachedBatch.questions;

        // Apply filters
        if (difficulty) {
          questions = questions.filter((q) => q.difficulty === difficulty);
        }

        if (random) {
          questions = this.shuffleArray(questions);
        }

        return questions.slice(0, limit);
      }

      // If online, fetch from Supabase
      if (this.isOnline) {
        let query = supabase.from('questions').select('*').eq('category_id', categoryId);

        if (difficulty) {
          query = query.eq('difficulty', difficulty);
        }

        if (!random) {
          query = query.order('order_index');
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (data && !error) {
          // Cache the batch
          await this.cacheBatch(categoryId, data, offset);

          if (random) {
            return this.shuffleArray(data);
          }

          return data;
        }
      }

      // Fallback to local data
      return this.getLocalQuestions(categoryId, options);
    } catch (error) {
      console.error('Failed to get questions:', error);
      return this.getLocalQuestions(categoryId, options);
    }
  }

  /**
   * Prefetch questions for better performance
   */
  async prefetchCategory(categoryId: string): Promise<void> {
    if (!this.isOnline) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (data && !error) {
        // Cache all questions for this category in batches
        for (let i = 0; i < data.length; i += this.batchSize) {
          const batch = data.slice(i, i + this.batchSize);
          await this.cacheBatch(categoryId, batch, i);
        }
      }
    } catch (error) {
      console.error('Failed to prefetch category:', error);
    }
  }

  /**
   * Get a random selection of questions across categories
   */
  async getRandomQuestions(count: number = 10): Promise<Question[]> {
    try {
      const categories = await this.getCategories();
      const questions: Question[] = [];
      const questionsPerCategory = Math.ceil(count / categories.length);

      for (const category of categories) {
        const categoryQuestions = await this.getQuestions(category.id, {
          limit: questionsPerCategory,
          random: true,
        });
        questions.push(...categoryQuestions);
      }

      return this.shuffleArray(questions).slice(0, count);
    } catch (error) {
      console.error('Failed to get random questions:', error);
      return [];
    }
  }

  /**
   * Search questions by text
   */
  async searchQuestions(query: string): Promise<Question[]> {
    if (!this.isOnline) {
      // Offline search in cache
      return this.searchInCache(query);
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .textSearch('text', query)
        .limit(20);

      if (data && !error) {
        return data;
      }

      return this.searchInCache(query);
    } catch (error) {
      console.error('Search failed:', error);
      return this.searchInCache(query);
    }
  }

  /**
   * Sync questions in the background
   */
  private async syncInBackground(): Promise<void> {
    try {
      const metadata = await this.getCacheMetadata();
      const shouldSync = !metadata || Date.now() - metadata.lastSync > this.syncFrequency;

      if (!shouldSync) return;

      // Get latest version from remote config
      const { data: config } = await supabase
        .from('remote_config')
        .select('content->questions_version')
        .single();

      const remoteVersion = config?.questions_version || '1.0.0';
      const localVersion = metadata?.version || '0.0.0';

      if (remoteVersion !== localVersion) {
        // Sync all categories
        const categories = await this.getCategories();

        for (const category of categories) {
          await this.prefetchCategory(category.id);
        }

        // Update metadata
        await this.updateCacheMetadata({
          lastSync: Date.now(),
          version: remoteVersion,
          categories: categories.map((c) => c.id),
          totalQuestions: categories.reduce((sum, c) => sum + (c.question_count || 0), 0),
        });
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Clear all cached questions
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const questionKeys = keys.filter((key) => key.startsWith(this.cacheKeyPrefix));
      await AsyncStorage.multiRemove([...questionKeys, this.metadataKey]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Cache management methods
  private async getCachedBatch(categoryId: string, offset: number): Promise<QuestionBatch | null> {
    try {
      const key = `${this.cacheKeyPrefix}${categoryId}_${offset}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  private async cacheBatch(
    categoryId: string,
    questions: Question[],
    offset: number,
  ): Promise<void> {
    try {
      const key = `${this.cacheKeyPrefix}${categoryId}_${offset}`;
      const batch: QuestionBatch = {
        category_id: categoryId,
        questions,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      await AsyncStorage.setItem(key, JSON.stringify(batch));
    } catch (error) {
      console.error('Failed to cache batch:', error);
    }
  }

  private async getCachedCategories(): Promise<Category[] | null> {
    try {
      const cached = await AsyncStorage.getItem('@quiz_categories');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  private async cacheCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem('@quiz_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to cache categories:', error);
    }
  }

  private async getCacheMetadata(): Promise<CacheMetadata | null> {
    try {
      const cached = await AsyncStorage.getItem(this.metadataKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  private async updateCacheMetadata(metadata: CacheMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update cache metadata:', error);
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  private async searchInCache(query: string): Promise<Question[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const questionKeys = keys.filter((key) => key.startsWith(this.cacheKeyPrefix));
      const results: Question[] = [];

      for (const key of questionKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const batch: QuestionBatch = JSON.parse(cached);
          const matches = batch.questions.filter(
            (q) =>
              q.text.toLowerCase().includes(query.toLowerCase()) ||
              q.options.some((opt) => opt.toLowerCase().includes(query.toLowerCase())),
          );
          results.push(...matches);
        }
      }

      return results.slice(0, 20);
    } catch (error) {
      return [];
    }
  }

  // Fallback to local data
  private async getLocalCategories(): Promise<Category[]> {
    try {
      const { devQuizData } = await import('./devQuizData');
      return devQuizData.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        order_index: idx,
        question_count: cat.questions.length,
      }));
    } catch (error) {
      return [];
    }
  }

  private async getLocalQuestions(categoryId: string, options: any): Promise<Question[]> {
    try {
      const { devQuizData } = await import('./devQuizData');
      const category = devQuizData.find((cat) => cat.id === categoryId);

      if (!category) return [];

      let questions = category.questions.map((q, idx) => ({
        ...q,
        category_id: categoryId,
        order_index: idx,
      }));

      if (options.difficulty) {
        questions = questions.filter((q) => q.difficulty === options.difficulty);
      }

      if (options.random) {
        questions = this.shuffleArray(questions);
      }

      return questions.slice(options.offset || 0, (options.offset || 0) + (options.limit || 20));
    } catch (error) {
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export default QuestionDeliveryService.getInstance();

// Export types
export type { Question, Category, QuestionBatch, CacheMetadata };
