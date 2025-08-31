import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useQuiz } from '../store/QuizContext';

type CategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Categories'>;

export default function CategoriesScreen() {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const { categories } = useQuiz();

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate('Quiz', {
          categorySlug: item.slug,
          categoryName: item.name,
        })
      }
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.questionCount}>{item.questionCount} questions</Text>
      </View>
      <Text style={styles.categoryDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  questionCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
