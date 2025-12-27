import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getSpacing, getFontSize } = useResponsive();

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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

  const ProfileItem = ({ icon, title, subtitle, onPress, iconColor = Colors.crackzoneYellow }) => (
    <TouchableOpacity 
      style={[
        styles.profileItem,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={[
          styles.profileItemIcon,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons 
            name={icon} 
            size={getFontSize(20)} 
            color={iconColor} 
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
      <Ionicons 
        name="chevron-forward" 
        size={getFontSize(20)} 
        color={Colors.textMuted} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Profile"
          showBackButton={false}
          showBorder={false}
        />

        {/* Subtitle */}
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
            Manage your account and settings
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.crackzoneYellow}
            />
          }
        >
          {/* User Info Card */}
          <View style={[
            styles.userCard,
            {
              marginHorizontal: getSpacing(Layout.spacing.lg),
              padding: getSpacing(Layout.spacing.lg),
              marginBottom: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <View style={styles.userInfo}>
              <View style={[
                styles.avatar,
                {
                  width: getSpacing(60),
                  height: getSpacing(60),
                  borderRadius: getSpacing(30),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Ionicons 
                  name="person" 
                  size={getFontSize(30)} 
                  color={Colors.crackzoneYellow} 
                />
              </View>
              
              <Text style={[
                styles.username,
                { 
                  fontSize: getFontSize(20),
                  marginBottom: getSpacing(Layout.spacing.xs),
                }
              ]}>
                {user?.username || 'Gamer'}
              </Text>
              
              <Text style={[
                styles.email,
                { fontSize: getFontSize(14) }
              ]}>
                {user?.email || 'gamer@example.com'}
              </Text>
            </View>
          </View>

          {/* Profile Options */}
          <View style={[
            styles.optionsSection,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
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
              subtitle="View detailed gaming statistics"
              onPress={() => navigation.navigate('Statistics')}
            />
            <ProfileItem
              icon="card-outline"
              title="Transaction History"
              subtitle="View your payment history"
              onPress={() => navigation.navigate('TransactionHistory')}
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
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.logoutButton,
                {
                  padding: getSpacing(Layout.spacing.md),
                }
              ]} 
              onPress={handleLogout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={getFontSize(20)} 
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
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    alignItems: 'center',
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