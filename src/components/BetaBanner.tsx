import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';

interface BetaBannerProps {
  storybookPath?: string; // default /storybook/
}

export default function BetaBanner({ storybookPath = '/storybook/' }: BetaBannerProps) {
  const open = (href: string) => {
    if (Platform.OS === 'web') {
      try { window.location.href = href; } catch { Linking.openURL(href).catch(() => {}); }
      return;
    }
    Linking.openURL(href).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.title}>Protected / BETA demo</Text>
        <Text style={styles.sub}>Tour mode enabled — explore the guided experience.</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => open('/?duo=1')} style={[styles.btn, styles.secondary]}>
            <Text style={styles.btnText}>Open Device Duo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open('/?tour=1')} style={[styles.btn, styles.primary]}>
            <Text style={styles.btnText}>Start Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => open(storybookPath)} style={[styles.btn, styles.secondary]}>
            <Text style={styles.btnText}>Open Storybook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    top: 8,
    left: 8,
    zIndex: 10000,
  },
  pill: {
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.5)',
    maxWidth: 420,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '800',
  },
  sub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.5)',
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  btnText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
  },
});

