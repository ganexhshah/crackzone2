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
  Menu,
  X,
  Gift,
  Search,
  Wallet,
  ChevronDown,
  Award
} from 'lucide-react'
import CrackZoneLogo from '../components/CrackZoneLogo'
import NotificationsDropdown from '../components/NotificationsDropdown'
import SearchModal from '../components/SearchModal'
import { useAuth } from '../contexts/AuthContext'
import { walletAPI } from '../services/api'

const DashboardNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const location = useLocation()
  const { user, logout } = useAuth()
  const profileRef = useRef(null)

  const navItems = [
    { name: 'Dashboard', icon: Gamepad2, path: '/dashboard' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { name: 'My Matches', icon: Target, path: '/my-matches' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Leaderboard', icon: Award, path: '/leaderboard' },
    { name: 'Schedule', icon: Calendar, path: '/schedule' },
    { name: 'Rewards', icon: Gift, path: '/rewards' }
  ]

  useEffect(() => {
    fetchWalletBalance()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getWallet()
      setWalletBalance(response.data.balance || 0)
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error)
    }
  }

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

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
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-crackzone-yellow/20 text-crackzone-yellow'
                        : 'text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-crackzone-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-crackzone-black/90"></div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Icon */}
            <div className="relative group">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors rounded-lg hover:bg-crackzone-yellow/10"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-crackzone-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Search
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-crackzone-black/90"></div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative group">
              <NotificationsDropdown />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-crackzone-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Notifications
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-crackzone-black/90"></div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div className="relative group">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
                >
                  <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
                    {user?.profile_picture_url ? (
                      <img 
                        src={user.profile_picture_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-crackzone-yellow" />
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-white">
                    {user?.username || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 hidden lg:block" />
                </button>
                {/* Tooltip for medium screens */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-crackzone-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 lg:hidden">
                  {user?.username || 'Profile'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-crackzone-black/90"></div>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-crackzone-yellow/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-crackzone-yellow" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user?.username || 'User'}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-crackzone-black/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Wallet Balance</span>
                        <div className="flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-crackzone-yellow" />
                          <span className="font-medium text-crackzone-yellow">₹{walletBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 w-full p-3 text-left text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/wallet"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 w-full p-3 text-left text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10 rounded-lg transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      Wallet
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 w-full p-3 text-left text-gray-300 hover:text-crackzone-yellow hover:bg-crackzone-yellow/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 text-left text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

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

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  )
}

export default DashboardNavbar