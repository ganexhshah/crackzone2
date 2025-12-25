import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Trophy, Calendar, Users, Clock, Target, Flame, 
  CheckCircle, AlertCircle, Copy, Eye, EyeOff 
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const MyMatches = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchMyRegistrations()
  }, [isAuthenticated, navigate])

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true)
      const response = await tournamentsAPI.getMyRegistrations()
      setRegistrations(response.data.registrations)
    } catch (err) {
      console.error('Failed to fetch registrations:', err)
      setError('Failed to load your matches')
    } finally {
      setLoading(false)
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400'
      case 'live': return 'bg-green-500/20 text-green-400'
      case 'completed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTournamentTypeColor = (type) => {
    switch (type) {
      case 'SOLO': return 'bg-purple-500/20 text-purple-400'
      case 'DUO': return 'bg-blue-500/20 text-blue-400'
      case 'SQUAD': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  // Categorize registrations by tournament status
  const categorizedRegistrations = {
    upcoming: registrations.filter(r => r.status === 'upcoming'),
    live: registrations.filter(r => r.status === 'live'),
    completed: registrations.filter(r => r.status === 'completed')
  }

  const tabs = [
    { id: 'upcoming', name: 'Upcoming', count: categorizedRegistrations.upcoming.length },
    { id: 'live', name: 'Live', count: categorizedRegistrations.live.length },
    { id: 'completed', name: 'Completed', count: categorizedRegistrations.completed.length }
  ]

  const MatchCard = ({ registration }) => {
    const GameIcon = getGameIcon(registration.game)
    const [showRoomPassword, setShowRoomPassword] = useState(false)
    
    return (
      <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 hover:border-crackzone-yellow/40 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
              <GameIcon className="w-6 h-6 text-crackzone-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{registration.title}</h3>
              <p className="text-sm text-gray-400">{registration.game}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
              {registration.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTournamentTypeColor(registration.tournament_type)}`}>
              {registration.tournament_type}
            </span>
          </div>
        </div>

        {/* Registration Details */}
        <div className="mb-4 p-4 bg-crackzone-black/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Your Registration</h4>
          {registration.registration_type === 'SOLO' ? (
            <div className="space-y-1">
              <p className="text-white"><span className="text-gray-400">IGN:</span> {registration.ign}</p>
              <p className="text-white"><span className="text-gray-400">UID:</span> {registration.uid}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white font-medium">{registration.team_name}</p>
              <div className="space-y-1">
                {registration.team_members?.map((member, index) => (
                  <p key={index} className="text-sm text-gray-300">
                    {member.ign} ({member.role})
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Room Details (if available) */}
        {registration.room_id && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Room Details Available
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Room ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-crackzone-yellow">{registration.room_id}</p>
                  <button 
                    onClick={() => copyToClipboard(registration.room_id)}
                    className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Password</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-crackzone-yellow">
                    {showRoomPassword ? registration.room_password : '••••••'}
                  </p>
                  <button 
                    onClick={() => setShowRoomPassword(!showRoomPassword)}
                    className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                  >
                    {showRoomPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(registration.room_password)}
                    className="p-1 text-gray-400 hover:text-crackzone-yellow transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase">Prize Pool</p>
            <p className="text-lg font-bold text-crackzone-yellow">
              ₹{Number(registration.prize_pool).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Entry Fee</p>
            <p className="text-lg font-bold text-white">
              {registration.entry_fee > 0 ? `₹${Number(registration.entry_fee).toLocaleString()}` : 'Free'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(registration.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4" />
            <span>Registered: {formatDate(registration.registered_at)}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/tournaments/${registration.id}`)}
          className="w-full py-3 rounded-lg font-bold transition-all bg-crackzone-yellow/20 text-crackzone-yellow hover:bg-crackzone-yellow hover:text-crackzone-black"
        >
          View Tournament
        </button>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Matches</h1>
          <p className="text-gray-400">Track your tournament registrations and match details</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-crackzone-gray/30 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-crackzone-yellow text-crackzone-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your matches...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Matches</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchMyRegistrations}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedRegistrations[activeTab].map((registration) => (
              <MatchCard key={`${registration.id}-${registration.registered_at}`} registration={registration} />
            ))}
          </div>
        )}

        {!loading && !error && categorizedRegistrations[activeTab].length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No matches found</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'upcoming' 
                ? "You haven't registered for any upcoming tournaments yet" 
                : `No ${activeTab} matches found`}
            </p>
            <button 
              onClick={() => navigate('/tournaments')}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Browse Tournaments
            </button>
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default MyMatches