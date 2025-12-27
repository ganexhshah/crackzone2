import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import { useAuth } from '../../contexts/AuthContext';
import { leaderboardAPI } from '../../services/api';

export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('overall');
  const [selectedGame, setSelectedGame] = useState('all');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTournaments: 0,
    totalPrizePool: 0,
    totalWinners: 0
  });
  
  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding 
  } = useResponsive();

  // Sample leaderboard data
  const sampleLeaderboard = [
    {
      id: 1,
      rank: 1,
      username: 'ProGamer123',
      profilePictureUrl: null,
      gameRank: 'Diamond',
      favoriteGame: 'BGMI',
      tournamentsPlayed: 25,
      tournamentsWon: 15,
      podiumFinishes: 18,
      totalEarnings: 25000,
      winRate: 85.5,
      overallScore: 2850
    },
    {
      id: 2,
      rank: 2,
      username: 'FireMaster',
      profilePictureUrl: null,
      gameRank: 'Platinum',
      favoriteGame: 'FreeFire',
      tournamentsPlayed: 22,
      tournamentsWon: 12,
      podiumFinishes: 16,
      totalEarnings: 18500,
      winRate: 78.2,
      overallScore: 2420
    },
    {
      id: 3,
      rank: 3,
      username: 'SquadLeader',
      profilePictureUrl: null,
      gameRank: 'Gold',
      favoriteGame: 'BGMI',
      tournamentsPlayed: 20,
      tournamentsWon: 10,
      podiumFinishes: 14,
      totalEarnings: 15000,
      winRate: 72.1,
      overallScore: 2100
    },
    {
      id: 4,
      rank: 4,
      username: 'SniperKing',
      profilePictureUrl: null,
      gameRank: 'Diamond',
      favoriteGame: 'PUBG',
      tournamentsPlayed: 18,
      tournamentsWon: 9,
      podiumFinishes: 12,
      totalEarnings: 14200,
      winRate: 69.8,
      overallScore: 1980
    },
    {
      id: 5,
      rank: 5,
      username: 'RushMaster',
      profilePictureUrl: null,
      gameRank: 'Platinum',
      favoriteGame: 'FreeFire',
      tournamentsPlayed: 16,
      tournamentsWon: 8,
      podiumFinishes: 11,
      totalEarnings: 12800,
      winRate: 66.7,
      overallScore: 1750
    },
    {
      id: 6,
      rank: 6,
      username: 'TacticalPro',
      profilePictureUrl: null,
      gameRank: 'Gold',
      favoriteGame: 'BGMI',
      tournamentsPlayed: 15,
      tournamentsWon: 7,
      podiumFinishes: 10,
      totalEarnings: 11500,
      winRate: 63.4,
      overallScore: 1620
    },
    {
      id: 7,
      rank: 7,
      username: 'HeadshotHero',
      profilePictureUrl: null,
      gameRank: 'Silver',
      favoriteGame: 'PUBG',
      tournamentsPlayed: 14,
      tournamentsWon: 6,
      podiumFinishes: 9,
      totalEarnings: 9800,
      winRate: 58.9,
      overallScore: 1450
    },
    {
      id: 8,
      rank: 8,
      username: 'ClutchKing',
      profilePictureUrl: null,
      gameRank: 'Gold',
      favoriteGame: 'FreeFire',
      tournamentsPlayed: 12,
      tournamentsWon: 5,
      podiumFinishes: 8,
      totalEarnings: 8200,
      winRate: 55.6,
      overallScore: 1280
    }
  ];

  const filters = [
    { id: 'overall', label: 'Overall', icon: 'trophy' },
    { id: 'weekly', label: 'Weekly', icon: 'calendar' },
    { id: 'monthly', label: 'Monthly', icon: 'stats-chart' },
  ];

  const games = [
    { id: 'all', label: 'All Games', icon: 'game-controller' },
    { id: 'BGMI', label: 'BGMI', icon: 'rifle' },
    { id: 'FreeFire', label: 'Free Fire', icon: 'flame' },
    { id: 'PUBG', label: 'PUBG', icon: 'location' },
  ];

  useEffect(() => {
    loadLeaderboard();
    loadStats();
  }, [activeFilter, selectedGame]);

  const loadStats = async () => {
    try {
      const params = {
        game: selectedGame === 'all' ? null : selectedGame,
        timeframe: activeFilter === 'overall' ? 'all' : activeFilter === 'weekly' ? 'week' : 'month'
      };
      
      const response = await leaderboardAPI.getLeaderboardStats(params);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Failed to load leaderboard stats:', error);
      // Fallback stats
      setStats({
        totalPlayers: 1250,
        totalTournaments: 45,
        totalPrizePool: 125000,
        totalWinners: 180
      });
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      const timeframeMap = {
        'overall': 'all',
        'weekly': 'week',
        'monthly': 'month'
      };

      const params = {
        type: 'overall',
        game: selectedGame === 'all' ? null : selectedGame,
        timeframe: timeframeMap[activeFilter],
        limit: 50,
        page: 1
      };

      const response = await leaderboardAPI.getGlobalLeaderboard(params);
      
      if (response.data.success && response.data.data.leaderboard.length > 0) {
        setLeaderboard(response.data.data.leaderboard);
      } else {
        // Fallback to sample data if API returns empty
        setLeaderboard(sampleLeaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Use sample data as fallback
      setLeaderboard(sampleLeaderboard);
      Alert.alert(
        'Connection Error',
        'Unable to load leaderboard. Showing sample data.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
    loadStats();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Diamond': return 'diamond';
      case 'Platinum': return 'medal';
      case 'Gold': return 'trophy';
      case 'Silver': return 'ribbon';
      case 'Bronze': return 'star';
      default: return 'shield';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Diamond': return '#00D4FF';
      case 'Platinum': return '#E5E4E2';
      case 'Gold': return Colors.crackzoneYellow;
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return Colors.textMuted;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return Colors.crackzoneYellow;
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return Colors.textSecondary;
    }
  };

  const StatsCard = ({ title, value, icon, color = Colors.crackzoneYellow }) => (
    <View style={[
      styles.statsCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
        borderRadius: Layout.borderRadius.lg,
      }
    ]}>
      <View style={[
        styles.statsIcon,
        {
          width: getSpacing(40),
          height: getSpacing(40),
          borderRadius: getSpacing(20),
          backgroundColor: color + '20',
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}>
        <Ionicons name={icon} size={getFontSize(20)} color={color} />
      </View>
      <Text style={[
        styles.statsValue,
        { fontSize: getFontSize(18) }
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.statsTitle,
        { fontSize: getFontSize(11) }
      ]}>
        {title}
      </Text>
    </View>
  );

  const LeaderboardItem = ({ player }) => (
    <TouchableOpacity 
      style={[
        styles.leaderboardItem,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
          borderRadius: Layout.borderRadius.lg,
        },
        player.id === user?.id && styles.currentUserItem
      ]}
      onPress={() => {
        // Navigate to player profile if needed
        console.log('View player profile:', player.username);
      }}
    >
      <View style={styles.playerLeft}>
        {/* Rank */}
        <View style={[
          styles.rankContainer,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginRight: getSpacing(Layout.spacing.md),
          },
          player.rank <= 3 && { backgroundColor: getPositionColor(player.rank) + '20' }
        ]}>
          {player.rank <= 3 ? (
            <Ionicons 
              name={player.rank === 1 ? 'trophy' : 'medal'} 
              size={getFontSize(20)} 
              color={getPositionColor(player.rank)} 
            />
          ) : (
            <Text style={[
              styles.rankText,
              { fontSize: getFontSize(16) }
            ]}>
              {player.rank}
            </Text>
          )}
        </View>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <View style={styles.playerHeader}>
            <Text style={[
              styles.playerName,
              { fontSize: getFontSize(16) }
            ]}>
              {player.username}
            </Text>
            <View style={[
              styles.gameRankBadge,
              { backgroundColor: getRankColor(player.gameRank) + '20' }
            ]}>
              <Ionicons 
                name={getRankIcon(player.gameRank)} 
                size={getFontSize(12)} 
                color={getRankColor(player.gameRank)} 
              />
              <Text style={[
                styles.gameRankText,
                { 
                  fontSize: getFontSize(10),
                  color: getRankColor(player.gameRank)
                }
              ]}>
                {player.gameRank}
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.favoriteGame,
            { fontSize: getFontSize(12) }
          ]}>
            {player.favoriteGame} • {player.tournamentsWon} wins
          </Text>
        </View>
      </View>

      <View style={styles.playerRight}>
        <Text style={[
          styles.earnings,
          { fontSize: getFontSize(14) }
        ]}>
          ₹{player.totalEarnings.toLocaleString()}
        </Text>
        <Text style={[
          styles.winRate,
          { fontSize: getFontSize(11) }
        ]}>
          {player.winRate}% WR
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
          <ResponsiveHeader
            title="Leaderboard"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
            showBorder={false}
          />
          <View style={styles.loadingContainer}>
            <Ionicons name="trophy" size={64} color={Colors.textMuted} />
            <Text style={[styles.loadingText, { fontSize: getFontSize(16) }]}>
              Loading leaderboard...
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <ResponsiveHeader
          title="Leaderboard"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon="filter"
          onRightPress={() => {
            Alert.alert('Filter', 'Filter options coming soon!');
          }}
          showBorder={false}
        />

        {/* Subtitle */}
        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getContainerPadding(),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Text style={[
            styles.headerSubtitle,
            { fontSize: getFontSize(16) }
          ]}>
            Compete with the best players
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={Colors.crackzoneYellow}
              progressBackgroundColor={Colors.surface}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={[
            styles.statsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { 
                fontSize: getFontSize(20),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              Tournament Stats
            </Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="Total Players"
                value={stats.totalPlayers?.toLocaleString() || '0'}
                icon="people"
                color={Colors.info}
              />
              <StatsCard
                title="Tournaments"
                value={stats.totalTournaments?.toLocaleString() || '0'}
                icon="trophy"
                color={Colors.crackzoneYellow}
              />
              <StatsCard
                title="Prize Pool"
                value={`₹${(stats.totalPrizePool || 0).toLocaleString()}`}
                icon="cash"
                color={Colors.success}
              />
              <StatsCard
                title="Winners"
                value={stats.totalWinners?.toLocaleString() || '0'}
                icon="medal"
                color={Colors.warning}
              />
            </View>
          </View>

          {/* Filter Tabs */}
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
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterTab,
                    {
                      paddingHorizontal: getSpacing(Layout.spacing.md),
                      paddingVertical: getSpacing(Layout.spacing.sm),
                      marginRight: getSpacing(Layout.spacing.sm),
                      borderRadius: Layout.borderRadius.lg,
                    },
                    activeFilter === filter.id && styles.activeFilterTab
                  ]}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Ionicons 
                    name={filter.icon} 
                    size={getFontSize(16)} 
                    color={activeFilter === filter.id ? Colors.crackzoneBlack : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.filterTabText,
                    { fontSize: getFontSize(14) },
                    activeFilter === filter.id && styles.activeFilterTabText
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Leaderboard */}
          <View style={[
            styles.leaderboardSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { 
                fontSize: getFontSize(20),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              Top Players
            </Text>
            
            {leaderboard.length > 0 ? (
              <View style={styles.leaderboardList}>
                {leaderboard.map((player) => (
                  <LeaderboardItem key={player.id} player={player} />
                ))}
              </View>
            ) : (
              <View style={[
                styles.emptyState,
                { paddingVertical: getSpacing(Layout.spacing.xl * 2) }
              ]}>
                <Ionicons name="trophy-outline" size={getFontSize(64)} color={Colors.textMuted} />
                <Text style={[
                  styles.emptyStateTitle,
                  { 
                    fontSize: getFontSize(20),
                    marginTop: getSpacing(Layout.spacing.lg),
                  }
                ]}>
                  No leaderboard data
                </Text>
                <Text style={[
                  styles.emptyStateText,
                  { fontSize: getFontSize(16) }
                ]}>
                  Check back later for updated rankings
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    marginTop: Layout.spacing.md,
  },
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Stats Section
  statsSection: {
    // Dynamic padding applied via responsive hook
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statsIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statsTitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Filter Section
  filtersContainer: {
    // Dynamic padding applied via responsive hook
  },
  filtersScrollView: {
    paddingRight: Layout.spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Layout.spacing.xs,
  },
  activeFilterTab: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  filterTabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: Colors.crackzoneBlack,
  },

  // Leaderboard Section
  leaderboardSection: {
    // Dynamic padding applied via responsive hook
  },
  leaderboardList: {
    // Container for leaderboard items
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentUserItem: {
    borderColor: Colors.crackzoneYellow,
    backgroundColor: Colors.crackzoneYellow + '10',
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  rankText: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  playerName: {
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  gameRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Layout.spacing.xs,
  },
  gameRankText: {
    fontWeight: '600',
  },
  favoriteGame: {
    color: Colors.textSecondary,
  },
  playerRight: {
    alignItems: 'flex-end',
  },
  earnings: {
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.xs,
  },
  winRate: {
    color: Colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});