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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function HelpSupportScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general',
  });

  const faqs = [
    {
      id: 1,
      question: 'How do I join a tournament?',
      answer: 'Go to the Tournaments tab, select a tournament you want to join, and click the "Join Tournament" button. Make sure you have enough balance in your wallet for the entry fee.',
      category: 'tournaments',
    },
    {
      id: 2,
      question: 'How do I add money to my wallet?',
      answer: 'Navigate to the Wallet section and click "Add Money". Choose your preferred payment method and follow the instructions. Your wallet will be credited once the payment is verified.',
      category: 'wallet',
    },
    {
      id: 3,
      question: 'How do I create or join a team?',
      answer: 'Go to the Teams section. You can either create a new team by clicking "Create Team" or browse available teams and send join requests.',
      category: 'teams',
    },
    {
      id: 4,
      question: 'When will I receive my tournament winnings?',
      answer: 'Tournament winnings are automatically credited to your wallet within 24 hours after the tournament results are finalized.',
      category: 'tournaments',
    },
    {
      id: 5,
      question: 'How do I withdraw money from my wallet?',
      answer: 'Go to your Wallet, click "Withdraw", enter the amount, and provide your bank details. Withdrawals are processed within 1-3 business days.',
      category: 'wallet',
    },
    {
      id: 6,
      question: 'Can I change my username?',
      answer: 'Yes, you can change your username from the Edit Profile section. Note that you can only change it once every 30 days.',
      category: 'account',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@crackzone.com'),
      color: Colors.info,
    },
    {
      id: 2,
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubble',
      action: () => Alert.alert('Live Chat', 'Live chat will be available soon!'),
      color: Colors.success,
    },
    {
      id: 3,
      title: 'WhatsApp Support',
      description: 'Message us on WhatsApp',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/1234567890'),
      color: Colors.success,
    },
    {
      id: 4,
      title: 'Call Support',
      description: 'Speak with our support team',
      icon: 'call',
      action: () => Linking.openURL('tel:+911234567890'),
      color: Colors.warning,
    },
  ];

  const handleSubmitTicket = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Simulate ticket submission
    Alert.alert(
      'Ticket Submitted',
      'Your support ticket has been submitted successfully. We will get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '', category: 'general' });
          }
        }
      ]
    );
  };

  const filteredFAQs = faqs;

  const FAQItem = ({ faq }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <View style={[
        styles.faqItem,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={[
            styles.faqQuestion,
            { 
              fontSize: getFontSize(16),
              flex: 1,
              marginRight: getSpacing(Layout.spacing.sm),
            }
          ]}>
            {faq.question}
          </Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={getFontSize(20)} 
            color={Colors.crackzoneYellow} 
          />
        </TouchableOpacity>
        
        {expanded && (
          <Text style={[
            styles.faqAnswer,
            { 
              fontSize: getFontSize(14),
              marginTop: getSpacing(Layout.spacing.md),
            }
          ]}>
            {faq.answer}
          </Text>
        )}
      </View>
    );
  };

  const ContactOption = ({ option }) => (
    <TouchableOpacity
      style={[
        styles.contactOption,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.md),
        }
      ]}
      onPress={option.action}
    >
      <View style={[
        styles.contactIcon,
        {
          width: getSpacing(50),
          height: getSpacing(50),
          borderRadius: getSpacing(25),
          marginRight: getSpacing(Layout.spacing.md),
        }
      ]}>
        <Ionicons name={option.icon} size={getFontSize(24)} color={option.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[
          styles.contactTitle,
          { 
            fontSize: getFontSize(16),
            marginBottom: getSpacing(Layout.spacing.xs),
          }
        ]}>
          {option.title}
        </Text>
        <Text style={[
          styles.contactDescription,
          { fontSize: getFontSize(14) }
        ]}>
          {option.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={getFontSize(20)} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const tabs = [
    { id: 'faq', name: 'FAQ' },
    { id: 'contact', name: 'Contact' },
    { id: 'ticket', name: 'Submit Ticket' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Help & Support"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getSpacing(Layout.spacing.lg),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Text style={[
            styles.headerSubtitle,
            { fontSize: getFontSize(16) }
          ]}>
            Get help and support for your account
          </Text>
        </View>

        {/* Tabs */}
        <View style={[
          styles.tabsContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                },
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                { fontSize: getFontSize(14) },
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {activeTab === 'faq' && (
              <View style={styles.faqContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Frequently Asked Questions
                </Text>
                
                {filteredFAQs.map((faq) => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </View>
            )}

            {activeTab === 'contact' && (
              <View style={styles.contactContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Contact Options
                </Text>
                
                {contactOptions.map((option) => (
                  <ContactOption key={option.id} option={option} />
                ))}
              </View>
            )}

            {activeTab === 'ticket' && (
              <View style={styles.ticketContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Submit Support Ticket
                </Text>
                
                <View style={[
                  styles.ticketForm,
                  { padding: getSpacing(Layout.spacing.lg) }
                ]}>
                  <View style={[
                    styles.formField,
                    { marginBottom: getSpacing(Layout.spacing.md) }
                  ]}>
                    <Text style={[
                      styles.fieldLabel,
                      { 
                        fontSize: getFontSize(14),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      }
                    ]}>
                      Category
                    </Text>
                    <View style={styles.categoryOptions}>
                      {['general', 'technical', 'payment', 'account'].map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryOption,
                            {
                              padding: getSpacing(Layout.spacing.sm),
                              marginRight: getSpacing(Layout.spacing.sm),
                              marginBottom: getSpacing(Layout.spacing.sm),
                            },
                            contactForm.category === category && styles.selectedCategory
                          ]}
                          onPress={() => setContactForm({...contactForm, category})}
                        >
                          <Text style={[
                            styles.categoryText,
                            { fontSize: getFontSize(14) },
                            contactForm.category === category && styles.selectedCategoryText
                          ]}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={[
                    styles.formField,
                    { marginBottom: getSpacing(Layout.spacing.md) }
                  ]}>
                    <Text style={[
                      styles.fieldLabel,
                      { 
                        fontSize: getFontSize(14),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      }
                    ]}>
                      Subject *
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          padding: getSpacing(Layout.spacing.md),
                          fontSize: getFontSize(16),
                        }
                      ]}
                      placeholder="Brief description of your issue"
                      placeholderTextColor={Colors.textMuted}
                      value={contactForm.subject}
                      onChangeText={(text) => setContactForm({...contactForm, subject: text})}
                    />
                  </View>
                  
                  <View style={[
                    styles.formField,
                    { marginBottom: getSpacing(Layout.spacing.lg) }
                  ]}>
                    <Text style={[
                      styles.fieldLabel,
                      { 
                        fontSize: getFontSize(14),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      }
                    ]}>
                      Message *
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.textArea,
                        {
                          padding: getSpacing(Layout.spacing.md),
                          fontSize: getFontSize(16),
                          height: getSpacing(120),
                        }
                      ]}
                      placeholder="Describe your issue in detail..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      textAlignVertical="top"
                      value={contactForm.message}
                      onChangeText={(text) => setContactForm({...contactForm, message: text})}
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { padding: getSpacing(Layout.spacing.md) }
                    ]}
                    onPress={handleSubmitTicket}
                  >
                    <Ionicons name="send" size={getFontSize(20)} color={Colors.crackzoneBlack} />
                    <Text style={[
                      styles.submitButtonText,
                      { 
                        fontSize: getFontSize(16),
                        marginLeft: getSpacing(Layout.spacing.sm),
                      }
                    ]}>
                      Submit Ticket
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    color: Colors.text,
    fontWeight: '600',
  },
  faqAnswer: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactOption: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  contactDescription: {
    color: Colors.textSecondary,
  },
  ticketForm: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formField: {
    // Form field container
  },
  fieldLabel: {
    color: Colors.text,
    fontWeight: '600',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryOption: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
  },
  selectedCategory: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  categoryText: {
    color: Colors.text,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
});