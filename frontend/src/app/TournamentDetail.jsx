import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Trophy, Calendar, Users, Star, Clock, Target, Flame, 
  ArrowLeft, CheckCircle, AlertCircle, Copy, Eye, EyeOff, 
  FileText, X, Wallet, AlertTriangle
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Import the api instance from services
import axios from 'axios'

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // Production - use environment variable or default
    return import.meta.env.VITE_API_URL || 'https://crackzone2.onrender.com/api';
  } else {
    // Development
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Create profile API using the same pattern as other APIs
const profileAPI = {
  getCurrentProfile: () => {
    const token = localStorage.getItem('authToken')
    return axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  }
}

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
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showJoinConfirmation, setShowJoinConfirmation] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [userReadyStatus, setUserReadyStatus] = useState(false)
  const [reportData, setReportData] = useState({ type: 'cheating', description: '' })
  const [userProfile, setUserProfile] = useState(null)

  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    ign: '',
    uid: '',
    teamName: '',
    members: []
  })

  useEffect(() => {
    fetchTournamentDetails()
    if (isAuthenticated) {
      fetchUserProfile()
    }
  }, [id, isAuthenticated])

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getCurrentProfile()
      setUserProfile(response.data)
      
      // Pre-populate registration data with user's game profile
      if (response.data.gameProfiles && response.data.gameProfiles.length > 0) {
        // Find the primary game profile or the first one
        const primaryProfile = response.data.gameProfiles.find(gp => gp.is_primary) || response.data.gameProfiles[0]
        setRegistrationData(prev => ({
          ...prev,
          ign: primaryProfile.game_username || primaryProfile.game_uid || '',
          uid: primaryProfile.game_uid || ''
        }))
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  }

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
        // Validate required fields
        if (!registrationData.ign || !registrationData.uid) {
          alert('Please ensure your game profile is complete with IGN and UID')
          return
        }
        
        await tournamentsAPI.registerSolo(id, {
          ign: registrationData.ign,
          uid: registrationData.uid
        })
      } else {
        // Validate team registration
        if (!registrationData.teamName) {
          alert('Please enter a team name')
          return
        }
        
        const validMembers = registrationData.members.filter(member => member.ign && member.uid)
        if (validMembers.length === 0) {
          alert('Please add at least one team member with IGN and UID')
          return
        }
        
        await tournamentsAPI.registerTeam(id, {
          teamName: registrationData.teamName,
          members: validMembers.map((member, index) => ({
            ...member,
            userId: index === 0 ? user.id : null, // First member is captain
            role: index === 0 ? 'captain' : 'member'
          }))
        })
      }
      
      setShowRegistrationModal(false)
      setShowJoinConfirmation(false)
      // Refresh tournament data to update registration status
      await fetchTournamentDetails()
      alert('Successfully registered!')
    } catch (err) {
      console.error('Registration failed:', err)
      alert(err.response?.data?.error || 'Registration failed')
    }
  }

  const handleJoinClick = () => {
    if (tournament.entry_fee > 0) {
      setShowJoinConfirmation(true)
    } else {
      setShowRegistrationModal(true)
    }
  }

  const confirmJoinTournament = () => {
    setShowJoinConfirmation(false)
    setShowRegistrationModal(true)
  }

  const handleReadyToggle = async () => {
    try {
      // Toggle ready status
      const newStatus = !userReadyStatus
      await tournamentsAPI.updateReadyStatus(id, newStatus)
      setUserReadyStatus(newStatus)
      alert(newStatus ? 'Marked as Ready!' : 'Marked as Not Ready')
    } catch (err) {
      console.error('Failed to update ready status:', err)
      alert('Failed to update ready status')
    }
  }

  const handleReport = async () => {
    try {
      // Submit report
      await tournamentsAPI.submitReport(id, reportData)
      alert('Report submitted successfully!')
      setShowReportModal(false)
      setReportData({ type: 'cheating', description: '' })
    } catch (err) {
      console.error('Failed to submit report:', err)
      alert('Failed to submit report')
    }
  }

  // Tournament rules data
  const tournamentRules = [
    {
      title: "General Rules",
      rules: [
        "All participants must be registered before the tournament starts",
        "Entry fees are non-refundable once paid",
        "Players must use their registered IGN (In-Game Name)",
        "Any form of cheating or hacking will result in immediate disqualification",
        "Tournament organizers' decisions are final"
      ]
    },
    {
      title: "Game Rules",
      rules: [
        "Play fair and respect other players",
        "Use of any third-party software is strictly prohibited",
        "Players must join the room with the provided room ID and password",
        "Late entries will not be accepted after the match starts",
        "Screenshots of results may be required for verification"
      ]
    },
    {
      title: "Prize Distribution",
      rules: [
        "Prizes will be distributed within 24-48 hours after tournament completion",
        "Winners must provide valid payment details for prize transfer",
        "Tax deductions may apply as per local regulations",
        "Disputes regarding results must be raised within 2 hours of match completion"
      ]
    },
    {
      title: "Code of Conduct",
      rules: [
        "Maintain respectful behavior towards all participants",
        "No offensive language or harassment will be tolerated",
        "Follow all platform-specific community guidelines",
        "Report any suspicious activity to tournament moderators"
      ]
    }
  ]

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
    // Match admin panel logic: registration is open when status is 'active'
    return tournament.status === 'active' && tournament.registered_count < tournament.max_participants
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
                        <p className="text-white font-medium">
                          {tournament.registration_end ? formatDate(tournament.registration_end) : 'When tournament starts'}
                        </p>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Registration</h3>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Rules
                </button>
              </div>
              
              {tournament.is_registered ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Successfully Registered</p>
                    <p className="text-sm text-gray-400 mt-1">
                      You are registered for this tournament
                    </p>
                  </div>
                  
                  {/* Dynamic buttons based on tournament status */}
                  {tournament.status === 'live' && (
                    <div className="space-y-2">
                      <button 
                        onClick={handleReadyToggle}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${
                          userReadyStatus 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400'
                        }`}
                      >
                        {userReadyStatus ? '✓ Ready!' : 'I am Ready'}
                      </button>
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="w-full py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Report Issue
                      </button>
                    </div>
                  )}
                  
                  {tournament.status === 'completed' && (
                    <button 
                      onClick={() => setShowResultsModal(true)}
                      className="w-full py-3 rounded-lg font-bold transition-all bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View Results
                    </button>
                  )}
                </div>
              ) : isRegistrationOpen() ? (
                <button 
                  onClick={handleJoinClick}
                  className="w-full py-3 rounded-lg font-bold transition-all bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400"
                >
                  Register Now
                  {tournament.entry_fee > 0 && (
                    <span className="block text-sm font-normal mt-1">
                      Entry Fee: ₹{tournament.entry_fee}
                    </span>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 font-medium">Registration Closed</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {tournament.registered_count >= tournament.max_participants ? 'Tournament is full' : 'Registration is currently closed'}
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
                {userProfile && userProfile.gameProfiles && userProfile.gameProfiles.length > 0 ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Using your saved game profile</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">In-Game Name (IGN)</label>
                        <div className="px-3 py-2 bg-crackzone-black/50 border border-green-500/20 rounded-lg text-green-400 font-medium">
                          {registrationData.ign}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">User ID (UID)</label>
                        <div className="px-3 py-2 bg-crackzone-black/50 border border-green-500/20 rounded-lg text-green-400 font-medium">
                          {registrationData.uid}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      This information is from your game profile. To change it, update your profile settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">No game profile found</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Please complete your game profile setup first, or enter your details below.
                      </p>
                    </div>
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
                )}
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
                disabled={tournament.tournament_type === 'SOLO' && (!registrationData.ign || !registrationData.uid)}
                className="flex-1 py-2 px-4 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tournament.tournament_type === 'SOLO' && userProfile?.gameProfiles?.length > 0 
                  ? 'Register with Profile' 
                  : 'Register'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Tournament Rules</h3>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="p-2 hover:bg-crackzone-yellow/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {tournamentRules.map((section, index) => (
                <div key={index} className="bg-crackzone-black/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-crackzone-yellow mb-3">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start gap-2 text-gray-300">
                        <span className="text-crackzone-yellow mt-1">•</span>
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">Important Notice</span>
              </div>
              <p className="text-sm text-red-300">
                Entry fees are non-refundable once paid. Please read all rules carefully before registering.
              </p>
            </div>

            <button 
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-4 py-2 px-4 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Join Confirmation Modal */}
      {showJoinConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Confirm Registration</h3>
              <p className="text-gray-400 mb-4">
                You are about to register for this tournament
              </p>

              <div className="bg-crackzone-black/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Tournament:</span>
                  <span className="text-white font-medium">{tournament?.title}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="text-crackzone-yellow font-bold">₹{tournament?.entry_fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">Non-Refundable</span>
                </div>
                <p className="text-xs text-red-300">
                  Entry fees will be deducted from your wallet and are non-refundable once paid.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowJoinConfirmation(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmJoinTournament}
                  className="flex-1 py-2 px-4 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">🏆 Tournament Results</h3>
              <button 
                onClick={() => setShowResultsModal(false)}
                className="p-2 hover:bg-crackzone-yellow/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Winner Announcement */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-6">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">🎉 Congratulations!</h2>
                <p className="text-xl text-white font-semibold">
                  {leaderboard.length > 0 ? (
                    tournament.tournament_type === 'SOLO' 
                      ? leaderboard[0]?.ign 
                      : leaderboard[0]?.team_name
                  ) : 'Winner TBD'}
                </p>
                <p className="text-gray-300 mt-2">
                  Prize: ₹{tournament.prize_pool ? Math.floor(tournament.prize_pool * 0.6).toLocaleString() : '0'}
                </p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Final Rankings</h4>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                      index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                      index === 2 ? 'bg-orange-600/20 border border-orange-600/30' :
                      'bg-crackzone-black/30'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-crackzone-gray text-white'
                        }`}>
                          {entry.placement || index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {tournament.tournament_type === 'SOLO' ? entry.ign : entry.team_name}
                          </p>
                          {tournament.tournament_type !== 'SOLO' && entry.members && (
                            <p className="text-sm text-gray-400">
                              {entry.members.map(m => m.ign).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-crackzone-yellow font-bold text-lg">{entry.points || 0} pts</p>
                        <p className="text-sm text-gray-400">{entry.kills || 0} kills</p>
                        {index < 3 && (
                          <p className="text-xs text-green-400 font-semibold">
                            ₹{tournament.prize_pool ? 
                              Math.floor(tournament.prize_pool * (index === 0 ? 0.6 : index === 1 ? 0.3 : 0.1)).toLocaleString() 
                              : '0'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Results will be published soon</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowResultsModal(false)}
                className="py-2 px-6 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-crackzone-gray border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Report Issue</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-crackzone-yellow/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                <select
                  value={reportData.type}
                  onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
                >
                  <option value="cheating">Cheating/Hacking</option>
                  <option value="inappropriate_behavior">Inappropriate Behavior</option>
                  <option value="technical_issue">Technical Issue</option>
                  <option value="unfair_play">Unfair Play</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-crackzone-black/50 border border-crackzone-yellow/20 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow h-24 resize-none"
                  placeholder="Please describe the issue in detail..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> False reports may result in penalties. Please provide accurate information.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReport}
                disabled={!reportData.description.trim()}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
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