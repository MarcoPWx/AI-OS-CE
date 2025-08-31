// src/components/GamificationComponents.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AnimationService from '../services/animations';
import GamificationService from '../services/gamification';

const { width, height } = Dimensions.get('window');

// XP Bar Component with animations
export const XPBar: React.FC<{
  currentXP: number;
  levelXP: number;
  level: number;
  animated?: boolean;
}> = ({ currentXP, levelXP, level, animated = true }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const progress = currentXP / levelXP;

    if (animated) {
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [currentXP, levelXP]);

  return (
    <Animated.View style={[styles.xpContainer, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {currentXP} / {levelXP} XP
        </Text>
      </View>
      <View style={styles.xpBarBg}>
        <Animated.View
          style={[
            styles.xpBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// Streak Counter with Fire Animation
export const StreakCounter: React.FC<{
  streak: number;
  showWarning?: boolean;
}> = ({ streak, showWarning }) => {
  const fireAnim = useRef(new Animated.Value(0)).current;
  const warningAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fire animation intensity based on streak
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, {
          toValue: 1,
          duration: 1000 / (1 + streak * 0.1), // Faster with higher streak
          useNativeDriver: true,
        }),
        Animated.timing(fireAnim, {
          toValue: 0,
          duration: 1000 / (1 + streak * 0.1),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Warning pulse if streak is in danger
    if (showWarning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [streak, showWarning]);

  const fireScale = fireAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2 + streak * 0.01],
  });

  return (
    <View style={styles.streakContainer}>
      <Animated.View
        style={[
          styles.streakIcon,
          {
            transform: [{ scale: fireScale }],
            opacity: showWarning ? warningAnim : 1,
          },
        ]}
      >
        <Text style={styles.fireEmoji}>🔥</Text>
      </Animated.View>
      <Text style={[styles.streakText, showWarning && styles.warningText]}>
        {streak} Day{streak !== 1 ? 's' : ''}
      </Text>
      {showWarning && <Text style={styles.streakWarning}>Don't lose your streak!</Text>}
    </View>
  );
};

// Combo Multiplier Display
export const ComboMultiplier: React.FC<{
  multiplier: number;
  show: boolean;
}> = ({ multiplier, show }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show && multiplier > 1) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1 + multiplier * 0.1,
          tension: 40,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 2 seconds
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
    }
  }, [multiplier, show]);

  if (!show || multiplier <= 1) return null;

  return (
    <Animated.View
      style={[
        styles.comboContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} style={styles.comboGradient}>
        <Text style={styles.comboText}>COMBO x{multiplier.toFixed(1)}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Achievement Popup with Particles
export const AchievementPopup: React.FC<{
  achievement: any;
  visible: boolean;
  onClose: () => void;
}> = ({ achievement, visible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array(8)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
      })),
  ).current;

  useEffect(() => {
    if (visible) {
      // Main achievement animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Particle explosion
      particleAnims.forEach((particle, index) => {
        const angle = (index / particleAnims.length) * Math.PI * 2;
        const distance = 150;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            delay: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Auto close after 3 seconds
      setTimeout(onClose, 3000);
    }
  }, [visible]);

  if (!visible || !achievement) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.achievementModal}>
        <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />

        {/* Particles */}
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [{ translateX: particle.x }, { translateY: particle.y }],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        {/* Achievement Badge */}
        <Animated.View
          style={[
            styles.achievementBadge,
            {
              transform: [{ scale: scaleAnim }, { rotate: rotation }],
            },
          ]}
        >
          <LinearGradient
            colors={
              achievement.tier === 'platinum'
                ? ['#E5E5E5', '#FFFFFF', '#E5E5E5']
                : achievement.tier === 'gold'
                  ? ['#FFD700', '#FFA500', '#FFD700']
                  : achievement.tier === 'silver'
                    ? ['#C0C0C0', '#FFFFFF', '#C0C0C0']
                    : ['#CD7F32', '#8B4513', '#CD7F32']
            }
            style={styles.badgeGradient}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.achievementName}>{achievement.name}</Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>
        <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>

        <TouchableOpacity style={styles.achievementClose} onPress={onClose}>
          <Text style={styles.closeText}>Awesome!</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// Daily Bonus Modal (Dark Pattern: Daily Hook)
export const DailyBonusModal: React.FC<{
  visible: boolean;
  day: number;
  rewards: any[];
  onClaim: () => void;
  onClose: () => void;
  timeLeft: number;
}> = ({ visible, day, rewards, onClaim, onClose, timeLeft }) => {
  const [claimed, setClaimed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ),
      ]).start();
    }
  }, [visible]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.dailyModal}>
        <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />

        <Animated.View style={[styles.dailyContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.dailyHeader}>
            <Text style={styles.dailyTitle}>Daily Bonus - Day {day}</Text>
            <Text style={styles.dailyTimer}>
              {claimed ? 'Come back tomorrow!' : `Expires in ${formatTime(timeLeft)}`}
            </Text>
          </LinearGradient>

          <View style={styles.dailyRewards}>
            {rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <View style={styles.rewardIcon}>
                  {reward.type === 'xp' && <Text style={styles.rewardEmoji}>⭐</Text>}
                  {reward.type === 'powerup' && <Text style={styles.rewardEmoji}>🎁</Text>}
                  {reward.type === 'badge' && <Text style={styles.rewardEmoji}>🏆</Text>}
                </View>
                <Text style={styles.rewardText}>
                  {reward.type === 'xp' && `${reward.amount} XP`}
                  {reward.type === 'powerup' && reward.item?.name}
                  {reward.type === 'badge' && reward.item?.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Streak Calendar Preview (Dark Pattern: Show what they'll lose) */}
          <View style={styles.streakCalendar}>
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.calendarDay,
                    i < day && styles.calendarDayComplete,
                    i === day - 1 && styles.calendarDayToday,
                  ]}
                >
                  <Text style={styles.calendarDayText}>{i + 1}</Text>
                  {i < day && <Text style={styles.checkmark}>✓</Text>}
                </View>
              ))}
          </View>

          <View style={styles.dailyActions}>
            {!claimed ? (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => {
                  setClaimed(true);
                  onClaim();
                }}
              >
                <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.claimGradient}>
                  <Text style={styles.claimText}>CLAIM REWARDS</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneText}>Awesome!</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* FOMO Text */}
          {!claimed && <Text style={styles.fomoText}>Don't break your {day} day streak! 🔥</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
};

