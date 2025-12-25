import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { teamsAPI } from '../services/api';

const GAMES = [
  { id: 'free_fire', name: 'Free Fire', icon: '🔥' },
  { id: 'pubg_mobile', name: 'PUBG Mobile', icon: '🎯' },
  { id: 'call_of_duty', name: 'Call of Duty Mobile', icon: '⚔️' },
  { id: 'valorant', name: 'Valorant', icon: '🎮' },
  { id: 'clash_royale', name: 'Clash Royale', icon: '👑' },
  { id: 'other', name: 'Other', icon: '🎲' },
];

export default function CreateTeamModal({ visible, onClose, onSuccess }) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const resetForm = () => {
    setTeamName('');
    setDescription('');
    setSelectedGame(null);
    setRequirements('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    console.log('Validating form with:', {
      teamName: teamName.trim(),
      selectedGame: selectedGame,
      description: description.trim(),
    });

    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return false;
    }

    if (teamName.trim().length < 3) {
      Alert.alert('Error', 'Team name must be at least 3 characters long');
      return false;
    }

    if (teamName.trim().length > 30) {
      Alert.alert('Error', 'Team name must be less than 30 characters');
      return false;
    }

    if (!selectedGame) {
      Alert.alert('Error', 'Please select a game');
      return false;
    }

    if (description.trim().length > 200) {
      Alert.alert('Error', 'Description must be less than 200 characters');
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const checkUserEligibility = async () => {
    setCheckingEligibility(true);
    try {
      // Check if user already has teams or pending requests
      const [myTeamsResponse] = await Promise.all([
        teamsAPI.getMyTeams(),
      ]);
      
      const myTeams = myTeamsResponse.data.teams || [];
      
      if (myTeams.length > 0) {
        Alert.alert(
          'Cannot Create Team',
          `You are already a member of "${myTeams[0].name}". Leave your current team before creating a new one.`,
          [{ text: 'OK', onPress: () => onClose() }]
        );
        return false;
      }
      
      // Check for pending join requests
      try {
        const pendingRequestsResponse = await teamsAPI.getMyJoinRequests();
        const pendingRequests = pendingRequestsResponse.data.requests || [];
        
        if (pendingRequests.length > 0) {
          const request = pendingRequests[0];
          Alert.alert(
            'Pending Join Request',
            `You have a pending join request for "${request.team_name}". You need to cancel it before creating a new team.`,
            [
              { text: 'Cancel Request', onPress: () => handleCancelJoinRequest(request.id) },
              { text: 'Keep Request', style: 'cancel', onPress: () => onClose() }
            ]
          );
          return false;
        }
      } catch (error) {
        // If the endpoint doesn't exist, we'll let the backend handle the validation
        console.log('Could not check pending requests, will let backend validate');
      }
      
      return true;
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      Alert.alert('Error', 'Failed to check team eligibility. Please try again.');
      return false;
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleCancelJoinRequest = async (requestId) => {
    try {
      await teamsAPI.cancelJoinRequest(requestId);
      Alert.alert('Success', 'Join request cancelled. You can now create a team.', [
        { text: 'OK', onPress: () => handleCreateTeam() }
      ]);
    } catch (error) {
      console.error('Error cancelling join request:', error);
      Alert.alert('Error', 'Failed to cancel join request. Please try again.');
    }
  };

  const handleCreateTeam = async () => {
    if (!validateForm()) return;

    // Check eligibility first
    const canCreate = await checkUserEligibility();
    if (!canCreate) return;

    setLoading(true);
    try {
      const teamData = {
        name: teamName.trim(),
        description: description.trim() || `${selectedGame.name} team looking for skilled players!`,
        game: selectedGame.id,
        requirements: requirements.trim() || 'Active players welcome',
        maxMembers: 4,
        isPrivate: false,
        avatar: selectedGame.icon
      };

      console.log('Creating team with data:', teamData);
      const response = await teamsAPI.create(teamData);
      console.log('Team created successfully:', response.data);
      
      Alert.alert(
        'Success!', 
        `Team "${teamName}" created successfully! You are now the team leader.`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onSuccess(response.data.team);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Create team error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || 'Failed to create team. Please try again.';
      
      // Handle specific error cases with better user guidance
      if (errorMessage.includes('pending join request')) {
        Alert.alert(
          'Cannot Create Team',
          errorMessage + '\n\nGo to the "Find Teams" tab to cancel your pending request, then try creating a team again.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('already a member')) {
        Alert.alert(
          'Cannot Create Team',
          errorMessage + '\n\nLeave your current team first, then try creating a new one.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('already created a team')) {
        Alert.alert(
          'Cannot Create Team',
          errorMessage + '\n\nDelete your existing team first, then try creating a new one.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const GameSelector = () => (
    <View style={styles.gameSelector}>
      <Text style={styles.sectionLabel}>Select Game *</Text>
      <View style={styles.gamesGrid}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[
              styles.gameCard,
              selectedGame?.id === game.id && styles.gameCardSelected
            ]}
            onPress={() => setSelectedGame(game)}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={[
              styles.gameName,
              selectedGame?.id === game.id && styles.gameNameSelected
            ]}>
              {game.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Team</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Team Name */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Team Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter team name (3-30 characters)"
                placeholderTextColor={Colors.textMuted}
                value={teamName}
                onChangeText={setTeamName}
                maxLength={30}
              />
              <Text style={styles.characterCount}>{teamName.length}/30</Text>
            </View>

            {/* Game Selection */}
            <GameSelector />

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your team and what you're looking for..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{description.length}/200</Text>
            </View>

            {/* Requirements */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Requirements (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Minimum rank, experience level..."
                placeholderTextColor={Colors.textMuted}
                value={requirements}
                onChangeText={setRequirements}
                maxLength={100}
              />
              <Text style={styles.characterCount}>{requirements.length}/100</Text>
            </View>

            {/* Team Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color={Colors.info} />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Team Information</Text>
                  <Text style={styles.infoDescription}>
                    • Maximum 4 members per team{'\n'}
                    • You will be the team leader{'\n'}
                    • You can invite players or accept join requests{'\n'}
                    • Only one team per player allowed
                  </Text>
                </View>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity 
              style={[styles.createButton, (loading || checkingEligibility) && styles.createButtonDisabled]} 
              onPress={handleCreateTeam}
              disabled={loading || checkingEligibility}
            >
              {(loading || checkingEligibility) ? (
                <ActivityIndicator color={Colors.crackzoneBlack} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color={Colors.crackzoneBlack} />
                  <Text style={styles.createButtonText}>
                    {checkingEligibility ? 'Checking...' : 'Create Team'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  scrollContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  inputSection: {
    marginBottom: Layout.spacing.lg,
  },
  sectionLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Layout.spacing.md,
  },
  characterCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  gameSelector: {
    marginBottom: Layout.spacing.lg,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  gameCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    minWidth: '30%',
    flex: 1,
  },
  gameCardSelected: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  gameIcon: {
    fontSize: 24,
    marginBottom: Layout.spacing.xs,
  },
  gameName: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  gameNameSelected: {
    color: Colors.crackzoneBlack,
  },
  infoSection: {
    marginBottom: Layout.spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.info + '40',
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
  infoTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  infoDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  cancelButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});