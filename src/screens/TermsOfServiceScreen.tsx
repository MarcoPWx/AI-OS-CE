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

export const TermsOfServiceScreen: React.FC = () => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using QuizMentor ("the Service"), you agree to be bound by these Terms
            of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>QuizMentor is a mobile application that provides:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Educational quizzes and learning experiences</Text>
            <Text style={styles.bulletPoint}>
              • Gamification features including achievements and leaderboards
            </Text>
            <Text style={styles.bulletPoint}>• Social features for sharing progress</Text>
            <Text style={styles.bulletPoint}>• Personalized learning recommendations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Requirements</Text>
            <Text style={styles.cardText}>• You must be at least 13 years old</Text>
            <Text style={styles.cardText}>• Provide accurate and complete information</Text>
            <Text style={styles.cardText}>• Maintain account security</Text>
            <Text style={styles.cardText}>• One account per person</Text>
          </View>

          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text style={styles.warningText}>
              You are responsible for all activities under your account. Never share your
              credentials with others.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
          <Text style={styles.paragraph}>You may NOT:</Text>
          <View style={styles.prohibitedList}>
            <Text style={styles.prohibitedItem}>❌ Use the Service for illegal purposes</Text>
            <Text style={styles.prohibitedItem}>❌ Attempt unauthorized access to our systems</Text>
            <Text style={styles.prohibitedItem}>❌ Interfere with or disrupt the Service</Text>
            <Text style={styles.prohibitedItem}>❌ Use cheats or exploits</Text>
            <Text style={styles.prohibitedItem}>❌ Reverse engineer the app</Text>
            <Text style={styles.prohibitedItem}>❌ Harass other users</Text>
            <Text style={styles.prohibitedItem}>❌ Impersonate others</Text>
            <Text style={styles.prohibitedItem}>❌ Sell or transfer your account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Gamification & Virtual Items</Text>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightText}>
              XP, achievements, badges, and other virtual items have no real-world value and cannot
              be exchanged for money. We may modify or reset virtual items at any time. Virtual
              items are non-transferable.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of QuizMentor are owned by us and protected by
            international copyright, trademark, and other intellectual property laws.
          </Text>
          <Text style={styles.paragraph}>
            We grant you a limited, non-exclusive, non-transferable license to use the app for
            personal, non-commercial purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of the Service is also governed by our Privacy Policy. Please review our
            Privacy Policy, which is incorporated into these Terms by reference.
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <Text style={styles.linkButtonText}>View Privacy Policy</Text>
            <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Disclaimers</Text>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Service Availability</Text>
            <Text style={styles.disclaimerText}>
              The Service is provided "as is" and "as available". We do not guarantee uninterrupted
              or error-free service.
            </Text>
          </View>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Educational Content</Text>
            <Text style={styles.disclaimerText}>
              Quiz content is for educational purposes only. We do not guarantee accuracy or
              completeness. Content should not be used as professional advice.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.legalText}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
            REVENUES.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            You may terminate your account at any time through the app settings. We may terminate or
            suspend your account for violations of these Terms, illegal activities, or harmful
            behavior.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Children's Use</Text>
          <View style={styles.ageCard}>
            <Ionicons name="person-outline" size={24} color="#4F46E5" />
            <View style={styles.ageContent}>
              <Text style={styles.ageTitle}>Age Requirements</Text>
              <Text style={styles.ageText}>• Must be at least 13 years old</Text>
              <Text style={styles.ageText}>• Under 18 requires parental consent</Text>
              <Text style={styles.ageText}>• No collection from children under 13</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. We will notify you of material changes through
            in-app notifications or email. Your continued use after changes constitutes acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Information</Text>
          <Text style={styles.paragraph}>For questions about these Terms:</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleEmailPress('legal@quizmentor.app')}
          >
            <Ionicons name="mail-outline" size={20} color="#4F46E5" />
            <Text style={styles.contactText}>legal@quizmentor.app</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleEmailPress('support@quizmentor.app')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#4F46E5" />
            <Text style={styles.contactText}>support@quizmentor.app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            By using QuizMentor, you acknowledge that you have read, understood, and agree to be
            bound by these Terms of Service.
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
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 6,
  },
  prohibitedList: {
    marginTop: 12,
  },
  prohibitedItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#DC2626',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  highlightCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  highlightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  legalText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    fontFamily: 'monospace',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  ageCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ageContent: {
    marginLeft: 12,
    flex: 1,
  },
  ageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  ageText: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
    marginBottom: 2,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '500',
    marginRight: 8,
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
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  footerTitle: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
