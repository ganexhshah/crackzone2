import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Crown, 
  Star, 
  Trophy, 
  Target, 
  Flame, 
  Search, 
  UserPlus, 
  X, 
  Save, 
  Edit, 
  Trash2, 
  UserMinus, 
  Settings,
  Copy,
  Check,
  Loader
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { teamsAPI } from '../services/api'

const Teams = () => {
  const [activeTab, setActiveTab] = useState('myTeams')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [joinRequests, setJoinRequests] = useState([])
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false)
  const [myJoinRequests, setMyJoinRequests] = useState([])
  
  const [createTeamData, setCreateTeamData] = useState({
    name: '',
    game: 'FreeFire',
    description: '',
    requirements: '',
    maxMembers: 4,
    isPrivate: false,
    avatar: '🎮'
  })

  const [editTeamData, setEditTeamData] = useState({
    name: '',
    game: 'FreeFire',
    description: '',
    requirements: '',
    maxMembers: 4,
    avatar: '🎮'
  })

  const [myTeams, setMyTeams] = useState([])
  const [availableTeams, setAvailableTeams] = useState([])

  const avatarOptions = ['🎮', '🔥', '⚔️', '👑', '⚡', '🏆', '🎯', '💀', '🚀', '⭐', '💎', '🦅']

  useEffect(() => {
    fetchMyTeams()
    fetchMyJoinRequests()
  }, [])

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableTeams()
    }
  }, [activeTab, searchQuery])

  useEffect(() => {
    if (isInviteModalOpen && selectedTeam) {
      // Load initial users when invite modal opens
      searchUsers('')
    }
  }, [isInviteModalOpen, selectedTeam])

  const fetchMyJoinRequests = async () => {
    try {
      const response = await teamsAPI.getMyJoinRequests()
      setMyJoinRequests(response.data.requests)
    } catch (err) {
      console.error('Fetch my join requests error:', err)
      setMyJoinRequests([])
    }
  }

  const fetchMyTeams = async () => {
    try {
      setLoading(true)
      const response = await teamsAPI.getMyTeams()
      setMyTeams(response.data.teams)
      setError('')
    } catch (err) {
      setError('Failed to load teams')
      console.error('Fetch my teams error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTeams = async () => {
    try {
      setLoading(true)
      const response = await teamsAPI.getAvailable({ search: searchQuery })
      setAvailableTeams(response.data.teams)
      setError('')
    } catch (err) {
      setError('Failed to load available teams')
      console.error('Fetch available teams error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyTeamCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await teamsAPI.create({
        name: createTeamData.name,
        game: createTeamData.game,
        description: createTeamData.description,
        requirements: createTeamData.requirements,
        maxMembers: createTeamData.maxMembers,
        isPrivate: createTeamData.isPrivate,
        avatar: createTeamData.avatar
      })
      
      setMyTeams([response.data.team, ...myTeams])
      setIsCreateModalOpen(false)
      setCreateTeamData({
        name: '',
        game: 'FreeFire',
        description: '',
        requirements: '',
        maxMembers: 4,
        isPrivate: false,
        avatar: '🎮'
      })
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async (teamId) => {
    // Find the team to check if there's already a pending request
    const team = availableTeams.find(t => t.id === teamId)
    if (team?.has_pending_request) {
      alert('You already have a pending join request for this team.')
      return
    }

    try {
      setLoading(true)
      const response = await teamsAPI.join(teamId, {})
      // Show success message
      alert(response.data.message || 'Join request sent successfully!')
      // Refresh available teams list and pending requests
      await fetchAvailableTeams()
      await fetchMyJoinRequests()
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send join request')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveTeam = async (teamId) => {
    try {
      setLoading(true)
      await teamsAPI.leave(teamId)
      await fetchMyTeams()
      setIsManageModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave team')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      await teamsAPI.delete(teamId)
      await fetchMyTeams()
      setIsManageModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete team')
    } finally {
      setLoading(false)
    }
  }

  const handleManageTeam = (team) => {
    setSelectedTeam(team)
    setIsManageModalOpen(true)
    // Fetch join requests if user is leader
    if (team.role === 'leader') {
      fetchJoinRequests(team.id)
    }
  }

  const handleEditTeam = (team) => {
    setSelectedTeam(team)
    setEditTeamData({
      name: team.name,
      game: team.game,
      description: team.description || '',
      requirements: team.requirements || '',
      maxMembers: team.maxMembers,
      avatar: team.avatar
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateTeam = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await teamsAPI.update(selectedTeam.id, editTeamData)
      await fetchMyTeams()
      setIsEditModalOpen(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    
    const userToInvite = selectedUser || (inviteUsername.trim() ? { username: inviteUsername.trim() } : null)
    
    if (!userToInvite) {
      setError('Please select a user or enter a username')
      return
    }

    try {
      setLoading(true)
      const inviteData = selectedUser 
        ? { userId: selectedUser.id }
        : { username: userToInvite.username }
        
      await teamsAPI.invite(selectedTeam.id, inviteData)
      setInviteUsername('')
      setSelectedUser(null)
      setUserSearchQuery('')
      setSearchedUsers([])
      setIsInviteModalOpen(false)
      setError('')
      // Show success message
      alert(`Invitation sent to ${userToInvite.username || selectedUser.username}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query = '') => {
    if (!selectedTeam) return
    
    try {
      const response = await teamsAPI.searchUsers(selectedTeam.id, { search: query })
      setSearchedUsers(response.data.users)
    } catch (err) {
      console.error('Search users error:', err)
      setSearchedUsers([])
    }
  }

  const handleUserSearch = (query) => {
    setUserSearchQuery(query)
    setSelectedUser(null)
    searchUsers(query)
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    setUserSearchQuery(user.username)
    setSearchedUsers([])
    setInviteUsername('')
  }

  const fetchJoinRequests = async (teamId) => {
    try {
      const response = await teamsAPI.getJoinRequests(teamId)
      setJoinRequests(response.data.requests)
    } catch (err) {
      console.error('Fetch join requests error:', err)
      setJoinRequests([])
    }
  }

  const handleJoinRequestAction = async (requestId, action) => {
    try {
      setLoading(true)
      if (action === 'approve') {
        await teamsAPI.approveJoinRequest(selectedTeam.id, requestId)
      } else {
        await teamsAPI.rejectJoinRequest(selectedTeam.id, requestId)
      }
      
      // Refresh join requests and team data
      await fetchJoinRequests(selectedTeam.id)
      await fetchMyTeams()
      // Also refresh available teams to update button states
      await fetchAvailableTeams()
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} join request`)
    } finally {
      setLoading(false)
    }
  }

  const handleViewJoinRequests = (team) => {
    setSelectedTeam(team)
    fetchJoinRequests(team.id)
    setIsJoinRequestsModalOpen(true)
  }

  const handleCancelJoinRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this join request?')) {
      return
    }

    try {
      setLoading(true)
      await teamsAPI.cancelJoinRequest(requestId)
      await fetchMyJoinRequests()
      // Also refresh available teams to update button states
      await fetchAvailableTeams()
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel join request')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      setLoading(true)
      await teamsAPI.removeMember(selectedTeam.id, memberId)
      await fetchMyTeams()
      // Update selected team members list
      const updatedMembers = selectedTeam.membersList.filter(m => m.id !== memberId)
      setSelectedTeam({...selectedTeam, membersList: updatedMembers})
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const TeamCard = ({ team, isMyTeam = false }) => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 hover:border-crackzone-yellow/40 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center text-2xl">
            {team.avatar}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {team.name}
              {isMyTeam && team.role === 'leader' && (
                <Crown className="w-4 h-4 text-crackzone-yellow" />
              )}
            </h3>
            <p className="text-sm text-gray-400">{team.game}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          team.rank === 'Platinum' ? 'bg-cyan-500/20 text-cyan-400' :
          team.rank === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {team.rank}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase">Members</p>
          <p className="text-lg font-bold text-white">{team.members}/{team.maxMembers}</p>
        </div>
        {isMyTeam ? (
          <div>
            <p className="text-xs text-gray-400 uppercase">W/L Ratio</p>
            <p className="text-lg font-bold text-crackzone-yellow">{team.wins}/{team.losses}</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 uppercase">Requirements</p>
            <p className="text-sm font-medium text-white">{team.requirements}</p>
          </div>
        )}
      </div>

      {isMyTeam && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase mb-2">Your Role</p>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            team.role === 'leader' ? 'bg-crackzone-yellow/20 text-crackzone-yellow' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {team.role}
          </span>
        </div>
      )}

      <button 
        onClick={() => isMyTeam ? handleManageTeam(team) : handleJoinTeam(team.id)}
        disabled={loading || (!isMyTeam && team.has_pending_request)}
        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
          isMyTeam 
            ? 'bg-crackzone-yellow/20 text-crackzone-yellow border border-crackzone-yellow/30 hover:bg-crackzone-yellow/30'
            : team.has_pending_request
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            : 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400'
        }`}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {isMyTeam 
          ? 'Manage Team' 
          : team.has_pending_request 
          ? 'Request Pending' 
          : 'Request to Join'
        }
      </button>
    </div>
  )

  if (loading && myTeams.length === 0 && availableTeams.length === 0) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
            <p className="text-gray-400">Manage your teams and find new ones to join</p>
            <p className="text-sm text-yellow-400 mt-1">
              <Crown className="w-4 h-4 inline mr-1" />
              One team per player rule: You can only create and join one team at a time
            </p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-crackzone-yellow text-crackzone-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </button>
        </div>

        {/* Pending Join Requests */}
        {myJoinRequests.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-orange-400 mb-3">Pending Join Requests ({myJoinRequests.length})</h3>
            <div className="space-y-3">
              {myJoinRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between bg-crackzone-black/30 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{request.team_name}</p>
                    <p className="text-sm text-gray-400">{request.game} • Requested {new Date(request.created_at).toLocaleDateString()}</p>
                    {request.message && (
                      <p className="text-sm text-gray-300 mt-1">"{request.message}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelJoinRequest(request.id)}
                    disabled={loading}
                    className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-crackzone-gray/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('myTeams')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'myTeams'
                ? 'bg-crackzone-yellow text-crackzone-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Teams ({myTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-crackzone-yellow text-crackzone-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Available Teams ({availableTeams.length})
          </button>
        </div>

        {/* Search Bar for Available Teams */}
        {activeTab === 'available' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
            />
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'myTeams' 
            ? myTeams.map((team) => (
                <TeamCard key={team.id} team={team} isMyTeam={true} />
              ))
            : availableTeams.map((team) => (
                <TeamCard key={team.id} team={team} isMyTeam={false} />
              ))
          }
        </div>

        {/* Empty State */}
        {((activeTab === 'myTeams' && myTeams.length === 0) || 
          (activeTab === 'available' && availableTeams.length === 0)) && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {activeTab === 'myTeams' ? 'No teams yet' : 'No available teams'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'myTeams' 
                ? 'Create your first team or join an existing one. Remember: you can only be in one team at a time.'
                : 'Check back later for new teams looking for members'
              }
            </p>
            {activeTab === 'myTeams' && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-crackzone-yellow text-crackzone-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Team
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Team</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* One Team Rule Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Crown className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Team Creation Rules</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• You can only have one team at a time</li>
                    <li>• You can only be a member of one team at a time</li>
                    <li>• Delete your current team to create a new one</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  required
                  value={createTeamData.name}
                  onChange={(e) => setCreateTeamData({...createTeamData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
                <select
                  value={createTeamData.game}
                  onChange={(e) => setCreateTeamData({...createTeamData, game: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                >
                  <option value="FreeFire">FreeFire</option>
                  <option value="PUBG">PUBG Mobile</option>
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Call of Duty">Call of Duty Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setCreateTeamData({...createTeamData, avatar})}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        createTeamData.avatar === avatar 
                          ? 'bg-crackzone-yellow/30 ring-2 ring-crackzone-yellow' 
                          : 'bg-crackzone-black/30 hover:bg-crackzone-yellow/20'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={createTeamData.description}
                  onChange={(e) => setCreateTeamData({...createTeamData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow resize-none"
                  placeholder="Describe your team..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <input
                  type="text"
                  value={createTeamData.requirements}
                  onChange={(e) => setCreateTeamData({...createTeamData, requirements: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                  placeholder="e.g., Min. Gold Rank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Members</label>
                <select
                  value={createTeamData.maxMembers}
                  onChange={(e) => setCreateTeamData({...createTeamData, maxMembers: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                >
                  <option value={2}>2 Members</option>
                  <option value={3}>3 Members</option>
                  <option value={4}>4 Members</option>
                  <option value={5}>5 Members</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-medium">Private Team</p>
                  <p className="text-sm text-gray-400">Require approval to join</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateTeamData({...createTeamData, isPrivate: !createTeamData.isPrivate})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    createTeamData.isPrivate ? 'bg-crackzone-yellow' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      createTeamData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {isManageModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Manage {selectedTeam.name}</h2>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center text-3xl">
                    {selectedTeam.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedTeam.name}</h3>
                    <p className="text-gray-400">{selectedTeam.game}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400">Team Code:</span>
                      <span className="text-crackzone-yellow font-mono">{selectedTeam.teamCode}</span>
                      <button 
                        onClick={() => copyTeamCode(selectedTeam.teamCode)}
                        className="text-gray-400 hover:text-crackzone-yellow transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-crackzone-yellow">{selectedTeam.wins}</p>
                    <p className="text-xs text-gray-400">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400">{selectedTeam.losses}</p>
                    <p className="text-xs text-gray-400">Losses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{selectedTeam.rank}</p>
                    <p className="text-xs text-gray-400">Rank</p>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Team Members ({selectedTeam.membersList?.length || 0}/{selectedTeam.maxMembers})</h4>
                  {selectedTeam.role === 'leader' && (selectedTeam.membersList?.length || 0) < selectedTeam.maxMembers && (
                    <button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-crackzone-yellow/20 text-crackzone-yellow px-4 py-2 rounded-lg font-medium hover:bg-crackzone-yellow/30 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {selectedTeam.membersList?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-crackzone-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          member.status === 'online' ? 'bg-green-400' :
                          member.status === 'away' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {member.name}
                            {member.role === 'leader' && <Crown className="w-4 h-4 text-crackzone-yellow" />}
                          </p>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      
                      {selectedTeam.role === 'leader' && member.role !== 'leader' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-400">
                      No members found
                    </div>
                  )}
                </div>
              </div>

              {/* Team Actions */}
              {selectedTeam.role === 'leader' && (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleViewJoinRequests(selectedTeam)}
                    className="w-full bg-blue-500/20 text-blue-400 py-3 rounded-lg font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    View Join Requests ({joinRequests.length})
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEditTeam(selectedTeam)}
                      className="flex-1 bg-crackzone-yellow/20 text-crackzone-yellow py-3 rounded-lg font-medium hover:bg-crackzone-yellow/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Team
                    </button>
                    <button 
                      onClick={() => handleDeleteTeam(selectedTeam.id)}
                      disabled={loading}
                      className="flex-1 bg-red-500/20 text-red-400 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {loading ? 'Deleting...' : 'Delete Team'}
                    </button>
                  </div>
                </div>
              )}
              
              {selectedTeam.role === 'member' && (
                <button 
                  onClick={() => handleLeaveTeam(selectedTeam.id)}
                  disabled={loading}
                  className="w-full bg-red-500/20 text-red-400 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                  {loading ? 'Leaving...' : 'Leave Team'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Team</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  required
                  value={editTeamData.name}
                  onChange={(e) => setEditTeamData({...editTeamData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
                <select
                  value={editTeamData.game}
                  onChange={(e) => setEditTeamData({...editTeamData, game: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                >
                  <option value="FreeFire">FreeFire</option>
                  <option value="PUBG">PUBG Mobile</option>
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Call of Duty">Call of Duty Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setEditTeamData({...editTeamData, avatar})}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        editTeamData.avatar === avatar 
                          ? 'bg-crackzone-yellow/30 ring-2 ring-crackzone-yellow' 
                          : 'bg-crackzone-black/30 hover:bg-crackzone-yellow/20'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editTeamData.description}
                  onChange={(e) => setEditTeamData({...editTeamData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow resize-none"
                  placeholder="Describe your team..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <input
                  type="text"
                  value={editTeamData.requirements}
                  onChange={(e) => setEditTeamData({...editTeamData, requirements: e.target.value})}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                  placeholder="e.g., Min. Gold Rank"
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
                  disabled={loading}
                  className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Invite Member</h2>
              <button 
                onClick={() => {
                  setIsInviteModalOpen(false)
                  setUserSearchQuery('')
                  setSearchedUsers([])
                  setSelectedUser(null)
                  setInviteUsername('')
                  setError('')
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {userSearchQuery ? 'Search Results' : 'Available Users'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                    placeholder="Search for users to invite..."
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Search Results */}
                {searchedUsers.length > 0 && (
                  <div className="mt-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg max-h-40 overflow-y-auto">
                    {searchedUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="w-full px-4 py-3 text-left hover:bg-crackzone-yellow/10 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-crackzone-yellow" />
                        </div>
                        <span className="text-white">{user.username}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchedUsers.length === 0 && (
                  <div className="mt-2 text-sm text-gray-400 text-center py-2">
                    {userSearchQuery ? 'No users found' : 'No available users to invite'}
                  </div>
                )}
              </div>

              <div className="text-center text-gray-400">
                <span className="text-sm">or</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter Username Manually</label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => {
                    setInviteUsername(e.target.value)
                    setSelectedUser(null)
                    setUserSearchQuery('')
                    setSearchedUsers([])
                  }}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
                  placeholder="Enter username to invite"
                />
              </div>

              {selectedUser && (
                <div className="bg-crackzone-yellow/10 border border-crackzone-yellow/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-crackzone-yellow" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedUser.username}</p>
                      <p className="text-sm text-gray-400">Selected for invitation</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-crackzone-black/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Team: {selectedTeam.name}</p>
                <p className="text-sm text-gray-400">Available slots: {selectedTeam.maxMembers - (selectedTeam.membersList?.length || 0)}</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false)
                    setUserSearchQuery('')
                    setSearchedUsers([])
                    setSelectedUser(null)
                    setInviteUsername('')
                    setError('')
                  }}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!selectedUser && !inviteUsername.trim())}
                  className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Requests Modal */}
      {isJoinRequestsModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Join Requests - {selectedTeam.name}</h2>
              <button 
                onClick={() => {
                  setIsJoinRequestsModalOpen(false)
                  setJoinRequests([])
                  setError('')
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {joinRequests.length > 0 ? (
                joinRequests.map((request) => (
                  <div key={request.id} className="bg-crackzone-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-crackzone-yellow" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{request.username}</h4>
                          <p className="text-sm text-gray-400">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-300 mt-1">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinRequestAction(request.id, 'approve')}
                          disabled={loading}
                          className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequestAction(request.id, 'reject')}
                          disabled={loading}
                          className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Join Requests</h3>
                  <p className="text-gray-500">No pending join requests for this team.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileBottomMenu />
    </div>
  )
}

export default Teams