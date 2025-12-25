import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';

export default function StatisticsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await profileAPI.getProfile();
      setStats(response.data.stats);
      setRecentMatches(response.data.recentMatches || []);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Show loading screen on initial load
  if (loading && !refreshing) {
    return <LoadingScreen message="Loading statistics..." />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  const StatCard = ({ icon, title, value, subtitle, color = Colors.crackzoneYellow }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const MatchCard = ({ match }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchTournament}>{match.tournamentName}</Text>
        <Text style={[
          styles.matchResult,
          { color: match.result === 'Won' ? Colors.success : 
                   match.result === 'Runner-up' ? Colors.warning :
                   match.result === 'Third Place' ? Colors.info : Colors.textSecondary }
        ]}>
          {match.result}
        </Text>
      </View>
      <View style={styles.matchDetails}>
        <View style={styles.matchDetail}>
          <Ionicons name="game-controller-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.matchDetailText}>{match.game}</Text>
        </View>
        <View style={styles.matchDetail}>
          <Ionicons name="trophy-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.matchDetailText}>Position: {match.position}</Text>
        </View>
        <View style={styles.matchDetail}>
          <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.matchDetailText}>Prize: {match.prize}</Text>
        </View>
      </View>
      <Text style={styles.matchDate}>
        {new Date(match.date).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={Colors.crackzoneYellow} 
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading statistics...</Text>
            </View>
          ) : stats ? (
            <>
              {/* Overview Stats */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="trophy"
                    title="Tournaments Won"
                    value={stats.tournamentsWon || 0}
                    color={Colors.success}
                  />
                  <StatCard
                    icon="game-controller"
                    title="Tournaments Played"
                    value={stats.tournamentsPlayed || 0}
                    color={Colors.info}
                  />
                  <StatCard
                    icon="trending-up"
                    title="Win Rate"
                    value={`${stats.winRate || 0}%`}
                    color={Colors.warning}
                  />
                  <StatCard
                    icon="cash"
                    title="Total Earnings"
                    value={`₹${stats.totalEarnings || 0}`}
                    color={Colors.crackzoneYellow}
                  />
                </View>
              </View>

              {/* Performance Stats */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.performanceCards}>
                  <View style={styles.performanceCard}>
                    <Text style={styles.performanceLabel}>Current Streak</Text>
                    <Text style={styles.performanceValue}>{stats.currentStreak || 0}</Text>
                    <Text style={styles.performanceUnit}>wins</Text>
                  </View>
                  <View style={styles.performanceCard}>
                    <Text style={styles.performanceLabel}>Best Rank</Text>
                    <Text style={styles.performanceValue}>{stats.bestRank || 'Bronze'}</Text>
                    <Text style={styles.performanceUnit}>achieved</Text>
                  </View>
                </View>
              </View>

              {/* Recent Matches */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Matches</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {recentMatches.length > 0 ? (
                  <View style={styles.matchesList}>
                    {recentMatches.slice(0, 5).map((match, index) => (
                      <MatchCard key={index} match={match} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyMatches}>
                    <Ionicons name="game-controller-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.emptyMatchesText}>No matches played yet</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="stats-chart-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Statistics Available</Text>
              <Text style={styles.emptyStateText}>
                Start playing tournaments to see your statistics!
              </Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Layout.spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  performanceCards: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  performanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.xs,
  },
  performanceUnit: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  matchesList: {
    gap: Layout.spacing.sm,
  },
  matchCard: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  matchTournament: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  matchResult: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  matchDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  matchDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
  },
  matchDate: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  emptyMatches: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyMatchesText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: Layout.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});