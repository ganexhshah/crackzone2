import { useState } from 'react';
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
import { teamsAPI } from '../../services/api';

export default function CreateTeamScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    game: 'FreeFire',
  });

  const handleCreateTeam = async () => {
    if (!teamData.name.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    if (!teamData.game) {
      Alert.alert('Error', 'Please select a game');
      return;
    }

    try {
      setLoading(true);
      await teamsAPI.create({
        name: teamData.name.trim(),
        description: teamData.description.trim(),
        game: teamData.game,
      });

      Alert.alert('Success', 'Team created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Create team error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Create Team"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
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
            Create your gaming team
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.formContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            <View style={[
              styles.formCard,
              { padding: getSpacing(Layout.spacing.lg) }
            ]}>
              {/* Team Name */}
              <View style={[
                styles.formField,
                { marginBottom: getSpacing(Layout.spacing.md) }
              ]}>
                <Text style={[
                  styles.fieldLabel,
                  { 
                    fontSize: getFontSize(14),
                    marginBottom: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  Team Name *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      padding: getSpacing(Layout.spacing.md),
                      fontSize: getFontSize(16),
                    }
                  ]}
                  placeholder="Enter team name"
                  placeholderTextColor={Colors.textMuted}
                  value={teamData.name}
                  onChangeText={(text) => setTeamData({...teamData, name: text})}
                />
              </View>

              {/* Description */}
              <View style={[
                styles.formField,
                { marginBottom: getSpacing(Layout.spacing.md) }
              ]}>
                <Text style={[
                  styles.fieldLabel,
                  { 
                    fontSize: getFontSize(14),
                    marginBottom: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    {
                      padding: getSpacing(Layout.spacing.md),
                      fontSize: getFontSize(16),
                      height: getSpacing(100),
                    }
                  ]}
                  placeholder="Describe your team..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={teamData.description}
                  onChangeText={(text) => setTeamData({...teamData, description: text})}
                />
              </View>

              {/* Game Selection */}
              <View style={[
                styles.formField,
                { marginBottom: getSpacing(Layout.spacing.xl) }
              ]}>
                <Text style={[
                  styles.fieldLabel,
                  { 
                    fontSize: getFontSize(14),
                    marginBottom: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  Game *
                </Text>
                <View style={styles.gameOptions}>
                  {['FreeFire', 'PUBG Mobile', 'Call of Duty', 'Mobile Legends'].map((game) => (
                    <TouchableOpacity
                      key={game}
                      style={[
                        styles.gameOption,
                        {
                          padding: getSpacing(Layout.spacing.md),
                          marginBottom: getSpacing(Layout.spacing.sm),
                        },
                        teamData.game === game && styles.selectedGameOption
                      ]}
                      onPress={() => setTeamData({...teamData, game})}
                    >
                      <Text style={[
                        styles.gameOptionText,
                        { fontSize: getFontSize(16) },
                        teamData.game === game && styles.selectedGameOptionText
                      ]}>
                        {game}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  { padding: getSpacing(Layout.spacing.md) }
                ]}
                onPress={handleCreateTeam}
                disabled={loading}
              >
                <Ionicons 
                  name={loading ? "hourglass" : "add-circle"} 
                  size={getFontSize(20)} 
                  color={Colors.crackzoneBlack} 
                />
                <Text style={[
                  styles.createButtonText,
                  { 
                    fontSize: getFontSize(16),
                    marginLeft: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  {loading ? 'Creating...' : 'Create Team'}
                </Text>
              </TouchableOpacity>
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
  formContainer: {
    // Dynamic padding applied via responsive hook
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formField: {
    // Dynamic margin applied via responsive hook
  },
  fieldLabel: {
    color: Colors.text,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    color: Colors.text,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  gameOptions: {
    // Game options container
  },
  gameOption: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
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
});