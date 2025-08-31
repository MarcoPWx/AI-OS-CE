# QuizMentor User Stories & Acceptance Criteria

_Last Updated: 2025-08-29_
_Status: CURRENT — Mock-first TDD via Storybook_

## 🎯 Purpose

Define clear user stories with acceptance criteria for ALL features before any more coding.
This document serves as the single source of truth for what we're building.

### TDD with Storybook (Current)

- Primary validation uses Storybook play() tests and MSW mocks. CI target: `npm run test:stories`.
- HTTP mocks: MSW v2 — global defaults can be adjusted via toolbar (default/slower/flaky/chaos).
- S2S orchestration demos covered under Dev/S2S Orchestration story; API endpoints under API/Playground.
- Auth flows (mock-first) validated by AuthMSW stories (login success/failure, session).
- Source of truth: docs/status/\*\_CURRENT.md.

---

## 📱 Epic 1: Authentication & User Management

### Story 1.1: User Registration

**As a** new user  
**I want to** create an account  
**So that** I can track my quiz progress and compete with others

#### Acceptance Criteria:

- [ ] User can register with email and password
- [ ] Email validation ensures proper format
- [ ] Password must be minimum 8 characters with 1 uppercase, 1 number
- [ ] User receives email verification within 2 minutes
- [ ] Duplicate email shows clear error message
- [ ] Registration form shows loading state during submission
- [ ] Success redirects to onboarding flow
- [ ] Failed registration shows specific error messages
- [ ] Form is accessible with keyboard navigation
- [ ] Mobile responsive design

#### Technical Requirements:

- Supabase Auth integration
- Email verification flow
- Rate limiting (5 attempts per hour)
- Audit logging for registration attempts

---

### Story 1.2: User Login

**As a** registered user  
**I want to** sign in to my account  
**So that** I can access my personalized content

#### Acceptance Criteria:

- [ ] User can login with email and password
- [ ] "Remember me" option keeps session for 30 days
- [ ] Failed login shows generic security message
- [ ] Account locks after 5 failed attempts
- [ ] Password reset link available on login page
- [ ] OAuth login with GitHub available
- [ ] Session timeout after 30 minutes of inactivity
- [ ] Loading state during authentication
- [ ] Successful login redirects to dashboard
- [ ] Refresh tokens handled automatically

#### Technical Requirements:

- JWT token management
- Secure session storage
- OAuth 2.0 implementation
- Refresh token rotation

---

### Story 1.3: Password Reset

**As a** user who forgot their password  
**I want to** reset my password  
**So that** I can regain access to my account

#### Acceptance Criteria:

- [ ] User can request reset with email
- [ ] Reset email sent within 2 minutes
- [ ] Reset link expires after 1 hour
- [ ] Password reset requires email verification
- [ ] Success message confirms password change
- [ ] User is logged out from all devices after reset
- [ ] Rate limited to 3 requests per hour

---

## 🎮 Epic 2: Quiz Experience

### Story 2.1: Take a Quiz

**As a** user  
**I want to** take quizzes on various topics  
**So that** I can test and improve my knowledge

#### Acceptance Criteria:

- [ ] User can select quiz category
- [ ] User can choose difficulty level (easy/medium/hard)
- [ ] Questions display one at a time
- [ ] Timer shows remaining time per question (30 seconds)
- [ ] User can select one answer from 4 options
- [ ] Selected answer is clearly highlighted
- [ ] User cannot change answer after submission
- [ ] Progress bar shows question X of Y
- [ ] Skip button available (counts as incorrect)
- [ ] Quiz can be paused and resumed
- [ ] Offline mode stores progress locally
- [ ] Network errors handled gracefully

#### Technical Requirements:

- Question delivery from unified quiz service
- Local storage for offline support
- WebSocket for real-time features
- Analytics tracking for each question

---

### Story 2.2: View Quiz Results

**As a** user who completed a quiz  
**I want to** see my results and correct answers  
**So that** I can learn from my mistakes

#### Acceptance Criteria:

