// src/screens/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Admin authentication - hardcoded admin users
const ADMIN_USERS = ['admin@quizmentor.app', 'dev@quizmentor.app'];

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-key'; // Service key for admin ops

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rollout_percentage: number;
  description?: string;
}

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: any[];
}

interface RemoteConfig {
  app_version: string;
  min_version: string;
  force_update: boolean;
  maintenance_mode: boolean;
  feature_flags: Record<string, boolean>;
  ui_config: any;
  content: any;
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

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'flags' | 'experiments' | 'questions'>(
    'config',
  );

  // Remote Config State
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  // Question Management State
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, activeTab]);

  const checkAuthentication = async () => {
    // Check if user is admin (simplified for demo)
    const userEmail = await AsyncStorage.getItem('@admin_email');
    if (userEmail && ADMIN_USERS.includes(userEmail)) {
      setAuthenticated(true);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'config':
          await loadRemoteConfig();
          break;
        case 'flags':
          await loadFeatureFlags();
          break;
        case 'experiments':
          await loadExperiments();
          break;
        case 'questions':
          await loadQuestions();
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRemoteConfig = async () => {
    const { data, error } = await supabase.from('remote_config').select('*').single();

    if (data) setRemoteConfig(data);
  };

  const loadFeatureFlags = async () => {
    const { data, error } = await supabase.from('feature_flags').select('*').order('name');

    if (data) setFeatureFlags(data);
  };

  const loadExperiments = async () => {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setExperiments(data);
  };

  const loadQuestions = async () => {
    // Load question categories
    const { data: categoriesData } = await supabase
      .from('question_categories')
      .select('*')
      .order('order_index');

    if (categoriesData) setCategories(categoriesData);
  };

  const toggleFeatureFlag = async (flag: FeatureFlag) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ enabled: !flag.enabled })
      .eq('id', flag.id);

    if (!error) {
      loadFeatureFlags();
      Alert.alert('Success', `Feature flag ${flag.enabled ? 'disabled' : 'enabled'}`);
    }
  };

  const updateRolloutPercentage = async (flag: FeatureFlag, percentage: number) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ rollout_percentage: percentage })
      .eq('id', flag.id);

    if (!error) {
      loadFeatureFlags();
    }
  };

  const toggleMaintenanceMode = async () => {
    if (!remoteConfig) return;

    const { error } = await supabase
      .from('remote_config')
      .update({ maintenance_mode: !remoteConfig.maintenance_mode })
      .eq('id', remoteConfig.id);

    if (!error) {
      loadRemoteConfig();
      Alert.alert(
        'Success',
        `Maintenance mode ${remoteConfig.maintenance_mode ? 'disabled' : 'enabled'}`,
      );
    }
  };

  const syncQuestions = async () => {
    setSyncStatus('syncing');

    try {
      // Step 1: Upload questions to Supabase in batches
      const { devQuizData } = await import('../../services/devQuizData');

      for (const category of devQuizData) {
        // Upload category
        const { data: categoryData, error: categoryError } = await supabase
          .from('question_categories')
          .upsert({
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            description: category.description,
            order_index: devQuizData.indexOf(category),
          })
          .select()
          .single();

        if (categoryData) {
          // Upload questions in batches of 50
          const batchSize = 50;
          const questions = category.questions.map((q, idx) => ({
            ...q,
            category_id: categoryData.id,
            order_index: idx,
          }));

          for (let i = 0; i < questions.length; i += batchSize) {
            const batch = questions.slice(i, i + batchSize);
            await supabase.from('questions').upsert(batch);
          }
        }
      }

      setSyncStatus('synced');
      Alert.alert('Success', 'Questions synced to Supabase');
    } catch (error) {
      setSyncStatus('idle');
      Alert.alert('Error', 'Failed to sync questions');
    }
  };

  const renderRemoteConfig = () => {
    if (!remoteConfig) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remote Configuration</Text>

        <View style={styles.card}>
          <View style={styles.configRow}>
            <Text style={styles.label}>App Version</Text>
            <TextInput
              style={styles.input}
              value={remoteConfig.app_version}
              onChangeText={(text) => setRemoteConfig({ ...remoteConfig, app_version: text })}
              placeholder="1.0.0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.configRow}>
            <Text style={styles.label}>Min Version</Text>
            <TextInput
              style={styles.input}
              value={remoteConfig.min_version}
              onChangeText={(text) => setRemoteConfig({ ...remoteConfig, min_version: text })}
              placeholder="1.0.0"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.configRow}>
            <Text style={styles.label}>Force Update</Text>
            <Switch
              value={remoteConfig.force_update}
              onValueChange={(value) => setRemoteConfig({ ...remoteConfig, force_update: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.configRow}>
            <Text style={styles.label}>Maintenance Mode</Text>
            <Switch
              value={remoteConfig.maintenance_mode}
              onValueChange={toggleMaintenanceMode}
              trackColor={{ false: colors.border, true: colors.danger }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFeatureFlags = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Feature Flags</Text>

      {featureFlags.map((flag) => (
        <View key={flag.id} style={styles.card}>
          <View style={styles.flagHeader}>
            <View style={styles.flagInfo}>
              <Text style={styles.flagName}>{flag.name}</Text>
              <Text style={styles.flagDescription}>{flag.description}</Text>
            </View>
            <Switch
              value={flag.enabled}
              onValueChange={() => toggleFeatureFlag(flag)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.rolloutContainer}>
            <Text style={styles.rolloutLabel}>Rollout: {flag.rollout_percentage}%</Text>
            <View style={styles.rolloutButtons}>
              {[0, 10, 25, 50, 75, 100].map((percent) => (
                <TouchableOpacity
                  key={percent}
                  style={[
                    styles.rolloutButton,
                    flag.rollout_percentage === percent && styles.rolloutButtonActive,
                  ]}
                  onPress={() => updateRolloutPercentage(flag, percent)}
                >
                  <Text style={styles.rolloutButtonText}>{percent}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderExperiments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>A/B Experiments</Text>

      {experiments.map((experiment) => (
        <View key={experiment.id} style={styles.card}>
          <View style={styles.experimentHeader}>
            <Text style={styles.experimentName}>{experiment.name}</Text>
            <View style={[styles.statusBadge, styles[`status_${experiment.status}`]]}>
              <Text style={styles.statusText}>{experiment.status}</Text>
            </View>
          </View>

          <View style={styles.variantsContainer}>
            {experiment.variants.map((variant: any, idx: number) => (
              <View key={idx} style={styles.variant}>
                <Text style={styles.variantName}>{variant.name}</Text>
                <Text style={styles.variantWeight}>{variant.weight}%</Text>
              </View>
            ))}
          </View>

          <View style={styles.experimentActions}>
            {experiment.status === 'draft' && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Start</Text>
              </TouchableOpacity>
            )}
            {experiment.status === 'running' && (
              <TouchableOpacity style={[styles.actionButton, styles.pauseButton]}>
                <Text style={styles.actionButtonText}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuestionManager = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Question Management</Text>

      <View style={styles.card}>
        <View style={styles.syncContainer}>
          <Text style={styles.syncTitle}>Sync Local Questions to Supabase</Text>
          <Text style={styles.syncDescription}>
            This will upload all questions from devQuizData.ts to Supabase
          </Text>

          <TouchableOpacity
            style={[styles.syncButton, syncStatus === 'syncing' && styles.syncingButton]}
            onPress={syncQuestions}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.syncButtonText}>
                  {syncStatus === 'synced' ? 'Synced ✓' : 'Sync Questions'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.statsTitle}>Question Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>80+</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Difficulty Levels</Text>
          </View>
        </View>
      </View>

      <Text style={styles.infoText}>
        Questions are cached on device and synced periodically for offline support
      </Text>
    </View>
  );

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Admin Access Required</Text>
          <TextInput
            style={styles.authInput}
            placeholder="Admin Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            onSubmitEditing={(e) => {
              const email = e.nativeEvent.text;
              if (ADMIN_USERS.includes(email)) {
                AsyncStorage.setItem('@admin_email', email);
                setAuthenticated(true);
              } else {
                Alert.alert('Error', 'Invalid admin credentials');
              }
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Remote Configuration & A/B Testing</Text>
      </View>

      <View style={styles.tabs}>
        {(['config', 'flags', 'experiments', 'questions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <>
          {activeTab === 'config' && renderRemoteConfig()}
          {activeTab === 'flags' && renderFeatureFlags()}
          {activeTab === 'experiments' && renderExperiments()}
          {activeTab === 'questions' && renderQuestionManager()}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  authInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    width: 120,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagInfo: {
    flex: 1,
  },
  flagName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  flagDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rolloutContainer: {
    marginTop: 12,
  },
  rolloutLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  rolloutButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rolloutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rolloutButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rolloutButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  experimentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  status_draft: {
    backgroundColor: colors.textSecondary + '20',
  },
  status_running: {
    backgroundColor: colors.success + '20',
  },
  status_paused: {
    backgroundColor: colors.warning + '20',
  },
  status_completed: {
    backgroundColor: colors.primary + '20',
  },
  statusText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  variant: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  variantName: {
    fontSize: 12,
    color: colors.text,
  },
  variantWeight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  experimentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncContainer: {
    alignItems: 'center',
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  syncDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  syncingButton: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
