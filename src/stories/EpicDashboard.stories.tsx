/* Removed story. Consolidated into a single Epic Manager page. */
// Keep a minimal default export so Storybook indexer does not error on missing default export.
const removedEpicDashboardMeta = {
  title: 'Deprecated/EpicDashboard (removed)',
  parameters: { docs: { description: { component: 'This story was removed; see Project Management/Epic Dashboard.' } } },
  tags: ['hidden'],
};
export default removedEpicDashboardMeta;

interface Epic {
  id: string;
  name: string;
  status: number;
  state: 'complete' | 'in-progress' | 'planned' | 'blocked';
  owner: string;
  eta: string;
  risks: 'low' | 'medium' | 'high';
  description: string;
  deliverables: string[];
  nextSteps?: string[];
}

const epics: Epic[] = [
  // COMPLETED EPICS
  {
    id: 'auth',
    name: 'Authentication & OAuth',
    status: 100,
    state: 'complete',
    owner: 'Core Team',
    eta: 'Complete',
    risks: 'low',
    description: 'Mock-first authentication with MSW, ready for production migration',
    deliverables: [
      '✅ AuthContext for React integration',
      '✅ GitHub OAuth flow',
      '✅ Email/password authentication',
      '✅ Session management with auto-refresh',
      '✅ JWT validation on protected endpoints',
      '✅ Complete documentation',
    ],
  },
  {
    id: 'mock-first',
    name: 'Mock-First Development',
    status: 100,
    state: 'complete',
    owner: 'Platform Team',
    eta: 'Complete',
    risks: 'low',
    description: 'Comprehensive mocking infrastructure with MSW',
    deliverables: [
      '✅ MSW integration for all APIs',
      '✅ WebSocket mocking',
      '✅ Storybook MSW addon',
      '✅ Mock data fixtures',
      '✅ Environment configuration',
      '✅ Request logging tools',
      '✅ Mock-to-real patterns',
      '✅ E2E mock validation',
    ],
  },
  // IN PROGRESS EPICS
  {
    id: 'security',
    name: 'Security Foundation',
    status: 80,
    state: 'in-progress',
    owner: 'Security Team',
    eta: 'Sprint 2',
    risks: 'low',
    description: 'Comprehensive security implementation following Storybook-first TDD',
    deliverables: [
      '✅ Security Playground in Storybook',
      '✅ JWT validation with expiry detection',
      '✅ CSRF protection patterns',
      '✅ Rate limiting (3 req/10s)',
      '✅ Input validation with Zod',
      '✅ XSS prevention with DOMPurify',
      '✅ CI/CD security pipeline',
      '✅ Security audit documentation',
    ],
    nextSteps: [
      '⏳ Implement security headers',
      '⏳ Add audit logging system',
      '📋 Set up Dependabot',
      '📋 Biometric authentication',
      '📋 Encryption at rest',
    ],
  },
  {
    id: 'storybook',
    name: 'Storybook Infrastructure',
    status: 90,
    state: 'in-progress',
    owner: 'Platform Team',
    eta: 'This Sprint',
    risks: 'low',
    description: 'Interactive component development and testing environment',
    deliverables: [
      '✅ Storybook 8.6 setup',
      '✅ MSW integration',
      '✅ API Playground',
      '✅ Security Playground',
      '✅ Epic Dashboard',
      '✅ Chromatic integration',
      '✅ S2S Dashboard component',
      '✅ User Journey Map analytics',
      '✅ E2E Test Dashboard',
      '⏳ MDX v3 documentation',
      '⏳ Component catalog',
    ],
    nextSteps: ['⏳ Design tokens visualization', '⏳ Complete component coverage'],
  },
  {
    id: 'docs',
    name: 'Documentation & DX',
    status: 75,
    state: 'in-progress',
    owner: 'Docs Team',
    eta: 'This Sprint',
    risks: 'low',
    description: 'Comprehensive documentation and developer experience',
    deliverables: [
      '✅ API documentation',
      '✅ User journeys',
      '✅ Design system guide',
      '✅ Setup guides',
      '✅ Architecture diagrams',
      '⏳ MDX v3 migration',
      '⏳ Video tutorials',
      '⏳ Contribution guide',
    ],
  },
  {
    id: 'gamification',
    name: 'Gamification & Questions',
    status: 75,
    state: 'in-progress',
    owner: 'Product Team',
    eta: 'This Sprint',
    risks: 'low',
    description: 'Quiz experience with scoring, achievements, and celebrations',
    deliverables: [
      '✅ Scoring system with combos',
      '✅ Celebration effects',
      '✅ Question delivery service',
      '✅ Offline fallback',
      '⏳ XP/levels persistence',
      '⏳ Achievements UI',
    ],
  },
  {
    id: 'testing',
    name: 'Testing & QA',
    status: 70,
    state: 'in-progress',
    owner: 'QE Team',
    eta: 'Next Sprint',
    risks: 'medium',
    description: 'Comprehensive testing infrastructure with Storybook integration',
    deliverables: [
      '✅ Mock-first E2E tests',
      '✅ S2S Orchestration tests',
      '✅ Storybook/MSW integration',
      '✅ Playwright tests',
      '⏳ Unit test fixes',
      '⏳ Visual regression tests',
    ],
  },
  {
    id: 'backend',
    name: 'Backend/API Foundation',
    status: 40,
    state: 'in-progress',
    owner: 'Backend Team',
    eta: 'Sprint 3',
    risks: 'medium',
    description: 'API implementation with Supabase integration',
    deliverables: [
      '✅ Supabase client setup',
      '✅ Database schema',
      '✅ API route stubs',
      '⏳ Database deployment',
      '⏳ Real API implementation',
      '⏳ WebSocket server',
      '⏳ File storage',
    ],
    nextSteps: ['⏳ Deploy database', '⏳ Connect real endpoints', '⏳ Email service'],
  },
  {
    id: 'analytics',
    name: 'Analytics & Telemetry',
    status: 35,
    state: 'in-progress',
    owner: 'Data Team',
    eta: 'Sprint 3',
    risks: 'low',
    description: 'User behavior tracking and performance monitoring',
    deliverables: [
      '✅ Analytics service interface',
      '✅ Event definitions',
      '✅ Mock implementation',
      '⏳ Provider integration',
      '⏳ Custom dashboard',
      '⏳ Error tracking (Sentry)',
    ],
  },
  // PLANNED EPICS
  {
    id: 'performance',
    name: 'Performance & Bundling',
    status: 0,
    state: 'planned',
    owner: 'Core Team',
    eta: 'Sprint 3',
    risks: 'medium',
    description: 'Bundle optimization and performance improvements',
    deliverables: [
      '📋 Bundle analysis',
      '📋 Code splitting',
      '📋 Lazy loading',
      '📋 Image optimization',
      '📋 Cache strategies',
      '📋 Performance budgets',
      '📋 Lighthouse CI',
    ],
  },
  {
    id: 'a11y',
    name: 'Accessibility (A11y)',
    status: 15,
    state: 'planned',
    owner: 'UX Team',
    eta: 'Sprint 4',
    risks: 'medium',
    description: 'WCAG 2.1 AA compliance and accessibility features',
    deliverables: [
      '✅ Basic ARIA labels',
      '✅ Keyboard nav (partial)',
      '📋 Screen reader support',
      '📋 High contrast mode',
      '📋 Focus management',
      '📋 Touch targets',
      '📋 Color contrast',
      '📋 A11y testing',
    ],
  },
  {
    id: 'production',
    name: 'Production Deployment',
    status: 20,
    state: 'planned',
    owner: 'DevOps Team',
    eta: 'Sprint 4',
    risks: 'high',
    description: 'Production infrastructure and deployment pipeline',
    deliverables: [
      '✅ Environment config',
      '✅ Basic CI/CD',
      '📋 Production infra',
      '📋 Monitoring setup',
      '📋 Backup strategies',
      '📋 Blue-green deploy',
      '📋 App store deploy',
      '📋 CDN configuration',
    ],
  },
];

