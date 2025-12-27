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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function AboutScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();

  const appInfo = {
    version: '1.0.0',
    buildNumber: '100',
    releaseDate: 'March 2024',
    developer: 'CrackZone Gaming',
    website: 'https://crackzone.com',
    email: 'support@crackzone.com',
    phone: '+91 12345 67890',
  };

  const socialLinks = [
    {
      name: 'Website',
      icon: 'globe',
      url: 'https://crackzone.com',
      color: Colors.info,
    },
    {
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/crackzonegaming',
      color: Colors.error,
    },
    {
      name: 'Twitter',
      icon: 'logo-twitter',
      url: 'https://twitter.com/crackzonegaming',
      color: Colors.info,
    },
    {
      name: 'YouTube',
      icon: 'logo-youtube',
      url: 'https://youtube.com/crackzonegaming',
      color: Colors.error,
    },
    {
      name: 'Discord',
      icon: 'logo-discord',
      url: 'https://discord.gg/crackzone',
      color: Colors.primary,
    },
  ];

  const legalLinks = [
    {
      name: 'Terms of Service',
      onPress: () => Alert.alert('Terms of Service', 'Terms of Service will be displayed here.'),
    },
    {
      name: 'Privacy Policy',
      onPress: () => Alert.alert('Privacy Policy', 'Privacy Policy will be displayed here.'),
    },
    {
      name: 'Cookie Policy',
      onPress: () => Alert.alert('Cookie Policy', 'Cookie Policy will be displayed here.'),
    },
    {
      name: 'Community Guidelines',
      onPress: () => Alert.alert('Community Guidelines', 'Community Guidelines will be displayed here.'),
    },
  ];

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const InfoItem = ({ label, value, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.infoItem,
        {
          paddingVertical: getSpacing(Layout.spacing.md),
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[
        styles.infoLabel,
        { fontSize: getFontSize(14) }
      ]}>
        {label}
      </Text>
      <View style={styles.infoRight}>
        <Text style={[
          styles.infoValue,
          { 
            fontSize: getFontSize(16),
            color: onPress ? Colors.crackzoneYellow : Colors.text,
          }
        ]}>
          {value}
        </Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={getFontSize(16)} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SocialLink = ({ link }) => (
    <TouchableOpacity
      style={[
        styles.socialLink,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}
      onPress={() => handleLinkPress(link.url)}
    >
      <View style={[
        styles.socialIcon,
        {
          width: getSpacing(40),
          height: getSpacing(40),
          borderRadius: getSpacing(20),
          marginRight: getSpacing(Layout.spacing.md),
        }
      ]}>
        <Ionicons name={link.icon} size={getFontSize(20)} color={link.color} />
      </View>
      <Text style={[
        styles.socialName,
        { 
          fontSize: getFontSize(16),
          flex: 1,
        }
      ]}>
        {link.name}
      </Text>
      <Ionicons name="open-outline" size={getFontSize(16)} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const LegalLink = ({ link }) => (
    <TouchableOpacity
      style={[
        styles.legalLink,
        {
          paddingVertical: getSpacing(Layout.spacing.md),
        }
      ]}
      onPress={link.onPress}
    >
      <Text style={[
        styles.legalLinkText,
        { fontSize: getFontSize(16) }
      ]}>
        {link.name}
      </Text>
      <Ionicons name="chevron-forward" size={getFontSize(16)} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[
      styles.sectionHeader,
      { 
        fontSize: getFontSize(18),
        marginTop: getSpacing(Layout.spacing.lg),
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      {title}
    </Text>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="About"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* App Logo and Name */}
            <View style={[
              styles.appHeader,
              {
                padding: getSpacing(Layout.spacing.xl),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <View style={[
                styles.appLogo,
                {
                  width: getSpacing(80),
                  height: getSpacing(80),
                  borderRadius: getSpacing(20),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Text style={[
                  styles.logoText,
                  { fontSize: getFontSize(32) }
                ]}>
                  🎮
                </Text>
              </View>
              <Text style={[
                styles.appName,
                { 
                  fontSize: getFontSize(24),
                  marginBottom: getSpacing(Layout.spacing.sm),
                }
              ]}>
                CrackZone Gaming
              </Text>
              <Text style={[
                styles.appTagline,
                { fontSize: getFontSize(16) }
              ]}>
                Your Ultimate Gaming Tournament Platform
              </Text>
            </View>

            {/* App Information */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <SectionHeader title="App Information" />
              
              <InfoItem label="Version" value={appInfo.version} />
              <InfoItem label="Build Number" value={appInfo.buildNumber} />
              <InfoItem label="Release Date" value={appInfo.releaseDate} />
              <InfoItem label="Developer" value={appInfo.developer} />
            </View>

            {/* Contact Information */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <SectionHeader title="Contact Information" />
              
              <InfoItem 
                label="Website" 
                value={appInfo.website} 
                onPress={() => handleLinkPress(appInfo.website)}
              />
              <InfoItem 
                label="Email" 
                value={appInfo.email} 
                onPress={() => handleLinkPress(`mailto:${appInfo.email}`)}
              />
              <InfoItem 
                label="Phone" 
                value={appInfo.phone} 
                onPress={() => handleLinkPress(`tel:${appInfo.phone}`)}
              />
            </View>

            {/* Social Media */}
            <View style={[
              styles.socialCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <SectionHeader title="Follow Us" />
              
              {socialLinks.map((link, index) => (
                <SocialLink key={index} link={link} />
              ))}
            </View>

            {/* Legal */}
            <View style={[
              styles.legalCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <SectionHeader title="Legal" />
              
              {legalLinks.map((link, index) => (
                <LegalLink key={index} link={link} />
              ))}
            </View>

            {/* About Description */}
            <View style={[
              styles.descriptionCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <SectionHeader title="About CrackZone" />
              
              <Text style={[
                styles.descriptionText,
                { 
                  fontSize: getFontSize(14),
                  lineHeight: 22,
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                CrackZone Gaming is the ultimate platform for mobile gaming tournaments. 
                We bring together passionate gamers from around the world to compete in 
                exciting tournaments across popular mobile games like FreeFire, PUBG Mobile, 
                Call of Duty Mobile, and more.
              </Text>
              
              <Text style={[
                styles.descriptionText,
                { 
                  fontSize: getFontSize(14),
                  lineHeight: 22,
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                Our mission is to provide a fair, secure, and enjoyable gaming experience 
                for players of all skill levels. Whether you're a casual gamer or a 
                professional esports athlete, CrackZone has something for everyone.
              </Text>
              
              <Text style={[
                styles.descriptionText,
                { 
                  fontSize: getFontSize(14),
                  lineHeight: 22,
                }
              ]}>
                Join thousands of gamers, create teams, participate in tournaments, 
                and win exciting prizes. Welcome to the future of mobile gaming!
              </Text>
            </View>

            {/* Copyright */}
            <View style={styles.copyrightContainer}>
              <Text style={[
                styles.copyrightText,
                { fontSize: getFontSize(12) }
              ]}>
                © 2024 CrackZone Gaming. All rights reserved.
              </Text>
              <Text style={[
                styles.copyrightText,
                { fontSize: getFontSize(12) }
              ]}>
                Made with ❤️ for gamers worldwide
              </Text>
            </View>
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
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  appHeader: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  appLogo: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow,
  },
  logoText: {
    // Logo emoji styling
  },
  appName: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  appTagline: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  infoValue: {
    fontWeight: '600',
  },
  socialLink: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialName: {
    color: Colors.text,
    fontWeight: '600',
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legalLinkText: {
    color: Colors.crackzoneYellow,
    fontWeight: '500',
  },
  descriptionText: {
    color: Colors.textSecondary,
  },
  copyrightContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  copyrightText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
});