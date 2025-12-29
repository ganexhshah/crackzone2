import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Trophy, Calendar, Settings, LogOut, Gamepad2, Users, Target, 
  Clock, Flame, ArrowRight, TrendingUp, Wallet, Bell, Search, Plus,
  Zap, Star, Award, ChevronRight, Play, Eye
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import DashboardBanner from './DashboardBanner'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [stats, setStats] = useState({
    tournaments_won: 0,
    total_tournaments: 0,
    win_rate: 0,
    team_count: 0,
    next_tournament: null,
    wallet_balance: 0
  })
  const [recentTournaments, setRecentTournaments] = useState([])
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    } else {
      // For non-authenticated users, just fetch upcoming tournaments for the banner
      fetchUpcomingTournaments()
    }
  }, [isAuthenticated])

  const fetchUpcomingTournaments = async () => {
    try {
      const response = await dashboardAPI.getUpcomingTournaments()
      setUpcomingTournaments(response.data.tournaments)
    } catch (err) {
      console.error('Failed to fetch upcoming tournaments:', err)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Only fetch authenticated data if user is logged in
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      
      const [
        statsResponse,
        recentResponse,
        upcomingResponse,
        registrationsResponse,
        activitiesResponse
      ] = await Promise.all([
        dashboardAPI.getStats().catch(err => ({ data: { stats: {
          tournaments_won: 0,
          total_tournaments: 0,
          win_rate: 0,
          team_count: 0,
          next_tournament: null,
          wallet_balance: 0
        }}})),
        dashboardAPI.getRecentTournaments().catch(err => ({ data: { tournaments: [] }})),
        dashboardAPI.getUpcomingTournaments().catch(err => ({ data: { tournaments: [] }})),
        dashboardAPI.getMyRegistrations().catch(err => ({ data: { registrations: [] }})),
        dashboardAPI.getActivities().catch(err => ({ data: { activities: [] }}))
      ])

      setStats(statsResponse.data?.stats || {})
      setRecentTournaments(recentResponse.data?.tournaments || [])
      setUpcomingTournaments(upcomingResponse.data?.tournaments || [])
      setMyRegistrations(registrationsResponse.data?.registrations || [])
      setActivities(activitiesResponse.data?.activities || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Started'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getGameIcon = (game) => {
    switch (game?.toLowerCase()) {
      case 'freefire':
      case 'free fire':
        return Flame
      case 'pubg':
        return Target
      default:
        return Trophy
    }
  }

  const filterByUserGame = (items) => {
    // Ensure items is an array
    if (!Array.isArray(items)) {
      return [];
    }
    
    // If user has a primary game preference, filter content by that game
    if (user?.primary_game && user.primary_game !== 'both') {
      return items.filter(item => 
        item.game?.toLowerCase() === user.primary_game.toLowerCase() ||
        !item.game // Include items without specific game
      );
    }
    return items;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won': return 'text-green-400'
      case 'Top 3': return 'text-yellow-400'
      case 'Top 10': return 'text-blue-400'
      default: return 'text-red-400'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to access the dashboard</h2>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Modern Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, <span className="text-crackzone-yellow">{user?.username || 'Gamer'}</span>!
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-xl text-gray-400">Ready to dominate the battlefield?</p>
                {user?.primary_game && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-crackzone-yellow/20 rounded-full border border-crackzone-yellow/30">
                    {user.primary_game === 'freefire' ? (
                      <Flame className="w-4 h-4 text-crackzone-yellow" />
                    ) : (
                      <Target className="w-4 h-4 text-crackzone-yellow" />
                    )}
                    <span className="text-sm font-medium text-crackzone-yellow">
                      {user.primary_game === 'freefire' ? 'FreeFire' : 'PUBG Mobile'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/tournaments')}
                className="bg-crackzone-yellow text-crackzone-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-crackzone-yellow/25"
              >
                <Play className="w-5 h-5" />
                Join Tournament
              </button>
              <button 
                onClick={() => navigate('/wallet')}
                className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/30 text-white px-6 py-3 rounded-xl font-semibold hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Money
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-gradient-to-br from-crackzone-yellow/20 to-crackzone-yellow/5 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-6 h-6 text-crackzone-yellow" />
                  </div>
                  <Zap className="w-5 h-5 text-crackzone-yellow/60" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.tournaments_won}</p>
                <p className="text-sm text-gray-400">Tournaments Won</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <Star className="w-5 h-5 text-green-400/60" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.win_rate}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <Award className="w-5 h-5 text-blue-400/60" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.team_count}</p>
                <p className="text-sm text-gray-400">Teams</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Wallet className="w-6 h-6 text-purple-400" />
                  </div>
                  <Plus className="w-5 h-5 text-purple-400/60" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">₹{stats.wallet_balance.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Wallet Balance</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* My Active Registrations */}
                {myRegistrations.length > 0 && (
                  <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">My Upcoming Matches</h3>
                      </div>
                      <button 
                        onClick={() => navigate('/my-matches')}
                        className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 font-medium"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {filterByUserGame(myRegistrations).slice(0, 3).map((registration, index) => {
                        const GameIcon = getGameIcon(registration.game)
                        return (
                          <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl hover:border-green-500/40 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                                <GameIcon className="w-6 h-6 text-crackzone-yellow" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white text-lg">{registration.title}</h4>
                                <p className="text-gray-400">
                                  {registration.participant_name} • {formatDate(registration.start_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {registration.room_id ? (
                                <div className="flex items-center gap-2 text-green-400">
                                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="font-medium">Room Ready</span>
                                </div>
                              ) : (
                                <span className="text-yellow-400 font-medium">Waiting for room</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Upcoming Tournaments */}
                <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-crackzone-yellow" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Trending Tournaments</h3>
                    </div>
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors flex items-center gap-1 font-medium"
                    >
                      Browse All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filterByUserGame(upcomingTournaments).slice(0, 4).map((tournament, index) => {
                      const GameIcon = getGameIcon(tournament.game)
                      return (
                        <div 
                          key={index} 
                          className="p-5 bg-gradient-to-br from-crackzone-black/50 to-crackzone-black/20 rounded-xl hover:from-crackzone-black/70 hover:to-crackzone-black/40 transition-all duration-300 cursor-pointer border border-transparent hover:border-crackzone-yellow/30 group"
                          onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <GameIcon className="w-5 h-5 text-crackzone-yellow" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{tournament.title}</h4>
                              <p className="text-sm text-gray-400">{tournament.tournament_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-crackzone-yellow font-bold text-lg">
                              ₹{Number(tournament.prize_pool).toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatDate(tournament.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            {tournament.registration_open ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                Registration Open
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                Registration Closed
                              </div>
                            )}
                            <Eye className="w-4 h-4 text-gray-500 group-hover:text-crackzone-yellow transition-colors" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Tournament Results */}
                <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-crackzone-yellow" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Recent Results</h3>
                    </div>
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors flex items-center gap-1 font-medium"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {filterByUserGame(recentTournaments).length > 0 ? (
                      filterByUserGame(recentTournaments).map((tournament, index) => {
                        const GameIcon = getGameIcon(tournament.game)
                        return (
                          <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-crackzone-black/30 to-transparent rounded-xl border border-crackzone-yellow/10 hover:border-crackzone-yellow/30 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                                <GameIcon className="w-6 h-6 text-crackzone-yellow" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white text-lg">{tournament.title}</h4>
                                <p className="text-gray-400">
                                  {tournament.participant_name} • {formatTimeAgo(tournament.start_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${getStatusColor(tournament.status)}`}>
                                {tournament.status}
                              </p>
                              <p className="text-gray-400">
                                Rank #{tournament.placement} • {tournament.kills} kills
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No tournament results yet</p>
                        <p className="text-gray-500">Join tournaments to see your results here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-crackzone-yellow" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="w-full bg-gradient-to-r from-crackzone-yellow to-yellow-400 text-crackzone-black font-semibold py-4 px-4 rounded-xl hover:from-yellow-400 hover:to-crackzone-yellow transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-crackzone-yellow/25"
                    >
                      <Trophy className="w-5 h-5" />
                      Browse Tournaments
                    </button>
                    <button 
                      onClick={() => navigate('/my-matches')}
                      className="w-full bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white font-semibold py-4 px-4 rounded-xl border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Target className="w-5 h-5" />
                      My Matches
                    </button>
                    <button 
                      onClick={() => navigate('/teams')}
                      className="w-full bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white font-semibold py-4 px-4 rounded-xl border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Team Management
                    </button>
                    <button 
                      onClick={() => navigate('/wallet')}
                      className="w-full bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white font-semibold py-4 px-4 rounded-xl border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-5 h-5" />
                      Wallet
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-crackzone-yellow" />
                    Recent Activities
                  </h3>
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-crackzone-black/30 to-transparent rounded-xl border border-crackzone-yellow/10 hover:border-crackzone-yellow/30 transition-all duration-300">
                          <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-crackzone-yellow" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-400 truncate">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No recent activities</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Dashboard