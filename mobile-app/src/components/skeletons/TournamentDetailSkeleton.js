import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import { SkeletonLoader, SkeletonCard } from '../SkeletonLoader';
import ResponsiveHeader from '../ResponsiveHeader';

export default function TournamentDetailSkeleton() {
  const { getSpacing, getContainerPadding, getResponsiveValue, getFontSize } = useResponsive();

  const ParticipantItemSkeleton = () => (
    <View style={[
      styles.participantItem,
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
      <View style={[styles.participantInfo, { marginLeft: getSpacing(Layout.spacing.md) }]}>
        <SkeletonLoader width="70%" height={getFontSize(16)} />
        <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
          <SkeletonLoader width="50%" height={getFontSize(14)} />
        </View>
      </View>
      <SkeletonLoader width="15%" height={getFontSize(14)} />
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
          title="Tournament Details"
          rightIcon="share-outline"
          showBorder={false}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section Skeleton */}
          <View style={[
            styles.heroSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <SkeletonLoader 
              width={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
              height={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
              borderRadius={getResponsiveValue(30, 32.5, 35, 37.5, 40, 42.5, 45)}
            />
            <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
              <SkeletonLoader width="80%" height={getFontSize(24)} />
            </View>
            <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
              <SkeletonLoader width="60%" height={getFontSize(16)} />
            </View>
            <View style={[styles.badgesContainer, { marginTop: getSpacing(Layout.spacing.lg) }]}>
              <SkeletonLoader width="25%" height={32} borderRadius={Layout.borderRadius.lg} />
              <SkeletonLoader width="20%" height={32} borderRadius={Layout.borderRadius.lg} />
            </View>
          </View>

          {/* Prize & Entry Cards Skeleton */}
          <View style={[
            styles.prizeSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={styles.prizeRow}>
              <SkeletonCard style={styles.prizeCard}>
                <SkeletonLoader 
                  width={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
                  height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
                  borderRadius={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)}
                />
                <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
                  <SkeletonLoader width="60%" height={getFontSize(12)} />
                </View>
                <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                  <SkeletonLoader width="80%" height={getFontSize(20)} />
                </View>
              </SkeletonCard>

              <SkeletonCard style={styles.entryCard}>
                <SkeletonLoader 
                  width={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
                  height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
                  borderRadius={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)}
                />
                <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
                  <SkeletonLoader width="50%" height={getFontSize(12)} />
                </View>
                <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
                  <SkeletonLoader width="70%" height={getFontSize(20)} />
                </View>
              </SkeletonCard>
            </View>
          </View>

          {/* Info Cards Skeleton */}
          <View style={[
            styles.infoSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={{ marginBottom: getSpacing(Layout.spacing.lg) }}>
              <SkeletonLoader width="50%" height={getFontSize(20)} />
            </View>

            <SkeletonCard style={{ marginBottom: getSpacing(Layout.spacing.md) }}>
              <View style={styles.infoCardContent}>
                <SkeletonLoader 
                  width={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  height={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  borderRadius={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)}
                />
                <View style={[styles.infoText, { marginLeft: getSpacing(Layout.spacing.md) }]}>
                  <SkeletonLoader width="60%" height={getFontSize(16)} />
                  <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
                    <SkeletonLoader width="80%" height={getFontSize(14)} />
                  </View>
                </View>
              </View>
              <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
                <SkeletonLoader width="100%" height={6} borderRadius={3} />
              </View>
            </SkeletonCard>

            <SkeletonCard style={{ marginBottom: getSpacing(Layout.spacing.md) }}>
              <View style={styles.infoCardContent}>
                <SkeletonLoader 
                  width={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  height={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  borderRadius={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)}
                />
                <View style={[styles.infoText, { marginLeft: getSpacing(Layout.spacing.md) }]}>
                  <SkeletonLoader width="70%" height={getFontSize(16)} />
                  <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
                    <SkeletonLoader width="90%" height={getFontSize(14)} />
                  </View>
                </View>
              </View>
            </SkeletonCard>

            <SkeletonCard>
              <View style={styles.infoCardContent}>
                <SkeletonLoader 
                  width={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  height={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} 
                  borderRadius={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)}
                />
                <View style={[styles.infoText, { marginLeft: getSpacing(Layout.spacing.md) }]}>
                  <SkeletonLoader width="65%" height={getFontSize(16)} />
                  <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
                    <SkeletonLoader width="85%" height={getFontSize(14)} />
                  </View>
                </View>
              </View>
            </SkeletonCard>
          </View>

          {/* Participants Section Skeleton */}
          <View style={[
            styles.participantsSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <View style={[styles.participantsHeader, { marginBottom: getSpacing(Layout.spacing.lg) }]}>
              <SkeletonLoader width="30%" height={getFontSize(20)} />
              <SkeletonLoader width="10%" height={getFontSize(12)} borderRadius={Layout.borderRadius.md} />
            </View>

            <ParticipantItemSkeleton />
            <ParticipantItemSkeleton />
            <ParticipantItemSkeleton />
            <ParticipantItemSkeleton />
          </View>
        </ScrollView>

        {/* Bottom Action Skeleton */}
        <View style={[
          styles.actionSection,
          {
            paddingHorizontal: getContainerPadding(),
            paddingVertical: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <SkeletonLoader 
            width="100%" 
            height={getResponsiveValue(48, 52, 56, 60, 64, 68, 72)} 
            borderRadius={Layout.borderRadius.xl} 
          />
        </View>
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
  heroSection: {
    alignItems: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  prizeSection: {
    // Dynamic padding applied via responsive hook
  },
  prizeRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  prizeCard: {
    flex: 1,
    alignItems: 'center',
  },
  entryCard: {
    flex: 1,
    alignItems: 'center',
  },
  infoSection: {
    // Dynamic padding applied via responsive hook
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  participantsSection: {
    // Dynamic padding applied via responsive hook
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  participantInfo: {
    flex: 1,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    backgroundColor: Colors.surface + '60',
  },
});