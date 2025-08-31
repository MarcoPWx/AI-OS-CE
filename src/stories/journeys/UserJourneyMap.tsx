import React, { useState } from 'react';

interface JourneyStage {
  id: string;
  name: string;
  duration: string;
  conversion: number;
  dropoff: number;
  actions: string[];
}

export const UserJourneyMap: React.FC = () => {
  const [selectedJourney, setSelectedJourney] = useState<'onboarding' | 'daily' | 'competitive'>(
    'onboarding',
  );

  const onboardingStages: JourneyStage[] = [
    {
      id: 'landing',
      name: 'Landing Page',
      duration: '0-30s',
      conversion: 100,
      dropoff: 0,
      actions: ['View hero', 'Watch video', 'Click CTA'],
    },
    {
      id: 'registration',
      name: 'Registration',
      duration: '30s-2m',
      conversion: 45,
      dropoff: 55,
      actions: ['Enter email', 'Create password', 'Accept terms'],
    },
    {
      id: 'verification',
      name: 'Email Verification',
      duration: '2-5m',
      conversion: 38,
      dropoff: 7,
      actions: ['Check email', 'Click link', 'Verify account'],
    },
    {
      id: 'profile',
      name: 'Profile Setup',
      duration: '1-2m',
      conversion: 32,
      dropoff: 6,
      actions: ['Add username', 'Select interests', 'Set preferences'],
    },
    {
      id: 'tutorial',
      name: 'First Quiz',
      duration: '3-5m',
      conversion: 28,
      dropoff: 4,
      actions: ['Start tutorial', 'Answer questions', 'See results'],
    },
    {
      id: 'complete',
      name: 'Onboarded',
      duration: '10m total',
      conversion: 28,
      dropoff: 0,
      actions: ['Dashboard access', 'First achievement', 'Quest assigned'],
    },
  ];

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Journey Analytics</h1>
          <p className="text-gray-600 mt-2">Track user progression through key flows</p>
        </div>

        {/* Journey Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSelectedJourney('onboarding')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedJourney === 'onboarding'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Onboarding Journey
          </button>
          <button
            onClick={() => setSelectedJourney('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedJourney === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Daily Active User
          </button>
          <button
            onClick={() => setSelectedJourney('competitive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedJourney === 'competitive'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Competitive Player
          </button>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            {onboardingStages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <div className="flex items-center space-x-4">
                  {/* Stage Number */}
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        <p className="text-sm text-gray-500">{stage.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-2xl ${getConversionColor(stage.conversion)}`}>
                          {stage.conversion}%
                        </p>
                        {stage.dropoff > 0 && (
                          <p className="text-sm text-red-500">-{stage.dropoff}% drop</p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${stage.conversion}%` }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stage.actions.map((action) => (
                        <span
                          key={action}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < onboardingStages.length - 1 && (
                  <div className="ml-5 h-8 w-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Total Visitors</p>
            <p className="text-2xl font-bold text-gray-900">12,456</p>
            <p className="text-xs text-green-600 mt-1">↑ 23% from last week</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">28%</p>
            <p className="text-xs text-green-600 mt-1">↑ 3% from last week</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Avg. Time to Convert</p>
            <p className="text-2xl font-bold text-gray-900">8.5 min</p>
            <p className="text-xs text-red-600 mt-1">↑ 1.2 min from last week</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Day 1 Retention</p>
            <p className="text-2xl font-bold text-gray-900">65%</p>
            <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Segments Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Segment</th>
                  <th className="text-center py-2 px-4">Users</th>
                  <th className="text-center py-2 px-4">Conversion</th>
                  <th className="text-center py-2 px-4">Avg. Session</th>
                  <th className="text-center py-2 px-4">Retention</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Organic Search</td>
                  <td className="text-center py-3 px-4">4,521</td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">35%</td>
                  <td className="text-center py-3 px-4">12m 30s</td>
                  <td className="text-center py-3 px-4">72%</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Social Media</td>
                  <td className="text-center py-3 px-4">3,234</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-medium">22%</td>
                  <td className="text-center py-3 px-4">8m 15s</td>
                  <td className="text-center py-3 px-4">58%</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Paid Ads</td>
                  <td className="text-center py-3 px-4">2,890</td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">42%</td>
                  <td className="text-center py-3 px-4">15m 45s</td>
                  <td className="text-center py-3 px-4">68%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Referral</td>
                  <td className="text-center py-3 px-4">1,811</td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">48%</td>
                  <td className="text-center py-3 px-4">18m 20s</td>
                  <td className="text-center py-3 px-4">81%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
