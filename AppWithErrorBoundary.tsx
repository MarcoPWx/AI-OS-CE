import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Import the app we want to test
import AppWithPaywall from './AppWithPaywall';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>🚨 App Error</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message || 'Unknown error'}</Text>
          <Text style={styles.errorStack}>{this.state.error?.stack?.substring(0, 500)}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('App with error boundary starting...');

  try {
    return (
      <ErrorBoundary>
        <AppWithPaywall />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Immediate error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Immediate Error</Text>
        <Text style={styles.errorMessage}>{String(error)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#ff0000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorStack: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
});
