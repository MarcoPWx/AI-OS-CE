import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

export default function ResultsScreen() {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();

  const { score, total, categoryName } = route.params;
  const percentage = Math.round((score / total) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', message: 'Outstanding!' };
    if (percentage >= 80) return { grade: 'A', color: '#10b981', message: 'Excellent!' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6', message: 'Good job!' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b', message: 'Not bad!' };
    return { grade: 'D', color: '#ef4444', message: 'Keep practicing!' };
  };

  const gradeInfo = getGrade();
  const starsEarned = Math.floor(score / 2);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Quiz Complete!</Text>
        <Text style={styles.category}>{categoryName}</Text>

        <View style={styles.scoreCircle}>
          <Text style={[styles.grade, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>
          <Text style={styles.scoreText}>
            {score}/{total}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <Text style={[styles.message, { color: gradeInfo.color }]}>{gradeInfo.message}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {starsEarned}</Text>
            <Text style={styles.statLabel}>Stars Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{score * 10} XP</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.tryAgainText}>Try Another Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  grade: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  percentageText: {
    fontSize: 18,
    color: '#6b7280',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonContainer: {
    width: '100%',
  },
  tryAgainButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  tryAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#e5e7eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
});
