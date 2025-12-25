import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonHeader, 
  SkeletonTournamentCard, 
  SkeletonList 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function TournamentsSkeleton() {
  const { getSpacing, getContainerPadding } = useResponsive();

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Tournaments"
          showBackButton={false}
          rightIcon="notifications-outline"
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
          <SkeletonLoader width="80%" height={16} />
        </View>

        {/* Search Bar Skeleton */}
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
            <SkeletonLoader width="20%" height={32} borderRadius={Layout.borderRadius.md} />
            <SkeletonLoader width="25%" height={32} borderRadius={Layout.borderRadius.md} />
            <SkeletonLoader width="22%" height={32} borderRadius={Layout.borderRadius.md} />
          </View>
        </View>

        {/* Tournament Cards Skeleton */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[
            styles.tournamentsList,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <SkeletonList 
              itemComponent={SkeletonTournamentCard}
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
  searchContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scrollView: {
    flex: 1,
  },
  tournamentsList: {
    // Dynamic padding applied via responsive hook
  },
});