// src/screens/LoginScreenNew.tsx
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import auth hook and services
import { useAuth } from '../hooks/useAuth';
import AnimationService from '../services/animations';

export default function LoginScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.initialized) {
      navigation.navigate('Home' as never);
    }
  }, [auth.isAuthenticated, auth.initialized, navigation]);

  // Handle GitHub OAuth
  const handleGitHubSignIn = async () => {
    try {
      setError(null);
      const { error } = await auth.signInWithGitHub();

      if (error) {
        setError(auth.getErrorMessage(error));
      }
      // Success will be handled by the auth state change
    } catch (err) {
      setError('Failed to sign in with GitHub');
    }
  };

  // Handle email/password authentication
  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (isSignup && !acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError(null);

      if (isSignup) {
        const { error } = await auth.signUpWithEmail(email, password, {
          display_name: email.split('@')[0],
        });

        if (error) {
          setError(auth.getErrorMessage(error));
        } else {
          Alert.alert(
            'Check your email',
            'We sent you a confirmation link to complete your registration.',
          );
        }
      } else {
        const { error } = await auth.signInWithEmail(email, password);

        if (error) {
          setError(auth.getErrorMessage(error));
        }
        // Success will be handled by the auth state change
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError(null);
      const { error } = await auth.resetPassword(email);

      if (error) {
        setError(auth.getErrorMessage(error));
      } else {
        Alert.alert('Password Reset', 'Check your email for password reset instructions.');
      }
    } catch (err) {
      setError('Failed to send password reset email');
    }
  };

  if (!auth.initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>QuizMentor</Text>
              <Text style={styles.subtitle}>
                {isSignup ? 'Create your account' : 'Welcome back'}
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* GitHub OAuth Button */}
            <TouchableOpacity
              style={styles.githubButton}
              onPress={handleGitHubSignIn}
              disabled={auth.loading}
            >
              <MaterialCommunityIcons name="github" size={24} color="#fff" />
              <Text style={styles.githubButtonText}>
                {isSignup ? 'Sign up with GitHub' : 'Sign in with GitHub'}
              </Text>
              {auth.loading && (
                <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#aaa"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            {/* Terms Checkbox (for signup) */}
            {isSignup && (
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Auth Button */}
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleEmailAuth}
              disabled={auth.loading}
            >
              <Text style={styles.authButtonText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
              {auth.loading && (
                <ActivityIndicator size="small" color="#fff" style={styles.buttonLoader} />
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            {!isSignup && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot your password?</Text>
              </TouchableOpacity>
            )}

            {/* Switch Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSignup(!isSignup);
                  setError(null);
                }}
              >
                <Text style={styles.switchLink}>{isSignup ? 'Sign In' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 8,
    flex: 1,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24292e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonLoader: {
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.8)',
    marginHorizontal: 16,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  passwordToggle: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  termsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    flex: 1,
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  switchLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});
