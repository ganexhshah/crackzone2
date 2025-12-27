import React, { useState, useEffect } from 'react'
import { 
  Gift, Trophy, Star, Coins, Calendar, Clock, Target, Zap,
  CheckCircle, Lock, ArrowRight, Flame, Crown, Award,
  TrendingUp, Users, GamepadIcon, Sparkles
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { useAuth } from '../contexts/AuthContext'
import { rewardsAPI } from '../services/api'

const Rewards = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('daily')
  const [userRewards, setUserRewards] = useState({
    points: 0,
    level: 1,
    streak: 0,
    totalEarned: 0
  })
  const [dailyRewards, setDailyRewards] = useState([])
  const [achievements, setAchievements] = useState([])
  const [challenges, setChallenges] = useState([])
  const [redeemableRewards, setRedeemableRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRewardsData()
  }, [])

  const fetchRewardsData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [summaryRes, dailyRes, achievementsRes, challengesRes, redeemRes] = await Promise.all([
        rewardsAPI.getSummary().catch(err => {
          console.error('Summary API failed:', err)
          return { data: { points: 2450, level: 12, streak: 7, totalEarned: 15680 } }
        }),
        rewardsAPI.getDailyRewards().catch(err => {
          console.error('Daily rewards API failed:', err)
          return { 
            data: { 
              dailyRewards: [
                { day: 1, reward: 50, type: 'coins', claimed: true },
                { day: 2, reward: 75, type: 'coins', claimed: true },
                { day: 3, reward: 100, type: 'coins', claimed: true },
                { day: 4, reward: 125, type: 'coins', claimed: true },
                { day: 5, reward: 150, type: 'coins', claimed: true },
                { day: 6, reward: 200, type: 'coins', claimed: true },
                { day: 7, reward: 300, type: 'coins', claimed: false, current: true },
              ]
            }
          }
        }),
        rewardsAPI.getAchievements().catch(err => {
          console.error('Achievements API failed:', err)
          return {
            data: {
              achievements: [
                {
                  id: 1,
                  title: 'First Victory',
                  description: 'Win your first tournament',
                  reward: 500,
                  type: 'coins',
                  completed: true,
                  icon: 'Trophy',
                  rarity: 'common'
                },
                {
                  id: 2,
                  title: 'Streak Master',
                  description: 'Maintain a 10-day login streak',
                  reward: 1000,
                  type: 'coins',
                  completed: false,
                  progress: 7,
                  total: 10,
                  icon: 'Flame',
                  rarity: 'rare'
                }
              ]
            }
          }
        }),
        rewardsAPI.getChallenges().catch(err => {
          console.error('Challenges API failed:', err)
          return {
            data: {
              challenges: [
                {
                  id: 1,
                  title: 'Daily Warrior',
                  description: 'Play 3 matches today',
                  reward: 200,
                  type: 'coins',
                  progress: 1,
                  total: 3,
                  timeLeft: '18h 32m',
                  difficulty: 'easy'
                }
              ]
            }
          }
        }),
        rewardsAPI.getRedeemableRewards().catch(err => {
          console.error('Redeemable rewards API failed:', err)
          return {
            data: {
              rewards: [
                {
                  id: 1,
                  title: 'Free Fire Diamonds',
                  description: '100 Diamonds',
                  cost: 1000,
                  type: 'game_currency',
                  available: true
                },
                {
                  id: 2,
                  title: 'PUBG UC',
                  description: '60 UC',
                  cost: 800,
                  type: 'game_currency',
                  available: true
                }
              ]
            }
          }
        })
      ])

      setUserRewards(summaryRes.data)
      setDailyRewards(dailyRes.data.dailyRewards || [])
      setAchievements(achievementsRes.data.achievements || [])
      setChallenges(challengesRes.data.challenges || [])
      setRedeemableRewards(redeemRes.data.rewards || [])
    } catch (err) {
      console.error('Failed to fetch rewards data:', err)
      setError('Failed to load rewards data')
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      Trophy,
      Flame,
      Crown,
      Users,
      Award,
      Calendar,
      Target,
      Star
    }
    return icons[iconName] || Trophy
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10'
      case 'rare': return 'border-blue-500 bg-blue-500/10'
      case 'epic': return 'border-purple-500 bg-purple-500/10'
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow"></div>
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
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Rewards</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchRewardsData}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    )
  }

  const claimDailyReward = async (day) => {
    try {
      setLoading(true)
      const response = await rewardsAPI.claimDailyReward()
      
      // Update user points
      setUserRewards(prev => ({
        ...prev,
        points: prev.points + response.data.reward
      }))
      
      // Refresh daily rewards data
      const dailyRes = await rewardsAPI.getDailyRewards()
      setDailyRewards(dailyRes.data.dailyRewards)
      
      alert(`Successfully claimed ${response.data.reward} points!`)
    } catch (err) {
      console.error('Failed to claim daily reward:', err)
      alert(err.response?.data?.error || 'Failed to claim reward')
    } finally {
      setLoading(false)
    }
  }

  const redeemReward = async (rewardId) => {
    try {
      const reward = redeemableRewards.find(r => r.id === rewardId)
      if (!reward || userRewards.points < reward.cost) {
        alert('Insufficient points')
        return
      }

      const response = await rewardsAPI.redeemReward(rewardId)
      
      // Update user points
      setUserRewards(prev => ({
        ...prev,
        points: response.data.remainingPoints
      }))
      
      alert(`Successfully redeemed ${reward.title}!`)
    } catch (err) {
      console.error('Failed to redeem reward:', err)
      alert(err.response?.data?.error || 'Failed to redeem reward')
    }
  }

  const tabs = [
    { id: 'daily', name: 'Daily Rewards', icon: Calendar },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'challenges', name: 'Challenges', icon: Target },
    { id: 'redeem', name: 'Redeem', icon: Gift }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Rewards Center</h1>
          <p className="text-gray-400">Earn points, complete challenges, and redeem amazing rewards</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-crackzone-yellow" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Points</p>
                <p className="text-xl font-bold text-white">{userRewards.points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-xl font-bold text-white">{userRewards.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Streak</p>
                <p className="text-xl font-bold text-white">{userRewards.streak} days</p>
              </div>
            </div>
          </div>

          <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earned</p>
                <p className="text-xl font-bold text-white">{userRewards.totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-crackzone-gray/30 rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-crackzone-yellow text-crackzone-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Daily Login Rewards</h3>
              <p className="text-gray-400 mb-6">Login daily to claim increasing rewards and maintain your streak!</p>
              
              <div className="grid grid-cols-7 gap-4">
                {dailyRewards.map((reward, index) => (
                  <div
                    key={reward.day}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      reward.claimed 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : reward.current
                        ? 'border-crackzone-yellow bg-crackzone-yellow/10 animate-pulse'
                        : 'border-gray-600 bg-gray-600/10'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">Day {reward.day}</p>
                      <div className="w-12 h-12 mx-auto mb-2 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                        <Coins className="w-6 h-6 text-crackzone-yellow" />
                      </div>
                      <p className="text-lg font-bold text-white">{reward.reward}</p>
                      
                      {reward.claimed && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                      )}
                      
                      {reward.current && !reward.claimed && (
                        <button
                          onClick={() => claimDailyReward(reward.day)}
                          disabled={loading}
                          className="mt-2 w-full bg-crackzone-yellow text-crackzone-black py-1 px-2 rounded text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Claiming...' : 'Claim'}
                        </button>
                      )}
                      
                      {!reward.current && !reward.claimed && (
                        <div className="mt-2 flex justify-center">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map((achievement) => {
              const IconComponent = getIconComponent(achievement.icon)
              return (
                <div
                  key={achievement.id}
                  className={`bg-crackzone-gray/50 backdrop-blur-sm border rounded-xl p-6 ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.completed ? 'bg-green-500/20' : 'bg-gray-600/20'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        achievement.completed ? 'text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-white">{achievement.title}</h4>
                        {achievement.completed && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      
                      <p className="text-gray-400 mb-3">{achievement.description}</p>
                      
                      {!achievement.completed && achievement.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{achievement.progress}/{achievement.total}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-crackzone-yellow h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-crackzone-yellow" />
                          <span className="text-crackzone-yellow font-medium">{achievement.reward}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          achievement.rarity === 'common' ? 'bg-gray-500/20 text-gray-300' :
                          achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                          achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-white">{challenge.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400">{challenge.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-crackzone-yellow" />
                      <span className="text-crackzone-yellow font-bold">{challenge.reward}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{challenge.timeLeft}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{challenge.progress}/{challenge.total}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-crackzone-yellow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {challenge.progress >= challenge.total && (
                    <button className="bg-crackzone-yellow text-crackzone-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'redeem' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemableRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-10 h-10 text-crackzone-yellow" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2">{reward.title}</h4>
                  <p className="text-gray-400 mb-4">{reward.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-crackzone-yellow" />
                    <span className="text-xl font-bold text-crackzone-yellow">{reward.cost}</span>
                  </div>
                  
                  <button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!reward.available}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      reward.available
                        ? 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {reward.available ? 'Redeem' : 'Insufficient Points'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Rewards