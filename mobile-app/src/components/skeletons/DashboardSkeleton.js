import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonCard, 
  SkeletonTournamentCard,
  SkeletonList 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function DashboardSkeleton() {
  const { getSpacing, getContainerPadding, getResponsiveValue, getFontSize } = useResponsive();

  const QuickStatSkeleton = () => (
    <View style={[
      styles.quickStat,
      {
        padding: getSpacing(Layout.spacing.md),
        borderRadius: Layout.borderRadius.lg,
      }
    ]}>
      <SkeletonLoader 
        width={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
        height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
        borderRadius={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)}
      />
      <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
        <SkeletonLoader width="80%" height={getFontSize(20)} />
      </View>
      <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
        <SkeletonLoader width="60%" height={getFontSize(12)} />
      </View>
    </View>
  );

  const RecentActivitySkeleton = () => (
    <View style={[
      styles.activityItem,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <SkeletonLoader 
        width={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
        height={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
        borderRadius={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)}
      />
      <View style={[styles.activityContent, { marginLeft: getSpacing(Layout.spacing.md) }]}>
        <SkeletonLoader width="70%" height={getFontSize(16)} />
        <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
          <SkeletonLoader width="50%" height={getFontSize(14)} />
        </View>
      </View>
      <View style={styles.activityTime}>
        <SkeletonLoader width="30%" height={getFontSize(12)} />
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
          title="Dashboard"
          showBackButton={false}
          rightIcon="notifications-outline"
          showBorder={false}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Welcome Section Skeleton */}
          <View style={[
            styles.welcomeSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <SkeletonCard>
              <View style={styles.welcomeContent}>
                <View style={{ flex: 1 }}>
                  <SkeletonLoader width="40%" height={getFontSize(16)} />
                  <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                    <SkeletonLoader width="70%" height={getFontSize(24)} />
                  </View>
                  <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                    <SkeletonLoader width="80%" height={getFontSize(14)} />
                  </View>
                </View>
                <SkeletonLoader 
                  width={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
                  height={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
                  borderRadius={getResponsiveValue(30, 32.5, 35, 37.5, 40, 42.5, 45)}
                />
              </View>
            </SkeletonCard>
          </View>

          {/* Quick Stats Skeleton */}
          <View style={[
            styles.quickStatsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.sectionHeader,
              { marginBottom: getSpacing(Layout.spacing.lg) }
            ]}>
              <SkeletonLoader width="30%" height={getFontSize(20)} />
            </View>
            <View style={styles.quickStatsGrid}>
              <QuickStatSkeleton />
              <QuickStatSkeleton />
              <QuickStatSkeleton />
              <QuickStatSkeleton />
            </View>
          </View>

          {/* Featured Tournaments Skeleton */}
          <View style={[
            styles.tournamentsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.sectionHeader,
              { marginBottom: getSpacing(Layout.spacing.lg) }
            ]}>
              <SkeletonLoader width="40%" height={getFontSize(20)} />
              <SkeletonLoader width="20%" height={getFontSize(16)} />
            </View>
            <SkeletonList 
              itemComponent={SkeletonTournamentCard}
              itemCount={2}
            />
          </View>

          {/* Recent Activity Skeleton */}
          <View style={[
            styles.activitySection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <View style={[
              styles.sectionHeader,
              { marginBottom: getSpacing(Layout.spacing.lg) }
            ]}>
              <SkeletonLoader width="35%" height={getFontSize(20)} />
              <SkeletonLoader width="15%" height={getFontSize(16)} />
            </View>
            <SkeletonCard>
              <RecentActivitySkeleton />
              <RecentActivitySkeleton />
              <RecentActivitySkeleton />
              <RecentActivitySkeleton />
            </SkeletonCard>
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
  welcomeSection: {
    // Dynamic padding applied via responsive hook
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatsSection: {
    // Dynamic padding applied via responsive hook
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStat: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  tournamentsSection: {
    // Dynamic padding applied via responsive hook
  },
  activitySection: {
    // Dynamic padding applied via responsive hook
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface + '60',
    borderRadius: Layout.borderRadius.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTime: {
    alignItems: 'flex-end',
  },
});