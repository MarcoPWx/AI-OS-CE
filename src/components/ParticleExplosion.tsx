// src/components/ParticleExplosion.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  emoji: string;
  color: string;
}

interface ParticleExplosionProps {
  visible: boolean;
  centerX: number;
  centerY: number;
  particleCount?: number;
  duration?: number;
  type?: 'achievement' | 'levelup' | 'combo' | 'celebration';
  onComplete?: () => void;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  visible,
  centerX,
  centerY,
  particleCount = 20,
  duration = 2000,
  type = 'achievement',
  onComplete,
}) => {
  const particles = useRef<Particle[]>([]).current;

  // Initialize particles
  useEffect(() => {
    if (particles.length === 0) {
      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle: Particle = {
          id: `particle-${i}`,
          x: new Animated.Value(centerX),
          y: new Animated.Value(centerY),
          scale: new Animated.Value(0),
          rotate: new Animated.Value(0),
          opacity: new Animated.Value(1),
          emoji: getParticleEmoji(type, i),
          color: getParticleColor(type, i),
        };
        newParticles.push(particle);
      }

      particles.splice(0, particles.length, ...newParticles);
    }
  }, []);

  // Animate particles when visible
  useEffect(() => {
    if (visible && particles.length > 0) {
      animateExplosion();
    }
  }, [visible]);

  const getParticleEmoji = (type: string, index: number): string => {
    const emojiSets = {
      achievement: ['🏆', '⭐', '💎', '🎖️', '👑', '🔥', '✨', '💫'],
      levelup: ['🚀', '⚡', '🌟', '💥', '🎯', '💪', '🔥', '✨'],
      combo: ['💥', '⚡', '🔥', '💫', '✨', '💥', '⚡', '🔥'],
      celebration: ['🎉', '🎊', '🎈', '🎁', '🌟', '✨', '💫', '🎆'],
    };

    const emojis = emojiSets[type as keyof typeof emojiSets] || emojiSets.achievement;
    return emojis[index % emojis.length];
  };

  const getParticleColor = (type: string, index: number): string => {
    const colorSets = {
      achievement: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'],
      levelup: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F', '#9AFF9A'],
      combo: ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700'],
      celebration: ['#FF69B4', '#FF1493', '#DA70D6', '#BA55D3', '#9370DB'],
    };

    const colors = colorSets[type as keyof typeof colorSets] || colorSets.achievement;
    return colors[index % colors.length];
  };

  const animateExplosion = () => {
    const animations = particles.map((particle, index) => {
      // Random explosion direction
      const angle = (Math.PI * 2 * index) / particles.length + (Math.random() - 0.5) * 0.5;
      const distance = 100 + Math.random() * 150;
      const finalX = centerX + Math.cos(angle) * distance;
      const finalY = centerY + Math.sin(angle) * distance;

      return Animated.parallel([
        // Position animation
        Animated.timing(particle.x, {
          toValue: finalX,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: finalY + Math.random() * 100, // Add some gravity effect
          duration: duration * 0.8,
          useNativeDriver: true,
        }),

        // Scale animation
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1 + Math.random() * 0.5,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
        ]),

        // Rotation animation
        Animated.timing(particle.rotate, {
          toValue: Math.random() > 0.5 ? 1 : -1,
          duration: duration,
          useNativeDriver: true,
        }),

        // Opacity animation
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: duration * 0.9,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      // Reset particles for next use
      particles.forEach((particle) => {
        particle.x.setValue(centerX);
        particle.y.setValue(centerY);
        particle.scale.setValue(0);
        particle.rotate.setValue(0);
        particle.opacity.setValue(1);
      });

      onComplete?.();
    });
  };

  if (!visible || particles.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => {
        const rotateInterpolate = particle.rotate.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-360deg', '360deg'],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                  { rotate: rotateInterpolate },
                ],
                opacity: particle.opacity,
              },
            ]}
          >
            <Animated.Text style={[styles.particleEmoji, { color: particle.color }]}>
              {particle.emoji}
            </Animated.Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

// Hook for easy particle effects
export const useParticleExplosion = () => {
  const [explosion, setExplosion] = React.useState<{
    visible: boolean;
    centerX: number;
    centerY: number;
    type: 'achievement' | 'levelup' | 'combo' | 'celebration';
  }>({
    visible: false,
    centerX: 0,
    centerY: 0,
    type: 'achievement',
  });

  const triggerExplosion = (
    x: number,
    y: number,
    type: 'achievement' | 'levelup' | 'combo' | 'celebration' = 'achievement',
  ) => {
    setExplosion({
      visible: true,
      centerX: x,
      centerY: y,
      type,
    });
  };

  const hideExplosion = () => {
    setExplosion((prev) => ({ ...prev, visible: false }));
  };

  return {
    explosion,
    triggerExplosion,
    hideExplosion,
  };
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ParticleExplosion;
