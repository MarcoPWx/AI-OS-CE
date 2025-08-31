# QuizMentor Simplified User Journey

> Status: Complete | Last Updated: 2025-08-28 | Author: Docs Team | Version: 1.1
>
> Current Implementation (2025-08-28)
>
> - Supabase backend with Auth in place; email/password and GitHub OAuth supported
> - Mocked flows available for local dev and tests; see Developer Mock Runbook
> - Realtime WS mocks enable deterministic demo scenarios (WS_MOCK_SCENARIO)
>
> Related docs: WEBSOCKET_API.md, mocks/WEBSOCKET_MOCKS.md, runbooks/DEVELOPER_MOCK_RUNBOOK.md

## Core Philosophy: Start Learning in 30 Seconds

No registration. No setup. No barriers. Just immediate value.

## The Frictionless Onboarding

```
0-10 seconds: Land on app
├── See current trending quiz topic
├── One-tap to start
└── First question appears

10-30 seconds: First Win
├── Answer first question
├── See instant feedback
├── Get knowledge insight
└── "You know more than 67% of developers"

30-60 seconds: Hook Set
├── Complete 3-question mini-quiz
├── See knowledge gaps visualization
├── Unlock personalized recommendation
└── Optional: Save progress (no account required)
```

## Progressive Disclosure Model

### Level 0: Anonymous User (Minutes 0-5)

**What They Can Do:**

- Take any quiz immediately
- See instant feedback and explanations
- View community statistics
- Access all question categories
- Share results via link

**What's Hidden:**

- Login/signup (appears after 10 questions)
- Premium features
- Team features
- Historical progress

### Level 1: Soft Signup (Day 1-7)

**Trigger:** After 10 questions or first session end
**Ask:** "Save your progress?" (One-click with device ID)

**Unlocks:**

- Progress persistence across sessions
- Basic streak tracking
- Bookmark questions
- See improvement over time

### Level 2: Engaged User (Day 7-30)

**Trigger:** 7-day streak or 50 questions
**Ask:** "Join the community?" (Email only, no password)

**Unlocks:**

- Leaderboard participation
- Comment on explanations
- Submit quiz questions
- Challenge friends via link
- Daily challenge notifications

### Level 3: Power User (Day 30+)

**Trigger:** 30-day streak or 200 questions
**Ask:** "Unlock pro features?" (Full account)

**Unlocks:**

- Detailed analytics
- Custom learning paths
- Team creation
- Export progress
- Priority support
- Ad-free experience

## Session Types & User States

### 🚀 Quick Hit Session (2-3 minutes)

```javascript
{
  context: "Waiting in line / Bathroom break / Compile time",
  flow: [
    "Open app → Resume last category",
    "3 rapid-fire questions",
    "Quick score → Close"
  ],
  persistence: "Local storage only",
  friction: "Zero"
}
```

### ☕ Coffee Break Session (5-10 minutes)

```javascript
{
  context: "Morning routine / Lunch break",
  flow: [
    "Daily challenge banner",
    "10-question focused set",
    "Review missed answers",
    "See daily rank"
  ],
  persistence: "Device ID sync",
  friction: "Minimal (optional daily reminder)"
}
```

### 📚 Deep Dive Session (15-30 minutes)

```javascript
{
  context: "Evening study / Weekend learning",
  flow: [
    "Choose learning path",
    "Adaptive difficulty questions",
    "Detailed explanations",
    "Related concept links",
    "Progress milestone celebration"
  ],
  persistence: "Full account benefits",
  friction: "Account recommended (not required)"
}
```

## Data Persistence Strategy

### Local-First Architecture

```
localStorage: {
  currentStreak: 5,
  totalQuestions: 127,
  correctAnswers: 89,
  categories: {
    javascript: { attempted: 45, correct: 35 },
    react: { attempted: 32, correct: 28 }
  },
  bookmarks: [questionIds],
  preferences: {
    difficulty: "medium",
    dailyReminder: "09:00",
    soundEnabled: true
  }
}
```

### Progressive Sync

1. **Anonymous**: Local storage only
2. **Device ID**: Sync to server, no PII
3. **Email**: Link multiple devices
4. **Full Account**: Complete data portability

## Engagement Without Authentication

### Social Proof Without Accounts

- "87% of developers got this wrong"
- "Trending in San Francisco"
- "Most missed question today"
- "Your score vs. Global average"

### Viral Mechanics

- Share quiz result cards (no login)
- Challenge links (temporary sessions)
- Team codes (no account needed to join)
- Public leaderboards (anonymous entries)

### Retention Without Login

- Local streak tracking
- Smart notifications (if permitted)
- Bookmark sync via device ID
- Progress URLs (shareable state)

## The "Aha" Moments

### Moment 1: Immediate Competence (30 seconds)

"I actually know this stuff"

### Moment 2: Knowledge Gap Discovery (2 minutes)

"Oh, I should review React hooks"

### Moment 3: Social Validation (5 minutes)

"I'm better than 70% at JavaScript"

### Moment 4: Progress Visibility (Day 3)

"I'm actually getting better"

### Moment 5: Habit Formation (Day 7)

"This is part of my routine now"

## Conversion Triggers (No Pressure)

### Soft Nudges (Not Walls)

```
After 10 questions:
"Nice streak! Save your progress?" [Maybe Later] [Save]

After 3-day streak:
"You're on fire! 🔥 Get daily reminders?" [No Thanks] [Yes Please]

After beating friend's score:
"Challenge more friends?" [Solo Mode] [Invite Friends]

After 50 questions:
"You've learned a lot! See detailed insights?" [Basic Stats] [Full Analytics]
```

## Privacy-First Trust Building

### What We Don't Do:

- ❌ Force registration to start
- ❌ Hold progress hostage
- ❌ Require social login
- ❌ Ask for unnecessary permissions
- ❌ Sell or share user data

### What We Do:

- ✅ Work offline-first
- ✅ Explain why we need each permission
- ✅ Allow anonymous usage indefinitely
- ✅ Provide data export anytime
- ✅ Delete everything on request

## Implementation Priorities

### Week 1: Core Loop

1. Landing → First Question (< 3 seconds)
2. Question → Answer → Feedback loop
3. Local storage for progress
4. Share result cards

### Week 2: Retention Layer

1. Streak tracking (local)
2. Daily challenge
3. Category progress
4. Smart notifications

### Week 3: Social Layer

1. Anonymous leaderboards
2. Challenge links
3. Community stats
4. Question voting

### Week 4: Monetization Layer

1. Premium question banks
2. Ad-free option
3. Team features
4. Analytics dashboard

## Success Metrics (No Auth Required)

### Engagement KPIs:

- Time to first question answered: < 10 seconds
- Questions per session: 5-8
- Sessions per day: 2.3
- 7-day retention: 40% (anonymous)
- Share rate: 15% of sessions

### Conversion Metrics:

- Anonymous → Device ID: 30%
- Device ID → Email: 20%
- Email → Premium: 15%
- Free → Team adoption: 10%

## The Magic: It Just Works

The app should feel like:

- Opening a book to any page and starting to read
- Playing Wordle - no account, just play
- Using a calculator - instant utility
- Checking the weather - frictionless value

Not like:

- Creating another account
- Downloading a 100MB app
- Watching intro videos
- Configuring preferences
- Joining a platform

---

_"The best time to learn is right now. No barriers. No excuses. Just start."_
