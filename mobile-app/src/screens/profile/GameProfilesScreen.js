import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function GameProfilesScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [gameProfiles, setGameProfiles] = useState([
    { id: 1, game: 'FreeFire', gameId: '123456789', isPrimary: true },
    { id: 2, game: 'PUBG Mobile', gameId: '987654321', isPrimary: false },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ game: 'FreeFire', gameId: '' });

  const handleAddProfile = () => {
    if (!newProfile.gameId.trim()) {
      Alert.alert('Error', 'Please enter a valid Game ID');
      return;
    }
    
    const profile = {
      id: Date.now(),
      game: newProfile.game,
      gameId: newProfile.gameId,
      isPrimary: gameProfiles.length === 0,
    };
    
    setGameProfiles([...gameProfiles, profile]);
    setNewProfile({ game: 'FreeFire', gameId: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Game profile added successfully!');
  };

  const handleSetPrimary = (profileId) => {
    setGameProfiles(profiles =>
      profiles.map(profile => ({
        ...profile,
        isPrimary: profile.id === profileId
      }))
    );
    Alert.alert('Success', 'Primary game profile updated!');
  };

  const handleDeleteProfile = (profileId) => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete this game profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGameProfiles(profiles => profiles.filter(p => p.id !== profileId));
          }
        }
      ]
    );
  };

  const GameProfileCard = ({ profile }) => (
    <View style={[
      styles.profileCard,
      {
        padding: getSpacing(Layout.spacing.md),
        marginBottom: getSpacing(Layout.spacing.md),
      }
    ]}>
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Text style={[
            styles.gameName,
            { fontSize: getFontSize(16) }
          ]}>
            {profile.game}
          </Text>
          <Text style={[
            styles.gameId,
            { fontSize: getFontSize(14) }
          ]}>
            ID: {profile.gameId}
          </Text>
        </View>
        {profile.isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={[
              styles.primaryText,
              { fontSize: getFontSize(12) }
            ]}>
              Primary
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.profileActions}>
        {!profile.isPrimary && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { padding: getSpacing(Layout.spacing.sm) }
            ]}
            onPress={() => handleSetPrimary(profile.id)}
          >
            <Text style={[
              styles.primaryButtonText,
              { fontSize: getFontSize(12) }
            ]}>
              Set Primary
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            { padding: getSpacing(Layout.spacing.sm) }
          ]}
          onPress={() => handleDeleteProfile(profile.id)}
        >
          <Ionicons name="trash-outline" size={getFontSize(16)} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Game Profiles"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon="add-circle-outline"
          onRightPress={() => setShowAddForm(!showAddForm)}
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
            Manage your gaming accounts
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* Add Profile Form */}
            {showAddForm && (
              <View style={[
                styles.addForm,
                {
                  padding: getSpacing(Layout.spacing.lg),
                  marginBottom: getSpacing(Layout.spacing.lg),
                }
              ]}>
                <Text style={[
                  styles.formTitle,
                  { 
                    fontSize: getFontSize(18),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  Add Game Profile
                </Text>
                
                <View style={[
                  styles.formField,
                  { marginBottom: getSpacing(Layout.spacing.md) }
                ]}>
                  <Text style={[
                    styles.fieldLabel,
                    { fontSize: getFontSize(14) }
                  ]}>
                    Game
                  </Text>
                  <View style={styles.gameSelector}>
                    {['FreeFire', 'PUBG Mobile', 'Call of Duty', 'Mobile Legends'].map((game) => (
                      <TouchableOpacity
                        key={game}
                        style={[
                          styles.gameOption,
                          {
                            padding: getSpacing(Layout.spacing.sm),
                            marginRight: getSpacing(Layout.spacing.sm),
                            marginBottom: getSpacing(Layout.spacing.sm),
                          },
                          newProfile.game === game && styles.selectedGameOption
                        ]}
                        onPress={() => setNewProfile({...newProfile, game})}
                      >
                        <Text style={[
                          styles.gameOptionText,
                          { fontSize: getFontSize(14) },
                          newProfile.game === game && styles.selectedGameOptionText
                        ]}>
                          {game}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[
                  styles.formField,
                  { marginBottom: getSpacing(Layout.spacing.md) }
                ]}>
                  <Text style={[
                    styles.fieldLabel,
                    { fontSize: getFontSize(14) }
                  ]}>
                    Game ID
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        padding: getSpacing(Layout.spacing.md),
                        fontSize: getFontSize(16),
                      }
                    ]}
                    value={newProfile.gameId}
                    onChangeText={(text) => setNewProfile({...newProfile, gameId: text})}
                    placeholder="Enter your game ID"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { padding: getSpacing(Layout.spacing.md) }
                    ]}
                    onPress={() => {
                      setShowAddForm(false);
                      setNewProfile({ game: 'FreeFire', gameId: '' });
                    }}
                  >
                    <Text style={[
                      styles.cancelButtonText,
                      { fontSize: getFontSize(14) }
                    ]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      { padding: getSpacing(Layout.spacing.md) }
                    ]}
                    onPress={handleAddProfile}
                  >
                    <Text style={[
                      styles.addButtonText,
                      { fontSize: getFontSize(14) }
                    ]}>
                      Add Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Game Profiles List */}
            <View style={styles.profilesList}>
              <Text style={[
                styles.sectionTitle,
                { 
                  fontSize: getFontSize(18),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                Your Game Profiles
              </Text>
              
              {gameProfiles.length > 0 ? (
                gameProfiles.map((profile) => (
                  <GameProfileCard key={profile.id} profile={profile} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="game-controller-outline" size={getFontSize(48)} color={Colors.textMuted} />
                  <Text style={[
                    styles.emptyStateText,
                    { 
                      fontSize: getFontSize(16),
                      marginTop: getSpacing(Layout.spacing.md),
                    }
                  ]}>
                    No game profiles added yet
                  </Text>
                  <Text style={[
                    styles.emptyStateSubtext,
                    { fontSize: getFontSize(14) }
                  ]}>
                    Add your first game profile to get started
                  </Text>
                </View>
              )}
            </View>
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
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  addForm: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  formField: {
    // Dynamic margin applied via responsive hook
  },
  fieldLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  gameSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gameOption: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
  },
  selectedGameOption: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderColor: Colors.crackzoneYellow,
  },
  gameOptionText: {
    color: Colors.text,
    fontWeight: '500',
  },
  selectedGameOptionText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  profilesList: {
    // Profiles list container
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  gameName: {
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  gameId: {
    color: Colors.textSecondary,
  },
  primaryBadge: {
    backgroundColor: Colors.crackzoneYellow + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  primaryText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    borderRadius: Layout.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
    paddingHorizontal: Layout.spacing.md,
  },
  primaryButtonText: {
    color: Colors.success,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    width: 40,
    height: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
  },
});