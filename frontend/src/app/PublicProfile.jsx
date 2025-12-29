import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, Trophy, Calendar, Settings, LogOut, Gamepad2, Users, Target, 
  Clock, Flame, ArrowRight, TrendingUp, Wallet, Bell, Search, Plus,
  Zap, Star, Award, ChevronRight, Play, Eye,
  ArrowLeft,
  UserPlus,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Grid3X3,
  Heart,
  MessageSquare,
  Bookmark,
  Loader,
  Lock,
  EyeOff,
  Medal
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import DashboardBanner from './DashboardBanner'
import { profileAPI, dashboardAPI } from '../services/api'

const PublicProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({
    tournaments_won: 0,
    total_tournaments: 0,
    win_rate: 0,
    team_count: 0,
    next_tournament: null,
    wallet_balance: 0
  })
  const [achievements, setAchievements] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [activities, setActivities] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)

  useEffect(() => {
    if (username) {
      fetchPublicProfile()
    }
  }, [username])

  const fetchPublicProfile = async () => {
    try {
      setLoading(true)
      const response = await profileAPI.getPublicProfile(username)
      const data = response.data
      
      setUserProfile(data.user)
      setStats(data.stats || {
        tournaments_won: 0,
        total_tournaments: 0,
        win_rate: 0,
        team_count: 0,
        next_tournament: null,
        wallet_balance: 0
      })
      setAchievements(data.achievements || [])
      setRecentMatches(data.recentMatches || [])
      setIsFollowing(data.isFollowing)
      
      // Fetch additional dashboard-like data
      try {
        const upcomingResponse = await dashboardAPI.getUpcomingTournaments()
        setUpcomingTournaments(upcomingResponse.data.tournaments || [])
        
        const activitiesResponse = await dashboardAPI.getActivities()
        setActivities(activitiesResponse.data.activities || [])
      } catch (err) {
        console.error('Failed to fetch additional data:', err)
      }
      
      setError('')
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found')
      } else if (err.response?.status === 403) {
        setError('This profile is private')
      } else {
        setError('Failed to load profile')
      }
      console.error('Public profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(username)
        setIsFollowing(false)
      } else {
        await profileAPI.followUser(username)
        setIsFollowing(true)
      }
    } catch (err) {
      console.error('Follow/unfollow error:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userProfile.username}'s Profile - CrackZone`,
          text: `Check out ${userProfile.username}'s gaming profile on CrackZone!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Profile link copied to clipboard!')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center py-12">
            {error === 'This profile is private' ? (
              <>
                <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-400 mb-2">Private Profile</h3>
                <p className="text-gray-500 mb-4">This user's profile is set to private</p>
              </>
            ) : (
              <>
                <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-400 mb-2">Profile Not Found</h3>
                <p className="text-gray-500 mb-4">The user you're looking for doesn't exist</p>
              </>
            )}
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        <MobileBottomMenu />
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
                <span className="text-crackzone-yellow">{userProfile?.username || 'Gamer'}</span>'s Profile
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-xl text-gray-400">Gaming champion in action</p>
                {userProfile?.favoriteGame && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-crackzone-yellow/20 rounded-full border border-crackzone-yellow/30">
                    {userProfile.favoriteGame === 'freefire' ? (
                      <Flame className="w-4 h-4 text-crackzone-yellow" />
                    ) : (
                      <Target className="w-4 h-4 text-crackzone-yellow" />
                    )}
                    <span className="text-sm font-medium text-crackzone-yellow">
                      {userProfile.favoriteGame === 'freefire' ? 'FreeFire' : 'PUBG Mobile'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleFollow}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${
                  isFollowing 
                    ? 'bg-crackzone-gray/50 border border-crackzone-yellow/30 text-white hover:bg-crackzone-yellow/10'
                    : 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 hover:shadow-crackzone-yellow/25'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                onClick={handleShare}
                className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/30 text-white px-6 py-3 rounded-xl font-semibold hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info Section */}
            <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-crackzone-yellow/20 rounded-full flex items-center justify-center text-3xl border-4 border-crackzone-yellow/30 overflow-hidden flex-shrink-0">
                  {userProfile?.profilePictureUrl ? (
                    <img 
                      src={userProfile.profilePictureUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '🎮'
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl md:text-2xl font-bold text-white truncate">{userProfile?.username}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.rank === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      userProfile?.rank === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                      userProfile?.rank === 'platinum' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-amber-600/20 text-amber-400'
                    }`}>
                      {userProfile?.rank?.charAt(0).toUpperCase() + userProfile?.rank?.slice(1)} Rank
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{stats.tournaments_won || 0}</p>
                      <p className="text-xs text-gray-400">Tournaments Won</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{userProfile?.followersCount || 0}</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{userProfile?.followingCount || 0}</p>
                      <p className="text-xs text-gray-400">Following</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {userProfile?.bio && (
                    <p className="text-gray-300 text-sm mb-4">{userProfile.bio}</p>
                  )}

                  {/* Game Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>🎮 {userProfile?.favoriteGame}</span>
                      <span>📅 Joined {new Date(userProfile?.joinDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    {userProfile?.gameProfiles?.find(gp => gp.is_primary || 
                      gp.game?.toLowerCase() === userProfile?.favoriteGame?.toLowerCase())?.game_uid && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Game ID:</span>
                        <span className="text-crackzone-yellow font-mono">
                          {userProfile.gameProfiles.find(gp => gp.is_primary || 
                            gp.game?.toLowerCase() === userProfile?.favoriteGame?.toLowerCase()).game_uid}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Information Card */}
            <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-crackzone-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-white">Game Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Favorite Game:</span>
                    <div className="flex items-center gap-2">
                      {userProfile?.favoriteGame === 'FreeFire' ? (
                        <Flame className="w-4 h-4 text-crackzone-yellow" />
                      ) : (
                        <Target className="w-4 h-4 text-crackzone-yellow" />
                      )}
                      <span className="text-white font-medium">{userProfile?.favoriteGame || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Game ID:</span>
                    <span className="text-crackzone-yellow font-mono">
                      {userProfile?.gameProfiles?.find(gp => gp.is_primary || 
                        gp.game?.toLowerCase() === userProfile?.favoriteGame?.toLowerCase())?.game_uid || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Rank:</span>
                    <span className={`font-medium ${
                      userProfile?.rank === 'gold' ? 'text-yellow-400' :
                      userProfile?.rank === 'silver' ? 'text-gray-400' :
                      userProfile?.rank === 'platinum' ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {userProfile?.rank?.charAt(0).toUpperCase() + userProfile?.rank?.slice(1) || 'Bronze'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white font-medium">{userProfile?.level || 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">XP:</span>
                    <span className="text-white font-medium">{userProfile?.xp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400 font-medium">{stats.win_rate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Tournaments */}
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
                {upcomingTournaments.slice(0, 4).map((tournament, index) => {
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
              </div>
              <div className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match, index) => {
                    const GameIcon = getGameIcon(match.game)
                    return (
                      <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-crackzone-black/30 to-transparent rounded-xl border border-crackzone-yellow/10 hover:border-crackzone-yellow/30 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                            <GameIcon className="w-6 h-6 text-crackzone-yellow" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg">{match.tournamentName}</h4>
                            <p className="text-gray-400">
                              {new Date(match.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${getStatusColor(match.result)}`}>
                            {match.result}
                          </p>
                          <p className="text-gray-400">{match.prize}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No tournament results yet</p>
                    <p className="text-gray-500">Join tournaments to see results here</p>
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
                  onClick={() => navigate('/leaderboard')}
                  className="w-full bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white font-semibold py-4 px-4 rounded-xl border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  Leaderboard
                </button>
                <button 
                  onClick={() => navigate('/teams')}
                  className="w-full bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white font-semibold py-4 px-4 rounded-xl border border-crackzone-yellow/30 hover:border-crackzone-yellow/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Teams
                </button>
                <button 
                  onClick={handleFollow}
                  className={`w-full font-semibold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    isFollowing 
                      ? 'bg-gradient-to-r from-crackzone-gray/50 to-crackzone-black/50 text-white border border-crackzone-yellow/30 hover:border-crackzone-yellow/50'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  {isFollowing ? 'Following' : 'Follow User'}
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-crackzone-gray/60 to-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl p-6 hover:border-crackzone-yellow/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-crackzone-yellow" />
                Achievements
              </h3>
              <div className="space-y-4">
                {achievements.length > 0 ? (
                  achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className={`flex items-start gap-3 p-4 bg-gradient-to-r from-crackzone-black/30 to-transparent rounded-xl border transition-all duration-300 ${
                      achievement.earnedAt 
                        ? 'border-crackzone-yellow/30 hover:border-crackzone-yellow/50' 
                        : 'border-gray-600/20 opacity-60'
                    }`}>
                      <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trophy className={`w-5 h-5 ${
                          achievement.earnedAt ? 'text-crackzone-yellow' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          achievement.earnedAt ? 'text-white' : 'text-gray-500'
                        }`}>{achievement.name}</p>
                        <p className={`text-sm truncate ${
                          achievement.earnedAt ? 'text-gray-400' : 'text-gray-500'
                        }`}>{achievement.description}</p>
                        {achievement.earnedAt && (
                          <p className="text-xs text-crackzone-yellow mt-1">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No achievements yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default PublicProfile