- [ ] Score displayed as percentage and X/Y correct
- [ ] Time taken for completion shown
- [ ] Each question shows user answer vs correct answer
- [ ] Incorrect answers include explanation
- [ ] Performance compared to average
- [ ] XP and points earned displayed
- [ ] Achievements unlocked shown
- [ ] Share results on social media
- [ ] Save results to profile
- [ ] Option to retake quiz
- [ ] Results persist across sessions

#### Technical Requirements:

- Results stored in database
- Calculation service for scoring
- Social media integration APIs
- Achievement engine triggers

---

### Story 2.3: Practice Mode

**As a** user wanting to learn  
**I want to** practice without time pressure  
**So that** I can learn at my own pace

#### Acceptance Criteria:

- [ ] No timer in practice mode
- [ ] Instant feedback after each answer
- [ ] Explanation shown for all answers
- [ ] Can review previous questions
- [ ] No points or XP awarded
- [ ] Progress saved automatically
- [ ] Can switch to competitive mode
- [ ] Hints available (reduces points)

---

## 🏆 Epic 3: Gamification

### Story 3.1: Earn Experience Points

**As a** user taking quizzes  
**I want to** earn XP for correct answers  
**So that** I can level up and unlock content

#### Acceptance Criteria:

- [ ] Correct answer awards base XP
- [ ] Bonus XP for speed
- [ ] Streak multiplier for consecutive correct
- [ ] Daily XP cap at 1000
- [ ] XP visible in real-time
- [ ] Level progress bar updates
- [ ] Next level requirements shown
- [ ] XP history viewable in profile

#### Technical Requirements:

- XP calculation engine
- Real-time updates via WebSocket
- Database transactions for XP
- Anti-cheat detection

---

### Story 3.2: Unlock Achievements

**As a** user progressing through quizzes  
**I want to** unlock achievements  
**So that** I feel recognized for my accomplishments

#### Acceptance Criteria:

- [ ] Achievement unlocked notification appears
- [ ] 50+ unique achievements available
- [ ] Progress tracking for partial achievements
- [ ] Rarity level shown (common/rare/legendary)
- [ ] Achievement gives bonus XP
- [ ] Shareable achievement badges
- [ ] Achievement showcase on profile
- [ ] Filter by earned/unearned
- [ ] Secret achievements hidden until earned

#### Technical Requirements:

- Achievement engine with rules
- Event-driven architecture
- Badge image storage (CDN)
- Push notifications

---

### Story 3.3: Compete on Leaderboard

**As a** competitive user  
**I want to** see my ranking  
**So that** I can compete with others

#### Acceptance Criteria:

- [ ] Global leaderboard shows top 100
- [ ] Weekly/Monthly/All-time views
- [ ] Friend leaderboard available
- [ ] My rank always visible
- [ ] Updates in real-time
- [ ] Filter by category
- [ ] Profile preview on tap
- [ ] Anti-cheat measures active

#### Technical Requirements:

- Redis for leaderboard caching
- Scheduled jobs for rankings
- WebSocket for live updates
- Fraud detection system

---

## 👤 Epic 4: User Profile

### Story 4.1: View Profile

**As a** user  
**I want to** view my profile  
**So that** I can track my progress

#### Acceptance Criteria:

- [ ] Avatar and username displayed
- [ ] Current level and XP
- [ ] Quiz statistics (total, accuracy)
- [ ] Recent activity feed
- [ ] Achievement showcase (top 5)
- [ ] Favorite categories
- [ ] Join date
- [ ] Edit profile button
- [ ] Privacy settings
- [ ] Share profile link

#### Technical Requirements:

- Profile data aggregation
- Image upload for avatar
- Privacy controls
- Shareable profile URLs

---

### Story 4.2: Customize Settings

**As a** user  
**I want to** customize my experience  
**So that** the app works how I prefer

#### Acceptance Criteria:

- [ ] Dark/Light theme toggle
- [ ] Sound effects on/off
- [ ] Notification preferences
- [ ] Language selection
- [ ] Difficulty preference
- [ ] Auto-play next question
- [ ] Data usage settings
- [ ] Account deletion option
- [ ] Export my data (GDPR)
- [ ] Settings sync across devices

