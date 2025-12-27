import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import TeamsSkeleton from '../../components/skeletons/TeamsSkeleton';
import { teamsAPI } from '../../services/api';

export default function TeamsScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('myTeams');
  const [myTeams, setMyTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [dataLoaded, setDataLoaded] = useState({
    myTeams: false,
    available: false
  });
  const [lastFetchTime, setLastFetchTime] = useState({
    myTeams: 0,
    available: 0
  });

  // Minimum time between requests (5 seconds)
  const MIN_FETCH_INTERVAL = 5000;

  useEffect(() => {
    // Only fetch data on initial load
    fetchInitialData();
  }, []);

  // Add navigation listener to refresh data when returning from team management
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only refresh if we've been away for more than 30 seconds and have loaded data before
      const now = Date.now();
      const timeSinceLastFetch = Math.min(
        now - lastFetchTime.myTeams,
        now - lastFetchTime.available
      );
      
      if (timeSinceLastFetch > 30000 && (dataLoaded.myTeams || dataLoaded.available)) {
        console.log('Refreshing data after returning to screen');
        if (activeTab === 'myTeams' && dataLoaded.myTeams) {
          fetchMyTeamsData(true);
        } else if (activeTab === 'available' && dataLoaded.available) {
          fetchAvailableTeamsData(true);
        }
      }
    });

    return unsubscribe;
  }, [navigation, activeTab, dataLoaded, lastFetchTime]);

  useEffect(() => {
    // Fetch data for tab if not already loaded
    if (activeTab === 'myTeams' && !dataLoaded.myTeams) {
      fetchMyTeamsData();
    } else if (activeTab === 'available' && !dataLoaded.available) {
      fetchAvailableTeamsData();
    }
  }, [activeTab, dataLoaded]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Load My Teams data first since it's the default tab
      await fetchMyTeamsData();
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      Alert.alert('Error', 'Failed to load teams data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeamsData = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime.myTeams < MIN_FETCH_INTERVAL) {
      console.log('Skipping my teams fetch - too soon');
      return;
    }

    try {
      const [teamsResponse, requestsResponse] = await Promise.all([
        teamsAPI.getMyTeams(),
        teamsAPI.getMyJoinRequests().catch(() => ({ data: { requests: [] } }))
      ]);
      setMyTeams(teamsResponse.data.teams || []);
      setPendingRequests(requestsResponse.data.requests || []);
      setDataLoaded(prev => ({ ...prev, myTeams: true }));
      setLastFetchTime(prev => ({ ...prev, myTeams: now }));
    } catch (error) {
      console.error('Failed to fetch my teams:', error);
      if (error.response?.status === 429) {
        Alert.alert('Rate Limited', 'Please wait a moment before refreshing again.');
      } else {
        throw error;
      }
    }
  };

  const fetchAvailableTeamsData = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime.available < MIN_FETCH_INTERVAL) {
      console.log('Skipping available teams fetch - too soon');
      return;
    }

    try {
      const response = await teamsAPI.getAvailable();
      setAvailableTeams(response.data.teams || []);
      setDataLoaded(prev => ({ ...prev, available: true }));
      setLastFetchTime(prev => ({ ...prev, available: now }));
    } catch (error) {
      console.error('Failed to fetch available teams:', error);
      if (error.response?.status === 429) {
        Alert.alert('Rate Limited', 'Please wait a moment before refreshing again.');
      } else {
        throw error;
      }
    }
  };

  const fetchTeamsData = async (force = false) => {
    try {
      if (activeTab === 'myTeams') {
        await fetchMyTeamsData(force);
      } else {
        await fetchAvailableTeamsData(force);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      if (error.response?.status !== 429) {
        Alert.alert('Error', 'Failed to load teams data');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamsData(true); // Force refresh when user manually pulls to refresh
  };

  const handleJoinTeam = async (teamId, teamName) => {
    try {
      Alert.alert(
        'Join Team',
        `Do you want to send a join request to ${teamName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: async () => {
              try {
                await teamsAPI.join(teamId, { message: 'I would like to join your team!' });
                Alert.alert('Success', 'Join request sent successfully!');
                // Refresh both tabs data since join request affects both
                await Promise.all([
                  fetchMyTeamsData(true),
                  fetchAvailableTeamsData(true)
                ]);
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
                // Refresh both tabs data since cancelling affects both
                await Promise.all([
                  fetchMyTeamsData(true),
                  fetchAvailableTeamsData(true)
                ]);
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

  const TeamCard = ({ team, isMyTeam = false }) => (
    <View style={[
      styles.teamCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={[
            styles.teamName,
            { fontSize: getFontSize(18) }
          ]}>
            {team.name}
          </Text>
          <Text style={[
            styles.teamGame,
            { fontSize: getFontSize(14) }
          ]}>
            {team.game}
          </Text>
        </View>
        {isMyTeam && team.role === 'leader' && (
          <View style={styles.captainBadge}>
            <Text style={[
              styles.captainText,
              { fontSize: getFontSize(12) }
            ]}>
              Captain
            </Text>
          </View>
        )}
      </View>

      {team.description && (
        <Text style={[
          styles.teamDescription,
          { 
            fontSize: getFontSize(14),
            marginBottom: getSpacing(Layout.spacing.sm),
          }
        ]}>
          {team.description}
        </Text>
      )}

      <View style={styles.teamStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={getFontSize(16)} color={Colors.textSecondary} />
          <Text style={[
            styles.statText,
            { fontSize: getFontSize(14) }
          ]}>
            {team.members}/{team.maxMembers || 4} Members
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={getFontSize(16)} color={Colors.crackzoneYellow} />
          <Text style={[
            styles.statText,
            { fontSize: getFontSize(14) }
          ]}>
            {team.wins || 0} Wins
          </Text>
        </View>
      </View>

      {!isMyTeam ? (
        <View style={styles.teamFooter}>
          <Text style={[
            styles.captainLabel,
            { fontSize: getFontSize(12) }
          ]}>
            Looking for players
          </Text>
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinTeam(team.id, team.name)}
            disabled={team.has_pending_request}
          >
            <Text style={[
              styles.joinButtonText,
              { fontSize: getFontSize(14) }
            ]}>
              {team.has_pending_request ? 'Request Sent' : 'Join Team'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.teamFooter}>
          <Text style={[
            styles.captainLabel,
            { fontSize: getFontSize(12) }
          ]}>
            Role: {team.role}
          </Text>
          <View style={styles.teamActions}>
            <TouchableOpacity
              style={[styles.manageButton, { padding: getSpacing(Layout.spacing.sm) }]}
              onPress={() => navigation.navigate('TeamManagement', { teamId: team.id })}
            >
              <Ionicons name="settings-outline" size={getFontSize(16)} color={Colors.crackzoneYellow} />
              <Text style={[
                styles.manageButtonText,
                { 
                  fontSize: getFontSize(12),
                  marginLeft: getSpacing(Layout.spacing.xs),
                }
              ]}>
                Manage
              </Text>
            </TouchableOpacity>
            <View style={styles.myTeamBadge}>
              <Ionicons name="checkmark-circle" size={getFontSize(16)} color={Colors.success} />
              <Text style={[
                styles.myTeamText,
                { 
                  fontSize: getFontSize(12),
                  marginLeft: getSpacing(Layout.spacing.xs),
                }
              ]}>
                My Team
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const PendingRequestCard = ({ request }) => (
    <View style={[
      styles.pendingRequestCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.sm),
      }
    ]}>
      <View style={styles.pendingRequestInfo}>
        <Text style={[
          styles.pendingRequestTeam,
          { 
            fontSize: getFontSize(16),
            marginBottom: getSpacing(Layout.spacing.xs),
          }
        ]}>
          {request.team_name}
        </Text>
        <Text style={[
          styles.pendingRequestGame,
          { fontSize: getFontSize(14) }
        ]}>
          {request.game}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cancelRequestButton}
        onPress={() => handleCancelJoinRequest(request.id, request.team_name)}
      >
        <Text style={[
          styles.cancelRequestText,
          { fontSize: getFontSize(14) }
        ]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );

  const tabs = [
    { id: 'myTeams', name: 'My Teams', count: myTeams.length },
    { id: 'available', name: 'Find Teams', count: availableTeams.length },
  ];

  const currentTeams = activeTab === 'myTeams' ? myTeams : availableTeams;
  const isCurrentTabLoaded = activeTab === 'myTeams' ? dataLoaded.myTeams : dataLoaded.available;

  if (loading) {
    return <TeamsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Teams"
          showBackButton={false}
          rightIcon="add-circle-outline"
          onRightPress={() => navigation.navigate('CreateTeam')}
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
            Find and create gaming teams
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

        {/* Create Team Button */}
        {activeTab === 'myTeams' && (
          <TouchableOpacity 
            style={[
              styles.createButton,
              {
                marginHorizontal: getSpacing(Layout.spacing.lg),
                padding: getSpacing(Layout.spacing.md),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}
            onPress={() => navigation.navigate('CreateTeam')}
          >
            <Ionicons name="add-circle" size={getFontSize(20)} color={Colors.crackzoneBlack} />
            <Text style={[
              styles.createButtonText,
              { 
                fontSize: getFontSize(16),
                marginLeft: getSpacing(Layout.spacing.sm),
              }
            ]}>
              Create New Team
            </Text>
          </TouchableOpacity>
        )}

        {/* Pending Join Requests */}
        {activeTab === 'myTeams' && pendingRequests.length > 0 && (
          <View style={[
            styles.pendingRequestsContainer,
            {
              marginHorizontal: getSpacing(Layout.spacing.lg),
              marginBottom: getSpacing(Layout.spacing.lg),
            }
          ]}>
            <Text style={[
              styles.pendingRequestsTitle,
              { 
                fontSize: getFontSize(16),
                marginBottom: getSpacing(Layout.spacing.sm),
              }
            ]}>
              Pending Join Requests
            </Text>
            {pendingRequests.map((request) => (
              <PendingRequestCard key={request.id} request={request} />
            ))}
          </View>
        )}

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
            styles.teamsList,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {!isCurrentTabLoaded ? (
              <TeamsSkeleton />
            ) : currentTeams.length > 0 ? (
              currentTeams.map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  isMyTeam={activeTab === 'myTeams'} 
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={getFontSize(64)} color={Colors.textMuted} />
                <Text style={[
                  styles.emptyStateTitle,
                  { 
                    fontSize: getFontSize(20),
                    marginTop: getSpacing(Layout.spacing.md),
                    marginBottom: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  {activeTab === 'myTeams' ? 'No Teams Yet' : 'No Teams Found'}
                </Text>
                <Text style={[
                  styles.emptyStateText,
                  { fontSize: getFontSize(16) }
                ]}>
                  {activeTab === 'myTeams' 
                    ? 'Create your first team or join an existing one!'
                    : 'No teams available at the moment.'
                  }
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
  createButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  teamsList: {
    // Dynamic padding applied via responsive hook
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
    marginBottom: Layout.spacing.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  teamGame: {
    color: Colors.textSecondary,
  },
  teamDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  captainBadge: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  captainText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
  },
  teamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  captainLabel: {
    color: Colors.textMuted,
    flex: 1,
  },
  joinButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  joinButtonText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  teamActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  manageButtonText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  myTeamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  myTeamText: {
    color: Colors.success,
    fontWeight: '600',
  },
  pendingRequestsContainer: {
    // Dynamic margin applied via responsive hook
  },
  pendingRequestsTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  pendingRequestCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingRequestInfo: {
    flex: 1,
  },
  pendingRequestTeam: {
    color: Colors.text,
    fontWeight: '600',
  },
  pendingRequestGame: {
    color: Colors.textSecondary,
  },
  cancelRequestButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  cancelRequestText: {
    color: Colors.error,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateTitle: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyStateText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
});