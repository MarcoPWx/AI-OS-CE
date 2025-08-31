import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  AlertTriangle,
  Activity,
  Database,
  Search,
  Download,
  RefreshCw,
  Clock,
  User,
  Server,
  Lock,
  Zap,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  type: 'USER_ACTION' | 'SYSTEM_EVENT' | 'SECURITY_ALERT' | 'API_CALL';
  action: string;
  userId?: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
  ip?: string;
  s2sPublished: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export const AuditDashboard: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-15T10:30:00'),
      type: 'USER_ACTION',
      action: 'QUIZ_COMPLETED',
      userId: 'user123',
      severity: 'INFO',
      details: { quizId: 'quiz789', score: 85, xpEarned: 45 },
      ip: '192.168.1.100',
      s2sPublished: true,
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15T10:25:00'),
      type: 'SECURITY_ALERT',
      action: 'MULTIPLE_FAILED_LOGINS',
      userId: 'user456',
      severity: 'HIGH',
      details: { attempts: 5, blocked: true },
      ip: '10.0.0.50',
      s2sPublished: true,
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15T10:20:00'),
      type: 'SYSTEM_EVENT',
      action: 'SERVICE_RESTART',
      severity: 'MEDIUM',
      details: { service: 'gamification', reason: 'deployment' },
      s2sPublished: true,
    },
    {
      id: '4',
      timestamp: new Date('2024-01-15T10:15:00'),
      type: 'API_CALL',
      action: 'S2S_EVENT_BATCH',
      severity: 'INFO',
      details: { batchSize: 50, duration: '45ms', success: true },
      s2sPublished: false,
    },
    {
      id: '5',
      timestamp: new Date('2024-01-15T10:10:00'),
      type: 'USER_ACTION',
      action: 'ACHIEVEMENT_EARNED',
      userId: 'user123',
      severity: 'INFO',
      details: { achievement: 'Week Warrior', xpReward: 150 },
      ip: '192.168.1.100',
      s2sPublished: true,
    },
  ];

  const metrics: MetricCard[] = [
    {
      title: 'Total Events (24h)',
      value: '12,456',
      change: 12,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-blue-500',
    },
    {
      title: 'Security Alerts',
      value: 23,
      change: -15,
      icon: <Shield className="h-5 w-5" />,
      color: 'text-red-500',
    },
    {
      title: 'S2S Success Rate',
      value: '99.7%',
      change: 0.2,
      icon: <Zap className="h-5 w-5" />,
      color: 'text-green-500',
    },
    {
      title: 'Queue Depth',
      value: 156,
      icon: <Database className="h-5 w-5" />,
      color: 'text-purple-500',
    },
  ];

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      INFO: 'default',
      LOW: 'secondary',
      MEDIUM: 'outline',
      HIGH: 'destructive',
      CRITICAL: 'destructive',
    };

    const colors: Record<string, string> = {
      INFO: '',
      LOW: '',
      MEDIUM: 'border-yellow-500 text-yellow-700',
      HIGH: '',
      CRITICAL: 'animate-pulse',
    };

    return (
      <Badge variant={variants[severity]} className={colors[severity]}>
        {severity}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'USER_ACTION':
        return <User className="h-4 w-4" />;
      case 'SYSTEM_EVENT':
        return <Server className="h-4 w-4" />;
      case 'SECURITY_ALERT':
        return <Lock className="h-4 w-4" />;
      case 'API_CALL':
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredLogs = mockLogs.filter((log) => {
    if (selectedType !== 'all' && log.type !== selectedType) return false;
    if (searchQuery && !JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Logging Dashboard</h1>
          <p className="text-muted-foreground">Real-time event monitoring and S2S publishing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  {metric.change !== undefined && (
                    <p
                      className={`text-xs mt-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                    </p>
                  )}
                </div>
                <div className={metric.color}>{metric.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Event Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="USER_ACTION">User Actions</SelectItem>
                <SelectItem value="SYSTEM_EVENT">System Events</SelectItem>
                <SelectItem value="SECURITY_ALERT">Security Alerts</SelectItem>
                <SelectItem value="API_CALL">API Calls</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Severity</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-left p-3 font-medium">S2S</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span className="text-sm">{log.type}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-sm">{log.action}</td>
                    <td className="p-3 text-sm">{log.userId || '-'}</td>
                    <td className="p-3">{getSeverityBadge(log.severity)}</td>
                    <td className="p-3">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-muted-foreground">View details</summary>
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td className="p-3">
                      {log.s2sPublished ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Queued
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {mockLogs.length} events
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* S2S Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              S2S Event Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Main Queue</span>
                <span className="font-mono text-sm">156 / 10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '1.56%' }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Retry Queue</span>
                <span className="font-mono text-sm">3 / 1,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0.3%' }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Dead Letter Queue</span>
                <span className="font-mono text-sm">0 / 500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Brute Force Attempt</p>
                    <p className="text-xs text-muted-foreground">
                      5 failed login attempts from IP 10.0.0.50
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">High API Error Rate</p>
                    <p className="text-xs text-muted-foreground">
                      Error rate at 12% (threshold: 10%)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
