# 🎮 Gamification System Documentation

## Overview

The QuizMentor gamification system is designed to maximize user engagement through proven psychological patterns while maintaining an enjoyable learning experience. This document details all gamification mechanics, formulas, and implementation strategies.

## 📊 Core Systems

### 1. XP & Leveling System

#### Level Calculation Formula

```typescript
// Base configuration
const LEVEL_CONFIG = {
  baseXP: 100,      // XP required for level 1
  exponent: 1.5,    // Growth rate
  maxLevel: 100     // Level cap
};

// XP required for next level
XPRequired = baseXP * (currentLevel ^ exponent)

// Examples:
Level 1: 100 XP
Level 10: 3,162 XP
Level 25: 12,500 XP
Level 50: 35,355 XP
Level 100: 100,000 XP
```

#### XP Sources

| Action         | Base XP  | Multipliers              |
| -------------- | -------- | ------------------------ |
| Correct Answer | 10       | Combo, Streak, Power-ups |
| Perfect Quiz   | 50       | Difficulty bonus         |
| Daily Login    | Day × 10 | Consecutive bonus        |
| Achievement    | Variable | 25-2000 XP               |
| Quest Complete | 100-500  | Special quest bonus      |

### 2. Streak System

#### Mechanics

- **Window**: 24 hours to maintain
- **Bonus XP**: streak × 10 per day
- **Warning**: At 20 hours (configurable)
- **Break Protection**: One-time 48hr grace period at 30+ days

#### Streak Milestones

```
3 days: 🔥 First Streak Achievement
7 days: ⚔️ Week Warrior Achievement
30 days: 💪 Unstoppable Achievement
100 days: 👑 Legendary Achievement
```

### 3. Combo Multiplier

#### Formula

```typescript
comboMultiplier = 1 + (consecutiveCorrect * 0.5)
maxCombo = 5.0x

// Reset conditions:
- Wrong answer
- Time expires
- Quiz ends
```

#### Visual Feedback

- 1.5x: Blue glow
- 2.0x: Green pulse
- 3.0x: Gold particles
- 4.0x: Rainbow effect
- 5.0x: Fire animation

### 4. Achievement System

#### Tiers & Rewards

| Tier     | Color   | XP Multiplier | Rarity    |
| -------- | ------- | ------------- | --------- |
| Bronze   | #CD7F32 | 1x            | Common    |
| Silver   | #C0C0C0 | 1.5x          | Uncommon  |
| Gold     | #FFD700 | 2x            | Rare      |
| Platinum | #E5E5E5 | 3x            | Epic      |
| Diamond  | #B9F2FF | 5x            | Legendary |

#### Achievement Categories

**Performance**

- Perfect Score (100%)
- Speed Demon (<30 seconds)
- Comeback Kid (50% improvement)
- Accuracy Master (95% over 10 quizzes)

**Milestones**

- First Steps (1 quiz)
- Dedicated (10 quizzes)
- Committed (50 quizzes)
- Master (100 quizzes)
- Legend (1000 quizzes)

**Category Mastery**

- Explorer (Try all categories)
- Specialist (Master 1 category)
- Expert (Master 3 categories)
- Polymath (Master 5 categories)

**Social**

- Friendly Rival (Challenge friend)
- Social Butterfly (Share 10 times)
- Mentor (Help 10 friends)
- Influencer (50 referrals)

**Secret Achievements**

- Night Owl (Play after midnight)
- Early Bird (Play before 6 AM)
- Lucky Seven (Score exactly 77%)
- Perfect Week (7 perfect scores in 7 days)

### 5. Power-Up System

#### Available Power-Ups

| Power-Up          | Effect         | Duration   | Rarity    |
| ----------------- | -------------- | ---------- | --------- |
| ⚡ XP Boost       | 2x XP          | 24 hours   | Common    |
| ⏰ Time Freeze    | Stop timer     | 1 question | Common    |
| ⏭️ Skip           | Skip question  | Instant    | Common    |
| 💡 Hint           | Show hint      | Instant    | Uncommon  |
| 2️⃣ Double Points  | 2x points      | 1 question | Rare      |
| 🛡️ Shield         | Protect streak | 1 mistake  | Epic      |
| 🎯 Perfect Vision | Show answer    | Instant    | Legendary |

#### Acquisition Methods

- Daily login rewards
- Achievement unlocks
- Quest completions
- Mystery boxes (10% chance)
- Purchase with coins
- Special events

### 6. Quest System

#### Quest Types

**Daily Quests** (24hr expiry)

```javascript
{
  "Complete 3 Quizzes": { xp: 100, powerup: "hint" },
  "Perfect Score": { xp: 150 },
  "Try New Category": { xp: 75, coins: 50 },
  "Maintain Streak": { xp: 50 }
}
```

**Weekly Challenges** (7 days)

```javascript
{
  "Complete 20 Quizzes": { xp: 500, badge: "weekly_warrior" },
  "Master a Category": { xp: 750, powerup: "xp_boost" },
  "Top 10 Leaderboard": { xp: 1000, title: "competitor" }
}
```

**Special Events** (Limited time)

```javascript
{
  "Flash Challenge": {
    duration: "1 hour",
    requirement: "5 quizzes",
    reward: { xp: 500, badge: "speed_runner" }
  },
  "Weekend Warrior": {
    duration: "weekend",
    requirement: "10 perfect scores",
    reward: { xp: 2000, powerup: "shield_3x" }
  }
}
```

### 7. Daily Bonus System

#### Progression Table

| Day | XP  | Power-Ups | Special       |
| --- | --- | --------- | ------------- |
| 1   | 10  | -         | -             |
| 2   | 20  | -         | -             |
| 3   | 30  | Hint ×1   | -             |
| 5   | 50  | Skip ×1   | Mystery Box   |
| 7   | 70  | XP Boost  | Badge         |
| 14  | 140 | Shield ×1 | Title         |
| 30  | 300 | All ×1    | Diamond Badge |

## 🧠 Dark Pattern Implementations

### 1. Loss Aversion

```typescript
// XP Decay
if (daysSinceActive > 7) {
  dailyDecay = totalXP * 0.01; // 1% per day
  notification = "You're losing progress!";
}

// Streak Warning
if (hoursSinceActive > 20) {
  urgentNotification = 'Only 4 hours to save your streak!';
  visualWarning = 'pulsing_red_indicator';
}
```

### 2. Variable Reward Schedule

```typescript
const REWARD_MULTIPLIERS = [1, 1, 1, 1.5, 2, 3]; // 66% normal, 34% bonus
const MYSTERY_BOX_CHANCE = 0.1; // 10% random rewards

// Implementation
const multiplier = REWARD_MULTIPLIERS[Math.random() * 6];
if (Math.random() < MYSTERY_BOX_CHANCE) {
  triggerMysteryBox();
}
```

### 3. FOMO Mechanics

- **Flash Challenges**: 1-hour limited events
- **Daily Bonus**: 24-hour claim window
- **Special Events**: Weekend-only bonuses
- **Leaderboard Reset**: Weekly competition
- **Expiring Rewards**: Use within 7 days

### 4. Social Proof

```typescript
// Friend Activity Feed
notifications.push({
  "Alex just achieved Quiz Master!",
  "Sarah is now #1 on the leaderboard",
  "5 friends completed today's challenge"
});

// Comparative Stats
showStats({
  yourScore: 85,
  friendAverage: 78,
  globalAverage: 72,
  percentile: "Top 15%"
});
```

### 5. Sunk Cost Fallacy

- Display total time invested
- Show progress toward next achievement
- Highlight near-miss situations
- "Just one more" messaging
- Investment protection warnings

## 📈 Engagement Metrics

### Key Performance Indicators

```typescript
interface EngagementMetrics {
  DAU: number; // Daily Active Users
  WAU: number; // Weekly Active Users
  MAU: number; // Monthly Active Users
  retention: {
    day1: number; // % returning after 1 day
    day7: number; // % returning after 7 days
    day30: number; // % returning after 30 days
  };
  sessionLength: number; // Average minutes per session
  sessionsPerDay: number; // Average sessions per user
  streakAverage: number; // Average streak length
  completionRate: number; // % quizzes completed
  shareRate: number; // % users who share
  powerUpUsage: number; // Power-ups used per session
}
```

### Success Metrics

- **Target D1 Retention**: >40%
- **Target D7 Retention**: >20%
- **Target D30 Retention**: >10%
- **Average Session**: >5 minutes
- **Daily Sessions**: >2
- **Streak Average**: >5 days

## 🎨 Visual & Audio Feedback

### Haptic Feedback Patterns

```typescript
const hapticPatterns = {
  correct: 'light_impact',
  wrong: 'medium_impact',
  levelUp: 'notification_success',
  achievement: 'notification_success',
  combo: 'selection_change',
  powerUp: 'heavy_impact',
};
```

### Animation Triggers

| Event          | Animation          | Duration | Haptic  |
| -------------- | ------------------ | -------- | ------- |
| Correct Answer | Bounce + Glow      | 400ms    | Light   |
| Wrong Answer   | Shake + Red        | 250ms    | Medium  |
| Level Up       | Explosion + Scale  | 1000ms   | Success |
| Achievement    | Particles + Rotate | 1500ms   | Success |
| Combo          | Pulse + Color      | 600ms    | Light   |
| Streak Save    | Fire + Relief      | 800ms    | Heavy   |

## 🔧 Configuration

### Tunable Parameters

```typescript
const GAMIFICATION_CONFIG = {
  // XP System
  baseXP: 100,
  levelExponent: 1.5,
  maxLevel: 100,

  // Streaks
  streakWindow: 24, // hours
  streakWarning: 20, // hours
  streakGracePeriod: 48, // hours

  // Combos
  comboIncrement: 0.5,
  maxCombo: 5.0,
  comboTimeout: 30, // seconds

  // Dark Patterns
  xpDecayDays: 7,
  decayRate: 0.01, // 1% per day
  mysteryBoxChance: 0.1,
  flashChallengeDuration: 60, // minutes

  // Rewards
  dailyBonusWindow: 24, // hours
  powerUpExpiry: 168, // hours (7 days)
  questRefresh: 24, // hours
};
```

## 🚀 Implementation Checklist

### Phase 1: Core Systems ✅

- [x] XP and Leveling
- [x] Basic Achievements
- [x] Streak Tracking
- [x] Combo System

### Phase 2: Engagement ✅

- [x] Power-Ups
- [x] Daily Bonuses
- [x] Quest System
- [x] Leaderboards

### Phase 3: Optimization ✅

- [x] Dark Patterns
- [x] Notifications
- [x] Social Features
- [x] Analytics Integration

### Phase 4: Refinement

- [ ] A/B Testing Variants
- [ ] Personalized Difficulty
- [ ] Machine Learning Optimization
- [ ] Advanced Social Features

## 📱 Usage Examples

### Initialize Gamification

```typescript
import GamificationService from '@/services/gamification';

// On app start
await GamificationService.initialize();
await GamificationService.checkDailyLogin();
await GamificationService.updateStreak();
```

### Award XP

```typescript
// Correct answer
const result = await GamificationService.awardXP(10, 'correct_answer');
if (result.levelUp) {
  showLevelUpAnimation(result.newLevel);
}
```

### Track Progress

```typescript
// Update quest progress
await GamificationService.updateQuestProgress('quiz_complete', 1);

// Check achievements
const achievement = await GamificationService.checkAchievements();
if (achievement) {
  showAchievementPopup(achievement);
}
```

## 🎯 Best Practices

1. **Balance Challenge & Reward**: Keep difficulty curve smooth
2. **Immediate Feedback**: Always acknowledge user actions
3. **Clear Progress**: Show advancement visually
4. **Meaningful Choices**: Make power-ups strategic
5. **Surprise & Delight**: Random rewards create excitement
6. **Social Connection**: Foster friendly competition
7. **Respect User Time**: Don't punish casual players

## 📊 Analytics Events

Track these events for optimization:

- `xp_gained`: Amount, source, multipliers
- `level_up`: New level, time taken
- `achievement_unlocked`: Achievement ID, category
- `streak_maintained`: Current streak, bonus
- `streak_broken`: Lost streak, duration
- `quest_completed`: Quest type, rewards
- `powerup_used`: Type, context
- `daily_bonus_claimed`: Day, rewards
- `leaderboard_viewed`: Type, user rank
- `session_end`: XP gained, duration

---

_Last Updated: December 2024_
_Version: 1.0.0_
