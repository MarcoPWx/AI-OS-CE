import React, { useState } from 'react';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  errorRate: number;
  latency: number;
  events: number;
}

interface Event {
  id: string;
  timestamp: Date;
  service: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
}

export const S2SDashboard: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services: Service[] = [
    {
      id: 'auth',
      name: 'Auth Service',
      status: 'healthy',
      uptime: 99.99,
      errorRate: 0.01,
      latency: 45,
      events: 1250,
    },
    {
      id: 'user',
      name: 'User Service',
      status: 'healthy',
      uptime: 99.9,
      errorRate: 0.1,
      latency: 85,
      events: 890,
    },
    {
      id: 'quiz',
      name: 'Quiz Service',
      status: 'healthy',
      uptime: 99.8,
      errorRate: 0.2,
      latency: 120,
      events: 2340,
    },
    {
      id: 'gamification',
      name: 'Gamification',
      status: 'degraded',
      uptime: 98.5,
      errorRate: 1.5,
      latency: 250,
      events: 1560,
    },
    {
      id: 'notification',
      name: 'Notification',
      status: 'healthy',
      uptime: 99.5,
      errorRate: 0.5,
      latency: 150,
      events: 3200,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      status: 'healthy',
      uptime: 95.0,
      errorRate: 0.8,
      latency: 500,
      events: 5000,
    },
    {
      id: 'leaderboard',
      name: 'Leaderboard',
      status: 'healthy',
      uptime: 99.0,
      errorRate: 0.3,
      latency: 180,
      events: 780,
    },
    {
      id: 'payment',
      name: 'Payment',
      status: 'healthy',
      uptime: 99.99,
      errorRate: 0.001,
      latency: 300,
      events: 120,
    },
  ];

  const recentEvents: Event[] = [
    {
      id: '1',
      timestamp: new Date(),
      service: 'quiz',
      type: 'quiz.completed',
      severity: 'info',
      message: 'User user123 completed quiz789 with score 85',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000),
      service: 'gamification',
      type: 'achievement.unlocked',
      severity: 'info',
      message: 'User user123 unlocked "Week Warrior" achievement',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000),
      service: 'auth',
      type: 'auth.login.failed',
      severity: 'warning',
      message: 'Multiple failed login attempts from IP 10.0.0.50',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 180000),
      service: 'payment',
      type: 'payment.processed',
      severity: 'info',
      message: 'Subscription renewed for user456 - $9.99',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 240000),
      service: 'notification',
      type: 'notification.batch.sent',
      severity: 'info',
      message: 'Batch of 50 notifications delivered successfully',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'critical':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">S2S Service Mesh Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of microservices architecture</p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedService === service.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Error Rate</span>
                  <span
                    className={`font-medium ${service.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {service.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Latency</span>
                  <span className="font-medium">{service.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Events/hr</span>
                  <span className="font-medium">{service.events.toLocaleString()}</span>
                </div>
              </div>

              {/* Service Health Bar */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(service.status)}`}
                  style={{ width: `${service.uptime}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Event Stream */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}
                  >
                    {event.severity.toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{event.service}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{event.type}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{event.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Communication Map */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Service Communication Flow</h2>
          <div className="flex justify-center">
            <svg width="600" height="400" className="border rounded">
              {/* Draw service connections */}
              <line x1="100" y1="100" x2="300" y2="100" stroke="#3B82F6" strokeWidth="2" />
              <line x1="300" y1="100" x2="500" y2="100" stroke="#3B82F6" strokeWidth="2" />
              <line x1="300" y1="100" x2="300" y2="200" stroke="#3B82F6" strokeWidth="2" />
              <line x1="300" y1="200" x2="200" y2="300" stroke="#3B82F6" strokeWidth="2" />
              <line x1="300" y1="200" x2="400" y2="300" stroke="#3B82F6" strokeWidth="2" />

              {/* Service nodes */}
              <circle cx="100" cy="100" r="30" fill="#10B981" />
              <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12">
                Auth
              </text>

              <circle cx="300" cy="100" r="30" fill="#10B981" />
              <text x="300" y="105" textAnchor="middle" fill="white" fontSize="12">
                User
              </text>

              <circle cx="500" cy="100" r="30" fill="#10B981" />
              <text x="500" y="105" textAnchor="middle" fill="white" fontSize="12">
                Quiz
              </text>

              <circle cx="300" cy="200" r="35" fill="#3B82F6" />
              <text x="300" y="205" textAnchor="middle" fill="white" fontSize="12">
                Event Bus
              </text>

              <circle cx="200" cy="300" r="30" fill="#EAB308" />
              <text x="200" y="305" textAnchor="middle" fill="white" fontSize="12">
                Gamify
              </text>

              <circle cx="400" cy="300" r="30" fill="#10B981" />
              <text x="400" y="305" textAnchor="middle" fill="white" fontSize="12">
                Notify
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
