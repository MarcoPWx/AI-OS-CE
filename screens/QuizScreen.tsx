import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useQuiz } from '../store/QuizContext';

type QuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

export default function QuizScreen() {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const route = useRoute<QuizScreenRouteProp>();
  const { getQuestionsByCategory, updateStats } = useQuiz();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const categoryQuestions = getQuestionsByCategory(route.params.categorySlug);
    // Shuffle and take first 10 questions
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(10, shuffled.length)));
  }, [route.params.categorySlug]);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;

    setSelectedAnswer(answerIndex);
    setAnswered(true);
    setShowExplanation(true);

    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      updateStats(true);
    } else {
      updateStats(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswered(false);
    } else {
      // Quiz completed
      navigation.replace('Results', {
        score,
        total: questions.length,
        categoryName: route.params.categoryName,
      });
    }
  };

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>
          Score: {score}/{questions.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrect = answered && isCorrect;
            const showWrong = answered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.correctOption,
                  showWrong && styles.wrongOption,
                  isSelected && !answered && styles.selectedOption,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={answered}
              >
                <Text
                  style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.answeredOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && currentQuestion.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </View>

      {answered && (
        <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#6b7280',
  },
  progressContainer: {
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  questionCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 12,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  correctOption: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  wrongOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  answeredOptionText: {
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
