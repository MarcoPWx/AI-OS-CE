// src/components/PerformanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PerformanceMonitor from '../services/performanceMonitor';

interface PerformanceStats {
  totalMetrics: number;
  criticalIssues: number;
  averagePageLoad: number;
  memoryUsage: number;
  networkRequests: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    totalMetrics: 0,
    criticalIssues: 0,
    averagePageLoad: 0,
    memoryUsage: 0,
    networkRequests: 0,
  });
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformanceStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadPerformanceStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceStats = async () => {
    try {
      const performanceStats = PerformanceMonitor.getPerformanceSummary();
      setStats(performanceStats);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceStats();
    setRefreshing(false);
  };

  const toggleMonitoring = async (enabled: boolean) => {
    try {
      await PerformanceMonitor.setEnabled(enabled);
      setIsMonitoringEnabled(enabled);

      if (enabled) {
        Alert.alert(
          'Performance Monitoring Enabled',
          'Performance metrics will be collected to help improve app performance.',
        );
      } else {
        Alert.alert(
          'Performance Monitoring Disabled',
          'Performance data collection has been stopped.',
        );
      }
    } catch (error) {
      console.error('Failed to toggle performance monitoring:', error);
      Alert.alert('Error', 'Failed to update performance monitoring setting.');
    }
  };

  const clearMetrics = () => {
    Alert.alert(
      'Clear Performance Data',
      'Are you sure you want to clear all performance metrics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            PerformanceMonitor.clearMetrics();
            loadPerformanceStats();
          },
        },
      ],
    );
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#4CAF50';
    if (value <= thresholds.warning) return '#FF9800';
    return '#F44336';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage < 50) return '#4CAF50';
    if (percentage < 80) return '#FF9800';
    return '#F44336';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="speedometer" size={32} color="#fff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Performance</Text>
              <Text style={styles.headerSubtitle}>App Performance Monitoring</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Ionicons
              name="refresh"
              size={24}
              color="#fff"
              style={refreshing ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Monitoring Toggle */}
      <View style={styles.section}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Performance Monitoring</Text>
            <Text style={styles.toggleSubtitle}>
              Collect performance metrics to improve app experience
            </Text>
          </View>
          <Switch
            value={isMonitoringEnabled}
            onValueChange={toggleMonitoring}
            trackColor={{ false: '#ccc', true: '#667eea' }}
            thumbColor={isMonitoringEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>

        <View style={styles.statsGrid}>
          {/* Page Load Time */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="time-outline" size={24} color="#667eea" />
              <Text style={styles.statTitle}>Page Load</Text>
            </View>
            <Text
              style={[
                styles.statValue,
                {
                  color: getPerformanceColor(stats.averagePageLoad, { good: 1000, warning: 3000 }),
                },
              ]}
            >
              {formatTime(stats.averagePageLoad)}
            </Text>
            <Text style={styles.statSubtext}>Average load time</Text>
          </View>

          {/* Memory Usage */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="memory" size={24} color="#667eea" />
              <Text style={styles.statTitle}>Memory</Text>
            </View>
            <Text style={[styles.statValue, { color: getMemoryColor(stats.memoryUsage) }]}>
              {stats.memoryUsage.toFixed(1)}%
            </Text>
            <Text style={styles.statSubtext}>Memory usage</Text>
          </View>

          {/* Network Requests */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="cloud-outline" size={24} color="#667eea" />
              <Text style={styles.statTitle}>Network</Text>
            </View>
            <Text style={styles.statValue}>{stats.networkRequests}</Text>
            <Text style={styles.statSubtext}>Requests made</Text>
          </View>

          {/* Critical Issues */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons
                name="warning-outline"
                size={24}
                color={stats.criticalIssues > 0 ? '#F44336' : '#4CAF50'}
              />
              <Text style={styles.statTitle}>Issues</Text>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: stats.criticalIssues > 0 ? '#F44336' : '#4CAF50' },
              ]}
            >
              {stats.criticalIssues}
            </Text>
            <Text style={styles.statSubtext}>Critical issues</Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metrics Collected</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Metrics</Text>
            <Text style={styles.metricValue}>{stats.totalMetrics}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Data Points</Text>
            <Text style={styles.metricValue}>{(stats.totalMetrics * 1.2).toFixed(0)}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Collection Rate</Text>
            <Text style={styles.metricValue}>{isMonitoringEnabled ? 'Active' : 'Paused'}</Text>
          </View>
        </View>
      </View>

      {/* Performance Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Tips</Text>

        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={20} color="#FF9800" />
            <Text style={styles.tipText}>Close unused apps to free up memory</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="wifi-outline" size={20} color="#FF9800" />
            <Text style={styles.tipText}>Use Wi-Fi for better performance</Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="refresh-outline" size={20} color="#FF9800" />
            <Text style={styles.tipText}>Restart the app if performance degrades</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.clearButton} onPress={clearMetrics}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={styles.clearButtonText}>Clear Performance Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
  },
  metricsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
});