// Quest Card Component
export const QuestCard: React.FC<{
  quest: any;
  onPress: () => void;
}> = ({ quest, onPress }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: quest.progress / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Update timer for special quests
    if (quest.type === 'special') {
      const timer = setInterval(() => {
        const now = Date.now();
        const expires = new Date(quest.expiresAt).getTime();
        const left = Math.max(0, expires - now);
        setTimeLeft(left);

        if (left === 0) clearInterval(timer);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quest]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <TouchableOpacity style={styles.questCard} onPress={onPress}>
      {quest.type === 'special' && (
        <View style={styles.questSpecialBadge}>
          <Text style={styles.questSpecialText}>⚡ LIMITED TIME</Text>
        </View>
      )}

      <View style={styles.questHeader}>
        <Text style={styles.questName}>{quest.name}</Text>
        {quest.type === 'special' && <Text style={styles.questTimer}>{formatTime(timeLeft)}</Text>}
      </View>

      <Text style={styles.questDescription}>{quest.description}</Text>

      <View style={styles.questProgress}>
        <View style={styles.questProgressBg}>
          <Animated.View
            style={[
              styles.questProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.questProgressText}>{quest.progress.toFixed(0)}%</Text>
      </View>

      <View style={styles.questRewards}>
        {quest.rewards.map((reward: any, index: number) => (
          <View key={index} style={styles.questReward}>
            <Text style={styles.questRewardText}>
              {reward.type === 'xp' && `+${reward.amount} XP`}
              {reward.type === 'powerup' && `${reward.item?.name}`}
              {reward.type === 'badge' && `🏆 ${reward.item?.name}`}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

// Leaderboard Entry (Dark Pattern: Social Comparison)
export const LeaderboardEntry: React.FC<{
  rank: number;
  user: any;
  isCurrentUser: boolean;
  previousRank?: number;
}> = ({ rank, user, isCurrentUser, previousRank }) => {
  const scaleAnim = useRef(new Animated.Value(isCurrentUser ? 1.05 : 1)).current;
  const rankChange = previousRank ? previousRank - rank : 0;

  useEffect(() => {
    if (isCurrentUser) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isCurrentUser]);

  const getRankIcon = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <Animated.View
      style={[
        styles.leaderboardEntry,
        isCurrentUser && styles.currentUserEntry,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{getRankIcon() || `#${rank}`}</Text>
        {rankChange !== 0 && (
          <View style={styles.rankChange}>
            <Ionicons
              name={rankChange > 0 ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={rankChange > 0 ? '#4ade80' : '#f87171'}
            />
            <Text
              style={[styles.rankChangeText, { color: rankChange > 0 ? '#4ade80' : '#f87171' }]}
            >
              {Math.abs(rankChange)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {user.name || 'Anonymous'} {isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.userLevel}>Level {user.level}</Text>
        </View>
      </View>

      <View style={styles.userScore}>
        <Text style={styles.userXP}>{user.xp.toLocaleString()} XP</Text>
        {user.streak > 0 && (
          <View style={styles.userStreak}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakDays}>{user.streak}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Power-Up Button
export const PowerUpButton: React.FC<{
  powerUp: any;
  onUse: () => void;
  disabled?: boolean;
}> = ({ powerUp, onUse, disabled }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!disabled && powerUp.quantity > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [disabled, powerUp]);

  const getIcon = () => {
    switch (powerUp.type) {
      case 'xp_boost':
        return '⚡';
      case 'time_freeze':
        return '⏰';
      case 'skip_question':
        return '⏭️';
      case 'hint':
        return '💡';
      case 'double_points':
        return '2️⃣';
      default:
        return '🎁';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.powerUpButton, disabled && styles.powerUpDisabled]}
      onPress={onUse}
      disabled={disabled || powerUp.quantity === 0}
    >
      <Animated.View style={[styles.powerUpContent, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.powerUpIcon}>{getIcon()}</Text>
        <Text style={styles.powerUpQuantity}>{powerUp.quantity}</Text>
        {powerUp.expiresAt && (
          <Text style={styles.powerUpExpiry}>
            {new Date(powerUp.expiresAt).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // XP Bar Styles
  xpContainer: {
    padding: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpText: {
    fontSize: 14,
    color: '#aaa',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Streak Styles
  streakContainer: {
    alignItems: 'center',
    padding: 12,
  },
  streakIcon: {
    marginBottom: 4,
  },
  fireEmoji: {
    fontSize: 32,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  warningText: {
    color: '#ff6b6b',
  },
  streakWarning: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
  },

  // Combo Styles
  comboContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 1000,
  },
  comboGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  comboText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Achievement Styles
  achievementModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadge: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 48,
  },
  achievementName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  achievementDesc: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 16,
  },
  achievementXP: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 24,
  },
  achievementClose: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd700',
  },

  // Daily Bonus Styles
  dailyModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyContainer: {
    width: width * 0.9,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
  },
  dailyHeader: {
    padding: 20,
    alignItems: 'center',
  },
  dailyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dailyTimer: {
    fontSize: 14,
    color: '#ffd700',
    marginTop: 4,
  },
  dailyRewards: {
    padding: 20,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardText: {
    fontSize: 16,
    color: '#fff',
  },
  streakCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayComplete: {
    backgroundColor: '#4CAF50',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#fff',
  },
  checkmark: {
    position: 'absolute',
    fontSize: 16,
    color: '#fff',
  },
  dailyActions: {
    padding: 20,
  },
  claimButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  claimText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  fomoText: {
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: 14,
    paddingBottom: 20,
  },

  // Quest Styles
  questCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questSpecialBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  questSpecialText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  questTimer: {
    fontSize: 12,
    color: '#ff6b6b',
  },
  questDescription: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginRight: 8,
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: 12,
    color: '#fff',
  },
  questRewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  questReward: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  questRewardText: {
    fontSize: 12,
    color: '#ffd700',
  },

  // Leaderboard Styles
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserEntry: {
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rankChangeText: {
    fontSize: 10,
    marginLeft: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 16,
    color: '#fff',
  },
  currentUserName: {
    color: '#ffd700',
  },
  userLevel: {
    fontSize: 12,
    color: '#aaa',
  },
  userScore: {
    alignItems: 'flex-end',
  },
  userXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakDays: {
    fontSize: 12,
    color: '#ff6b6b',
    marginLeft: 2,
  },

  // Power-Up Styles
  powerUpButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  powerUpDisabled: {
    opacity: 0.5,
  },
  powerUpContent: {
    alignItems: 'center',
  },
  powerUpIcon: {
    fontSize: 24,
  },
  powerUpQuantity: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  powerUpExpiry: {
    fontSize: 8,
    color: '#ffd700',
  },
});
