import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';

export default function NotificationSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    tournamentUpdates: true,
    matchReminders: true,
    teamInvitations: true,
    paymentAlerts: true,
    promotionalOffers: false,
    weeklyDigest: true,
    achievementAlerts: true,
    friendActivity: true,
    systemUpdates: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      // Update settings based on profile data
      setSettings(prev => ({
        ...prev,
        pushNotifications: response.data.user.notificationsEnabled !== false,
      }));
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading notification settings..." />;
  }

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Update backend if it's a main setting
    if (key === 'pushNotifications') {
      try {
        await profileAPI.updateProfile({
          notificationsEnabled: value
        });
      } catch (error) {
        console.error('Failed to update notification setting:', error);
        Alert.alert('Error', 'Failed to update notification setting');
        // Revert the change
        setSettings(prev => ({ ...prev, [key]: !value }));
      }
    }
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, title, description, value, onValueChange, disabled = false }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={disabled ? Colors.textMuted : Colors.crackzoneYellow} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.crackzoneYellow + '40' }}
        thumbColor={value ? Colors.crackzoneYellow : Colors.textMuted}
      />
    </View>
  );

  const testNotification = () => {
    Alert.alert(
      'Test Notification',
      'This is how notifications will appear on your device.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={testNotification}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.crackzoneYellow} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Main Notification Controls */}
          <SettingSection title="General">
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              description="Receive notifications on your device"
              value={settings.pushNotifications}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
            />
            <SettingItem
              icon="mail"
              title="Email Notifications"
              description="Receive notifications via email"
              value={settings.emailNotifications}
              onValueChange={(value) => updateSetting('emailNotifications', value)}
            />
            <SettingItem
              icon="chatbubble"
              title="SMS Notifications"
              description="Receive important alerts via SMS"
              value={settings.smsNotifications}
              onValueChange={(value) => updateSetting('smsNotifications', value)}
            />
          </SettingSection>

          {/* Tournament & Gaming */}
          <SettingSection title="Gaming & Tournaments">
            <SettingItem
              icon="trophy"
              title="Tournament Updates"
              description="Match results, bracket updates, and tournament news"
              value={settings.tournamentUpdates}
              onValueChange={(value) => updateSetting('tournamentUpdates', value)}
              disabled={!settings.pushNotifications}
            />
            <SettingItem
              icon="alarm"
              title="Match Reminders"
              description="Reminders before your matches start"
              value={settings.matchReminders}
              onValueChange={(value) => updateSetting('matchReminders', value)}
              disabled={!settings.pushNotifications}
            />
            <SettingItem
              icon="medal"
              title="Achievement Alerts"
              description="When you unlock new achievements"
              value={settings.achievementAlerts}
              onValueChange={(value) => updateSetting('achievementAlerts', value)}
              disabled={!settings.pushNotifications}
            />
          </SettingSection>

          {/* Social & Teams */}
          <SettingSection title="Social & Teams">
            <SettingItem
              icon="people"
              title="Team Invitations"
              description="When someone invites you to join their team"
              value={settings.teamInvitations}
              onValueChange={(value) => updateSetting('teamInvitations', value)}
              disabled={!settings.pushNotifications}
            />
            <SettingItem
              icon="heart"
              title="Friend Activity"
              description="When friends join tournaments or achieve milestones"
              value={settings.friendActivity}
              onValueChange={(value) => updateSetting('friendActivity', value)}
              disabled={!settings.pushNotifications}
            />
          </SettingSection>

          {/* Financial */}
          <SettingSection title="Wallet & Payments">
            <SettingItem
              icon="wallet"
              title="Payment Alerts"
              description="Transaction confirmations and wallet updates"
              value={settings.paymentAlerts}
              onValueChange={(value) => updateSetting('paymentAlerts', value)}
              disabled={!settings.pushNotifications}
            />
          </SettingSection>

          {/* Marketing & Updates */}
          <SettingSection title="Updates & Promotions">
            <SettingItem
              icon="gift"
              title="Promotional Offers"
              description="Special deals and bonus opportunities"
              value={settings.promotionalOffers}
              onValueChange={(value) => updateSetting('promotionalOffers', value)}
              disabled={!settings.pushNotifications}
            />
            <SettingItem
              icon="newspaper"
              title="Weekly Digest"
              description="Summary of your gaming activity and upcoming events"
              value={settings.weeklyDigest}
              onValueChange={(value) => updateSetting('weeklyDigest', value)}
              disabled={!settings.emailNotifications}
            />
            <SettingItem
              icon="information-circle"
              title="System Updates"
              description="App updates and maintenance notifications"
              value={settings.systemUpdates}
              onValueChange={(value) => updateSetting('systemUpdates', value)}
              disabled={!settings.pushNotifications}
            />
          </SettingSection>

          {/* Notification Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiet Hours</Text>
            <View style={styles.quietHoursCard}>
              <View style={styles.quietHoursHeader}>
                <Ionicons name="moon" size={20} color={Colors.crackzoneYellow} />
                <Text style={styles.quietHoursTitle}>Do Not Disturb</Text>
              </View>
              <Text style={styles.quietHoursDescription}>
                Notifications will be silenced during these hours
              </Text>
              <TouchableOpacity style={styles.quietHoursButton}>
                <Text style={styles.quietHoursButtonText}>Set Quiet Hours</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.crackzoneYellow} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  settingTitleDisabled: {
    color: Colors.textMuted,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingDescriptionDisabled: {
    color: Colors.textMuted,
  },
  quietHoursCard: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quietHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },
  quietHoursDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  quietHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.crackzoneYellow + '20',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  quietHoursButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.crackzoneYellow,
  },
});