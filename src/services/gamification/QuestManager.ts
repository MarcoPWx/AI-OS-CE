/**
 * QuestManager
 * Manages quest generation, tracking, and completion
 */

interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  name: string;
  description: string;
  requirement: any;
  reward: any;
  expires: Date;
  difficulty?: string;
  category?: string;
  minLevel?: number;
}

interface QuestGenerationParams {
  userId: string;
  userLevel: number;
  preferences: string[];
  recentActivity?: any;
}

interface QuestTemplate {
  name: string;
  type: string;
  category: string;
  minLevel: number;
  requirement: any;
  reward: any;
}

export class QuestManager {
  private questTemplates: QuestTemplate[] = [
    {
      name: 'Quick Learner',
      type: 'daily',
      category: 'general',
      minLevel: 1,
      requirement: { type: 'quiz_complete', count: 3 },
      reward: { xp: 100, powerup: 'xp_boost' },
    },
    {
      name: 'Perfect Day',
      type: 'daily',
      category: 'performance',
      minLevel: 5,
      requirement: { type: 'perfect_score', count: 1 },
      reward: { xp: 200, badge: 'daily_perfect' },
    },
    {
      name: 'Category Master',
      type: 'daily',
      category: 'specific',
      minLevel: 10,
      requirement: { type: 'category_quiz', count: 5 },
      reward: { xp: 150, currency: 50 },
    },
    {
      name: 'Speed Runner',
      type: 'daily',
      category: 'performance',
      minLevel: 15,
      requirement: { type: 'fast_completion', count: 3 },
      reward: { xp: 175, powerup: 'time_freeze' },
    },
    {
      name: 'Expert Challenge',
      type: 'daily',
      category: 'expert',
      minLevel: 20,
      requirement: { type: 'hard_quiz', count: 2 },
      reward: { xp: 300, badge: 'expert_daily' },
    },
    {
      name: 'React Expert',
      type: 'daily',
      category: 'react',
      minLevel: 15,
      requirement: { type: 'category_quiz', category: 'react', count: 3 },
      reward: { xp: 250, badge: 'react_daily' },
    },
    {
      name: 'TypeScript Expert',
      type: 'daily',
      category: 'typescript',
      minLevel: 15,
      requirement: { type: 'category_quiz', category: 'typescript', count: 3 },
      reward: { xp: 250, badge: 'ts_daily' },
    },
  ];

  async generateDailyQuests(params: QuestGenerationParams): Promise<Quest[]> {
    const eligibleTemplates = this.questTemplates.filter(
      (template) => template.minLevel <= params.userLevel,
    );

    // Prioritize templates based on user preferences
    const preferredTemplates = eligibleTemplates.filter((template) =>
      params.preferences.some(
        (pref) => template.category === pref || template.category === 'general',
      ),
    );

    // Select up to 3 quests, filling from eligible if preferred is insufficient
    const initialPool = preferredTemplates.length > 0 ? preferredTemplates : eligibleTemplates;
    const selectedTemplates = this.selectQuests(initialPool, Math.min(3, eligibleTemplates.length));
    if (selectedTemplates.length < 3) {
      const remaining = eligibleTemplates.filter((t) => !selectedTemplates.includes(t));
      const fill = this.selectQuests(remaining, 3 - selectedTemplates.length);
      selectedTemplates.push(...fill);
    }

    // Add expert quests for high-level users with good performance
    if (params.recentActivity?.averageScore >= 85 && params.userLevel >= 25) {
      const expertQuest = this.questTemplates.find(
        (t) => t.name.includes('Expert') && !selectedTemplates.includes(t),
      );
      if (expertQuest && selectedTemplates.length > 0) {
        selectedTemplates[selectedTemplates.length - 1] = expertQuest;
      }
    }

    // Convert templates to actual quests
    return selectedTemplates.map((template) => this.createQuestFromTemplate(template));
  }

  getQuestTemplates(params: { userLevel: number; preferences: string[] }): QuestTemplate[] {
    return this.questTemplates.filter(
      (template) =>
        template.minLevel <= params.userLevel &&
        params.preferences.some(
          (pref) => template.category === pref || template.category === 'general',
        ),
    );
  }

  validateCompletion(params: { questId: string; requirement: any; userActions: any[] }): boolean {
    const matchingActions = params.userActions.filter(
      (action) => action.type === params.requirement.type,
    );

    return matchingActions.length >= params.requirement.count;
  }

  private selectQuests(templates: QuestTemplate[], count: number): QuestTemplate[] {
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private createQuestFromTemplate(template: QuestTemplate): Quest {
    const now = new Date();
    const expires = new Date(now);
    expires.setHours(23, 59, 59, 999); // End of day

    return {
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'daily',
      name: template.name,
      description: this.generateDescription(template),
      requirement: template.requirement,
      reward: template.reward,
      expires,
      difficulty: template.minLevel >= 20 ? 'hard' : template.minLevel >= 10 ? 'medium' : 'easy',
      category: template.category,
      minLevel: template.minLevel,
    };
  }

  private generateDescription(template: QuestTemplate): string {
    const { requirement } = template;

    if (requirement.type === 'quiz_complete') {
      return `Complete ${requirement.count} quiz${requirement.count > 1 ? 'zes' : ''}`;
    } else if (requirement.type === 'perfect_score') {
      return `Get ${requirement.count} perfect score${requirement.count > 1 ? 's' : ''}`;
    } else if (requirement.type === 'category_quiz') {
      return `Complete ${requirement.count} ${requirement.category || 'category'} quiz${requirement.count > 1 ? 'zes' : ''}`;
    } else if (requirement.type === 'fast_completion') {
      return `Complete ${requirement.count} quiz${requirement.count > 1 ? 'zes' : ''} in under 30 seconds`;
    } else if (requirement.type === 'hard_quiz') {
      return `Complete ${requirement.count} hard difficulty quiz${requirement.count > 1 ? 'zes' : ''}`;
    }

    return 'Complete the quest requirements';
  }
}
