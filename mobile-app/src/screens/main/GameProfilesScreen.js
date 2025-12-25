import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import LoadingScreen from '../../components/LoadingScreen';

const GAMES = [
  { name: 'FreeFire', icon: 'flame', color: Colors.error },
  { name: 'PUBG Mobile', icon: 'rifle', color: Colors.warning },
  { name: 'Call of Duty Mobile', icon: 'skull', color: Colors.info },
  { name: 'Valorant', icon: 'flash', color: Colors.success },
  { name: 'CS:GO', icon: 'nuclear', color: Colors.crackzoneYellow },
  { name: 'Fortnite', icon: 'construct', color: Colors.primary },
  { name: 'Apex Legends', icon: 'triangle', color: Colors.error },
  { name: 'League of Legends', icon: 'diamond', color: Colors.info }
];

export default function GameProfilesScreen({ navigation }) {
  const [gameProfiles, setGameProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({
    game: '',
    gameUid: '',
    gameUsername: ''
  });

  useEffect(() => {
    fetchGameProfiles();
  }, []);

  const fetchGameProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      setGameProfiles(response.data.gameProfiles || []);
    } catch (error) {
      console.error('Failed to fetch game profiles:', error);
      Alert.alert('Error', 'Failed to load game profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = async () => {
    if (!newProfile.game || !newProfile.gameUid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.updateProfile({
        favoriteGame: newProfile.game,
        gameId: newProfile.gameUid
      });

      setShowAddModal(false);
      setNewProfile({ game: '', gameUid: '', gameUsername: '' });
      fetchGameProfiles();
      Alert.alert('Success', 'Game profile added successfully');
    } catch (error) {
      console.error('Failed to add game profile:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add game profile');
    } finally {
      setSaving(false);
    }
  };

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Loading game profiles..." />;
  }

  const handleDeleteProfile = (game) => {
    Alert.alert(
      'Delete Game Profile',
      `Are you sure you want to delete your ${game} profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteProfile(game)
        }
      ]
    );
  };

  const deleteProfile = async (game) => {
    // This would need a delete endpoint in the backend
    Alert.alert('Coming Soon', 'Delete functionality will be available soon');
  };

  const getGameIcon = (gameName) => {
    const game = GAMES.find(g => g.name === gameName);
    return game ? game.icon : 'game-controller';
  };

  const getGameColor = (gameName) => {
    const game = GAMES.find(g => g.name === gameName);
    return game ? game.color : Colors.textSecondary;
  };

  const GameProfileCard = ({ profile }) => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.gameInfo}>
          <View style={[styles.gameIcon, { backgroundColor: getGameColor(profile.game) + '20' }]}>
            <Ionicons 
              name={getGameIcon(profile.game)} 
              size={24} 
              color={getGameColor(profile.game)} 
            />
          </View>
          <View style={styles.gameDetails}>
            <Text style={styles.gameName}>{profile.game}</Text>
            <Text style={styles.gameUid}>ID: {profile.game_uid}</Text>
            {profile.game_username && (
              <Text style={styles.gameUsername}>@{profile.game_username}</Text>
            )}
          </View>
        </View>
        <View style={styles.profileActions}>
          {profile.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteProfile(profile.game)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const AddProfileModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
          style={styles.modalGradient}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Game Profile</Text>
            <TouchableOpacity onPress={handleAddProfile} disabled={saving}>
              <Text style={[styles.modalSaveText, saving && styles.modalSaveTextDisabled]}>
                {saving ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Game Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select Game</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.gameSelector}>
                  {GAMES.map((game) => (
                    <TouchableOpacity
                      key={game.name}
                      style={[
                        styles.gameOption,
                        newProfile.game === game.name && styles.gameOptionSelected,
                        { borderColor: game.color }
                      ]}
                      onPress={() => setNewProfile(prev => ({ ...prev, game: game.name }))}
                    >
                      <View style={[styles.gameOptionIcon, { backgroundColor: game.color + '20' }]}>
                        <Ionicons name={game.icon} size={20} color={game.color} />
                      </View>
                      <Text style={[
                        styles.gameOptionText,
                        newProfile.game === game.name && { color: game.color }
                      ]}>
                        {game.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Game ID Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {newProfile.game ? `${newProfile.game} ID` : 'Game ID'} *
              </Text>
              <TextInput
                style={styles.input}
                value={newProfile.gameUid}
                onChangeText={(text) => setNewProfile(prev => ({ ...prev, gameUid: text }))}
                placeholder={newProfile.game ? `Enter your ${newProfile.game} ID` : 'Enter your game ID'}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Username Input (Optional) */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {newProfile.game ? `${newProfile.game} Username` : 'Game Username'} (Optional)
              </Text>
              <TextInput
                style={styles.input}
                value={newProfile.gameUsername}
                onChangeText={(text) => setNewProfile(prev => ({ ...prev, gameUsername: text }))}
                placeholder="Enter your in-game username"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Profiles</Text>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={Colors.crackzoneYellow} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {gameProfiles.length > 0 ? (
            <View style={styles.profilesList}>
              {gameProfiles.map((profile, index) => (
                <GameProfileCard key={index} profile={profile} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="game-controller-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Game Profiles</Text>
              <Text style={styles.emptyStateText}>
                Add your gaming accounts to showcase your skills
              </Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <AddProfileModal />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Layout.spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  profilesList: {
    padding: Layout.spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gameIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  gameUid: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  gameUsername: {
    fontSize: 14,
    color: Colors.crackzoneYellow,
  },
  profileActions: {
    alignItems: 'flex-end',
  },
  primaryBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.sm,
  },
  primaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  deleteButton: {
    padding: Layout.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.xl * 2,
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
    marginBottom: Layout.spacing.xl,
  },
  addFirstButton: {
    backgroundColor: Colors.crackzoneYellow,
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  addFirstButtonText: {
    color: Colors.crackzoneBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.crackzoneYellow,
  },
  modalSaveTextDisabled: {
    color: Colors.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  inputSection: {
    marginBottom: Layout.spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameSelector: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.sm,
  },
  gameOption: {
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginRight: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    minWidth: 100,
  },
  gameOptionSelected: {
    backgroundColor: Colors.surface,
  },
  gameOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  gameOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});