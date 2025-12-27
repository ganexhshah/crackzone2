import React, { useState, useEffect } from 'react'
import { 
  User, 
  Trophy, 
  Target, 
  Star, 
  Edit, 
  Camera, 
  Settings, 
  Award,
  Calendar,
  Users,
  Gamepad2,
  TrendingUp,
  Medal,
  Wallet,
  Plus,
  Minus,
  X,
  Save,
  Bell,
  Shield,
  Volume2,
  Loader
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { profileAPI } from '../services/api'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({})
  const [achievements, setAchievements] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [editFormData, setEditFormData] = useState({
    username: '',
    bio: '',
    favoriteGame: 'FreeFire',
    gameId: ''
  })

  const [settingsData, setSettingsData] = useState({
    privacySetting: 'public',
    notificationsEnabled: true,
    autoJoinTeams: false,
    soundEffectsEnabled: true
  })

  // Icon mapping for achievements
  const getAchievementIcon = (iconName) => {
    const iconMap = {
      'trophy': Trophy,
      'target': Target,
      'users': Users,
      'star': Star,
      'medal': Medal,
      'award': Award,
      'wallet': Wallet,
      'gamepad2': Gamepad2,
      'default': Trophy
    };
    return iconMap[iconName] || iconMap['default'];
  };

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await profileAPI.getProfile()
      const data = response.data
      
      setUserProfile({
        ...data.user,
        wallet: data.wallet,
        gameProfiles: data.gameProfiles
      })
      setStats(data.stats)
      setAchievements(data.achievements)
      setRecentMatches(data.recentMatches)
      
      // Set form data for editing
      setEditFormData({
        username: data.user.username,
        bio: data.user.bio,
        favoriteGame: data.user.favoriteGame,
        gameId: data.gameProfiles.find(gp => gp.is_primary)?.game_uid || ''
      })
      
      // Set settings data
      setSettingsData({
        privacySetting: data.user.privacySetting,
        notificationsEnabled: data.user.notificationsEnabled,
        autoJoinTeams: data.user.autoJoinTeams,
        soundEffectsEnabled: data.user.soundEffectsEnabled
      })
      
      setError('')
    } catch (err) {
      setError('Failed to load profile data')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await profileAPI.updateProfile({
        username: editFormData.username,
        bio: editFormData.bio,
        favoriteGame: editFormData.favoriteGame,
        gameId: editFormData.gameId
      })
      
      setIsEditModalOpen(false)
      await fetchProfileData() // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (settings) => {
    try {
      await profileAPI.updateSettings(settings)
      await fetchProfileData() // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings')
    }
  }

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-crackzone-yellow" />
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="text-center text-red-400">
            {error || 'Failed to load profile'}
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color = 'text-crackzone-yellow' }) => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-lg p-4 text-center">
      <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Profile Header */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-crackzone-yellow/20 rounded-full flex items-center justify-center text-4xl border-4 border-crackzone-yellow/30 overflow-hidden">
                {userProfile.profilePictureUrl ? (
                  <img 
                    src={userProfile.profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '🎮'
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-crackzone-yellow rounded-full flex items-center justify-center text-crackzone-black hover:bg-yellow-400 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{userProfile.username}</h1>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-400 mb-2">{userProfile.email}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userProfile.rank === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  userProfile.rank === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                  userProfile.rank === 'platinum' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-amber-600/20 text-amber-400'
                }`}>
                  {userProfile.rank.charAt(0).toUpperCase() + userProfile.rank.slice(1)} Rank
                </span>
                <span className="text-sm text-gray-400">Level {userProfile.level}</span>
                <span className="text-sm text-gray-400">
                  Joined {new Date(userProfile.joinDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>

              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>XP Progress</span>
                  <span>{userProfile.xp}/{userProfile.nextLevelXp}</span>
                </div>
                <div className="w-full bg-crackzone-black/50 rounded-full h-2">
                  <div 
                    className="bg-crackzone-yellow h-2 rounded-full transition-all"
                    style={{ width: `${(userProfile.xp / userProfile.nextLevelXp) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-300 text-sm">{userProfile.bio || 'No bio available'}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              {/* Wallet Balance */}
              <div className="bg-crackzone-black/30 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-sm text-gray-400">Wallet</span>
                  </div>
                  <span className="text-lg font-bold text-crackzone-yellow">
                    ₹{userProfile.wallet?.balance?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => window.location.href = '/wallet'}
                    className="flex-1 bg-green-500/20 text-green-400 py-1 px-3 rounded text-xs font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                  <button 
                    onClick={() => window.location.href = '/wallet'}
                    className="flex-1 bg-red-500/20 text-red-400 py-1 px-3 rounded text-xs font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus className="w-3 h-3" />
                    Withdraw
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-crackzone-yellow text-crackzone-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => window.open(`/u/${userProfile.username}`, '_blank')}
                className="bg-crackzone-gray/50 border border-crackzone-yellow/30 text-crackzone-yellow px-6 py-2 rounded-lg font-medium hover:bg-crackzone-yellow/10 transition-colors"
              >
                View Public Profile
              </button>
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="bg-crackzone-gray/50 border border-crackzone-yellow/30 text-crackzone-yellow px-6 py-2 rounded-lg font-medium hover:bg-crackzone-yellow/10 transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-crackzone-gray/30 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'achievements', name: 'Achievements' },
            { id: 'matches', name: 'Match History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-crackzone-yellow text-crackzone-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Trophy} label="Tournaments Won" value={stats.tournamentsWon} />
              <StatCard icon={Gamepad2} label="Tournaments Played" value={stats.tournamentsPlayed} />
              <StatCard icon={TrendingUp} label="Win Rate" value={`${stats.winRate}%`} />
              <StatCard icon={Star} label="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} />
              <StatCard icon={Target} label="Current Streak" value={stats.currentStreak} />
              <StatCard icon={Medal} label="Best Rank" value={stats.bestRank} />
            </div>

            {/* Game Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Game Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorite Game:</span>
                    <span className="text-white font-medium">{userProfile.favoriteGame}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Game ID:</span>
                    <span className="text-white font-medium">
                      {userProfile.gameProfiles?.find(gp => gp.is_primary)?.game_uid || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Rank:</span>
                    <span className="text-crackzone-yellow font-medium">{userProfile.rank}</span>
                  </div>
                </div>
              </div>

              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-gray-300 text-sm">Won FreeFire Championship</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">Joined Fire Squad team</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">Reached Gold rank</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.icon);
              return (
                <div key={achievement.id} className={`bg-crackzone-gray/50 backdrop-blur-sm border rounded-xl p-6 ${
                  achievement.earnedAt 
                    ? 'border-crackzone-yellow/40' 
                    : 'border-gray-600/20 opacity-60'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className={`w-8 h-8 ${
                      achievement.earnedAt ? 'text-crackzone-yellow' : 'text-gray-500'
                    }`} />
                    <div>
                      <h3 className={`font-bold ${
                        achievement.earnedAt ? 'text-white' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h3>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    achievement.earnedAt ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.earnedAt && (
                    <div className="mt-3">
                      <span className="bg-crackzone-yellow/20 text-crackzone-yellow px-2 py-1 rounded-full text-xs font-medium">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {recentMatches.length > 0 ? (
              recentMatches.map((match, index) => (
                <div key={index} className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{match.tournamentName}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(match.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{match.game}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        match.result === 'Won' ? 'text-green-400' :
                        match.result === 'Runner-up' ? 'text-yellow-400' :
                        match.result === 'Third Place' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {match.result}
                      </p>
                      <p className="text-sm text-gray-400">{match.prize}</p>
                      <p className="text-xs text-gray-500">Position: {match.position}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No matches played yet</p>
                <p className="text-sm text-gray-500">Join a tournament to see your match history</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Favorite Game
                </label>
                <select
                  value={editFormData.favoriteGame}
                  onChange={(e) => setEditFormData({...editFormData, favoriteGame: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                >
                  <option value="FreeFire">FreeFire</option>
                  <option value="PUBG">PUBG Mobile</option>
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Call of Duty">Call of Duty Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game ID
                </label>
                <input
                  type="text"
                  value={editFormData.gameId}
                  onChange={(e) => setEditFormData({...editFormData, gameId: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Quick Settings</h2>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Notifications */}
              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-white font-medium">Notifications</span>
                  </div>
                  <button 
                    onClick={() => setSettingsData({...settingsData, notificationsEnabled: !settingsData.notificationsEnabled})}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      settingsData.notificationsEnabled ? 'bg-crackzone-yellow' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settingsData.notificationsEnabled ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>
                <p className="text-sm text-gray-400">Tournament and team notifications</p>
              </div>

              {/* Privacy */}
              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-white font-medium">Profile Privacy</span>
                  </div>
                  <select 
                    value={settingsData.privacySetting}
                    onChange={(e) => setSettingsData({...settingsData, privacySetting: e.target.value})}
                    className="bg-crackzone-black/50 border border-crackzone-yellow/30 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <p className="text-sm text-gray-400">Who can see your profile</p>
              </div>

              {/* Game Settings */}
              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-white font-medium">Auto-Join Teams</span>
                  </div>
                  <button 
                    onClick={() => setSettingsData({...settingsData, autoJoinTeams: !settingsData.autoJoinTeams})}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      settingsData.autoJoinTeams ? 'bg-crackzone-yellow' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settingsData.autoJoinTeams ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>
                <p className="text-sm text-gray-400">Automatically join available teams</p>
              </div>

              {/* Sound */}
              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-white font-medium">Sound Effects</span>
                  </div>
                  <button 
                    onClick={() => setSettingsData({...settingsData, soundEffectsEnabled: !settingsData.soundEffectsEnabled})}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      settingsData.soundEffectsEnabled ? 'bg-crackzone-yellow' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settingsData.soundEffectsEnabled ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>
                <p className="text-sm text-gray-400">Interface sound effects</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleUpdateSettings(settingsData);
                  setIsSettingsModalOpen(false);
                }}
                disabled={loading}
                className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomMenu />
    </div>
  )
}

export default Profile