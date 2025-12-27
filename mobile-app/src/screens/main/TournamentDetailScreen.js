import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showRoomPassword, setShowRoomPassword] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userReadyStatus, setUserReadyStatus] = useState(false);
  const [reportData, setReportData] = useState({ type: 'cheating', description: '' });
  
  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    ign: '',
    uid: '',
    teamName: '',
    members: []
  });
  
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
      setLeaderboard(response.data.leaderboard || []);
      
      // Initialize registration form based on tournament type
      if (response.data.tournament.tournament_type !== 'SOLO') {
        const memberCount = response.data.tournament.tournament_type === 'DUO' ? 2 : 4;
        setRegistrationData(prev => ({
          ...prev,
          members: Array(memberCount).fill({ ign: '', uid: '' })
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tournament details:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    try {
      if (tournament.tournament_type === 'SOLO') {
        await tournamentsAPI.registerSolo(tournamentId, {
          ign: registrationData.ign,
          uid: registrationData.uid
        });
      } else {
        await tournamentsAPI.registerTeam(tournamentId, {
          teamName: registrationData.teamName,
          members: registrationData.members.map((member, index) => ({
            ...member,
            role: index === 0 ? 'captain' : 'member'
          }))
        });
      }
      
      setShowRegistrationModal(false);
      setShowJoinConfirmation(false);
      await fetchTournamentDetails();
      Alert.alert('Success', 'Successfully registered!');
    } catch (err) {
      console.error('Registration failed:', err);
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
    }
  };

  const handleJoinClick = () => {
    if (tournament.entry_fee > 0) {
      setShowJoinConfirmation(true);
    } else {
      setShowRegistrationModal(true);
    }
  };

  const confirmJoinTournament = () => {
    setShowJoinConfirmation(false);
    setShowRegistrationModal(true);
  };

  const handleReadyToggle = async () => {
    try {
      const newStatus = !userReadyStatus;
      await tournamentsAPI.updateReadyStatus(tournamentId, newStatus);
      setUserReadyStatus(newStatus);
      Alert.alert('Success', newStatus ? 'Marked as Ready!' : 'Marked as Not Ready');
    } catch (err) {
      console.error('Failed to update ready status:', err);
      Alert.alert('Error', 'Failed to update ready status');
    }
  };

  const handleReport = async () => {
    try {
      await tournamentsAPI.submitReport(tournamentId, reportData);
      Alert.alert('Success', 'Report submitted successfully!');
      setShowReportModal(false);
      setReportData({ type: 'cheating', description: '' });
    } catch (err) {
      console.error('Failed to submit report:', err);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Copied to clipboard!');
  };

  // Tournament rules data
  const tournamentRules = [
    {
      title: "General Rules",
      rules: [
        "All participants must be registered before the tournament starts",
        "Entry fees are non-refundable once paid",
        "Players must use their registered IGN (In-Game Name)",
        "Any form of cheating or hacking will result in immediate disqualification",
        "Tournament organizers' decisions are final"
      ]
    },
    {
      title: "Game Rules",
      rules: [
        "Play fair and respect other players",
        "Use of any third-party software is strictly prohibited",
        "Players must join the room with the provided room ID and password",
        "Late entries will not be accepted after the match starts",
        "Screenshots of results may be required for verification"
      ]
    },
    {
      title: "Prize Distribution",
      rules: [
        "Prizes will be distributed within 24-48 hours after tournament completion",
        "Winners must provide valid payment details for prize transfer",
        "Tax deductions may apply as per local regulations",
        "Disputes regarding results must be raised within 2 hours of match completion"
      ]
    },
    {
      title: "Code of Conduct",
      rules: [
        "Maintain respectful behavior towards all participants",
        "No offensive language or harassment will be tolerated",
        "Follow all platform-specific community guidelines",
        "Report any suspicious activity to tournament moderators"
      ]
    }
  ];

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    return tournament.status === 'active' && tournament.registered_count < tournament.max_participants;
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
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

          {/* Room Details (if available) */}
          {tournament.room_id && (
            <View style={[
              styles.roomDetailsSection,
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
                Room Details Available
              </Text>
              
              <View style={styles.roomDetailsGrid}>
                <View style={[
                  styles.roomDetailCard,
                  { 
                    padding: getSpacing(Layout.spacing.lg),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  <Text style={[
                    styles.roomDetailLabel,
                    { fontSize: getFontSize(14) }
                  ]}>
                    Room ID
                  </Text>
                  <View style={styles.roomDetailValue}>
                    <Text style={[
                      styles.roomDetailText,
                      { fontSize: getFontSize(18) }
                    ]}>
                      {tournament.room_id}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(tournament.room_id)}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy-outline" size={20} color={Colors.crackzoneYellow} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[
                  styles.roomDetailCard,
                  { 
                    padding: getSpacing(Layout.spacing.lg),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  <Text style={[
                    styles.roomDetailLabel,
                    { fontSize: getFontSize(14) }
                  ]}>
                    Room Password
                  </Text>
                  <View style={styles.roomDetailValue}>
                    <Text style={[
                      styles.roomDetailText,
                      { fontSize: getFontSize(18) }
                    ]}>
                      {showRoomPassword ? tournament.room_password : '••••••••'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setShowRoomPassword(!showRoomPassword)}
                      style={styles.copyButton}
                    >
                      <Ionicons 
                        name={showRoomPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={Colors.crackzoneYellow} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => copyToClipboard(tournament.room_password)}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy-outline" size={20} color={Colors.crackzoneYellow} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <View style={[
              styles.leaderboardSection,
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
                Leaderboard
              </Text>
              
              <View style={styles.leaderboardList}>
                {leaderboard.map((entry, index) => (
                  <View key={entry.id} style={[
                    styles.leaderboardItem,
                    { 
                      padding: getSpacing(Layout.spacing.md),
                      marginBottom: getSpacing(Layout.spacing.sm),
                    },
                    index === 0 && styles.firstPlace,
                    index === 1 && styles.secondPlace,
                    index === 2 && styles.thirdPlace,
                  ]}>
                    <View style={styles.leaderboardRank}>
                      <View style={[
                        styles.rankBadge,
                        {
                          width: getResponsiveValue(32, 36, 40, 44, 48, 52, 56),
                          height: getResponsiveValue(32, 36, 40, 44, 48, 52, 56),
                          borderRadius: getResponsiveValue(16, 18, 20, 22, 24, 26, 28),
                        },
                        index === 0 && styles.goldBadge,
                        index === 1 && styles.silverBadge,
                        index === 2 && styles.bronzeBadge,
                      ]}>
                        <Text style={[
                          styles.rankText,
                          { fontSize: getFontSize(14) }
                        ]}>
                          {entry.placement || index + 1}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.leaderboardInfo}>
                      <Text style={[
                        styles.leaderboardName,
                        { fontSize: getFontSize(16) }
                      ]}>
                        {tournament.tournament_type === 'SOLO' ? entry.ign : entry.team_name}
                      </Text>
                      {tournament.tournament_type !== 'SOLO' && entry.members && (
                        <Text style={[
                          styles.leaderboardMembers,
                          { fontSize: getFontSize(14) }
                        ]}>
                          {entry.members.map(m => m.ign).join(', ')}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.leaderboardStats}>
                      <Text style={[
                        styles.leaderboardPoints,
                        { fontSize: getFontSize(16) }
                      ]}>
                        {entry.points || 0} pts
                      </Text>
                      <Text style={[
                        styles.leaderboardKills,
                        { fontSize: getFontSize(14) }
                      ]}>
                        {entry.kills || 0} kills
                      </Text>
                    </View>
                  </View>
                ))}
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
                marginBottom: getSpacing(Layout.spacing.md),
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
            
            {/* Dynamic buttons based on tournament status */}
            {tournament.status === 'live' && (
              <View style={styles.liveActionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.readyButton,
                    userReadyStatus && styles.readyButtonActive,
                    { 
                      paddingVertical: getSpacing(Layout.spacing.md),
                      borderRadius: Layout.borderRadius.lg,
                      marginBottom: getSpacing(Layout.spacing.sm),
                    }
                  ]} 
                  onPress={handleReadyToggle}
                >
                  <Ionicons 
                    name={userReadyStatus ? "checkmark-circle" : "radio-button-off"} 
                    size={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
                    color={userReadyStatus ? Colors.text : Colors.crackzoneBlack} 
                  />
                  <Text style={[
                    styles.readyButtonText,
                    userReadyStatus && styles.readyButtonTextActive,
                    { 
                      fontSize: getFontSize(16),
                      marginLeft: getSpacing(Layout.spacing.sm),
                    }
                  ]}>
                    {userReadyStatus ? '✓ Ready!' : 'I am Ready'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.reportButton,
                    { 
                      paddingVertical: getSpacing(Layout.spacing.sm),
                      borderRadius: Layout.borderRadius.lg,
                    }
                  ]} 
                  onPress={() => setShowReportModal(true)}
                >
                  <Ionicons 
                    name="flag-outline" 
                    size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                    color={Colors.error} 
                  />
                  <Text style={[
                    styles.reportButtonText,
                    { 
                      fontSize: getFontSize(14),
                      marginLeft: getSpacing(Layout.spacing.sm),
                    }
                  ]}>
                    Report Issue
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {tournament.status === 'completed' && (
              <TouchableOpacity 
                style={[
                  styles.resultsButton,
                  { 
                    paddingVertical: getSpacing(Layout.spacing.lg),
                    borderRadius: Layout.borderRadius.xl,
                  }
                ]} 
                onPress={() => setShowResultsModal(true)}
              >
                <Ionicons 
                  name="trophy" 
                  size={getResponsiveValue(20, 22, 24, 26, 28, 30, 32)} 
                  color={Colors.text} 
                />
                <Text style={[
                  styles.resultsButtonText,
                  { 
                    fontSize: getFontSize(18),
                    marginLeft: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  View Results
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : isRegistrationOpen() ? (
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
              onPress={handleJoinClick}
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
                {tournament.entry_fee > 0 && ` - ₹${tournament.entry_fee}`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.rulesButton,
                { 
                  paddingVertical: getSpacing(Layout.spacing.md),
                  borderRadius: Layout.borderRadius.lg,
                  marginTop: getSpacing(Layout.spacing.sm),
                }
              ]} 
              onPress={() => setShowRulesModal(true)}
            >
              <Ionicons 
                name="document-text-outline" 
                size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                color={Colors.info} 
              />
              <Text style={[
                styles.rulesButtonText,
                { 
                  fontSize: getFontSize(14),
                  marginLeft: getSpacing(Layout.spacing.sm),
                }
              ]}>
                View Tournament Rules
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[
            styles.closedSection,
            {
              paddingHorizontal: getContainerPadding(),
              paddingVertical: getSpacing(Layout.spacing.md),
            }
          ]}>
            <View style={[
              styles.closedIndicator,
              { 
                paddingVertical: getSpacing(Layout.spacing.md),
                paddingHorizontal: getSpacing(Layout.spacing.lg),
                borderRadius: Layout.borderRadius.lg,
              }
            ]}>
              <Ionicons 
                name="alert-circle" 
                size={20} 
                color={Colors.error} 
              />
              <Text style={[
                styles.closedText,
                { 
                  fontSize: getFontSize(16),
                  marginLeft: getSpacing(Layout.spacing.sm),
                }
              ]}>
                Registration Closed
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Registration Modal */}
      <Modal
        visible={showRegistrationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegistrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.registrationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Register for {tournament?.tournament_type} Tournament
              </Text>
              <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {tournament?.tournament_type === 'SOLO' ? (
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>In-Game Name (IGN)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={registrationData.ign}
                      onChangeText={(text) => setRegistrationData(prev => ({ ...prev, ign: text }))}
                      placeholder="Enter your IGN"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>User ID (UID)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={registrationData.uid}
                      onChangeText={(text) => setRegistrationData(prev => ({ ...prev, uid: text }))}
                      placeholder="Enter your UID"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Team Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={registrationData.teamName}
                      onChangeText={(text) => setRegistrationData(prev => ({ ...prev, teamName: text }))}
                      placeholder="Enter team name"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  {registrationData.members.map((member, index) => (
                    <View key={index} style={styles.memberSection}>
                      <Text style={styles.memberTitle}>
                        Player {index + 1} {index === 0 && '(Captain)'}
                      </Text>
                      <View style={styles.memberInputs}>
                        <TextInput
                          style={[styles.textInput, styles.memberInput]}
                          value={member.ign}
                          onChangeText={(text) => {
                            const newMembers = [...registrationData.members];
                            newMembers[index] = { ...newMembers[index], ign: text };
                            setRegistrationData(prev => ({ ...prev, members: newMembers }));
                          }}
                          placeholder="IGN"
                          placeholderTextColor={Colors.textMuted}
                        />
                        <TextInput
                          style={[styles.textInput, styles.memberInput]}
                          value={member.uid}
                          onChangeText={(text) => {
                            const newMembers = [...registrationData.members];
                            newMembers[index] = { ...newMembers[index], uid: text };
                            setRegistrationData(prev => ({ ...prev, members: newMembers }));
                          }}
                          placeholder="UID"
                          placeholderTextColor={Colors.textMuted}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRegistrationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleRegistration}
              >
                <Text style={styles.confirmButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rules Modal */}
      <Modal
        visible={showRulesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRulesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rulesModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tournament Rules</Text>
              <TouchableOpacity onPress={() => setShowRulesModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {tournamentRules.map((section, index) => (
                <View key={index} style={styles.rulesSection}>
                  <Text style={styles.rulesSectionTitle}>{section.title}</Text>
                  {section.rules.map((rule, ruleIndex) => (
                    <View key={ruleIndex} style={styles.ruleItem}>
                      <Text style={styles.ruleBullet}>•</Text>
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </View>
              ))}
              
              <View style={styles.importantNotice}>
                <View style={styles.noticeHeader}>
                  <Ionicons name="warning" size={20} color={Colors.warning} />
                  <Text style={styles.noticeTitle}>Important Notice</Text>
                </View>
                <Text style={styles.noticeText}>
                  Entry fees are non-refundable once paid. Please read all rules carefully before registering.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.understandButton}
              onPress={() => setShowRulesModal(false)}
            >
              <Text style={styles.understandButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Confirmation Modal */}
      <Modal
        visible={showJoinConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIcon}>
              <Ionicons name="warning" size={48} color={Colors.warning} />
            </View>
            
            <Text style={styles.confirmationTitle}>Confirm Registration</Text>
            <Text style={styles.confirmationText}>
              You are about to register for this tournament
            </Text>

            <View style={styles.confirmationDetails}>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Tournament:</Text>
                <Text style={styles.confirmationValue}>{tournament?.title}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Entry Fee:</Text>
                <Text style={styles.confirmationFee}>₹{tournament?.entry_fee}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Payment Method:</Text>
                <View style={styles.paymentMethod}>
                  <Ionicons name="wallet" size={16} color={Colors.info} />
                  <Text style={styles.paymentMethodText}>Wallet</Text>
                </View>
              </View>
            </View>

            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.warningTitle}>Non-Refundable</Text>
              </View>
              <Text style={styles.warningText}>
                Entry fees will be deducted from your wallet and are non-refundable once paid.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowJoinConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmJoinTournament}
              >
                <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Tournament Results</Text>
              <TouchableOpacity onPress={() => setShowResultsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Winner Announcement */}
              <View style={styles.winnerSection}>
                <Ionicons name="trophy" size={64} color={Colors.crackzoneYellow} />
                <Text style={styles.congratsText}>🎉 Congratulations!</Text>
                <Text style={styles.winnerName}>
                  {leaderboard.length > 0 ? (
                    tournament?.tournament_type === 'SOLO' 
                      ? leaderboard[0]?.ign 
                      : leaderboard[0]?.team_name
                  ) : 'Winner TBD'}
                </Text>
                <Text style={styles.winnerPrize}>
                  Prize: ₹{tournament?.prize_pool ? Math.floor(tournament.prize_pool * 0.6).toLocaleString() : '0'}
                </Text>
              </View>

              {/* Final Rankings */}
              <Text style={styles.rankingsTitle}>Final Rankings</Text>
              {leaderboard.length > 0 ? (
                <View style={styles.rankingsList}>
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <View key={entry.id} style={[
                      styles.rankingItem,
                      index === 0 && styles.firstPlaceRanking,
                      index === 1 && styles.secondPlaceRanking,
                      index === 2 && styles.thirdPlaceRanking,
                    ]}>
                      <View style={[
                        styles.rankingBadge,
                        index === 0 && styles.goldRankingBadge,
                        index === 1 && styles.silverRankingBadge,
                        index === 2 && styles.bronzeRankingBadge,
                      ]}>
                        <Text style={styles.rankingPosition}>
                          {entry.placement || index + 1}
                        </Text>
                      </View>
                      
                      <View style={styles.rankingInfo}>
                        <Text style={styles.rankingName}>
                          {tournament?.tournament_type === 'SOLO' ? entry.ign : entry.team_name}
                        </Text>
                        {tournament?.tournament_type !== 'SOLO' && entry.members && (
                          <Text style={styles.rankingMembers}>
                            {entry.members.map(m => m.ign).join(', ')}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.rankingStats}>
                        <Text style={styles.rankingPoints}>{entry.points || 0} pts</Text>
                        <Text style={styles.rankingKills}>{entry.kills || 0} kills</Text>
                        {index < 3 && (
                          <Text style={styles.rankingPrize}>
                            ₹{tournament?.prize_pool ? 
                              Math.floor(tournament.prize_pool * (index === 0 ? 0.6 : index === 1 ? 0.3 : 0.1)).toLocaleString() 
                              : '0'}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="trophy-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.noResultsText}>Results will be published soon</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowResultsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Issue</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Report Type</Text>
                <TouchableOpacity 
                  style={styles.selectInput}
                  onPress={() => {
                    Alert.alert(
                      'Select Report Type',
                      '',
                      [
                        { text: 'Cheating/Hacking', onPress: () => setReportData(prev => ({ ...prev, type: 'cheating' })) },
                        { text: 'Inappropriate Behavior', onPress: () => setReportData(prev => ({ ...prev, type: 'inappropriate_behavior' })) },
                        { text: 'Technical Issue', onPress: () => setReportData(prev => ({ ...prev, type: 'technical_issue' })) },
                        { text: 'Unfair Play', onPress: () => setReportData(prev => ({ ...prev, type: 'unfair_play' })) },
                        { text: 'Other', onPress: () => setReportData(prev => ({ ...prev, type: 'other' })) },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectText}>
                    {reportData.type === 'cheating' ? 'Cheating/Hacking' :
                     reportData.type === 'inappropriate_behavior' ? 'Inappropriate Behavior' :
                     reportData.type === 'technical_issue' ? 'Technical Issue' :
                     reportData.type === 'unfair_play' ? 'Unfair Play' : 'Other'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  value={reportData.description}
                  onChangeText={(text) => setReportData(prev => ({ ...prev, description: text }))}
                  placeholder="Please describe the issue in detail..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.reportWarning}>
                <Text style={styles.reportWarningText}>
                  <Text style={styles.reportWarningBold}>Note:</Text> False reports may result in penalties. Please provide accurate information.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  !reportData.description.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleReport}
                disabled={!reportData.description.trim()}
              >
                <Text style={[
                  styles.submitButtonText,
                  !reportData.description.trim() && styles.submitButtonTextDisabled
                ]}>
                  Submit Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Room Details Section
  roomDetailsSection: {
    // Dynamic padding applied via responsive hook
  },
  roomDetailsGrid: {
    // Room details grid layout
  },
  roomDetailCard: {
    backgroundColor: Colors.success + '10',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    // Dynamic padding applied via responsive hook
  },
  roomDetailLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
    // Dynamic font size applied via responsive hook
  },
  roomDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomDetailText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    // Dynamic font size applied via responsive hook
  },
  copyButton: {
    padding: Layout.spacing.sm,
    marginLeft: Layout.spacing.sm,
  },

  // Leaderboard Section
  leaderboardSection: {
    // Dynamic padding applied via responsive hook
  },
  leaderboardList: {
    // Leaderboard list styles
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    // Dynamic padding and margin applied via responsive hook
  },
  firstPlace: {
    backgroundColor: Colors.crackzoneYellow + '10',
    borderColor: Colors.crackzoneYellow + '30',
  },
  secondPlace: {
    backgroundColor: Colors.textMuted + '10',
    borderColor: Colors.textMuted + '30',
  },
  thirdPlace: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
  },
  leaderboardRank: {
    marginRight: Layout.spacing.md,
  },
  rankBadge: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    // Dynamic size applied via responsive hook
  },
  goldBadge: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  silverBadge: {
    backgroundColor: Colors.textMuted,
    borderColor: Colors.textMuted,
  },
  bronzeBadge: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  rankText: {
    fontWeight: 'bold',
    color: Colors.text,
    // Dynamic font size applied via responsive hook
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
    // Dynamic font size applied via responsive hook
  },
  leaderboardMembers: {
    color: Colors.textSecondary,
    // Dynamic font size applied via responsive hook
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardPoints: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
    // Dynamic font size applied via responsive hook
  },
  leaderboardKills: {
    color: Colors.textSecondary,
    // Dynamic font size applied via responsive hook
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
  
  // Bottom Actions - Enhanced
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
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info + '20',
    borderWidth: 1,
    borderColor: Colors.info + '40',
    // Dynamic padding applied via responsive hook
  },
  rulesButtonText: {
    color: Colors.info,
    fontWeight: '600',
    // Dynamic font size applied via responsive hook
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
  liveActionButtons: {
    // Live action buttons container
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.crackzoneYellow,
    // Dynamic padding applied via responsive hook
  },
  readyButtonActive: {
    backgroundColor: Colors.success,
  },
  readyButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
    // Dynamic font size applied via responsive hook
  },
  readyButtonTextActive: {
    color: Colors.text,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error + '40',
    // Dynamic padding applied via responsive hook
  },
  reportButtonText: {
    color: Colors.error,
    fontWeight: '600',
    // Dynamic font size applied via responsive hook
  },
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.info,
    // Dynamic padding applied via responsive hook
  },
  resultsButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    // Dynamic font size applied via responsive hook
  },
  closedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    backgroundColor: Colors.surface + '60',
  },
  closedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error + '40',
    maxHeight: 50, // Limit height
  },
  closedText: {
    color: Colors.error,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  
  // Registration Modal
  registrationModal: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  modalContent: {
    padding: Layout.spacing.lg,
    maxHeight: '70%',
  },
  formSection: {
    // Form section styles
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  memberSection: {
    marginBottom: Layout.spacing.lg,
  },
  memberTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  memberInputs: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  memberInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.textMuted + '20',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.crackzoneYellow,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.crackzoneBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Rules Modal
  rulesModal: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
  },
  rulesSection: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  rulesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginBottom: Layout.spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  ruleBullet: {
    color: Colors.crackzoneYellow,
    fontSize: 16,
    marginRight: Layout.spacing.sm,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  importantNotice: {
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
    marginLeft: Layout.spacing.sm,
  },
  noticeText: {
    fontSize: 14,
    color: Colors.warning,
    lineHeight: 20,
  },
  understandButton: {
    backgroundColor: Colors.crackzoneYellow,
    margin: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  understandButtonText: {
    color: Colors.crackzoneBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Join Confirmation Modal
  confirmationModal: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmationIcon: {
    marginBottom: Layout.spacing.lg,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  confirmationDetails: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  confirmationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmationFee: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.info,
    marginLeft: Layout.spacing.xs,
  },
  warningBox: {
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '30',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.error,
    marginLeft: Layout.spacing.xs,
  },
  warningText: {
    fontSize: 12,
    color: Colors.error,
    lineHeight: 16,
  },

  // Results Modal
  resultsModal: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
  },
  winnerSection: {
    alignItems: 'center',
    backgroundColor: Colors.crackzoneYellow + '10',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow + '30',
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl,
    marginBottom: Layout.spacing.xl,
  },
  congratsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  winnerPrize: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  rankingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  rankingsList: {
    // Rankings list styles
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  firstPlaceRanking: {
    backgroundColor: Colors.crackzoneYellow + '10',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow + '30',
  },
  secondPlaceRanking: {
    backgroundColor: Colors.textMuted + '10',
    borderWidth: 1,
    borderColor: Colors.textMuted + '30',
  },
  thirdPlaceRanking: {
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  rankingBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  goldRankingBadge: {
    backgroundColor: Colors.crackzoneYellow,
  },
  silverRankingBadge: {
    backgroundColor: Colors.textMuted,
  },
  bronzeRankingBadge: {
    backgroundColor: Colors.warning,
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  rankingMembers: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rankingStats: {
    alignItems: 'flex-end',
  },
  rankingPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
  },
  rankingKills: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rankingPrize: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.success,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
  },
  closeButton: {
    backgroundColor: Colors.crackzoneYellow,
    margin: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.crackzoneBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Report Modal
  reportModal: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    width: '100%',
    maxHeight: '70%',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  selectText: {
    fontSize: 16,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  textArea: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text,
    height: 100,
    textAlignVertical: 'top',
  },
  reportWarning: {
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },
  reportWarningText: {
    fontSize: 14,
    color: Colors.warning,
    lineHeight: 20,
  },
  reportWarningBold: {
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.error,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted + '20',
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonTextDisabled: {
    color: Colors.textMuted,
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