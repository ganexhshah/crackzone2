import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Animated,
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('start_date');
  const [filterBy, setFilterBy] = useState({
    game: 'all',
    type: 'all',
    entryFee: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

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
    live: tournaments.filter(t => t.status === 'active' || (t.status === 'upcoming' && new Date(t.start_date) <= new Date())),
    upcoming: tournaments.filter(t => t.status === 'upcoming' && new Date(t.start_date) > new Date()),
    completed: tournaments.filter(t => t.status === 'completed'),
    registered: tournaments.filter(t => t.is_registered),
    favorites: tournaments.filter(t => favorites.has(t.id))
  };

  // Apply filters and search
  const getFilteredTournaments = () => {
    let filtered = categorizedTournaments[activeTab] || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.game?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.tournament_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Game filter
    if (filterBy.game !== 'all') {
      filtered = filtered.filter(t => t.game?.toLowerCase() === filterBy.game.toLowerCase());
    }

    // Type filter
    if (filterBy.type !== 'all') {
      filtered = filtered.filter(t => t.tournament_type === filterBy.type);
    }

    // Entry fee filter
    if (filterBy.entryFee !== 'all') {
      if (filterBy.entryFee === 'free') {
        filtered = filtered.filter(t => !t.entry_fee || t.entry_fee === 0);
      } else if (filterBy.entryFee === 'paid') {
        filtered = filtered.filter(t => t.entry_fee && t.entry_fee > 0);
      }
    }

    // Sort tournaments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'prize_pool':
          return (b.prize_pool || 0) - (a.prize_pool || 0);
        case 'entry_fee':
          return (a.entry_fee || 0) - (b.entry_fee || 0);
        case 'popularity':
          return (b.registered_count || 0) - (a.registered_count || 0);
        case 'start_date':
        default:
          return new Date(a.start_date) - new Date(b.start_date);
      }
    });

    return filtered;
  };

  const filteredTournaments = getFilteredTournaments();

  const tabs = [
    { id: 'live', name: 'Live', count: categorizedTournaments.live.length, icon: 'flash' },
    { id: 'upcoming', name: 'Upcoming', count: categorizedTournaments.upcoming.length, icon: 'calendar' },
    { id: 'completed', name: 'Completed', count: categorizedTournaments.completed.length, icon: 'trophy' },
    { id: 'registered', name: 'My Tournaments', count: categorizedTournaments.registered.length, icon: 'star' },
    { id: 'favorites', name: 'Favorites', count: categorizedTournaments.favorites.length, icon: 'heart' }
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
    return tournament.status === 'active' && (tournament.registered_count || 0) < tournament.max_participants;
  };

  const getRegistrationProgress = (tournament) => {
    const registered = tournament.registered_count || 0;
    const max = tournament.max_participants || 1;
    return Math.min((registered / max) * 100, 100);
  };

  const toggleFavorite = (tournamentId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tournamentId)) {
        newFavorites.delete(tournamentId);
      } else {
        newFavorites.add(tournamentId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBy({ game: 'all', type: 'all', entryFee: 'all' });
    setShowFilters(false);
  };

  const TournamentCard = ({ tournament, isListView = false }) => {
    const progress = getRegistrationProgress(tournament);
    const isFavorite = favorites.has(tournament.id);
    
    if (isListView) {
      return (
        <TouchableOpacity
          style={styles.tournamentListCard}
          onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })}
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <Text style={styles.listCardTitle}>{tournament.title}</Text>
              <Text style={styles.listCardGame}>{tournament.game}</Text>
            </View>
            <View style={styles.listCardBadges}>
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

          <View style={styles.listCardDetails}>
            <View style={styles.listCardPrize}>
              <Text style={styles.listCardLabel}>Prize Pool</Text>
              <Text style={styles.listCardPrizeValue}>
                ₹{tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'}
              </Text>
            </View>
            <View style={styles.listCardEntry}>
              <Text style={styles.listCardLabel}>Entry Fee</Text>
              <Text style={styles.listCardEntryValue}>
                {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
              </Text>
            </View>
          </View>

          <View style={styles.listCardMeta}>
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

          <View style={styles.listCardFooter}>
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
            <View style={styles.listCardActions}>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(tournament.id)}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite ? Colors.error : Colors.textSecondary} 
                />
              </TouchableOpacity>
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
                  {tournament.is_registered ? 'Registered' : 'Join Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
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

        {/* Registration Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {tournament.registered_count || 0}/{tournament.max_participants} registered
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(tournament.start_date)}</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>

        {tournament.description && (
          <Text style={styles.tournamentDescription} numberOfLines={2}>
            {tournament.description}
          </Text>
        )}

        <View style={styles.tournamentFooter}>
          <View style={styles.registrationStatus}>
            {tournament.is_registered ? (
              <View style={styles.registeredStatus}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.statusText, { color: Colors.success }]}>You're registered!</Text>
              </View>
            ) : isRegistrationOpen(tournament) ? (
              <View style={styles.openStatus}>
                <View style={styles.pulseIndicator} />
                <Text style={[styles.statusText, { color: Colors.success }]}>Registration Open</Text>
              </View>
            ) : (
              <View style={styles.closedStatus}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={[styles.statusText, { color: Colors.error }]}>Registration Closed</Text>
              </View>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(tournament.id)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? Colors.error : Colors.textSecondary} 
              />
            </TouchableOpacity>
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
                {tournament.is_registered ? 'View' : 'Join Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterPanel = () => (
    showFilters && (
      <View style={[
        styles.filterPanel,
        {
          marginHorizontal: getContainerPadding(),
          marginBottom: getSpacing(Layout.spacing.lg),
          padding: getSpacing(Layout.spacing.md),
        }
      ]}>
        <Text style={[styles.filterTitle, { fontSize: getFontSize(16) }]}>Filters</Text>
        
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { fontSize: getFontSize(14) }]}>Game</Text>
            <TouchableOpacity 
              style={styles.filterSelect}
              onPress={() => {
                Alert.alert(
                  'Select Game',
                  '',
                  [
                    { text: 'All Games', onPress: () => setFilterBy(prev => ({ ...prev, game: 'all' })) },
                    { text: 'Free Fire', onPress: () => setFilterBy(prev => ({ ...prev, game: 'free fire' })) },
                    { text: 'PUBG', onPress: () => setFilterBy(prev => ({ ...prev, game: 'pubg' })) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterSelectText}>
                {filterBy.game === 'all' ? 'All Games' : filterBy.game}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { fontSize: getFontSize(14) }]}>Type</Text>
            <TouchableOpacity 
              style={styles.filterSelect}
              onPress={() => {
                Alert.alert(
                  'Select Type',
                  '',
                  [
                    { text: 'All Types', onPress: () => setFilterBy(prev => ({ ...prev, type: 'all' })) },
                    { text: 'Solo', onPress: () => setFilterBy(prev => ({ ...prev, type: 'SOLO' })) },
                    { text: 'Duo', onPress: () => setFilterBy(prev => ({ ...prev, type: 'DUO' })) },
                    { text: 'Squad', onPress: () => setFilterBy(prev => ({ ...prev, type: 'SQUAD' })) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterSelectText}>
                {filterBy.type === 'all' ? 'All Types' : filterBy.type}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { fontSize: getFontSize(14) }]}>Entry Fee</Text>
            <TouchableOpacity 
              style={styles.filterSelect}
              onPress={() => {
                Alert.alert(
                  'Select Entry Fee',
                  '',
                  [
                    { text: 'All', onPress: () => setFilterBy(prev => ({ ...prev, entryFee: 'all' })) },
                    { text: 'Free', onPress: () => setFilterBy(prev => ({ ...prev, entryFee: 'free' })) },
                    { text: 'Paid', onPress: () => setFilterBy(prev => ({ ...prev, entryFee: 'paid' })) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterSelectText}>
                {filterBy.entryFee === 'all' ? 'All' : 
                 filterBy.entryFee === 'free' ? 'Free' : 'Paid'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  );

  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {[
            { id: 'start_date', label: 'Start Date', icon: 'calendar-outline' },
            { id: 'prize_pool', label: 'Prize Pool', icon: 'trophy-outline' },
            { id: 'entry_fee', label: 'Entry Fee', icon: 'card-outline' },
            { id: 'popularity', label: 'Popularity', icon: 'trending-up-outline' }
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.sortOptionActive
              ]}
              onPress={() => {
                setSortBy(option.id);
                setShowSortModal(false);
              }}
            >
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={sortBy === option.id ? Colors.crackzoneYellow : Colors.textSecondary} 
              />
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={20} color={Colors.crackzoneYellow} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return <TournamentsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Tournaments"
          showBackButton={false}
          rightIcon="notifications-outline"
          onRightPress={() => navigation.navigate('Dashboard', { screen: 'Notifications' })}
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

        {/* Search and Controls */}
        <View style={[
          styles.controlsContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <View style={[
            styles.searchContainer,
            {
              marginBottom: getSpacing(Layout.spacing.md),
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
              placeholder="Search tournaments, games, or descriptions..."
              placeholderTextColor={Colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchTerm('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[
                styles.controlButton,
                showFilters && styles.controlButtonActive,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                }
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons 
                name="options-outline" 
                size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                color={showFilters ? Colors.crackzoneBlack : Colors.textSecondary} 
              />
              <Text style={[
                styles.controlButtonText,
                showFilters && styles.controlButtonTextActive,
                { fontSize: getFontSize(14) }
              ]}>
                Filters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.controlButton,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                }
              ]}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons 
                name="swap-vertical-outline" 
                size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                color={Colors.textSecondary} 
              />
              <Text style={[
                styles.controlButtonText,
                { fontSize: getFontSize(14) }
              ]}>
                Sort
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.controlButton,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                }
              ]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons 
                name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
                size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                color={Colors.textSecondary} 
              />
              <Text style={[
                styles.controlButtonText,
                { fontSize: getFontSize(14) }
              ]}>
                {viewMode === 'grid' ? 'List' : 'Grid'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.controlButton,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                }
              ]}
              onPress={onRefresh}
            >
              <Ionicons 
                name="refresh-outline" 
                size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                color={Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <FilterPanel />

        {/* Enhanced Tabs */}
        <View style={[
          styles.tabsScrollContainer,
          {
            marginHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab, 
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={16} 
                  color={activeTab === tab.id ? Colors.crackzoneBlack : Colors.textSecondary} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}>
                  {tab.name}
                </Text>
                <View style={[
                  styles.tabBadge,
                  activeTab === tab.id && styles.activeTabBadge
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    activeTab === tab.id && styles.activeTabBadgeText,
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tournament List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.crackzoneYellow} />
          }
        >
          {filteredTournaments.length > 0 ? (
            <View style={[
              styles.tournamentsList,
              viewMode === 'grid' ? styles.tournamentsGrid : styles.tournamentsListView
            ]}>
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament} 
                  isListView={viewMode === 'list'}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No tournaments found</Text>
              <Text style={styles.emptyStateText}>
                {searchTerm || showFilters ? 'Try adjusting your search terms or filters' : 'Check back later for new tournaments'}
              </Text>
              {(searchTerm || showFilters) && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        <SortModal />
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
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Controls Section
  controlsContainer: {
    // Dynamic padding applied via responsive hook
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
  clearSearchButton: {
    padding: Layout.spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    // Dynamic padding applied via responsive hook
  },
  controlButtonActive: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  controlButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
    // Dynamic font size applied via responsive hook
  },
  controlButtonTextActive: {
    color: Colors.crackzoneBlack,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    // Dynamic padding and margin applied via responsive hook
  },
  filterTitle: {
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
    // Dynamic font size applied via responsive hook
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Layout.spacing.sm,
  },
  filterItem: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
    // Dynamic font size applied via responsive hook
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterSelectText: {
    color: Colors.text,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  clearFiltersButton: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clearFiltersText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },

  // Sort Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xs,
  },
  sortOptionActive: {
    backgroundColor: Colors.crackzoneYellow + '20',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.md,
  },
  sortOptionTextActive: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },

  // Enhanced Tabs
  tabsScrollContainer: {
    height: 50, // Fixed height to prevent stretching
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    alignItems: 'center',
    height: 50,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    marginRight: Layout.spacing.xs,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    height: 36, // Fixed height for tabs
    maxWidth: 120, // Prevent tabs from getting too wide
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
  },
  tabText: {
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
    fontSize: 12,
    flexShrink: 1, // Allow text to shrink if needed
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  tabBadge: {
    backgroundColor: Colors.textMuted + '20',
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
    marginLeft: Layout.spacing.xs,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBadge: {
    backgroundColor: Colors.crackzoneBlack + '20',
  },
  tabBadgeText: {
    color: Colors.textMuted,
    fontWeight: 'bold',
    fontSize: 10,
    lineHeight: 12,
  },
  activeTabBadgeText: {
    color: Colors.crackzoneBlack,
  },

  scrollView: {
    flex: 1,
  },
  tournamentsList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  tournamentsGrid: {
    // Grid layout styles
  },
  tournamentsListView: {
    // List layout styles
  },

  // Enhanced Tournament Card
  tournamentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // Progress Section
  progressSection: {
    marginBottom: Layout.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  progressBarContainer: {
    // Progress bar container
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: 2,
  },
  tournamentDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
    lineHeight: 20,
  },

  // Tournament Meta
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
  },

  // Tournament Footer
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  favoriteButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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

  // List View Card
  tournamentListCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  listCardGame: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listCardBadges: {
    alignItems: 'flex-end',
  },
  listCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  listCardPrize: {
    flex: 1,
  },
  listCardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Layout.spacing.xs,
  },
  listCardPrizeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  listCardEntry: {
    flex: 1,
    alignItems: 'flex-end',
  },
  listCardEntryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
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
    marginBottom: Layout.spacing.lg,
  },
});