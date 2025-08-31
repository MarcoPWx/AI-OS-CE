/**
 * Cross-platform notification service
 * Handles push notifications for iOS/Android and web notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import Storage, { STORAGE_KEYS } from '../utils/storage';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationPermissions {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain?: boolean;
}

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: boolean | string;
  categoryIdentifier?: string;
}

interface ScheduledNotification {
  content: NotificationContent;
  trigger: Notifications.NotificationTrigger;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return;
    }

    // Register for push notifications
    const token = await this.registerForPushNotifications();
    if (token) {
      this.expoPushToken = token;
      await Storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    }

    // Set up notification listeners
    this.setupListeners();

    // Configure notification categories (iOS)
    if (Platform.OS === 'ios') {
      await this.setupNotificationCategories();
    }
  }

  /**
   * Register for push notifications
   */
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check current permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });

      console.log('Push token:', token.data);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Setup Android notification channel
   */
  private async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // Create additional channels
    await Notifications.setNotificationChannelAsync('quiz-reminders', {
      name: 'Quiz Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      description: 'Daily quiz reminders and streak notifications',
    });

    await Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Achievement unlocks and level ups',
    });

    await Notifications.setNotificationChannelAsync('social', {
      name: 'Social',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Friend challenges and leaderboard updates',
    });
  }

  /**
   * Setup notification categories for iOS
   */
  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('quiz-reminder', [
      {
        identifier: 'start-quiz',
        buttonTitle: 'Start Quiz',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Remind in 1 hour',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('achievement', [
      {
        identifier: 'view',
        buttonTitle: 'View Achievement',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'share',
        buttonTitle: 'Share',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(): void {
    // Notification received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // User interacts with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;

    // Handle different notification types
    if (data?.type === 'quiz-reminder') {
      // Update UI to show reminder
    } else if (data?.type === 'achievement') {
      // Show achievement popup
    } else if (data?.type === 'friend-challenge') {
      // Navigate to challenge
    }
  }

  /**
   * Handle notification response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data;

    switch (actionIdentifier) {
      case 'start-quiz':
        // Navigate to quiz
        break;
      case 'snooze':
        this.scheduleQuizReminder(60); // Remind in 60 minutes
        break;
      case 'view':
        // Navigate to achievement
        break;
      case 'share':
        // Share achievement
        break;
      case Notifications.DEFAULT_ACTION_IDENTIFIER:
        // Default tap action
        this.handleNotificationTap(data);
        break;
    }
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: any): void {
    // Navigate based on notification data
    if (data?.screen) {
      // Navigate to specific screen
      // NavigationService.navigate(data.screen, data.params);
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(content: NotificationContent): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: content.sound ?? true,
      },
      trigger: null, // Immediate
    });

    return notificationId;
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notification: ScheduledNotification): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync(notification);
    return notificationId;
  }

  /**
   * Schedule daily quiz reminder
   */
  async scheduleDailyQuizReminder(hour: number = 19, minute: number = 0): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧠 Time for your daily quiz!',
        body: 'Keep your streak alive and level up your knowledge!',
        data: { type: 'quiz-reminder' },
        categoryIdentifier: 'quiz-reminder',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  /**
   * Schedule quiz reminder
   */
  async scheduleQuizReminder(minutesFromNow: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Quiz Time!',
        body: "Don't forget to complete your daily quiz!",
        data: { type: 'quiz-reminder' },
        categoryIdentifier: 'quiz-reminder',
      },
      trigger: {
        seconds: minutesFromNow * 60,
      },
    });
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    achievementName: string,
    description: string,
    xpReward: number,
  ): Promise<void> {
    await this.sendLocalNotification({
      title: `🏆 Achievement Unlocked!`,
      body: `${achievementName}: ${description} (+${xpReward} XP)`,
      data: {
        type: 'achievement',
        achievementName,
        xpReward,
      },
      categoryIdentifier: 'achievement',
      sound: 'achievement.wav',
    });
  }

  /**
   * Send streak notification
   */
  async sendStreakNotification(streakCount: number): Promise<void> {
    const emojis = ['🔥', '⚡', '🌟', '💪', '🚀'];
    const emoji = emojis[Math.min(Math.floor(streakCount / 7), emojis.length - 1)];

    await this.sendLocalNotification({
      title: `${emoji} ${streakCount} Day Streak!`,
      body: `Amazing! You're on a ${streakCount} day learning streak!`,
      data: {
        type: 'streak',
        streakCount,
      },
      sound: true,
    });
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Request permissions explicitly
   */
  async requestPermissions(): Promise<NotificationPermissions> {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted' && !canAskAgain) {
      Alert.alert(
        'Enable Notifications',
        'Please enable notifications in your device settings to receive quiz reminders and achievement updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Notifications.openSettingsAsync() },
        ],
      );
    }

    return { status, canAskAgain };
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Update badge count (iOS)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export default new NotificationService();
