# QuizMentor Admin Dashboard

## Overview

The QuizMentor Admin Dashboard is a comprehensive web-based control center for managing all aspects of the quiz application, including remote configuration, A/B testing, content management, user analytics, and manipulation metrics.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (Web)                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend: Next.js + TypeScript + Tailwind CSS + Shadcn/ui  │
│  Auth: Supabase Auth with Role-Based Access Control (RBAC)  │
│  API: Next.js API Routes + Supabase Edge Functions          │
│  Database: Supabase (PostgreSQL)                            │
│  Real-time: Supabase Realtime for live metrics              │
│  Hosting: Vercel                                            │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Feature Flags & Remote Config

#### Features Management

```typescript
interface FeatureFlagManager {
  // CRUD operations
  createFlag(flag: FeatureFlag): Promise<void>;
  updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<void>;
  deleteFlag(id: string): Promise<void>;

  // Rollout controls
  setRolloutPercentage(feature: string, percentage: number): void;
  targetSegment(feature: string, segment: UserSegment): void;
  scheduleRollout(feature: string, schedule: RolloutSchedule): void;

  // Kill switch
  emergencyDisable(feature: string): void;
  rollback(feature: string, version: string): void;
}
```

#### UI Components

- **Feature Toggle Grid**: Visual on/off switches for all features
- **Rollout Slider**: 0-100% gradual rollout control
- **Segment Targeting**: User segment selection and rules
- **History Log**: Complete audit trail of changes
- **Impact Preview**: Estimated user impact before applying

### 2. A/B Testing Platform

#### Experiment Management

```typescript
interface ExperimentDashboard {
  // Experiment lifecycle
  createExperiment(config: ExperimentConfig): Promise<Experiment>;
  startExperiment(id: string): void;
  pauseExperiment(id: string): void;
  concludeExperiment(id: string): ExperimentResults;

  // Statistical analysis
  calculateSignificance(experiment: Experiment): SignificanceTest;
  getConfidenceInterval(metric: string): [number, number];
  detectSampleSizeReached(experiment: Experiment): boolean;

  // Variant management
  addVariant(experimentId: string, variant: Variant): void;
  adjustTrafficSplit(experimentId: string, splits: TrafficSplit): void;
}
```

#### Visual Analytics

- **Live Experiment Monitor**: Real-time participant counts
- **Conversion Funnel**: Visual funnel for each variant
- **Statistical Significance Calculator**: p-values and confidence intervals
- **Winner Declaration**: Automated or manual winner selection
- **Experiment Calendar**: Timeline view of all experiments

### 3. Quiz Content Management System (CMS)

#### Question Editor

```typescript
interface QuizCMS {
  // Question management
  createQuestion(question: Question): Promise<void>;
  bulkImportQuestions(csv: File): Promise<ImportResult>;
  reviewSubmissions(status: 'pending' | 'approved' | 'rejected'): Question[];

  // Category management
  createCategory(category: Category): void;
  reorderCategories(order: string[]): void;
  setCategoryDifficulty(id: string, difficulty: Difficulty): void;

  // Content scheduling
  scheduleContent(content: Content, schedule: Schedule): void;
  createSeasonalEvent(event: SeasonalEvent): void;

  // Quality control
  validateQuestion(question: Question): ValidationResult;
  checkForDuplicates(question: Question): Question[];
  runQualityMetrics(): QualityReport;
}
```

#### Rich Editor Features

- **WYSIWYG Question Editor**: Markdown support with preview
- **Image Upload**: Drag-and-drop image management
- **Bulk Operations**: CSV import/export
- **Difficulty Calibration**: AI-assisted difficulty scoring
- **Translation Management**: Multi-language support
- **Version Control**: Question revision history

### 4. User Analytics & Manipulation Metrics

#### Real-time Dashboard

```typescript
interface AnalyticsDashboard {
  // Core metrics
  getDAU(): number;
  getMAU(): number;
  getRetention(cohort: string, day: number): number;
  getLTV(segment?: UserSegment): number;

  // Manipulation metrics
  getFrustrationScore(): FrustrationMetrics;
  getConversionProbability(): ConversionPrediction;
  getEngagementHooks(): EngagementMetrics;
  getDarkPatternEffectiveness(): DarkPatternReport;

  // User behavior
  getUserJourney(userId: string): Journey;
  getDropoffPoints(): DropoffAnalysis;
  getSessionRecording(sessionId: string): Recording;
}
```

#### Visualization Components

- **Real-time Metrics Grid**: DAU, Sessions, Revenue ticker
- **Manipulation Heatmap**: Frustration points visualization
- **Conversion Funnel**: Step-by-step conversion tracking
- **Cohort Analysis**: Retention curves by cohort
- **User Segmentation**: Behavioral clustering
- **Revenue Analytics**: ARPU, LTV, churn predictions

### 5. Monetization Control Center

#### Dynamic Pricing Manager

