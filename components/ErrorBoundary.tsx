import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error);
    console.error('Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    if (process.env.EXPO_PUBLIC_ENV === 'production') {
      // Send to error tracking service (Sentry, etc.)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <View style={styles.container}>
          <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#ef4444" />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              {process.env.EXPO_PUBLIC_DEMO_MODE === 'true'
                ? "We're running in demo mode. Some features may not be available."
                : 'We encountered an unexpected error. Please try again.'}
            </Text>

            {process.env.EXPO_PUBLIC_ENV === 'development' && this.state.error && (
              <TouchableOpacity style={styles.detailsButton} onPress={this.toggleDetails}>
                <Text style={styles.detailsButtonText}>
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </Text>
              </TouchableOpacity>
            )}

            {this.state.showDetails && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorName}>{this.state.error?.name || 'Error'}</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error?.message || 'Unknown error'}
                </Text>
                {this.state.errorInfo && (
                  <ScrollView style={styles.stackTrace}>
                    <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={this.handleReset}>
                <LinearGradient colors={['#0ea5e9', '#0369a1']} style={styles.buttonGradient}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              {process.env.EXPO_PUBLIC_DEMO_MODE === 'true' && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    // Reset to demo mode
                    this.handleReset();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Continue in Demo Mode</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpText}>If this problem persists, please try:</Text>
              <View style={styles.helpList}>
                <Text style={styles.helpItem}>• Restarting the app</Text>
                <Text style={styles.helpItem}>• Clearing app cache</Text>
                <Text style={styles.helpItem}>• Updating to the latest version</Text>
                {process.env.EXPO_PUBLIC_DEMO_MODE === 'true' && (
                  <Text style={styles.helpItem}>• Using demo features only</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 20,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailsButtonText: {
    color: '#0ea5e9',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorDetails: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#fca5a5',
    marginBottom: 12,
    lineHeight: 18,
  },
  stackTrace: {
    maxHeight: 150,
  },
  stackText: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helpSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    width: '100%',
    maxWidth: 320,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    textAlign: 'center',
  },
  helpList: {
    alignItems: 'flex-start',
  },
  helpItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
});

export default ErrorBoundary;
