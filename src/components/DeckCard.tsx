import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DeckCardProps {
  title: string;
  subtitle?: string;
  icon?: string; // emoji ok
  color: string; // base color
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

function lighten(hex: string, amount = 0.25) {
  try {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const lr = Math.min(255, Math.round(r + (255 - r) * amount));
    const lg = Math.min(255, Math.round(g + (255 - g) * amount));
    const lb = Math.min(255, Math.round(b + (255 - b) * amount));
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  } catch {
    return hex;
  }
}

export default function DeckCard({
  title,
  subtitle,
  icon,
  color,
  selected,
  onPress,
  testID,
}: DeckCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const startPress = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };
  const endPress = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const c1 = lighten(color, 0.25);
  const c2 = color;

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable onPress={onPress} onPressIn={startPress} onPressOut={endPress} testID={testID}>
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Check bubble */}
          {selected ? (
            <View style={[styles.badge, { backgroundColor: '#ffffff' }]}>
              <Text style={{ color: c2, fontWeight: '800' }}>✓</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: '#ffffff30' }]}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>+</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon ? <Text style={styles.icon}>{icon}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 104,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#ffffffcc',
    fontSize: 12,
    marginTop: 8,
  },
  badge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
