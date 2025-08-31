import React, { useState } from 'react';
import {
  Trophy,
  Shield,
  Users,
  Gamepad2,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface Epic {
  id: string;
  title: string;
  owner: string;
  status: 'planning' | 'in-progress' | 'testing' | 'completed';
  progress: number;
  risk: 'low' | 'medium' | 'high';
  description: string;
  deliverables: string[];
  nextSteps: string[];
  icon: React.ReactNode;
  color: string;
}

const epics: Epic[] = [
  {
    id: 'security',
    title: 'Security Foundation',
    owner: 'Security Team',
    status: 'in-progress',
    progress: 80,
    risk: 'low',
    description: 'Comprehensive security infrastructure with JWT, rate limiting, and monitoring',
    deliverables: [
      '✅ JWT Authentication implemented',
      '✅ Rate limiting configured',
      '✅ Security headers added',
      '✅ OWASP compliance checked',
      '✅ Security Playground in Storybook',
      '🔄 Audit logging (60% done)',
      '📋 Biometric auth (not started)',
      '📋 Encryption at rest (planned)',
    ],
    nextSteps: [
      'Complete audit logging with S2S integration',
      'Add Dependabot configuration',
      'Implement biometric authentication wrapper',
      'Set up data encryption at rest',
    ],
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-green-500',
  },
  {
    id: 'gamification',
    title: 'Gamification & Engagement',
    owner: 'Product Team',
    status: 'in-progress',
    progress: 75,
    risk: 'low',
    description: 'Complete gamification system with clean architecture and 85% test pass rate',
    deliverables: [
      '✅ XP & Level system (clean code refactored)',
      '✅ Achievement engine (9 achievements)',
      '✅ Streak tracking with bonuses',
      '✅ Quest system (7 quest types)',
      '✅ Reward distributor',
      '✅ 28/33 tests passing (85%)',
      '🔄 Leaderboards (basic done)',
      '📋 Battle mode (not started)',
    ],
    nextSteps: [
      'Fix 5 remaining test failures',
      'Add real-time leaderboard updates',
      'Implement mystery box animations',
      'Create battle mode matchmaking',
    ],
    icon: <Trophy className="w-5 h-5" />,
    color: 'bg-yellow-500',
  },
  {
    id: 's2s-orchestration',
    title: 'S2S Orchestration',
    owner: 'Backend Team',
    status: 'planning',
    progress: 25,
    risk: 'high',
    description: 'Service-to-service communication and event-driven architecture',
    deliverables: [
      '✅ Service architecture designed',
      '🔄 Event bus implementation',
      '📋 Service discovery',
      '📋 Circuit breakers',
      '📋 Distributed tracing',
      '📋 Message queuing',
    ],
    nextSteps: [
      'Set up RabbitMQ/Kafka',
      'Implement service mesh',
      'Add distributed tracing',
      'Create orchestration patterns',
    ],
    icon: <Activity className="w-5 h-5" />,
    color: 'bg-purple-500',
  },
  {
    id: 'user-journey',
    title: 'User Journey Optimization',
    owner: 'UX Team',
    status: 'in-progress',
    progress: 70,
    risk: 'low',
    description: 'Optimized user flows from onboarding to daily engagement',
    deliverables: [
      '✅ Onboarding flow designed',
      '✅ Quiz flow optimized',
      '✅ Navigation structure',
      '🔄 Social features',
      '📋 Personalization engine',
      '📋 A/B testing framework',
    ],
    nextSteps: [
      'Implement smart notifications',
      'Add personalization ML models',
      'Create engagement analytics',
      'Design retention campaigns',
    ],
    icon: <Users className="w-5 h-5" />,
    color: 'bg-blue-500',
  },
  {
    id: 'real-time',
    title: 'Real-time Features',
    owner: 'Infrastructure Team',
    status: 'planning',
    progress: 15,
    risk: 'high',
    description: 'WebSocket infrastructure for live features and notifications',
    deliverables: [
      '📋 WebSocket server setup',
      '📋 Real-time scoring',
      '📋 Live notifications',
      '📋 Multiplayer rooms',
      '📋 Presence system',
      '📋 Chat functionality',
    ],
    nextSteps: [
      'Choose WebSocket framework',
      'Design room management',
      'Implement presence tracking',
      'Create notification channels',
    ],
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-orange-500',
  },
];

export const EpicDashboard: React.FC = () => {
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'testing':
        return 'text-purple-600';
      case 'planning':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuizMentor Epic Dashboard</h1>
          <p className="text-gray-600">Track project progress across all major initiatives</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Progress</p>
                <p className="text-2xl font-bold text-gray-900">53%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Epics</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deliverables</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Epic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {epics.map((epic) => (
            <div
              key={epic.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEpic(epic)}
            >
              <div className="p-6">
                {/* Epic Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${epic.color} p-2 rounded-lg text-white`}>{epic.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{epic.title}</h3>
                      <p className="text-sm text-gray-500">{epic.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(epic.risk)}`}
                    >
                      {epic.risk} risk
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{epic.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{epic.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${epic.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${epic.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getStatusColor(epic.status)}`}>
                    {epic.status.charAt(0).toUpperCase() + epic.status.slice(1).replace('-', ' ')}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5" />
              Run Security Scan
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <BookOpen className="w-5 h-5" />
              View Documentation
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Gamepad2 className="w-5 h-5" />
              Test Gamification
            </button>
          </div>
        </div>
      </div>

      {/* Epic Detail Modal */}
      {selectedEpic && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEpic(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${selectedEpic.color} p-3 rounded-lg text-white`}>
                    {selectedEpic.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEpic.title}</h2>
                    <p className="text-gray-500">{selectedEpic.owner}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEpic(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Deliverables */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deliverables</h3>
                <div className="space-y-2">
                  {selectedEpic.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                <div className="space-y-2">
                  {selectedEpic.nextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span className="text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View in Detail
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpicDashboard;
