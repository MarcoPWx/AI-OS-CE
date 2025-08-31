import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function MockBanner() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>Demo Mock Build — No real backend</Text>
        <Text style={styles.sub}>Logs enabled • Platform: {Platform.OS}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 9999,
  },
  pill: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.6)',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  sub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
});

