import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonNotificationItem, 
  SkeletonList 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function NotificationsSkeleton() {
  const { getSpacing, getContainerPadding } = useResponsive();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Notifications"
          rightIcon="checkmark-done-outline"
          showBorder={false}
        />

        {/* Unread Count Skeleton */}
        <View style={[
          styles.unreadCountContainer,
          {
            paddingHorizontal: getContainerPadding(),
            paddingBottom: getSpacing(Layout.spacing.md),
          }
        ]}>
          <SkeletonLoader width="50%" height={14} />
        </View>

        {/* Filter Tabs Skeleton */}
        <View style={[
          styles.filtersContainer,
          {
            paddingHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            <View style={styles.filtersRow}>
              <SkeletonLoader width={60} height={32} borderRadius={Layout.borderRadius.lg} style={styles.filterItem} />
              <SkeletonLoader width={80} height={32} borderRadius={Layout.borderRadius.lg} style={styles.filterItem} />
              <SkeletonLoader width={70} height={32} borderRadius={Layout.borderRadius.lg} style={styles.filterItem} />
              <SkeletonLoader width={75} height={32} borderRadius={Layout.borderRadius.lg} style={styles.filterItem} />
              <SkeletonLoader width={65} height={32} borderRadius={Layout.borderRadius.lg} style={styles.filterItem} />
            </View>
          </ScrollView>
        </View>

        {/* Notifications List Skeleton */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[
            styles.notificationsList,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <SkeletonList 
              itemComponent={SkeletonNotificationItem}
              itemCount={6}
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
  unreadCountContainer: {
    alignItems: 'center',
  },
  filtersContainer: {
    // Dynamic padding applied via responsive hook
  },
  filtersScrollView: {
    paddingRight: Layout.spacing.lg,
  },
  filtersRow: {
    flexDirection: 'row',
  },
  filterItem: {
    marginRight: Layout.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    // Dynamic padding applied via responsive hook
  },
});