import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Trophy, Calendar, Users, Star, Clock, Target, Flame, 
  ArrowLeft, CheckCircle, AlertCircle, Copy, Eye, EyeOff 
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TournamentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [tournament, setTournament] = useState(null)
  const [participants, setParticipants] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showRoomPassword, setShowRoomPassword] = useState(false)

  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    ign: '',
    uid: '',
    teamName: '',
    members: []
  })

  useEffect(() => {
    fetchTournamentDetails()
  }, [id])

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true)
      const response = await tournamentsAPI.getById(id)
      setTournament(response.data.tournament)
      setParticipants(response.data.participants)
      setLeaderboard(response.data.leaderboard)
      
      // Initialize registration form based on tournament type
      if (response.data.tournament.tournament_type !== 'SOLO') {
        const memberCount = response.data.tournament.tournament_type === 'DUO' ? 2 : 4
        setRegistrationData(prev => ({
          ...prev,
          members: Array(memberCount).fill({ ign: '', uid: '' })
        }))
      }
    } catch (err) {
      console.error('Failed to fetch tournament:', err)
      setError('Failed to load tournament details')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      if (tournament.tournament_type === 'SOLO') {
        await tournamentsAPI.registerSolo(id, {
          ign: registrationData.ign,
          uid: registrationData.uid
        })
      } else {
        await tournamentsAPI.registerTeam(id, {
          teamName: registrationData.teamName,
          members: registrationData.members.map((member, index) => ({
            ...member,
            userId: index === 0 ? user.id : null, // First member is captain
            role: index === 0 ? 'captain' : 'member'
          }))
        })
      }
      
      setShowRegistrationModal(false)
      // Refresh tournament data to update registration status
      await fetchTournamentDetails()
      alert('Successfully registered!')
    } catch (err) {
      console.error('Registration failed:', err)
      alert(err.response?.data?.error || 'Registration failed')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getGameIcon = (game) => {
    switch (game.toLowerCase()) {
      case 'freefire':
      case 'free fire':
        return Flame
      case 'pubg':
        return Target
      default:
        return Trophy
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400'
      case 'live': return 'bg-green-500/20 text-green-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const isRegistrationOpen = () => {
    if (!tournament) return false
    const now = new Date()
    const regEnd = new Date(tournament.registration_end)
    return now < regEnd && tournament.registered_count < tournament.max_participants
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow"></div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Tournament Not Found</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/tournaments')}
            className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  const GameIcon = getGameIcon(tournament.game)

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/tournaments')}
            className="p-2 rounded-lg bg-crackzone-gray/50 border border-crackzone-yellow/20 text-gray-300 hover:text-crackzone-yellow hover:border-crackzone-yellow/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{tournament.title}</h1>
            <p className="text-gray-400">{tournament.game} • {tournament.tournament_type}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Info Card */}
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-crackzone-yellow/20 rounded-xl flex items-center justify-center">
                    <GameIcon className="w-8 h-8 text-crackzone-yellow" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{tournament.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {tournament.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-crackzone-yellow/20 text-crackzone-yellow">
                        {tournament.tournament_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">Prize Pool</p>
                  <p className="text-xl font-bold text-crackzone-yellow">
                    ₹{Number(tournament.prize_pool).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">Entry Fee</p>
                  <p className="text-xl font-bold text-white">
                    {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">Registered</p>
                  <p className="text-xl font-bold text-white">
                    {tournament.registered_count}/{tournament.max_participants}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">Slots Left</p>
                  <p className="text-xl font-bold text-green-400">
                    {tournament.max_participants - tournament.registered_count}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Schedule</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-crackzone-black/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-crackzone-yellow" />
                      <div>
                        <p className="text-sm text-gray-400">Tournament Start</p>
                        <p className="text-white font-medium">{formatDate(tournament.start_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-crackzone-black/30 rounded-lg">
                      <Clock className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-sm text-gray-400">Registration Ends</p>
                        <p className="text-white font-medium">{formatDate(tournament.registration_end)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {tournament.description && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                    <p className="text-gray-300">{tournament.description}</p>
                  </div>
                )}

                {tournament.rules && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Rules</h3>
                    <p className="text-gray-300 whitespace-pre-line">{tournament.rules}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Room Details (if available) */}
            {tournament.room_id && (
              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Room Details Available
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-crackzone-black/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Room ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-mono font-bold text-crackzone-yellow">{tournament.room_id}</p>
                      <button 
                        onClick={() => copyToClipboard(tournament.room_id)}
                        className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-crackzone-black/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Room Password</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-mono font-bold text-crackzone-yellow">
                        {showRoomPassword ? tournament.room_password : '••••••••'}
                      </p>
                      <button 
                        onClick={() => setShowRoomPassword(!showRoomPassword)}
                        className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                      >
                        {showRoomPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(tournament.room_password)}
                        className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-crackzone-black/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-crackzone-gray text-white'
                        }`}>
                          {entry.placement}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {tournament.tournament_type === 'SOLO' ? entry.ign : entry.team_name}
                          </p>
                          {tournament.tournament_type !== 'SOLO' && (
                            <p className="text-sm text-gray-400">
                              {entry.members?.map(m => m.ign).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-crackzone-yellow font-bold">{entry.points} pts</p>
                        <p className="text-sm text-gray-400">{entry.kills} kills</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Registration</h3>
              
              {tournament.is_registered ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Successfully Registered</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You are registered for this tournament
                  </p>
                </div>
              ) : isRegistrationOpen() ? (
                <button 
                  onClick={() => setShowRegistrationModal(true)}
                  className="w-full py-3 rounded-lg font-bold transition-all bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400"
                >
                  Register Now
                </button>
              ) : (
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-medium">Registration Closed</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {tournament.registered_count >= tournament.max_participants ? 'Tournament is full' : 'Registration period ended'}
                  </p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Participants ({tournament.registered_count})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 bg-crackzone-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-full flex items-center justify-center text-xs font-bold text-crackzone-yellow">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {tournament.tournament_type === 'SOLO' ? participant.ign : participant.team_name}
                      </p>
                      {tournament.tournament_type !== 'SOLO' && participant.members && (
                        <p className="text-xs text-gray-400">
                          {participant.members.map(m => m.ign).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Register for {tournament.tournament_type} Tournament
            </h3>
            
            {tournament.tournament_type === 'SOLO' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">In-Game Name (IGN)</label>
                  <input
                    type="text"
                    value={registrationData.ign}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, ign: e.target.value }))}
                    className="w-full px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                    placeholder="Enter your IGN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User ID (UID)</label>
                  <input
                    type="text"
                    value={registrationData.uid}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, uid: e.target.value }))}
                    className="w-full px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                    placeholder="Enter your UID"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={registrationData.teamName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                    placeholder="Enter team name"
                  />
                </div>
                {registrationData.members.map((member, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">
                      Player {index + 1} {index === 0 && '(Captain)'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={member.ign}
                        onChange={(e) => {
                          const newMembers = [...registrationData.members]
                          newMembers[index] = { ...newMembers[index], ign: e.target.value }
                          setRegistrationData(prev => ({ ...prev, members: newMembers }))
                        }}
                        className="px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                        placeholder="IGN"
                      />
                      <input
                        type="text"
                        value={member.uid}
                        onChange={(e) => {
                          const newMembers = [...registrationData.members]
                          newMembers[index] = { ...newMembers[index], uid: e.target.value }
                          setRegistrationData(prev => ({ ...prev, members: newMembers }))
                        }}
                        className="px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                        placeholder="UID"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowRegistrationModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRegistration}
                className="flex-1 py-2 px-4 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomMenu />
    </div>
  )
}

export default TournamentDetail