#### Technical Requirements:

- Settings persistence
- Theme system
- i18n implementation
- GDPR compliance tools

---

## 📊 Epic 5: Analytics & Insights

### Story 5.1: Learning Analytics

**As a** user wanting to improve  
**I want to** see my learning patterns  
**So that** I can focus on weak areas

#### Acceptance Criteria:

- [ ] Accuracy by category
- [ ] Performance over time graph
- [ ] Weakest topics identified
- [ ] Recommended practice areas
- [ ] Time spent learning
- [ ] Best performance times
- [ ] Streak calendar
- [ ] Export to PDF report

#### Technical Requirements:

- Analytics aggregation service
- Chart rendering library
- PDF generation service
- Data warehouse for metrics

---

## 🔌 Epic 6: Offline Support

### Story 6.1: Offline Quiz Mode

**As a** user without internet  
**I want to** continue taking quizzes  
**So that** I can learn anywhere

#### Acceptance Criteria:

- [ ] Download quiz packs for offline
- [ ] 50 questions cached minimum
- [ ] Progress saved locally
- [ ] Sync when online
- [ ] Offline indicator visible
- [ ] Limited features notice
- [ ] Cache size manageable
- [ ] Auto-download on WiFi option

#### Technical Requirements:

- Service Worker implementation
- IndexedDB for local storage
- Background sync API
- Cache management strategy

---

## ✅ Definition of Ready

Before development starts, each story must have:

- [ ] Clear acceptance criteria
- [ ] API contracts defined
- [ ] UI/UX mockups approved
- [ ] Technical design reviewed
- [ ] Test scenarios written
- [ ] Dependencies identified
- [ ] Story points estimated

## ✅ Definition of Done

A story is complete when:

- [ ] All acceptance criteria met
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Deployed to staging
- [ ] Product owner accepted

---

## 📈 Success Metrics

### User Engagement

- Daily Active Users (DAU) > 1,000
- Session duration > 10 minutes
- Quiz completion rate > 80%
- Return rate (7-day) > 40%

### Technical Performance

- Page load time < 3 seconds
- API response time < 500ms (P95)
- Error rate < 0.1%
- Uptime > 99.9%

### Business Goals

- User registration conversion > 20%
- Monthly Active Users (MAU) > 10,000
- User satisfaction (NPS) > 50
- App store rating > 4.5 stars

---

## 🚨 Priority Order (MVP)

### Phase 1: Foundation (Week 1-2)

1. Story 1.1: User Registration ⭐
2. Story 1.2: User Login ⭐
3. Story 2.1: Take a Quiz ⭐
4. Story 2.2: View Quiz Results ⭐

### Phase 2: Engagement (Week 3-4)

5. Story 3.1: Earn Experience Points
6. Story 3.2: Unlock Achievements
7. Story 4.1: View Profile
8. Story 3.3: Compete on Leaderboard

### Phase 3: Polish (Week 5-6)

9. Story 4.2: Customize Settings
10. Story 5.1: Learning Analytics
11. Story 6.1: Offline Support
12. Story 1.3: Password Reset

---

_Note: This is a living document. Update as requirements evolve._

---

## 🎮 Interactive Scenario User Stories (50)

> Each story includes an E2E ID for traceability. See e2e/user-stories.generated.spec.ts for the corresponding test placeholder.

### US-001: Complete First-Time Onboarding

As a first-time user, I want to complete a short onboarding tour so that I understand the app’s core features.

- [ ] Shows 3–5 slides explaining Play, Practice, XP, and Achievements
- [ ] “Skip” and “Next” controls are accessible and keyboard-navigable
- [ ] “Get Started” lands on Categories
- [ ] Onboarding doesn’t show again after completion
- E2E: US-001

### US-002: Resume Onboarding Later

As a first-time user, I want to dismiss onboarding and resume it later so that I can explore and finish it when I have time.

- [ ] “Skip” persists state; user can resume from Profile → Help → Onboarding
- [ ] State survives reload
- [ ] Analytics event captured: onboarding_skipped
- E2E: US-002

