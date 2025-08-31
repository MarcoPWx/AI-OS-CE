> Status: Current
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.1

# Enhanced Features Runbook

## Overview

This runbook covers the operation and maintenance of QuizMentor's enhanced features, including advanced animations, trust-first UX, ecosystem integration, and multiplayer functionality.

## Enhanced UX Features

### Trust-First Design System

#### HomeScreenEnhanced

**Location**: `src/screens/HomeScreenEnhanced.tsx`

**Features**:

- Particle background system with 12 floating particles
- Trust-building stats section with social proof
- Staggered card animations with shimmer effects
- Breathing animations for focus enhancement
- Blur effects and gradient masking

**Monitoring**:

```bash
# Check animation performance
# Look for frame drops in React DevTools Profiler
# Monitor memory usage during particle animations
```

**Troubleshooting**:

- **Slow animations**: Check if native driver is enabled
- **Memory leaks**: Verify particle cleanup on unmount
- **Performance issues**: Reduce particle count or disable on low-end devices

#### Enhanced Quiz Flow

**Location**: `src/screens/QuizScreenFrictionless.tsx`

**Enhancements**:

- Success animations with spring physics
- Error shake feedback
- Answer glow effects
- Progress pulse animations
- Card elevation dynamics

**Configuration**:

```typescript
// Animation timing constants
const ANIMATION_DURATION = {
  success: 300,
  error: 200,
  glow: 2000,
  pulse: 1000,
};
```

### Trust-Based Gamification

#### Enhanced Gamification Service

**Location**: `src/services/enhancedGamification.ts`

**Key Features**:

- Trust score calculation (0-1 scale)
- Motivation state detection (exploring, focused, struggling, mastering)
- Adaptive feedback based on psychological state
- Variable reward patterns for engagement

**Monitoring Commands**:

```bash
# Check trust metrics
curl -X GET /api/analytics/trust-metrics

# Monitor motivation states
curl -X GET /api/analytics/motivation-distribution

# Review achievement unlock rates
curl -X GET /api/analytics/achievements
```

**Trust Score Calculation**:

```typescript
// Trust builds through:
// - Consistency (regular usage)
// - Appropriate difficulty matching
// - Honest interaction patterns
// - Achievement progression
```

### Ecosystem Integration

#### EcosystemWidget

**Location**: `src/components/EcosystemWidget.tsx`

**Features**:

- Cross-product promotion for DevMentor, Harvest.ai, Omni
- Animated expand/collapse with particle effects
- Position configuration (bottom-right default)
- Theme adaptation (light/dark)
- Persistent minimization state

**Configuration**:

```typescript
<EcosystemWidget
  currentProduct="quizmentor"
  position="bottom-right"
  theme="dark"
/>
```

**Monitoring**:

- Track widget interaction rates
- Monitor cross-product conversion
- Analyze minimization patterns

## Multiplayer Features

### WebSocket Service

**Location**: `src/services/multiplayerService.ts`

**Capabilities**:

- Real-time room management
- Live quiz synchronization
- Player state tracking
- Connection resilience

**Health Checks**:

```bash
# Check WebSocket server status
curl -X GET /api/multiplayer/health

# Monitor active rooms
curl -X GET /api/multiplayer/rooms/active

# Check connection metrics
curl -X GET /api/multiplayer/metrics
```

### Multiplayer Lobby

**Location**: `src/screens/MultiplayerLobbyScreen.tsx`

**Features**:

- Room creation and filtering
- Real-time player updates
- Game mode selection
- Category filtering

**Troubleshooting**:

- **Connection issues**: Check WebSocket server status
- **Room sync problems**: Verify Redis connection
- **Performance lag**: Monitor server load and optimize

## Development Tools

### Mock Authentication

**Location**: `src/services/mockAuth.ts`

**Usage**:

```typescript
// Quick development login
await MockAuthService.signIn();

// Access mock user data
const user = MockAuthService.getCurrentUser();
```

**Configuration**:

- Enabled only in development mode
- Provides realistic user data for testing
- Integrates with all authentication flows

### Performance Monitoring

**Location**: `src/services/performanceMonitor.ts`

**Metrics Tracked**:

- Frame rate (target: 60fps)
- Memory usage (target: <150MB)
- Network request timing
- Component render performance

**Dashboard Access**:

```bash
# View performance dashboard
http://localhost:3002/performance-dashboard

# Export performance data
curl -X GET /api/performance/export
```

## Deployment Procedures

### Development Server

```bash
# Start on port 3002
npm start -- --port 3002

# With performance profiling
npm start -- --port 3002 --profile

# With debugging enabled
npm start -- --port 3002 --debug
```

### Build Configuration

**File**: `app.config.js`

