import type { Meta, StoryObj } from '@storybook/react';
import { EpicDashboard } from './EpicDashboard';

const meta: Meta<typeof EpicDashboard> = {
  title: 'Project Management/Epic Dashboard',
  component: EpicDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Epic Status Dashboard

A comprehensive project management dashboard showing the status of all major QuizMentor epics.

### Features:
- **Real-time Progress Tracking**: Visual progress bars for each epic
- **Risk Assessment**: Color-coded risk indicators
- **Deliverables Tracking**: Check-marked completed items
- **Next Steps Planning**: Clear action items for each epic
- **Quick Actions**: Direct links to common tasks

### Current Epics (Updated 2025-08-29):

1. **Security Foundation (80% Complete)** ✅
   - JWT Authentication ✅
   - Rate Limiting ✅
   - Security Headers ✅
   - OWASP Compliance ✅
   - Security Playground ✅
   - Audit Logging 🔄 (60%)
   - Biometric Auth 📋
   - Encryption at Rest 📋

2. **Gamification & Engagement (75% Complete)** ✅
   - XP & Level System ✅ (Clean code refactored)
   - Achievement Engine ✅ (9 achievements)
   - Streak Tracking ✅ (with bonuses)
   - Quest System ✅ (7 quest types)
   - Reward Distributor ✅
   - Tests: 28/33 passing (85%) ✅
   - Leaderboards 🔄
   - Battle Mode 📋

3. **S2S Orchestration (25% Complete)**
   - Service Architecture ✅
   - Event Bus 🔄
   - Service Discovery 📋
   - Circuit Breakers 📋
   - Distributed Tracing 📋
   - Message Queuing 📋

4. **User Journey Optimization (70% Complete)**
   - Onboarding Flow ✅
   - Quiz Flow ✅
   - Navigation ✅
   - Social Features 🔄
   - Personalization 📋
   - A/B Testing 📋

5. **Real-time Features (15% Complete)**
   - WebSocket Server 📋
   - Live Scoring 📋
   - Notifications 📋
   - Multiplayer 📋
   - Presence System 📋
   - Chat 📋

### Usage Notes:
- Click on any epic card to view detailed information
- Use Quick Actions for common tasks
- Monitor risk levels for early intervention
- Track overall project progress at the top
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Full Dashboard',
};

export const SecurityFocused: Story = {
  name: 'Security Epic Focus',
  parameters: {
    docs: {
      description: {
        story: `
### Security Foundation Epic

The security epic is currently at 80% completion with low risk status.

#### Completed:
- JWT authentication with refresh tokens
- Rate limiting with Redis
- Security headers (CSP, HSTS, etc.)
- OWASP Top 10 compliance

#### In Progress:
- Comprehensive audit logging system

#### Planned:
- Biometric authentication (Face ID, Touch ID)
- Dependabot integration
- Encryption at rest for sensitive data

#### Quick Actions:
- Run automated security scan
- Review OWASP checklist
- Test rate limiting
- Audit JWT implementation
        `,
      },
    },
  },
};

export const GamificationJourney: Story = {
  name: 'Gamification & S2S Integration',
  parameters: {
    docs: {
      description: {
        story: `
### Gamification Journey with S2S Orchestration

This view highlights the integration between gamification features and service-to-service communication.

#### User Journey Flows:

**Onboarding (0-5 minutes)**
- Profile creation → 50 XP bonus
- First quiz selection → Quest tracking
- Quiz completion → Achievement check

**Daily Engagement Loop**
- 6 AM: Streak warning notification
- 12 PM: Lunch break quiz prompt with 2x XP
- 6 PM: Friend activity updates
- 9 PM: Final streak reminder

**Competitive Mode**
- Real-time matchmaking
- WebSocket connections
- Live scoring updates
- Post-match achievements

#### S2S Communication Patterns:
- Event-driven architecture
- Service mesh for discovery
- Circuit breakers for resilience
- Distributed tracing for debugging

#### Engagement Mechanics:
- Variable reward schedules (slot machine)
- Mystery boxes (10% drop rate)
- FOMO events (flash challenges)
- Loss aversion (streak protection)
        `,
      },
    },
  },
};

export const RiskManagement: Story = {
  name: 'Risk Assessment View',
  parameters: {
    docs: {
      description: {
        story: `
### Risk Management Overview

Monitor and manage risks across all epics:

#### High Risk Epics:
1. **S2S Orchestration** - Complex distributed system
2. **Real-time Features** - Infrastructure challenges

#### Medium Risk:
1. **Gamification** - User adoption uncertainty

#### Low Risk:
1. **Security Foundation** - Well-defined requirements
2. **User Journey** - Clear user research

#### Mitigation Strategies:
- Early prototyping for high-risk items
- Incremental rollout with feature flags
- Comprehensive testing at each phase
- Regular stakeholder reviews
- Fallback plans for critical features
        `,
      },
    },
  },
};

export const NextSteps: Story = {
  name: 'Action Items & Planning',
  parameters: {
    docs: {
      description: {
        story: `
### Immediate Action Items

#### Week 1 Priorities:
1. Complete audit logging implementation
2. Set up RabbitMQ for event bus
3. Implement daily quest generation
4. Deploy smart notification system
5. Choose WebSocket framework

#### Week 2 Focus:
1. Add Dependabot scanning
2. Create service mesh
3. Build variable reward system
4. Add ML personalization models
5. Design room management system

#### Week 3-4 Goals:
1. Biometric authentication
2. Distributed tracing setup
3. Competitive matchmaking
4. A/B testing framework
5. Presence tracking system

#### Success Metrics:
- 40% DAU/MAU ratio
- 25% D7 retention
- 12 min average session
- 5 quizzes per session
- 80% achievement unlock rate
        `,
      },
    },
  },
};