### US-003: Select Category and Difficulty

As a user, I want to select a quiz category and difficulty so that I can start a tailored quiz.

- [ ] Category grid displays available categories
- [ ] Difficulty selection (easy/medium/hard) visible and remembered per category
- [ ] “Start Quiz” visible only after both are chosen
- E2E: US-003

### US-004: Start Timed Quiz

As a user, I want a countdown per question so that I stay engaged and challenged.

- [ ] Each question shows a 30s timer
- [ ] Timer pauses when app goes to background (web: inactive tab)
- [ ] Visual cue when 5s remain
- E2E: US-004

### US-005: Answer Single-Choice Question

As a user, I want to select one option so that I can progress.

- [ ] Only one option can be active
- [ ] Submit is disabled until an option is selected
- [ ] After submit, lock choices and show correct/incorrect feedback
- E2E: US-005

### US-006: Show Explanation After Answer

As a user, I want an explanation after each question so that I can learn.

- [ ] Explanation panel expands after submission
- [ ] External links (if any) open in a new tab
- [ ] Accessible region announcement for screen readers
- E2E: US-006

### US-007: Skip Question

As a user, I want to skip a question so that I can move on quickly.

- [ ] Skip counts as incorrect
- [ ] Streak resets
- [ ] Analytics event: question_skipped
- E2E: US-007

### US-008: Progress Bar and Position

As a user, I want to see my current position so that I know how many questions remain.

- [ ] Shows “Question X of Y”
- [ ] Progress bar moves smoothly
- [ ] Works with both timed and practice modes
- E2E: US-008

### US-009: Pause and Resume Quiz

As a user, I want to pause a quiz so that I can come back later.

- [ ] Pause available outside competitive modes
- [ ] Progress stored locally; resume returns to the same question
- [ ] Pause disables timer; resume restarts timer
- E2E: US-009

### US-010: End-of-Quiz Summary

As a user, I want a summary so that I can review performance.

- [ ] Shows score %, X/Y, time, streak max
- [ ] Highlights incorrect answers and explanations
- [ ] Offers Retake and Practice recommendations
- E2E: US-010

### US-011: Practice Mode (No Timer)

As a learner, I want practice without time pressure so that I can focus on understanding.

- [ ] No timer
- [ ] Instant feedback per question
- [ ] No XP awarded; “Practice” tag visible
- E2E: US-011

### US-012: Hints in Practice

As a learner, I want hints so that I can scaffold learning.

- [ ] Request hint reveals a partial clue
- [ ] Hint reduces end-of-session score weighting
- [ ] Analytics: hint_requested
- E2E: US-012

### US-013: Bookmark Question

As a user, I want to bookmark a question so that I can revisit it later.

- [ ] Bookmark toggle on question
- [ ] Bookmarked items visible in Profile → Bookmarks
- [ ] Persisted across sessions
- E2E: US-013

### US-014: XP Award for Correct Answers

As a player, I want XP for correct answers so that I feel progress.

- [ ] Base XP per correct answer
- [ ] Streak multiplier applies
- [ ] Real-time XP toast and XP bar update
- E2E: US-014

### US-015: Streaks and Combos

As a player, I want streak rewards so that consistent performance is recognized.

- [ ] Streak increases on correct answers, resets on miss/skip
- [ ] Visual streak celebration at thresholds (3/5/10)
- [ ] Streak contributes to XP multiplier
- E2E: US-015

### US-016: Daily Goal and Reminders

As a player, I want a daily goal so that I maintain a learning habit.

- [ ] Daily goal (e.g., 10 questions) shown on Home
- [ ] Progress ring updates after each session
- [ ] Optional notification reminder (if enabled)
- E2E: US-016

### US-017: Achievements Unlocked

As a player, I want achievements so that milestones feel rewarding.

- [ ] Unlock banner with badge + XP bonus
- [ ] Badge listed in Profile → Achievements
- [ ] Rare/Legendary achievements highlighted
- E2E: US-017

### US-018: Achievement Progress Tracking

As a player, I want partial progress tracking so that I can see how close I am.

