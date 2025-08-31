import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { gamificationService, Achievement } from '../services/gamification';
import { AnimatedProgressBar, XPDisplay } from '../components/GamificationComponents';

const { width: screenWidth } = Dimensions.get('window');

interface AchievementWithProgress extends Achievement {
  progress: number;
  maxProgress: number;
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'recent';
type CategoryType = 'all' | 'performance' | 'consistency' | 'exploration' | 'social' | 'special';

const ACHIEVEMENT_CATEGORIES = {
  performance: { name: 'Performance', icon: 'trophy', color: '#FFD700' },
  consistency: { name: 'Consistency', icon: 'flame', color: '#FF6B6B' },
  exploration: { name: 'Exploration', icon: 'compass', color: '#4CAF50' },
  social: { name: 'Social', icon: 'people', color: '#2196F3' },
  special: { name: 'Special', icon: 'star', color: '#9C27B0' },
};

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(
    null,
  );
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);

      const user = await authService.getCurrentUser();
      if (!user) {
        navigation.navigate('Login' as never);
        return;
      }

      const userAchievements = await gamificationService.getAchievements(user.id);
      const userState = await gamificationService.getUserState(user.id);

      // Add progress data to achievements
      const achievementsWithProgress: AchievementWithProgress[] = userAchievements.map(
        (achievement) => {
          let progress = 0;
          let maxProgress = 1;

          // Calculate progress based on achievement type
          switch (achievement.id) {
            case 'first-steps':
              progress = Math.min(userState.quizHistory.length, 1);
              maxProgress = 1;
              break;
            case 'quiz-master':
              progress = userState.quizHistory.length;
              maxProgress = 100;
              break;
            case 'perfect-score':
              progress = userState.quizHistory.filter((q) => q.score === 100).length;
              maxProgress = 1;
              break;
            case 'streak-week':
              progress = userState.dailyStreak.current;
              maxProgress = 7;
              break;
            case 'streak-month':
              progress = userState.dailyStreak.current;
              maxProgress = 30;
              break;
            case 'level-10':
              progress = userState.level;
              maxProgress = 10;
              break;
            case 'level-25':
              progress = userState.level;
              maxProgress = 25;
              break;
            case 'level-50':
              progress = userState.level;
              maxProgress = 50;
              break;
            default:
              progress = achievement.unlockedAt ? 1 : 0;
              maxProgress = 1;
          }

          return {
            ...achievement,
            progress: Math.min(progress, maxProgress),
            maxProgress,
          };
        },
      );

      setAchievements(achievementsWithProgress);
      setTotalAchievements(achievementsWithProgress.length);
      setTotalUnlocked(achievementsWithProgress.filter((a) => a.unlockedAt).length);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Apply status filter
    switch (filter) {
      case 'unlocked':
        return filtered.filter((a) => a.unlockedAt);
      case 'locked':
        return filtered.filter((a) => !a.unlockedAt);
      case 'recent':
        return filtered
          .filter((a) => a.unlockedAt)
          .sort((a, b) => {
            const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
            const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10);
      default:
        return filtered;
    }
  };

  const renderAchievementItem = ({ item }: { item: AchievementWithProgress }) => {
    const isUnlocked = !!item.unlockedAt;
    const categoryInfo =
      ACHIEVEMENT_CATEGORIES[item.category as keyof typeof ACHIEVEMENT_CATEGORIES];

    return (
      <TouchableOpacity
        style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}
        onPress={() => setSelectedAchievement(item)}
        testID={`achievement-${item.id}`}
        data-unlocked={isUnlocked.toString()}
      >
        <View
          style={[
            styles.achievementIcon,
            { backgroundColor: isUnlocked ? categoryInfo.color : '#E0E0E0' },
          ]}
        >
          <Ionicons name={item.icon as any} size={28} color={isUnlocked ? '#fff' : '#999'} />
        </View>

        <View style={styles.achievementContent}>
          <Text style={[styles.achievementName, !isUnlocked && styles.lockedText]}>
            {item.name}
          </Text>

          {isUnlocked ? (
            <View style={styles.unlockedInfo}>
              <Text style={styles.achievementPoints}>+{item.xpReward} XP</Text>
              <Text style={styles.unlockedDate}>
                {new Date(item.unlockedAt!).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View>
              <AnimatedProgressBar
                progress={item.progress / item.maxProgress}
                color={categoryInfo.color}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {item.progress} / {item.maxProgress}
              </Text>
            </View>
          )}
        </View>

        {isUnlocked && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
      </TouchableOpacity>
    );
  };

  const AchievementDetailModal = () => {
    if (!selectedAchievement) return null;

    const isUnlocked = !!selectedAchievement.unlockedAt;
    const categoryInfo =
      ACHIEVEMENT_CATEGORIES[selectedAchievement.category as keyof typeof ACHIEVEMENT_CATEGORIES];

    return (
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="achievement-detail-modal">
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedAchievement(null)}
              testID="close-modal"
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <View
              style={[
                styles.modalIcon,
                { backgroundColor: isUnlocked ? categoryInfo.color : '#E0E0E0' },
              ]}
            >
              <Ionicons
                name={selectedAchievement.icon as any}
                size={48}
                color={isUnlocked ? '#fff' : '#999'}
              />
            </View>

            <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>

            <Text style={styles.modalDescription} testID="achievement-description">
              {selectedAchievement.description}
            </Text>

            {!isUnlocked && (
              <View style={styles.modalProgress}>
                <AnimatedProgressBar
                  progress={selectedAchievement.progress / selectedAchievement.maxProgress}
                  color={categoryInfo.color}
                  style={styles.modalProgressBar}
                />
                <Text style={styles.modalProgressText}>
                  Progress: {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                </Text>
              </View>
            )}

            <View style={styles.modalRewards} testID="achievement-reward">
              <Text style={styles.modalRewardTitle}>Rewards</Text>
              <View style={styles.rewardRow}>
                <XPDisplay xp={selectedAchievement.xpReward} />
                {selectedAchievement.reward && (
                  <Text style={styles.additionalReward}>{selectedAchievement.reward}</Text>
                )}
              </View>
            </View>

            {isUnlocked && (
              <Text style={styles.unlockedDateModal}>
                Unlocked on {new Date(selectedAchievement.unlockedAt!).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Overview */}
      <View style={styles.progressOverview} testID="achievements-progress">
        <Text style={styles.progressTitle}>
          {totalUnlocked} of {totalAchievements} Unlocked
        </Text>
        <AnimatedProgressBar
          progress={totalUnlocked / totalAchievements}
          color="#007AFF"
          style={styles.overallProgress}
        />
        <Text style={styles.progressPercentage}>
          {Math.round((totalUnlocked / totalAchievements) * 100)}% Complete
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'all' && styles.activeCategoryButton]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === 'all' && styles.activeCategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.categoryButton, selectedCategory === key && styles.activeCategoryButton]}
            onPress={() => setSelectedCategory(key as CategoryType)}
            testID={`achievement-category-${key}`}
          >
            <Ionicons
              name={value.icon as any}
              size={16}
              color={selectedCategory === key ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === key && styles.activeCategoryText,
              ]}
            >
              {value.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {(['all', 'unlocked', 'locked', 'recent'] as FilterType[]).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[styles.filterButton, filter === filterType && styles.activeFilterButton]}
            onPress={() => setFilter(filterType)}
            testID={`filter-${filterType}`}
          >
            <Text
              style={[styles.filterButtonText, filter === filterType && styles.activeFilterText]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievements Grid */}
      <FlatList
        data={getFilteredAchievements()}
        renderItem={renderAchievementItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.achievementsGrid}
        testID="achievements-grid"
      />

      {/* Achievement Detail Modal */}
      <AchievementDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  progressOverview: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  overallProgress: {
    width: '100%',
    marginVertical: 8,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeCategoryButton: {
    backgroundColor: '#E3F2FD',
  },
  categoryButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  achievementsGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: (screenWidth - 48) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementContent: {
    alignItems: 'center',
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedText: {
    color: '#999',
  },
  unlockedInfo: {
    alignItems: 'center',
  },
  achievementPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  unlockedDate: {
    fontSize: 10,
    color: '#999',
  },
  progressBar: {
    width: 100,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalProgress: {
    width: '100%',
    marginBottom: 20,
  },
  modalProgressBar: {
    marginBottom: 8,
  },
  modalProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalRewards: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalRewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalReward: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  unlockedDateModal: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
