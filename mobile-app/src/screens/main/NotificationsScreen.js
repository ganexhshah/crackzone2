import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    tournament: 0,
    team: 0,
    wallet: 0,
    system: 0
  });
  
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
    { id: 'all', label: 'All', icon: 'notifications', count: stats.total },
    { id: 'tournament', label: 'Tournaments', icon: 'trophy', count: stats.tournament },
    { id: 'team', label: 'Teams', icon: 'people', count: stats.team },
    { id: 'wallet', label: 'Wallet', icon: 'wallet', count: stats.wallet },
    { id: 'system', label: 'System', icon: 'settings', count: stats.system },
  ];

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  // Remove the useEffect that reloads on filter change to prevent flashing
  // useEffect(() => {
  //   loadNotifications();
  // }, [activeFilter]);

  const loadStats = async () => {
    try {
      const response = await notificationsAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
      // Fallback: calculate stats from loaded notifications
      calculateStatsFromNotifications();
    }
  };

  const calculateStatsFromNotifications = () => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      tournament: notifications.filter(n => n.type === 'tournament' || n.type === 'tournament_started' || n.type === 'tournament_result').length,
      team: notifications.filter(n => n.type === 'team' || n.type === 'team_invitation').length,
      wallet: notifications.filter(n => n.type === 'wallet' || n.type === 'payment').length,
      system: notifications.filter(n => n.type === 'system').length,
    };
    setStats(stats);
  };

  // Update stats whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      calculateStatsFromNotifications();
    }
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Load all notifications at once, filter client-side for better performance
      const response = await notificationsAPI.getAll();
      const apiNotifications = response.data.notifications || [];
      
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
        data: notification.data ? JSON.parse(notification.data) : {},
        actionType: notification.action_type,
        actionTaken: notification.action_taken,
      }));
      
      setNotifications(formattedNotifications);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Show user-friendly error message
      Alert.alert(
        'Connection Error',
        'Unable to load notifications. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => loadNotifications() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament': return 'trophy';
      case 'team': return 'people';
      case 'team_invitation': return 'person-add';
      case 'match': return 'medal';
      case 'wallet': return 'wallet';
      case 'payment': return 'card';
      case 'system': return 'settings';
      case 'tournament_started': return 'play';
      case 'tournament_result': return 'trophy';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tournament': return Colors.crackzoneYellow;
      case 'tournament_started': return Colors.success;
      case 'tournament_result': return Colors.crackzoneYellow;
      case 'team': return Colors.info;
      case 'team_invitation': return Colors.info;
      case 'match': return Colors.success;
      case 'wallet': return Colors.success;
      case 'payment': return Colors.warning;
      case 'system': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    // loadStats will be called automatically via useEffect when notifications update
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
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationsAPI.deleteNotification(notificationId);
              const deletedNotification = notifications.find(n => n.id === notificationId);
              setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );
              // Update stats
              setStats(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                unread: deletedNotification && !deletedNotification.read ? Math.max(0, prev.unread - 1) : prev.unread,
                [deletedNotification?.type]: Math.max(0, prev[deletedNotification?.type] - 1)
              }));
            } catch (error) {
              console.error('Failed to delete notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleNotificationAction = async (notification, action) => {
    try {
      await notificationsAPI.handleAction(notification.id, action);
      
      // Update notification in local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, actionTaken: action, data: { ...n.data, status: action } }
            : n
        )
      );

      // Show success message based on action
      let message = '';
      switch (action) {
        case 'accept':
          message = 'Team invitation accepted!';
          break;
        case 'decline':
          message = 'Team invitation declined.';
          break;
        case 'mark_joined':
          message = 'Marked as joined successfully!';
          break;
        default:
          message = 'Action completed successfully!';
      }
      
      Alert.alert('Success', message);
    } catch (error) {
      console.error('Failed to handle notification action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const filteredNotifications = useMemo(() => {
    return activeFilter === 'all' 
      ? notifications 
      : notifications.filter(notification => {
          // Handle different tournament notification types
          if (activeFilter === 'tournament') {
            return notification.type === 'tournament' || 
                   notification.type === 'tournament_started' || 
                   notification.type === 'tournament_result';
          }
          // Handle different team notification types
          if (activeFilter === 'team') {
            return notification.type === 'team' || 
                   notification.type === 'team_invitation';
          }
          // Handle different wallet notification types
          if (activeFilter === 'wallet') {
            return notification.type === 'wallet' || 
                   notification.type === 'payment';
          }
          return notification.type === activeFilter;
        });
  }, [notifications, activeFilter]);

  const unreadCount = stats.unread;

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
          
          {/* Action Buttons for Interactive Notifications */}
          {notification.type === 'team_invitation' && !notification.actionTaken && (
            <View style={[styles.actionButtons, { marginTop: getSpacing(Layout.spacing.md) }]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleNotificationAction(notification, 'decline')}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleNotificationAction(notification, 'accept')}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {notification.type === 'tournament_started' && notification.actionType === 'join_match' && !notification.actionTaken && (
            <View style={[styles.actionButtons, { marginTop: getSpacing(Layout.spacing.md) }]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleNotificationAction(notification, 'mark_joined')}
              >
                <Ionicons name="play" size={16} color={Colors.text} />
                <Text style={styles.joinButtonText}>Join Match</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Status indicator for completed actions */}
          {notification.actionTaken && (
            <View style={[styles.actionStatus, { marginTop: getSpacing(Layout.spacing.sm) }]}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={Colors.success} 
              />
              <Text style={styles.actionStatusText}>
                {notification.actionTaken === 'accept' ? 'Accepted' :
                 notification.actionTaken === 'decline' ? 'Declined' :
                 notification.actionTaken === 'joined' ? 'Joined' :
                 'Completed'}
              </Text>
            </View>
          )}
          
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

  if (loading && !initialLoadComplete) {
    return <NotificationsSkeleton />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Notifications"
          onBackPress={() => navigation.goBack()}
          rightIcon={unreadCount > 0 ? "checkmark-done-outline" : "trash-outline"}
          onRightPress={unreadCount > 0 ? markAllAsRead : () => {
            Alert.alert(
              'Clear All Notifications',
              'Are you sure you want to delete all notifications? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await notificationsAPI.clearAll();
                      setNotifications([]);
                      setStats({
                        total: 0,
                        unread: 0,
                        tournament: 0,
                        team: 0,
                        wallet: 0,
                        system: 0
                      });
                    } catch (error) {
                      console.error('Failed to clear all notifications:', error);
                      Alert.alert('Error', 'Failed to clear all notifications');
                    }
                  }
                }
              ]
            );
          }}
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
                {filter.count > 0 && (
                  <View style={[
                    styles.filterBadge,
                    {
                      marginLeft: getSpacing(Layout.spacing.xs),
                      paddingHorizontal: getSpacing(Layout.spacing.xs),
                      paddingVertical: 2,
                    }
                  ]}>
                    <Text style={[
                      styles.filterBadgeText,
                      { fontSize: getFontSize(10) }
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                )}
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
  filterBadge: {
    backgroundColor: Colors.crackzoneYellow + '40',
    borderRadius: Layout.borderRadius.sm,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
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
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    minHeight: 36,
  },
  acceptButton: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  acceptButtonText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  declineButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: Colors.crackzoneYellow + '20',
    borderWidth: 1,
    borderColor: Colors.crackzoneYellow,
  },
  joinButtonText: {
    color: Colors.crackzoneYellow,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
  },
  actionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionStatusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
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