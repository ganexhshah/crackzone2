import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tournamentsAPI } from '../../services/api';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import TournamentDetailSkeleton from '../../components/skeletons/TournamentDetailSkeleton';

export default function TournamentDetailScreen({ route, navigation }) {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding,
    isExtraSmallDevice,
    isSmallDevice 
  } = useResponsive();

  useEffect(() => {
    fetchTournamentDetails();
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      const response = await tournamentsAPI.getById(tournamentId);
      setTournament(response.data.tournament);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Failed to fetch tournament details:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!tournament) return;
    
    if (tournament.tournament_type === 'SOLO') {
      Alert.alert('Registration', 'Solo registration feature coming soon!');
    } else {
      Alert.alert('Registration', 'Team registration feature coming soon!');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return Colors.info;
      case 'live': return Colors.success;
      case 'completed': return Colors.textMuted;
      default: return Colors.textMuted;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'SOLO': return Colors.info;
      case 'DUO': return Colors.warning;
      case 'SQUAD': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <TournamentDetailSkeleton />;
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Text style={[styles.errorText, { fontSize: getFontSize(18) }]}>Tournament not found</Text>
            <TouchableOpacity 
              style={[styles.errorButton, { padding: getSpacing(Layout.spacing.md) }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.errorButtonText, { fontSize: getFontSize(16) }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Tournament Details"
          onBackPress={() => navigation.goBack()}
          rightIcon="share-outline"
          onRightPress={() => Alert.alert('Share', 'Share tournament feature coming soon!')}
        />

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={[
            styles.heroSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* Game Icon */}
            <View style={[
              styles.gameIconContainer,
              {
                width: getResponsiveValue(60, 65, 70, 75, 80, 85, 90),
                height: getResponsiveValue(60, 65, 70, 75, 80, 85, 90),
                borderRadius: getResponsiveValue(30, 32.5, 35, 37.5, 40, 42.5, 45),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <Ionicons 
                name="game-controller" 
                size={getResponsiveValue(28, 30, 32, 34, 36, 38, 40)} 
                color={Colors.crackzoneYellow} 
              />
            </View>

            {/* Tournament Title */}
            <Text style={[
              styles.tournamentTitle,
              { 
                fontSize: getFontSize(isExtraSmallDevice ? 22 : isSmallDevice ? 24 : 26),
                marginBottom: getSpacing(Layout.spacing.sm),
              }
            ]}>
              {tournament.title}
            </Text>

            {/* Game Name */}
            <Text style={[
              styles.tournamentGame,
              { 
                fontSize: getFontSize(16),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              {tournament.game}
            </Text>

            {/* Status Badges */}
            <View style={[styles.badgesContainer, { gap: getSpacing(Layout.spacing.sm) }]}>
              <View style={[
                styles.badge,
                { 
                  backgroundColor: getStatusColor(tournament.status) + '20',
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                  paddingVertical: getSpacing(Layout.spacing.sm),
                }
              ]}>
                <Ionicons 
                  name="radio-button-on" 
                  size={getResponsiveValue(12, 14, 16, 18, 20, 22, 24)} 
                  color={getStatusColor(tournament.status)} 
                />
                <Text style={[
                  styles.badgeText,
                  { 
                    color: getStatusColor(tournament.status),
                    fontSize: getFontSize(12),
                    marginLeft: getSpacing(Layout.spacing.xs),
                  }
                ]}>
                  {tournament.status?.toUpperCase()}
                </Text>
              </View>
              
              <View style={[
                styles.badge,
                { 
                  backgroundColor: getTypeColor(tournament.tournament_type) + '20',
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                  paddingVertical: getSpacing(Layout.spacing.sm),
                }
              ]}>
                <Ionicons 
                  name="people" 
                  size={getResponsiveValue(12, 14, 16, 18, 20, 22, 24)} 
                  color={getTypeColor(tournament.tournament_type)} 
                />
                <Text style={[
                  styles.badgeText,
                  { 
                    color: getTypeColor(tournament.tournament_type),
                    fontSize: getFontSize(12),
                    marginLeft: getSpacing(Layout.spacing.xs),
                  }
                ]}>
                  {tournament.tournament_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Prize & Entry Cards */}
          <View style={[
            styles.prizeSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
              gap: getSpacing(Layout.spacing.md),
            }
          ]}>
            <View style={[
              styles.prizeCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                borderRadius: Layout.borderRadius.xl,
              }
            ]}>
              <View style={[
                styles.prizeIconContainer,
                {
                  width: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
                  height: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
                  borderRadius: getResponsiveValue(20, 22, 24, 26, 28, 30, 32),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Ionicons 
                  name="trophy" 
                  size={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
                  color={Colors.crackzoneYellow} 
                />
              </View>
              <Text style={[
                styles.prizeLabel,
                { fontSize: getFontSize(12) }
              ]}>
                PRIZE POOL
              </Text>
              <Text style={[
                styles.prizeValue,
                { fontSize: getFontSize(isExtraSmallDevice ? 18 : isSmallDevice ? 20 : 22) }
              ]}>
                ₹{Number(tournament.prize_pool || 0).toLocaleString()}
              </Text>
            </View>

            <View style={[
              styles.entryCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                borderRadius: Layout.borderRadius.xl,
              }
            ]}>
              <View style={[
                styles.entryIconContainer,
                {
                  width: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
                  height: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
                  borderRadius: getResponsiveValue(20, 22, 24, 26, 28, 30, 32),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Ionicons 
                  name="ticket" 
                  size={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
                  color={tournament.entry_fee > 0 ? Colors.warning : Colors.success} 
                />
              </View>
              <Text style={[
                styles.entryLabel,
                { fontSize: getFontSize(12) }
              ]}>
                ENTRY FEE
              </Text>
              <Text style={[
                styles.entryValue,
                { 
                  fontSize: getFontSize(isExtraSmallDevice ? 18 : isSmallDevice ? 20 : 22),
                  color: tournament.entry_fee > 0 ? Colors.warning : Colors.success,
                }
              ]}>
                {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'FREE'}
              </Text>
            </View>
          </View>

          {/* Tournament Info Cards */}
          <View style={[
            styles.infoSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { 
                fontSize: getFontSize(20),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              Tournament Information
            </Text>

            {/* Participants Info */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <View style={styles.infoCardHeader}>
                <View style={[
                  styles.infoIconContainer,
                  {
                    width: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    height: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    borderRadius: getResponsiveValue(18, 20, 22, 24, 26, 28, 30),
                  }
                ]}>
                  <Ionicons 
                    name="people" 
                    size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                    color={Colors.info} 
                  />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[
                    styles.infoCardTitle,
                    { fontSize: getFontSize(16) }
                  ]}>
                    Participants
                  </Text>
                  <Text style={[
                    styles.infoCardValue,
                    { fontSize: getFontSize(14) }
                  ]}>
                    {tournament.registered_count || 0} / {tournament.max_participants} registered
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={[
                styles.progressBarContainer,
                { marginTop: getSpacing(Layout.spacing.md) }
              ]}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(((tournament.registered_count || 0) / tournament.max_participants) * 100, 100)}%`
                    }
                  ]} />
                </View>
                <Text style={[
                  styles.progressText,
                  { fontSize: getFontSize(12) }
                ]}>
                  {Math.round(((tournament.registered_count || 0) / tournament.max_participants) * 100)}% filled
                </Text>
              </View>
            </View>

            {/* Start Date Info */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <View style={styles.infoCardHeader}>
                <View style={[
                  styles.infoIconContainer,
                  {
                    width: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    height: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    borderRadius: getResponsiveValue(18, 20, 22, 24, 26, 28, 30),
                  }
                ]}>
                  <Ionicons 
                    name="calendar" 
                    size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                    color={Colors.success} 
                  />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[
                    styles.infoCardTitle,
                    { fontSize: getFontSize(16) }
                  ]}>
                    Tournament Starts
                  </Text>
                  <Text style={[
                    styles.infoCardValue,
                    { fontSize: getFontSize(14) }
                  ]}>
                    {formatDate(tournament.start_date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Registration End Info */}
            <View style={[
              styles.infoCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.md),
              }
            ]}>
              <View style={styles.infoCardHeader}>
                <View style={[
                  styles.infoIconContainer,
                  {
                    width: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    height: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                    borderRadius: getResponsiveValue(18, 20, 22, 24, 26, 28, 30),
                  }
                ]}>
                  <Ionicons 
                    name="time" 
                    size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                    color={Colors.warning} 
                  />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[
                    styles.infoCardTitle,
                    { fontSize: getFontSize(16) }
                  ]}>
                    Registration Ends
                  </Text>
                  <Text style={[
                    styles.infoCardValue,
                    { fontSize: getFontSize(14) }
                  ]}>
                    {formatDate(tournament.registration_end)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          {tournament.description && (
            <View style={[
              styles.descriptionSection,
              {
                paddingHorizontal: getContainerPadding(),
                marginBottom: getSpacing(Layout.spacing.xl),
              }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { 
                  fontSize: getFontSize(20),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                Description
              </Text>
              <View style={[
                styles.descriptionCard,
                { padding: getSpacing(Layout.spacing.lg) }
              ]}>
                <Text style={[
                  styles.descriptionText,
                  { 
                    fontSize: getFontSize(16),
                    lineHeight: getFontSize(24),
                  }
                ]}>
                  {tournament.description}
                </Text>
              </View>
            </View>
          )}

          {/* Participants List */}
          <View style={[
            styles.participantsSection,
            {
              paddingHorizontal: getContainerPadding(),
              marginBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            <View style={styles.participantsHeader}>
              <Text style={[
                styles.sectionTitle,
                { fontSize: getFontSize(20) }
              ]}>
                {tournament.tournament_type === 'SOLO' ? 'Participants' : 'Teams'}
              </Text>
              <View style={[
                styles.participantsBadge,
                {
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                  paddingVertical: getSpacing(Layout.spacing.sm),
                }
              ]}>
                <Text style={[
                  styles.participantsBadgeText,
                  { fontSize: getFontSize(12) }
                ]}>
                  {participants.length}
                </Text>
              </View>
            </View>

            {participants.length > 0 ? (
              <View style={[styles.participantsList, { marginTop: getSpacing(Layout.spacing.lg) }]}>
                {participants.slice(0, 5).map((participant, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.participantItem,
                      { 
                        padding: getSpacing(Layout.spacing.md),
                        marginBottom: getSpacing(Layout.spacing.sm),
                      }
                    ]}
                  >
                    <View style={[
                      styles.participantAvatar,
                      {
                        width: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                        height: getResponsiveValue(36, 40, 44, 48, 52, 56, 60),
                        borderRadius: getResponsiveValue(18, 20, 22, 24, 26, 28, 30),
                        marginRight: getSpacing(Layout.spacing.md),
                      }
                    ]}>
                      <Text style={[
                        styles.participantAvatarText,
                        { fontSize: getFontSize(14) }
                      ]}>
                        {(tournament.tournament_type === 'SOLO' 
                          ? participant.ign || participant.username 
                          : participant.team_name)?.charAt(0)?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={[
                        styles.participantName,
                        { fontSize: getFontSize(16) }
                      ]}>
                        {tournament.tournament_type === 'SOLO' 
                          ? participant.ign || participant.username 
                          : participant.team_name}
                      </Text>
                      {tournament.tournament_type !== 'SOLO' && participant.members && (
                        <Text style={[
                          styles.participantMembers,
                          { fontSize: getFontSize(14) }
                        ]}>
                          {participant.members.length} members
                        </Text>
                      )}
                    </View>
                    <Text style={[
                      styles.participantRank,
                      { fontSize: getFontSize(14) }
                    ]}>
                      #{index + 1}
                    </Text>
                  </View>
                ))}
                
                {participants.length > 5 && (
                  <TouchableOpacity style={[
                    styles.viewAllButton,
                    { 
                      padding: getSpacing(Layout.spacing.md),
                      marginTop: getSpacing(Layout.spacing.sm),
                    }
                  ]}>
                    <Text style={[
                      styles.viewAllText,
                      { fontSize: getFontSize(14) }
                    ]}>
                      View All {participants.length} {tournament.tournament_type === 'SOLO' ? 'Participants' : 'Teams'}
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                      color={Colors.crackzoneYellow} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={[
                styles.noParticipantsContainer,
                { 
                  paddingVertical: getSpacing(Layout.spacing.xl * 2),
                  marginTop: getSpacing(Layout.spacing.lg),
                }
              ]}>
                <Ionicons 
                  name="people-outline" 
                  size={getResponsiveValue(48, 52, 56, 60, 64, 68, 72)} 
                  color={Colors.textMuted} 
                />
                <Text style={[
                  styles.noParticipantsText,
                  { 
                    fontSize: getFontSize(16),
                    marginTop: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  No participants yet
                </Text>
                <Text style={[
                  styles.noParticipantsSubtext,
                  { fontSize: getFontSize(14) }
                ]}>
                  Be the first to register!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Section */}
        {tournament.is_registered ? (
          <View style={[
            styles.registeredSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <View style={[
              styles.registeredIndicator,
              { 
                paddingVertical: getSpacing(Layout.spacing.lg),
                borderRadius: Layout.borderRadius.xl,
              }
            ]}>
              <Ionicons 
                name="checkmark-circle" 
                size={getResponsiveValue(24, 26, 28, 30, 32, 34, 36)} 
                color={Colors.success} 
              />
              <Text style={[
                styles.registeredText,
                { 
                  fontSize: getFontSize(18),
                  marginLeft: getSpacing(Layout.spacing.md),
                }
              ]}>
                You're Registered!
              </Text>
            </View>
          </View>
        ) : tournament.status === 'upcoming' ? (
          <View style={[
            styles.registerSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.registerButton,
                { 
                  paddingVertical: getSpacing(Layout.spacing.lg),
                  borderRadius: Layout.borderRadius.xl,
                  minHeight: Layout.minTouchTarget,
                }
              ]} 
              onPress={handleRegister}
            >
              <Ionicons 
                name="add-circle" 
                size={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
                color={Colors.crackzoneBlack} 
              />
              <Text style={[
                styles.registerButtonText,
                { 
                  fontSize: getFontSize(18),
                  marginLeft: getSpacing(Layout.spacing.sm),
                }
              ]}>
                Register Now
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
  },
  gameIconContainer: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow + '40',
  },
  tournamentTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  tournamentGame: {
    color: Colors.crackzoneYellow,
    textAlign: 'center',
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Prize Section
  prizeSection: {
    flexDirection: 'row',
  },
  prizeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prizeIconContainer: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  prizeValue: {
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  entryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  entryIconContainer: {
    backgroundColor: Colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  entryValue: {
    fontWeight: 'bold',
  },
  
  // Info Section
  infoSection: {
    // Dynamic padding applied via responsive hook
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    backgroundColor: Colors.info + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  infoCardValue: {
    color: Colors.textSecondary,
  },
  
  // Progress Bar
  progressBarContainer: {
    // Dynamic margin applied via responsive hook
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Layout.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.info,
    borderRadius: 3,
  },
  progressText: {
    color: Colors.textMuted,
    textAlign: 'right',
    fontWeight: '500',
  },
  
  // Description Section
  descriptionSection: {
    // Dynamic padding applied via responsive hook
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    color: Colors.textSecondary,
  },
  
  // Participants Section
  participantsSection: {
    // Dynamic padding applied via responsive hook
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsBadge: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  participantsBadgeText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
  participantsList: {
    // Dynamic margin applied via responsive hook
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  participantAvatar: {
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow + '40',
  },
  participantAvatarText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  participantMembers: {
    color: Colors.textSecondary,
  },
  participantRank: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow + '40',
  },
  viewAllText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  noParticipantsContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noParticipantsText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  noParticipantsSubtext: {
    color: Colors.textMuted,
    marginTop: Layout.spacing.xs,
  },
  
  // Bottom Actions
  registerSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    backgroundColor: Colors.surface + '60',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.crackzoneYellow,
    elevation: 4,
    shadowColor: Colors.crackzoneYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  registeredSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    backgroundColor: Colors.surface + '60',
  },
  registeredIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  registeredText: {
    color: Colors.success,
    fontWeight: 'bold',
  },
  
  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontWeight: 'bold',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.lg,
  },
  errorButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: '600',
  },
});