## Unified Mocks & Storybook Validation

- HTTP mocks (web/tests): MSW via msw-storybook-addon (Storybook) and node server (tests)
- HTTP mocks (RN): MockEngine intercepts global fetch when USE_MOCKS=true
- WebSocket mocks: MockWebSocket with runtime scenarios

Environment flags

- USE_MOCKS=true — enable RN MockEngine and WS mocks
- EXPO_PUBLIC_USE_MSW=1 — enable MSW in web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — enable WS mocks
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — convenience for web demos (HTTP + WS)
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive

Storybook (web)

```bash
npm run storybook
# Open http://localhost:7007
# Docs pages:
#  - Docs/Mocking & Scenarios
#  - Docs/Stories How-To
#  - Docs/Tech Stack + API
#  - Docs/Quick Index
# Interactive stories:
#  - API/Playground (HTTP): try TRIGGER_RATE_LIMIT, TRIGGER_ERROR, TRIGGER_CACHED
#  - API/Swagger (OpenAPI)
#  - Live/TaskBoard (WS): defaults to wsScenario=taskBoardLive
#  - Dev/NetworkPlayground (HTTP timeline, presets, x-msw-no-defaults toggle)
```

Notes

- MSW Profile toolbar controls global latency/error defaults; the Defaults chip displays current values in many stories
- To bypass MSW defaults on a specific request, send header x-msw-no-defaults: 1 (available as a toggle in API/Playground and NetworkPlayground)

Test Runner and Visuals

```bash
# Interaction tests
npm run test:stories

# Visual regression
export CHROMATIC_PROJECT_TOKEN={{CHROMATIC_PROJECT_TOKEN}}
npm run chromatic
```

**Key Settings**:

- iOS deployment target: 15.1+
- Android min SDK: 23
- Expo SDK: 53
- Build properties optimized for performance

### Environment Variables

```bash
# Required for enhanced features
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Optional for analytics
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Monitoring & Alerts

### Performance Thresholds

```yaml
Critical:
  - Frame rate < 30fps for >5 seconds
  - Memory usage > 200MB
  - Trust score < 0.3
  - Animation lag > 100ms

Warning:
  - Frame rate < 50fps
  - Memory usage > 150MB
  - Trust score < 0.6
  - Load time > 3 seconds
```

### Analytics Events

```typescript
// Key events to monitor
'trust_score_updated';
'motivation_state_changed';
'ecosystem_widget_interaction';
'multiplayer_room_joined';
'animation_performance_issue';
```

## Troubleshooting Guide

### Common Issues

#### Animation Performance

**Symptoms**: Choppy animations, frame drops
**Solutions**:

1. Check native driver usage: `useNativeDriver: true`
2. Reduce particle count for low-end devices
3. Optimize animation timing and easing
4. Monitor memory usage during animations

#### Trust Score Issues

**Symptoms**: Unexpected trust score changes
**Solutions**:

1. Review trust calculation algorithm
2. Check for data inconsistencies
3. Verify user behavior tracking
4. Analyze trust score distribution

#### Ecosystem Widget Problems

**Symptoms**: Widget not appearing, interaction issues
**Solutions**:

1. Check position configuration
2. Verify theme compatibility
3. Test on different screen sizes
4. Review z-index conflicts

#### Multiplayer Connectivity

**Symptoms**: Connection drops, sync issues
**Solutions**:

1. Check WebSocket server health
2. Verify network connectivity
3. Review Redis connection status
4. Monitor server resource usage

### Emergency Procedures

#### Performance Degradation

1. Enable performance monitoring dashboard
2. Identify bottleneck components
3. Temporarily disable non-critical animations
4. Scale server resources if needed

#### Trust System Failure

1. Switch to fallback feedback system
2. Log all trust-related events
3. Notify development team immediately
4. Prepare trust score recalculation

#### Multiplayer Outage

1. Display maintenance message
2. Redirect users to single-player mode
3. Check WebSocket server status
4. Verify database connectivity

## Maintenance Tasks

### Daily

- [ ] Review performance metrics
- [ ] Check trust score distribution
- [ ] Monitor animation frame rates
- [ ] Verify ecosystem widget interactions

### Weekly

- [ ] Analyze user journey patterns
- [ ] Review multiplayer engagement
- [ ] Update trust algorithm parameters
- [ ] Performance optimization review

### Monthly

- [ ] Trust system effectiveness analysis
- [ ] Animation performance audit
- [ ] Ecosystem integration metrics review
- [ ] User feedback incorporation

## Contact Information

**Development Team**: QuizMentor Developers
**On-Call**: Available 24/7 for critical issues
**Escalation**: Product Owner for trust system issues

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Review Cycle**: Weekly
