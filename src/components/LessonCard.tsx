// src/components/LessonCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

export type LessonDifficulty = 'easy' | 'medium' | 'hard';

export interface LessonCardProps {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  progress?: number; // 0..1
  locked?: boolean;
  completed?: boolean;
  xpReward?: number;
  difficulty?: LessonDifficulty;
  onPress?: () => void;
  style?: ViewStyle;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  icon,
  color = '#4f46e5',
  progress = 0,
  locked = false,
  completed = false,
  xpReward,
  difficulty,
  onPress,
  style,
}) => {
  const pct = clamp01(progress);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={locked}
      style={[styles.card, style, locked && styles.cardLocked, completed && styles.cardCompleted]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{locked ? '🔒' : icon || '📘'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={1}>
            {title}
          </Text>
          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
        {difficulty ? <Text style={styles.difficulty}>{difficulty}</Text> : null}
      </View>

      {!locked && (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(pct * 100)}%</Text>
        </View>
      )}

      <View style={styles.footer}>
        {xpReward != null ? <Text style={styles.meta}>+{xpReward} XP</Text> : <View />}
        {completed ? (
          <Text style={[styles.meta, styles.completedText]}>Completed</Text>
        ) : locked ? (
          <Text style={[styles.meta, styles.lockedText]}>Locked</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default LessonCard;

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
    width: 300,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardCompleted: {
    borderColor: '#10b981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
  },
  titleCompleted: {
    color: '#a7f3d0',
  },
  description: {
    color: '#9ca3af',
    fontSize: 12,
  },
  difficulty: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    color: '#10b981',
  },
  lockedText: {
    color: '#f59e0b',
  },
});
