import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>QuizMentor</Text>
          <Text style={styles.subtitle}>Test Version - Web</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome!</Text>
          <Text style={styles.cardText}>If you can see this, the basic app is working.</Text>
          <Button title="Test Button" onPress={() => console.log('Button pressed!')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debug Info</Text>
          <Text style={styles.cardText}>Platform: Web</Text>
          <Text style={styles.cardText}>React Native Web is working</Text>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
});
