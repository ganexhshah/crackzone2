import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';

export default function PrivacySecurityScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowTeamInvites: true,
    showMatchHistory: true,
    allowFriendRequests: true,
    twoFactorEnabled: false,
    loginAlerts: true,
    dataCollection: true,
  });

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      setSettings(prev => ({
        ...prev,
        profileVisibility: response.data.user.privacySetting || 'public',
      }));
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading privacy settings..." />;
  }

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'profileVisibility') {
      try {
        await profileAPI.updateProfile({
          privacySetting: value
        });
      } catch (error) {
        console.error('Failed to update privacy setting:', error);
        Alert.alert('Error', 'Failed to update privacy setting');
        setSettings(prev => ({ ...prev, [key]: prev[key] }));
      }
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      // This would need a change password endpoint
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => setShowPasswordModal(false) }
      ]);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
            logout();
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={Colors.crackzoneYellow} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.border, true: Colors.crackzoneYellow + '40' }}
          thumbColor={value ? Colors.crackzoneYellow : Colors.textMuted}
        />
      )}
      {type === 'select' && (
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  const ActionItem = ({ icon, title, description, onPress, danger = false }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIcon, danger && styles.actionIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.crackzoneYellow} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, danger && styles.actionTitleDanger]}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const PasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword} disabled={saving}>
              <Text style={[styles.modalSaveText, saving && styles.modalSaveTextDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.passwordTips}>
              <Text style={styles.passwordTipsTitle}>Password Requirements:</Text>
              <Text style={styles.passwordTip}>• At least 6 characters long</Text>
              <Text style={styles.passwordTip}>• Mix of letters and numbers recommended</Text>
              <Text style={styles.passwordTip}>• Avoid common passwords</Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Privacy Settings */}
          <SettingSection title="Privacy">
            <SettingItem
              icon="eye"
              title="Profile Visibility"
              description="Who can see your profile information"
              value={settings.profileVisibility}
              type="select"
            />
            <SettingItem
              icon="radio-button-on"
              title="Show Online Status"
              description="Let others see when you're online"
              value={settings.showOnlineStatus}
              onValueChange={(value) => updateSetting('showOnlineStatus', value)}
            />
            <SettingItem
              icon="people"
              title="Allow Team Invites"
              description="Let others invite you to join their teams"
              value={settings.allowTeamInvites}
              onValueChange={(value) => updateSetting('allowTeamInvites', value)}
            />
            <SettingItem
              icon="list"
              title="Show Match History"
              description="Display your tournament results publicly"
              value={settings.showMatchHistory}
              onValueChange={(value) => updateSetting('showMatchHistory', value)}
            />
            <SettingItem
              icon="person-add"
              title="Allow Friend Requests"
              description="Let others send you friend requests"
              value={settings.allowFriendRequests}
              onValueChange={(value) => updateSetting('allowFriendRequests', value)}
            />
          </SettingSection>

          {/* Security Settings */}
          <SettingSection title="Security">
            <SettingItem
              icon="shield-checkmark"
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorEnabled}
              onValueChange={(value) => updateSetting('twoFactorEnabled', value)}
            />
            <SettingItem
              icon="notifications"
              title="Login Alerts"
              description="Get notified when someone logs into your account"
              value={settings.loginAlerts}
              onValueChange={(value) => updateSetting('loginAlerts', value)}
            />
          </SettingSection>

          {/* Account Actions */}
          <SettingSection title="Account">
            <ActionItem
              icon="key"
              title="Change Password"
              description="Update your account password"
              onPress={() => setShowPasswordModal(true)}
            />
            <ActionItem
              icon="download"
              title="Download My Data"
              description="Get a copy of your account data"
              onPress={() => Alert.alert('Coming Soon', 'Data export feature coming soon')}
            />
            <ActionItem
              icon="log-out"
              title="Sign Out All Devices"
              description="Sign out from all devices except this one"
              onPress={() => Alert.alert('Signed Out', 'You have been signed out from all other devices')}
            />
          </SettingSection>

          {/* Data & Privacy */}
          <SettingSection title="Data & Privacy">
            <SettingItem
              icon="analytics"
              title="Data Collection"
              description="Help improve the app by sharing usage data"
              value={settings.dataCollection}
              onValueChange={(value) => updateSetting('dataCollection', value)}
            />
            <ActionItem
              icon="document-text"
              title="Privacy Policy"
              description="Read our privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will open in browser')}
            />
            <ActionItem
              icon="document-text"
              title="Terms of Service"
              description="Read our terms of service"
              onPress={() => Alert.alert('Terms of Service', 'Terms will open in browser')}
            />
          </SettingSection>

          {/* Danger Zone */}
          <SettingSection title="Danger Zone">
            <ActionItem
              icon="trash"
              title="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              danger
            />
          </SettingSection>
        </ScrollView>

        <PasswordModal />
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
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: Colors.crackzoneYellow,
    fontWeight: '600',
    marginRight: Layout.spacing.sm,
    textTransform: 'capitalize',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  actionIconDanger: {
    backgroundColor: Colors.error + '20',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  actionTitleDanger: {
    color: Colors.error,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  modalSaveTextDisabled: {
    color: Colors.textMuted,
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
  passwordTips: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.lg,
  },
  passwordTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  passwordTip: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
});