// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

// Import auth hook and services
import { useAuth } from '../contexts/AuthContext';
import AnimationService from '../services/animations';
import GamificationService from '../services/gamification';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable web browser completion for auth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();
  const {
    user,
    loading: authLoading,
    error: authError,
    signIn,
    signUp,
    signInWithGitHub,
    resetPassword,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigation.navigate('Home' as never);
    }
  }, [user, authLoading, navigation]);

  // Clear error when component unmounts or auth error changes
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      clearError();
    }
  }, [authError, clearError]);

  // Handle GitHub OAuth
  const handleGitHubSignIn = async () => {
    try {
      setLocalError(null);
      setLoading(true);
      await signInWithGitHub();
      // Success will redirect automatically via useEffect
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  // GitHub callback is now handled by the AuthContext automatically

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (isSignup && !acceptedTerms) {
      Alert.alert('Terms Required', 'You must accept the terms and privacy policy');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      if (isSignup) {
        // Sign up new user
        await signUp(email, password);

        Alert.alert('Success!', 'Your account has been created. You can now sign in.', [
          { text: 'OK', onPress: () => setIsSignup(false) },
        ]);
      } else {
        // Sign in existing user
        await signIn(email, password);

        // Initialize gamification for logged in user
        await GamificationService.initialize();
        await GamificationService.checkDailyLogin();

        // Navigation will be handled by useEffect when user state changes
      }
    } catch (error: any) {
      setLocalError(error.message || 'Authentication failed');
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    if (isSignup && !acceptedTerms) {
      Alert.alert('Terms Required', 'You must accept the terms and privacy policy');
      return;
    }

    handleGitHubSignIn();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Enter Email', 'Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert('Check Your Email', 'We sent you a password reset link');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>QuizMentor</Text>
          <Text style={styles.subtitle}>{isSignup ? 'Create your account' : 'Welcome back!'}</Text>
        </View>

        {/* GitHub OAuth Button */}
        <TouchableOpacity
          style={styles.githubButton}
          onPress={handleGitHubLogin}
          disabled={loading}
        >
          <LinearGradient colors={['#24292e', '#1a1e22']} style={styles.githubGradient}>
            <MaterialCommunityIcons name="github" size={24} color="#fff" />
            <Text style={styles.githubText}>
              {isSignup ? 'Sign up with GitHub' : 'Sign in with GitHub'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8b949e" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8b949e"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8b949e" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8b949e"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {isSignup && (
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Terms' as never)}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Privacy' as never)}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          {!isSignup && (
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <LinearGradient colors={['#58a6ff', '#1f6feb']} style={styles.submitGradient}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.switchText}>{isSignup ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        {/* Skip for now (dev mode) */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace('Home' as never)}
          >
            <Text style={styles.skipText}>Skip Login (Dev Mode)</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e',
  },
  githubButton: {
    marginBottom: 24,
  },
  githubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  githubText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#30363d',
  },
  dividerText: {
    color: '#8b949e',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
    paddingLeft: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#30363d',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#58a6ff',
    borderColor: '#58a6ff',
  },
  termsText: {
    flex: 1,
    color: '#8b949e',
    fontSize: 14,
  },
  link: {
    color: '#58a6ff',
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    color: '#58a6ff',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#8b949e',
    fontSize: 14,
  },
  switchText: {
    color: '#58a6ff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  skipText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
