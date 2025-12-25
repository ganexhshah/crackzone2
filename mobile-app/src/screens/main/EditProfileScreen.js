import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';

const GAMES = [
  'FreeFire',
  'PUBG Mobile',
  'Call of Duty Mobile',
  'Valorant',
  'CS:GO',
  'Fortnite',
  'Apex Legends',
  'League of Legends'
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    favoriteGame: 'FreeFire',
    gameId: '',
    privacySetting: 'public',
    notificationsEnabled: true,
    autoJoinTeams: false,
    soundEffectsEnabled: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      const userData = response.data.user;
      
      setProfile({
        username: userData.username || '',
        bio: userData.bio || '',
        favoriteGame: userData.favoriteGame || 'FreeFire',
        gameId: userData.gameProfiles?.[0]?.game_uid || '',
        privacySetting: userData.privacySetting || 'public',
        notificationsEnabled: userData.notificationsEnabled !== false,
        autoJoinTeams: userData.autoJoinTeams || false,
        soundEffectsEnabled: userData.soundEffectsEnabled !== false
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.updateProfile(profile);
      
      // Update user context
      updateUser({
        ...user,
        username: profile.username,
        bio: profile.bio,
        favoriteGame: profile.favoriteGame
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const PickerField = ({ label, value, onValueChange, options }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pickerOption,
                value === option && styles.pickerOptionSelected
              ]}
              onPress={() => onValueChange(option)}
            >
              <Text style={[
                styles.pickerOptionText,
                value === option && styles.pickerOptionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const SwitchField = ({ label, value, onValueChange, description }) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchTextContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && <Text style={styles.switchDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.crackzoneYellow + '40' }}
        thumbColor={value ? Colors.crackzoneYellow : Colors.textMuted}
      />
    </View>
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.crackzoneYellow} />
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <InputField
              label="Username"
              value={profile.username}
              onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
              placeholder="Enter your username"
            />

            <InputField
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              multiline
            />
          </View>

          {/* Gaming Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gaming Information</Text>
            
            <PickerField
              label="Favorite Game"
              value={profile.favoriteGame}
              onValueChange={(value) => setProfile(prev => ({ ...prev, favoriteGame: value }))}
              options={GAMES}
            />

            <InputField
              label={`${profile.favoriteGame} ID`}
              value={profile.gameId}
              onChangeText={(text) => setProfile(prev => ({ ...prev, gameId: text }))}
              placeholder={`Enter your ${profile.favoriteGame} ID`}
            />
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Settings</Text>
            
            <PickerField
              label="Profile Visibility"
              value={profile.privacySetting}
              onValueChange={(value) => setProfile(prev => ({ ...prev, privacySetting: value }))}
              options={['public', 'friends', 'private']}
            />

            <SwitchField
              label="Push Notifications"
              value={profile.notificationsEnabled}
              onValueChange={(value) => setProfile(prev => ({ ...prev, notificationsEnabled: value }))}
              description="Receive notifications about tournaments and matches"
            />

            <SwitchField
              label="Auto-join Teams"
              value={profile.autoJoinTeams}
              onValueChange={(value) => setProfile(prev => ({ ...prev, autoJoinTeams: value }))}
              description="Automatically join available teams when possible"
            />

            <SwitchField
              label="Sound Effects"
              value={profile.soundEffectsEnabled}
              onValueChange={(value) => setProfile(prev => ({ ...prev, soundEffectsEnabled: value }))}
              description="Play sound effects in the app"
            />
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
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.crackzoneYellow,
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: Colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  avatar: {
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
  changeAvatarButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.crackzoneYellow + '20',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  changeAvatarText: {
    color: Colors.crackzoneYellow,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: Layout.spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    marginRight: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  switchDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});