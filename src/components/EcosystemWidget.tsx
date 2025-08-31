// src/components/EcosystemWidget.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Modal,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Particle system for enhanced visual effects
const ParticleSystem: React.FC<{ isActive: boolean; theme: 'light' | 'dark' }> = ({
  isActive,
  theme,
}) => {
  const particles = useRef<Animated.Value[]>([]);
  const particleOpacities = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize particles
    for (let i = 0; i < 8; i++) {
      particles.current[i] = new Animated.Value(Math.random() * 360);
      particleOpacities.current[i] = new Animated.Value(0);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      // Start particle animations
      particles.current.forEach((particle, index) => {
        Animated.loop(
          Animated.timing(particle, {
            toValue: 360,
            duration: 3000 + index * 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(particleOpacities.current[index], {
              toValue: 0.6,
              duration: 1000 + index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(particleOpacities.current[index], {
              toValue: 0.1,
              duration: 1000 + index * 200,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    } else {
      particles.current.forEach((particle, index) => {
        particle.stopAnimation();
        particleOpacities.current[index].setValue(0);
      });
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((particle, index) => {
        const rotation = particle.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        const radius = 40 + index * 8;
        const translateX = particle.interpolate({
          inputRange: [0, 360],
          outputRange: [Math.cos(index * 0.785) * radius, Math.cos(index * 0.785 + 6.28) * radius],
        });
        const translateY = particle.interpolate({
          inputRange: [0, 360],
          outputRange: [Math.sin(index * 0.785) * radius, Math.sin(index * 0.785 + 6.28) * radius],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particleOpacities.current[index],
                transform: [{ translateX }, { translateY }, { rotate: rotation }],
                backgroundColor:
                  theme === 'dark'
                    ? `hsl(${220 + index * 20}, 70%, 60%)`
                    : `hsl(${200 + index * 15}, 60%, 50%)`,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// Enhanced glow effect component
const GlowEffect: React.FC<{ isActive: boolean; color: string[] }> = ({ isActive, color }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isActive]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[`${color[0]}20`, `${color[1]}40`, `${color[0]}20`]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

export interface Product {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  gradient: string[];
  url: string;
  status: 'live' | 'beta' | 'coming-soon';
  description?: string;
}

const products: Product[] = [
  {
    id: 'devmentor',
    name: 'DevMentor',
    tagline: 'AI Development Assistant',
    icon: '🧠',
    gradient: ['#667eea', '#764ba2'],
    url: 'https://devmentor.ai',
    status: 'beta',
    description:
      'AI assistant that learns your coding patterns and helps you write better code faster.',
  },
  {
    id: 'quizmentor',
    name: 'QuizMentor',
    tagline: 'Adaptive Learning Platform',
    icon: '🎓',
    gradient: ['#f093fb', '#f5576c'],
    url: 'https://quizmentor.ai',
    status: 'live',
    description:
      'Personalized quizzes that adapt to your learning pace and help you master programming concepts.',
  },
  {
    id: 'harvest',
    name: 'Harvest.ai',
    tagline: 'Smart Content Generation',
    icon: '🌾',
    gradient: ['#4facfe', '#00f2fe'],
    url: 'https://harvest.ai',
    status: 'live',
    description: 'AI-powered content generation and template system for developers and creators.',
  },
  {
    id: 'omni',
    name: 'Omni',
    tagline: 'Universal AI for VS Code',
    icon: '🔮',
    gradient: ['#43e97b', '#38f9d7'],
    url: 'https://omni.dev',
    status: 'coming-soon',
    description: 'One extension, every AI provider. The ultimate VS Code AI companion.',
  },
];

interface EcosystemWidgetProps {
  currentProduct?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark';
  expanded?: boolean;
}

export const EcosystemWidget: React.FC<EcosystemWidgetProps> = ({
  currentProduct = 'quizmentor',
  position = 'bottom-right',
  theme = 'dark',
  expanded: initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  // Enhanced Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;

  // Filter out current product from the list
  const otherProducts = products.filter((p) => p.id !== currentProduct);

  useEffect(() => {
    checkMinimizedState();
    startAnimations();
  }, []);

  useEffect(() => {
    if (isExpanded) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isExpanded]);

  const checkMinimizedState = async () => {
    try {
      const minimized = await AsyncStorage.getItem('ecosystem-widget-minimized');
      if (minimized === 'true') {
        setIsMinimized(true);
      }
    } catch (error) {
      console.warn('Failed to check minimized state:', error);
    }
  };

  const startAnimations = () => {
    // Continuous rotation for logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start();

    // Pulse animation for FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handleMinimize = async () => {
    setIsMinimized(true);
    setIsExpanded(false);

    try {
      await AsyncStorage.setItem('ecosystem-widget-minimized', 'true');

      // Show again after 7 days
      setTimeout(
        async () => {
          await AsyncStorage.removeItem('ecosystem-widget-minimized');
        },
        7 * 24 * 60 * 60 * 1000,
      );
    } catch (error) {
      console.warn('Failed to save minimized state:', error);
    }
  };

  const handleProductClick = async (product: Product) => {
    if (product.status === 'live' || product.status === 'beta') {
      try {
        await Linking.openURL(product.url);
      } catch (error) {
        console.warn('Failed to open URL:', error);
      }
    } else {
      setSelectedProduct(product);
    }
  };

  const handleTogglePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const getPositionStyle = () => {
    const baseStyle = { position: 'absolute' as const };
    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, bottom: 24, right: 24 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 24, left: 24 };
      case 'top-right':
        return { ...baseStyle, top: 24, right: 24 };
      case 'top-left':
        return { ...baseStyle, top: 24, left: 24 };
      default:
        return { ...baseStyle, bottom: 24, right: 24 };
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  // Minimized FAB state
  if (isMinimized) {
    return (
      <View style={[styles.container, getPositionStyle()]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsMinimized(false)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.fabGradient}>
              <Text style={styles.fabIcon}>🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPositionStyle()]}>
      {!isExpanded ? (
        // Collapsed state
        <Animated.View
          style={[
            styles.collapsed,
            theme === 'light' ? styles.collapsedLight : styles.collapsedDark,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleTogglePress}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.logoContainer, { transform: [{ rotate: rotation }] }]}>
              <View style={styles.logoRing}>
                <View style={[styles.logoRing, styles.logoRingInner]}>
                  <View style={[styles.logoRing, styles.logoRingCenter]} />
                </View>
              </View>
            </Animated.View>
            <Text
              style={[styles.toggleText, theme === 'light' ? styles.textLight : styles.textDark]}
            >
              Explore Our Apps
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme === 'light' ? '#333' : '#fff'}
            />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        // Expanded state
        <Animated.View
          style={[
            styles.expanded,
            theme === 'light' ? styles.expandedLight : styles.expandedDark,
            { transform: [{ translateX: slideTransform }] },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, theme === 'light' ? styles.headerLight : styles.headerDark]}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.headerTitle}>Our Product Ecosystem</Text>
            </LinearGradient>
            <TouchableOpacity
              style={[
                styles.closeButton,
                theme === 'light' ? styles.closeButtonLight : styles.closeButtonDark,
              ]}
              onPress={handleMinimize}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={theme === 'light' ? '#333' : '#fff'} />
            </TouchableOpacity>
          </View>

          {/* Products */}
          <View style={styles.productsContainer}>
            {otherProducts.map((product, index) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  theme === 'light' ? styles.productCardLight : styles.productCardDark,
                  product.status === 'coming-soon' && styles.productCardDisabled,
                ]}
                onPress={() => handleProductClick(product)}
                activeOpacity={0.8}
                disabled={product.status === 'coming-soon'}
              >
                <LinearGradient
                  colors={[...product.gradient, product.gradient[0]]}
                  style={styles.productIconContainer}
                >
                  <Text style={styles.productIcon}>{product.icon}</Text>
                </LinearGradient>

                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text
                      style={[
                        styles.productName,
                        theme === 'light' ? styles.textLight : styles.textDark,
                      ]}
                    >
                      {product.name}
                    </Text>
                    {product.status === 'beta' && (
                      <View style={styles.betaBadge}>
                        <Text style={styles.badgeText}>BETA</Text>
                      </View>
                    )}
                    {product.status === 'coming-soon' && (
                      <View style={styles.soonBadge}>
                        <Text style={styles.badgeText}>SOON</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.productTagline,
                      theme === 'light' ? styles.textLightSecondary : styles.textDarkSecondary,
                    ]}
                  >
                    {product.tagline}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme === 'light' ? '#999' : '#666'}
                  style={styles.productArrow}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={[styles.footer, theme === 'light' ? styles.footerLight : styles.footerDark]}
          >
            <Text
              style={[styles.footerText, theme === 'light' ? styles.textLight : styles.textDark]}
            >
              🎯 <Text style={styles.footerHighlight}>One Account, All Products</Text> - Sign in
              once, access everything
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Coming Soon Modal */}
      <Modal
        visible={!!selectedProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              theme === 'light' ? styles.modalContentLight : styles.modalContentDark,
            ]}
          >
            <Text style={styles.modalTitle}>{selectedProduct?.name} - Coming Soon! 🚀</Text>
            <Text
              style={[
                styles.modalDescription,
                theme === 'light' ? styles.textLightSecondary : styles.textDarkSecondary,
              ]}
            >
              {selectedProduct?.description}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSelectedProduct(null)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalButtonGradient}>
                <Text style={styles.modalButtonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
  },
  // FAB styles
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
  // Collapsed styles
  collapsed: {
    borderRadius: 24,
    padding: 4,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  collapsedDark: {
    backgroundColor: 'rgba(26, 26, 42, 0.95)',
    shadowColor: '#000',
  },
  collapsedLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  logoContainer: {
    marginRight: 12,
  },
  logoRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRingInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    opacity: 0.7,
  },
  logoRingCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    opacity: 0.5,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginRight: 12,
  },
  // Expanded styles
  expanded: {
    width: Math.min(screenWidth - 48, 380),
    maxHeight: 600,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  expandedDark: {
    backgroundColor: 'rgba(26, 26, 42, 0.98)',
    shadowColor: '#000',
  },
  expandedLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleGradient: {
    borderRadius: 4,
    paddingHorizontal: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'transparent',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  // Products styles
  productsContainer: {
    padding: 16,
    maxHeight: 400,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  productCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  productCardLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  productCardDisabled: {
    opacity: 0.7,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  productIcon: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  productTagline: {
    fontSize: 13,
    lineHeight: 18,
  },
  productArrow: {
    marginLeft: 8,
  },
  // Badge styles
  betaBadge: {
    backgroundColor: '#f5576c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  soonBadge: {
    backgroundColor: '#ffa500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Footer styles
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerLight: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footerHighlight: {
    color: '#667eea',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 300,
    alignItems: 'center',
  },
  modalContentDark: {
    backgroundColor: 'rgba(26, 26, 42, 0.98)',
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffa500',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Theme text styles
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#1a1a1a',
  },
  textDarkSecondary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  textLightSecondary: {
    color: 'rgba(26, 26, 26, 0.8)',
  },
});

export default EcosystemWidget;
