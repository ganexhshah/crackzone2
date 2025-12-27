import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import { AuthContext } from '../../contexts/AuthContext';
import { teamsAPI } from '../../services/api';

export default function TeamManagementScreen({ navigation, route }) {
  const { teamId } = route.params;
  const { getSpacing, getFontSize } = useResponsive();
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [team, setTeam] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  
  // Invite modal states
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamResponse, requestsResponse] = await Promise.all([
        teamsAPI.getDetails(teamId),
        teamsAPI.getJoinRequests(teamId).catch(() => ({ data: { requests: [] } }))
      ]);
      
      setTeam(teamResponse.data.team);
      setJoinRequests(requestsResponse.data.requests || []);
      setEditData({
        name: teamResponse.data.team.name,
        description: teamResponse.data.team.description || ''
      });
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      Alert.alert('Error', 'Failed to load team data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamData();
  };

  const handleUpdateTeam = async () => {
    if (!editData.name.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    try {
      await teamsAPI.update(teamId, {
        name: editData.name.trim(),
        description: editData.description.trim(),
        game: team.game
      });
      
      Alert.alert('Success', 'Team updated successfully');
      setEditMode(false);
      fetchTeamData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update team');
    }
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamsAPI.delete(teamId);
              Alert.alert('Success', 'Team deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete team');
            }
          }
        }
      ]
    );
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      'Leave Team',
      'Are you sure you want to leave this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamsAPI.leave(teamId);
              Alert.alert('Success', 'Left team successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to leave team');
            }
          }
        }
      ]
    );
  };

  const handleJoinRequest = async (requestId, action, username) => {
    const actionText = action === 'approve' ? 'approve' : 'reject';
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Request`,
      `Are you sure you want to ${actionText} ${username}'s join request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          onPress: async () => {
            try {
              await teamsAPI.manageJoinRequest(teamId, requestId, action);
              Alert.alert('Success', `Join request ${action}d successfully`);
              fetchTeamData();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || `Failed to ${actionText} request`);
            }
          }
        }
      ]
    );
  };

  const handleRemoveMember = (memberId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamsAPI.removeMember(teamId, memberId);
              Alert.alert('Success', 'Member removed successfully');
              fetchTeamData();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  const searchUsers = async (query = '') => {
    try {
      setSearchLoading(true);
      const response = await teamsAPI.searchUsers(teamId, { search: query });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Search users error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInviteUser = async (userId, username) => {
    try {
      await teamsAPI.inviteUser(teamId, { userId });
      Alert.alert('Success', `Invitation sent to ${username}`);
      setInviteModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send invitation');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'information-circle-outline' },
    { id: 'members', name: 'Members', icon: 'people-outline' },
    { id: 'requests', name: 'Requests', icon: 'mail-outline', count: joinRequests.length },
    { id: 'settings', name: 'Settings', icon: 'settings-outline' },
  ];

  const isLeader = team?.members?.find(m => m.id === user?.id)?.role === 'leader';

  if (loading || !team) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
          <ResponsiveHeader
            title="Team Management"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { fontSize: getFontSize(16) }]}>Loading team data...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <View style={[styles.tabContent, { padding: getSpacing(Layout.spacing.lg) }]}>
      {/* Team Info Card */}
      <View style={[styles.card, { padding: getSpacing(Layout.spacing.lg), marginBottom: getSpacing(Layout.spacing.lg) }]}>
        <View style={styles.teamHeader}>
          <View style={styles.teamAvatar}>
            <Text style={[styles.avatarText, { fontSize: getFontSize(24) }]}>🎮</Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={[styles.teamName, { fontSize: getFontSize(20) }]}>{team.name}</Text>
            <Text style={[styles.teamGame, { fontSize: getFontSize(14) }]}>{team.game}</Text>
            <View style={styles.roleBadge}>
              <Text style={[styles.roleText, { fontSize: getFontSize(12) }]}>
                {isLeader ? 'Team Leader' : 'Member'}
              </Text>
            </View>
          </View>
        </View>
        
        {team.description && (
          <Text style={[styles.teamDescription, { fontSize: getFontSize(14), marginTop: getSpacing(Layout.spacing.md) }]}>
            {team.description}
          </Text>
        )}
      </View>

      {/* Team Stats */}
      <View style={[styles.card, { padding: getSpacing(Layout.spacing.lg), marginBottom: getSpacing(Layout.spacing.lg) }]}>
        <Text style={[styles.cardTitle, { fontSize: getFontSize(16), marginBottom: getSpacing(Layout.spacing.md) }]}>
          Team Statistics
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={getFontSize(24)} color={Colors.crackzoneYellow} />
            <Text style={[styles.statValue, { fontSize: getFontSize(18) }]}>{team.members?.length || 0}/4</Text>
            <Text style={[styles.statLabel, { fontSize: getFontSize(12) }]}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={getFontSize(24)} color={Colors.success} />
            <Text style={[styles.statValue, { fontSize: getFontSize(18) }]}>{team.wins || 0}</Text>
            <Text style={[styles.statLabel, { fontSize: getFontSize(12) }]}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="close-circle" size={getFontSize(24)} color={Colors.error} />
            <Text style={[styles.statValue, { fontSize: getFontSize(18) }]}>{team.losses || 0}</Text>
            <Text style={[styles.statLabel, { fontSize: getFontSize(12) }]}>Losses</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="medal" size={getFontSize(24)} color={Colors.warning} />
            <Text style={[styles.statValue, { fontSize: getFontSize(18) }]}>{team.rank || 'Unranked'}</Text>
            <Text style={[styles.statLabel, { fontSize: getFontSize(12) }]}>Rank</Text>
          </View>
        </View>
      </View>

      {/* Team Code */}
      <View style={[styles.card, { padding: getSpacing(Layout.spacing.lg) }]}>
        <Text style={[styles.cardTitle, { fontSize: getFontSize(16), marginBottom: getSpacing(Layout.spacing.md) }]}>
          Team Code
        </Text>
        <View style={styles.teamCodeContainer}>
          <Text style={[styles.teamCode, { fontSize: getFontSize(18) }]}>{team.teamCode || `T${teamId.toString().padStart(6, '0')}`}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={getFontSize(20)} color={Colors.crackzoneYellow} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.teamCodeHint, { fontSize: getFontSize(12) }]}>
          Share this code with friends to help them find your team
        </Text>
      </View>
    </View>
  );

  const renderMembersTab = () => (
    <View style={[styles.tabContent, { padding: getSpacing(Layout.spacing.lg) }]}>
      {isLeader && (
        <TouchableOpacity
          style={[styles.inviteButton, { padding: getSpacing(Layout.spacing.md), marginBottom: getSpacing(Layout.spacing.lg) }]}
          onPress={() => {
            setInviteModalVisible(true);
            searchUsers(); // Load all users initially
          }}
        >
          <Ionicons name="person-add" size={getFontSize(20)} color={Colors.crackzoneBlack} />
          <Text style={[styles.inviteButtonText, { fontSize: getFontSize(16), marginLeft: getSpacing(Layout.spacing.sm) }]}>
            Invite Members
          </Text>
        </TouchableOpacity>
      )}

      {team.members?.map((member) => (
        <View key={member.id} style={[styles.memberCard, { padding: getSpacing(Layout.spacing.md), marginBottom: getSpacing(Layout.spacing.sm) }]}>
          <View style={styles.memberInfo}>
            <View style={styles.memberAvatar}>
              <Text style={[styles.memberAvatarText, { fontSize: getFontSize(16) }]}>
                {member.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.memberDetails}>
              <Text style={[styles.memberName, { fontSize: getFontSize(16) }]}>{member.username}</Text>
              <View style={styles.memberMeta}>
                <View style={[styles.memberRole, member.role === 'leader' && styles.leaderRole]}>
                  <Text style={[styles.memberRoleText, { fontSize: getFontSize(12) }, member.role === 'leader' && styles.leaderRoleText]}>
                    {member.role === 'leader' ? 'Leader' : 'Member'}
                  </Text>
                </View>
                <View style={[styles.memberStatus, styles.onlineStatus]}>
                  <Text style={[styles.memberStatusText, { fontSize: getFontSize(12) }]}>Online</Text>
                </View>
              </View>
            </View>
          </View>
          {isLeader && member.role !== 'leader' && (
            <TouchableOpacity
              style={styles.removeMemberButton}
              onPress={() => handleRemoveMember(member.id, member.username)}
            >
              <Ionicons name="person-remove" size={getFontSize(18)} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderRequestsTab = () => (
    <View style={[styles.tabContent, { padding: getSpacing(Layout.spacing.lg) }]}>
      {!isLeader ? (
        <View style={styles.noAccessContainer}>
          <Ionicons name="lock-closed-outline" size={getFontSize(48)} color={Colors.textMuted} />
          <Text style={[styles.noAccessText, { fontSize: getFontSize(16) }]}>
            Only team leaders can view join requests
          </Text>
        </View>
      ) : joinRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={getFontSize(48)} color={Colors.textMuted} />
          <Text style={[styles.emptyStateText, { fontSize: getFontSize(16) }]}>
            No pending join requests
          </Text>
        </View>
      ) : (
        joinRequests.map((request) => (
          <View key={request.id} style={[styles.requestCard, { padding: getSpacing(Layout.spacing.md), marginBottom: getSpacing(Layout.spacing.sm) }]}>
            <View style={styles.requestInfo}>
              <Text style={[styles.requestUsername, { fontSize: getFontSize(16) }]}>{request.username}</Text>
              {request.message && (
                <Text style={[styles.requestMessage, { fontSize: getFontSize(14) }]}>{request.message}</Text>
              )}
              <Text style={[styles.requestDate, { fontSize: getFontSize(12) }]}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.approveButton, { padding: getSpacing(Layout.spacing.sm) }]}
                onPress={() => handleJoinRequest(request.id, 'approve', request.username)}
              >
                <Ionicons name="checkmark" size={getFontSize(18)} color={Colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, { padding: getSpacing(Layout.spacing.sm) }]}
                onPress={() => handleJoinRequest(request.id, 'reject', request.username)}
              >
                <Ionicons name="close" size={getFontSize(18)} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSettingsTab = () => (
    <View style={[styles.tabContent, { padding: getSpacing(Layout.spacing.lg) }]}>
      {isLeader ? (
        <>
          {/* Edit Team Info */}
          <View style={[styles.card, { padding: getSpacing(Layout.spacing.lg), marginBottom: getSpacing(Layout.spacing.lg) }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { fontSize: getFontSize(16) }]}>Team Information</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditMode(!editMode)}
              >
                <Ionicons name={editMode ? "close" : "pencil"} size={getFontSize(18)} color={Colors.crackzoneYellow} />
              </TouchableOpacity>
            </View>
            
            {editMode ? (
              <>
                <TextInput
                  style={[styles.input, { fontSize: getFontSize(16), padding: getSpacing(Layout.spacing.md) }]}
                  placeholder="Team Name"
                  placeholderTextColor={Colors.textMuted}
                  value={editData.name}
                  onChangeText={(text) => setEditData({...editData, name: text})}
                />
                <TextInput
                  style={[styles.input, styles.textArea, { fontSize: getFontSize(16), padding: getSpacing(Layout.spacing.md) }]}
                  placeholder="Team Description"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={editData.description}
                  onChangeText={(text) => setEditData({...editData, description: text})}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.saveButton, { padding: getSpacing(Layout.spacing.md) }]}
                    onPress={handleUpdateTeam}
                  >
                    <Text style={[styles.saveButtonText, { fontSize: getFontSize(14) }]}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.settingValue, { fontSize: getFontSize(16) }]}>{team.name}</Text>
                <Text style={[styles.settingValue, { fontSize: getFontSize(14) }]}>{team.description || 'No description'}</Text>
              </>
            )}
          </View>

          {/* Danger Zone */}
          <View style={[styles.dangerCard, { padding: getSpacing(Layout.spacing.lg) }]}>
            <Text style={[styles.dangerTitle, { fontSize: getFontSize(16), marginBottom: getSpacing(Layout.spacing.md) }]}>
              Danger Zone
            </Text>
            <TouchableOpacity
              style={[styles.dangerButton, { padding: getSpacing(Layout.spacing.md) }]}
              onPress={handleDeleteTeam}
            >
              <Ionicons name="trash-outline" size={getFontSize(18)} color={Colors.error} />
              <Text style={[styles.dangerButtonText, { fontSize: getFontSize(14), marginLeft: getSpacing(Layout.spacing.sm) }]}>
                Delete Team
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={[styles.card, { padding: getSpacing(Layout.spacing.lg) }]}>
          <Text style={[styles.cardTitle, { fontSize: getFontSize(16), marginBottom: getSpacing(Layout.spacing.md) }]}>
            Member Actions
          </Text>
          <TouchableOpacity
            style={[styles.leaveButton, { padding: getSpacing(Layout.spacing.md) }]}
            onPress={handleLeaveTeam}
          >
            <Ionicons name="exit-outline" size={getFontSize(18)} color={Colors.error} />
            <Text style={[styles.leaveButtonText, { fontSize: getFontSize(14), marginLeft: getSpacing(Layout.spacing.sm) }]}>
              Leave Team
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderInviteModal = () => (
    <Modal
      visible={inviteModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.modalGradient}>
          <View style={[styles.modalHeader, { padding: getSpacing(Layout.spacing.lg) }]}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(18) }]}>Invite Members</Text>
            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
              <Ionicons name="close" size={getFontSize(24)} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.searchContainer, { paddingHorizontal: getSpacing(Layout.spacing.lg) }]}>
            <TextInput
              style={[styles.searchInput, { fontSize: getFontSize(16), padding: getSpacing(Layout.spacing.md) }]}
              placeholder="Search users..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
            />
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            style={styles.usersList}
            contentContainerStyle={{ padding: getSpacing(Layout.spacing.lg) }}
            renderItem={({ item }) => (
              <View style={[styles.userItem, { padding: getSpacing(Layout.spacing.md) }]}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={[styles.userAvatarText, { fontSize: getFontSize(16) }]}>
                      {item.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={[styles.username, { fontSize: getFontSize(16) }]}>{item.username}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.inviteUserButton, { padding: getSpacing(Layout.spacing.sm) }]}
                  onPress={() => handleInviteUser(item.id, item.username)}
                >
                  <Text style={[styles.inviteUserButtonText, { fontSize: getFontSize(14) }]}>Invite</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyUsers}>
                <Text style={[styles.emptyUsersText, { fontSize: getFontSize(16) }]}>
                  {searchLoading ? 'Searching...' : 'No users found'}
                </Text>
              </View>
            )}
          />
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
        <ResponsiveHeader
          title="Team Management"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        {/* Tabs */}
        <View style={[styles.tabsContainer, { paddingHorizontal: getSpacing(Layout.spacing.lg) }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  { paddingHorizontal: getSpacing(Layout.spacing.md), paddingVertical: getSpacing(Layout.spacing.sm) },
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={getFontSize(18)} 
                  color={activeTab === tab.id ? Colors.crackzoneBlack : Colors.textSecondary} 
                />
                <Text style={[
                  styles.tabText,
                  { fontSize: getFontSize(14), marginLeft: getSpacing(Layout.spacing.xs) },
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.name}
                  {tab.count > 0 && ` (${tab.count})`}
                </Text>
              </TouchableOpacity>
            ))}
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
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'requests' && renderRequestsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </ScrollView>

        {renderInviteModal()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  tabsContainer: {
    marginBottom: Layout.spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    marginRight: Layout.spacing.sm,
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
  scrollView: {
    flex: 1,
  },
  tabContent: {
    // Dynamic padding applied via responsive hook
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  cardTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  editButton: {
    padding: Layout.spacing.xs,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  avatarText: {
    color: Colors.crackzoneYellow,
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
    marginBottom: Layout.spacing.sm,
  },
  roleBadge: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  roleText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  teamDescription: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: Colors.text,
    fontWeight: 'bold',
    marginTop: Layout.spacing.xs,
  },
  statLabel: {
    color: Colors.textMuted,
    marginTop: Layout.spacing.xs,
  },
  teamCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  teamCode: {
    color: Colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  copyButton: {
    padding: Layout.spacing.xs,
  },
  teamCodeHint: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  memberCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  memberAvatarText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRole: {
    backgroundColor: Colors.textMuted + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  leaderRole: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  memberRoleText: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  leaderRoleText: {
    color: Colors.crackzoneYellow,
  },
  memberStatus: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  onlineStatus: {
    backgroundColor: Colors.success + '20',
  },
  memberStatusText: {
    color: Colors.success,
    fontWeight: '500',
  },
  removeMemberButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.error + '20',
  },
  noAccessContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  noAccessText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestUsername: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  requestMessage: {
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  requestDate: {
    color: Colors.textMuted,
  },
  requestActions: {
    flexDirection: 'row',
  },
  approveButton: {
    backgroundColor: Colors.success + '20',
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
  },
  rejectButton: {
    backgroundColor: Colors.error + '20',
    borderRadius: Layout.borderRadius.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    minWidth: 120,
  },
  saveButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  settingValue: {
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  dangerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  dangerTitle: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: Colors.error + '20',
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerButtonText: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: Colors.error + '20',
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  leaveButtonText: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingVertical: Layout.spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.crackzoneYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  userAvatarText: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
  username: {
    color: Colors.text,
    fontWeight: '600',
  },
  inviteUserButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
    minWidth: 60,
    alignItems: 'center',
  },
  inviteUserButtonText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  emptyUsers: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyUsersText: {
    color: Colors.textMuted,
  },
});