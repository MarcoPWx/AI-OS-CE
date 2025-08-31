import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Minimal app shell to keep things compiling while we clean up
export default function AppProfessionalRefined() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>QuizMentor</Text>
      <Text style={styles.sub}>
        {Platform.OS === 'web'
          ? 'Open /tour to start the guided tour, or /?duo=1 for Device Duo.'
          : 'Run on web for the tour (/tour) and Device Duo (/?duo=1).'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '900' },
  sub: { color: '#94a3b8', marginTop: 8 },
});

