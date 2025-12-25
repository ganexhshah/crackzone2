import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding,
    isExtraSmallDevice,
    isSmallDevice 
  } = useResponsive();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity 
      style={[
        styles.profileItem,
        { 
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
          minHeight: Layout.minTouchTarget,
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={[
          styles.profileItemIcon,
          {
            width: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
            height: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
            borderRadius: getResponsiveValue(18, 20, 22, 24, 26, 28, 30),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons 
            name={icon} 
            size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
            color={Colors.crackzoneYellow} 
          />
        </View>
        <View style={styles.profileItemText}>
          <Text style={[
            styles.profileItemTitle,
            { 
              fontSize: getFontSize(16),
              marginBottom: getSpacing(Layout.spacing.xs),
            }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.profileItemSubtitle,
              { fontSize: getFontSize(14) }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
          color={Colors.textMuted} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={[
            styles.header,
            {
              paddingHorizontal: getContainerPadding(),
              paddingTop: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.md),
            }
          ]}>
            <Text style={[
              styles.headerTitle,
              { fontSize: getFontSize(isExtraSmallDevice ? 24 : isSmallDevice ? 26 : 28) }
            ]}>
              Profile
            </Text>
          </View>

          {/* User Info */}
          <View style={[
            styles.userSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.avatar,
              {
                width: getResponsiveValue(70, 75, 80, 85, 90, 95, 100),
                height: getResponsiveValue(70, 75, 80, 85, 90, 95, 100),
                borderRadius: getResponsiveValue(35, 37.5, 40, 42.5, 45, 47.5, 50),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <Ionicons 
                name="person" 
                size={getResponsiveValue(32, 36, 40, 44, 48, 52, 56)} 
                color={Colors.crackzoneYellow} 
              />
            </View>
            <Text style={[
              styles.username,
              { 
                fontSize: getFontSize(isExtraSmallDevice ? 20 : isSmallDevice ? 22 : 24),
                marginBottom: getSpacing(Layout.spacing.xs),
              }
            ]}>
              {user?.username || 'Gamer'}
            </Text>
            <Text style={[
              styles.email,
              { fontSize: getFontSize(16) }
            ]}>
              {user?.email || 'gamer@example.com'}
            </Text>
          </View>

          {/* Profile Options */}
          <View style={[
            styles.optionsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <ProfileItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <ProfileItem
              icon="game-controller-outline"
              title="Game Profiles"
              subtitle="Manage your gaming accounts"
              onPress={() => navigation.navigate('GameProfiles')}
            />
            <ProfileItem
              icon="trophy-outline"
              title="Achievements"
              subtitle="View your gaming achievements"
              onPress={() => navigation.navigate('Achievements')}
            />
            <ProfileItem
              icon="stats-chart-outline"
              title="Statistics"
              subtitle="View your gaming statistics"
              onPress={() => navigation.navigate('Statistics')}
            />
            <ProfileItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <ProfileItem
              icon="shield-outline"
              title="Privacy & Security"
              subtitle="Manage your account security"
              onPress={() => navigation.navigate('PrivacySecurity')}
            />
            <ProfileItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <ProfileItem
              icon="information-circle-outline"
              title="About"
              subtitle="App version and information"
              onPress={() => navigation.navigate('About')}
            />
          </View>

          {/* Logout */}
          <View style={[
            styles.logoutSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.logoutButton,
                {
                  padding: getSpacing(Layout.spacing.md),
                  minHeight: Layout.minTouchTarget,
                }
              ]} 
              onPress={handleLogout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)} 
                color={Colors.error} 
              />
              <Text style={[
                styles.logoutText,
                { 
                  fontSize: getFontSize(16),
                  marginLeft: getSpacing(Layout.spacing.sm),
                }
              ]}>
                Logout
              </Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    // Dynamic padding applied via responsive hook
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  userSection: {
    alignItems: 'center',
    // Dynamic padding applied via responsive hook
  },
  avatar: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow,
  },
  username: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  email: {
    color: Colors.textSecondary,
  },
  optionsSection: {
    // Dynamic padding applied via responsive hook
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  profileItemSubtitle: {
    color: Colors.textSecondary,
  },
  logoutSection: {
    // Dynamic padding applied via responsive hook
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontWeight: '600',
    color: Colors.error,
  },
});