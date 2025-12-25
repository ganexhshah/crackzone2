import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isSmallDevice, isTablet, getResponsiveValue, getSpacing, getFontSize } = useResponsive();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, tournamentsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getUpcomingTournaments(),
      ]);
      
      setStats(statsResponse.data);
      setUpcomingTournaments(tournamentsResponse.data.tournaments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon, color = Colors.crackzoneYellow }) => (
    <View style={[
      styles.statCard,
      {
        width: getResponsiveValue('48%', '48%', '48%', '23%'),
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={getResponsiveValue(20, 22, 24, 26)} color={color} />
      </View>
      <Text style={[styles.statValue, { fontSize: getFontSize(20) }]}>{value}</Text>
      <Text style={[styles.statTitle, { fontSize: getFontSize(12) }]}>{title}</Text>
    </View>
  );

  const TournamentCard = ({ tournament }) => (
    <TouchableOpacity
      style={[
        styles.tournamentCard,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}
      onPress={() => navigation.navigate('Tournaments', {
        screen: 'TournamentDetail',
        params: { tournamentId: tournament.id }
      })}
    >
      <View style={styles.tournamentHeader}>
        <Text style={[styles.tournamentTitle, { fontSize: getFontSize(16) }]}>{tournament.title}</Text>
        <View style={[styles.tournamentType, { backgroundColor: getTypeColor(tournament.tournament_type) }]}>
          <Text style={[styles.tournamentTypeText, { fontSize: getFontSize(12) }]}>{tournament.tournament_type}</Text>
        </View>
      </View>
      <Text style={[styles.tournamentGame, { fontSize: getFontSize(14) }]}>{tournament.game}</Text>
      <View style={styles.tournamentDetails}>
        <View style={styles.tournamentDetail}>
          <Ionicons name="trophy-outline" size={getFontSize(16)} color={Colors.crackzoneYellow} />
          <Text style={[styles.tournamentDetailText, { fontSize: getFontSize(14) }]}>₹{tournament.prize_pool}</Text>
        </View>
        <View style={styles.tournamentDetail}>
          <Ionicons name="people-outline" size={getFontSize(16)} color={Colors.textSecondary} />
          <Text style={[styles.tournamentDetailText, { fontSize: getFontSize(14) }]}>{tournament.registered_count}/{tournament.max_participants}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'SOLO': return Colors.info + '40';
      case 'DUO': return Colors.warning + '40';
      case 'SQUAD': return Colors.success + '40';
      default: return Colors.textMuted + '40';
    }
  };

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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      paddingTop: getSpacing(Layout.spacing.lg),
      paddingBottom: getSpacing(Layout.spacing.md),
    },
    greeting: {
      fontSize: getFontSize(16),
      color: Colors.textSecondary,
    },
    username: {
      fontSize: getFontSize(24),
      fontWeight: 'bold',
      color: Colors.text,
    },
    notificationButton: {
      padding: getSpacing(Layout.spacing.sm),
    },
    statsSection: {
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.lg),
    },
    sectionTitle: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: getSpacing(Layout.spacing.md),
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      backgroundColor: Colors.surface,
      borderRadius: Layout.borderRadius.lg,
      alignItems: 'center',
    },
    statIcon: {
      width: getResponsiveValue(40, 44, 48, 52),
      height: getResponsiveValue(40, 44, 48, 52),
      borderRadius: getResponsiveValue(20, 22, 24, 26),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    statValue: {
      fontWeight: 'bold',
      color: Colors.text,
    },
    statTitle: {
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    tournamentsSection: {
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.lg),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getSpacing(Layout.spacing.md),
    },
    seeAllText: {
      color: Colors.crackzoneYellow,
      fontSize: getFontSize(14),
      fontWeight: '600',
    },
    tournamentCard: {
      backgroundColor: Colors.surface,
      borderRadius: Layout.borderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    tournamentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    tournamentTitle: {
      fontWeight: 'bold',
      color: Colors.text,
      flex: 1,
      marginRight: getSpacing(Layout.spacing.sm),
    },
    tournamentType: {
      paddingHorizontal: getSpacing(Layout.spacing.sm),
      paddingVertical: getSpacing(Layout.spacing.xs),
      borderRadius: Layout.borderRadius.sm,
    },
    tournamentTypeText: {
      fontWeight: '600',
      color: Colors.text,
    },
    tournamentGame: {
      color: Colors.textSecondary,
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    tournamentDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tournamentDetail: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tournamentDetailText: {
      color: Colors.textSecondary,
      marginLeft: getSpacing(Layout.spacing.xs),
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: getSpacing(Layout.spacing.xl),
    },
    emptyStateText: {
      fontSize: getFontSize(16),
      color: Colors.textMuted,
      marginTop: getSpacing(Layout.spacing.sm),
    },
    quickActionsSection: {
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.xl),
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickAction: {
      backgroundColor: Colors.surface,
      borderRadius: Layout.borderRadius.lg,
      padding: getSpacing(Layout.spacing.md),
      alignItems: 'center',
      width: getResponsiveValue('48%', '48%', '48%', '23%'),
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    quickActionText: {
      fontSize: getFontSize(12),
      color: Colors.text,
      marginTop: getSpacing(Layout.spacing.sm),
      textAlign: 'center',
    },
  });

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.crackzoneYellow} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>{user?.username || 'Gamer'}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={getFontSize(24)} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Tournaments"
                value={stats?.tournaments_joined || '0'}
                icon="trophy-outline"
                color={Colors.crackzoneYellow}
              />
              <StatCard
                title="Wins"
                value={stats?.wins || '0'}
                icon="checkmark-circle-outline"
                color={Colors.success}
              />
              <StatCard
                title="Teams"
                value={stats?.teams_joined || '0'}
                icon="people-outline"
                color={Colors.info}
              />
              <StatCard
                title="Earnings"
                value={`₹${stats?.total_earnings || '0'}`}
                icon="wallet-outline"
                color={Colors.warning}
              />
            </View>
          </View>

          {/* Upcoming Tournaments */}
          <View style={styles.tournamentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Tournaments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tournaments')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingTournaments.length > 0 ? (
              upcomingTournaments.slice(0, 3).map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={getFontSize(48)} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No upcoming tournaments</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Tournaments')}
              >
                <Ionicons name="trophy" size={getFontSize(24)} color={Colors.crackzoneYellow} />
                <Text style={styles.quickActionText}>Join Tournament</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Teams')}
              >
                <Ionicons name="people" size={getFontSize(24)} color={Colors.info} />
                <Text style={styles.quickActionText}>Find Team</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Wallet')}
              >
                <Ionicons name="wallet" size={getFontSize(24)} color={Colors.success} />
                <Text style={styles.quickActionText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person" size={getFontSize(24)} color={Colors.warning} />
                <Text style={styles.quickActionText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}