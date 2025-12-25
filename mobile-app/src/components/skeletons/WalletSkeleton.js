import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  SkeletonLoader, 
  SkeletonWalletCard, 
  SkeletonTransactionItem, 
  SkeletonList 
} from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function WalletSkeleton() {
  const { getSpacing, getContainerPadding, getResponsiveValue } = useResponsive();

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Wallet"
          showBackButton={false}
          rightIcon="card-outline"
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
          <SkeletonLoader width="70%" height={16} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Balance Card Skeleton */}
          <View style={[
            styles.balanceSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.balanceCard,
              {
                padding: getSpacing(Layout.spacing.xl),
                borderRadius: Layout.borderRadius.xl,
              }
            ]}>
              <SkeletonLoader width="50%" height={16} />
              <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
                <SkeletonLoader width="70%" height={32} />
              </View>
              <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                <SkeletonLoader width="60%" height={14} />
              </View>
            </View>
          </View>

          {/* Action Buttons Skeleton */}
          <View style={[
            styles.actionsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={styles.actionsRow}>
              <SkeletonLoader 
                width="48%" 
                height={getResponsiveValue(48, 52, 56, 60, 64, 68, 72)} 
                borderRadius={Layout.borderRadius.lg} 
              />
              <SkeletonLoader 
                width="48%" 
                height={getResponsiveValue(48, 52, 56, 60, 64, 68, 72)} 
                borderRadius={Layout.borderRadius.lg} 
              />
            </View>
          </View>

          {/* Recent Transactions Section */}
          <View style={[
            styles.transactionsSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            {/* Section Header */}
            <View style={[
              styles.sectionHeader,
              { marginBottom: getSpacing(Layout.spacing.lg) }
            ]}>
              <SkeletonLoader width="40%" height={20} />
              <SkeletonLoader width="20%" height={16} />
            </View>

            {/* Transaction Items */}
            <SkeletonList 
              itemComponent={SkeletonTransactionItem}
              itemCount={5}
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
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    // Dynamic padding applied via responsive hook
  },
  balanceCard: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow + '40',
    alignItems: 'center',
  },
  actionsSection: {
    // Dynamic padding applied via responsive hook
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionsSection: {
    // Dynamic padding applied via responsive hook
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});