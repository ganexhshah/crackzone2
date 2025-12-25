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

const ACHIEVEMENT_CATEGORIES = {
  tournament: { name: 'Tournament', icon: 'trophy', color: Colors.crackzoneYellow },
  social: { name: 'Social', icon: 'people', color: Colors.info },
  skill: { name: 'Skill', icon: 'flash', color: Colors.success },
  milestone: { name: 'Milestone', icon: 'flag', color: Colors.warning },
  special: { name: 'Special', icon: 'star', color: Colors.primary }
};

export default function AchievementsScreen({ navigation }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await profileAPI.getAchievements();
      setAchievements(response.data.achievements || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Show loading screen on initial load
  if (loading && !refreshing) {
    return <LoadingScreen message="Loading achievements..." />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(ach => ach.category === selectedCategory);

  const earnedAchievements = achievements.filter(ach => ach.earned);
  const totalAchievements = achievements.length;
  const completionPercentage = totalAchievements > 0 
    ? Math.round((earnedAchievements.length / totalAchievements) * 100) 
    : 0;

  const getCategoryInfo = (category) => {
    return ACHIEVEMENT_CATEGORIES[category] || {
      name: category,
      icon: 'medal',
      color: Colors.textSecondary
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const AchievementCard = ({ achievement }) => {
    const categoryInfo = getCategoryInfo(achievement.category);
    const isEarned = achievement.earned;
    
    return (
      <View style={[
        styles.achievementCard,
        isEarned && styles.achievementCardEarned
      ]}>
        <View style={styles.achievementHeader}>
          <View style={[
            styles.achievementIcon,
            { backgroundColor: categoryInfo.color + (isEarned ? '30' : '10') }
          ]}>
            <Ionicons 
              name={isEarned ? achievement.icon || categoryInfo.icon : categoryInfo.icon + '-outline'} 
              size={24} 
              color={isEarned ? categoryInfo.color : Colors.textMuted} 
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementName,
              !isEarned && styles.achievementNameLocked
            ]}>
              {achievement.name}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !isEarned && styles.achievementDescriptionLocked
            ]}>
              {achievement.description}
            </Text>
            {isEarned && achievement.earnedAt && (
              <Text style={styles.achievementDate}>
                Earned on {formatDate(achievement.earnedAt)}
              </Text>
            )}
          </View>
        </View>
        
        {!isEarned && achievement.progress !== undefined && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { 
                  width: `${Math.min((achievement.progress / achievement.requirementValue) * 100, 100)}%`,
                  backgroundColor: categoryInfo.color
                }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.requirementValue}
            </Text>
          </View>
        )}

        {isEarned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.earnedText}>Earned</Text>
          </View>
        )}
      </View>
    );
  };

  const CategoryTab = ({ category, label, count }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.categoryTabTextActive
      ]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{earnedAchievements.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalAchievements}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.overallProgressSection}>
          <View style={styles.overallProgressBar}>
            <View style={[
              styles.overallProgressFill,
              { width: `${completionPercentage}%` }
            ]} />
          </View>
          <Text style={styles.overallProgressText}>
            {earnedAchievements.length} of {totalAchievements} achievements unlocked
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
        >
          <CategoryTab 
            category="all" 
            label="All" 
            count={achievements.length}
          />
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => {
            const count = achievements.filter(ach => ach.category === key).length;
            return count > 0 ? (
              <CategoryTab 
                key={key}
                category={key} 
                label={category.name} 
                count={count}
              />
            ) : null;
          })}
        </ScrollView>

        {/* Achievements List */}
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
              <Text style={styles.loadingText}>Loading achievements...</Text>
            </View>
          ) : filteredAchievements.length > 0 ? (
            <View style={styles.achievementsList}>
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Achievements</Text>
              <Text style={styles.emptyStateText}>
                Start playing tournaments to earn your first achievements!
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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overallProgressSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    marginBottom: Layout.spacing.sm,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryTabs: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    marginRight: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryTabActive: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTabTextActive: {
    color: Colors.crackzoneYellow,
  },
  scrollView: {
    flex: 1,
  },
  achievementsList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.7,
  },
  achievementCardEarned: {
    opacity: 1,
    borderColor: Colors.success + '40',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  achievementNameLocked: {
    color: Colors.textMuted,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  achievementDescriptionLocked: {
    color: Colors.textMuted,
  },
  achievementDate: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: Layout.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Layout.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: Layout.spacing.sm,
  },
  earnedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
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