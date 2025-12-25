import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useResponsive } from '../hooks/useResponsive';

export const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = Layout.borderRadius.sm,
  style = {},
  animated = true 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.surface,
        },
        style,
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              Colors.border + '40',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      )}
    </View>
  );
};

export const SkeletonCard = ({ children, style = {} }) => {
  const { getSpacing } = useResponsive();
  
  return (
    <View style={[
      styles.card,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      },
      style
    ]}>
      {children}
    </View>
  );
};

export const SkeletonHeader = () => {
  const { getFontSize, getSpacing, getContainerPadding } = useResponsive();
  
  return (
    <View style={[
      styles.header,
      {
        paddingHorizontal: getContainerPadding(),
        paddingVertical: getSpacing(Layout.spacing.lg),
      }
    ]}>
      <SkeletonLoader width="60%" height={getFontSize(24)} />
      <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
        <SkeletonLoader width="80%" height={getFontSize(16)} />
      </View>
    </View>
  );
};

export const SkeletonTournamentCard = () => {
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  
  return (
    <SkeletonCard>
      <View style={styles.tournamentCardHeader}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="70%" height={getFontSize(18)} />
          <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
            <SkeletonLoader width="50%" height={getFontSize(14)} />
          </View>
        </View>
        <SkeletonLoader 
          width={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
          height={getResponsiveValue(60, 65, 70, 75, 80, 85, 90)} 
          borderRadius={getResponsiveValue(30, 32.5, 35, 37.5, 40, 42.5, 45)}
        />
      </View>
      
      <View style={[styles.tournamentCardBody, { marginTop: getSpacing(Layout.spacing.md) }]}>
        <View style={styles.tournamentCardRow}>
          <SkeletonLoader width="30%" height={getFontSize(14)} />
          <SkeletonLoader width="25%" height={getFontSize(14)} />
        </View>
        <View style={[styles.tournamentCardRow, { marginTop: getSpacing(Layout.spacing.sm) }]}>
          <SkeletonLoader width="40%" height={getFontSize(14)} />
          <SkeletonLoader width="35%" height={getFontSize(14)} />
        </View>
      </View>
      
      <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
        <SkeletonLoader width="100%" height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} borderRadius={Layout.borderRadius.lg} />
      </View>
    </SkeletonCard>
  );
};

export const SkeletonTeamCard = () => {
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  
  return (
    <SkeletonCard>
      <View style={styles.teamCardHeader}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height={getFontSize(18)} />
          <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
            <SkeletonLoader width="40%" height={getFontSize(14)} />
          </View>
        </View>
        <SkeletonLoader 
          width={getResponsiveValue(50, 55, 60, 65, 70, 75, 80)} 
          height={getResponsiveValue(50, 55, 60, 65, 70, 75, 80)} 
          borderRadius={getResponsiveValue(25, 27.5, 30, 32.5, 35, 37.5, 40)}
        />
      </View>
      
      <View style={[styles.teamCardStats, { marginTop: getSpacing(Layout.spacing.md) }]}>
        <SkeletonLoader width="25%" height={getFontSize(12)} />
        <SkeletonLoader width="25%" height={getFontSize(12)} />
        <SkeletonLoader width="25%" height={getFontSize(12)} />
      </View>
      
      <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
        <SkeletonLoader width="100%" height={getResponsiveValue(36, 40, 44, 48, 52, 56, 60)} borderRadius={Layout.borderRadius.md} />
      </View>
    </SkeletonCard>
  );
};

export const SkeletonWalletCard = () => {
  const { getFontSize, getSpacing } = useResponsive();
  
  return (
    <SkeletonCard style={styles.walletCard}>
      <View style={styles.walletCardContent}>
        <SkeletonLoader width="40%" height={getFontSize(14)} />
        <View style={{ marginTop: getSpacing(Layout.spacing.md) }}>
          <SkeletonLoader width="60%" height={getFontSize(28)} />
        </View>
        <View style={{ marginTop: getSpacing(Layout.spacing.sm) }}>
          <SkeletonLoader width="50%" height={getFontSize(12)} />
        </View>
      </View>
    </SkeletonCard>
  );
};

export const SkeletonTransactionItem = () => {
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  
  return (
    <View style={[
      styles.transactionItem,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <SkeletonLoader 
        width={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
        height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
        borderRadius={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)}
      />
      <View style={[styles.transactionContent, { marginLeft: getSpacing(Layout.spacing.md) }]}>
        <SkeletonLoader width="70%" height={getFontSize(16)} />
        <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
          <SkeletonLoader width="50%" height={getFontSize(14)} />
        </View>
      </View>
      <View style={styles.transactionAmount}>
        <SkeletonLoader width="60%" height={getFontSize(16)} />
      </View>
    </View>
  );
};

export const SkeletonNotificationItem = () => {
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  
  return (
    <SkeletonCard>
      <View style={styles.notificationContent}>
        <SkeletonLoader 
          width={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
          height={getResponsiveValue(40, 44, 48, 52, 56, 60, 64)} 
          borderRadius={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)}
        />
        <View style={[styles.notificationText, { marginLeft: getSpacing(Layout.spacing.md) }]}>
          <View style={styles.notificationHeader}>
            <SkeletonLoader width="60%" height={getFontSize(16)} />
            <SkeletonLoader width="20%" height={getFontSize(12)} />
          </View>
          <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
            <SkeletonLoader width="90%" height={getFontSize(14)} />
          </View>
          <View style={{ marginTop: getSpacing(Layout.spacing.xs) }}>
            <SkeletonLoader width="70%" height={getFontSize(14)} />
          </View>
        </View>
      </View>
    </SkeletonCard>
  );
};

export const SkeletonProfileCard = () => {
  const { getFontSize, getSpacing, getResponsiveValue } = useResponsive();
  
  return (
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
  );
};

export const SkeletonList = ({ 
  itemComponent: ItemComponent = SkeletonLoader, 
  itemCount = 5,
  containerStyle = {} 
}) => {
  return (
    <View style={containerStyle}>
      {Array.from({ length: itemCount }, (_, index) => (
        <ItemComponent key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    // Dynamic padding applied via responsive hook
  },
  tournamentCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tournamentCardBody: {
    // Dynamic margin applied via responsive hook
  },
  tournamentCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletCard: {
    backgroundColor: Colors.crackzoneYellow + '20',
  },
  walletCardContent: {
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionContent: {
    flex: 1,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
});