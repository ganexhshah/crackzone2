import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { tournamentsAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import TournamentsSkeleton from '../../components/skeletons/TournamentsSkeleton';

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding 
  } = useResponsive();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentsAPI.getAll();
      setTournaments(response.data.tournaments || []);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  // Categorize tournaments by status
  const categorizedTournaments = {
    live: tournaments.filter(t => t.status === 'live' || t.status === 'upcoming'),
    upcoming: tournaments.filter(t => t.status === 'upcoming'),
    completed: tournaments.filter(t => t.status === 'completed')
  };

  // Filter tournaments by search term
  const filteredTournaments = categorizedTournaments[activeTab].filter(tournament =>
    tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.tournament_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'live', name: 'Live', count: categorizedTournaments.live.length },
    { id: 'upcoming', name: 'Upcoming', count: categorizedTournaments.upcoming.length },
    { id: 'completed', name: 'Completed', count: categorizedTournaments.completed.length }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Started';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return Colors.info;
      case 'live': return Colors.success;
      case 'completed': return Colors.textMuted;
      default: return Colors.textMuted;
    }
  };

  const getTournamentTypeColor = (type) => {
    switch (type) {
      case 'SOLO': return Colors.info;
      case 'DUO': return Colors.warning;
      case 'SQUAD': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  const isRegistrationOpen = (tournament) => {
    const now = new Date();
    const regEnd = new Date(tournament.registration_end);
    return now < regEnd && tournament.registered_count < tournament.max_participants;
  };

  const TournamentCard = ({ tournament }) => (
    <TouchableOpacity
      style={styles.tournamentCard}
      onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })}
    >
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTitle}>{tournament.title}</Text>
          <Text style={styles.tournamentGame}>{tournament.game}</Text>
        </View>
        <View style={styles.tournamentBadges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(tournament.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(tournament.status) }]}>
              {tournament.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getTournamentTypeColor(tournament.tournament_type) + '20' }]}>
            <Text style={[styles.badgeText, { color: getTournamentTypeColor(tournament.tournament_type) }]}>
              {tournament.tournament_type}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tournamentDetails}>
        <View style={styles.prizeSection}>
          <Text style={styles.prizeLabel}>Prize Pool</Text>
          <Text style={styles.prizeValue}>
            ₹{tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'}
          </Text>
        </View>
        <View style={styles.entrySection}>
          <Text style={styles.entryLabel}>Entry Fee</Text>
          <Text style={styles.entryValue}>
            {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
          </Text>
        </View>
      </View>

      <View style={styles.tournamentMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.metaText}>
            {tournament.registered_count || 0}/{tournament.max_participants}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{formatDate(tournament.start_date)}</Text>
        </View>
      </View>

      <View style={styles.tournamentFooter}>
        <View style={styles.registrationStatus}>
          {tournament.is_registered ? (
            <View style={styles.registeredStatus}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>Registered</Text>
            </View>
          ) : isRegistrationOpen(tournament) ? (
            <View style={styles.openStatus}>
              <View style={styles.pulseIndicator} />
              <Text style={[styles.statusText, { color: Colors.success }]}>Registration Open</Text>
            </View>
          ) : (
            <View style={styles.closedStatus}>
              <View style={styles.closedIndicator} />
              <Text style={[styles.statusText, { color: Colors.error }]}>Registration Closed</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            tournament.is_registered && styles.registeredButton
          ]}
          onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })}
        >
          <Text style={[
            styles.actionButtonText,
            tournament.is_registered && styles.registeredButtonText
          ]}>
            {tournament.is_registered ? 'Registered' : 'View Details'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <TournamentsSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Tournaments"
          showBackButton={false}
          rightIcon="notifications-outline"
          onRightPress={() => navigation.navigate('Notifications')}
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
            Join exciting tournaments and win prizes
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Ionicons 
            name="search-outline" 
            size={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)} 
            color={Colors.textSecondary} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[
              styles.searchInput,
              { 
                fontSize: getFontSize(16),
                paddingVertical: getSpacing(Layout.spacing.md),
              }
            ]}
            placeholder="Search tournaments..."
            placeholderTextColor={Colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Tabs */}
        <View style={[
          styles.tabsContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab, 
                activeTab === tab.id && styles.activeTab,
                {
                  paddingVertical: getSpacing(Layout.spacing.md),
                  paddingHorizontal: getSpacing(Layout.spacing.lg),
                }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
                { fontSize: getFontSize(14) }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tournament List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.crackzoneYellow} />
          }
        >
          {filteredTournaments.length > 0 ? (
            <View style={styles.tournamentsList}>
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No tournaments found</Text>
              <Text style={styles.emptyStateText}>
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new tournaments'}
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
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    // Dynamic font size and padding applied via responsive hook
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    // Dynamic padding applied via responsive hook
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
  },
  tabText: {
    fontWeight: '600',
    color: Colors.textSecondary,
    // Dynamic font size applied via responsive hook
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  scrollView: {
    flex: 1,
  },
  tournamentsList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  tournamentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  tournamentInfo: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  tournamentGame: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tournamentBadges: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  prizeSection: {
    flex: 1,
  },
  prizeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Layout.spacing.xs,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  entrySection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  entryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Layout.spacing.xs,
  },
  entryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tournamentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationStatus: {
    flex: 1,
  },
  registeredStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: Layout.spacing.xs,
  },
  closedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: Layout.spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Layout.spacing.xs,
  },
  actionButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  registeredButton: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  actionButtonText: {
    color: Colors.crackzoneYellow,
    fontSize: 14,
    fontWeight: '600',
  },
  registeredButtonText: {
    color: Colors.success,
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
    paddingVertical: Layout.spacing.xl * 2,
    paddingHorizontal: Layout.spacing.lg,
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