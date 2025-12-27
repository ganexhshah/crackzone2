import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useResponsive } from '../hooks/useResponsive';
import { dashboardAPI } from '../services/api';

export default function SearchModal({ visible, onClose, navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    tournaments: [],
    teams: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const { getFontSize, getSpacing } = useResponsive();

  useEffect(() => {
    if (visible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults({ tournaments: [], teams: [], users: [] });
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Get upcoming tournaments for search
      const tournamentsRes = await dashboardAPI.getUpcomingTournaments();
      
      const tournaments = tournamentsRes.data.tournaments?.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.game.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) || [];

      setResults({
        tournaments,
        teams: [], // Teams search can be implemented when teams API is available
        users: [] // Users search can be implemented later
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    onClose();
    setQuery('');
    Keyboard.dismiss();
    
    switch (type) {
      case 'tournament':
        navigation.navigate('Tournaments', {
          screen: 'TournamentDetail',
          params: { tournamentId: item.id }
        });
        break;
      case 'team':
        navigation.navigate('Teams', {
          screen: 'TeamDetail',
          params: { teamId: item.id }
        });
        break;
      case 'user':
        navigation.navigate('Profile', {
          screen: 'UserProfile',
          params: { userId: item.id }
        });
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults({ tournaments: [], teams: [], users: [] });
    Keyboard.dismiss();
    onClose();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SOLO': return Colors.info + '40';
      case 'DUO': return Colors.warning + '40';
      case 'SQUAD': return Colors.success + '40';
      default: return Colors.textMuted + '40';
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'flex-start',
      paddingTop: getSpacing(Layout.spacing.xl * 2),
    },
    modalContainer: {
      backgroundColor: Colors.crackzoneGray + 'F0',
      marginHorizontal: getSpacing(Layout.spacing.md),
      borderRadius: Layout.borderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.crackzoneYellow + '30',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      paddingVertical: getSpacing(Layout.spacing.md),
      borderBottomWidth: 1,
      borderBottomColor: Colors.crackzoneYellow + '20',
    },
    searchIcon: {
      marginRight: getSpacing(Layout.spacing.md),
    },
    searchInput: {
      flex: 1,
      fontSize: getFontSize(16),
      color: Colors.text,
      paddingVertical: getSpacing(Layout.spacing.sm),
    },
    closeButton: {
      padding: getSpacing(Layout.spacing.sm),
      marginLeft: getSpacing(Layout.spacing.sm),
    },
    resultsContainer: {
      maxHeight: 400,
    },
    loadingContainer: {
      padding: getSpacing(Layout.spacing.xl),
      alignItems: 'center',
    },
    loadingText: {
      fontSize: getFontSize(14),
      color: Colors.textSecondary,
      marginTop: getSpacing(Layout.spacing.sm),
    },
    emptyContainer: {
      padding: getSpacing(Layout.spacing.xl),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: getFontSize(14),
      color: Colors.textSecondary,
      marginTop: getSpacing(Layout.spacing.sm),
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: getFontSize(12),
      color: Colors.textMuted,
      marginTop: getSpacing(Layout.spacing.xs),
      textAlign: 'center',
    },
    resultsContent: {
      padding: getSpacing(Layout.spacing.md),
    },
    sectionTitle: {
      fontSize: getFontSize(12),
      fontWeight: '600',
      color: Colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: getSpacing(Layout.spacing.sm),
      marginTop: getSpacing(Layout.spacing.md),
      paddingHorizontal: getSpacing(Layout.spacing.sm),
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing(Layout.spacing.md),
      borderRadius: Layout.borderRadius.lg,
      marginBottom: getSpacing(Layout.spacing.xs),
    },
    resultIcon: {
      width: 40,
      height: 40,
      borderRadius: Layout.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: getSpacing(Layout.spacing.md),
    },
    resultContent: {
      flex: 1,
    },
    resultTitle: {
      fontSize: getFontSize(14),
      fontWeight: '600',
      color: Colors.text,
      marginBottom: getSpacing(Layout.spacing.xs),
    },
    resultSubtitle: {
      fontSize: getFontSize(12),
      color: Colors.textSecondary,
    },
    tournamentType: {
      paddingHorizontal: getSpacing(Layout.spacing.sm),
      paddingVertical: getSpacing(Layout.spacing.xs),
      borderRadius: Layout.borderRadius.sm,
      alignSelf: 'flex-start',
      marginTop: getSpacing(Layout.spacing.xs),
    },
    tournamentTypeText: {
      fontSize: getFontSize(10),
      fontWeight: '600',
      color: Colors.text,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.modalContainer}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <Ionicons 
                name="search" 
                size={getFontSize(20)} 
                color={Colors.crackzoneYellow} 
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search tournaments, teams, players..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={getFontSize(20)} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.crackzoneYellow} />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : query.length <= 2 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={getFontSize(48)} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Type at least 3 characters to search</Text>
                </View>
              ) : (
                <View style={styles.resultsContent}>
                  {/* Tournaments */}
                  {results.tournaments.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Tournaments</Text>
                      {results.tournaments.map((tournament) => (
                        <TouchableOpacity
                          key={tournament.id}
                          style={[styles.resultItem, { backgroundColor: Colors.crackzoneYellow + '10' }]}
                          onPress={() => handleResultClick('tournament', tournament)}
                        >
                          <View style={[styles.resultIcon, { backgroundColor: Colors.crackzoneYellow + '20' }]}>
                            <Ionicons name="trophy" size={getFontSize(20)} color={Colors.crackzoneYellow} />
                          </View>
                          <View style={styles.resultContent}>
                            <Text style={styles.resultTitle}>{tournament.title}</Text>
                            <Text style={styles.resultSubtitle}>
                              {tournament.game} • ₹{tournament.prize_pool?.toLocaleString()}
                            </Text>
                            {tournament.tournament_type && (
                              <View style={[styles.tournamentType, { backgroundColor: getTypeColor(tournament.tournament_type) }]}>
                                <Text style={styles.tournamentTypeText}>{tournament.tournament_type}</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* Teams */}
                  {results.teams.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Teams</Text>
                      {results.teams.map((team) => (
                        <TouchableOpacity
                          key={team.id}
                          style={[styles.resultItem, { backgroundColor: Colors.info + '10' }]}
                          onPress={() => handleResultClick('team', team)}
                        >
                          <View style={[styles.resultIcon, { backgroundColor: Colors.info + '20' }]}>
                            <Ionicons name="people" size={getFontSize(20)} color={Colors.info} />
                          </View>
                          <View style={styles.resultContent}>
                            <Text style={styles.resultTitle}>{team.name}</Text>
                            <Text style={styles.resultSubtitle}>
                              {team.game} • {team.members_count}/{team.max_members} members
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {results.tournaments.length === 0 && results.teams.length === 0 && results.users.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search" size={getFontSize(48)} color={Colors.textMuted} />
                      <Text style={styles.emptyText}>No results found for "{query}"</Text>
                      <Text style={styles.emptySubText}>Try searching for tournaments, teams, or players</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}