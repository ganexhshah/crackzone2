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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { teamsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import CreateTeamModal from '../../components/CreateTeamModal';
import TeamManagementModal from '../../components/TeamManagementModal';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import TeamsSkeleton from '../../components/skeletons/TeamsSkeleton';

export default function TeamsScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('myTeams');
  const [myTeams, setMyTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [teamManagementModalVisible, setTeamManagementModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { isSmallDevice, getResponsiveValue, getSpacing, getFontSize } = useResponsive();

  useEffect(() => {
    fetchTeamsData();
  }, [activeTab]);

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'myTeams') {
        const response = await teamsAPI.getMyTeams();
        setMyTeams(response.data.teams || []);
        
        // Also fetch pending requests
        try {
          const pendingResponse = await teamsAPI.getMyJoinRequests();
          setPendingRequests(pendingResponse.data.requests || []);
        } catch (error) {
          console.log('Could not fetch pending requests:', error);
          setPendingRequests([]);
        }
      } else {
        const response = await teamsAPI.getAvailable({ search: searchTerm });
        setAvailableTeams(response.data.teams || []);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamsData();
  };

  const handleJoinTeam = async (teamId) => {
    try {
      Alert.alert(
        'Join Team',
        'Do you want to send a join request to this team?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: async () => {
              try {
                await teamsAPI.join(teamId, { message: 'I would like to join your team!' });
                Alert.alert('Success', 'Join request sent successfully!');
                fetchTeamsData();
              } catch (error) {
                Alert.alert('Error', error.response?.data?.error || 'Failed to send join request');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to join team');
    }
  };

  const handleCreateTeam = () => {
    setCreateTeamModalVisible(true);
  };

  const handleCreateTeamSuccess = (newTeam) => {
    // Add the new team to myTeams list
    setMyTeams(prevTeams => [newTeam, ...prevTeams]);
    // Switch to myTeams tab to show the new team
    setActiveTab('myTeams');
  };

  const handleTeamClick = (team) => {
    if (activeTab === 'myTeams') {
      setSelectedTeam(team);
      setTeamManagementModalVisible(true);
    }
  };

  const handleTeamUpdated = (updatedTeam) => {
    setMyTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
      )
    );
  };

  const handleTeamDeleted = (teamId) => {
    setMyTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
  };

  const handleCancelJoinRequest = async (requestId, teamName) => {
    try {
      Alert.alert(
        'Cancel Join Request',
        `Are you sure you want to cancel your join request for "${teamName}"?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await teamsAPI.cancelJoinRequest(requestId);
                Alert.alert('Success', 'Join request cancelled successfully!');
                fetchTeamsData(); // Refresh data
              } catch (error) {
                Alert.alert('Error', error.response?.data?.error || 'Failed to cancel join request');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel join request');
    }
  };

  const tabs = [
    { id: 'myTeams', name: 'My Teams', count: myTeams.length },
    { id: 'available', name: 'Find Teams', count: availableTeams.length }
  ];

  const TeamCard = ({ team, isMyTeam = false }) => (
    <TouchableOpacity 
      style={[
        styles.teamCard,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.md),
        }
      ]}
      onPress={() => isMyTeam ? handleTeamClick(team) : null}
      activeOpacity={isMyTeam ? 0.7 : 1}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { fontSize: getFontSize(18) }]}>{team.name}</Text>
          <Text style={[styles.teamGame, { fontSize: getFontSize(14) }]}>{team.game || 'Free Fire'}</Text>
        </View>
        <View style={styles.teamBadges}>
          <View style={[styles.badge, { backgroundColor: Colors.info + '20' }]}>
            <Text style={[styles.badgeText, { fontSize: getFontSize(12), color: Colors.info }]}>
              {team.tournament_type || 'SQUAD'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.teamDescription, { fontSize: getFontSize(14) }]}>
        {team.description || 'Looking for skilled players to join our competitive team.'}
      </Text>

      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={getFontSize(16)} color={Colors.textSecondary} />
          <Text style={[styles.statText, { fontSize: getFontSize(14) }]}>
            {team.member_count || 2}/{team.max_members || 4} Members
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={getFontSize(16)} color={Colors.crackzoneYellow} />
          <Text style={[styles.statText, { fontSize: getFontSize(14) }]}>
            {team.tournaments_won || 0} Wins
          </Text>
        </View>
      </View>

      <View style={styles.teamFooter}>
        <View style={styles.teamMembers}>
          <Text style={[styles.membersLabel, { fontSize: getFontSize(12) }]}>Captain:</Text>
          <Text style={[styles.captainName, { fontSize: getFontSize(14) }]}>
            {team.captain_name || team.captain?.username || 'Unknown'}
          </Text>
        </View>
        
        {!isMyTeam ? (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinTeam(team.id)}
          >
            <Text style={[styles.joinButtonText, { fontSize: getFontSize(14) }]}>Join Team</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.myTeamActions}>
            <View style={styles.myTeamBadge}>
              <Ionicons name="checkmark-circle" size={getFontSize(16)} color={Colors.success} />
              <Text style={[styles.myTeamText, { fontSize: getFontSize(14) }]}>My Team</Text>
            </View>
            <TouchableOpacity style={styles.manageButton}>
              <Ionicons name="settings-outline" size={getFontSize(16)} color={Colors.crackzoneYellow} />
              <Text style={[styles.manageButtonText, { fontSize: getFontSize(12) }]}>Manage</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredTeams = activeTab === 'myTeams' ? myTeams : availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.game && team.game.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      marginHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.md),
      borderRadius: Layout.borderRadius.lg,
      paddingHorizontal: getSpacing(Layout.spacing.md),
      borderWidth: 1,
      borderColor: Colors.border,
    },
    searchIcon: {
      marginRight: getSpacing(Layout.spacing.sm),
    },
    searchInput: {
      flex: 1,
      color: Colors.text,
      fontSize: getFontSize(16),
      paddingVertical: getSpacing(Layout.spacing.md),
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      marginHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.md),
      borderRadius: Layout.borderRadius.lg,
      padding: getSpacing(Layout.spacing.xs),
    },
    tab: {
      flex: 1,
      paddingVertical: getSpacing(Layout.spacing.sm),
      alignItems: 'center',
      borderRadius: Layout.borderRadius.md,
    },
    activeTab: {
      backgroundColor: Colors.crackzoneYellow,
    },
    tabText: {
      fontSize: getFontSize(14),
      fontWeight: '600',
      color: Colors.textSecondary,
    },
    activeTabText: {
      color: Colors.crackzoneBlack,
    },
    createButton: {
      backgroundColor: Colors.crackzoneYellow,
      marginHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.md),
      paddingVertical: getSpacing(Layout.spacing.md),
      borderRadius: Layout.borderRadius.lg,
      alignItems: 'center',
    },
    createButtonText: {
      color: Colors.crackzoneBlack,
      fontSize: getFontSize(16),
      fontWeight: 'bold',
    },
    pendingRequestsContainer: {
      marginHorizontal: getSpacing(Layout.spacing.lg),
      marginBottom: getSpacing(Layout.spacing.md),
    },
    pendingRequestsTitle: {
      fontSize: getFontSize(16),
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    pendingRequestCard: {
      backgroundColor: Colors.surface,
      borderRadius: Layout.borderRadius.md,
      padding: getSpacing(Layout.spacing.md),
      marginBottom: getSpacing(Layout.spacing.sm),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.warning + '40',
    },
    pendingRequestInfo: {
      flex: 1,
    },
    pendingRequestTeam: {
      fontSize: getFontSize(16),
      fontWeight: '600',
      color: Colors.text,
      marginBottom: getSpacing(Layout.spacing.xs),
    },
    pendingRequestGame: {
      fontSize: getFontSize(14),
      color: Colors.textSecondary,
    },
    cancelRequestButton: {
      backgroundColor: Colors.error + '20',
      borderWidth: 1,
      borderColor: Colors.error,
      borderRadius: Layout.borderRadius.sm,
      paddingHorizontal: getSpacing(Layout.spacing.md),
      paddingVertical: getSpacing(Layout.spacing.sm),
    },
    cancelRequestText: {
      fontSize: getFontSize(14),
      fontWeight: '600',
      color: Colors.error,
    },
    scrollView: {
      flex: 1,
    },
    teamsList: {
      paddingHorizontal: getSpacing(Layout.spacing.lg),
      paddingBottom: getSpacing(Layout.spacing.xl),
    },
    teamCard: {
      backgroundColor: Colors.surface,
      borderRadius: Layout.borderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    teamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    teamInfo: {
      flex: 1,
      marginRight: getSpacing(Layout.spacing.sm),
    },
    teamName: {
      fontWeight: 'bold',
      color: Colors.text,
      marginBottom: getSpacing(Layout.spacing.xs),
    },
    teamGame: {
      color: Colors.textSecondary,
    },
    teamBadges: {
      alignItems: 'flex-end',
    },
    badge: {
      paddingHorizontal: getSpacing(Layout.spacing.sm),
      paddingVertical: getSpacing(Layout.spacing.xs),
      borderRadius: Layout.borderRadius.sm,
    },
    badgeText: {
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    teamDescription: {
      color: Colors.textSecondary,
      lineHeight: 20,
      marginBottom: getSpacing(Layout.spacing.md),
    },
    teamStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: getSpacing(Layout.spacing.md),
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      color: Colors.textSecondary,
      marginLeft: getSpacing(Layout.spacing.xs),
    },
    teamFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    teamMembers: {
      flex: 1,
    },
    membersLabel: {
      color: Colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: getSpacing(Layout.spacing.xs),
    },
    captainName: {
      color: Colors.text,
      fontWeight: '600',
    },
    joinButton: {
      backgroundColor: Colors.crackzoneYellow + '20',
      paddingHorizontal: getSpacing(Layout.spacing.md),
      paddingVertical: getSpacing(Layout.spacing.sm),
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1,
      borderColor: Colors.crackzoneYellow,
    },
    joinButtonText: {
      color: Colors.crackzoneYellow,
      fontWeight: '600',
    },
    myTeamBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.success + '20',
      paddingHorizontal: getSpacing(Layout.spacing.md),
      paddingVertical: getSpacing(Layout.spacing.sm),
      borderRadius: Layout.borderRadius.md,
    },
    myTeamText: {
      color: Colors.success,
      fontWeight: '600',
      marginLeft: getSpacing(Layout.spacing.xs),
    },
    myTeamActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing(Layout.spacing.sm),
    },
    manageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.crackzoneYellow + '20',
      paddingHorizontal: getSpacing(Layout.spacing.sm),
      paddingVertical: getSpacing(Layout.spacing.xs),
      borderRadius: Layout.borderRadius.sm,
      gap: getSpacing(Layout.spacing.xs),
    },
    manageButtonText: {
      color: Colors.crackzoneYellow,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: getSpacing(Layout.spacing.xl * 2),
    },
    loadingText: {
      color: Colors.textSecondary,
      fontSize: getFontSize(16),
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: getSpacing(Layout.spacing.xl * 2),
      paddingHorizontal: getSpacing(Layout.spacing.lg),
    },
    emptyStateTitle: {
      fontSize: getFontSize(20),
      fontWeight: 'bold',
      color: Colors.textSecondary,
      marginTop: getSpacing(Layout.spacing.md),
      marginBottom: getSpacing(Layout.spacing.sm),
    },
    emptyStateText: {
      fontSize: getFontSize(16),
      color: Colors.textMuted,
      textAlign: 'center',
    },
  });

  if (loading) {
    return <TeamsSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Teams"
          showBackButton={false}
          rightIcon="add-circle-outline"
          onRightPress={() => setCreateTeamModalVisible(true)}
          showBorder={false}
        />

        {/* Subtitle */}
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
            Find and create gaming teams
          </Text>
        </View>

        {/* Search Bar */}
        {activeTab === 'available' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={getFontSize(20)} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search teams..."
              placeholderTextColor={Colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.name} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Team Button */}
        {activeTab === 'myTeams' && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTeam}>
            <Text style={styles.createButtonText}>Create New Team</Text>
          </TouchableOpacity>
        )}

        {/* Pending Join Requests */}
        {activeTab === 'myTeams' && pendingRequests.length > 0 && (
          <View style={styles.pendingRequestsContainer}>
            <Text style={styles.pendingRequestsTitle}>Pending Join Requests</Text>
            {pendingRequests.map((request) => (
              <View key={request.id} style={styles.pendingRequestCard}>
                <View style={styles.pendingRequestInfo}>
                  <Text style={styles.pendingRequestTeam}>{request.team_name}</Text>
                  <Text style={styles.pendingRequestGame}>{request.game}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelRequestButton}
                  onPress={() => handleCancelJoinRequest(request.id, request.team_name)}
                >
                  <Text style={styles.cancelRequestText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Teams List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.crackzoneYellow} />
          }
        >
          {filteredTeams.length > 0 ? (
            <View style={styles.teamsList}>
              {filteredTeams.map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  isMyTeam={activeTab === 'myTeams'} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={getFontSize(64)} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'myTeams' ? 'No Teams Yet' : 'No Teams Found'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'myTeams' 
                  ? 'Create your first team or join an existing one to get started!'
                  : searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'No teams available at the moment. Check back later!'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Create Team Modal */}
      <CreateTeamModal
        visible={createTeamModalVisible}
        onClose={() => setCreateTeamModalVisible(false)}
        onSuccess={handleCreateTeamSuccess}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        visible={teamManagementModalVisible}
        onClose={() => setTeamManagementModalVisible(false)}
        team={selectedTeam}
        onTeamUpdated={handleTeamUpdated}
        onTeamDeleted={handleTeamDeleted}
      />
    </SafeAreaView>
  );
}