import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  User, 
  Trophy, 
  Calendar, 
  Settings, 
  LogOut, 
  Gamepad2, 
  Users, 
  Target,
  Bell,
  Menu,
  X,
  Wallet,
  Clock,
  Check
} from 'lucide-react'
import CrackZoneLogo from '../components/CrackZoneLogo'

const DashboardNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const location = useLocation()
  const notificationRef = useRef(null)

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: Gamepad2, path: '/dashboard' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { name: 'My Matches', icon: Target, path: '/my-matches' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Profile', icon: User, path: '/profile' }
  ]

  const recentNotifications = [
    {
      id: 1,
      title: 'Tournament Starting Soon',
      message: 'FreeFire Championship starts in 30 minutes',
      time: '5m ago',
      read: false,
      icon: Trophy,
      color: 'text-crackzone-yellow'
    },
    {
      id: 2,
      title: 'Team Invitation',
      message: 'Elite Gamers invited you to join',
      time: '1h ago',
      read: false,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      id: 3,
      title: 'Prize Money Received',
      message: 'You received ₹5,000 prize money',
      time: '2h ago',
      read: true,
      icon: Wallet,
      color: 'text-green-400'
    }
  ]

  const unreadCount = recentNotifications.filter(n => !n.read).length

  return (
    <header className="bg-crackzone-gray/50 backdrop-blur-sm border-b border-crackzone-yellow/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CrackZoneLogo className="w-32 h-8" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-crackzone-yellow/20 text-crackzone-yellow'
                      : 'text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-crackzone-yellow/20">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Notifications</h3>
                      <Link 
                        to="/notifications"
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      <div className="p-2">
                        {recentNotifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-crackzone-yellow/10 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-crackzone-yellow/5' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-crackzone-black/30 flex items-center justify-center`}>
                              <notification.icon className={`w-4 h-4 ${notification.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-crackzone-yellow rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mb-1">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                  
                  {recentNotifications.length > 0 && (
                    <div className="p-3 border-t border-crackzone-yellow/20">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotificationOpen(false)}
                        className="w-full bg-crackzone-yellow/20 text-crackzone-yellow py-2 rounded-lg font-medium hover:bg-crackzone-yellow/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Logout */}
            <Link 
              to="/login"
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-crackzone-yellow/20">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-crackzone-yellow/20 text-crackzone-yellow'
                        : 'text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default DashboardNavbar