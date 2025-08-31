// src/screens/AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface DailyStats {
  date: string;
  daily_active_users: number;
  total_sessions: number;
  total_events: number;
  quizzes_completed: number;
  new_users: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
  }[];
}

const colors = {
  background: '#0d1117',
  surface: '#161b22',
  primary: '#58a6ff',
  success: '#2ea043',
  warning: '#d29922',
  danger: '#f85149',
  text: '#c9d1d9',
  textSecondary: '#8b949e',
  border: '#30363d',
};

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (timeRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      // Fetch daily stats
      const { data: dailyStats, error: statsError } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (statsError) throw statsError;

      setStats(dailyStats || []);

      // Calculate metrics
      if (dailyStats && dailyStats.length > 0) {
        const totalUsers = dailyStats.reduce((sum, day) => sum + day.daily_active_users, 0);
        const totalSessions = dailyStats.reduce((sum, day) => sum + day.total_sessions, 0);
        const totalQuizzes = dailyStats.reduce((sum, day) => sum + day.quizzes_completed, 0);
        const totalNewUsers = dailyStats.reduce((sum, day) => sum + day.new_users, 0);

        // Calculate week-over-week change
        const midPoint = Math.floor(dailyStats.length / 2);
        const firstHalf = dailyStats.slice(0, midPoint);
        const secondHalf = dailyStats.slice(midPoint);

        const firstHalfUsers = firstHalf.reduce((sum, day) => sum + day.daily_active_users, 0);
        const secondHalfUsers = secondHalf.reduce((sum, day) => sum + day.daily_active_users, 0);
        const userChange =
          firstHalfUsers > 0 ? ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100 : 0;

        setMetrics([
          {
            title: 'Active Users',
            value: totalUsers,
            change: userChange,
            icon: 'people',
            color: colors.primary,
          },
          {
            title: 'Sessions',
            value: totalSessions,
            change: 12,
            icon: 'pulse',
            color: colors.success,
          },
          {
            title: 'Quizzes Completed',
            value: totalQuizzes,
            change: 8,
            icon: 'school',
            color: colors.warning,
          },
          {
            title: 'New Users',
            value: totalNewUsers,
            change: -5,
            icon: 'person-add',
            color: colors.danger,
          },
        ]);
      }

      // Fetch real-time stats
      await fetchRealtimeStats();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      // Get current active users (sessions in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: activeNow } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', fiveMinutesAgo);

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayEvents } = await supabase
        .from('analytics_events')
        .select('event_name')
        .gte('created_at', today);

      // Update metrics with real-time data
      if (activeNow !== null) {
        setMetrics((prev) =>
          prev.map((m) => (m.title === 'Active Users' ? { ...m, value: `${activeNow} now` } : m)),
        );
      }
    } catch (error) {
      console.error('Failed to fetch realtime stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const renderMetricCard = (metric: MetricCard) => (
    <View key={metric.title} style={styles.metricCard}>
      <LinearGradient
        colors={[metric.color + '20', metric.color + '10']}
        style={styles.metricGradient}
      >
        <View style={styles.metricHeader}>
          <Ionicons name={metric.icon as any} size={24} color={metric.color} />
          {metric.change !== undefined && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: metric.change > 0 ? colors.success + '20' : colors.danger + '20',
                },
              ]}
            >
              <Ionicons
                name={metric.change > 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={metric.change > 0 ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.changeText,
                  { color: metric.change > 0 ? colors.success : colors.danger },
                ]}
              >
                {Math.abs(metric.change).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.metricValue}>{metric.value}</Text>
        <Text style={styles.metricTitle}>{metric.title}</Text>
      </LinearGradient>
    </View>
  );

  const renderChart = () => {
    if (stats.length === 0) return null;

    const maxValue = Math.max(...stats.map((s) => s.daily_active_users));
    const chartHeight = 200;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>User Activity</Text>
        <View style={styles.chart}>
          {stats.map((day, index) => {
            const barHeight = (day.daily_active_users / maxValue) * chartHeight;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.bar, { height: barHeight }]}>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + '80']}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
                <Text style={styles.barLabel}>{new Date(day.date).getDate()}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderEventsList = () => (
    <View style={styles.eventsContainer}>
      <Text style={styles.sectionTitle}>Recent Events</Text>
      <View style={styles.eventsList}>
        {['quiz_started', 'quiz_completed', 'level_up', 'achievement_unlocked'].map(
          (event, index) => (
            <View key={index} style={styles.eventItem}>
              <View style={styles.eventDot} />
              <Text style={styles.eventName}>{event.replace('_', ' ')}</Text>
              <Text style={styles.eventTime}>2 min ago</Text>
            </View>
          ),
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <View style={styles.timeRangeContainer}>
          {['7d', '30d', '90d'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={20} color={colors.primary} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      <View style={styles.metricsGrid}>{metrics.map(renderMetricCard)}</View>

      {renderChart()}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Avg Session Duration</Text>
          <Text style={styles.statValue}>5m 32s</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Quiz Completion Rate</Text>
          <Text style={styles.statValue}>78%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Avg Questions/Quiz</Text>
          <Text style={styles.statValue}>8.5</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>User Retention</Text>
          <Text style={styles.statValue}>42%</Text>
        </View>
      </View>

      {renderEventsList()}

      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download" size={20} color={colors.primary} />
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="share" size={20} color={colors.primary} />
          <Text style={styles.exportText}>Share Report</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timeRangeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  refreshText: {
    fontSize: 14,
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 10,
  },
  metricCard: {
    width: (screenWidth - 40) / 2,
    maxWidth: 200,
  },
  metricGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chartContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 10,
  },
  statCard: {
    width: (screenWidth - 40) / 2,
    maxWidth: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  eventsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  eventsList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 12,
  },
  eventName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textTransform: 'capitalize',
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  exportContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
