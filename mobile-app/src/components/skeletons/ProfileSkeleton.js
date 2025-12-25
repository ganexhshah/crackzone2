import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonProfileCard, 
  SkeletonCard 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function ProfileSkeleton() {
  const { getSpacing, getContainerPadding, getResponsiveValue, getFontSize } = useResponsive();

  const MenuItemSkeleton = () => (
    <View style={[
      styles.menuItem,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={styles.menuItemContent}>
        <SkeletonLoader 
          width={getResponsiveValue(24, 26, 28, 30, 32, 34, 36)} 
          height={getResponsiveValue(24, 26, 28, 30, 32, 34, 36)} 
          borderRadius={getResponsiveValue(12, 13, 14, 15, 16, 17, 18)}
        />
        <View style={[styles.menuItemText, { marginLeft: getSpacing(Layout.spacing.md) }]}>
          <SkeletonLoader width="60%" height={getFontSize(16)} />
          <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
            <SkeletonLoader width="80%" height={getFontSize(14)} />
          </View>
        </View>
        <SkeletonLoader 
          width={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
          height={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
          borderRadius={getResponsiveValue(10, 11, 12, 13, 14, 15, 16)}
        />
      </View>
    </View>
  );

  const StatItemSkeleton = () => (
    <View style={[
      styles.statItem,
      {
        padding: getSpacing(Layout.spacing.md),
      }
    ]}>
      <SkeletonLoader width="80%" height={getFontSize(24)} />
      <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
        <SkeletonLoader width="60%" height={getFontSize(14)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Profile"
          showBackButton={false}
          rightIcon="settings-outline"
          showBorder={false}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Card Skeleton */}
          <View style={[
            styles.profileSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <SkeletonCard>
              <View style={styles.profileContent}>
                <SkeletonLoader 
                  width={getResponsiveValue(80, 85, 90, 95, 100, 105, 110)} 
                  height={getResponsiveValue(80, 85, 90, 95, 100, 105, 110)} 
                  borderRadius={getResponsiveValue(40, 42.5, 45, 47.5, 50, 52.5, 55)}
                />
                <View style={[styles.profileInfo, { marginLeft: getSpacing(Layout.spacing.lg) }]}>
                  <SkeletonLoader width="70%" height={getFontSize(20)} />
                  <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                    <SkeletonLoader width="50%" height={getFontSize(16)} />
                  </View>
                  <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                    <SkeletonLoader width="60%" height={getFontSize(14)} />
                  </View>
                </View>
              </View>
            </SkeletonCard>
          </View>

          {/* Stats Section Skeleton */}
          <View style={[
            styles.statsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.statsGrid,
              {
                padding: getSpacing(Layout.spacing.md),
                borderRadius: Layout.borderRadius.lg,
              }
            ]}>
              <StatItemSkeleton />
              <StatItemSkeleton />
              <StatItemSkeleton />
              <StatItemSkeleton />
            </View>
          </View>

          {/* Menu Items Skeleton */}
          <View style={[
            styles.menuSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
            <MenuItemSkeleton />
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
  profileSection: {
    // Dynamic padding applied via responsive hook
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  statsSection: {
    // Dynamic padding applied via responsive hook
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
  },
  menuSection: {
    // Dynamic padding applied via responsive hook
  },
  menuItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
  },
});