- [ ] Shows “X/Y” progress for multi-step achievements
- [ ] Progress increments on relevant actions
- [ ] Completion triggers celebration
- E2E: US-018

### US-019: Leaderboard (Global)

As a competitive player, I want to see the global leaderboard so that I can compare with others.

- [ ] Weekly/Monthly/All-time tabs
- [ ] My rank always visible
- [ ] Category filter persists
- E2E: US-019

### US-020: Friend Leaderboard

As a social player, I want a friend leaderboard so that I can compete with friends.

- [ ] Friend view toggles on leaderboard
- [ ] “Invite friend” deep link available
- [ ] Privacy controls respected
- E2E: US-020

### US-021: Share Results

As a user, I want to share results so that I can celebrate with peers.

- [ ] Share to OS share sheet with image + stats
- [ ] Privacy-safe content (no email/PII)
- [ ] Works on web and mobile
- E2E: US-021

### US-022: Profile Overview

As a user, I want a profile dashboard so that I can track progress.

- [ ] Avatar, level, XP, streak, recent achievements
- [ ] Recent activity list
- [ ] Deep links to Bookmarks and Analytics
- E2E: US-022

### US-023: Edit Profile

As a user, I want to edit display name and avatar so that my profile feels personal.

- [ ] Change display name with validation
- [ ] Upload or choose avatar
- [ ] Changes persist and reflect in leaderboards
- E2E: US-023

### US-024: Settings — Theme & Notifications

As a user, I want to toggle theme and notifications so that the app matches my preferences.

- [ ] Light/Dark toggle persists
- [ ] Notification opt-in/opt-out
- [ ] Accessible color contrast maintained
- E2E: US-024

### US-025: Settings — Language

As a user, I want to choose language so that I can use the app comfortably.

- [ ] Language picker with immediate UI refresh
- [ ] Persists across sessions
- [ ] RTL languages handled
- E2E: US-025

### US-026: App Launch Reliability

As a user, I want robust loading so that I don’t hit a white screen.

- [ ] Safe fallbacks if remote config fails
- [ ] Splash screen never stalls >5s
- [ ] Error boundary with retry
- E2E: US-026

### US-027: Offline Detection & Indicator

As a user, I want an offline badge so that I’m aware of my connectivity.

- [ ] Offline banner appears when network drops
- [ ] “You’re offline” disables server-only actions
- [ ] Reconnect triggers sync
- E2E: US-027

### US-028: Download Quiz Pack for Offline

As a user, I want to download packs so that I can practice offline.

- [ ] Download size and progress shown
- [ ] Minimum 50 questions stored
- [ ] Storage management available
- E2E: US-028

### US-029: Sync After Offline Session

As a user, I want my offline progress synced so that my stats stay accurate.

- [ ] On reconnect, results and XP sync automatically
- [ ] Conflict resolution: latest-wins with merge for stats
- [ ] Visible “Synced” confirmation
- E2E: US-029

### US-030: Recover From API Errors

As a user, I want graceful error handling so that I can continue.

- [ ] Retries with backoff on transient errors
- [ ] Clear error messages, “Try Again” control
- [ ] Logging includes requestId
- E2E: US-030

### US-031: Accessibility — Screen Reader

As a user using a screen reader, I want logical focus order so that I can navigate easily.

- [ ] Focus order follows UI structure
- [ ] ARIA labels for buttons and options
- [ ] Live regions for toasts/XP updates
- E2E: US-031

### US-032: Accessibility — Keyboard Navigation

As a keyboard user, I want tab navigation so that I can use the app without a mouse.

- [ ] All interactive elements reachable by Tab/Shift+Tab
- [ ] Visible focus indicators
- [ ] Space/Enter activates controls
- E2E: US-032

### US-033: Localization — Date/Number Formats

As a global user, I want localized dates and numbers so that it feels natural.

- [ ] Date/number formats reflect locale
- [ ] Dynamic switch applies immediately
- [ ] Fallback to en-US safely
- E2E: US-033

### US-034: Search Categories

As a user, I want to search categories so that I can find content faster.

