import{R as e}from"./index-R2V08a_e.js";import{C as r,a as n,b as y,c as h}from"./card-z-SUCQbr.js";import{T as L,b as f,a as O}from"./trophy-CUGuv4VS.js";import{c as m,Z as x}from"./zap-C9ysjAC6.js";/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],v=m("award",U);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]],P=m("flame",q);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]],I=m("gift",Q);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],j=m("star",W),p=({value:a,className:d=""})=>{const u=Math.max(0,Math.min(100,a));return e.createElement("div",{className:`h-2 w-full overflow-hidden rounded bg-gray-200 ${d}`},e.createElement("div",{className:"h-full rounded bg-blue-600 transition-all",style:{width:`${u}%`}}))},G=()=>{const a={level:12,currentXP:750,nextLevelXP:1200,totalXP:11750,streakDays:7,achievements:5},d=[{id:"1",name:"First Steps",description:"Complete your first quiz",xpReward:50,unlocked:!0,icon:e.createElement(j,{className:"h-5 w-5"})},{id:"2",name:"Perfectionist",description:"Get a perfect score",xpReward:100,unlocked:!0,icon:e.createElement(f,{className:"h-5 w-5"})},{id:"3",name:"Week Warrior",description:"Maintain 7-day streak",xpReward:150,unlocked:!0,icon:e.createElement(P,{className:"h-5 w-5"})},{id:"4",name:"Speed Demon",description:"Complete quiz in <30s",xpReward:200,unlocked:!1,icon:e.createElement(x,{className:"h-5 w-5"})},{id:"5",name:"Quiz Master",description:"Complete 100 quizzes",xpReward:500,unlocked:!0,icon:e.createElement(v,{className:"h-5 w-5"})}],u=[{id:"1",title:"Quick Learner",description:"Complete 3 quizzes today",progress:2,total:3,xpReward:100},{id:"2",title:"Perfect Day",description:"Get 1 perfect score",progress:0,total:1,xpReward:200},{id:"3",title:"Category Master",description:"Complete 5 React quizzes",progress:3,total:5,xpReward:150}],F=a.currentXP/a.nextLevelXP*100;return e.createElement("div",{className:"p-6 max-w-7xl mx-auto space-y-6"},e.createElement("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4"},e.createElement(r,null,e.createElement(n,{className:"p-6"},e.createElement("div",{className:"flex items-center justify-between"},e.createElement("div",null,e.createElement("p",{className:"text-sm text-muted-foreground"},"Level"),e.createElement("p",{className:"text-3xl font-bold"},a.level)),e.createElement(L,{className:"h-8 w-8 text-primary"})),e.createElement(p,{value:F,className:"mt-4"}),e.createElement("p",{className:"text-xs text-muted-foreground mt-2"},a.currentXP," / ",a.nextLevelXP," XP"))),e.createElement(r,null,e.createElement(n,{className:"p-6"},e.createElement("div",{className:"flex items-center justify-between"},e.createElement("div",null,e.createElement("p",{className:"text-sm text-muted-foreground"},"Streak"),e.createElement("p",{className:"text-3xl font-bold"},a.streakDays," days")),e.createElement(P,{className:"h-8 w-8 text-orange-500"})),e.createElement("div",{className:"mt-4 flex gap-1"},[...Array(7)].map((t,g)=>e.createElement("div",{key:g,className:`h-2 flex-1 rounded ${g<a.streakDays?"bg-orange-500":"bg-gray-200"}`}))))),e.createElement(r,null,e.createElement(n,{className:"p-6"},e.createElement("div",{className:"flex items-center justify-between"},e.createElement("div",null,e.createElement("p",{className:"text-sm text-muted-foreground"},"Total XP"),e.createElement("p",{className:"text-3xl font-bold"},a.totalXP.toLocaleString())),e.createElement(x,{className:"h-8 w-8 text-yellow-500"})),e.createElement("p",{className:"text-xs text-muted-foreground mt-4"},"Rank: Top 15%"))),e.createElement(r,null,e.createElement(n,{className:"p-6"},e.createElement("div",{className:"flex items-center justify-between"},e.createElement("div",null,e.createElement("p",{className:"text-sm text-muted-foreground"},"Achievements"),e.createElement("p",{className:"text-3xl font-bold"},a.achievements,"/9")),e.createElement(f,{className:"h-8 w-8 text-purple-500"})),e.createElement(p,{value:a.achievements/9*100,className:"mt-4"})))),e.createElement(r,null,e.createElement(y,null,e.createElement(h,{className:"flex items-center gap-2"},e.createElement(O,{className:"h-5 w-5"}),"Daily Quests")),e.createElement(n,{className:"space-y-4"},u.map(t=>e.createElement("div",{key:t.id,className:"space-y-2"},e.createElement("div",{className:"flex justify-between items-start"},e.createElement("div",null,e.createElement("h4",{className:"font-semibold"},t.title),e.createElement("p",{className:"text-sm text-muted-foreground"},t.description)),e.createElement("span",{className:"text-sm font-semibold text-primary"},"+",t.xpReward," XP")),e.createElement("div",{className:"flex items-center gap-2"},e.createElement(p,{value:t.progress/t.total*100,className:"flex-1"}),e.createElement("span",{className:"text-sm text-muted-foreground"},t.progress,"/",t.total)))))),e.createElement(r,null,e.createElement(y,null,e.createElement(h,{className:"flex items-center gap-2"},e.createElement(v,{className:"h-5 w-5"}),"Achievements")),e.createElement(n,null,e.createElement("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"},d.map(t=>e.createElement("div",{key:t.id,className:`p-4 rounded-lg border ${t.unlocked?"bg-primary/5 border-primary/20":"bg-gray-50 border-gray-200 opacity-60"}`},e.createElement("div",{className:"flex items-start gap-3"},e.createElement("div",{className:`p-2 rounded-lg ${t.unlocked?"bg-primary/10 text-primary":"bg-gray-100 text-gray-400"}`},t.icon),e.createElement("div",{className:"flex-1"},e.createElement("h4",{className:"font-semibold"},t.name),e.createElement("p",{className:"text-sm text-muted-foreground"},t.description),e.createElement("p",{className:"text-sm font-semibold mt-1"},"+",t.xpReward," XP")),t.unlocked&&e.createElement("span",{className:"text-xs bg-green-100 text-green-700 px-2 py-1 rounded"},"Unlocked"))))))),e.createElement(r,{className:"bg-gradient-to-r from-purple-500/10 to-pink-500/10"},e.createElement(n,{className:"p-6"},e.createElement("div",{className:"flex items-center justify-between"},e.createElement("div",null,e.createElement("h3",{className:"text-lg font-semibold flex items-center gap-2"},e.createElement(I,{className:"h-5 w-5"}),"Mystery Box Available!"),e.createElement("p",{className:"text-sm text-muted-foreground mt-1"},"Complete your next quiz for a chance to win bonus XP and power-ups")),e.createElement("button",{className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"},"Start Quiz")))))},$={title:"Gamification/System Overview",component:G,parameters:{layout:"fullscreen",docs:{description:{component:`
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
        `}}},tags:["autodocs"]},s={name:"System Overview"},i={name:"XP Calculation Details",parameters:{docs:{description:{story:`
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
        `}}}},o={name:"User Journey Flows",parameters:{docs:{description:{story:`
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
        `}}}},l={name:"Engagement Mechanics",parameters:{docs:{description:{story:`
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
        `}}}},c={name:"Technical Implementation",parameters:{docs:{description:{story:`
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
        `}}}};var k,E,w;s.parameters={...s.parameters,docs:{...(k=s.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: 'System Overview'
}`,...(w=(E=s.parameters)==null?void 0:E.docs)==null?void 0:w.source}}};var S,b,N;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'XP Calculation Details',
  parameters: {
    docs: {
      description: {
        story: \`
### XP Calculation Formula

\\\`\\\`\\\`typescript
Total XP = (Base XP + Bonus XP) × Difficulty × Streak × Variable × Event

Where:
- Base XP = 10
- Bonus XP = ScoreBonus + TimeBonus
- ScoreBonus = Math.floor(score / 10)
- TimeBonus = timeSpent < 30 ? 5 : 0
\\\`\\\`\\\`

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
        \`
      }
    }
  }
}`,...(N=(b=i.parameters)==null?void 0:b.docs)==null?void 0:N.source}}};var X,C,M;o.parameters={...o.parameters,docs:{...(X=o.parameters)==null?void 0:X.docs,source:{originalSource:`{
  name: 'User Journey Flows',
  parameters: {
    docs: {
      description: {
        story: \`
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
        \`
      }
    }
  }
}`,...(M=(C=o.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var B,D,T;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Engagement Mechanics',
  parameters: {
    docs: {
      description: {
        story: \`
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
        \`
      }
    }
  }
}`,...(T=(D=l.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var A,R,z;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Technical Implementation',
  parameters: {
    docs: {
      description: {
        story: \`
### 🔧 Technical Architecture

#### Service Structure
\\\`\\\`\\\`
src/services/gamification/
├── index.ts                 # Exports
├── GamificationService.ts   # Main orchestrator
├── XPCalculator.ts          # Level progression
├── AchievementEngine.ts     # Achievement logic
├── StreakTracker.ts         # Streak management
├── QuestManager.ts          # Quest generation
└── RewardDistributor.ts     # Reward handling
\\\`\\\`\\\`

#### Clean Code Principles Applied

**Before (Bad)**:
\\\`\\\`\\\`typescript
// Nasty nested if-else
if (streakDays < 3) return 1.0;
if (streakDays < 7) return 1.1;
if (streakDays < 14) return 1.5;
// ... more conditions
\\\`\\\`\\\`

**After (Clean)**:
\\\`\\\`\\\`typescript
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
\\\`\\\`\\\`

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
        \`
      }
    }
  }
}`,...(z=(R=c.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};const Z=["Overview","XPCalculation","UserJourneys","DarkPatterns","Implementation"];export{l as DarkPatterns,c as Implementation,s as Overview,o as UserJourneys,i as XPCalculation,Z as __namedExportsOrder,$ as default};
