import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import LoadingScreen from '../../components/LoadingScreen';
import NotificationsSkeleton from '../../components/skeletons/NotificationsSkeleton';
import { notificationsAPI } from '../../services/api';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding,
    isExtraSmallDevice,
    isSmallDevice 
  } = useResponsive();

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: 'tournament',
      title: 'Tournament Registration Open',
      message: 'BGMI Championship 2024 registration is now open. Join now and compete for ₹50,000 prize pool!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      icon: 'trophy',
      color: Colors.crackzoneYellow,
    },
    {
      id: 2,
      type: 'team',
      title: 'Team Invitation',
      message: 'You have been invited to join "Elite Gamers" team by captain @proplayer123.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      icon: 'people',
      color: Colors.info,
    },
    {
      id: 3,
      type: 'match',
      title: 'Match Result',
      message: 'Your team "Thunder Squad" finished 3rd in BGMI Weekly Tournament. Great job!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: 'medal',
      color: Colors.success,
    },
    {
      id: 4,
      type: 'wallet',
      title: 'Payment Received',
      message: 'Your wallet has been credited with ₹2,500 as tournament prize money.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: 'wallet',
      color: Colors.success,
    },
    {
      id: 5,
      type: 'system',
      title: 'App Update Available',
      message: 'New version 2.1.0 is available with bug fixes and performance improvements.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      icon: 'download',
      color: Colors.warning,
    },
    {
      id: 6,
      type: 'tournament',
      title: 'Tournament Starting Soon',
      message: 'Free Fire Battle Royale starts in 30 minutes. Make sure your team is ready!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      icon: 'time',
      color: Colors.error,
    },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'tournament', label: 'Tournaments', icon: 'trophy' },
    { id: 'team', label: 'Teams', icon: 'people' },
    { id: 'match', label: 'Matches', icon: 'medal' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      const apiNotifications = response.data.notifications || [];
      
      // If no API notifications, use sample data for demo
      if (apiNotifications.length === 0) {
        setNotifications(sampleNotifications);
      } else {
        // Map API notifications to our format
        const formattedNotifications = apiNotifications.map(notification => ({
          id: notification.id,
          type: notification.type || 'system',
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.created_at),
          read: notification.read || false,
          icon: getNotificationIcon(notification.type),
          color: getNotificationColor(notification.type),
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Fallback to sample data if API fails
      setNotifications(sampleNotifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament': return 'trophy';
      case 'team': return 'people';
      case 'match': return 'medal';
      case 'wallet': return 'wallet';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tournament': return Colors.crackzoneYellow;
      case 'team': return Colors.info;
      case 'match': return Colors.success;
      case 'wallet': return Colors.success;
      case 'system': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still update UI optimistically
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Still update UI optimistically
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== notificationId)
            );
          },
        },
      ]
    );
  };

  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const NotificationItem = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: notification.read ? Colors.surface : Colors.surface + 'CC',
          borderLeftColor: notification.color,
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
          borderRadius: Layout.borderRadius.lg,
        }
      ]}
      onPress={() => markAsRead(notification.id)}
      onLongPress={() => deleteNotification(notification.id)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.notificationIcon,
          {
            backgroundColor: notification.color + '20',
            width: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
            height: getResponsiveValue(40, 44, 48, 52, 56, 60, 64),
            borderRadius: getResponsiveValue(20, 22, 24, 26, 28, 30, 32),
          }
        ]}>
          <Ionicons 
            name={notification.icon} 
            size={getResponsiveValue(18, 20, 22, 24, 26, 28, 30)} 
            color={notification.color} 
          />
        </View>
        
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              { 
                fontSize: getFontSize(16),
                fontWeight: notification.read ? '600' : 'bold',
              }
            ]}>
              {notification.title}
            </Text>
            <Text style={[
              styles.notificationTime,
              { fontSize: getFontSize(12) }
            ]}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
          
          <Text style={[
            styles.notificationMessage,
            { 
              fontSize: getFontSize(14),
              color: notification.read ? Colors.textSecondary : Colors.text,
            }
          ]}>
            {notification.message}
          </Text>
          
          {!notification.read && (
            <View style={[
              styles.unreadIndicator,
              {
                width: getResponsiveValue(6, 7, 8, 9, 10, 11, 12),
                height: getResponsiveValue(6, 7, 8, 9, 10, 11, 12),
                borderRadius: getResponsiveValue(3, 3.5, 4, 4.5, 5, 5.5, 6),
              }
            ]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Notifications"
          onBackPress={() => navigation.goBack()}
          rightIcon="checkmark-done-outline"
          onRightPress={markAllAsRead}
          showBorder={false}
        />

        {/* Unread Count */}
        {unreadCount > 0 && (
          <View style={[
            styles.unreadCountContainer,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.md),
            }
          ]}>
            <Text style={[
              styles.unreadCountText,
              { fontSize: getFontSize(14) }
            ]}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={[
          styles.filtersContainer,
          {
            paddingHorizontal: getContainerPadding(),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  activeFilter === filter.id && styles.activeFilterTab,
                  {
                    paddingVertical: getSpacing(Layout.spacing.sm),
                    paddingHorizontal: getSpacing(Layout.spacing.md),
                    marginRight: getSpacing(Layout.spacing.sm),
                    borderRadius: Layout.borderRadius.lg,
                  }
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={getResponsiveValue(16, 18, 20, 22, 24, 26, 28)} 
                  color={activeFilter === filter.id ? Colors.crackzoneBlack : Colors.textSecondary} 
                />
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter.id && styles.activeFilterTabText,
                  { 
                    fontSize: getFontSize(14),
                    marginLeft: getSpacing(Layout.spacing.xs),
                  }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={Colors.crackzoneYellow}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.notificationsList,
            {
              paddingHorizontal: getContainerPadding(),
              paddingBottom: getSpacing(Layout.spacing.xl * 2),
            }
          ]}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <View style={[
                styles.emptyState,
                { paddingVertical: getSpacing(Layout.spacing.xl * 2) }
              ]}>
                <Ionicons 
                  name="notifications-off-outline" 
                  size={getResponsiveValue(64, 68, 72, 76, 80, 84, 88)} 
                  color={Colors.textMuted} 
                />
                <Text style={[
                  styles.emptyStateTitle,
                  { 
                    fontSize: getFontSize(20),
                    marginTop: getSpacing(Layout.spacing.lg),
                    marginBottom: getSpacing(Layout.spacing.md),
                  }
                ]}>
                  No notifications
                </Text>
                <Text style={[
                  styles.emptyStateText,
                  { fontSize: getFontSize(16) }
                ]}>
                  {activeFilter === 'all' 
                    ? "You're all caught up! No new notifications."
                    : `No ${filters.find(f => f.id === activeFilter)?.label.toLowerCase()} notifications.`
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
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
  unreadCountContainer: {
    // Dynamic padding applied via responsive hook
  },
  unreadCountText: {
    color: Colors.crackzoneYellow,
    fontWeight: '600',
    textAlign: 'center',
  },
  filtersContainer: {
    // Dynamic padding applied via responsive hook
  },
  filtersScrollView: {
    paddingRight: Layout.spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterTab: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  filterTabText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: Colors.crackzoneBlack,
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    // Dynamic padding applied via responsive hook
  },
  notificationItem: {
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: Colors.crackzoneBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  notificationText: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.xs,
  },
  notificationTitle: {
    flex: 1,
    color: Colors.text,
    marginRight: Layout.spacing.sm,
  },
  notificationTime: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  notificationMessage: {
    lineHeight: 20,
    marginBottom: Layout.spacing.xs,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.crackzoneYellow,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyStateText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});