import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

export default function App() {
  console.log('App is loading...');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>QuizMentor Debug</Text>
        <Text style={styles.subtitle}>If you see this, React Native Web is working!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Test Status</Text>
          <Text style={styles.cardText}>✅ React Native Web: Working</Text>
          <Text style={styles.cardText}>✅ Basic Components: Working</Text>
          <Text style={styles.cardText}>✅ Styles: Working</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 Debug Info</Text>
          <Text style={styles.cardText}>Platform: Web</Text>
          <Text style={styles.cardText}>Time: {new Date().toLocaleTimeString()}</Text>
        </View>

        <Button
          title="Test Button Click"
          onPress={() => {
            console.log('Button clicked!');
            alert('Button works!');
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
});
