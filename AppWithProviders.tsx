import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QuizProvider } from './store/QuizContext';

// Simple test screens
function HomeScreen({ navigation }: any) {
  console.log('HomeScreen rendering with providers');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 QuizMentor</Text>
      <Text style={styles.subtitle}>With Providers</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Test')}>
        <Text style={styles.buttonText}>Go to Test Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

function TestScreen({ navigation }: any) {
  console.log('TestScreen rendering');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Screen</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  console.log('App with Providers is rendering!');

  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#3b82f6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'QuizMentor' }} />
            <Stack.Screen name="Test" component={TestScreen} options={{ title: 'Test' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
