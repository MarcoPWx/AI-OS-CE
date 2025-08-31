import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TourLanding() {
  const start = () => {
    try {
      // Clear previous completion to ensure tour shows
      localStorage.removeItem('tour_completed');
    } catch {}
    window.location.href = '/?tour=1';
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Interactive Tour</Text>
        <Text style={styles.sub}>
          We’ll guide you through the core flows. You can close the tour anytime.
        </Text>
        <View style={{ height: 8 }} />
        <Text style={styles.list}>• Press Next to advance steps</Text>
        <Text style={styles.list}>• Close (×) to skip</Text>
        <Text style={styles.list}>• Open Storybook for component/system demos</Text>
        <View style={{ height: 14 }} />
        <TouchableOpacity onPress={start} style={styles.btn}>
          <Text style={styles.btnText}>Start Tour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => (window.location.href = '/')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'fixed' as any,
    inset: 0,
    backgroundColor: 'rgba(2,6,23,0.92)',
    display: 'grid',
    placeItems: 'center',
    padding: 16,
  },
  card: {
    width: 420,
    maxWidth: '90%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 18,
  },
  title: { color: '#e5e7eb', fontSize: 18, fontWeight: '800' },
  sub: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  list: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  btn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
  linkBtn: { paddingVertical: 10, alignItems: 'center' },
  linkText: { color: '#93c5fd', fontWeight: '700' },
});

