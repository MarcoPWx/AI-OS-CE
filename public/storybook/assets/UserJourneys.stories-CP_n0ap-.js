import{U as y}from"./UserJourneyMap-DNHJgX7E.js";import"./index-R2V08a_e.js";const v={title:"User Journeys/Complete Flows",component:y,parameters:{layout:"fullscreen",docs:{description:{component:`
## 🚀 Complete User Journey Documentation

Comprehensive user flows from first visit to power user, designed for E2E test automation and product understanding.

### Journey Overview

\`\`\`
New Visitor → Registration → Onboarding → Active User → Power User → Champion
     ↓            ↓            ↓            ↓            ↓           ↓
   Browse      Verify      First Quiz   Daily Play   Compete    Advocate
   Content      Email       Tutorial     Streaks     Leagues     Referrals
\`\`\`

### User Personas

#### 🆕 New User (0-7 days)
- **Goals**: Understand platform, complete first quiz, see value
- **Concerns**: Time commitment, difficulty, cost
- **Success Metrics**: Registration rate, first quiz completion, day 1 retention

#### 📅 Regular User (7-30 days)
- **Goals**: Build habits, improve skills, track progress
- **Concerns**: Maintaining streaks, finding relevant content
- **Success Metrics**: 7-day retention, streak length, quizzes per week

#### 🏆 Power User (30+ days)
- **Goals**: Master content, compete, achieve status
- **Concerns**: New challenges, recognition, rewards
- **Success Metrics**: 30-day retention, achievements unlocked, referrals

#### 👑 Champion (100+ days)
- **Goals**: Community leadership, content creation, mentoring
- **Concerns**: Platform evolution, exclusive benefits
- **Success Metrics**: Content contributions, community engagement, lifetime value
        `}}},tags:["autodocs"]},e={name:"1. New User Onboarding Journey",parameters:{docs:{description:{story:`
### 🎯 New User Onboarding (0-10 minutes)

#### Stage 1: Landing Page Arrival (0-30 seconds)
\`\`\`typescript
interface LandingPageEvents {
  pageView: {
    source: 'organic' | 'paid' | 'social' | 'referral';
    campaign?: string;
    device: 'mobile' | 'tablet' | 'desktop';
  };
  
  heroInteraction: {
    element: 'video' | 'cta' | 'testimonial';
    action: 'play' | 'click' | 'scroll';
    timeOnPage: number;
  };
  
  exitIntent?: {
    timeOnPage: number;
    scrollDepth: number;
    lastElement: string;
  };
}

// Decision Points
if (user.showsExitIntent) {
  trigger('EXIT_INTENT_POPUP', {
    offer: '50% discount',
    urgency: 'Limited time'
  });
}
\`\`\`

#### Stage 2: Registration Flow (30s - 2 minutes)
\`\`\`typescript
interface RegistrationFlow {
  method: 'email' | 'google' | 'facebook' | 'apple';
  
  // Email registration
  emailFlow?: {
    emailEntered: string;
    passwordStrength: 'weak' | 'medium' | 'strong';
    tosAccepted: boolean;
    marketingOptIn: boolean;
  };
  
  // Social registration
  socialFlow?: {
    provider: string;
    permissions: string[];
    profileData: {
      name?: string;
      email?: string;
      avatar?: string;
    };
  };
  
  // Validation errors
  errors?: {
    field: string;
    message: string;
    attemptNumber: number;
  }[];
}

// A/B Test Variations
const registrationVariants = {
  A: 'traditional_form',
  B: 'progressive_disclosure',
  C: 'social_first'
};
\`\`\`

#### Stage 3: Email Verification (2-5 minutes)
\`\`\`typescript
interface EmailVerification {
  emailSent: {
    timestamp: Date;
    provider: 'sendgrid' | 'ses' | 'mailgun';
  };
  
  userActions: {
    resendRequested?: number;
    emailClientOpened?: boolean;
    linkClicked?: boolean;
    verificationCompleted?: boolean;
  };
  
  // Fallback for unverified users
  reminderSchedule: [
    { after: '1 hour', type: 'in-app' },
    { after: '24 hours', type: 'email' },
    { after: '3 days', type: 'email' },
    { after: '7 days', type: 'final' }
  ];
}
\`\`\`

#### Stage 4: Profile Setup (1-2 minutes)
\`\`\`typescript
interface ProfileSetup {
  step1_BasicInfo: {
    firstName?: string;
    lastName?: string;
    username: string;
    avatar?: 'default' | 'uploaded' | 'generated';
    skipped: boolean;
  };
  
  step2_Preferences: {
    categories: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    goals: ('learn' | 'compete' | 'fun' | 'career')[];
    studyTime: number; // minutes per day
    skipped: boolean;
  };
  
  step3_Personalization: {
    notifications: {
      dailyReminder: boolean;
      streakWarning: boolean;
      achievements: boolean;
      friendActivity: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

// Completion tracking
const onboardingMetrics = {
  startTime: Date;
  endTime: Date;
  stepsCompleted: number;
  stepsSkipped: number;
  dropoffPoint?: string;
};
\`\`\`

#### Stage 5: First Quiz Tutorial (3-5 minutes)
\`\`\`typescript
interface FirstQuizTutorial {
  tutorialStart: {
    autoStarted: boolean;
    userInitiated: boolean;
  };
  
  steps: [
    {
      step: 'welcome',
      message: 'Let\\'s take your first quiz!',
      action: 'next',
      duration: number;
    },
    {
      step: 'question_explanation',
      message: 'Read the question carefully',
      highlighted: ['question_text', 'timer'],
      action: 'understood',
      duration: number;
    },
    {
      step: 'answer_selection',
      message: 'Click to select your answer',
      highlighted: ['answer_options'],
      action: 'answer_selected',
      duration: number;
    },
    {
      step: 'feedback',
      message: 'Great! You earned 10 XP',
      showReward: true,
      action: 'continue',
      duration: number;
    },
    {
      step: 'completion',
      message: 'You\\'re ready to explore!',
      unlockedFeatures: ['daily_quiz', 'leaderboard', 'achievements'],
      action: 'finish_tutorial'
    }
  ];
  
  // Tutorial quiz (simplified)
  quiz: {
    questions: 3;
    difficulty: 'easy';
    category: 'general';
    hintsEnabled: true;
    skipEnabled: false;
    score: number;
    xpEarned: 50; // Bonus for first quiz
  };
}
\`\`\`

#### Stage 6: Welcome Rewards & Next Steps (30 seconds)
\`\`\`typescript
interface WelcomeRewards {
  immediateRewards: {
    xp: 100;
    coins: 50;
    powerUps: ['hint', 'skip', '50-50'];
    achievement: 'first_steps';
  };
  
  questsAssigned: [
    {
      id: 'daily_player',
      title: 'Complete 3 quizzes today',
      reward: { xp: 100, coins: 20 }
    },
    {
      id: 'perfect_score',
      title: 'Get a perfect score',
      reward: { xp: 200, achievement: 'perfectionist' }
    },
    {
      id: 'explore_categories',
      title: 'Try 3 different categories',
      reward: { xp: 150, powerUp: 'double_xp' }
    }
  ];
  
  // Personalized recommendations
  recommendations: {
    quizzes: Quiz[];
    friends?: User[];
    groups?: Group[];
  };
  
  // CTAs presented
  nextActions: {
    primary: 'start_daily_quiz';
    secondary: 'explore_categories';
    tertiary: 'invite_friends';
  };
}
\`\`\`

#### Success Metrics & Tracking
\`\`\`typescript
interface OnboardingAnalytics {
  // Funnel metrics
  funnel: {
    landing_view: number;
    registration_start: number;
    registration_complete: number;
    email_verified: number;
    profile_created: number;
    tutorial_started: number;
    tutorial_completed: number;
    first_quiz_completed: number;
  };
  
  // Time metrics
  duration: {
    total: number;
    byStep: Record<string, number>;
  };
  
  // Engagement metrics
  engagement: {
    elementsClicked: string[];
    videosWatched: number;
    tooltipsRead: number;
    helpAccessed: boolean;
  };
  
  // Conversion points
  conversions: {
    registrationRate: number;
    verificationRate: number;
    tutorialCompletionRate: number;
    day1Retention: number;
    day7Retention: number;
  };
}
\`\`\`

#### E2E Test Scenarios
\`\`\`typescript
describe('New User Onboarding E2E', () => {
  test('Happy path - Email registration', async () => {
    await visitLandingPage();
    await clickSignUp();
    await fillRegistrationForm({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });
    await submitRegistration();
    await verifyEmailSent();
    await clickVerificationLink();
    await completeProfile();
    await completeTutorial();
    await verifyWelcomeRewards();
    expect(user.status).toBe('onboarded');
  });
  
  test('Social registration flow', async () => {
    await visitLandingPage();
    await clickSignUpWithGoogle();
    await authorizeGoogleAccount();
    await completeMinimalProfile();
    await skipTutorial();
    expect(user.status).toBe('onboarded');
  });
  
  test('Recovery from abandonment', async () => {
    await simulateAbandonmentAtProfile();
    await waitForReminderEmail();
    await clickReturnLink();
    await verifyProgressRestored();
    await completeOnboarding();
  });
});
\`\`\`
        `}}}},n={name:"2. Daily Active User Journey",parameters:{docs:{description:{story:`
### 📅 Daily Active User Flow (Day 7-30)

#### Morning Routine (6 AM - 9 AM)
\`\`\`typescript
interface MorningEngagement {
  // Push notification
  notification: {
    type: 'streak_reminder';
    title: 'Keep your 7-day streak alive!';
    body: 'Complete today\\'s quiz to earn 2x XP';
    delivered: Date;
    opened?: Date;
    action?: 'opened_app' | 'dismissed' | 'disabled';
  };
  
  // App opening
  appOpen: {
    source: 'notification' | 'direct' | 'widget';
    time: Date;
    previousSession: Date;
    sessionGap: number; // hours
  };
  
  // Home screen
  homeScreen: {
    streakBanner: {
      currentStreak: number;
      hoursRemaining: number;
      bonusMultiplier: number;
    };
    dailyQuests: Quest[];
    friendActivity: Activity[];
    recommendations: Quiz[];
  };
}

// Streak psychology
if (user.streakDays >= 7) {
  showUrgentReminder('Don\\'t lose your streak!');
  offerStreakFreeze(100); // coins
}
\`\`\`

#### Daily Quiz Selection (2-5 minutes)
\`\`\`typescript
interface QuizSelection {
  browsingBehavior: {
    categoriesViewed: string[];
    quizzesPreviewd: number;
    filtersApplied: {
      difficulty?: string;
      category?: string;
      duration?: string;
      popularity?: string;
    };
    sortOrder: 'recommended' | 'newest' | 'popular' | 'difficulty';
  };
  
  selectionCriteria: {
    matchesQuest: boolean;
    matchesSkillLevel: boolean;
    friendsCompleted: number;
    estimatedXP: number;
    estimatedTime: number;
  };
  
  finalSelection: {
    quizId: string;
    reason: 'quest' | 'recommended' | 'trending' | 'friend' | 'random';
    expectedDifficulty: number;
    powerUpsEquipped: string[];
  };
}

// Personalization engine
const recommendQuiz = (user: User) => {
  const factors = {
    pastPerformance: analyzePastQuizzes(user),
    timeAvailable: estimateAvailableTime(user),
    questRequirements: getActiveQuests(user),
    socialInfluence: getFriendActivity(user),
    learningCurve: calculateOptimalDifficulty(user)
  };
  
  return selectOptimalQuiz(factors);
};
\`\`\`

#### Quiz Gameplay Loop (5-10 minutes)
\`\`\`typescript
interface QuizGameplay {
  session: {
    id: string;
    startTime: Date;
    device: DeviceInfo;
    connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  
  questions: Array<{
    id: string;
    displayTime: Date;
    
    // User interaction
    interaction: {
      firstClick?: Date;
      hoverSequence: string[];
      finalAnswer?: string;
      confidence?: number;
      timeSpent: number;
    };
    
    // Help usage
    helpUsed?: {
      type: 'hint' | '50-50' | 'skip';
      timing: 'immediate' | 'after_thought' | 'last_second';
    };
    
    // Result
    result: {
      correct: boolean;
      feedback: 'instant' | 'delayed';
      xpEarned: number;
      bonuses: string[];
    };
  }>;
  
  // Mid-quiz events
  interruptions?: Array<{
    type: 'phone_call' | 'app_switch' | 'notification';
    timestamp: Date;
    duration: number;
    resumed: boolean;
  }>;
  
  // Completion
  completion: {
    endTime: Date;
    score: number;
    perfectScore: boolean;
    questsProgress: QuestProgress[];
    rankChange?: number;
  };
}

// Adaptive difficulty
const adjustDifficulty = (performance: number[]) => {
  const recentAccuracy = performance.slice(-5).average();
  if (recentAccuracy > 0.9) return 'increase';
  if (recentAccuracy < 0.5) return 'decrease';
  return 'maintain';
};
\`\`\`

#### Post-Quiz Engagement (2-3 minutes)
\`\`\`typescript
interface PostQuizFlow {
  // Results screen
  resultsView: {
    scoreAnimation: boolean;
    xpAnimation: boolean;
    comparisonShown: 'global' | 'friends' | 'personal_best';
    
    // User actions
    actions: Array<{
      type: 'share' | 'replay' | 'review_answers' | 'next_quiz';
      timestamp: Date;
    }>;
  };
  
  // Rewards & achievements
  rewards: {
    immediateXP: number;
    bonusXP?: {
      streak: number;
      perfect: number;
      speed: number;
      difficulty: number;
    };
    
    achievements?: Array<{
      id: string;
      name: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      xpReward: number;
      unlockAnimation: boolean;
    }>;
    
    mysteryBox?: {
      earned: boolean;
      opened: boolean;
      contents: Reward[];
    };
  };
  
  // Social sharing
  sharing?: {
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram';
    content: {
      score: boolean;
      streak: boolean;
      achievement: boolean;
      challenge: boolean;
    };
    friendsChallenged: string[];
  };
  
  // Next action
  nextAction: {
    selected: 'another_quiz' | 'browse' | 'leaderboard' | 'exit';
    timeToDecision: number;
    influencedBy?: 'quest' | 'notification' | 'friend_activity';
  };
}
\`\`\`

#### Social Interactions (Throughout Day)
\`\`\`typescript
interface SocialEngagement {
  // Friend activity feed
  friendFeed: {
    viewed: Date[];
    interactions: Array<{
      friendId: string;
      action: 'like' | 'comment' | 'challenge';
      content?: string;
      timestamp: Date;
    }>;
  };
  
  // Challenges
  challenges: {
    received: Array<{
      from: string;
      quizId: string;
      targetScore: number;
      accepted: boolean;
      completed?: boolean;
      result?: 'won' | 'lost' | 'tied';
    }>;
    
    sent: Array<{
      to: string[];
      quizId: string;
      yourScore: number;
      responses: number;
    }>;
  };
  
  // Leaderboard
  leaderboard: {
    checksPerDay: number;
    timeSpent: number;
    boards: ('daily' | 'weekly' | 'friends' | 'global')[];
    rankChanges: {
      board: string;
      oldRank: number;
      newRank: number;
      timestamp: Date;
    }[];
  };
  
  // Groups/Teams
  teamActivity?: {
    teamId: string;
    contribution: number;
    teamRank: number;
    teamChat: Message[];
  };
}
\`\`\`

#### Evening Wind-down (8 PM - 11 PM)
\`\`\`typescript
interface EveningSession {
  // Streak protection
  streakCheck: {
    completed: boolean;
    reminderShown: boolean;
    lastChanceNotification?: Date;
    
    // Panic mode (11 PM+)
    panicMode?: {
      triggered: Date;
      quickQuizOffered: boolean;
      completed: boolean;
    };
  };
  
  // Daily summary
  dailySummary: {
    shown: boolean;
    stats: {
      quizzesCompleted: number;
      xpEarned: number;
      questsCompleted: number;
      rankChange: number;
      accuracyRate: number;
    };
    
    tomorrow: {
      questsAvailable: number;
      specialEvents?: Event[];
      friendBirthday?: string;
    };
  };
  
  // Habit reinforcement
  habitFormation: {
    consistentTime: boolean;
    preferredHour: number;
    sessionsToday: number;
    totalTimeSpent: number;
  };
}

// Retention mechanics
const retentionTriggers = {
  almostLostStreak: 'URGENT_NOTIFICATION',
  friendPassedYou: 'COMPETITIVE_TRIGGER',
  newQuestAvailable: 'CURIOSITY_TRIGGER',
  mysteryBoxReady: 'REWARD_TRIGGER'
};
\`\`\`

#### Daily Metrics & Analytics
\`\`\`typescript
interface DailyUserAnalytics {
  // Engagement metrics
  engagement: {
    sessions: number;
    totalTime: number;
    quizzesCompleted: number;
    questsCompleted: number;
    socialInteractions: number;
  };
  
  // Performance metrics
  performance: {
    averageScore: number;
    improvement: number;
    categoriesPlayed: string[];
    difficultyProgression: number;
  };
  
  // Monetization signals
  monetization: {
    adsViewed: number;
    powerUpsUsed: number;
    shopVisits: number;
    almostPurchased: boolean;
    purchaseBarriers: string[];
  };
  
  // Retention signals
  retention: {
    streakMaintained: boolean;
    friendsEngaged: number;
    questsAccepted: number;
    notificationsEnabled: boolean;
    tomorrowQuest: boolean;
  };
}
\`\`\`
        `}}}},r={name:"3. Competitive Player Journey",parameters:{docs:{description:{story:`
### 🏆 Competitive Player Journey (Power Users)

#### Competition Discovery (Week 2-4)
\`\`\`typescript
interface CompetitionDiscovery {
  // Natural progression
  triggers: {
    consistentHighScores: boolean;
    friendCompetition: boolean;
    leaderboardClimb: boolean;
    achievementHunting: boolean;
  };
  
  // Tournament introduction
  firstTournament: {
    discovered: 'notification' | 'friend' | 'browse' | 'promoted';
    type: 'daily' | 'weekly' | 'special_event';
    entry: 'free' | 'coins' | 'ticket';
    
    hesitation: {
      viewed: number; // times
      almostJoined: boolean;
      concerns: ('difficulty' | 'time' | 'cost' | 'skill')[];
    };
    
    joined: {
      reason: 'FOMO' | 'friend' | 'reward' | 'confidence';
      preparation: {
        practicedCategory: boolean;
        purchasedPowerUps: boolean;
        studiedQuestions: boolean;
      };
    };
  };
}
\`\`\`

#### Tournament Participation
\`\`\`typescript
interface TournamentPlay {
  tournament: {
    id: string;
    format: 'elimination' | 'points' | 'time_attack' | 'survival';
    participants: number;
    duration: number; // hours
    prizePool: Prize[];
  };
  
  // Gameplay phases
  phases: {
    // Phase 1: Qualification
    qualification?: {
      rounds: number;
      scores: number[];
      rank: number;
      qualified: boolean;
      stressLevel: 'low' | 'medium' | 'high';
    };
    
    // Phase 2: Main rounds
    mainRounds: Array<{
      round: number;
      opponents?: string[];
      score: number;
      rank: number;
      powerUpsUsed: string[];
      mistakes: number;
      timeRemaining: number;
      
      psychology: {
        pressure: number; // 1-10
        confidence: number; // 1-10
        tiltFactor: number; // 1-10
      };
    }>;
    
    // Phase 3: Finals
    finals?: {
      reached: boolean;
      finalRank: number;
      prizeWon?: Prize;
      emotionalResponse: 'ecstatic' | 'satisfied' | 'disappointed' | 'frustrated';
    };
  };
  
  // Live features
  liveFeatures: {
    spectators: number;
    chatMessages: number;
    emotesUsed: string[];
    friendsWatching: string[];
    streamIntegration?: {
      platform: 'twitch' | 'youtube';
      viewers: number;
    };
  };
}
\`\`\`

#### League System Progression
\`\`\`typescript
interface LeagueProgression {
  currentLeague: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
    division: 1 | 2 | 3 | 4 | 5;
    points: number;
    wins: number;
    losses: number;
    winStreak: number;
  };
  
  // Weekly league cycle
  weeklyProgress: {
    startRank: number;
    currentRank: number;
    promotion: {
      zone: boolean;
      secured: boolean;
      pointsNeeded: number;
    };
    relegation: {
      zone: boolean;
      danger: boolean;
      pointsBuffer: number;
    };
    
    // Daily play pattern
    playPattern: Array<{
      day: string;
      sessionsPlayed: number;
      pointsEarned: number;
      rankChange: number;
      mood: 'motivated' | 'grinding' | 'tilted' | 'casual';
    }>;
  };
  
  // Season progression
  season: {
    number: number;
    startDate: Date;
    endDate: Date;
    rewards: {
      current: Reward[];
      next: Reward[];
      ultimate: Reward;
    };
    
    milestones: Array<{
      name: string;
      requirement: string;
      progress: number;
      completed: boolean;
      reward: Reward;
    }>;
  };
}

// Matchmaking algorithm
const findOpponent = (player: Player) => {
  const factors = {
    skillRating: player.elo,
    recentForm: calculateForm(player.recent),
    queueTime: Date.now() - player.queueStart,
    regionPing: getRegionalLatency(player.region)
  };
  
  return matchmaking.findBest(factors);
};
\`\`\`

#### Head-to-Head Battles
\`\`\`typescript
interface HeadToHeadBattle {
  // Pre-match
  matchmaking: {
    searchTime: number;
    opponent: {
      id: string;
      rating: number;
      winRate: number;
      badges: string[];
      intimidationFactor: number;
    };
    
    // Pre-game lobby
    lobby: {
      trashTalk: Message[];
      emotesExchanged: string[];
      friendRequest: boolean;
      previousEncounters: number;
      rivalry: boolean;
    };
  };
  
  // Live match
  match: {
    format: 'best_of_3' | 'single' | 'marathon';
    
    rounds: Array<{
      questions: Array<{
        id: string;
        // Both players' answers
        player: {
          answer: string;
          time: number;
          correct: boolean;
        };
        opponent: {
          answer: string;
          time: number;
          correct: boolean;
        };
        
        // Live reactions
        reactions: {
          player?: 'celebrate' | 'frustrate' | 'focus';
          opponent?: 'celebrate' | 'frustrate' | 'focus';
        };
      }>;
      
      score: {
        player: number;
        opponent: number;
      };
      
      momentum: 'player' | 'opponent' | 'neutral';
      comebackPotential: boolean;
    }>;
    
    // Match result
    result: {
      winner: 'player' | 'opponent';
      finalScore: [number, number];
      ratingChange: number;
      rewards: Reward[];
      
      // Post-match
      postMatch: {
        rematchOffered: boolean;
        rematchAccepted?: boolean;
        sportmanship: 'good' | 'bad' | 'none';
        reported: boolean;
        friended: boolean;
      };
    };
  };
  
  // Psychological factors
  psychology: {
    preMatchNerves: number;
    duringMatchStress: number[];
    tiltMoments: Date[];
    comebackMoments: Date[];
    satisfactionLevel: number;
  };
}
\`\`\`

#### Clan/Team Dynamics
\`\`\`typescript
interface TeamDynamics {
  // Team membership
  team: {
    id: string;
    name: string;
    level: number;
    members: number;
    rank: number;
    
    joinedVia: 'invite' | 'application' | 'founded';
    role: 'member' | 'officer' | 'captain' | 'founder';
    contribution: {
      weeklyPoints: number;
      questsCompleted: number;
      tournamentWins: number;
    };
  };
  
  // Team activities
  activities: {
    // Team battles
    teamBattles: Array<{
      vs: string;
      format: '5v5' | '10v10' | 'unlimited';
      personalScore: number;
      teamScore: number;
      mvp: boolean;
      result: 'win' | 'loss';
    }>;
    
    // Team quests
    teamQuests: Array<{
      id: string;
      requirement: string;
      personalContribution: number;
      totalProgress: number;
      completed: boolean;
      reward: Reward;
    }>;
    
    // Team tournaments
    teamTournaments: Array<{
      name: string;
      placement: number;
      personalPerformance: number;
      teamStrategy: string;
      practiced: boolean;
    }>;
  };
  
  // Social dynamics
  social: {
    teamChat: {
      messagesPerDay: number;
      mentionedTimes: number;
      reactionsReceived: number;
      helpGiven: number;
      helpReceived: number;
    };
    
    relationships: Array<{
      memberId: string;
      relationship: 'friendly' | 'neutral' | 'competitive' | 'rival';
      interactions: number;
      battledTogether: number;
    }>;
    
    leadership?: {
      decisions: string[];
      membersSatisfaction: number;
      recruitmentSuccess: number;
      conflictsResolved: number;
    };
  };
}
\`\`\`

#### Competitive Analytics
\`\`\`typescript
interface CompetitiveAnalytics {
  // Performance tracking
  performance: {
    elo: number;
    peakElo: number;
    winRate: number;
    averageScore: number;
    clutchRate: number; // Performance under pressure
    
    byCategory: Record<string, {
      played: number;
      winRate: number;
      averageScore: number;
    }>;
    
    byOpponentStrength: {
      vsStronger: { games: number; winRate: number };
      vsSimilar: { games: number; winRate: number };
      vsWeaker: { games: number; winRate: number };
    };
  };
  
  // Improvement tracking
  improvement: {
    weeklyTrend: 'improving' | 'stable' | 'declining';
    strengthAreas: string[];
    weaknessAreas: string[];
    
    training: {
      practiceGames: number;
      tutorialsWatched: number;
      guidesRead: number;
      coachingSessions?: number;
    };
  };
  
  // Behavioral patterns
  behavior: {
    tiltTendency: number; // 0-1
    comebackAbility: number; // 0-1
    pressureHandling: number; // 0-1
    consistencyScore: number; // 0-1
    
    playSchedule: {
      preferredTimes: number[];
      sessionLength: number;
      breaksToken: boolean;
    };
  };
  
  // Economic behavior
  economy: {
    entryFeesSpent: number;
    prizesWon: number;
    netProfit: number;
    powerUpInvestment: number;
    roi: number;
  };
}
\`\`\`
        `}}}},t={name:"4. Content Creator Journey",parameters:{docs:{description:{story:`
### 🎨 Content Creator & Community Leader Journey

#### Creator Evolution Path
\`\`\`typescript
interface CreatorEvolution {
  // Stage 1: Consumer (Days 1-30)
  consumer: {
    quizzesPlayed: number;
    favoritedQuizzes: string[];
    ratedQuizzes: number;
    reportedIssues: number;
    
    // Early signals
    signals: {
      commentedOnQuizzes: number;
      suggestedImprovements: number;
      sharedQuizzes: number;
      helpedNewbies: number;
    };
  };
  
  // Stage 2: Contributor (Days 30-60)
  contributor: {
    firstContribution: {
      type: 'quiz' | 'question' | 'translation' | 'guide';
      date: Date;
      quality: number;
      communityResponse: {
        views: number;
        likes: number;
        plays: number;
        feedback: Comment[];
      };
    };
    
    motivation: {
      primary: 'recognition' | 'helping' | 'creative' | 'monetary';
      feedback: 'positive' | 'mixed' | 'negative';
      continued: boolean;
    };
  };
  
  // Stage 3: Creator (Days 60+)
  creator: {
    contentType: ('quiz' | 'course' | 'guide' | 'video')[];
    publishingFrequency: number; // per week
    qualityTier: 'amateur' | 'skilled' | 'expert' | 'master';
    
    audience: {
      followers: number;
      avgViews: number;
      engagement: number;
      retention: number;
    };
  };
  
  // Stage 4: Influencer (Days 180+)
  influencer: {
    platform: 'internal' | 'cross-platform';
    reach: number;
    partnerships: string[];
    monetization: boolean;
    brandAmbassador: boolean;
  };
}
\`\`\`

#### Quiz Creation Workflow
\`\`\`typescript
interface QuizCreationProcess {
  // Ideation
  ideation: {
    inspiration: 'trending' | 'requested' | 'original' | 'educational';
    research: {
      timeSpent: number;
      sourcesConsulted: number;
      factsVerified: boolean;
    };
    
    planning: {
      outline: boolean;
      difficultyMap: boolean;
      learningObjectives: string[];
      targetAudience: string;
    };
  };
  
  // Creation process
  creation: {
    sessions: Array<{
      startTime: Date;
      endTime: Date;
      questionsAdded: number;
      questionsEdited: number;
      questionsDeleted: number;
      
      tools: {
        aiAssistance: boolean;
        templateUsed: boolean;
        mediaAdded: boolean;
        collaborators: string[];
      };
    }>;
    
    // Quality control
    quality: {
      spellChecked: boolean;
      factChecked: boolean;
      difficultyBalanced: boolean;
      testPlayed: number; // times
      peerReviewed: boolean;
    };
  };
  
  // Publishing
  publishing: {
    timing: {
      scheduledFor: Date;
      optimalTime: boolean;
      reason: 'peak_hours' | 'event' | 'random';
    };
    
    metadata: {
      title: string;
      description: string;
      tags: string[];
      category: string;
      difficulty: string;
      thumbnail: 'default' | 'custom' | 'generated';
    };
    
    promotion: {
      sharedTo: ('team' | 'friends' | 'social' | 'discord')[];
      announcement: string;
      teaserCreated: boolean;
    };
  };
  
  // Post-publish
  postPublish: {
    monitoring: {
      firstHourViews: number;
      firstDayPlays: number;
      errorReports: number;
      quickFixes: number;
    };
    
    engagement: {
      respondedToComments: number;
      incorporatedFeedback: boolean;
      createdFollowUp: boolean;
      thankedPlayers: boolean;
    };
    
    iteration: {
      version: number;
      updates: Change[];
      improvementNotes: string[];
    };
  };
}

// Content quality scoring
const scoreContent = (quiz: Quiz) => {
  return {
    accuracy: checkFactualAccuracy(quiz),
    difficulty: analyzeDifficultyCurve(quiz),
    engagement: predictEngagement(quiz),
    educational: assessEducationalValue(quiz),
    overall: calculateOverallScore(quiz)
  };
};
\`\`\`

#### Community Building
\`\`\`typescript
interface CommunityBuilding {
  // Following growth
  following: {
    growth: Array<{
      date: Date;
      followers: number;
      source: 'content' | 'social' | 'feature' | 'viral';
    }>;
    
    demographics: {
      skillLevels: Record<string, number>;
      interests: string[];
      activePercentage: number;
      churnRate: number;
    };
    
    engagement: {
      likesPerPost: number;
      commentsPerPost: number;
      sharesPerPost: number;
      directMessages: number;
    };
  };
  
  // Content strategy
  strategy: {
    contentCalendar: Array<{
      date: Date;
      type: string;
      topic: string;
      planned: boolean;
      executed: boolean;
      performance: number;
    }>;
    
    series: Array<{
      name: string;
      episodes: number;
      subscribers: number;
      completionRate: number;
    }>;
    
    collaborations: Array<{
      partner: string;
      type: 'quiz' | 'event' | 'challenge';
      reach: number;
      success: number;
    }>;
  };
  
  // Community management
  management: {
    moderation: {
      messagesReviewed: number;
      actionsToken: number;
      conflictsResolved: number;
      toxicityHandled: number;
    };
    
    events: Array<{
      name: string;
      type: 'tournament' | 'workshop' | 'ama' | 'challenge';
      attendance: number;
      satisfaction: number;
      followUp: boolean;
    }>;
    
    mentorship: {
      newCreatorsHelped: number;
      tutorialsCreated: number;
      questionsAnswered: number;
      successStories: number;
    };
  };
  
  // Influence metrics
  influence: {
    contentViews: number;
    contentShares: number;
    trendsStarted: number;
    featuredTimes: number;
    
    platformImpact: {
      newUsersReferred: number;
      retentionImpact: number;
      engagementLift: number;
      revenueContribution: number;
    };
  };
}
\`\`\`

#### Monetization Journey
\`\`\`typescript
interface CreatorMonetization {
  // Eligibility progression
  eligibility: {
    requirements: {
      followers: { required: 1000, current: number };
      contentQuality: { required: 4.0, current: number };
      violations: { maximum: 2, current: number };
      accountAge: { required: 90, current: number };
    };
    
    applied: Date;
    approved: Date;
    tier: 'affiliate' | 'partner' | 'verified';
  };
  
  // Revenue streams
  revenue: {
    // Direct monetization
    direct: {
      adRevenue: number;
      subscriptions: number;
      tips: number;
      premiumContent: number;
    };
    
    // Indirect monetization
    indirect: {
      sponsorships: Array<{
        brand: string;
        deal: number;
        deliverables: string[];
        completed: boolean;
      }>;
      
      merchandise: {
        designs: number;
        sold: number;
        revenue: number;
      };
      
      courses: {
        created: number;
        enrolled: number;
        revenue: number;
      };
    };
    
    // Platform programs
    programs: {
      creatorFund: number;
      performanceBonus: number;
      referralBonus: number;
      specialEvents: number;
    };
  };
  
  // Business development
  business: {
    brandBuilding: {
      logo: boolean;
      consistentStyle: boolean;
      catchphrase: string;
      uniqueValue: string;
    };
    
    crossPlatform: {
      youtube: { subscribers: number; videos: number };
      twitch: { followers: number; streams: number };
      discord: { members: number; active: number };
      twitter: { followers: number; engagement: number };
    };
    
    analytics: {
      dashboardUsage: number; // hours/week
      metricsTracked: string[];
      decisionsDataDriven: boolean;
      growthRate: number;
    };
  };
}
\`\`\`
        `}}}};var i,a,o;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: '1. New User Onboarding Journey',
  parameters: {
    docs: {
      description: {
        story: \`
### 🎯 New User Onboarding (0-10 minutes)

#### Stage 1: Landing Page Arrival (0-30 seconds)
\\\`\\\`\\\`typescript
interface LandingPageEvents {
  pageView: {
    source: 'organic' | 'paid' | 'social' | 'referral';
    campaign?: string;
    device: 'mobile' | 'tablet' | 'desktop';
  };
  
  heroInteraction: {
    element: 'video' | 'cta' | 'testimonial';
    action: 'play' | 'click' | 'scroll';
    timeOnPage: number;
  };
  
  exitIntent?: {
    timeOnPage: number;
    scrollDepth: number;
    lastElement: string;
  };
}

// Decision Points
if (user.showsExitIntent) {
  trigger('EXIT_INTENT_POPUP', {
    offer: '50% discount',
    urgency: 'Limited time'
  });
}
\\\`\\\`\\\`

#### Stage 2: Registration Flow (30s - 2 minutes)
\\\`\\\`\\\`typescript
interface RegistrationFlow {
  method: 'email' | 'google' | 'facebook' | 'apple';
  
  // Email registration
  emailFlow?: {
    emailEntered: string;
    passwordStrength: 'weak' | 'medium' | 'strong';
    tosAccepted: boolean;
    marketingOptIn: boolean;
  };
  
  // Social registration
  socialFlow?: {
    provider: string;
    permissions: string[];
    profileData: {
      name?: string;
      email?: string;
      avatar?: string;
    };
  };
  
  // Validation errors
  errors?: {
    field: string;
    message: string;
    attemptNumber: number;
  }[];
}

// A/B Test Variations
const registrationVariants = {
  A: 'traditional_form',
  B: 'progressive_disclosure',
  C: 'social_first'
};
\\\`\\\`\\\`

#### Stage 3: Email Verification (2-5 minutes)
\\\`\\\`\\\`typescript
interface EmailVerification {
  emailSent: {
    timestamp: Date;
    provider: 'sendgrid' | 'ses' | 'mailgun';
  };
  
  userActions: {
    resendRequested?: number;
    emailClientOpened?: boolean;
    linkClicked?: boolean;
    verificationCompleted?: boolean;
  };
  
  // Fallback for unverified users
  reminderSchedule: [
    { after: '1 hour', type: 'in-app' },
    { after: '24 hours', type: 'email' },
    { after: '3 days', type: 'email' },
    { after: '7 days', type: 'final' }
  ];
}
\\\`\\\`\\\`

#### Stage 4: Profile Setup (1-2 minutes)
\\\`\\\`\\\`typescript
interface ProfileSetup {
  step1_BasicInfo: {
    firstName?: string;
    lastName?: string;
    username: string;
    avatar?: 'default' | 'uploaded' | 'generated';
    skipped: boolean;
  };
  
  step2_Preferences: {
    categories: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    goals: ('learn' | 'compete' | 'fun' | 'career')[];
    studyTime: number; // minutes per day
    skipped: boolean;
  };
  
  step3_Personalization: {
    notifications: {
      dailyReminder: boolean;
      streakWarning: boolean;
      achievements: boolean;
      friendActivity: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

// Completion tracking
const onboardingMetrics = {
  startTime: Date;
  endTime: Date;
  stepsCompleted: number;
  stepsSkipped: number;
  dropoffPoint?: string;
};
\\\`\\\`\\\`

#### Stage 5: First Quiz Tutorial (3-5 minutes)
\\\`\\\`\\\`typescript
interface FirstQuizTutorial {
  tutorialStart: {
    autoStarted: boolean;
    userInitiated: boolean;
  };
  
  steps: [
    {
      step: 'welcome',
      message: 'Let\\\\'s take your first quiz!',
      action: 'next',
      duration: number;
    },
    {
      step: 'question_explanation',
      message: 'Read the question carefully',
      highlighted: ['question_text', 'timer'],
      action: 'understood',
      duration: number;
    },
    {
      step: 'answer_selection',
      message: 'Click to select your answer',
      highlighted: ['answer_options'],
      action: 'answer_selected',
      duration: number;
    },
    {
      step: 'feedback',
      message: 'Great! You earned 10 XP',
      showReward: true,
      action: 'continue',
      duration: number;
    },
    {
      step: 'completion',
      message: 'You\\\\'re ready to explore!',
      unlockedFeatures: ['daily_quiz', 'leaderboard', 'achievements'],
      action: 'finish_tutorial'
    }
  ];
  
  // Tutorial quiz (simplified)
  quiz: {
    questions: 3;
    difficulty: 'easy';
    category: 'general';
    hintsEnabled: true;
    skipEnabled: false;
    score: number;
    xpEarned: 50; // Bonus for first quiz
  };
}
\\\`\\\`\\\`

#### Stage 6: Welcome Rewards & Next Steps (30 seconds)
\\\`\\\`\\\`typescript
interface WelcomeRewards {
  immediateRewards: {
    xp: 100;
    coins: 50;
    powerUps: ['hint', 'skip', '50-50'];
    achievement: 'first_steps';
  };
  
  questsAssigned: [
    {
      id: 'daily_player',
      title: 'Complete 3 quizzes today',
      reward: { xp: 100, coins: 20 }
    },
    {
      id: 'perfect_score',
      title: 'Get a perfect score',
      reward: { xp: 200, achievement: 'perfectionist' }
    },
    {
      id: 'explore_categories',
      title: 'Try 3 different categories',
      reward: { xp: 150, powerUp: 'double_xp' }
    }
  ];
  
  // Personalized recommendations
  recommendations: {
    quizzes: Quiz[];
    friends?: User[];
    groups?: Group[];
  };
  
  // CTAs presented
  nextActions: {
    primary: 'start_daily_quiz';
    secondary: 'explore_categories';
    tertiary: 'invite_friends';
  };
}
\\\`\\\`\\\`

#### Success Metrics & Tracking
\\\`\\\`\\\`typescript
interface OnboardingAnalytics {
  // Funnel metrics
  funnel: {
    landing_view: number;
    registration_start: number;
    registration_complete: number;
    email_verified: number;
    profile_created: number;
    tutorial_started: number;
    tutorial_completed: number;
    first_quiz_completed: number;
  };
  
  // Time metrics
  duration: {
    total: number;
    byStep: Record<string, number>;
  };
  
  // Engagement metrics
  engagement: {
    elementsClicked: string[];
    videosWatched: number;
    tooltipsRead: number;
    helpAccessed: boolean;
  };
  
  // Conversion points
  conversions: {
    registrationRate: number;
    verificationRate: number;
    tutorialCompletionRate: number;
    day1Retention: number;
    day7Retention: number;
  };
}
\\\`\\\`\\\`

#### E2E Test Scenarios
\\\`\\\`\\\`typescript
describe('New User Onboarding E2E', () => {
  test('Happy path - Email registration', async () => {
    await visitLandingPage();
    await clickSignUp();
    await fillRegistrationForm({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });
    await submitRegistration();
    await verifyEmailSent();
    await clickVerificationLink();
    await completeProfile();
    await completeTutorial();
    await verifyWelcomeRewards();
    expect(user.status).toBe('onboarded');
  });
  
  test('Social registration flow', async () => {
    await visitLandingPage();
    await clickSignUpWithGoogle();
    await authorizeGoogleAccount();
    await completeMinimalProfile();
    await skipTutorial();
    expect(user.status).toBe('onboarded');
  });
  
  test('Recovery from abandonment', async () => {
    await simulateAbandonmentAtProfile();
    await waitForReminderEmail();
    await clickReturnLink();
    await verifyProgressRestored();
    await completeOnboarding();
  });
});
\\\`\\\`\\\`
        \`
      }
    }
  }
}`,...(o=(a=e.parameters)==null?void 0:a.docs)==null?void 0:o.source}}};var s,m,u;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: '2. Daily Active User Journey',
  parameters: {
    docs: {
      description: {
        story: \`
### 📅 Daily Active User Flow (Day 7-30)

#### Morning Routine (6 AM - 9 AM)
\\\`\\\`\\\`typescript
interface MorningEngagement {
  // Push notification
  notification: {
    type: 'streak_reminder';
    title: 'Keep your 7-day streak alive!';
    body: 'Complete today\\\\'s quiz to earn 2x XP';
    delivered: Date;
    opened?: Date;
    action?: 'opened_app' | 'dismissed' | 'disabled';
  };
  
  // App opening
  appOpen: {
    source: 'notification' | 'direct' | 'widget';
    time: Date;
    previousSession: Date;
    sessionGap: number; // hours
  };
  
  // Home screen
  homeScreen: {
    streakBanner: {
      currentStreak: number;
      hoursRemaining: number;
      bonusMultiplier: number;
    };
    dailyQuests: Quest[];
    friendActivity: Activity[];
    recommendations: Quiz[];
  };
}

// Streak psychology
if (user.streakDays >= 7) {
  showUrgentReminder('Don\\\\'t lose your streak!');
  offerStreakFreeze(100); // coins
}
\\\`\\\`\\\`

#### Daily Quiz Selection (2-5 minutes)
\\\`\\\`\\\`typescript
interface QuizSelection {
  browsingBehavior: {
    categoriesViewed: string[];
    quizzesPreviewd: number;
    filtersApplied: {
      difficulty?: string;
      category?: string;
      duration?: string;
      popularity?: string;
    };
    sortOrder: 'recommended' | 'newest' | 'popular' | 'difficulty';
  };
  
  selectionCriteria: {
    matchesQuest: boolean;
    matchesSkillLevel: boolean;
    friendsCompleted: number;
    estimatedXP: number;
    estimatedTime: number;
  };
  
  finalSelection: {
    quizId: string;
    reason: 'quest' | 'recommended' | 'trending' | 'friend' | 'random';
    expectedDifficulty: number;
    powerUpsEquipped: string[];
  };
}

// Personalization engine
const recommendQuiz = (user: User) => {
  const factors = {
    pastPerformance: analyzePastQuizzes(user),
    timeAvailable: estimateAvailableTime(user),
    questRequirements: getActiveQuests(user),
    socialInfluence: getFriendActivity(user),
    learningCurve: calculateOptimalDifficulty(user)
  };
  
  return selectOptimalQuiz(factors);
};
\\\`\\\`\\\`

#### Quiz Gameplay Loop (5-10 minutes)
\\\`\\\`\\\`typescript
interface QuizGameplay {
  session: {
    id: string;
    startTime: Date;
    device: DeviceInfo;
    connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  
  questions: Array<{
    id: string;
    displayTime: Date;
    
    // User interaction
    interaction: {
      firstClick?: Date;
      hoverSequence: string[];
      finalAnswer?: string;
      confidence?: number;
      timeSpent: number;
    };
    
    // Help usage
    helpUsed?: {
      type: 'hint' | '50-50' | 'skip';
      timing: 'immediate' | 'after_thought' | 'last_second';
    };
    
    // Result
    result: {
      correct: boolean;
      feedback: 'instant' | 'delayed';
      xpEarned: number;
      bonuses: string[];
    };
  }>;
  
  // Mid-quiz events
  interruptions?: Array<{
    type: 'phone_call' | 'app_switch' | 'notification';
    timestamp: Date;
    duration: number;
    resumed: boolean;
  }>;
  
  // Completion
  completion: {
    endTime: Date;
    score: number;
    perfectScore: boolean;
    questsProgress: QuestProgress[];
    rankChange?: number;
  };
}

// Adaptive difficulty
const adjustDifficulty = (performance: number[]) => {
  const recentAccuracy = performance.slice(-5).average();
  if (recentAccuracy > 0.9) return 'increase';
  if (recentAccuracy < 0.5) return 'decrease';
  return 'maintain';
};
\\\`\\\`\\\`

#### Post-Quiz Engagement (2-3 minutes)
\\\`\\\`\\\`typescript
interface PostQuizFlow {
  // Results screen
  resultsView: {
    scoreAnimation: boolean;
    xpAnimation: boolean;
    comparisonShown: 'global' | 'friends' | 'personal_best';
    
    // User actions
    actions: Array<{
      type: 'share' | 'replay' | 'review_answers' | 'next_quiz';
      timestamp: Date;
    }>;
  };
  
  // Rewards & achievements
  rewards: {
    immediateXP: number;
    bonusXP?: {
      streak: number;
      perfect: number;
      speed: number;
      difficulty: number;
    };
    
    achievements?: Array<{
      id: string;
      name: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      xpReward: number;
      unlockAnimation: boolean;
    }>;
    
    mysteryBox?: {
      earned: boolean;
      opened: boolean;
      contents: Reward[];
    };
  };
  
  // Social sharing
  sharing?: {
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram';
    content: {
      score: boolean;
      streak: boolean;
      achievement: boolean;
      challenge: boolean;
    };
    friendsChallenged: string[];
  };
  
  // Next action
  nextAction: {
    selected: 'another_quiz' | 'browse' | 'leaderboard' | 'exit';
    timeToDecision: number;
    influencedBy?: 'quest' | 'notification' | 'friend_activity';
  };
}
\\\`\\\`\\\`

#### Social Interactions (Throughout Day)
\\\`\\\`\\\`typescript
interface SocialEngagement {
  // Friend activity feed
  friendFeed: {
    viewed: Date[];
    interactions: Array<{
      friendId: string;
      action: 'like' | 'comment' | 'challenge';
      content?: string;
      timestamp: Date;
    }>;
  };
  
  // Challenges
  challenges: {
    received: Array<{
      from: string;
      quizId: string;
      targetScore: number;
      accepted: boolean;
      completed?: boolean;
      result?: 'won' | 'lost' | 'tied';
    }>;
    
    sent: Array<{
      to: string[];
      quizId: string;
      yourScore: number;
      responses: number;
    }>;
  };
  
  // Leaderboard
  leaderboard: {
    checksPerDay: number;
    timeSpent: number;
    boards: ('daily' | 'weekly' | 'friends' | 'global')[];
    rankChanges: {
      board: string;
      oldRank: number;
      newRank: number;
      timestamp: Date;
    }[];
  };
  
  // Groups/Teams
  teamActivity?: {
    teamId: string;
    contribution: number;
    teamRank: number;
    teamChat: Message[];
  };
}
\\\`\\\`\\\`

#### Evening Wind-down (8 PM - 11 PM)
\\\`\\\`\\\`typescript
interface EveningSession {
  // Streak protection
  streakCheck: {
    completed: boolean;
    reminderShown: boolean;
    lastChanceNotification?: Date;
    
    // Panic mode (11 PM+)
    panicMode?: {
      triggered: Date;
      quickQuizOffered: boolean;
      completed: boolean;
    };
  };
  
  // Daily summary
  dailySummary: {
    shown: boolean;
    stats: {
      quizzesCompleted: number;
      xpEarned: number;
      questsCompleted: number;
      rankChange: number;
      accuracyRate: number;
    };
    
    tomorrow: {
      questsAvailable: number;
      specialEvents?: Event[];
      friendBirthday?: string;
    };
  };
  
  // Habit reinforcement
  habitFormation: {
    consistentTime: boolean;
    preferredHour: number;
    sessionsToday: number;
    totalTimeSpent: number;
  };
}

// Retention mechanics
const retentionTriggers = {
  almostLostStreak: 'URGENT_NOTIFICATION',
  friendPassedYou: 'COMPETITIVE_TRIGGER',
  newQuestAvailable: 'CURIOSITY_TRIGGER',
  mysteryBoxReady: 'REWARD_TRIGGER'
};
\\\`\\\`\\\`

#### Daily Metrics & Analytics
\\\`\\\`\\\`typescript
interface DailyUserAnalytics {
  // Engagement metrics
  engagement: {
    sessions: number;
    totalTime: number;
    quizzesCompleted: number;
    questsCompleted: number;
    socialInteractions: number;
  };
  
  // Performance metrics
  performance: {
    averageScore: number;
    improvement: number;
    categoriesPlayed: string[];
    difficultyProgression: number;
  };
  
  // Monetization signals
  monetization: {
    adsViewed: number;
    powerUpsUsed: number;
    shopVisits: number;
    almostPurchased: boolean;
    purchaseBarriers: string[];
  };
  
  // Retention signals
  retention: {
    streakMaintained: boolean;
    friendsEngaged: number;
    questsAccepted: number;
    notificationsEnabled: boolean;
    tomorrowQuest: boolean;
  };
}
\\\`\\\`\\\`
        \`
      }
    }
  }
}`,...(u=(m=n.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var c,l,d;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  name: '3. Competitive Player Journey',
  parameters: {
    docs: {
      description: {
        story: \`
### 🏆 Competitive Player Journey (Power Users)

#### Competition Discovery (Week 2-4)
\\\`\\\`\\\`typescript
interface CompetitionDiscovery {
  // Natural progression
  triggers: {
    consistentHighScores: boolean;
    friendCompetition: boolean;
    leaderboardClimb: boolean;
    achievementHunting: boolean;
  };
  
  // Tournament introduction
  firstTournament: {
    discovered: 'notification' | 'friend' | 'browse' | 'promoted';
    type: 'daily' | 'weekly' | 'special_event';
    entry: 'free' | 'coins' | 'ticket';
    
    hesitation: {
      viewed: number; // times
      almostJoined: boolean;
      concerns: ('difficulty' | 'time' | 'cost' | 'skill')[];
    };
    
    joined: {
      reason: 'FOMO' | 'friend' | 'reward' | 'confidence';
      preparation: {
        practicedCategory: boolean;
        purchasedPowerUps: boolean;
        studiedQuestions: boolean;
      };
    };
  };
}
\\\`\\\`\\\`

#### Tournament Participation
\\\`\\\`\\\`typescript
interface TournamentPlay {
  tournament: {
    id: string;
    format: 'elimination' | 'points' | 'time_attack' | 'survival';
    participants: number;
    duration: number; // hours
    prizePool: Prize[];
  };
  
  // Gameplay phases
  phases: {
    // Phase 1: Qualification
    qualification?: {
      rounds: number;
      scores: number[];
      rank: number;
      qualified: boolean;
      stressLevel: 'low' | 'medium' | 'high';
    };
    
    // Phase 2: Main rounds
    mainRounds: Array<{
      round: number;
      opponents?: string[];
      score: number;
      rank: number;
      powerUpsUsed: string[];
      mistakes: number;
      timeRemaining: number;
      
      psychology: {
        pressure: number; // 1-10
        confidence: number; // 1-10
        tiltFactor: number; // 1-10
      };
    }>;
    
    // Phase 3: Finals
    finals?: {
      reached: boolean;
      finalRank: number;
      prizeWon?: Prize;
      emotionalResponse: 'ecstatic' | 'satisfied' | 'disappointed' | 'frustrated';
    };
  };
  
  // Live features
  liveFeatures: {
    spectators: number;
    chatMessages: number;
    emotesUsed: string[];
    friendsWatching: string[];
    streamIntegration?: {
      platform: 'twitch' | 'youtube';
      viewers: number;
    };
  };
}
\\\`\\\`\\\`

#### League System Progression
\\\`\\\`\\\`typescript
interface LeagueProgression {
  currentLeague: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
    division: 1 | 2 | 3 | 4 | 5;
    points: number;
    wins: number;
    losses: number;
    winStreak: number;
  };
  
  // Weekly league cycle
  weeklyProgress: {
    startRank: number;
    currentRank: number;
    promotion: {
      zone: boolean;
      secured: boolean;
      pointsNeeded: number;
    };
    relegation: {
      zone: boolean;
      danger: boolean;
      pointsBuffer: number;
    };
    
    // Daily play pattern
    playPattern: Array<{
      day: string;
      sessionsPlayed: number;
      pointsEarned: number;
      rankChange: number;
      mood: 'motivated' | 'grinding' | 'tilted' | 'casual';
    }>;
  };
  
  // Season progression
  season: {
    number: number;
    startDate: Date;
    endDate: Date;
    rewards: {
      current: Reward[];
      next: Reward[];
      ultimate: Reward;
    };
    
    milestones: Array<{
      name: string;
      requirement: string;
      progress: number;
      completed: boolean;
      reward: Reward;
    }>;
  };
}

// Matchmaking algorithm
const findOpponent = (player: Player) => {
  const factors = {
    skillRating: player.elo,
    recentForm: calculateForm(player.recent),
    queueTime: Date.now() - player.queueStart,
    regionPing: getRegionalLatency(player.region)
  };
  
  return matchmaking.findBest(factors);
};
\\\`\\\`\\\`

#### Head-to-Head Battles
\\\`\\\`\\\`typescript
interface HeadToHeadBattle {
  // Pre-match
  matchmaking: {
    searchTime: number;
    opponent: {
      id: string;
      rating: number;
      winRate: number;
      badges: string[];
      intimidationFactor: number;
    };
    
    // Pre-game lobby
    lobby: {
      trashTalk: Message[];
      emotesExchanged: string[];
      friendRequest: boolean;
      previousEncounters: number;
      rivalry: boolean;
    };
  };
  
  // Live match
  match: {
    format: 'best_of_3' | 'single' | 'marathon';
    
    rounds: Array<{
      questions: Array<{
        id: string;
        // Both players' answers
        player: {
          answer: string;
          time: number;
          correct: boolean;
        };
        opponent: {
          answer: string;
          time: number;
          correct: boolean;
        };
        
        // Live reactions
        reactions: {
          player?: 'celebrate' | 'frustrate' | 'focus';
          opponent?: 'celebrate' | 'frustrate' | 'focus';
        };
      }>;
      
      score: {
        player: number;
        opponent: number;
      };
      
      momentum: 'player' | 'opponent' | 'neutral';
      comebackPotential: boolean;
    }>;
    
    // Match result
    result: {
      winner: 'player' | 'opponent';
      finalScore: [number, number];
      ratingChange: number;
      rewards: Reward[];
      
      // Post-match
      postMatch: {
        rematchOffered: boolean;
        rematchAccepted?: boolean;
        sportmanship: 'good' | 'bad' | 'none';
        reported: boolean;
        friended: boolean;
      };
    };
  };
  
  // Psychological factors
  psychology: {
    preMatchNerves: number;
    duringMatchStress: number[];
    tiltMoments: Date[];
    comebackMoments: Date[];
    satisfactionLevel: number;
  };
}
\\\`\\\`\\\`

#### Clan/Team Dynamics
\\\`\\\`\\\`typescript
interface TeamDynamics {
  // Team membership
  team: {
    id: string;
    name: string;
    level: number;
    members: number;
    rank: number;
    
    joinedVia: 'invite' | 'application' | 'founded';
    role: 'member' | 'officer' | 'captain' | 'founder';
    contribution: {
      weeklyPoints: number;
      questsCompleted: number;
      tournamentWins: number;
    };
  };
  
  // Team activities
  activities: {
    // Team battles
    teamBattles: Array<{
      vs: string;
      format: '5v5' | '10v10' | 'unlimited';
      personalScore: number;
      teamScore: number;
      mvp: boolean;
      result: 'win' | 'loss';
    }>;
    
    // Team quests
    teamQuests: Array<{
      id: string;
      requirement: string;
      personalContribution: number;
      totalProgress: number;
      completed: boolean;
      reward: Reward;
    }>;
    
    // Team tournaments
    teamTournaments: Array<{
      name: string;
      placement: number;
      personalPerformance: number;
      teamStrategy: string;
      practiced: boolean;
    }>;
  };
  
  // Social dynamics
  social: {
    teamChat: {
      messagesPerDay: number;
      mentionedTimes: number;
      reactionsReceived: number;
      helpGiven: number;
      helpReceived: number;
    };
    
    relationships: Array<{
      memberId: string;
      relationship: 'friendly' | 'neutral' | 'competitive' | 'rival';
      interactions: number;
      battledTogether: number;
    }>;
    
    leadership?: {
      decisions: string[];
      membersSatisfaction: number;
      recruitmentSuccess: number;
      conflictsResolved: number;
    };
  };
}
\\\`\\\`\\\`

#### Competitive Analytics
\\\`\\\`\\\`typescript
interface CompetitiveAnalytics {
  // Performance tracking
  performance: {
    elo: number;
    peakElo: number;
    winRate: number;
    averageScore: number;
    clutchRate: number; // Performance under pressure
    
    byCategory: Record<string, {
      played: number;
      winRate: number;
      averageScore: number;
    }>;
    
    byOpponentStrength: {
      vsStronger: { games: number; winRate: number };
      vsSimilar: { games: number; winRate: number };
      vsWeaker: { games: number; winRate: number };
    };
  };
  
  // Improvement tracking
  improvement: {
    weeklyTrend: 'improving' | 'stable' | 'declining';
    strengthAreas: string[];
    weaknessAreas: string[];
    
    training: {
      practiceGames: number;
      tutorialsWatched: number;
      guidesRead: number;
      coachingSessions?: number;
    };
  };
  
  // Behavioral patterns
  behavior: {
    tiltTendency: number; // 0-1
    comebackAbility: number; // 0-1
    pressureHandling: number; // 0-1
    consistencyScore: number; // 0-1
    
    playSchedule: {
      preferredTimes: number[];
      sessionLength: number;
      breaksToken: boolean;
    };
  };
  
  // Economic behavior
  economy: {
    entryFeesSpent: number;
    prizesWon: number;
    netProfit: number;
    powerUpInvestment: number;
    roi: number;
  };
}
\\\`\\\`\\\`
        \`
      }
    }
  }
}`,...(d=(l=r.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var b,p,g;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: '4. Content Creator Journey',
  parameters: {
    docs: {
      description: {
        story: \`
### 🎨 Content Creator & Community Leader Journey

#### Creator Evolution Path
\\\`\\\`\\\`typescript
interface CreatorEvolution {
  // Stage 1: Consumer (Days 1-30)
  consumer: {
    quizzesPlayed: number;
    favoritedQuizzes: string[];
    ratedQuizzes: number;
    reportedIssues: number;
    
    // Early signals
    signals: {
      commentedOnQuizzes: number;
      suggestedImprovements: number;
      sharedQuizzes: number;
      helpedNewbies: number;
    };
  };
  
  // Stage 2: Contributor (Days 30-60)
  contributor: {
    firstContribution: {
      type: 'quiz' | 'question' | 'translation' | 'guide';
      date: Date;
      quality: number;
      communityResponse: {
        views: number;
        likes: number;
        plays: number;
        feedback: Comment[];
      };
    };
    
    motivation: {
      primary: 'recognition' | 'helping' | 'creative' | 'monetary';
      feedback: 'positive' | 'mixed' | 'negative';
      continued: boolean;
    };
  };
  
  // Stage 3: Creator (Days 60+)
  creator: {
    contentType: ('quiz' | 'course' | 'guide' | 'video')[];
    publishingFrequency: number; // per week
    qualityTier: 'amateur' | 'skilled' | 'expert' | 'master';
    
    audience: {
      followers: number;
      avgViews: number;
      engagement: number;
      retention: number;
    };
  };
  
  // Stage 4: Influencer (Days 180+)
  influencer: {
    platform: 'internal' | 'cross-platform';
    reach: number;
    partnerships: string[];
    monetization: boolean;
    brandAmbassador: boolean;
  };
}
\\\`\\\`\\\`

#### Quiz Creation Workflow
\\\`\\\`\\\`typescript
interface QuizCreationProcess {
  // Ideation
  ideation: {
    inspiration: 'trending' | 'requested' | 'original' | 'educational';
    research: {
      timeSpent: number;
      sourcesConsulted: number;
      factsVerified: boolean;
    };
    
    planning: {
      outline: boolean;
      difficultyMap: boolean;
      learningObjectives: string[];
      targetAudience: string;
    };
  };
  
  // Creation process
  creation: {
    sessions: Array<{
      startTime: Date;
      endTime: Date;
      questionsAdded: number;
      questionsEdited: number;
      questionsDeleted: number;
      
      tools: {
        aiAssistance: boolean;
        templateUsed: boolean;
        mediaAdded: boolean;
        collaborators: string[];
      };
    }>;
    
    // Quality control
    quality: {
      spellChecked: boolean;
      factChecked: boolean;
      difficultyBalanced: boolean;
      testPlayed: number; // times
      peerReviewed: boolean;
    };
  };
  
  // Publishing
  publishing: {
    timing: {
      scheduledFor: Date;
      optimalTime: boolean;
      reason: 'peak_hours' | 'event' | 'random';
    };
    
    metadata: {
      title: string;
      description: string;
      tags: string[];
      category: string;
      difficulty: string;
      thumbnail: 'default' | 'custom' | 'generated';
    };
    
    promotion: {
      sharedTo: ('team' | 'friends' | 'social' | 'discord')[];
      announcement: string;
      teaserCreated: boolean;
    };
  };
  
  // Post-publish
  postPublish: {
    monitoring: {
      firstHourViews: number;
      firstDayPlays: number;
      errorReports: number;
      quickFixes: number;
    };
    
    engagement: {
      respondedToComments: number;
      incorporatedFeedback: boolean;
      createdFollowUp: boolean;
      thankedPlayers: boolean;
    };
    
    iteration: {
      version: number;
      updates: Change[];
      improvementNotes: string[];
    };
  };
}

// Content quality scoring
const scoreContent = (quiz: Quiz) => {
  return {
    accuracy: checkFactualAccuracy(quiz),
    difficulty: analyzeDifficultyCurve(quiz),
    engagement: predictEngagement(quiz),
    educational: assessEducationalValue(quiz),
    overall: calculateOverallScore(quiz)
  };
};
\\\`\\\`\\\`

#### Community Building
\\\`\\\`\\\`typescript
interface CommunityBuilding {
  // Following growth
  following: {
    growth: Array<{
      date: Date;
      followers: number;
      source: 'content' | 'social' | 'feature' | 'viral';
    }>;
    
    demographics: {
      skillLevels: Record<string, number>;
      interests: string[];
      activePercentage: number;
      churnRate: number;
    };
    
    engagement: {
      likesPerPost: number;
      commentsPerPost: number;
      sharesPerPost: number;
      directMessages: number;
    };
  };
  
  // Content strategy
  strategy: {
    contentCalendar: Array<{
      date: Date;
      type: string;
      topic: string;
      planned: boolean;
      executed: boolean;
      performance: number;
    }>;
    
    series: Array<{
      name: string;
      episodes: number;
      subscribers: number;
      completionRate: number;
    }>;
    
    collaborations: Array<{
      partner: string;
      type: 'quiz' | 'event' | 'challenge';
      reach: number;
      success: number;
    }>;
  };
  
  // Community management
  management: {
    moderation: {
      messagesReviewed: number;
      actionsToken: number;
      conflictsResolved: number;
      toxicityHandled: number;
    };
    
    events: Array<{
      name: string;
      type: 'tournament' | 'workshop' | 'ama' | 'challenge';
      attendance: number;
      satisfaction: number;
      followUp: boolean;
    }>;
    
    mentorship: {
      newCreatorsHelped: number;
      tutorialsCreated: number;
      questionsAnswered: number;
      successStories: number;
    };
  };
  
  // Influence metrics
  influence: {
    contentViews: number;
    contentShares: number;
    trendsStarted: number;
    featuredTimes: number;
    
    platformImpact: {
      newUsersReferred: number;
      retentionImpact: number;
      engagementLift: number;
      revenueContribution: number;
    };
  };
}
\\\`\\\`\\\`

#### Monetization Journey
\\\`\\\`\\\`typescript
interface CreatorMonetization {
  // Eligibility progression
  eligibility: {
    requirements: {
      followers: { required: 1000, current: number };
      contentQuality: { required: 4.0, current: number };
      violations: { maximum: 2, current: number };
      accountAge: { required: 90, current: number };
    };
    
    applied: Date;
    approved: Date;
    tier: 'affiliate' | 'partner' | 'verified';
  };
  
  // Revenue streams
  revenue: {
    // Direct monetization
    direct: {
      adRevenue: number;
      subscriptions: number;
      tips: number;
      premiumContent: number;
    };
    
    // Indirect monetization
    indirect: {
      sponsorships: Array<{
        brand: string;
        deal: number;
        deliverables: string[];
        completed: boolean;
      }>;
      
      merchandise: {
        designs: number;
        sold: number;
        revenue: number;
      };
      
      courses: {
        created: number;
        enrolled: number;
        revenue: number;
      };
    };
    
    // Platform programs
    programs: {
      creatorFund: number;
      performanceBonus: number;
      referralBonus: number;
      specialEvents: number;
    };
  };
  
  // Business development
  business: {
    brandBuilding: {
      logo: boolean;
      consistentStyle: boolean;
      catchphrase: string;
      uniqueValue: string;
    };
    
    crossPlatform: {
      youtube: { subscribers: number; videos: number };
      twitch: { followers: number; streams: number };
      discord: { members: number; active: number };
      twitter: { followers: number; engagement: number };
    };
    
    analytics: {
      dashboardUsage: number; // hours/week
      metricsTracked: string[];
      decisionsDataDriven: boolean;
      growthRate: number;
    };
  };
}
\\\`\\\`\\\`
        \`
      }
    }
  }
}`,...(g=(p=t.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};const w=["NewUserOnboarding","DailyActiveUser","CompetitivePlayer","ContentCreator"];export{r as CompetitivePlayer,t as ContentCreator,n as DailyActiveUser,e as NewUserOnboarding,w as __namedExportsOrder,v as default};
