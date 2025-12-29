import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Trophy, Users, Wallet, Settings, Clock, X } from 'lucide-react'
import { notificationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const NotificationsDropdown = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentNotifications()
      fetchUnreadCount()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsAPI.getAll({ limit: 5 })
      const notificationsData = response.data?.notifications || []
      setNotifications(notificationsData.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setNotifications([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getStats()
      setUnreadCount(response.data?.stats?.unread || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      setUnreadCount(0) // Set to 0 on error
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament':
      case 'tournament_started':
        return Trophy
      case 'team':
      case 'team_invitation':
        return Users
      case 'wallet':
        return Wallet
      case 'system':
        return Settings
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'tournament':
      case 'tournament_started':
        return 'text-yellow-400'
      case 'team':
      case 'team_invitation':
        return 'text-blue-400'
      case 'wallet':
        return 'text-green-400'
      case 'system':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatTimeAgo = (timeString) => {
    if (!timeString) return 'Just now'
    
    if (timeString.includes('minutes')) {
      const minutes = parseInt(timeString)
      return minutes < 60 ? `${Math.floor(minutes)}m ago` : `${Math.floor(minutes / 60)}h ago`
    }
    if (timeString.includes('hours')) {
      const hours = parseInt(timeString)
      return hours < 24 ? `${Math.floor(hours)}h ago` : `${Math.floor(hours / 24)}d ago`
    }
    if (timeString.includes('days')) {
      const days = parseInt(timeString)
      return `${Math.floor(days)}d ago`
    }
    return timeString
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await notificationsAPI.markAsRead(notification.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        )
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }

    // Navigate based on notification type
    if (notification.type === 'tournament_started' && notification.action_data) {
      const actionData = JSON.parse(notification.action_data || '{}')
      navigate(`/tournaments/${actionData.tournamentId}`)
    } else if (notification.tournament_id) {
      navigate(`/tournaments/${notification.tournament_id}`)
    }
    
    setIsOpen(false)
  }

  const handleViewAll = () => {
    navigate('/notifications')
    setIsOpen(false)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-crackzone-yellow transition-colors rounded-lg hover:bg-crackzone-gray/50"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-crackzone-yellow/20">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <button
              onClick={handleViewAll}
              className="text-crackzone-yellow hover:text-yellow-400 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-crackzone-yellow mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-crackzone-yellow/10">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  const iconColor = getNotificationColor(notification.type)
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-crackzone-yellow/5 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-crackzone-yellow/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-crackzone-black/30 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-medium text-sm ${
                              notification.read ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-crackzone-yellow rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          
                          <p className={`text-xs ${
                            notification.read ? 'text-gray-400' : 'text-gray-300'
                          } line-clamp-2`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.time_ago)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-crackzone-yellow/20 bg-crackzone-black/20">
              <button
                onClick={handleViewAll}
                className="w-full py-2 text-crackzone-yellow hover:text-yellow-400 text-sm font-medium transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown