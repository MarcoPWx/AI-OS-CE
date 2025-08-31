import React, { useState } from 'react';

interface TestCase {
  id: string;
  name: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  lastRun: Date;
}

interface TestSuite {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
}

export const E2ETestDashboard: React.FC = () => {
  const [selectedSuite, setSelectedSuite] = useState<string>('all');

  const testSuites: TestSuite[] = [
    { name: 'Onboarding', total: 45, passed: 40, failed: 3, skipped: 2, coverage: 89 },
    { name: 'Daily User', total: 72, passed: 65, failed: 5, skipped: 2, coverage: 90 },
    { name: 'Competition', total: 58, passed: 50, failed: 6, skipped: 2, coverage: 86 },
    { name: 'Creator', total: 38, passed: 30, failed: 5, skipped: 3, coverage: 79 },
    { name: 'Social', total: 32, passed: 28, failed: 2, skipped: 2, coverage: 88 },
    { name: 'Payment', total: 24, passed: 24, failed: 0, skipped: 0, coverage: 100 },
  ];

  const recentTests: TestCase[] = [
    {
      id: 'TC001',
      name: 'Successful email registration',
      suite: 'Onboarding',
      status: 'passed',
      duration: 3.2,
      lastRun: new Date(),
    },
    {
      id: 'TC014',
      name: 'Maintain daily streak',
      suite: 'Daily User',
      status: 'passed',
      duration: 5.8,
      lastRun: new Date(Date.now() - 300000),
    },
    {
      id: 'TC026',
      name: 'Join and complete tournament',
      suite: 'Competition',
      status: 'failed',
      duration: 12.4,
      lastRun: new Date(Date.now() - 600000),
    },
    {
      id: 'TC034',
      name: 'Purchase premium subscription',
      suite: 'Payment',
      status: 'passed',
      duration: 8.9,
      lastRun: new Date(Date.now() - 900000),
    },
    {
      id: 'TC020',
      name: 'Send and accept friend challenge',
      suite: 'Social',
      status: 'running',
      duration: 0,
      lastRun: new Date(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✗';
      case 'skipped':
        return '⊘';
      case 'running':
        return '↻';
      default:
        return '?';
    }
  };

  const totalStats = testSuites.reduce(
    (acc, suite) => ({
      total: acc.total + suite.total,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed,
      skipped: acc.skipped + suite.skipped,
    }),
    { total: 0, passed: 0, failed: 0, skipped: 0 },
  );

  const overallCoverage = Math.round(
    testSuites.reduce((acc, suite) => acc + suite.coverage, 0) / testSuites.length,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">E2E Test Dashboard</h1>
          <p className="text-gray-600 mt-2">Automated test execution and coverage tracking</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Total Tests</p>
            <p className="text-3xl font-bold text-gray-900">{totalStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Passed</p>
            <p className="text-3xl font-bold text-green-600">{totalStats.passed}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((totalStats.passed / totalStats.total) * 100)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-600">{totalStats.failed}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((totalStats.failed / totalStats.total) * 100)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Skipped</p>
            <p className="text-3xl font-bold text-gray-600">{totalStats.skipped}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((totalStats.skipped / totalStats.total) * 100)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Coverage</p>
            <p className="text-3xl font-bold text-blue-600">{overallCoverage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${overallCoverage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Test Suites */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Suites</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Suite</th>
                  <th className="text-center py-2 px-4">Total</th>
                  <th className="text-center py-2 px-4">Passed</th>
                  <th className="text-center py-2 px-4">Failed</th>
                  <th className="text-center py-2 px-4">Skipped</th>
                  <th className="text-center py-2 px-4">Coverage</th>
                  <th className="text-center py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {testSuites.map((suite) => (
                  <tr key={suite.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{suite.name}</td>
                    <td className="text-center py-3 px-4">{suite.total}</td>
                    <td className="text-center py-3 px-4 text-green-600">{suite.passed}</td>
                    <td className="text-center py-3 px-4 text-red-600">{suite.failed}</td>
                    <td className="text-center py-3 px-4 text-gray-600">{suite.skipped}</td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">{suite.coverage}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              suite.coverage >= 90
                                ? 'bg-green-500'
                                : suite.coverage >= 80
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${suite.coverage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {suite.failed > 0 ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Passing
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Test Runs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Test Runs</h2>
          <div className="space-y-3">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getStatusColor(test.status)}`}
                  >
                    {getStatusIcon(test.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-500">{test.id}</span>
                      <span className="font-medium text-gray-900">{test.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <span>{test.suite}</span>
                      <span>•</span>
                      <span>{test.duration > 0 ? `${test.duration}s` : 'Running...'}</span>
                      <span>•</span>
                      <span>{test.lastRun.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {test.status === 'running' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Execution Timeline */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Execution Timeline</h2>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM'].map((time, index) => (
              <div key={time} className="relative flex items-center mb-4">
                <div className="absolute -left-2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
                <div className="ml-6">
                  <p className="text-sm text-gray-500">{time}</p>
                  <p className="text-sm font-medium">
                    {index === 0 && 'CI Pipeline triggered - 45 tests passed'}
                    {index === 1 && 'Nightly regression - 72 tests, 3 failed'}
                    {index === 2 && 'Hotfix validation - 12 tests passed'}
                    {index === 3 && 'Performance suite - 8 tests passed'}
                    {index === 4 && 'Security scan - All tests passed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
