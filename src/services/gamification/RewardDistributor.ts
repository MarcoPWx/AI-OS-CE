/**
 * RewardDistributor
 * Handles reward distribution and queueing
 */

interface Reward {
  type: 'xp' | 'badge' | 'powerup' | 'currency' | 'title';
  amount?: number;
  id?: string;
}

interface RewardDistributionParams {
  userId: string;
  achievementId: string;
  timestamp: Date;
}

interface RewardQueueParams {
  userId: string;
  rewards: Reward[];
}

interface BatchDistributionItem {
  userId: string;
  reward: Reward;
}

export class RewardDistributor {
  private rewardDefinitions: Map<string, any> = new Map([
    [
      'week_warrior',
      {
        xp: 150,
        badge: 'week_warrior_badge',
        title: 'Week Warrior',
      },
    ],
    [
      'first_quiz',
      {
        xp: 50,
        badge: 'beginner_badge',
        title: 'Quiz Starter',
      },
    ],
    [
      'perfect_score',
      {
        xp: 100,
        badge: 'perfect_badge',
        title: 'Perfectionist',
      },
    ],
    [
      'quiz_master',
      {
        xp: 500,
        badge: 'master_badge',
        title: 'Quiz Master',
      },
    ],
  ]);

  async distribute(params: RewardDistributionParams): Promise<any> {
    const rewardDef = this.rewardDefinitions.get(params.achievementId) || {
      xp: 50,
      badge: 'default_badge',
      title: 'Achievement Unlocked',
    };

    // Simulate reward distribution
    const notifications = [
      {
        type: 'achievement_unlocked',
        title: `Achievement Unlocked: ${rewardDef.title}`,
        message: `You earned ${rewardDef.xp} XP!`,
        timestamp: params.timestamp,
      },
    ];

    // Add friend notifications if applicable
    if (rewardDef.xp >= 150) {
      notifications.push({
        type: 'friend_notification',
        title: 'Share your achievement',
        message: 'Let your friends know about your accomplishment!',
        timestamp: params.timestamp,
      });
    }

    return {
      xp: rewardDef.xp,
      badge: rewardDef.badge,
      title: rewardDef.title,
      notifications,
    };
  }

  async queueRewards(params: RewardQueueParams): Promise<any> {
    // Simulate queueing rewards for distribution
    const queueId = `queue_${Date.now()}`;
    const estimatedDelivery = new Date(Date.now() + 1000); // 1 second delay

    return {
      queueId,
      status: 'queued',
      estimatedDelivery,
      rewards: params.rewards,
      userId: params.userId,
    };
  }

  async distributeBatch(items: BatchDistributionItem[]): Promise<any> {
    // Simulate batch distribution
    const results = items.map((item) => {
      try {
        // Simulate processing
        return { success: true, userId: item.userId, reward: item.reward };
      } catch (error) {
        return { success: false, userId: item.userId, error };
      }
    });

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      successful,
      failed,
      total: items.length,
      results,
    };
  }

  calculateTotalRewards(achievements: string[]): {
    totalXP: number;
    badges: string[];
    titles: string[];
  } {
    let totalXP = 0;
    const badges: string[] = [];
    const titles: string[] = [];

    achievements.forEach((achievementId) => {
      const reward = this.rewardDefinitions.get(achievementId);
      if (reward) {
        totalXP += reward.xp || 0;
        if (reward.badge) badges.push(reward.badge);
        if (reward.title) titles.push(reward.title);
      }
    });

    return { totalXP, badges, titles };
  }

  async processQuestReward(quest: any): Promise<any> {
    const rewards: Reward[] = [];

    if (quest.reward.xp) {
      rewards.push({ type: 'xp', amount: quest.reward.xp });
    }

    if (quest.reward.badge) {
      rewards.push({ type: 'badge', id: quest.reward.badge });
    }

    if (quest.reward.powerup) {
      rewards.push({ type: 'powerup', id: quest.reward.powerup });
    }

    if (quest.reward.currency) {
      rewards.push({ type: 'currency', amount: quest.reward.currency });
    }

    return this.queueRewards({
      userId: quest.userId,
      rewards,
    });
  }
}