```typescript
interface MonetizationManager {
  // Pricing controls
  setBasePrice(product: string, price: number): void;
  configureDynamicPricing(rules: PricingRule[]): void;
  createPromotion(promo: Promotion): void;

  // Ad management
  setAdFrequency(type: AdType, frequency: number): void;
  configureAdPlacements(placements: AdPlacement[]): void;
  setRewardedAdRewards(rewards: AdReward[]): void;

  // Subscription management
  createSubscriptionTier(tier: SubscriptionTier): void;
  offerTrial(segment: UserSegment, duration: number): void;
  configurePaywall(config: PaywallConfig): void;
}
```

#### Revenue Optimization Tools

- **Price Elasticity Testing**: A/B test different price points
- **Promotion Calendar**: Schedule sales and discounts
- **Ad Revenue Optimizer**: Balance ad frequency vs churn
- **Paywall Editor**: Visual paywall designer
- **Currency Converter**: PPP-based pricing by country

### 6. Engagement & Notification Manager

#### Notification Orchestrator

```typescript
interface NotificationManager {
  // Campaign management
  createCampaign(campaign: NotificationCampaign): void;
  scheduleNotification(notification: Notification): void;
  setTriggerRules(rules: TriggerRule[]): void;

  // Template management
  createTemplate(template: NotificationTemplate): void;
  personalizeContent(template: string, userData: UserData): string;

  // Performance tracking
  getOpenRates(): OpenRateMetrics;
  getConversionFromNotification(): ConversionMetrics;
  optimizeSendTimes(): TimeOptimization;
}
```

#### Engagement Tools

- **Push Notification Composer**: Rich media notifications
- **Campaign Scheduler**: Time-based and trigger-based campaigns
- **Template Library**: Pre-built notification templates
- **A/B Testing**: Test different messages
- **Delivery Analytics**: Open rates, CTR, conversions

### 7. Leaderboard & Social Manager

#### Competition Controls

```typescript
interface SocialManager {
  // Leaderboard management
  configureLeaderboard(config: LeaderboardConfig): void;
  injectFakeUsers(count: number, behavior: UserBehavior): void;
  adjustRankings(adjustments: RankAdjustment[]): void;

  // Social features
  manageFakeFriends(config: FakeFriendConfig): void;
  createChallenge(challenge: Challenge): void;
  moderateContent(content: UserContent): void;
}
```

#### Social Manipulation Tools

- **Fake User Generator**: Create realistic bot users
- **Activity Simulator**: Generate fake user activity
- **Ranking Manipulator**: Adjust user positions
- **Challenge Creator**: Design viral challenges
- **Social Graph Visualizer**: See user connections

### 8. Support & Moderation

#### User Management

```typescript
interface UserManager {
  // User actions
  searchUsers(query: string): User[];
  viewUserProfile(userId: string): UserProfile;
  banUser(userId: string, reason: string): void;
  grantCompensation(userId: string, compensation: Compensation): void;

  // Moderation
  reviewReports(status: 'pending' | 'resolved'): Report[];
  moderateContent(contentId: string, action: ModerationAction): void;

  // Support
  viewSupportTickets(): Ticket[];
  respondToTicket(ticketId: string, response: string): void;
}
```

### 9. System Health & Monitoring

#### Infrastructure Monitor

```typescript
interface SystemMonitor {
  // Health checks
  getSystemStatus(): SystemHealth;
  getAPILatency(): LatencyMetrics;
  getDatabasePerformance(): DatabaseMetrics;

  // Error tracking
  getErrorRate(): ErrorMetrics;
  getErrorDetails(errorId: string): ErrorDetail;

  // Alerts
  configureAlert(alert: AlertConfig): void;
  getAlertHistory(): Alert[];
}
```

## Dashboard Pages Structure

```
/admin
├── /dashboard          # Overview with key metrics
├── /features          # Feature flags management
│   ├── /flags         # Individual feature toggles
│   ├── /rollouts      # Gradual rollout controls
│   └── /history       # Change history and rollback
├── /experiments       # A/B testing platform
│   ├── /active        # Running experiments
│   ├── /create        # New experiment wizard
│   ├── /results       # Completed experiments
│   └── /calculator    # Sample size calculator
├── /content          # Quiz CMS
│   ├── /questions     # Question bank
│   ├── /categories    # Category management
│   ├── /submissions   # User submissions
│   └── /schedule      # Content calendar
├── /analytics        # User analytics
│   ├── /realtime      # Live metrics
│   ├── /retention     # Cohort analysis
│   ├── /funnels       # Conversion funnels
│   ├── /manipulation  # Dark pattern metrics
│   └── /predictions   # ML predictions
├── /monetization     # Revenue management
│   ├── /pricing       # Dynamic pricing
│   ├── /promotions    # Sales and discounts
│   ├── /ads           # Ad configuration
│   └── /subscriptions # Subscription tiers
├── /engagement       # User engagement
│   ├── /notifications # Push notifications
│   ├── /campaigns     # Marketing campaigns
│   ├── /challenges    # Daily/weekly challenges
│   └── /rewards       # Reward configuration
├── /social           # Social features
│   ├── /leaderboard   # Leaderboard management
│   ├── /fake-users    # Bot user management
│   └── /moderation    # Content moderation
├── /users            # User management
│   ├── /search        # User search
│   ├── /segments      # User segmentation
│   ├── /support       # Support tickets
│   └── /compensation  # Manual rewards
└── /system           # System administration
    ├── /health        # System health
    ├── /logs          # Application logs
    ├── /errors        # Error tracking
    └── /settings      # Global settings
```

