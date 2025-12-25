import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Trophy, Calendar, Settings, LogOut, Gamepad2, Users, Target, 
  Clock, Flame, ArrowRight, TrendingUp, Wallet, Bell 
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

      setStats(statsResponse.data.stats)
      setRecentTournaments(recentResponse.data.tournaments)
      setUpcomingTournaments(upcomingResponse.data.tournaments)
      setMyRegistrations(registrationsResponse.data.registrations)
      setActivities(activitiesResponse.data.activities)
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
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Gamer'}!
          </h2>
          <p className="text-gray-400">Ready to dominate the battlefield?</p>
        </div>

        <DashboardBanner />

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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-crackzone-yellow mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Tournaments Won</p>
                    <p className="text-2xl font-bold text-white">{stats.tournaments_won}</p>
                  </div>
                </div>
              </div>

              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-crackzone-yellow mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.win_rate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-crackzone-yellow mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Teams</p>
                    <p className="text-2xl font-bold text-white">{stats.team_count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <div className="flex items-center">
                  <Wallet className="w-8 h-8 text-crackzone-yellow mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Wallet Balance</p>
                    <p className="text-2xl font-bold text-white">₹{stats.wallet_balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Tournaments */}
              <div className="lg:col-span-2 space-y-6">
                {/* My Active Registrations */}
                {myRegistrations.length > 0 && (
                  <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        My Upcoming Matches
                      </h3>
                      <button 
                        onClick={() => navigate('/my-matches')}
                        className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {myRegistrations.slice(0, 3).map((registration, index) => {
                        const GameIcon = getGameIcon(registration.game)
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                                <GameIcon className="w-5 h-5 text-crackzone-yellow" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{registration.title}</h4>
                                <p className="text-sm text-gray-400">
                                  {registration.participant_name} • {formatDate(registration.start_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {registration.room_id ? (
                                <div className="flex items-center gap-2 text-green-400">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium">Room Ready</span>
                                </div>
                              ) : (
                                <span className="text-sm text-yellow-400">Waiting for room</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Tournament Results */}
                <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Recent Tournament Results</h3>
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentTournaments.length > 0 ? (
                      recentTournaments.map((tournament, index) => {
                        const GameIcon = getGameIcon(tournament.game)
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-crackzone-black/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                                <GameIcon className="w-5 h-5 text-crackzone-yellow" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{tournament.title}</h4>
                                <p className="text-sm text-gray-400">
                                  {tournament.participant_name} • {formatTimeAgo(tournament.start_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${getStatusColor(tournament.status)}`}>
                                {tournament.status}
                              </p>
                              <p className="text-sm text-gray-400">
                                Rank #{tournament.placement} • {tournament.kills} kills
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">No tournament results yet</p>
                        <p className="text-sm text-gray-500">Join tournaments to see your results here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Tournaments */}
                <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Upcoming Tournaments</h3>
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="text-sm text-crackzone-yellow hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      Browse All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingTournaments.slice(0, 4).map((tournament, index) => {
                      const GameIcon = getGameIcon(tournament.game)
                      return (
                        <div 
                          key={index} 
                          className="p-4 bg-crackzone-black/30 rounded-lg hover:bg-crackzone-black/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                              <GameIcon className="w-4 h-4 text-crackzone-yellow" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white text-sm">{tournament.title}</h4>
                              <p className="text-xs text-gray-400">{tournament.tournament_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-crackzone-yellow font-medium">
                              ₹{Number(tournament.prize_pool).toLocaleString()}
                            </span>
                            <span className="text-gray-400">
                              {formatDate(tournament.start_date)}
                            </span>
                          </div>
                          <div className="mt-2">
                            {tournament.registration_open ? (
                              <div className="flex items-center gap-2 text-green-400 text-xs">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                Registration Open
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-400 text-xs">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                Registration Closed
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/tournaments')}
                      className="w-full bg-crackzone-yellow text-crackzone-black font-medium py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Browse Tournaments
                    </button>
                    <button 
                      onClick={() => navigate('/my-matches')}
                      className="w-full bg-crackzone-black/50 text-white font-medium py-3 px-4 rounded-lg border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-colors"
                    >
                      My Matches
                    </button>
                    <button 
                      onClick={() => navigate('/teams')}
                      className="w-full bg-crackzone-black/50 text-white font-medium py-3 px-4 rounded-lg border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-colors"
                    >
                      Team Management
                    </button>
                    <button 
                      onClick={() => navigate('/wallet')}
                      className="w-full bg-crackzone-black/50 text-white font-medium py-3 px-4 rounded-lg border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-colors"
                    >
                      Wallet
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    {activities.length > 0 ? (
                      activities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-crackzone-black/30 rounded-lg">
                          <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bell className="w-4 h-4 text-crackzone-yellow" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{activity.action}</p>
                            <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No recent activities</p>
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