import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

// Lightweight animated bubbles background. No external deps.
// Usage: <BubblesBackground /> positioned absolutely behind content.

const BUBBLES = [
  { size: 8, left: '10%', delay: 0 },
  { size: 12, left: '25%', delay: 600 },
  { size: 16, left: '40%', delay: 1200 },
  { size: 10, left: '60%', delay: 900 },
  { size: 14, left: '75%', delay: 300 },
  { size: 9, left: '88%', delay: 1500 },
];

export default function BubblesBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      {BUBBLES.map((b, idx) => (
        <Bubble key={idx} size={b.size} left={b.left} delay={b.delay} />
      ))}
    </View>
  );
}

function Bubble({ size, left, delay }: { size: number; left: string; delay: number }) {
  const translateY = useRef(new Animated.Value(40 + Math.random() * 60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(40 + Math.random() * 60);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 5000 + Math.random() * 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
          delay,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          left,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
