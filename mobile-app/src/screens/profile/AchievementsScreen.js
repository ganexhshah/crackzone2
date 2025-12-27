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

export default function AchievementsScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const achievements = [
    {
      id: 1,
      title: 'First Victory',
      description: 'Win your first tournament',
      icon: 'trophy',
      earned: true,
      earnedDate: '2024-01-15',
      category: 'tournament',
    },
    {
      id: 2,
      title: 'Team Player',
      description: 'Join 5 different teams',
      icon: 'people',
      earned: true,
      earnedDate: '2024-01-20',
      category: 'social',
    },
    {
      id: 3,
      title: 'Streak Master',
      description: 'Win 5 tournaments in a row',
      icon: 'flame',
      earned: false,
      progress: 2,
      total: 5,
      category: 'tournament',
    },
    {
      id: 4,
      title: 'Big Spender',
      description: 'Add ₹10,000 to wallet',
      icon: 'wallet',
      earned: false,
      progress: 3500,
      total: 10000,
      category: 'wallet',
    },
    {
      id: 5,
      title: 'Social Butterfly',
      description: 'Make 10 friends',
      icon: 'heart',
      earned: false,
      progress: 6,
      total: 10,
      category: 'social',
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getIconColor = (category, earned) => {
    if (!earned) return Colors.textMuted;
    
    switch (category) {
      case 'tournament': return Colors.crackzoneYellow;
      case 'social': return Colors.info;
      case 'wallet': return Colors.success;
      default: return Colors.crackzoneYellow;
    }
  };

  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : activeTab === 'earned'
    ? achievements.filter(a => a.earned)
    : achievements.filter(a => !a.earned);

  const AchievementCard = ({ achievement }) => (
    <View style={[
      styles.achievementCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.md),
      },
      !achievement.earned && styles.lockedCard
    ]}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIcon,
          {
            width: getSpacing(50),
            height: getSpacing(50),
            borderRadius: getSpacing(25),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons 
            name={achievement.icon} 
            size={getFontSize(24)} 
            color={getIconColor(achievement.category, achievement.earned)} 
          />
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            { 
              fontSize: getFontSize(16),
              marginBottom: getSpacing(Layout.spacing.xs),
            },
            !achievement.earned && styles.lockedText
          ]}>
            {achievement.title}
          </Text>
          <Text style={[
            styles.achievementDescription,
            { fontSize: getFontSize(14) },
            !achievement.earned && styles.lockedText
          ]}>
            {achievement.description}
          </Text>
        </View>
        {achievement.earned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={getFontSize(20)} color={Colors.success} />
          </View>
        )}
      </View>

      {achievement.earned ? (
        <View style={styles.earnedInfo}>
          <Text style={[
            styles.earnedDate,
            { fontSize: getFontSize(12) }
          ]}>
            Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
          </Text>
        </View>
      ) : achievement.progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[
              styles.progressText,
              { fontSize: getFontSize(12) }
            ]}>
              Progress: {achievement.progress}/{achievement.total}
            </Text>
            <Text style={[
              styles.progressPercent,
              { fontSize: getFontSize(12) }
            ]}>
              {Math.round((achievement.progress / achievement.total) * 100)}%
            </Text>
          </View>
          <View style={[
            styles.progressBar,
            { 
              height: getSpacing(6),
              marginTop: getSpacing(Layout.spacing.xs),
            }
          ]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(achievement.progress / achievement.total) * 100}%`,
                  height: getSpacing(6),
                }
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.lockedInfo}>
          <Text style={[
            styles.lockedMessage,
            { fontSize: getFontSize(12) }
          ]}>
            Complete the requirements to unlock this achievement
          </Text>
        </View>
      )}
    </View>
  );

  const tabs = [
    { id: 'all', name: 'All', count: achievements.length },
    { id: 'earned', name: 'Earned', count: achievements.filter(a => a.earned).length },
    { id: 'locked', name: 'Locked', count: achievements.filter(a => !a.earned).length },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Achievements"
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
            Track your gaming milestones
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={[
          styles.statsContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            padding: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { fontSize: getFontSize(24) }
            ]}>
              {achievements.filter(a => a.earned).length}
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: getFontSize(14) }
            ]}>
              Earned
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { fontSize: getFontSize(24) }
            ]}>
              {achievements.length}
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: getFontSize(14) }
            ]}>
              Total
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { fontSize: getFontSize(24) }
            ]}>
              {Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}%
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: getFontSize(14) }
            ]}>
              Complete
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[
          styles.tabsContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
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
                {tab.name} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
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
            styles.achievementsList,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={getFontSize(48)} color={Colors.textMuted} />
                <Text style={[
                  styles.emptyStateText,
                  { 
                    fontSize: getFontSize(16),
                    marginTop: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  No achievements in this category
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
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    color: Colors.textSecondary,
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
  },
  tabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  achievementsList: {
    // Dynamic padding applied via responsive hook
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  achievementDescription: {
    color: Colors.textSecondary,
  },
  lockedText: {
    color: Colors.textMuted,
  },
  earnedBadge: {
    // Earned badge styling
  },
  earnedInfo: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  earnedDate: {
    color: Colors.success,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: Colors.textSecondary,
  },
  progressPercent: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  progressBar: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.full,
  },
  lockedInfo: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lockedMessage: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});