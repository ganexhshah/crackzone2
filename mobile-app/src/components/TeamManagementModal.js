import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { teamsAPI } from '../services/api';

export default function TeamManagementModal({ visible, onClose, team, onTeamUpdated, onTeamDeleted }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [teamDetails, setTeamDetails] = useState(team);
  const [joinRequests, setJoinRequests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (visible && team) {
      setTeamDetails(team);
      setEditedName(team.name);
      setEditedDescription(team.description || '');
      if (team.role === 'leader') {
        fetchJoinRequests();
      }
    }
  }, [visible, team]);

  const fetchJoinRequests = async () => {
    try {
      const response = await teamsAPI.getJoinRequests(team.id);
      setJoinRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Team name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: editedName.trim(),
        description: editedDescription.trim(),
        game: teamDetails.game
      };

      await teamsAPI.update(teamDetails.id, updateData);
      
      const updatedTeam = {
        ...teamDetails,
        name: editedName.trim(),
        description: editedDescription.trim()
      };
      
      setTeamDetails(updatedTeam);
      setEditMode(false);
      onTeamUpdated(updatedTeam);
      Alert.alert('Success', 'Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${teamDetails.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await teamsAPI.delete(teamDetails.id);
              Alert.alert('Success', 'Team deleted successfully!');
              onTeamDeleted(teamDetails.id);
              onClose();
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete team');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      'Leave Team',
      `Are you sure you want to leave "${teamDetails.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await teamsAPI.leave(teamDetails.id);
              Alert.alert('Success', 'You have left the team successfully!');
              onTeamDeleted(teamDetails.id);
              onClose();
            } catch (error) {
              console.error('Error leaving team:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to leave team');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleJoinRequestAction = async (requestId, action, userName) => {
    setLoading(true);
    try {
      await teamsAPI.manageJoinRequest(teamDetails.id, requestId, action);
      Alert.alert('Success', `Join request ${action}d successfully!`);
      fetchJoinRequests(); // Refresh requests
      // Refresh team details to update member count
      const updatedTeam = { ...teamDetails, members: teamDetails.members + (action === 'approve' ? 1 : 0) };
      setTeamDetails(updatedTeam);
      onTeamUpdated(updatedTeam);
    } catch (error) {
      console.error(`Error ${action}ing join request:`, error);
      Alert.alert('Error', error.response?.data?.error || `Failed to ${action} join request`);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query = '') => {
    setSearchLoading(true);
    try {
      const response = await teamsAPI.searchUsers(teamDetails.id, { search: query });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load all users when modal opens and debounce search
  useEffect(() => {
    if (inviteModalVisible) {
      // Load all users when modal opens
      searchUsers('');
    }
  }, [inviteModalVisible]);

  // Debounce search function
  useEffect(() => {
    if (!inviteModalVisible) return;
    
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, inviteModalVisible]);

  const handleInviteUser = async (userId, username) => {
    setLoading(true);
    try {
      await teamsAPI.inviteUser(teamDetails.id, { userId });
      Alert.alert('Success', `Invitation sent to ${username}!`);
      setInviteModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error inviting user:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await teamsAPI.removeMember(teamDetails.id, memberId);
              Alert.alert('Success', `${memberName} has been removed from the team`);
              
              // Update team details
              const updatedTeam = {
                ...teamDetails,
                members: teamDetails.members - 1,
                membersList: teamDetails.membersList?.filter(member => member.id !== memberId)
              };
              setTeamDetails(updatedTeam);
              onTeamUpdated(updatedTeam);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'information-circle-outline' },
    { id: 'members', name: 'Members', icon: 'people-outline' },
    ...(teamDetails?.role === 'leader' ? [{ id: 'requests', name: 'Requests', icon: 'mail-outline', count: joinRequests.length }] : []),
    { id: 'settings', name: 'Settings', icon: 'settings-outline' }
  ];

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.teamHeader}>
        <Text style={styles.teamIcon}>{teamDetails?.avatar || '🎮'}</Text>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{teamDetails?.name}</Text>
          <Text style={styles.teamGame}>{teamDetails?.game}</Text>
        </View>
        <View style={styles.teamBadge}>
          <Text style={styles.badgeText}>{teamDetails?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamDetails?.members || 0}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamDetails?.wins || 0}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{teamDetails?.rank || 'Unranked'}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {teamDetails?.description || 'No description available'}
        </Text>
      </View>

      <View style={styles.teamCodeContainer}>
        <Text style={styles.sectionTitle}>Team Code</Text>
        <View style={styles.teamCodeBox}>
          <Text style={styles.teamCode}>{teamDetails?.teamCode || `T${teamDetails?.id?.toString().padStart(6, '0')}`}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color={Colors.crackzoneYellow} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMembers = () => (
    <View style={styles.tabContent}>
      <View style={styles.membersHeader}>
        <Text style={styles.sectionTitle}>Team Members ({teamDetails?.members || 0}/4)</Text>
        {teamDetails?.role === 'leader' && teamDetails?.members < 4 && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setInviteModalVisible(true)}
          >
            <Ionicons name="person-add-outline" size={20} color={Colors.crackzoneYellow} />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {teamDetails?.membersList?.map((member) => (
        <View key={member.id} style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
          </View>
          <View style={styles.memberActions}>
            <View style={styles.memberStatus}>
              <View style={[styles.statusDot, { backgroundColor: member.status === 'online' ? Colors.success : Colors.textMuted }]} />
              <Text style={styles.statusText}>{member.status}</Text>
            </View>
            {teamDetails?.role === 'leader' && member.role !== 'leader' && (
              <TouchableOpacity
                style={styles.removeMemberButton}
                onPress={() => handleRemoveMember(member.id, member.name)}
              >
                <Ionicons name="person-remove-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderRequests = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Join Requests ({joinRequests.length})</Text>
      {joinRequests.length > 0 ? (
        joinRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{request.username}</Text>
              <Text style={styles.requestMessage}>{request.message || 'No message'}</Text>
              <Text style={styles.requestDate}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleJoinRequestAction(request.id, 'approve', request.username)}
                disabled={loading}
              >
                <Ionicons name="checkmark" size={20} color={Colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleJoinRequestAction(request.id, 'reject', request.username)}
                disabled={loading}
              >
                <Ionicons name="close" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyStateText}>No pending join requests</Text>
        </View>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      {teamDetails?.role === 'leader' && (
        <>
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Team Information</Text>
            
            {editMode ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Team name"
                  placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                  style={[styles.editInput, styles.textArea]}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder="Team description"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelEditButton}
                    onPress={() => {
                      setEditMode(false);
                      setEditedName(teamDetails.name);
                      setEditedDescription(teamDetails.description || '');
                    }}
                  >
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveEditButton}
                    onPress={handleUpdateTeam}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.crackzoneBlack} size="small" />
                    ) : (
                      <Text style={styles.saveEditText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.settingItem} onPress={() => setEditMode(true)}>
                <Ionicons name="create-outline" size={24} color={Colors.crackzoneYellow} />
                <Text style={styles.settingText}>Edit Team Info</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteTeam}>
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
              <Text style={styles.dangerText}>Delete Team</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {teamDetails?.role === 'member' && (
        <View style={styles.settingSection}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleLeaveTeam}>
            <Ionicons name="exit-outline" size={24} color={Colors.error} />
            <Text style={styles.dangerText}>Leave Team</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'members':
        return renderMembers();
      case 'requests':
        return renderRequests();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderInviteModal = () => (
    <Modal visible={inviteModalVisible} transparent={true} animationType="slide">
      <View style={styles.inviteModalOverlay}>
        <View style={styles.inviteModalContent}>
          <View style={styles.inviteModalHeader}>
            <Text style={styles.inviteModalTitle}>Invite Members</Text>
            <TouchableOpacity
              style={styles.inviteModalClose}
              onPress={() => {
                setInviteModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inviteSearchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.inviteSearchInput}
              placeholder="Search users by username or see all users below..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.inviteResultsContainer}>
            {searchLoading ? (
              <View style={styles.inviteLoadingContainer}>
                <ActivityIndicator color={Colors.crackzoneYellow} size="large" />
                <Text style={styles.inviteLoadingText}>
                  {searchQuery ? 'Searching users...' : 'Loading users...'}
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <View key={user.id} style={styles.inviteUserCard}>
                  <View style={styles.inviteUserInfo}>
                    <Text style={styles.inviteUserName}>{user.username}</Text>
                    <Text style={styles.inviteUserGame}>{user.game || 'Free Fire'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.inviteUserButton}
                    onPress={() => handleInviteUser(user.id, user.username)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.crackzoneBlack} size="small" />
                    ) : (
                      <>
                        <Ionicons name="person-add-outline" size={16} color={Colors.crackzoneBlack} />
                        <Text style={styles.inviteUserButtonText}>Invite</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.inviteEmptyState}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.inviteEmptyText}>
                  {searchQuery ? 'No users found' : 'No available users'}
                </Text>
                <Text style={styles.inviteEmptySubtext}>
                  {searchQuery 
                    ? 'Try searching with a different username' 
                    : 'All users may already be in teams or invited'
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  if (!team) return null;

  return (
    <>
      {renderInviteModal()}
      
      <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Management</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={20} 
                    color={activeTab === tab.id ? Colors.crackzoneBlack : Colors.textSecondary} 
                  />
                  <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                    {tab.name}
                    {tab.count !== undefined && ` (${tab.count})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '90%',
    minHeight: '70%',
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
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Layout.spacing.sm,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  activeTab: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.sm,
    marginVertical: Layout.spacing.sm,
  },
  tabText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.crackzoneBlack,
  },
  scrollContent: {
    flex: 1,
  },
  tabContent: {
    padding: Layout.spacing.lg,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  teamIcon: {
    fontSize: 40,
    marginRight: Layout.spacing.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  teamGame: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  teamBadge: {
    backgroundColor: Colors.crackzoneYellow,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  badgeText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  statValue: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  descriptionContainer: {
    marginBottom: Layout.spacing.lg,
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  teamCodeContainer: {
    marginBottom: Layout.spacing.lg,
  },
  teamCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamCode: {
    flex: 1,
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: Layout.spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  memberRole: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  requestInfo: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  requestName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  requestMessage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  requestDate: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textMuted,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  approveButton: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
  },
  rejectButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginTop: Layout.spacing.md,
  },
  settingSection: {
    marginBottom: Layout.spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  settingText: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginLeft: Layout.spacing.md,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  dangerText: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    color: Colors.error,
    marginLeft: Layout.spacing.md,
  },
  editInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  cancelEditText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  saveEditButton: {
    flex: 1,
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  saveEditText: {
    fontSize: Layout.fontSize.md,
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.crackzoneYellow + '20',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  inviteButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.crackzoneYellow,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  removeMemberButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.xs,
  },
  inviteModalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 400,
  },
  inviteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inviteModalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  inviteModalClose: {
    padding: Layout.spacing.sm,
  },
  inviteSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inviteSearchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: Layout.fontSize.md,
    paddingVertical: Layout.spacing.md,
    marginLeft: Layout.spacing.sm,
  },
  inviteResultsContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },
  inviteLoadingContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  inviteLoadingText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
  },
  inviteUserCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inviteUserInfo: {
    flex: 1,
  },
  inviteUserName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  inviteUserGame: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  inviteUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  inviteUserButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.crackzoneBlack,
  },
  inviteEmptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  inviteEmptyText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  inviteEmptySubtext: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});