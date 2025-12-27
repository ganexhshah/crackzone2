import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, walletAPI, notificationsAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import SearchModal from '../../components/SearchModal';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState(null);
  const { getSpacing, getFontSize, getContainerPadding } = useResponsive();

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchNotificationCount();
    
    // Set up periodic refresh for live data
    const interval = setInterval(() => {
      if (!refreshing && !loading) {
        fetchDashboardData();
        fetchNotificationCount();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationsAPI.getStats();
      setNotificationCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Fallback to mock data
      setNotificationCount(3);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError(null); // Clear any previous errors
      
      // Fetch real data from backend APIs
      const [statsResponse, upcomingTournamentsResponse, walletResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getUpcomingTournaments(),
        walletAPI.getWallet()
      ]);
      
      // Set stats from backend
      const backendStats = statsResponse.data.stats;
      setStats({
        tournaments_joined: backendStats.total_tournaments || 0,
        wins: backendStats.tournaments_won || 0,
        total_earnings: backendStats.wallet_balance || 0,
        current_rank: 42, // This could be calculated from leaderboard
        win_rate: backendStats.win_rate || 0,
        avg_kills: 8.5 // This would need to be added to backend
      });

      // Set tournaments from backend
      setUpcomingTournaments(upcomingTournamentsResponse.data.tournaments || []);

      // Set wallet balance from backend
      const walletData = walletResponse.data.wallet;
      setWalletBalance(walletData.balance || 0);

      // Fetch recent activities
      try {
        const activitiesResponse = await dashboardAPI.getRecentTournaments();
        const recentTournaments = activitiesResponse.data.tournaments || [];
        
        // Convert tournament results to activity format
        const tournamentActivities = recentTournaments.map((tournament, index) => ({
          id: `tournament_${tournament.id}`,
          type: 'tournament_result',
          title: `${tournament.status} in ${tournament.title}`,
          reward: tournament.placement === 1 ? Math.floor(tournament.prize_pool * 0.5) : null,
          time: formatTimeAgo(tournament.start_date),
          icon: tournament.placement === 1 ? 'trophy' : tournament.placement <= 3 ? 'medal' : 'game-controller'
        }));

        // Add some mock activities for better UX
        const mockActivities = [
          { id: 'team_1', type: 'team_join', title: 'Joined Team Phoenix', time: '5h ago', icon: 'people' },
          { id: 'achievement_1', type: 'achievement', title: 'Unlocked Sharpshooter', time: '1d ago', icon: 'medal' }
        ];

        setRecentActivity([...tournamentActivities.slice(0, 3), ...mockActivities]);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Fallback to mock activities
        setRecentActivity([
          { id: 1, type: 'tournament_win', title: 'Won BGMI Solo Cup', reward: 2500, time: '2h ago', icon: 'trophy' },
          { id: 2, type: 'team_join', title: 'Joined Team Phoenix', time: '5h ago', icon: 'people' },
          { id: 3, type: 'achievement', title: 'Unlocked Sharpshooter', time: '1d ago', icon: 'medal' }
        ]);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection and try again.');
      
      // Fallback to mock data if API fails
      setStats({
        tournaments_joined: 24,
        wins: 18,
        total_earnings: 15750,
        current_rank: 42,
        win_rate: 75,
        avg_kills: 8.5
      });

      setUpcomingTournaments([
        {
          id: 1,
          title: 'BGMI Championship',
          game: 'BGMI',
          prize_pool: 50000,
          registered_count: 128,
          max_participants: 200,
          registration_open: true,
          tournament_type: 'SQUAD',
          start_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        },
        {
          id: 2,
          title: 'Free Fire Masters',
          game: 'Free Fire',
          prize_pool: 25000,
          registered_count: 64,
          max_participants: 100,
          registration_open: true,
          tournament_type: 'DUO',
          start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
        }
      ]);

      setRecentActivity([
        { id: 1, type: 'tournament_win', title: 'Won BGMI Solo Cup', reward: 2500, time: '2h ago', icon: 'trophy' },
        { id: 2, type: 'team_join', title: 'Joined Team Phoenix', time: '5h ago', icon: 'people' },
        { id: 3, type: 'achievement', title: 'Unlocked Sharpshooter', time: '1d ago', icon: 'medal' }
      ]);

      setWalletBalance(12750);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleTournamentPress = (tournamentId) => {
    try {
      navigation.navigate('Tournaments', {
        screen: 'TournamentDetail',
        params: { tournamentId }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      navigation.navigate('TournamentDetail', { tournamentId });
    }
  };

  const StatCard = ({ title, value, icon, color = Colors.crackzoneYellow }) => (
    <View style={[
      styles.statCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={[
        styles.statIcon,
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
        styles.statValue,
        { fontSize: getFontSize(20) }
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.statTitle,
        { fontSize: getFontSize(12) }
      ]}>
        {title}
      </Text>
    </View>
  );

  const QuickActionCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.actionCard,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]} 
      onPress={onPress}
    >
      <View style={[
        styles.actionIcon,
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
        styles.actionTitle,
        { fontSize: getFontSize(12) }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TournamentCard = ({ tournament }) => (
    <TouchableOpacity
      style={[
        styles.tournamentCard,
        {
          padding: getSpacing(Layout.spacing.md),
          marginRight: getSpacing(Layout.spacing.md),
        }
      ]}
      onPress={() => handleTournamentPress(tournament.id)}
    >
      <View style={styles.tournamentHeader}>
        <View style={[
          styles.tournamentIcon,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginBottom: getSpacing(Layout.spacing.sm),
          }
        ]}>
          <Ionicons name="trophy" size={getFontSize(20)} color={Colors.crackzoneYellow} />
        </View>
        <View style={[
          styles.tournamentStatus,
          { backgroundColor: tournament.registration_open ? Colors.success : Colors.error }
        ]}>
          <Text style={[
            styles.statusText,
            { fontSize: getFontSize(8) }
          ]}>
            {tournament.registration_open ? 'OPEN' : 'CLOSED'}
          </Text>
        </View>
      </View>
      
      <Text style={[
        styles.tournamentTitle,
        { fontSize: getFontSize(16) }
      ]} numberOfLines={1}>
        {tournament.title}
      </Text>
      <Text style={[
        styles.tournamentGame,
        { fontSize: getFontSize(12) }
      ]}>
        {tournament.game} • {tournament.tournament_type}
      </Text>
      
      <View style={[
        styles.tournamentMeta,
        { marginTop: getSpacing(Layout.spacing.sm) }
      ]}>
        <View style={styles.prizeInfo}>
          <Ionicons name="trophy-outline" size={getFontSize(14)} color={Colors.crackzoneYellow} />
          <Text style={[
            styles.prizeText,
            { fontSize: getFontSize(14) }
          ]}>
            ₹{(tournament.prize_pool || 0).toLocaleString()}
          </Text>
        </View>
        <Text style={[
          styles.participantsText,
          { fontSize: getFontSize(11) }
        ]}>
          {tournament.registered_count || 0}/{tournament.max_participants} players
        </Text>
      </View>
      
      <View style={[
        styles.tournamentFooter,
        { marginTop: getSpacing(Layout.spacing.sm) }
      ]}>
        <Text style={[
          styles.startsText,
          { fontSize: getFontSize(10) }
        ]}>
          {formatTournamentStartTime(tournament.start_date)}
        </Text>
        <Ionicons name="chevron-forward" size={getFontSize(16)} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  // Helper function to format tournament start time
  const formatTournamentStartTime = (startDate) => {
    if (!startDate) return 'TBD';
    
    const date = new Date(startDate);
    const now = new Date();
    const diffTime = date - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 0) return 'Started';
    if (diffHours < 1) return 'Starting soon';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const ActivityCard = ({ activity }) => (
    <View style={[
      styles.activityCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={styles.activityLeft}>
        <View style={[
          styles.activityIcon,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons 
            name={activity.icon} 
            size={getFontSize(16)} 
            color={Colors.crackzoneYellow} 
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={[
            styles.activityTitle,
            { fontSize: getFontSize(13) }
          ]}>
            {activity.title}
          </Text>
          <Text style={[
            styles.activityTime,
            { fontSize: getFontSize(10) }
          ]}>
            {activity.time}
          </Text>
        </View>
      </View>
      {activity.reward && (
        <View style={styles.activityReward}>
          <Text style={[
            styles.rewardAmount,
            { fontSize: getFontSize(12) }
          ]}>
            +₹{activity.reward}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Custom Dashboard Header */}
        <View style={[
          styles.customHeader,
          {
            paddingHorizontal: getContainerPadding(),
            paddingVertical: getSpacing(Layout.spacing.md),
          }
        ]}>
          <View style={styles.headerContent}>
            {/* Left side - Title */}
            <View style={styles.headerLeft}>
              <Text style={[
                styles.headerTitle,
                { fontSize: getFontSize(24) }
              ]}>
                Dashboard
              </Text>
            </View>
            
            {/* Right side - Icons */}
            <View style={styles.headerRight}>
              {/* Search Icon */}
              <TouchableOpacity 
                style={[
                  styles.headerButton,
                  {
                    width: getSpacing(40),
                    height: getSpacing(40),
                    borderRadius: getSpacing(20),
                    marginRight: getSpacing(Layout.spacing.sm),
                  }
                ]}
                onPress={() => setSearchModalVisible(true)}
              >
                <Ionicons name="search" size={getFontSize(20)} color={Colors.text} />
              </TouchableOpacity>

              {/* Notification Icon with Badge */}
              <TouchableOpacity 
                style={[
                  styles.headerButton,
                  {
                    width: getSpacing(40),
                    height: getSpacing(40),
                    borderRadius: getSpacing(20),
                    marginRight: getSpacing(Layout.spacing.sm),
                  }
                ]}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications" size={getFontSize(20)} color={Colors.text} />
                {notificationCount > 0 && (
                  <View style={[
                    styles.notificationBadge,
                    {
                      top: getSpacing(6),
                      right: getSpacing(6),
                      minWidth: getSpacing(16),
                      height: getSpacing(16),
                      borderRadius: getSpacing(8),
                    }
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      { fontSize: getFontSize(10) }
                    ]}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile Icon */}
              <TouchableOpacity 
                style={[
                  styles.profileButton,
                  {
                    width: getSpacing(40),
                    height: getSpacing(40),
                    borderRadius: getSpacing(20),
                  }
                ]}
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={[Colors.crackzoneYellow, Colors.accentDark]}
                  style={[
                    styles.profileGradient,
                    {
                      width: getSpacing(40),
                      height: getSpacing(40),
                      borderRadius: getSpacing(20),
                    }
                  ]}
                >
                  <Ionicons name="person" size={getFontSize(18)} color={Colors.crackzoneBlack} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
            Welcome back, {user?.username || 'Gamer'}! Ready to dominate?
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
        >
          {/* Wallet Balance Card */}
          <View style={[
            styles.walletSection,
            {
              marginHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.walletCard,
                { padding: getSpacing(Layout.spacing.lg) }
              ]}
              onPress={() => navigation.navigate('Wallet')}
            >
              <View style={styles.walletContent}>
                <View style={styles.walletLeft}>
                  <View style={[
                    styles.walletIcon,
                    {
                      width: getSpacing(48),
                      height: getSpacing(48),
                      borderRadius: getSpacing(24),
                      marginRight: getSpacing(Layout.spacing.md),
                    }
                  ]}>
                    <Ionicons name="wallet" size={getFontSize(24)} color={Colors.crackzoneYellow} />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={[
                      styles.walletLabel,
                      { fontSize: getFontSize(12) }
                    ]}>
                      Wallet Balance
                    </Text>
                    <Text style={[
                      styles.walletAmount,
                      { fontSize: getFontSize(24) }
                    ]}>
                      ₹{walletBalance.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={[
                  styles.addMoneyButton,
                  {
                    width: getSpacing(40),
                    height: getSpacing(40),
                    borderRadius: getSpacing(20),
                  }
                ]}>
                  <Ionicons name="add" size={getFontSize(16)} color={Colors.crackzoneBlack} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
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
              Your Performance
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Win Rate"
                value={`${stats?.win_rate}%`}
                icon="trophy"
                color={Colors.success}
              />
              <StatCard
                title="Avg Kills"
                value={stats?.avg_kills}
                icon="target"
                color={Colors.error}
              />
              <StatCard
                title="Tournaments"
                value={stats?.tournaments_joined}
                icon="calendar"
                color={Colors.info}
              />
              <StatCard
                title="Earnings"
                value={`₹${stats?.total_earnings?.toLocaleString()}`}
                icon="trending-up"
                color={Colors.crackzoneYellow}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={[
            styles.actionsSection,
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
              Quick Actions
            </Text>
            <View style={styles.actionsGrid}>
              <QuickActionCard
                title="Join Tournament"
                icon="trophy"
                color={Colors.crackzoneYellow}
                onPress={() => navigation.navigate('Tournaments')}
              />
              <QuickActionCard
                title="Find Team"
                icon="people"
                color={Colors.info}
                onPress={() => navigation.navigate('Teams')}
              />
              <QuickActionCard
                title="My Matches"
                icon="game-controller"
                color={Colors.success}
                onPress={() => navigation.navigate('MyMatches')}
              />
              <QuickActionCard
                title="Leaderboard"
                icon="podium"
                color={Colors.warning}
                onPress={() => navigation.navigate('Leaderboard')}
              />
            </View>
          </View>

          {/* Featured Tournaments */}
          <View style={[
            styles.tournamentsSection,
            { marginBottom: getSpacing(Layout.spacing.lg) }
          ]}>
            <View style={[
              styles.sectionHeader,
              {
                paddingHorizontal: getContainerPadding(),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { fontSize: getFontSize(20) }
              ]}>
                Featured Tournaments
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tournaments')}>
                <Text style={[
                  styles.seeAllText,
                  { fontSize: getFontSize(14) }
                ]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={upcomingTournaments}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.tournamentsList,
                { paddingLeft: getContainerPadding() }
              ]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <TournamentCard tournament={item} />}
            />
          </View>

          {/* Recent Activity */}
          <View style={[
            styles.activitySection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { 
                fontSize: getFontSize(20),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              Recent Activity
            </Text>
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Search Modal */}
        <SearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          navigation={navigation}
        />
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
  
  // Custom Header Styles
  customHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '40',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface + '60',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  profileButton: {
    overflow: 'hidden',
  },
  profileGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Wallet Section
  walletSection: {
    // Dynamic padding applied via responsive hook
  },
  walletCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow + '30',
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIcon: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  walletAmount: {
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  addMoneyButton: {
    backgroundColor: Colors.crackzoneYellow,
    justifyContent: 'center',
    alignItems: 'center',
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
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statTitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Actions Section
  actionsSection: {
    // Dynamic padding applied via responsive hook
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Tournaments Section
  tournamentsSection: {
    // Dynamic margin applied via responsive hook
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  tournamentsList: {
    paddingRight: Layout.spacing.sm,
  },
  tournamentCard: {
    width: 280,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tournamentIcon: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tournamentStatus: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  tournamentTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  tournamentGame: {
    color: Colors.textSecondary,
  },
  tournamentMeta: {
    // Dynamic margin applied via responsive hook
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  prizeText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.xs,
  },
  participantsText: {
    color: Colors.textSecondary,
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startsText: {
    color: Colors.textMuted,
  },

  // Activity Section
  activitySection: {
    // Dynamic padding applied via responsive hook
  },
  activityList: {
    // Container for activity cards
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  activityTime: {
    color: Colors.textSecondary,
  },
  activityReward: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  rewardAmount: {
    color: Colors.success,
    fontWeight: 'bold',
  },
})