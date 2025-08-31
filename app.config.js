// app.config.js - Expo configuration for QuizMentor
import 'dotenv/config';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_PREVIEW = process.env.EXPO_PUBLIC_ENV === 'preview';

export default {
  expo: {
    name: IS_PRODUCTION ? 'QuizMentor' : 'QuizMentor Dev',
    slug: 'quizmentor',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#667eea',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_PRODUCTION ? 'com.quizmentor.app' : 'com.quizmentor.dev',
      buildNumber: '1',
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan QR codes for quiz sharing.',
        NSMicrophoneUsageDescription: 'This app uses the microphone for voice-based quiz features.',
        NSLocationWhenInUseUsageDescription:
          'This app uses location to provide location-based quiz content.',
        ITSAppUsesNonExemptEncryption: false,
      },
      associatedDomains: ['applinks:quizmentor.app', 'applinks:www.quizmentor.app'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#667eea',
      },
      package: IS_PRODUCTION ? 'com.quizmentor.app' : 'com.quizmentor.dev',
      versionCode: 1,
      permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'CAMERA', 'RECORD_AUDIO'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'quizmentor.app',
            },
            {
              scheme: 'https',
              host: 'www.quizmentor.app',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'static',
      lang: 'en',
    },
    plugins: [
      // 'expo-router', // Disabled - using traditional React Native structure
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#667eea',
          sounds: ['./assets/sounds/notification.wav'],
        },
      ],
      [
        'expo-tracking-transparency',
        {
          userTrackingUsageDescription:
            'This app uses tracking to provide personalized quiz recommendations and improve your learning experience.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow QuizMentor to access your camera to scan QR codes for quiz sharing.',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'Allow QuizMentor to access your microphone for voice-based quiz features.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow QuizMentor to use your location to provide location-based quiz content.',
          locationAlwaysPermission:
            'Allow QuizMentor to use your location to provide location-based quiz content.',
          locationWhenInUsePermission:
            'Allow QuizMentor to use your location to provide location-based quiz content.',
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 23,
          },
        },
      ],
    ],
    // experiments: {
    //   typedRoutes: true
    // },
    extra: {
      // router: {
      //   origin: false
      // },
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-eas-project-id',
      },
    },
    owner: 'quizmentor',
    scheme: 'quizmentor',
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-eas-project-id'}`,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};
