import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Gauge,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SLOMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'violated';
  trend: 'up' | 'down' | 'stable';
  history: Array<{ time: string; value: number }>;
}

interface ErrorBudget {
  total: number;
  consumed: number;
  remaining: number;
  burnRate: number;
  daysRemaining: number;
  projectedExhaustion: string | null;
}

const SLOMonitoringDashboard: React.FC = () => {
  const [sloMetrics, setSloMetrics] = useState<SLOMetric[]>([]);
  const [errorBudget, setErrorBudget] = useState<ErrorBudget | null>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'5m' | '1h' | '24h' | '7d' | '30d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch SLO metrics
  useEffect(() => {
    const fetchSLOData = async () => {
      try {
        const response = await fetch(`/api/admin/slo/metrics?range=${timeRange}`);
        const data = await response.json();

        setSloMetrics(data.metrics);
        setErrorBudget(data.errorBudget);
        setViolations(data.violations);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch SLO data:', error);
        setLoading(false);
      }
    };

    fetchSLOData();

    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSLOData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  // Calculate overall health
  const overallHealth = useMemo(() => {
    if (!sloMetrics.length) return 'unknown';

    const violations = sloMetrics.filter((m) => m.status === 'violated').length;
    const warnings = sloMetrics.filter((m) => m.status === 'warning').length;

    if (violations > 0) return 'critical';
    if (warnings > 2) return 'warning';
    if (warnings > 0) return 'caution';
    return 'healthy';
  }, [sloMetrics]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      case 'violated':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'violated':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format metric value
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case '%':
        return `${value.toFixed(2)}%`;
      case 'ms':
        return `${value.toFixed(0)}ms`;
      case 'rps':
        return `${value.toFixed(1)} RPS`;
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SLO Monitoring</h1>
          <p className="text-gray-500 mt-1">
            Service Level Objective compliance and error budget tracking
          </p>
        </div>

        <div className="flex gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="5m">Last 5 minutes</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg ${
              autoRefresh ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {overallHealth === 'critical' && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical: SLO Violations Detected</AlertTitle>
          <AlertDescription>
            Multiple SLOs are currently in violation. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {overallHealth === 'warning' && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: SLOs at Risk</AlertTitle>
          <AlertDescription>
            Some SLOs are approaching their thresholds. Monitor closely.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Budget Card */}
      {errorBudget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Error Budget Status
            </CardTitle>
            <CardDescription>Monthly error budget consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Budget Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Consumed: {errorBudget.consumed.toFixed(1)}%</span>
                  <span>Remaining: {errorBudget.remaining.toFixed(1)} minutes</span>
                </div>
                <Progress
                  value={errorBudget.consumed}
                  className={`h-3 ${
                    errorBudget.consumed > 90
                      ? 'bg-red-100'
                      : errorBudget.consumed > 75
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                  }`}
                />
              </div>

              {/* Budget Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Burn Rate</p>
                  <p
                    className={`text-2xl font-bold ${
                      errorBudget.burnRate > 1.5
                        ? 'text-red-500'
                        : errorBudget.burnRate > 1.2
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }`}
                  >
                    {errorBudget.burnRate.toFixed(2)}x
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Days Remaining</p>
                  <p className="text-2xl font-bold">{errorBudget.daysRemaining}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-2xl font-bold">{errorBudget.total.toFixed(1)} min</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Projected Exhaustion</p>
                  <p className="text-xl font-semibold">
                    {errorBudget.projectedExhaustion || 'On track'}
                  </p>
                </div>
              </div>

              {/* Burn Rate Chart */}
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={[
                    { day: 'Mon', consumed: 12 },
                    { day: 'Tue', consumed: 24 },
                    { day: 'Wed', consumed: 35 },
                    { day: 'Thu', consumed: 42 },
                    { day: 'Fri', consumed: 48 },
                    { day: 'Sat', consumed: 52 },
                    { day: 'Sun', consumed: 58 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="consumed" stroke="#3B82F6" fill="#93C5FD" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLO Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sloMetrics.map((metric) => (
          <Card
            key={metric.name}
            className={`border-l-4 ${
              metric.status === 'healthy'
                ? 'border-l-green-500'
                : metric.status === 'warning'
                  ? 'border-l-yellow-500'
                  : metric.status === 'critical'
                    ? 'border-l-red-500'
                    : 'border-l-red-600'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Current vs Target */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold">{formatValue(metric.current, metric.unit)}</p>
                    <p className="text-sm text-gray-500">
                      Target: {formatValue(metric.target, metric.unit)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <span className="h-4 w-4">→</span>
                    )}
                    <Badge
                      variant={
                        metric.status === 'healthy'
                          ? 'default'
                          : metric.status === 'warning'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {metric.status}
                    </Badge>
                  </div>
                </div>

                {/* Mini Chart */}
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={metric.history}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={
                        metric.status === 'healthy'
                          ? '#10B981'
                          : metric.status === 'warning'
                            ? '#F59E0B'
                            : '#EF4444'
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Compliance Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Compliance</span>
                    <span>{((metric.current / metric.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent SLO Violations</CardTitle>
            <CardDescription>Violations in the selected time range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.slice(0, 5).map((violation, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{violation.slo}</p>
                      <p className="text-sm text-gray-600">{violation.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">{violation.duration} minutes</p>
                    <p className="text-xs text-gray-500">{violation.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLO Breakdown by Service */}
      <Card>
        <CardHeader>
          <CardTitle>SLO Performance by Service</CardTitle>
          <CardDescription>Compliance across different services</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { service: 'API Gateway', availability: 99.95, latency: 98.5, errorRate: 99.2 },
                { service: 'Quiz Service', availability: 99.92, latency: 97.8, errorRate: 99.5 },
                { service: 'Auth Service', availability: 99.98, latency: 99.1, errorRate: 99.8 },
                { service: 'Analytics', availability: 99.89, latency: 96.5, errorRate: 98.9 },
                { service: 'Database', availability: 99.99, latency: 95.2, errorRate: 99.7 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="availability" fill="#10B981" />
              <Bar dataKey="latency" fill="#3B82F6" />
              <Bar dataKey="errorRate" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLOMonitoringDashboard;