## Security & Access Control

### Role-Based Access Control (RBAC)

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin', // Full access
  PRODUCT_MANAGER = 'product_manager', // Features, experiments, analytics
  CONTENT_EDITOR = 'content_editor', // Quiz content only
  ANALYST = 'analyst', // Read-only analytics
  SUPPORT = 'support', // User management, support
  MODERATOR = 'moderator', // Content moderation only
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

const rolePermissions: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: [{ resource: '*', actions: ['create', 'read', 'update', 'delete'] }],
  [AdminRole.PRODUCT_MANAGER]: [
    { resource: 'features', actions: ['create', 'read', 'update'] },
    { resource: 'experiments', actions: ['create', 'read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  // ... more role definitions
};
```

### Audit Logging

Every action in the admin dashboard is logged:

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

## Implementation Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State**: Zustand + React Query
- **Charts**: Recharts / D3.js
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table

### Backend

- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with custom RBAC
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions for heavy operations

### Deployment

- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

## Quick Start Guide

```bash
# Clone the admin dashboard
git clone https://github.com/quizmentor/admin-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Dashboard Mockups

### Main Dashboard

- Key metrics cards (DAU, Revenue, Conversion)
- Real-time activity feed
- Quick actions panel
- Alert notifications

### Feature Flags Page

- Toggle switches grid
- Rollout percentage sliders
- User segment targeting
- Change history timeline

### Experiment Results

- Variant performance comparison
- Statistical significance indicators
- Conversion funnel visualization
- Winner declaration panel

### Analytics Overview

- Manipulation metrics heatmap
- User journey flow diagram
- Retention cohort grid
- Revenue trend charts

## Best Practices

1. **Always test in staging** before applying production changes
2. **Use gradual rollouts** for new features (start at 5-10%)
3. **Monitor metrics** after any configuration change
4. **Document experiments** with clear hypotheses
5. **Set up alerts** for critical metric changes
6. **Review audit logs** weekly for security
7. **Backup configurations** before major changes
8. **Use version control** for configuration as code

## API Reference

The admin dashboard communicates with the backend through RESTful APIs:

### Configuration API

```
GET    /api/admin/config          # Get current configuration
PUT    /api/admin/config          # Update configuration
POST   /api/admin/config/rollback # Rollback to previous version
```

### Experiment API

```
GET    /api/admin/experiments     # List all experiments
POST   /api/admin/experiments     # Create new experiment
PUT    /api/admin/experiments/:id # Update experiment
DELETE /api/admin/experiments/:id # Delete experiment
POST   /api/admin/experiments/:id/start  # Start experiment
POST   /api/admin/experiments/:id/stop   # Stop experiment
```

### Analytics API

```
GET    /api/admin/analytics/dau   # Get DAU metrics
GET    /api/admin/analytics/retention # Get retention data
GET    /api/admin/analytics/revenue   # Get revenue metrics
GET    /api/admin/analytics/manipulation # Get manipulation metrics
```

### Content API

```
GET    /api/admin/questions       # List questions
POST   /api/admin/questions       # Create question
PUT    /api/admin/questions/:id   # Update question
DELETE /api/admin/questions/:id   # Delete question
POST   /api/admin/questions/import # Bulk import
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **System Health**: API latency, error rates, uptime
2. **User Metrics**: DAU drop >20%, retention decline
3. **Revenue**: Daily revenue drop >30%
4. **Experiments**: Sample size reached, significance achieved
5. **Manipulation**: Frustration score >80, high churn risk

### Alert Channels

- Email notifications
- Slack integration
- PagerDuty for critical issues
- In-dashboard notifications

## Future Enhancements

1. **Machine Learning Integration**
   - Automated A/B test recommendations
   - Predictive churn modeling
   - Content difficulty auto-calibration

2. **Advanced Analytics**
   - Predictive LTV modeling
   - User behavior clustering
   - Revenue forecasting

3. **Automation**
   - Auto-rollback on metric degradation
   - Scheduled configuration changes
   - Automated experiment conclusions

4. **Enhanced Security**
   - Two-factor authentication
   - IP whitelisting
   - Configuration encryption

5. **Developer Tools**
   - Configuration as Code (CaC)
   - CLI for admin operations
   - API SDK for integrations

This admin dashboard provides complete control over the QuizMentor application, enabling data-driven decision making, rapid experimentation, and sophisticated user manipulation tactics while maintaining system stability and security.
