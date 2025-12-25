import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import ScreenWrapper from '../../components/ScreenWrapper';

const TEAM_MEMBERS = [
  {
    name: 'Rajesh Kumar',
    role: 'Founder & CEO',
    description: 'Passionate gamer and entrepreneur building the future of esports',
  },
  {
    name: 'Priya Sharma',
    role: 'CTO',
    description: 'Tech enthusiast creating seamless gaming experiences',
  },
  {
    name: 'Amit Singh',
    role: 'Head of Operations',
    description: 'Ensuring fair play and smooth tournament operations',
  },
];

const SOCIAL_LINKS = [
  {
    platform: 'Instagram',
    icon: 'logo-instagram',
    url: 'https://instagram.com/crackzone',
    color: '#E4405F',
  },
  {
    platform: 'Twitter',
    icon: 'logo-twitter',
    url: 'https://twitter.com/crackzone',
    color: '#1DA1F2',
  },
  {
    platform: 'YouTube',
    icon: 'logo-youtube',
    url: 'https://youtube.com/crackzone',
    color: '#FF0000',
  },
  {
    platform: 'Discord',
    icon: 'game-controller',
    url: 'https://discord.gg/crackzone',
    color: '#7289DA',
  },
];

const FEATURES = [
  {
    icon: 'trophy',
    title: 'Tournaments',
    description: 'Compete in daily tournaments across multiple games',
  },
  {
    icon: 'people',
    title: 'Team Play',
    description: 'Create teams and compete with friends',
  },
  {
    icon: 'wallet',
    title: 'Secure Payments',
    description: 'Safe and instant payment processing',
  },
  {
    icon: 'shield-checkmark',
    title: 'Fair Play',
    description: 'Anti-cheat systems and fair play policies',
  },
  {
    icon: 'stats-chart',
    title: 'Analytics',
    description: 'Track your performance and improve your skills',
  },
  {
    icon: 'gift',
    title: 'Rewards',
    description: 'Earn achievements and unlock exclusive rewards',
  },
];

export default function AboutScreen({ navigation }) {
  const openURL = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const AboutSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FeatureCard = ({ feature }) => (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={feature.icon} size={24} color={Colors.crackzoneYellow} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const TeamMember = ({ member }) => (
    <View style={styles.teamMember}>
      <View style={styles.memberAvatar}>
        <Ionicons name="person" size={24} color={Colors.crackzoneYellow} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={styles.memberDescription}>{member.description}</Text>
      </View>
    </View>
  );

  const SocialLink = ({ social }) => (
    <TouchableOpacity
      style={[styles.socialLink, { borderColor: social.color }]}
      onPress={() => openURL(social.url)}
    >
      <Ionicons name={social.icon} size={24} color={social.color} />
      <Text style={[styles.socialText, { color: social.color }]}>
        {social.platform}
      </Text>
    </TouchableOpacity>
  );

  const InfoItem = ({ icon, title, value, onPress }) => (
    <TouchableOpacity style={styles.infoItem} onPress={onPress}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={Colors.crackzoneYellow} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />}
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>About CrackZone</Text>
        <View style={styles.headerButton} />
      </View>

        <ScrollView style={styles.scrollView}>
          {/* App Logo & Info */}
          <View style={styles.appHeader}>
            <View style={styles.appLogo}>
              <Ionicons name="game-controller" size={48} color={Colors.crackzoneYellow} />
            </View>
            <Text style={styles.appName}>CrackZone</Text>
            <Text style={styles.appTagline}>Ultimate Gaming Platform</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>

          {/* Mission Statement */}
          <AboutSection title="Our Mission">
            <View style={styles.missionCard}>
              <Text style={styles.missionText}>
                To create the ultimate gaming platform where players can compete, connect, and grow their skills in a fair and exciting environment. We believe in empowering gamers to turn their passion into rewards.
              </Text>
            </View>
          </AboutSection>

          {/* Features */}
          <AboutSection title="What We Offer">
            <View style={styles.featuresGrid}>
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </View>
          </AboutSection>

          {/* Team */}
          <AboutSection title="Meet Our Team">
            {TEAM_MEMBERS.map((member, index) => (
              <TeamMember key={index} member={member} />
            ))}
          </AboutSection>

          {/* App Information */}
          <AboutSection title="App Information">
            <InfoItem
              icon="information-circle"
              title="Version"
              value="1.0.0 (Build 100)"
            />
            <InfoItem
              icon="calendar"
              title="Release Date"
              value="December 2024"
            />
            <InfoItem
              icon="download"
              title="App Size"
              value="45.2 MB"
            />
            <InfoItem
              icon="phone-portrait"
              title="Compatibility"
              value="iOS 12.0+ / Android 8.0+"
            />
            <InfoItem
              icon="document-text"
              title="Privacy Policy"
              value="View our privacy policy"
              onPress={() => openURL('https://crackzone.com/privacy')}
            />
            <InfoItem
              icon="document-text"
              title="Terms of Service"
              value="View terms and conditions"
              onPress={() => openURL('https://crackzone.com/terms')}
            />
          </AboutSection>

          {/* Social Media */}
          <AboutSection title="Follow Us">
            <View style={styles.socialLinks}>
              {SOCIAL_LINKS.map((social, index) => (
                <SocialLink key={index} social={social} />
              ))}
            </View>
          </AboutSection>

          {/* Contact Information */}
          <AboutSection title="Contact Us">
            <InfoItem
              icon="mail"
              title="Email"
              value="support@crackzone.com"
              onPress={() => Linking.openURL('mailto:support@crackzone.com')}
            />
            <InfoItem
              icon="call"
              title="Phone"
              value="+91 98765 43210"
              onPress={() => Linking.openURL('tel:+919876543210')}
            />
            <InfoItem
              icon="location"
              title="Address"
              value="Mumbai, Maharashtra, India"
            />
            <InfoItem
              icon="globe"
              title="Website"
              value="www.crackzone.com"
              onPress={() => openURL('https://crackzone.com')}
            />
          </AboutSection>

          {/* Legal & Credits */}
          <AboutSection title="Legal & Credits">
            <View style={styles.legalCard}>
              <Text style={styles.legalText}>
                © 2024 CrackZone. All rights reserved.
              </Text>
              <Text style={styles.legalText}>
                Made with ❤️ in India for gamers worldwide.
              </Text>
              <Text style={styles.creditsText}>
                Special thanks to our beta testers and the gaming community for their valuable feedback.
              </Text>
            </View>
          </AboutSection>

          {/* Rate App */}
          <View style={styles.rateSection}>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => Alert.alert('Rate App', 'Thank you for your feedback!')}
            >
              <Ionicons name="star" size={20} color={Colors.crackzoneBlack} />
              <Text style={styles.rateButtonText}>Rate CrackZone</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  appHeader: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    borderWidth: 3,
    borderColor: Colors.crackzoneYellow,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  appTagline: {
    fontSize: 16,
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.sm,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  section: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  missionCard: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  teamMember: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  memberRole: {
    fontSize: 14,
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.xs,
  },
  memberDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Layout.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  legalCard: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  creditsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Layout.spacing.sm,
  },
  rateSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.crackzoneYellow,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
    marginLeft: Layout.spacing.sm,
  },
});