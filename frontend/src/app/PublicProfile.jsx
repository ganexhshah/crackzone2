import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, 
  Trophy, 
  Target, 
  Star, 
  Award,
  Calendar,
  Users,
  Gamepad2,
  TrendingUp,
  Medal,
  Wallet,
  ArrowLeft,
  UserPlus,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Grid3X3,
  Play,
  Heart,
  MessageSquare,
  Bookmark,
  Loader,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { profileAPI } from '../services/api'

const PublicProfile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({})
  const [achievements, setAchievements] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
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
      setStats(data.stats)
      setAchievements(data.achievements)
      setRecentMatches(data.recentMatches)
      setIsFollowing(data.isFollowing)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <div className="flex items-center justify-center h-screen">
          <Loader className="w-8 h-8 animate-spin text-crackzone-yellow" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          {error === 'This profile is private' ? (
            <>
              <Lock className="w-16 h-16 text-gray-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Private Profile</h2>
              <p className="text-gray-400 mb-6">This user's profile is set to private</p>
            </>
          ) : (
            <>
              <User className="w-16 h-16 text-gray-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
              <p className="text-gray-400 mb-6">The user you're looking for doesn't exist</p>
            </>
          )}
          <button 
            onClick={() => navigate(-1)}
            className="bg-crackzone-yellow text-crackzone-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color = 'text-crackzone-yellow' }) => (
    <div className="text-center">
      <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-crackzone-black/80 backdrop-blur-sm border-b border-crackzone-yellow/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">{userProfile.username}</h1>
          <button 
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-crackzone-yellow/20 rounded-full flex items-center justify-center text-3xl border-4 border-crackzone-yellow/30 overflow-hidden flex-shrink-0">
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

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-xl md:text-2xl font-bold text-white truncate">{userProfile.username}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile.rank === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  userProfile.rank === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                  userProfile.rank === 'platinum' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-amber-600/20 text-amber-400'
                }`}>
                  {userProfile.rank?.charAt(0).toUpperCase() + userProfile.rank?.slice(1)} Rank
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{stats.tournamentsWon || 0}</p>
                  <p className="text-xs text-gray-400">Tournaments Won</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{userProfile.followersCount || 0}</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{userProfile.followingCount || 0}</p>
                  <p className="text-xs text-gray-400">Following</p>
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <p className="text-gray-300 text-sm mb-4">{userProfile.bio}</p>
              )}

              {/* Game Info */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>🎮 {userProfile.favoriteGame}</span>
                <span>📅 Joined {new Date(userProfile.joinDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleFollow}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isFollowing 
                  ? 'bg-crackzone-gray/50 border border-crackzone-yellow/30 text-white hover:bg-crackzone-yellow/10'
                  : 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="px-4 py-2 bg-crackzone-gray/50 border border-crackzone-yellow/30 text-white rounded-lg hover:bg-crackzone-yellow/10 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-crackzone-gray/50 border border-crackzone-yellow/30 text-white rounded-lg hover:bg-crackzone-yellow/10 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlights/Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Trophy} label="Tournaments Won" value={stats.tournamentsWon || 0} />
          <StatCard icon={TrendingUp} label="Win Rate" value={`${stats.winRate || 0}%`} />
          <StatCard icon={Star} label="Total Earnings" value={`₹${(stats.totalEarnings || 0).toLocaleString()}`} />
          <StatCard icon={Medal} label="Best Rank" value={stats.bestRank || 'Bronze'} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-crackzone-yellow/20 mb-6">
          {[
            { id: 'posts', name: 'Posts', icon: Grid3X3 },
            { id: 'achievements', name: 'Achievements', icon: Trophy },
            { id: 'matches', name: 'Matches', icon: Gamepad2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-crackzone-yellow border-b-2 border-crackzone-yellow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1">
            {/* Placeholder for posts - you can add actual post content here */}
            {[...Array(9)].map((_, index) => (
              <div key={index} className="aspect-square bg-crackzone-gray/30 rounded-lg flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-500" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.length > 0 ? achievements.map((achievement) => (
              <div key={achievement.id} className={`bg-crackzone-gray/50 backdrop-blur-sm border rounded-xl p-4 ${
                achievement.earnedAt 
                  ? 'border-crackzone-yellow/40' 
                  : 'border-gray-600/20 opacity-60'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className={`w-6 h-6 ${
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
                  <div className="mt-2">
                    <span className="bg-crackzone-yellow/20 text-crackzone-yellow px-2 py-1 rounded-full text-xs font-medium">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )) : (
              <div className="col-span-2 text-center py-12">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No achievements yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {recentMatches.length > 0 ? recentMatches.map((match, index) => (
              <div key={index} className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
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
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No matches played yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicProfile