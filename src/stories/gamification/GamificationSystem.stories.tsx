import type { Meta, StoryObj } from '@storybook/react';
import { GamificationDashboard } from './GamificationDashboard';

const meta: Meta<typeof GamificationDashboard> = {
  title: 'Gamification/System Overview',
  component: GamificationDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🎮 Gamification System

Complete gamification engine with XP, achievements, streaks, quests, and rewards.

### Architecture Overview

\`\`\`
User Action
    ↓
GamificationService (Orchestrator)
    ├── XPCalculator
    │   ├── Base XP (10)
    │   ├── Difficulty multiplier (0.8x - 2.0x)
    │   ├── Streak bonus (1.1x - 3.0x)
    │   ├── Variable rewards (1x - 5x)
    │   └── Event multipliers (2x for FOMO)
    │
    ├── AchievementEngine
    │   ├── 9 achievement types
    │   ├── Conditional checking
    │   └── XP rewards (50 - 2000)
    │
    ├── StreakTracker
    │   ├── Daily tracking
    │   ├── Milestone rewards
    │   └── Loss aversion warnings
    │
    ├── QuestManager
    │   ├── Daily quest generation
    │   ├── Personalized quests
    │   └── 7 quest types
    │
    └── RewardDistributor
        ├── XP distribution
        ├── Badge awarding
        └── Mystery boxes (10% drop rate)
\`\`\`

### Core Features

#### 🎯 XP & Leveling
- **Base XP**: 10 points per quiz
- **Level Progression**: Tiered system (beginner → expert)
- **Difficulty Multipliers**: Easy (0.8x), Medium (1x), Hard (1.5x), Expert (2x)

#### 🏆 Achievements (9 Types)
1. **First Steps** - Complete first quiz (50 XP)
2. **Perfectionist** - Get perfect score (100 XP)
3. **Speed Demon** - Complete in <30s (200 XP)
4. **Week Warrior** - 7-day streak (150 XP)
5. **Quiz Master** - 100 quizzes (500 XP)
6. **Unstoppable** - 30-day streak (500 XP)
7. **Legendary** - 100-day streak (2000 XP)
8. **Knowledge Seeker** - 1000 quizzes (2000 XP)
9. **First Streak** - 3-day streak (50 XP)

#### 🔥 Streak System
- **Bonuses**: 
  - 3 days: 1.1x multiplier
  - 7 days: 1.5x multiplier
  - 30 days: 2.0x multiplier
  - 100 days: 3.0x multiplier
- **Protection**: Streak freeze (100 coins), Streak repair (500 coins)
- **Warnings**: Alerts at 20, 22, 23 hours

#### 📜 Quest System (7 Types)
1. **Quick Learner** - Complete 3 quizzes (100 XP)
2. **Perfect Day** - Get 1 perfect score (200 XP)
3. **Category Master** - 5 category quizzes (150 XP)
4. **Speed Runner** - 3 fast completions (175 XP)
5. **Expert Challenge** - 2 hard quizzes (300 XP)
6. **React Expert** - 3 React quizzes (250 XP)
7. **TypeScript Expert** - 3 TS quizzes (250 XP)

#### 🎁 Reward System
- **Mystery Boxes**: 10% drop rate after each quiz
- **Variable Rewards**: Slot machine mechanics (1x-5x multiplier)
- **FOMO Events**: Double XP flash challenges
- **Power-ups**: XP boosts, hints, time freeze

### Test Coverage
- **Unit Tests**: 28/33 passing (85%)
- **Integration Tests**: 10/11 passing (91%)
- **Journey Tests**: Complete user flows tested

### Clean Code Implementation
- ✅ No magic numbers
- ✅ Configuration-based design
- ✅ Single responsibility principle
- ✅ Dependency injection ready
- ✅ Type-safe interfaces
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'System Overview',
};

export const XPCalculation: Story = {
  name: 'XP Calculation Details',
  parameters: {
    docs: {
      description: {
        story: `
### XP Calculation Formula

\`\`\`typescript
Total XP = (Base XP + Bonus XP) × Difficulty × Streak × Variable × Event

Where:
- Base XP = 10
- Bonus XP = ScoreBonus + TimeBonus
- ScoreBonus = Math.floor(score / 10)
- TimeBonus = timeSpent < 30 ? 5 : 0
\`\`\`

### Example Calculations

| Score | Time | Difficulty | Streak | Result |
|-------|------|------------|--------|--------|
| 100 | 25s | Hard | 7 days | 45 XP |
| 80 | 40s | Medium | 0 days | 18 XP |
| 60 | 60s | Easy | 3 days | 11 XP |

### Variable Rewards (Slot Machine)
- 40% chance: 1x multiplier
- 20% chance: 1.5x multiplier
- 20% chance: 2x multiplier
- 10% chance: 3x multiplier
- 10% chance: 5x multiplier (JACKPOT!)
        `,
      },
    },
  },
};

export const UserJourneys: Story = {
  name: 'User Journey Flows',
  parameters: {
    docs: {
      description: {
        story: `
### 🚀 New User Onboarding (0-5 minutes)

1. **First Quiz** → 50 XP Welcome Bonus
2. **Achievement Unlock** → "First Steps" badge
3. **Quest Assignment** → 3 daily quests
4. **Streak Start** → Begin tracking

### 📅 Daily Active User Flow

**Morning (6 AM)**
- Streak warning notification
- Daily quest refresh

**Noon (12 PM)**
- Lunch break reminder
- 2x XP power hour

**Evening (6 PM)**
- Friend activity updates
- Leaderboard changes

**Night (9 PM)**
- Final streak warning
- Tomorrow's rewards preview

### ⚔️ Competitive Mode Journey

1. **Challenge Creation**
   - Select opponent
   - Choose category
   - Set XP wager

2. **Battle Phase**
   - Real-time scoring
   - Combo multipliers
   - Power-up usage

3. **Results**
   - XP distribution
   - Leaderboard update
   - Achievement checks
   - Rematch option

### 🎁 Reward Collection Flow

1. **Achievement Unlock** → XP + Badge + Title
2. **Quest Completion** → XP + Power-ups
3. **Mystery Box** → Random rewards (10% chance)
4. **Daily Bonus** → Escalating rewards
5. **Event Participation** → Limited-time rewards
        `,
      },
    },
  },
};

export const DarkPatterns: Story = {
  name: 'Engagement Mechanics',
  parameters: {
    docs: {
      description: {
        story: `
### 💊 Dark Patterns & Engagement Hooks

#### Loss Aversion
- **Streak Warnings**: Alerts at 20, 22, 23 hours
- **Streak Protection**: Purchase freeze/repair items
- **Visual Indicators**: Pulsing red streak flame

#### Variable Reward Schedule
- **Mystery Boxes**: 10% random drop rate
- **Slot Machine XP**: 1x-5x random multipliers
- **Surprise Achievements**: Hidden unlocks

#### FOMO (Fear of Missing Out)
- **Flash Challenges**: 1-hour limited events
- **Weekend Tournaments**: Time-limited competitions
- **Daily Bonuses**: Must claim within 24 hours

#### Social Proof
- **Friend Activity**: "Sarah beat your score!"
- **Achievement Broadcasts**: Share to friends
- **Leaderboard Updates**: Real-time position changes

#### Sunk Cost Fallacy
- **Time Invested**: Show total hours played
- **Progress Loss**: "You'll lose 30-day streak!"
- **Level Regression**: XP decay warnings

### Ethical Considerations
While these mechanics drive engagement, we should:
- Allow opt-out of notifications
- Provide streak vacation mode
- Show time limits for healthy gaming
- Transparent about random odds
        `,
      },
    },
  },
};

export const Implementation: Story = {
  name: 'Technical Implementation',
  parameters: {
    docs: {
      description: {
        story: `
### 🔧 Technical Architecture

#### Service Structure
\`\`\`
src/services/gamification/
├── index.ts                 # Exports
├── GamificationService.ts   # Main orchestrator
├── XPCalculator.ts          # Level progression
├── AchievementEngine.ts     # Achievement logic
├── StreakTracker.ts         # Streak management
├── QuestManager.ts          # Quest generation
└── RewardDistributor.ts     # Reward handling
\`\`\`

#### Clean Code Principles Applied

**Before (Bad)**:
\`\`\`typescript
// Nasty nested if-else
if (streakDays < 3) return 1.0;
if (streakDays < 7) return 1.1;
if (streakDays < 14) return 1.5;
// ... more conditions
\`\`\`

**After (Clean)**:
\`\`\`typescript
// Configuration-based approach
private readonly streakBonuses: StreakBonus[] = [
  { minDays: 100, multiplier: 3.0 },
  { minDays: 30, multiplier: 2.0 },
  { minDays: 7, multiplier: 1.5 },
  { minDays: 3, multiplier: 1.1 },
  { minDays: 0, multiplier: 1.0 }
];

getStreakBonus(days: number): number {
  return this.streakBonuses
    .find(bonus => days >= bonus.minDays)
    ?.multiplier || 1.0;
}
\`\`\`

#### Testing Strategy
- **Unit Tests**: Individual service methods
- **Integration Tests**: Complete user journeys
- **Edge Cases**: Zero scores, broken streaks
- **Performance**: Batch processing, caching

#### Future Enhancements
1. Machine learning for difficulty adjustment
2. Personalized quest generation
3. Real-time multiplayer battles
4. Blockchain achievements (NFTs)
5. Cross-platform progression sync
        `,
      },
    },
  },
};