- [ ] Debounced search
- [ ] Highlights matched terms
- [ ] No-results empty state shown
- E2E: US-034

### US-035: Filter by Difficulty/Length

As a user, I want filters so that I can tailor sessions.

- [ ] Difficulty and length filters apply to list
- [ ] Persist filters per session
- [ ] Clear-all resets to defaults
- E2E: US-035

### US-036: Resume Last Session

As a user, I want to resume last session so that I can continue without friction.

- [ ] “Resume” card on Home when paused/incomplete
- [ ] Restores question, choices disabled until confirmed
- [ ] Works across reloads
- E2E: US-036

### US-037: Recently Incorrect Practice

As a user, I want a practice list of my recent misses so that I can improve.

- [ ] Auto-generates list after each quiz
- [ ] Start Practice uses explanation-first flow
- [ ] Tracks improvement over time
- E2E: US-037

### US-038: Rate Limit Handling

As a user, I want the app to handle rate limits so that I can retry safely.

- [ ] On 429, show retry-after countdown
- [ ] Automatically retries after window
- [ ] Manual retry button provided
- E2E: US-038

### US-039: Cache & ETag Handling

As a user, I want the app to be fast so that repeated fetches are optimized.

- [ ] Uses ETag for certain endpoints
- [ ] 304 Not Modified path verified
- [ ] UI indicates cached data
- E2E: US-039

### US-040: Login Persistence

As a user, I want to stay logged in so that I don’t re-enter credentials.

- [ ] Session persists across restarts (within policy)
- [ ] Token refresh transparent
- [ ] Secure storage used
- E2E: US-040

### US-041: Logout Everywhere

As a user, I want to log out so that my account is safe.

- [ ] Logout clears tokens and sensitive caches
- [ ] Redirect to login
- [ ] Session invalidated server-side when applicable
- E2E: US-041

### US-042: Password Reset Flow

As a user who forgot the password, I want to reset it so that I can regain access.

- [ ] Request reset email
- [ ] Link expiry enforced
- [ ] Post-reset, all sessions invalidated
- E2E: US-042

### US-043: Profile Privacy Controls

As a user, I want privacy settings so that I control visibility.

- [ ] Toggle profile visibility
- [ ] Leaderboard opt-out
- [ ] Settings reflected across UI
- E2E: US-043

### US-044: Notifications Preferences

As a user, I want fine-grained notification control so that I only get relevant pings.

- [ ] Daily goal reminders toggle
- [ ] Achievement notifications toggle
- [ ] Respect OS-level permissions
- E2E: US-044

### US-045: Session Timeout Handling

As a user, I want a smooth session timeout so that I can re-auth without losing context.

- [ ] Idle timeout triggers gentle re-auth modal
- [ ] After re-auth, return to current screen
- [ ] Cancel returns to login
- E2E: US-045

### US-046: Visual Regression Stability (Key Screens)

As a developer, I want visual snapshots so that UI regressions are caught.

- [ ] Snapshot: Home, Categories, Quiz, Results
- [ ] Stable masks for dynamic parts
- [ ] Snapshots updated via controlled command
- E2E: US-046

### US-047: Performance Budget (Quiz Start)

As a user, I want quick quiz start so that I stay engaged.

- [ ] TTI < 2s for Quiz screen under default mocks
- [ ] No long tasks > 200ms on start
- [ ] Lazy-load heavy assets
- E2E: US-047

### US-048: Error Boundary on Quiz Screen

As a user, I want crashes contained so that I can continue.

- [ ] Quiz screen wrapped by error boundary
- [ ] “Retry” re-initializes state
- [ ] Error telemetry captured
- E2E: US-048

### US-049: Export My Data (GDPR)

As a user, I want to export my data so that I can retain a copy.

- [ ] Request export creates a job
- [ ] Email sent with link when ready
- [ ] Export format documented (JSON/CSV)
- E2E: US-049

### US-050: Delete Account

As a user, I want to delete my account so that I can remove my data.

- [ ] Delete flow requires confirmation
- [ ] Account removed and sessions invalidated
- [ ] Irreversible notice displayed
- E2E: US-050
