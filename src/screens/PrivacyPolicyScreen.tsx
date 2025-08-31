import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { privacyPolicyContent } from '../constants/legalContent';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            QuizMentor ("we", "our", or "us") is committed to protecting your privacy and ensuring
            compliance with global privacy regulations, including the General Data Protection
            Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>

          <Text style={styles.subTitle}>Information You Provide</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>
              • Account Information: Email, username, display name, profile picture
            </Text>
            <Text style={styles.bulletPoint}>
              • Authentication Data: OAuth tokens from social providers
            </Text>
            <Text style={styles.bulletPoint}>
              • User Content: Quiz answers, achievements, custom avatars
            </Text>
            <Text style={styles.bulletPoint}>
              • Preferences: Notification settings, privacy preferences
            </Text>
          </View>

          <Text style={styles.subTitle}>Information Collected Automatically</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>
              • Usage Data: Quiz scores, streaks, XP points, achievements
            </Text>
            <Text style={styles.bulletPoint}>
              • Device Information: Device type, OS, app version
            </Text>
            <Text style={styles.bulletPoint}>
              • Analytics Data: App usage patterns (anonymized)
            </Text>
            <Text style={styles.bulletPoint}>
              • Session Information: Login times, last activity
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights (GDPR Compliance)</Text>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Access</Text>
            <Text style={styles.rightDescription}>
              Request a copy of all personal data we hold about you
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Rectification</Text>
            <Text style={styles.rightDescription}>Update your profile information at any time</Text>
          </View>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Erasure</Text>
            <Text style={styles.rightDescription}>
              Request complete deletion of your account and data
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Data Portability</Text>
            <Text style={styles.rightDescription}>
              Export your data in machine-readable format (JSON)
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Restrict Processing</Text>
            <Text style={styles.rightDescription}>
              Limit how we use your data through privacy settings
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Text style={styles.rightTitle}>Right to Object</Text>
            <Text style={styles.rightDescription}>
              Opt-out of marketing and certain data processing
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard encryption protocols, regular security audits, access
            controls, and regular backups to protect your data. Your data is stored securely in
            Supabase cloud infrastructure with encryption at rest and in transit.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.importantText}>We DO NOT sell your personal information.</Text>
          <Text style={styles.paragraph}>
            We may share data only with your explicit consent, to comply with legal obligations,
            with service providers under strict confidentiality agreements, or in anonymized,
            aggregated form for research.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            QuizMentor is not intended for users under 13 years of age. We do not knowingly collect
            personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            For privacy-related questions or to exercise your rights:
          </Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleEmailPress('privacy@quizmentor.app')}
          >
            <Ionicons name="mail-outline" size={20} color="#4F46E5" />
            <Text style={styles.contactText}>privacy@quizmentor.app</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleEmailPress('dpo@quizmentor.app')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#4F46E5" />
            <Text style={styles.contactText}>dpo@quizmentor.app (Data Protection Officer)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using QuizMentor, you consent to this Privacy Policy. You may withdraw consent at any
            time by deleting your account.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 6,
  },
  rightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  importantText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#4F46E5',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
