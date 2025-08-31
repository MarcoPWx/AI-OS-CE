import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useStreakStore } from '../store/streakStore';
import { useHeartsStore } from '../store/heartsStore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationSchedule {
  hour: number;
  minute: number;
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private hasPermission: boolean = false;

  async initialize() {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    this.hasPermission = true;

    // Schedule all daily notifications
    await this.scheduleAllNotifications();

    // Listen for notification responses
    this.setupNotificationListeners();

    return true;
  }

  setupNotificationListeners() {
    // When user taps notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { data } = response.notification.request.content;

      switch (data?.type) {
        case 'streak_danger':
          // Navigate to quiz immediately
          navigateToQuiz();
          break;
        case 'hearts_full':
          // Navigate to quiz
          navigateToQuiz();
          break;
        case 'friend_passed':
          // Show leaderboard
          navigateToLeaderboard();
          break;
        case 'premium_offer':
          // Show paywall
          showPaywall('notification');
          break;
      }
    });
  }

  async scheduleAllNotifications() {
    // Clear existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const notifications: NotificationSchedule[] = [
      // Morning motivation
      {
        hour: 7,
        minute: 0,
        title: '☀️ Good morning! Ready to learn?',
        body: 'Start your day with a quick quiz to maintain your streak!',
        data: { type: 'morning' },
      },

      // Lunch break nudge
      {
        hour: 12,
        minute: 30,
        title: '🍔 Lunch break learning!',
        body: 'Perfect time for a 5-minute quiz session',
        data: { type: 'lunch' },
      },

      // Competitive pressure
      {
        hour: 17,
        minute: 0,
        title: '📈 Sarah just passed you!',
        body: 'She completed 3 quizzes today. Can you beat that?',
        data: { type: 'friend_passed' },
      },

      // Streak danger - CRITICAL
      {
        hour: 20,
        minute: 0,
        title: '🔥⚠️ STREAK IN DANGER!',
        body: `Your ${this.getCurrentStreak()}-day streak ends in 4 hours!`,
        data: { type: 'streak_danger' },
      },

      // Last chance
      {
        hour: 21,
        minute: 30,
        title: '⏰ Last chance for daily XP!',
        body: 'Complete one quiz to earn your daily bonus',
        data: { type: 'last_chance' },
      },

      // Hearts regenerated
      {
        hour: 9,
        minute: 0,
        title: '❤️ Your hearts are full!',
        body: 'Time to continue learning!',
        data: { type: 'hearts_full' },
      },
    ];

    // Schedule each notification
    for (const notif of notifications) {
      await this.scheduleDailyNotification(notif);
    }

    // Schedule dynamic notifications based on user behavior
    await this.scheduleSmartNotifications();
  }

  async scheduleDailyNotification(schedule: NotificationSchedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: schedule.title,
        body: schedule.body,
        data: schedule.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour: schedule.hour,
        minute: schedule.minute,
        repeats: true,
      },
    });
  }

  async scheduleSmartNotifications() {
    const streak = this.getCurrentStreak();
    const hearts = this.getCurrentHearts();

    // Streak milestone approaching
    if (streak === 6) {
      await this.scheduleOneTimeNotification(
        '🎯 One more day to 7-day milestone!',
        "Complete today's quiz to unlock your achievement!",
        60, // in 1 minute
      );
    }

    // Lost streak recovery
    if (streak === 0) {
      await this.scheduleOneTimeNotification(
        '💔 We miss you!',
        'Start a new streak today with 50% off Premium!',
        30,
        { type: 'premium_offer' },
      );
    }

    // Hearts depleted
    if (hearts === 0) {
      await this.scheduleOneTimeNotification(
        '❤️ Hearts regenerating...',
        'Or get unlimited hearts with Premium!',
        3600, // 1 hour
        { type: 'premium_offer' },
      );
    }
  }

  async scheduleOneTimeNotification(title: string, body: string, seconds: number, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds,
      },
    });
  }

  // Aggressive re-engagement for churned users
  async scheduleWinBackCampaign(daysSinceLastActive: number) {
    const messages = [
      {
        day: 1,
        title: '😢 We miss you!',
        body: 'Your learning streak is waiting to be restarted',
      },
      {
        day: 3,
        title: '🎁 Special offer just for you!',
        body: '50% off Premium - Today only!',
      },
      {
        day: 7,
        title: '⚠️ Your progress will be deleted',
        body: 'Log in now to save your achievements',
      },
      {
        day: 14,
        title: '🚨 FINAL WARNING',
        body: 'Account deletion in 24 hours. Save your data now!',
      },
      {
        day: 30,
        title: '💔 One last chance',
        body: '90% off lifetime Premium. Expires in 1 hour!',
      },
    ];

    const message = messages.find((m) => m.day === daysSinceLastActive);
    if (message) {
      await this.scheduleOneTimeNotification(
        message.title,
        message.body,
        10, // Send immediately
        { type: 'win_back', discount: true },
      );
    }
  }

  // Social pressure notifications
  async sendSocialPressure() {
    const socialMessages = [
      '👥 5 of your friends just completed quizzes!',
      '🏆 You dropped to #8 on the leaderboard',
      '📊 Average user completes 3 quizzes daily. You: 0',
      '🔥 Emma has a 45-day streak. You can beat that!',
      '💪 John just unlocked Master level. When will you?',
    ];

    const randomMessage = socialMessages[Math.floor(Math.random() * socialMessages.length)];

    await this.scheduleOneTimeNotification(randomMessage, "Don't let them get ahead!", 1, {
      type: 'social_pressure',
    });
  }

  // Helper methods
  private getCurrentStreak(): number {
    return useStreakStore.getState().currentStreak;
  }

  private getCurrentHearts(): number {
    return useHeartsStore.getState().hearts;
  }

  // Badge update for iOS
  async updateBadgeCount(count: number) {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  // Clear all notifications
  async clearAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    await this.updateBadgeCount(0);
  }
}

export const notificationService = new NotificationService();

// Notification templates for different scenarios
export const notificationTemplates = {
  streakDanger: (streak: number) => ({
    title: `🔥 ${streak}-day streak at risk!`,
    body: 'Complete a quiz in the next hour or lose everything!',
  }),

  premiumUpsell: () => ({
    title: '💎 Unlock your full potential',
    body: 'Premium users learn 3x faster. Try free for 7 days!',
  }),

  heartsEmpty: () => ({
    title: '💔 Out of hearts!',
    body: 'Watch an ad or upgrade to Premium for unlimited play',
  }),

  friendChallenge: (friendName: string) => ({
    title: `⚔️ ${friendName} challenged you!`,
    body: "Accept the challenge and show who's the real quiz master",
  }),

  achievementClose: (achievementName: string) => ({
    title: `🏆 So close to ${achievementName}!`,
    body: 'Just one more quiz to unlock this achievement',
  }),

  dailyChallenge: () => ({
    title: '🎯 Daily Challenge Available!',
    body: '2x XP for the next hour only!',
  }),
};
