import React, { useState, useEffect } from 'react'
import { 
  Gift, Plus, Edit, Trash2, Save, X, Trophy, Star, 
  Coins, Calendar, Target, Users, Award, Crown, Flame,
  Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import { adminAPI } from '../services/adminAPI'

const RewardManagement = () => {
  const [activeTab, setActiveTab] = useState('rewards')
  const [rewards, setRewards] = useState([])
  const [achievements, setAchievements] = useState([])
  const [challenges, setChallenges] = useState([])
  const [userRewards, setUserRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 0,
    reward: 0,
    type: 'coins',
    category: 'daily',
    rarity: 'common',
    difficulty: 'easy',
    available: true,
    icon: 'Gift'
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      switch (activeTab) {
        case 'rewards':
          const rewardsRes = await adminAPI.getRedeemableRewards()
          setRewards(rewardsRes.data || [])
          break
        case 'achievements':
          const achievementsRes = await adminAPI.getAchievements()
          setAchievements(achievementsRes.data || [])
          break
        case 'challenges':
          const challengesRes = await adminAPI.getChallenges()
          setChallenges(challengesRes.data || [])
          break
        case 'users':
          const usersRes = await adminAPI.getUserRewards()
          setUserRewards(usersRes.data || [])
          break
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      let endpoint = ''
      switch (activeTab) {
        case 'rewards':
          endpoint = 'createReward'
          break
        case 'achievements':
          endpoint = 'createAchievement'
          break
        case 'challenges':
          endpoint = 'createChallenge'
          break
      }
      
      await adminAPI[endpoint](formData)
      setShowCreateModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      console.error('Failed to create item:', err)
      setError(err.response?.data?.error || 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id) => {
    try {
      setLoading(true)
      
      let endpoint = ''
      switch (activeTab) {
        case 'rewards':
          endpoint = 'updateReward'
          break
        case 'achievements':
          endpoint = 'updateAchievement'
          break
        case 'challenges':
          endpoint = 'updateChallenge'
          break
      }
      
      await adminAPI[endpoint](id, formData)
      setEditingItem(null)
      resetForm()
      await fetchData()
    } catch (err) {
      console.error('Failed to update item:', err)
      setError(err.response?.data?.error || 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      setLoading(true)
      
      let endpoint = ''
      switch (activeTab) {
        case 'rewards':
          endpoint = 'deleteReward'
          break
        case 'achievements':
          endpoint = 'deleteAchievement'
          break
        case 'challenges':
          endpoint = 'deleteChallenge'
          break
      }
      
      await adminAPI[endpoint](id)
      await fetchData()
    } catch (err) {
      console.error('Failed to delete item:', err)
      setError(err.response?.data?.error || 'Failed to delete item')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cost: 0,
      reward: 0,
      type: 'coins',
      category: 'daily',
      rarity: 'common',
      difficulty: 'easy',
      available: true,
      icon: 'Gift'
    })
  }

  const startEdit = (item) => {
    setEditingItem(item.id)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      cost: item.cost || 0,
      reward: item.reward || 0,
      type: item.type || 'coins',
      category: item.category || 'daily',
      rarity: item.rarity || 'common',
      difficulty: item.difficulty || 'easy',
      available: item.available !== false,
      icon: item.icon || 'Gift'
    })
  }

  const getIconComponent = (iconName) => {
    const icons = {
      Gift, Trophy, Star, Coins, Calendar, Target, Users, Award, Crown, Flame
    }
    return icons[iconName] || Gift
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-500/10'
      case 'rare': return 'text-blue-400 bg-blue-500/10'
      case 'epic': return 'text-purple-400 bg-purple-500/10'
      case 'legendary': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
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

  const tabs = [
    { id: 'rewards', name: 'Redeemable Rewards', icon: Gift },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'challenges', name: 'Challenges', icon: Target },
    { id: 'users', name: 'User Rewards', icon: Users }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reward Management</h1>
          {activeTab !== 'users' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Redeemable Rewards */}
            {activeTab === 'rewards' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => {
                  const IconComponent = getIconComponent(reward.icon)
                  return (
                    <div key={reward.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      {editingItem === reward.id ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(reward.id) }}>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full mb-3 p-2 border border-gray-300 rounded"
                            placeholder="Title"
                            required
                          />
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full mb-3 p-2 border border-gray-300 rounded"
                            placeholder="Description"
                            rows="2"
                            required
                          />
                          <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value)})}
                            className="w-full mb-3 p-2 border border-gray-300 rounded"
                            placeholder="Cost"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="flex-1 bg-gray-600 text-white py-2 px-3 rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-2">
                              {reward.available ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                          <p className="text-gray-600 mb-4">{reward.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-gray-900">{reward.cost}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reward.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reward.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(reward)}
                              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(reward.id)}
                              className="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Achievements */}
            {activeTab === 'achievements' && (
              <div className="grid md:grid-cols-2 gap-6">
                {achievements.map((achievement) => {
                  const IconComponent = getIconComponent(achievement.icon)
                  return (
                    <div key={achievement.id} className={`bg-white border rounded-lg p-6 ${getRarityColor(achievement.rarity)}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(achievement)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{achievement.reward} points</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Challenges */}
            {activeTab === 'challenges' && (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600">{challenge.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{challenge.reward}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(challenge)}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* User Rewards */}
            {activeTab === 'users' && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userRewards.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.streak} days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalEarned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Title"
                  required
                />
                
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Description"
                  rows="3"
                  required
                />
                
                {activeTab === 'rewards' && (
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Cost in points"
                    required
                  />
                )}
                
                {(activeTab === 'achievements' || activeTab === 'challenges') && (
                  <input
                    type="number"
                    value={formData.reward}
                    onChange={(e) => setFormData({...formData, reward: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Reward points"
                    required
                  />
                )}
                
                {activeTab === 'achievements' && (
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                )}
                
                {activeTab === 'challenges' && (
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default RewardManagement