function EpicCard({ epic }: { epic: Epic }) {
  const getStateColor = () => {
    switch (epic.state) {
      case 'complete':
        return '#4ade80';
      case 'in-progress':
        return '#60a5fa';
      case 'planned':
        return '#a78bfa';
      case 'blocked':
        return '#f87171';
      default:
        return '#94a3b8';
    }
  };

  const getRiskColor = () => {
    switch (epic.risks) {
      case 'low':
        return '#4ade80';
      case 'medium':
        return '#fbbf24';
      case 'high':
        return '#f87171';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div
      style={{
        border: '1px solid #374151',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: epic.state === 'complete' ? 'rgba(74, 222, 128, 0.05)' : 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#f3f4f6' }}>{epic.name}</h3>
          <p style={{ margin: '4px 0', fontSize: 14, color: '#9ca3af' }}>{epic.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              background: getStateColor() + '20',
              color: getStateColor(),
              fontWeight: 600,
            }}
          >
            {epic.state.toUpperCase()}
          </span>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              background: getRiskColor() + '20',
              color: getRiskColor(),
            }}
          >
            Risk: {epic.risks}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Progress</span>
          <span style={{ fontSize: 12, color: '#f3f4f6', fontWeight: 600 }}>{epic.status}%</span>
        </div>
        <div
          style={{
            height: 8,
            background: '#1f2937',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${epic.status}%`,
              height: '100%',
              background: getStateColor(),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
        <div>
          <strong style={{ color: '#9ca3af' }}>Owner:</strong> {epic.owner}
        </div>
        <div>
          <strong style={{ color: '#9ca3af' }}>ETA:</strong> {epic.eta}
        </div>
      </div>

      {epic.deliverables.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', color: '#60a5fa', fontSize: 14 }}>
            Deliverables ({epic.deliverables.filter((d) => d.startsWith('✅')).length}/
            {epic.deliverables.length})
          </summary>
          <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 13 }}>
            {epic.deliverables.map((item, idx) => (
              <li key={idx} style={{ color: item.startsWith('✅') ? '#4ade80' : '#9ca3af' }}>
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}

      {epic.nextSteps && epic.nextSteps.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', color: '#fbbf24', fontSize: 14 }}>
            Next Steps ({epic.nextSteps.length})
          </summary>
          <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 13 }}>
            {epic.nextSteps.map((item, idx) => (
              <li key={idx} style={{ color: '#fbbf24' }}>
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function EpicDashboard() {
  const completedEpics = epics.filter((e) => e.state === 'complete');
  const inProgressEpics = epics.filter((e) => e.state === 'in-progress');
  const plannedEpics = epics.filter((e) => e.state === 'planned');

  const overallProgress = Math.round(
    epics.reduce((sum, epic) => sum + epic.status, 0) / epics.length,
  );

  // Calculate additional metrics
  const epicsByPriority = {
    p0: epics.filter((e) => ['auth', 'mock-first', 'security', 'gamification'].includes(e.id)),
    p1: epics.filter((e) =>
      ['docs', 'testing', 'storybook', 'backend', 'production'].includes(e.id),
    ),
    p2: epics.filter((e) => ['analytics', 'performance', 'a11y'].includes(e.id)),
  };

  return (
    <div style={{ padding: 20, background: '#0f172a', minHeight: '100vh', color: '#f3f4f6' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ color: '#f3f4f6', marginBottom: 8 }}>
          📊 Epic Status Dashboard - All 12 Epics
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: 24 }}>
          Last Updated: 2025-08-29 | Overall Progress: {overallProgress}% | Total Epics:{' '}
          {epics.length}
        </p>

        {/* Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: 16,
              background: '#1e293b',
              borderRadius: 8,
              border: '1px solid #334155',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4ade80' }}>
              {completedEpics.length}
            </div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Completed</div>
          </div>
          <div
            style={{
              padding: 16,
              background: '#1e293b',
              borderRadius: 8,
              border: '1px solid #334155',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>
              {inProgressEpics.length}
            </div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>In Progress</div>
          </div>
          <div
            style={{
              padding: 16,
              background: '#1e293b',
              borderRadius: 8,
              border: '1px solid #334155',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>
              {plannedEpics.length}
            </div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Planned</div>
          </div>
          <div
            style={{
              padding: 16,
              background: '#1e293b',
              borderRadius: 8,
              border: '1px solid #334155',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
              {overallProgress}%
            </div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Overall Progress</div>
          </div>
        </div>

        {/* Highlight: Security Epic */}
        <div
          style={{
            padding: 20,
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(96, 165, 250, 0.1))',
            borderRadius: 12,
            border: '2px solid #4ade80',
            marginBottom: 32,
          }}
        >
          <h2 style={{ color: '#4ade80', marginBottom: 12 }}>
            🎉 Major Milestone: Security Foundation Complete!
          </h2>
          <p style={{ color: '#e2e8f0', marginBottom: 16 }}>
            We've successfully implemented a comprehensive security foundation with 80% completion.
            The Security Playground in Storybook provides interactive testing for all security
            features.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <strong style={{ color: '#60a5fa' }}>Completed:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 14 }}>
                <li>JWT Authentication & Validation</li>
                <li>CSRF Protection</li>
                <li>Rate Limiting</li>
                <li>Input Validation (Zod)</li>
                <li>XSS Prevention (DOMPurify)</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: '#fbbf24' }}>Next Phase:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 14 }}>
                <li>Security Headers</li>
                <li>Audit Logging</li>
                <li>Dependabot Setup</li>
                <li>Biometric Auth</li>
                <li>Encryption at Rest</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <a
              href="?path=/story/security-playground--default"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#4ade80',
                color: '#0f172a',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              🔒 Open Security Playground
            </a>
          </div>
        </div>

        {/* Epic Cards */}
        <div>
          <h2 style={{ color: '#f3f4f6', marginBottom: 16 }}>All Epics</h2>
          {epics.map((epic) => (
            <EpicCard key={epic.id} epic={epic} />
          ))}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: '#1e293b',
            borderRadius: 8,
            border: '1px solid #334155',
          }}
        >
          <h3 style={{ color: '#f3f4f6', marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => window.open('/docs/status/EPIC_MANAGEMENT_CURRENT.md', '_blank')}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              📄 View Epic Docs
            </button>
            <button
              onClick={() => window.open('/docs/status/SECURITY_EPIC.md', '_blank')}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              🔒 Security Roadmap
            </button>
            <button
              onClick={() => console.log('Run security check: npm run security:all')}
              style={{
                padding: '8px 16px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              🛡️ Run Security Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Labs/Epics/Epic Dashboard',
  component: EpicDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Live epic status dashboard showing progress across all major initiatives including the newly completed Security Foundation.',
      },
    },
  },
};

/* removed default export to hide story */
/* removed */

/* removed story export */

/* removed SecurityFocus block */
