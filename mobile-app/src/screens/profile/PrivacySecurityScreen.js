import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function PrivacySecurityScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowTeamInvites: true,
    showGameStats: true,
    twoFactorAuth: false,
    loginAlerts: true,
  });
  
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (value) => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
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
    
    // Simulate password change
    Alert.alert('Success', 'Password changed successfully!');
    setChangePasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle, 
    iconColor = Colors.crackzoneYellow,
    showSwitch = true 
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
      {showSwitch && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ 
            false: Colors.textMuted + '40', 
            true: Colors.crackzoneYellow + '60' 
          }}
          thumbColor={value ? Colors.crackzoneYellow : Colors.textMuted}
        />
      )}
    </View>
  );

  const ActionItem = ({ icon, title, description, onPress, iconColor = Colors.crackzoneYellow, textColor = Colors.text }) => (
    <TouchableOpacity 
      style={[
        styles.actionItem,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}
      onPress={onPress}
    >
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
              color: textColor,
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
      <Ionicons name="chevron-forward" size={getFontSize(20)} color={Colors.textMuted} />
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

  const PrivacyOption = ({ value, label, selected, onSelect }) => (
    <TouchableOpacity
      style={[
        styles.privacyOption,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        },
        selected && styles.selectedPrivacyOption
      ]}
      onPress={() => onSelect(value)}
    >
      <View style={styles.privacyOptionContent}>
        <View style={[
          styles.radioButton,
          {
            width: getSpacing(20),
            height: getSpacing(20),
            borderRadius: getSpacing(10),
            marginRight: getSpacing(Layout.spacing.md),
          },
          selected && styles.selectedRadioButton
        ]}>
          {selected && (
            <View style={[
              styles.radioButtonInner,
              {
                width: getSpacing(10),
                height: getSpacing(10),
                borderRadius: getSpacing(5),
              }
            ]} />
          )}
        </View>
        <Text style={[
          styles.privacyOptionText,
          { 
            fontSize: getFontSize(16),
            color: selected ? Colors.crackzoneYellow : Colors.text,
          }
        ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Privacy & Security"
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
            Manage your privacy and security settings
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
            {/* Privacy Settings */}
            <SectionHeader title="Privacy Settings" />
            
            <View style={[
              styles.privacyCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <Text style={[
                styles.privacyTitle,
                { 
                  fontSize: getFontSize(16),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                Profile Visibility
              </Text>
              
              <PrivacyOption
                value="public"
                label="Public - Anyone can see your profile"
                selected={settings.profileVisibility === 'public'}
                onSelect={handlePrivacyChange}
              />
              
              <PrivacyOption
                value="friends"
                label="Friends Only - Only your friends can see your profile"
                selected={settings.profileVisibility === 'friends'}
                onSelect={handlePrivacyChange}
              />
              
              <PrivacyOption
                value="private"
                label="Private - Only you can see your profile"
                selected={settings.profileVisibility === 'private'}
                onSelect={handlePrivacyChange}
              />
            </View>
            
            <SettingItem
              icon="eye"
              title="Show Online Status"
              description="Let others see when you're online"
              value={settings.showOnlineStatus}
              onToggle={() => handleToggle('showOnlineStatus')}
              iconColor={Colors.info}
            />
            
            <SettingItem
              icon="people"
              title="Allow Team Invites"
              description="Allow other players to invite you to teams"
              value={settings.allowTeamInvites}
              onToggle={() => handleToggle('allowTeamInvites')}
              iconColor={Colors.success}
            />
            
            <SettingItem
              icon="stats-chart"
              title="Show Game Statistics"
              description="Display your gaming stats on your profile"
              value={settings.showGameStats}
              onToggle={() => handleToggle('showGameStats')}
              iconColor={Colors.warning}
            />

            {/* Security Settings */}
            <SectionHeader title="Security Settings" />
            
            <SettingItem
              icon="shield-checkmark"
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorAuth}
              onToggle={() => handleToggle('twoFactorAuth')}
              iconColor={Colors.success}
            />
            
            <SettingItem
              icon="notifications"
              title="Login Alerts"
              description="Get notified when someone logs into your account"
              value={settings.loginAlerts}
              onToggle={() => handleToggle('loginAlerts')}
              iconColor={Colors.warning}
            />

            {/* Account Actions */}
            <SectionHeader title="Account Actions" />
            
            <ActionItem
              icon="key"
              title="Change Password"
              description="Update your account password"
              onPress={() => setChangePasswordModal(true)}
              iconColor={Colors.info}
            />
            
            <ActionItem
              icon="download"
              title="Download My Data"
              description="Download a copy of your account data"
              onPress={() => Alert.alert('Info', 'Data export will be sent to your email within 24 hours.')}
              iconColor={Colors.crackzoneYellow}
            />
            
            <ActionItem
              icon="trash"
              title="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              iconColor={Colors.error}
              textColor={Colors.error}
            />
          </View>
        </ScrollView>

        {/* Change Password Modal */}
        <Modal
          visible={changePasswordModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { padding: getSpacing(Layout.spacing.lg) }
            ]}>
              <Text style={[
                styles.modalTitle,
                { 
                  fontSize: getFontSize(20),
                  marginBottom: getSpacing(Layout.spacing.lg),
                }
              ]}>
                Change Password
              </Text>
              
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    marginBottom: getSpacing(Layout.spacing.md),
                    fontSize: getFontSize(16),
                  }
                ]}
                placeholder="Current Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
              />
              
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    marginBottom: getSpacing(Layout.spacing.md),
                    fontSize: getFontSize(16),
                  }
                ]}
                placeholder="New Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
              />
              
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    marginBottom: getSpacing(Layout.spacing.lg),
                    fontSize: getFontSize(16),
                  }
                ]}
                placeholder="Confirm New Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { padding: getSpacing(Layout.spacing.md) }
                  ]}
                  onPress={() => {
                    setChangePasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <Text style={[
                    styles.cancelButtonText,
                    { fontSize: getFontSize(16) }
                  ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { padding: getSpacing(Layout.spacing.md) }
                  ]}
                  onPress={handleChangePassword}
                >
                  <Text style={[
                    styles.confirmButtonText,
                    { fontSize: getFontSize(16) }
                  ]}>
                    Change Password
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  actionItem: {
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
    fontWeight: '600',
  },
  settingDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  privacyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privacyTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  privacyOption: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPrivacyOption: {
    borderColor: Colors.crackzoneYellow,
    backgroundColor: Colors.crackzoneYellow + '10',
  },
  privacyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: Colors.crackzoneYellow,
  },
  radioButtonInner: {
    backgroundColor: Colors.crackzoneYellow,
  },
  privacyOptionText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.crackzoneYellow,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
});