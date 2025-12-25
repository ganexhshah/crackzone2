import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../hooks/useResponsive';

// Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import TournamentsScreen from '../screens/main/TournamentsScreen';
import TournamentDetailScreen from '../screens/main/TournamentDetailScreen';
import TeamsScreen from '../screens/main/TeamsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import TransactionHistoryScreen from '../screens/main/TransactionHistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import GameProfilesScreen from '../screens/main/GameProfilesScreen';
import AchievementsScreen from '../screens/main/AchievementsScreen';
import StatisticsScreen from '../screens/main/StatisticsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import NotificationSettingsScreen from '../screens/main/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/main/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import AboutScreen from '../screens/main/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Common screen options for smooth transitions
const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: Colors.background },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
      },
    },
  },
};

// Stack navigators for each tab
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function TournamentsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="TournamentsList" component={TournamentsScreen} />
      <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
    </Stack.Navigator>
  );
}

function TeamsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="TeamsList" component={TeamsScreen} />
    </Stack.Navigator>
  );
}

function WalletStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="GameProfiles" component={GameProfilesScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { 
    isExtraSmallDevice, 
    isSmallDevice, 
    getResponsiveValue, 
    getSpacing, 
    getSafeAreaPadding,
    isAndroid
  } = useResponsive();

  const safeArea = getSafeAreaPadding();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Teams') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          const iconSize = getResponsiveValue(22, 24, 26, 28, 30, 32, 34);
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: Colors.crackzoneYellow,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false, // Hide labels to show only icons
        tabBarStyle: {
          backgroundColor: Colors.crackzoneGray,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: getResponsiveValue(60, 65, 70, 75, 80, 85, 90),
          paddingBottom: isAndroid ? getSpacing(8) : safeArea.bottom,
          paddingTop: getSpacing(8),
          paddingHorizontal: getSpacing(isExtraSmallDevice ? 4 : isSmallDevice ? 6 : 8),
          elevation: 8,
          shadowColor: Colors.crackzoneBlack,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarItemStyle: {
          paddingVertical: getSpacing(8),
          minHeight: getResponsiveValue(50, 55, 60, 65, 70, 75, 80),
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerShown: false,
        tabBarHideOnKeyboard: isAndroid,
        tabBarAllowFontScaling: false,
      })}
      initialRouteName="Dashboard"
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ 
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsStack}
        options={{ 
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Teams" 
        component={TeamsStack}
        options={{ 
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletStack}
        options={{ 
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ 
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}