import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Server,
  Database,
  Users,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Gauge,
} from 'lucide-react';

interface SystemMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  requests: {
    total: number;
    success: number;
    error: number;
    rps: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
    cacheHitRatio: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRatio: number;
    memory: number;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    errorRate: number;
  }>;
}

const SystemHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<SystemMetrics[]>([]);
  const [activeView, setActiveView] = useState<
    'overview' | 'infrastructure' | 'application' | 'database'
  >('overview');
  const [timeRange, setTimeRange] = useState<'5m' | '1h' | '6h' | '24h'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch current metrics
        const currentResponse = await fetch('/api/admin/health/metrics');
        const currentData = await currentResponse.json();
        setMetrics(currentData);

        // Fetch historical data
        const historicalResponse = await fetch(`/api/admin/health/history?range=${timeRange}`);
        const historicalData = await historicalResponse.json();
        setHistoricalData(historicalData);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();

    // Auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh]);

  // Calculate system health score
  const healthScore = useMemo(() => {
    if (!metrics) return 0;

    let score = 100;

    // Deduct points for high resource usage
    if (metrics.cpu > 80) score -= 10;
    if (metrics.memory > 80) score -= 10;
    if (metrics.disk > 90) score -= 15;

    // Deduct for errors
    const errorRate = (metrics.requests.error / metrics.requests.total) * 100;
    if (errorRate > 1) score -= 20;
    if (errorRate > 0.5) score -= 10;

    // Deduct for high latency
    if (metrics.latency.p95 > 1000) score -= 15;
    if (metrics.latency.p99 > 2000) score -= 10;

    // Deduct for unhealthy services
    const unhealthyServices = metrics.services.filter((s) => s.status !== 'healthy').length;
    score -= unhealthyServices * 10;

    return Math.max(0, score);
  }, [metrics]);

  // Get health status color
  const getHealthColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!metrics) {
    return <div>Loading system health data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring for 1000+ concurrent users</p>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="5m">Last 5 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>

          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Health Score Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall System Health</h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold" style={{ color: getHealthColor(healthScore) }}>
                  {healthScore}%
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">847 concurrent users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">{metrics.requests.rps} req/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">P95: {metrics.latency.p95}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score Gauge */}
            <ResponsiveContainer width={150} height={150}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[{ value: healthScore, fill: getHealthColor(healthScore) }]}
              >
                <RadialBar dataKey="value" cornerRadius={10} fill={getHealthColor(healthScore)} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">CPU Usage</p>
                <p className="text-2xl font-bold">{metrics.cpu}%</p>
                <p className="text-xs text-gray-400">8 cores available</p>
              </div>
              <Cpu className={`h-8 w-8 ${metrics.cpu > 80 ? 'text-red-500' : 'text-blue-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Memory</p>
                <p className="text-2xl font-bold">{metrics.memory}%</p>
                <p className="text-xs text-gray-400">13.1GB / 16GB</p>
              </div>
              <Server
                className={`h-8 w-8 ${metrics.memory > 80 ? 'text-red-500' : 'text-green-500'}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Error Rate</p>
                <p className="text-2xl font-bold">
                  {((metrics.requests.error / metrics.requests.total) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400">23 / {metrics.requests.total}</p>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  metrics.requests.error / metrics.requests.total > 0.01
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cache Hit</p>
                <p className="text-2xl font-bold">{metrics.cache.hitRatio}%</p>
                <p className="text-xs text-gray-400">{metrics.cache.hits} hits</p>
              </div>
              <Database
                className={`h-8 w-8 ${metrics.cache.hitRatio > 70 ? 'text-green-500' : 'text-yellow-500'}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Request Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Request Metrics</CardTitle>
              <CardDescription>Real-time request performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="requests.rps"
                    stroke="#3B82F6"
                    fill="#93C5FD"
                    name="Requests/sec"
                  />
                  <Area
                    type="monotone"
                    dataKey="requests.error"
                    stroke="#EF4444"
                    fill="#FCA5A5"
                    name="Errors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Latency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Latency Distribution</CardTitle>
              <CardDescription>Response time percentiles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="latency.p50" stroke="#10B981" name="P50" />
                  <Line type="monotone" dataKey="latency.p95" stroke="#F59E0B" name="P95" />
                  <Line type="monotone" dataKey="latency.p99" stroke="#EF4444" name="P99" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Status Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Health of individual services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-gray-500">Uptime: {service.uptime}%</p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          {/* Resource Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU & Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10B981" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network I/O</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="network.in"
                      stackId="1"
                      stroke="#10B981"
                      fill="#86EFAC"
                      name="In (MB/s)"
                    />
                    <Area
                      type="monotone"
                      dataKey="network.out"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#93C5FD"
                      name="Out (MB/s)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pod/Container Status */}
          <Card>
            <CardHeader>
              <CardTitle>Container Scaling Status</CardTitle>
              <CardDescription>Auto-scaling metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">API Pods</p>
                      <p className="text-sm text-gray-600">CPU: 62% | Memory: 71%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">7 / 50</p>
                    <p className="text-xs text-gray-500">Current / Max</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Worker Pods</p>
                      <p className="text-sm text-gray-600">Queue: 1,245 jobs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">4 / 20</p>
                    <p className="text-xs text-gray-500">Current / Max</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application" className="space-y-4">
          {/* API Endpoint Performance */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>Top endpoints by volume and latency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { endpoint: '/api/quiz/submit', requests: 4532, p95: 423 },
                    { endpoint: '/api/learning/plan', requests: 3210, p95: 312 },
                    { endpoint: '/api/questions/validate', requests: 2890, p95: 234 },
                    { endpoint: '/api/analytics', requests: 1567, p95: 1823 },
                    { endpoint: '/api/recommendations', requests: 987, p95: 567 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="requests" fill="#3B82F6" name="Requests" />
                  <Bar yAxisId="right" dataKey="p95" fill="#F59E0B" name="P95 Latency (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quiz Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8,432</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+23% from last hour</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">OpenAI API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">523</div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>Avg latency: 782ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          {/* Database Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="font-bold">{metrics.database.connections} / 200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(metrics.database.connections / 200) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Ratio</span>
                    <span className="font-bold">{metrics.database.cacheHitRatio}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${metrics.database.cacheHitRatio}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Fast (<100ms)', value: 87, fill: '#10B981' },
                        { name: 'Normal (100-500ms)', value: 10, fill: '#F59E0B' },
                        { name: 'Slow (>500ms)', value: 3, fill: '#EF4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                    >
                      {[{ fill: '#10B981' }, { fill: '#F59E0B' }, { fill: '#EF4444' }].map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Slow Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Slow Queries</CardTitle>
              <CardDescription>Queries taking longer than 500ms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <code className="text-sm text-red-800">
                        SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC
                      </code>
                      <p className="text-xs text-gray-600 mt-1">
                        Missing index on (user_id, created_at)
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-600">1,234ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Required Alert */}
      {healthScore < 70 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">⚠️ Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {metrics.cpu > 80 && <li>• CPU usage critical: Consider scaling horizontally</li>}
              {metrics.memory > 80 && <li>• Memory usage high: Check for memory leaks</li>}
              {metrics.requests.error / metrics.requests.total > 0.01 && (
                <li>• Error rate above SLO: Investigate failing endpoints</li>
              )}
              {metrics.latency.p95 > 1000 && (
                <li>• P95 latency exceeds target: Optimize slow queries</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
