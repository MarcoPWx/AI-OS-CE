import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
}

const categories: Category[] = [
  {
    id: 'js-fundamentals',
    name: 'JavaScript Fundamentals',
    description: 'Core concepts, syntax, and ES6+ features',
    icon: 'language-javascript',
    color: '#f0db4f',
    questionCount: 45,
  },
  {
    id: 'react',
    name: 'React',
    description: 'Components, hooks, state management',
    icon: 'react',
    color: '#61dafb',
    questionCount: 40,
  },
  {
    id: 'node',
    name: 'Node.js',
    description: 'Server-side JavaScript and APIs',
    icon: 'nodejs',
    color: '#68a063',
    questionCount: 35,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Type system and advanced patterns',
    icon: 'language-typescript',
    color: '#007acc',
    questionCount: 30,
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python basics and advanced topics',
    icon: 'language-python',
    color: '#3776ab',
    questionCount: 50,
  },
  {
    id: 'web-security',
    name: 'Web Security',
    description: 'Security best practices and vulnerabilities',
    icon: 'shield-check',
    color: '#ff6b6b',
    questionCount: 25,
  },
  {
    id: 'databases',
    name: 'Databases',
    description: 'SQL, NoSQL, and database design',
    icon: 'database',
    color: '#336791',
    questionCount: 30,
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, Docker, Kubernetes',
    icon: 'docker',
    color: '#0db7ed',
    questionCount: 28,
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    description: 'Data structures and algorithms',
    icon: 'graph',
    color: '#9c27b0',
    questionCount: 40,
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Architecture and scalability',
    icon: 'sitemap',
    color: '#ff9800',
    questionCount: 20,
  },
];

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Quiz', {
      category: category.id,
      categoryName: category.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>All Categories</Text>
          <Text style={styles.subtitle}>Choose a topic to practice</Text>
        </View>

        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Icon name={category.icon} size={32} color={category.color} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {category.description}
              </Text>
              <View style={styles.questionCountContainer}>
                <Icon name="help-circle-outline" size={16} color="#666" />
                <Text style={styles.questionCount}>{category.questionCount} questions</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#586069',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#586069',
    lineHeight: 18,
    marginBottom: 12,
  },
  questionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
