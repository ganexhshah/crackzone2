import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Trophy, 
  Users, 
  Calendar, 
  Wallet, 
  Settings, 
  Check, 
  Trash2, 
  Mail,
  CheckCheck,
  Clock
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { notificationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Notifications = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [activeFilter, setActiveFilter] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    tournament: 0,
    team: 0,
    wallet: 0,
    system: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchNotifications()
    fetchStats()
  }, [isAuthenticated, navigate])

  const fetchNotifications = async (type = activeFilter) => {
    try {
      setLoading(true)
      const params = {}
      if (type !== 'all') {
        if (type === 'unread') {
          params.read = 'false'
        } else {
          params.type = type
        }
      }
      
      const response = await notificationsAPI.getAll(params)
      setNotifications(response.data.notifications.map(n => ({
        ...n,
        icon: getNotificationIcon(n.type),
        color: getNotificationColor(n.type),
        bgColor: getNotificationBgColor(n.type),
        actionButtons: n.type === 'team_invitation' && !n.data?.status
      })))
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await notificationsAPI.getStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to fetch notification stats:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament': return Trophy
      case 'team':
      case 'team_invitation': return Users
      case 'wallet': return Wallet
      case 'system': return Settings
      case 'match': return Calendar
      default: return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tournament': return 'text-crackzone-yellow'
      case 'team':
      case 'team_invitation': return 'text-blue-400'
      case 'wallet': return 'text-green-400'
      case 'system': return 'text-gray-400'
      case 'match': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'tournament': return 'bg-crackzone-yellow/10'
      case 'team':
      case 'team_invitation': return 'bg-blue-500/10'
      case 'wallet': return 'bg-green-500/10'
      case 'system': return 'bg-gray-500/10'
      case 'match': return 'bg-purple-500/10'
      default: return 'bg-gray-500/10'
    }
  }

  const formatTimeAgo = (timeString) => {
    if (timeString.includes('minutes')) {
      const minutes = parseInt(timeString)
      return minutes < 60 ? `${Math.floor(minutes)} minutes ago` : `${Math.floor(minutes / 60)} hours ago`
    }
    if (timeString.includes('hours')) {
      const hours = parseInt(timeString)
      return hours < 24 ? `${Math.floor(hours)} hours ago` : `${Math.floor(hours / 24)} days ago`
    }
    if (timeString.includes('days')) {
      const days = parseInt(timeString)
      return `${Math.floor(days)} days ago`
    }
    return timeString
  }

  const filters = [
    { id: 'all', name: 'All', count: stats.total },
    { id: 'unread', name: 'Unread', count: stats.unread },
    { id: 'tournament', name: 'Tournaments', count: stats.tournament },
    { id: 'team', name: 'Teams', count: stats.team },
    { id: 'wallet', name: 'Wallet', count: stats.wallet }
  ]

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      fetchStats()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAsUnread = async (id) => {
    try {
      await notificationsAPI.markAsUnread(id)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: false } : n
      ))
      fetchStats()
    } catch (err) {
      console.error('Failed to mark as unread:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
      fetchStats()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      fetchStats()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const clearAllNotifications = async () => {
    try {
      await notificationsAPI.clearAll()
      setNotifications([])
      fetchStats()
    } catch (err) {
      console.error('Failed to clear all notifications:', err)
    }
  }

  const handleNotificationAction = async (id, action) => {
    try {
      await notificationsAPI.handleAction(id, action)
      // Update the notification to show the action was taken
      setNotifications(notifications.map(n => 
        n.id === id ? { 
          ...n, 
          actionButtons: false,
          data: { ...n.data, status: action }
        } : n
      ))
    } catch (err) {
      console.error('Failed to handle notification action:', err)
    }
  }

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId)
    fetchNotifications(filterId)
  }

  const NotificationItem = ({ notification }) => (
    <div className={`bg-crackzone-gray/50 backdrop-blur-sm border rounded-xl p-4 hover:border-crackzone-yellow/40 transition-all ${
      notification.read ? 'border-gray-600/20' : 'border-crackzone-yellow/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
          <notification.icon className={`w-6 h-6 ${notification.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                {notification.title}
              </h3>
              {!notification.read && (
                <div className="w-2 h-2 bg-crackzone-yellow rounded-full"></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{formatTimeAgo(notification.time_ago)}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                  title={notification.read ? 'Mark as unread' : 'Mark as read'}
                >
                  {notification.read ? <Mail className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <p className={`text-sm mb-3 ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
            {notification.message}
          </p>
          
          {notification.actionButtons && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleNotificationAction(notification.id, 'accept')}
                className="bg-crackzone-yellow text-crackzone-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={() => handleNotificationAction(notification.id, 'decline')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          
          {notification.data?.status && (
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                notification.data.status === 'accepted' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {notification.data.status === 'accepted' ? 'Accepted' : 'Declined'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">Stay updated with your gaming activities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="bg-crackzone-yellow/20 text-crackzone-yellow px-4 py-2 rounded-lg font-medium hover:bg-crackzone-yellow/30 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={clearAllNotifications}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4 text-center">
            <Bell className="w-8 h-8 text-crackzone-yellow mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.unread}</p>
            <p className="text-xs text-gray-400">Unread</p>
          </div>
          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.tournament}</p>
            <p className="text-xs text-gray-400">Tournaments</p>
          </div>
          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.team}</p>
            <p className="text-xs text-gray-400">Teams</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-crackzone-gray/30 rounded-lg p-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-crackzone-yellow text-crackzone-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter.name} ({filter.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Notifications</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchNotifications()}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {activeFilter === 'all' 
                    ? "You're all caught up! No notifications to show."
                    : `No ${activeFilter} notifications found.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Notifications