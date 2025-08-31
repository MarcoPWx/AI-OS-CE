// src/services/soundEffects.ts
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export interface SoundEffect {
  id: string;
  name: string;
  sound?: Audio.Sound;
  haptic?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType;
}

class SoundEffectsService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  // Sound effect definitions
  private soundEffects: SoundEffect[] = [
    {
      id: 'coin_collect',
      name: 'Coin Collect',
      haptic: Haptics.ImpactFeedbackStyle.Light,
    },
    {
      id: 'power_up',
      name: 'Power Up',
      haptic: Haptics.ImpactFeedbackStyle.Medium,
    },
    {
      id: 'achievement_unlock',
      name: 'Achievement Unlock',
      haptic: Haptics.NotificationFeedbackType.Success,
    },
    {
      id: 'level_up',
      name: 'Level Up',
      haptic: Haptics.NotificationFeedbackType.Success,
    },
    {
      id: 'correct_answer',
      name: 'Correct Answer',
      haptic: Haptics.ImpactFeedbackStyle.Light,
    },
    {
      id: 'wrong_answer',
      name: 'Wrong Answer',
      haptic: Haptics.ImpactFeedbackStyle.Heavy,
    },
    {
      id: 'button_tap',
      name: 'Button Tap',
      haptic: Haptics.ImpactFeedbackStyle.Light,
    },
    {
      id: 'combo_break',
      name: 'Combo Break',
      haptic: Haptics.ImpactFeedbackStyle.Heavy,
    },
    {
      id: 'quiz_complete',
      name: 'Quiz Complete',
      haptic: Haptics.NotificationFeedbackType.Success,
    },
    {
      id: 'mascot_happy',
      name: 'Mascot Happy',
      haptic: Haptics.ImpactFeedbackStyle.Light,
    },
  ];

  async initialize() {
    try {
      // Set audio mode for games
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Load sound files (in a real app, you'd have actual sound files)
      // For now, we'll use haptics and procedural audio
      console.log('SoundEffectsService initialized');
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async playEffect(effectId: string, options?: { volume?: number; rate?: number }) {
    if (!this.isEnabled) return;

    const effect = this.soundEffects.find((e) => e.id === effectId);
    if (!effect) {
      console.warn(`Sound effect not found: ${effectId}`);
      return;
    }

    try {
      // Play haptic feedback
      if (this.hapticsEnabled && effect.haptic) {
        if (typeof effect.haptic === 'string') {
          // It's a NotificationFeedbackType
          await Haptics.notificationAsync(effect.haptic as Haptics.NotificationFeedbackType);
        } else {
          // It's an ImpactFeedbackStyle
          await Haptics.impactAsync(effect.haptic as Haptics.ImpactFeedbackStyle);
        }
      }

      // For now, we'll use procedural audio generation
      // In a real app, you'd load and play actual sound files
      this.generateProceduralSound(effectId, options);
    } catch (error) {
      console.warn(`Failed to play sound effect ${effectId}:`, error);
    }
  }

  private generateProceduralSound(effectId: string, options?: { volume?: number; rate?: number }) {
    // Procedural audio generation using Web Audio API (for web) or native audio (for mobile)
    // This is a simplified implementation - in a real app you'd use actual sound files

    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies and patterns for different effects
      switch (effectId) {
        case 'coin_collect':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.type = 'sine';
          break;

        case 'power_up':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.type = 'square';
          break;

        case 'achievement_unlock':
          // Triumphant chord progression
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.type = 'triangle';
          break;

        case 'correct_answer':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.05);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.type = 'sine';
          break;

        case 'wrong_answer':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.type = 'sawtooth';
          break;

        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.type = 'sine';
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }

  // Gaming-specific sound combinations
  async playComboSound(comboCount: number) {
    if (comboCount <= 1) return;

    // Higher pitch for higher combos
    const baseFreq = 600;
    const freq = baseFreq + comboCount * 50;

    await this.playEffect('correct_answer', { rate: 1 + comboCount * 0.1 });

    // Extra haptic for high combos
    if (comboCount >= 5) {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 100);
    }
  }

  async playLevelUpSequence() {
    await this.playEffect('level_up');

    // Celebratory sequence
    setTimeout(() => this.playEffect('achievement_unlock'), 200);
    setTimeout(() => this.playEffect('power_up'), 400);
  }

  async playMascotInteraction(mood: 'happy' | 'excited' | 'thinking') {
    switch (mood) {
      case 'happy':
        await this.playEffect('mascot_happy');
        break;
      case 'excited':
        await this.playEffect('power_up');
        break;
      case 'thinking':
        // Subtle thinking sound
        await Haptics.selectionAsync();
        break;
    }
  }

  // Settings
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  areHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  // Cleanup
  async cleanup() {
    for (const [id, sound] of this.sounds) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload sound ${id}:`, error);
      }
    }
    this.sounds.clear();
  }
}

export const soundEffectsService = new SoundEffectsService();
export default soundEffectsService;
