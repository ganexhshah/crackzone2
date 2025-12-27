import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { getSpacing, getFontSize } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    favoriteGame: 'FreeFire',
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Edit Profile"
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
            Update your personal information
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.formContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* Avatar Section */}
            <View style={[
              styles.avatarSection,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <View style={[
                styles.avatar,
                {
                  width: getSpacing(80),
                  height: getSpacing(80),
                  borderRadius: getSpacing(40),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Ionicons 
                  name="person" 
                  size={getFontSize(40)} 
                  color={Colors.crackzoneYellow} 
                />
              </View>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={[
                  styles.changePhotoText,
                  { fontSize: getFontSize(14) }
                ]}>
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={[
              styles.formField,
              { marginBottom: getSpacing(Layout.spacing.md) }
            ]}>
              <Text style={[
                styles.fieldLabel,
                { fontSize: getFontSize(14) }
              ]}>
                Username
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    fontSize: getFontSize(16),
                  }
                ]}
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
                placeholder="Enter username"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={[
              styles.formField,
              { marginBottom: getSpacing(Layout.spacing.md) }
            ]}>
              <Text style={[
                styles.fieldLabel,
                { fontSize: getFontSize(14) }
              ]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    fontSize: getFontSize(16),
                  }
                ]}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Enter email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
              />
            </View>

            <View style={[
              styles.formField,
              { marginBottom: getSpacing(Layout.spacing.md) }
            ]}>
              <Text style={[
                styles.fieldLabel,
                { fontSize: getFontSize(14) }
              ]}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    padding: getSpacing(Layout.spacing.md),
                    fontSize: getFontSize(16),
                    height: getSpacing(100),
                  }
                ]}
                value={formData.bio}
                onChangeText={(text) => setFormData({...formData, bio: text})}
                placeholder="Tell us about yourself"
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={[
              styles.formField,
              { marginBottom: getSpacing(Layout.spacing.xl) }
            ]}>
              <Text style={[
                styles.fieldLabel,
                { fontSize: getFontSize(14) }
              ]}>
                Favorite Game
              </Text>
              <View style={styles.gameOptions}>
                {['FreeFire', 'PUBG', 'Call of Duty', 'Mobile Legends'].map((game) => (
                  <TouchableOpacity
                    key={game}
                    style={[
                      styles.gameOption,
                      {
                        padding: getSpacing(Layout.spacing.md),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      },
                      formData.favoriteGame === game && styles.selectedGameOption
                    ]}
                    onPress={() => setFormData({...formData, favoriteGame: game})}
                  >
                    <Text style={[
                      styles.gameOptionText,
                      { fontSize: getFontSize(16) },
                      formData.favoriteGame === game && styles.selectedGameOptionText
                    ]}>
                      {game}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  padding: getSpacing(Layout.spacing.md),
                }
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={[
                styles.saveButtonText,
                { fontSize: getFontSize(16) }
              ]}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
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
  formContainer: {
    // Dynamic padding applied via responsive hook
  },
  avatarSection: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow,
  },
  changePhotoButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  changePhotoText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  formField: {
    // Dynamic margin applied via responsive hook
  },
  fieldLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  gameOptions: {
    // Game options container
  },
  gameOption: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  selectedGameOption: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  gameOptionText: {
    color: Colors.text,
    fontWeight: '500',
  },
  selectedGameOptionText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
});