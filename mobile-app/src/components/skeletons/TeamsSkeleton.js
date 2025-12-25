import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonTeamCard, 
  SkeletonList 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function TeamsSkeleton() {
  const { getSpacing, getContainerPadding } = useResponsive();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Teams"
          showBackButton={false}
          rightIcon="add-circle-outline"
          showBorder={false}
        />

        {/* Subtitle Skeleton */}
        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getContainerPadding(),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <SkeletonLoader width="75%" height={16} />
        </View>

        {/* Tabs Skeleton */}
        <View style={[
          styles.tabsContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
            padding: getSpacing(Layout.spacing.xs),
          }
        ]}>
          <View style={styles.tabsRow}>
            <SkeletonLoader width="30%" height={32} borderRadius={Layout.borderRadius.md} />
            <SkeletonLoader width="35%" height={32} borderRadius={Layout.borderRadius.md} />
            <SkeletonLoader width="25%" height={32} borderRadius={Layout.borderRadius.md} />
          </View>
        </View>

        {/* Search Bar Skeleton (for Available Teams tab) */}
        <View style={[
          styles.searchContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
            padding: getSpacing(Layout.spacing.md),
          }
        ]}>
          <SkeletonLoader width="100%" height={20} />
        </View>

        {/* Team Cards Skeleton */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[
            styles.teamsList,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <SkeletonList 
              itemComponent={SkeletonTeamCard}
              itemCount={4}
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
  subtitleContainer: {
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  searchContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  teamsList: {
    // Dynamic padding applied via responsive hook
  },
});