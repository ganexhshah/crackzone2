import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function NotificationSettingsScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    tournamentUpdates: true,
    teamInvitations: true,
    paymentAlerts: true,
    promotionalOffers: false,
    weeklyDigest: true,
    matchReminders: true,
    prizeNotifications: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    Alert.alert('Success', 'Notification settings updated successfully!');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle, 
    iconColor = Colors.crackzoneYellow 
  }) => (
    <View style={[
      styles.settingItem,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={styles.settingLeft}>
        <View style={[
          styles.settingIcon,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons name={icon} size={getFontSize(20)} color={iconColor} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[
            styles.settingTitle,
            { 
              fontSize: getFontSize(16),
              marginBottom: getSpacing(Layout.spacing.xs),
            }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.settingDescription,
            { fontSize: getFontSize(14) }
          ]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ 
          false: Colors.textMuted + '40', 
          true: Colors.crackzoneYellow + '60' 
        }}
        thumbColor={value ? Colors.crackzoneYellow : Colors.textMuted}
      />
    </View>
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
          title="Notification Settings"
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
            Manage your notification preferences
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* General Notifications */}
            <SectionHeader title="General Notifications" />
            
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              description="Receive notifications on your device"
              value={settings.pushNotifications}
              onToggle={() => handleToggle('pushNotifications')}
            />
            
            <SettingItem
              icon="mail"
              title="Email Notifications"
              description="Receive notifications via email"
              value={settings.emailNotifications}
              onToggle={() => handleToggle('emailNotifications')}
              iconColor={Colors.info}
            />
            
            <SettingItem
              icon="chatbubble"
              title="SMS Notifications"
              description="Receive notifications via SMS"
              value={settings.smsNotifications}
              onToggle={() => handleToggle('smsNotifications')}
              iconColor={Colors.success}
            />

            {/* Tournament & Gaming */}
            <SectionHeader title="Tournament & Gaming" />
            
            <SettingItem
              icon="trophy"
              title="Tournament Updates"
              description="Updates about tournament schedules and results"
              value={settings.tournamentUpdates}
              onToggle={() => handleToggle('tournamentUpdates')}
              iconColor={Colors.crackzoneYellow}
            />
            
            <SettingItem
              icon="people"
              title="Team Invitations"
              description="Notifications when you're invited to join a team"
              value={settings.teamInvitations}
              onToggle={() => handleToggle('teamInvitations')}
              iconColor={Colors.info}
            />
            
            <SettingItem
              icon="alarm"
              title="Match Reminders"
              description="Reminders before your scheduled matches"
              value={settings.matchReminders}
              onToggle={() => handleToggle('matchReminders')}
              iconColor={Colors.warning}
            />
            
            <SettingItem
              icon="medal"
              title="Prize Notifications"
              description="Notifications when you win prizes or rewards"
              value={settings.prizeNotifications}
              onToggle={() => handleToggle('prizeNotifications')}
              iconColor={Colors.success}
            />

            {/* Financial */}
            <SectionHeader title="Financial" />
            
            <SettingItem
              icon="wallet"
              title="Payment Alerts"
              description="Notifications for wallet transactions and payments"
              value={settings.paymentAlerts}
              onToggle={() => handleToggle('paymentAlerts')}
              iconColor={Colors.success}
            />

            {/* Marketing */}
            <SectionHeader title="Marketing & Updates" />
            
            <SettingItem
              icon="megaphone"
              title="Promotional Offers"
              description="Special offers, discounts, and promotional content"
              value={settings.promotionalOffers}
              onToggle={() => handleToggle('promotionalOffers')}
              iconColor={Colors.warning}
            />
            
            <SettingItem
              icon="newspaper"
              title="Weekly Digest"
              description="Weekly summary of your gaming activity"
              value={settings.weeklyDigest}
              onToggle={() => handleToggle('weeklyDigest')}
              iconColor={Colors.info}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  padding: getSpacing(Layout.spacing.md),
                  marginTop: getSpacing(Layout.spacing.xl),
                }
              ]}
              onPress={handleSaveSettings}
            >
              <Ionicons name="checkmark-circle" size={getFontSize(20)} color={Colors.crackzoneBlack} />
              <Text style={[
                styles.saveButtonText,
                { 
                  fontSize: getFontSize(16),
                  marginLeft: getSpacing(Layout.spacing.sm),
                }
              ]}>
                Save Settings
              </Text>
            </TouchableOpacity>

            {/* Info Card */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginTop: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={getFontSize(20)} color={Colors.info} />
                <Text style={[
                  styles.infoTitle,
                  { 
                    fontSize: getFontSize(16),
                    marginLeft: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  About Notifications
                </Text>
              </View>
              <Text style={[
                styles.infoText,
                { 
                  fontSize: getFontSize(14),
                  marginTop: getSpacing(Layout.spacing.sm),
                }
              ]}>
                You can change these settings anytime. Some notifications may be required for security and account management purposes.
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
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  sectionHeader: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  settingItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.text,
    fontWeight: '600',
  },
  settingDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.info + '40',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    color: Colors.info,
    fontWeight: 'bold',
  },
  infoText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});