// src/screens/SettingsScreenGameified.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundEffectsService from '../services/soundEffects';

const { width, height } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const FloatingGears: React.FC = () => {
  const gears = useRef([
    ...Array(6)
      .fill(0)
      .map((_, i) => ({
        id: `gear-${i}`,
        emoji: ['⚙️', '🔧', '🛠️', '⚡', '🎛️', '🔩'][i],
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0.3 + Math.random() * 0.4),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0.2 + Math.random() * 0.3),
      })),
  ]).current;

  useEffect(() => {
    gears.forEach((gear, index) => {
      // Slow rotation for gears
      Animated.loop(
        Animated.timing(gear.rotate, {
          toValue: 1,
          duration: 10000 + index * 2000,
          useNativeDriver: true,
        }),
      ).start();

      // Gentle floating
      Animated.loop(
        Animated.sequence([
          Animated.timing(gear.y, {
            toValue: Math.random() * height,
            duration: 15000 + index * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(gear.y, {
            toValue: Math.random() * height,
            duration: 15000 + index * 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {gears.map((gear, index) => {
        const rotation = gear.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={gear.id}
            style={[
              styles.floatingGear,
              {
                transform: [
                  { translateX: gear.x },
                  { translateY: gear.y },
                  { scale: gear.scale },
                  { rotate: rotation },
                ],
                opacity: gear.opacity,
              },
            ]}
          >
            <Text style={styles.gearEmoji}>{gear.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const SettingCard: React.FC<{
  setting: SettingItem;
  index: number;
}> = ({ setting, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [localValue, setLocalValue] = useState(setting.value || false);

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggle = (value: boolean) => {
    setLocalValue(value);
    setting.onToggle?.(value);

    // Play feedback sound
    soundEffectsService.playEffect('button_tap');
  };

  const handlePress = () => {
    soundEffectsService.playEffect('button_tap');
    setting.onPress?.();
  };

  return (
    <Animated.View style={[styles.settingCard, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.settingGradient}
      >
        <TouchableOpacity
          style={styles.settingContent}
          onPress={
            setting.type === 'action' || setting.type === 'navigation' ? handlePress : undefined
          }
          disabled={setting.type === 'toggle'}
        >
          <View style={styles.settingLeft}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>{setting.icon}</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
          </View>

          <View style={styles.settingRight}>
            {setting.type === 'toggle' && (
              <Switch
                value={localValue}
                onValueChange={handleToggle}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#4ade80' }}
                thumbColor={localValue ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="rgba(255,255,255,0.2)"
              />
            )}
            {setting.type === 'navigation' && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="rgba(255,255,255,0.5)"
              />
            )}
            {setting.type === 'action' && (
              <MaterialCommunityIcons name="play" size={24} color="#4ade80" />
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default function SettingsScreenGameified() {
  const navigation = useNavigation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();

    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        'sound_enabled',
        'haptics_enabled',
        'animations_enabled',
        'particles_enabled',
      ]);

      settings.forEach(([key, value]) => {
        const boolValue = value === 'true';
        switch (key) {
          case 'sound_enabled':
            setSoundEnabled(boolValue);
            soundEffectsService.setEnabled(boolValue);
            break;
          case 'haptics_enabled':
            setHapticsEnabled(boolValue);
            soundEffectsService.setHapticsEnabled(boolValue);
            break;
          case 'animations_enabled':
            setAnimationsEnabled(boolValue);
            break;
          case 'particles_enabled':
            setParticlesEnabled(boolValue);
            break;
        }
      });
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.warn(`Failed to save setting ${key}:`, error);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundEffectsService.setEnabled(enabled);
    saveSetting('sound_enabled', enabled);
  };

  const handleHapticsToggle = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    soundEffectsService.setHapticsEnabled(enabled);
    saveSetting('haptics_enabled', enabled);
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    saveSetting('animations_enabled', enabled);
  };

  const handleParticlesToggle = (enabled: boolean) => {
    setParticlesEnabled(enabled);
    saveSetting('particles_enabled', enabled);
  };

  const testSoundEffects = () => {
    soundEffectsService.playEffect('achievement_unlock');
    setTimeout(() => soundEffectsService.playEffect('coin_collect'), 200);
    setTimeout(() => soundEffectsService.playEffect('power_up'), 400);
  };

  const resetSettings = () => {
    Alert.alert('Reset Settings', 'Are you sure you want to reset all settings to default?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              'sound_enabled',
              'haptics_enabled',
              'animations_enabled',
              'particles_enabled',
            ]);

            // Reset to defaults
            setSoundEnabled(true);
            setHapticsEnabled(true);
            setAnimationsEnabled(true);
            setParticlesEnabled(true);

            soundEffectsService.setEnabled(true);
            soundEffectsService.setHapticsEnabled(true);

            soundEffectsService.playEffect('achievement_unlock');
          } catch (error) {
            console.warn('Failed to reset settings:', error);
          }
        },
      },
    ]);
  };

  const settings: SettingItem[] = [
    {
      id: 'sound',
      title: 'Sound Effects',
      description: 'Play audio feedback for interactions',
      icon: '🔊',
      type: 'toggle',
      value: soundEnabled,
      onToggle: handleSoundToggle,
    },
    {
      id: 'haptics',
      title: 'Haptic Feedback',
      description: 'Vibration feedback for touches',
      icon: '📳',
      type: 'toggle',
      value: hapticsEnabled,
      onToggle: handleHapticsToggle,
    },
    {
      id: 'animations',
      title: 'Animations',
      description: 'Enable smooth transitions and effects',
      icon: '✨',
      type: 'toggle',
      value: animationsEnabled,
      onToggle: handleAnimationsToggle,
    },
    {
      id: 'particles',
      title: 'Particle Effects',
      description: 'Show celebration particles and explosions',
      icon: '🎆',
      type: 'toggle',
      value: particlesEnabled,
      onToggle: handleParticlesToggle,
    },
    {
      id: 'test_sounds',
      title: 'Test Sound Effects',
      description: 'Play a sample of sound effects',
      icon: '🎵',
      type: 'action',
      onPress: testSoundEffects,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage push notifications',
      icon: '🔔',
      type: 'navigation',
      onPress: () => {
        // Navigate to notifications settings
        Alert.alert('Coming Soon', 'Notification settings will be available soon!');
      },
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      description: 'Manage your data and privacy settings',
      icon: '🔒',
      type: 'navigation',
      onPress: () => {
        Alert.alert('Coming Soon', 'Privacy settings will be available soon!');
      },
    },
    {
      id: 'reset',
      title: 'Reset Settings',
      description: 'Reset all settings to default values',
      icon: '🔄',
      type: 'action',
      onPress: resetSettings,
    },
  ];

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FloatingGears />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                soundEffectsService.playEffect('button_tap');
                navigation.goBack();
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.title}>⚙️ SETTINGS</Text>
              <Text style={styles.subtitle}>Customize your experience</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.settingsList}>
          {settings.map((setting, index) => (
            <SettingCard key={setting.id} setting={setting} index={index} />
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.appInfoGradient}
          >
            <Text style={styles.appInfoTitle}>QuizMentor</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            <Text style={styles.appInfoDescription}>Epic gaming experience for developers</Text>
            <View style={styles.appInfoEmojis}>
              <Text style={styles.appInfoEmoji}>🎮</Text>
              <Text style={styles.appInfoEmoji}>👨‍💻</Text>
              <Text style={styles.appInfoEmoji}>🚀</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    margin: 16,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  settingsList: {
    gap: 16,
    marginBottom: 32,
  },
  settingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  settingGradient: {
    padding: 20,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  settingRight: {
    marginLeft: 16,
  },
  appInfo: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  appInfoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  appInfoDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  appInfoEmojis: {
    flexDirection: 'row',
    gap: 16,
  },
  appInfoEmoji: {
    fontSize: 32,
  },
  floatingGear: {
    position: 'absolute',
  },
  gearEmoji: {
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
