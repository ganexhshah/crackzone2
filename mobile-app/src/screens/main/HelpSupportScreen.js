import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import ScreenWrapper from '../../components/ScreenWrapper';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How do I join a tournament?',
    answer: 'Go to the Tournaments tab, select a tournament, and tap "Register Now". Make sure you meet the requirements and have sufficient balance for entry fees.',
    category: 'tournaments'
  },
  {
    id: 2,
    question: 'How do I add money to my wallet?',
    answer: 'Go to the Wallet tab and tap "Add Money". You can use UPI, cards, or manual payment methods. Manual payments require admin approval.',
    category: 'wallet'
  },
  {
    id: 3,
    question: 'How do I create or join a team?',
    answer: 'Go to the Teams tab. You can create a new team or browse available teams to join. Some tournaments require team participation.',
    category: 'teams'
  },
  {
    id: 4,
    question: 'What games are supported?',
    answer: 'We support FreeFire, PUBG Mobile, Call of Duty Mobile, Valorant, CS:GO, Fortnite, Apex Legends, and League of Legends.',
    category: 'games'
  },
  {
    id: 5,
    question: 'How do I withdraw my winnings?',
    answer: 'Go to Wallet > Withdraw. You can withdraw to your bank account or UPI. Minimum withdrawal amount is ₹100.',
    category: 'wallet'
  },
  {
    id: 6,
    question: 'What if I face technical issues during a match?',
    answer: 'Contact support immediately with screenshots/videos. We have a fair play policy and will investigate all technical issues.',
    category: 'technical'
  }
];

const CONTACT_OPTIONS = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Support',
    description: 'Chat with our support team',
    icon: 'logo-whatsapp',
    color: Colors.success,
    action: () => Linking.openURL('https://wa.me/1234567890')
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send us an email',
    icon: 'mail',
    color: Colors.info,
    action: () => Linking.openURL('mailto:support@crackzone.com')
  },
  {
    id: 'telegram',
    title: 'Telegram Channel',
    description: 'Join our community',
    icon: 'send',
    color: Colors.primary,
    action: () => Linking.openURL('https://t.me/crackzone')
  },
  {
    id: 'discord',
    title: 'Discord Server',
    description: 'Connect with other gamers',
    icon: 'game-controller',
    color: Colors.warning,
    action: () => Linking.openURL('https://discord.gg/crackzone')
  }
];

export default function HelpSupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  const filteredFAQs = FAQ_DATA.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Ticket Submitted',
      'Your support ticket has been submitted. We will get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => setShowContactModal(false) }]
    );
    
    setContactForm({ subject: '', message: '', category: 'general' });
  };

  const HelpSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ContactOption = ({ option }) => (
    <TouchableOpacity style={styles.contactOption} onPress={option.action}>
      <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactDescription}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const FAQItem = ({ faq }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textMuted}
        />
      </View>
      {expandedFAQ === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, description, onPress, color = Colors.crackzoneYellow }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  const ContactModal = () => (
    <Modal
      visible={showContactModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowContactModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowContactModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <TouchableOpacity onPress={handleSubmitTicket}>
              <Text style={styles.modalSaveText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {['general', 'technical', 'payment', 'account'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      contactForm.category === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => setContactForm(prev => ({ ...prev, category }))}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      contactForm.category === category && styles.categoryOptionTextSelected
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                value={contactForm.subject}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                placeholder="Brief description of your issue"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.supportTips}>
              <Text style={styles.supportTipsTitle}>Tips for faster support:</Text>
              <Text style={styles.supportTip}>• Include screenshots if applicable</Text>
              <Text style={styles.supportTip}>• Mention your device and app version</Text>
              <Text style={styles.supportTip}>• Provide step-by-step details</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowContactModal(true)}
        >
          <Ionicons name="chatbubble-outline" size={24} color={Colors.crackzoneYellow} />
        </TouchableOpacity>
      </View>

        <ScrollView style={styles.scrollView}>
          {/* Quick Actions */}
          <HelpSection title="Quick Actions">
            <View style={styles.quickActions}>
              <QuickAction
                icon="chatbubble"
                title="Live Chat"
                description="Chat with support agent"
                onPress={() => setShowContactModal(true)}
                color={Colors.success}
              />
              <QuickAction
                icon="call"
                title="Call Support"
                description="Speak to our team"
                onPress={() => Linking.openURL('tel:+911234567890')}
                color={Colors.info}
              />
            </View>
          </HelpSection>

          {/* Contact Options */}
          <HelpSection title="Contact Us">
            {CONTACT_OPTIONS.map((option) => (
              <ContactOption key={option.id} option={option} />
            ))}
          </HelpSection>

          {/* FAQ Search */}
          <HelpSection title="Frequently Asked Questions">
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search FAQs..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.faqList}>
              {filteredFAQs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </View>
          </HelpSection>

          {/* Useful Links */}
          <HelpSection title="Useful Links">
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="document-text" size={20} color={Colors.crackzoneYellow} />
              <Text style={styles.linkText}>Tournament Rules & Guidelines</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.crackzoneYellow} />
              <Text style={styles.linkText}>Fair Play Policy</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="cash" size={20} color={Colors.crackzoneYellow} />
              <Text style={styles.linkText}>Payment & Withdrawal Guide</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="people" size={20} color={Colors.crackzoneYellow} />
              <Text style={styles.linkText}>Community Guidelines</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </HelpSection>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>CrackZone v1.0.0</Text>
            <Text style={styles.appInfoText}>Need help? We're here 24/7</Text>
          </View>
        </ScrollView>

        <ContactModal />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Layout.spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  quickActionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: Layout.spacing.md,
  },
  faqList: {
    gap: Layout.spacing.sm,
  },
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    lineHeight: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  appInfoText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Layout.spacing.xs,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.crackzoneYellow,
  },
  modalContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  supportTips: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.lg,
  },
  supportTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  supportTip: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
});