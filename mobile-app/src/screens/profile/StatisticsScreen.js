import React, { useState } from 'react';
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
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function StatisticsScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    overview: {
      totalTournaments: 25,
      tournamentsWon: 8,
      winRate: 32,
      totalEarnings: 15000,
      currentStreak: 3,
      bestStreak: 5,
    },
    tournaments: {
      solo: { played: 10, won: 4, winRate: 40 },
      duo: { played: 8, won: 2, winRate: 25 },
      squad: { played: 7, won: 2, winRate: 29 },
    },
    games: {
      FreeFire: { tournaments: 15, wins: 6, earnings: 9000 },
      PUBG: { tournaments: 7, wins: 2, earnings: 4000 },
      'Call of Duty': { tournaments: 3, wins: 0, earnings: 2000 },
    },
    monthly: [
      { month: 'Jan', tournaments: 5, wins: 2, earnings: 3000 },
      { month: 'Feb', tournaments: 8, wins: 3, earnings: 5000 },
      { month: 'Mar', tournaments: 12, wins: 3, earnings: 7000 },
    ]
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const StatCard = ({ icon, title, value, subtitle, color = Colors.crackzoneYellow }) => (
    <View style={[
      styles.statCard,
      {
        padding: getSpacing(Layout.spacing.md),
        width: '48%',
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      <View style={[
        styles.statIcon,
        {
          width: getSpacing(40),
          height: getSpacing(40),
          borderRadius: getSpacing(20),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}>
        <Ionicons name={icon} size={getFontSize(20)} color={color} />
      </View>
      <Text style={[
        styles.statValue,
        { 
          fontSize: getFontSize(20),
          marginBottom: getSpacing(Layout.spacing.xs),
        }
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.statTitle,
        { 
          fontSize: getFontSize(12),
          marginBottom: getSpacing(Layout.spacing.xs),
        }
      ]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[
          styles.statSubtitle,
          { fontSize: getFontSize(10) }
        ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const TournamentTypeCard = ({ type, data }) => (
    <View style={[
      styles.typeCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      <Text style={[
        styles.typeTitle,
        { 
          fontSize: getFontSize(16),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}>
        {type.toUpperCase()}
      </Text>
      <View style={styles.typeStats}>
        <View style={styles.typeStat}>
          <Text style={[
            styles.typeStatValue,
            { fontSize: getFontSize(18) }
          ]}>
            {data.played}
          </Text>
          <Text style={[
            styles.typeStatLabel,
            { fontSize: getFontSize(12) }
          ]}>
            Played
          </Text>
        </View>
        <View style={styles.typeStat}>
          <Text style={[
            styles.typeStatValue,
            { fontSize: getFontSize(18) }
          ]}>
            {data.won}
          </Text>
          <Text style={[
            styles.typeStatLabel,
            { fontSize: getFontSize(12) }
          ]}>
            Won
          </Text>
        </View>
        <View style={styles.typeStat}>
          <Text style={[
            styles.typeStatValue,
            { fontSize: getFontSize(18) }
          ]}>
            {data.winRate}%
          </Text>
          <Text style={[
            styles.typeStatLabel,
            { fontSize: getFontSize(12) }
          ]}>
            Win Rate
          </Text>
        </View>
      </View>
    </View>
  );

  const GameCard = ({ game, data }) => (
    <View style={[
      styles.gameCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      <View style={styles.gameHeader}>
        <Text style={[
          styles.gameTitle,
          { fontSize: getFontSize(16) }
        ]}>
          {game}
        </Text>
        <Text style={[
          styles.gameEarnings,
          { fontSize: getFontSize(14) }
        ]}>
          ₹{data.earnings.toLocaleString()}
        </Text>
      </View>
      <View style={styles.gameStats}>
        <Text style={[
          styles.gameStat,
          { fontSize: getFontSize(14) }
        ]}>
          {data.tournaments} tournaments • {data.wins} wins
        </Text>
      </View>
    </View>
  );

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'tournaments', name: 'Tournaments' },
    { id: 'games', name: 'Games' },
    { id: 'monthly', name: 'Monthly' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Statistics"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getSpacing(Layout.spacing.lg),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Text style={[
            styles.headerSubtitle,
            { fontSize: getFontSize(16) }
          ]}>
            Track your gaming performance
          </Text>
        </View>

        {/* Tabs */}
        <View style={[
          styles.tabsContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    {
                      paddingVertical: getSpacing(Layout.spacing.sm),
                      paddingHorizontal: getSpacing(Layout.spacing.md),
                      marginRight: getSpacing(Layout.spacing.sm),
                    },
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[
                    styles.tabText,
                    { fontSize: getFontSize(14) },
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {activeTab === 'overview' && (
              <View style={styles.overviewContent}>
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="trophy"
                    title="Tournaments"
                    value={stats.overview.totalTournaments}
                    subtitle="Total played"
                    color={Colors.crackzoneYellow}
                  />
                  <StatCard
                    icon="checkmark-circle"
                    title="Wins"
                    value={stats.overview.tournamentsWon}
                    subtitle={`${stats.overview.winRate}% win rate`}
                    color={Colors.success}
                  />
                  <StatCard
                    icon="wallet"
                    title="Earnings"
                    value={`₹${stats.overview.totalEarnings.toLocaleString()}`}
                    subtitle="Total earned"
                    color={Colors.warning}
                  />
                  <StatCard
                    icon="flame"
                    title="Streak"
                    value={stats.overview.currentStreak}
                    subtitle={`Best: ${stats.overview.bestStreak}`}
                    color={Colors.error}
                  />
                </View>
              </View>
            )}

            {activeTab === 'tournaments' && (
              <View style={styles.tournamentsContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Tournament Types
                </Text>
                {Object.entries(stats.tournaments).map(([type, data]) => (
                  <TournamentTypeCard key={type} type={type} data={data} />
                ))}
              </View>
            )}

            {activeTab === 'games' && (
              <View style={styles.gamesContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Game Performance
                </Text>
                {Object.entries(stats.games).map(([game, data]) => (
                  <GameCard key={game} game={game} data={data} />
                ))}
              </View>
            )}

            {activeTab === 'monthly' && (
              <View style={styles.monthlyContent}>
                <Text style={[
                  styles.sectionTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Monthly Progress
                </Text>
                {stats.monthly.map((month, index) => (
                  <View key={index} style={[
                    styles.monthCard,
                    {
                      padding: getSpacing(Layout.spacing.md),
                      marginBottom: getSpacing(Layout.spacing.md),
                    }
                  ]}>
                    <Text style={[
                      styles.monthTitle,
                      { 
                        fontSize: getFontSize(16),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      }
                    ]}>
                      {month.month} 2024
                    </Text>
                    <View style={styles.monthStats}>
                      <View style={styles.monthStat}>
                        <Text style={[
                          styles.monthStatValue,
                          { fontSize: getFontSize(18) }
                        ]}>
                          {month.tournaments}
                        </Text>
                        <Text style={[
                          styles.monthStatLabel,
                          { fontSize: getFontSize(12) }
                        ]}>
                          Tournaments
                        </Text>
                      </View>
                      <View style={styles.monthStat}>
                        <Text style={[
                          styles.monthStatValue,
                          { fontSize: getFontSize(18) }
                        ]}>
                          {month.wins}
                        </Text>
                        <Text style={[
                          styles.monthStatLabel,
                          { fontSize: getFontSize(12) }
                        ]}>
                          Wins
                        </Text>
                      </View>
                      <View style={styles.monthStat}>
                        <Text style={[
                          styles.monthStatValue,
                          { fontSize: getFontSize(18) }
                        ]}>
                          ₹{month.earnings.toLocaleString()}
                        </Text>
                        <Text style={[
                          styles.monthStatLabel,
                          { fontSize: getFontSize(12) }
                        ]}>
                          Earnings
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
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
  tabsContainer: {
    // Dynamic margin applied via responsive hook
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  statTitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statSubtitle: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  typeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  typeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeStat: {
    alignItems: 'center',
  },
  typeStatValue: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  typeStatLabel: {
    color: Colors.textSecondary,
  },
  gameCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  gameTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  gameEarnings: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  gameStats: {
    // Game stats container
  },
  gameStat: {
    color: Colors.textSecondary,
  },
  monthCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monthStat: {
    alignItems: 'center',
  },
  monthStatValue: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  monthStatLabel: {
    color: Colors.textSecondary,
  },
});