import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';
import SearchModal from './SearchModal';

export default function SearchHeader({ 
  navigation, 
  title = "CrackZone", 
  showProfile = true, 
  showSearch = true,
  showNotifications = true,
  transparent = false,
  scrollY = null
}) {
  const { user } = useAuth();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const { getFontSize, getSpacing } = useResponsive();

  // Header opacity animation based on scroll
  const headerOpacity = scrollY ? scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [transparent ? 0 : 1, 1],
    extrapolate: 'clamp',
  }) : 1;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingTop: StatusBar.currentHeight || 44,
    },
    blurContainer: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.crackzoneYellow + '20',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      paddingVertical: getSpacing(Layout.spacing.md),
    },
    leftSection: {
      flex: 1,
    },
    title: {
      fontSize: getFontSize(22),
      fontWeight: 'bold',
      color: Colors.crackzoneYellow,
    },
    subtitle: {
      fontSize: getFontSize(12),
      color: Colors.textSecondary,
      marginTop: 2,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing(Layout.spacing.sm),
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.surface + '40',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.crackzoneYellow + '20',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.crackzoneYellow + '40',
    },
    profileAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.crackzoneYellow + '30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileName: {
      fontSize: getFontSize(10),
      color: Colors.text,
      fontWeight: '600',
      marginTop: 2,
    },
  });

  return (
    <>
      <Animated.View style={[styles.container, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)']}
            style={styles.header}
          >
            <View style={styles.leftSection}>
              <Text style={styles.title}>{title}</Text>
              {user && (
                <Text style={styles.subtitle}>Welcome, {user.username}!</Text>
              )}
            </View>
            
            <View style={styles.rightSection}>
              {showSearch && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setSearchModalVisible(true)}
                >
                  <Ionicons name="search" size={getFontSize(20)} color={Colors.text} />
                </TouchableOpacity>
              )}
              
              {showNotifications && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications-outline" size={getFontSize(20)} color={Colors.text} />
                </TouchableOpacity>
              )}
              
              {showProfile && (
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <View style={styles.profileAvatar}>
                    <Ionicons name="person" size={getFontSize(14)} color={Colors.crackzoneYellow} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </LinearGradient>
      </Animated.View>

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        navigation={navigation}
      />
    </>
  );
}