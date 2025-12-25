import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Calendar, Users, Star, Clock, Target, Flame, Filter, Search, CheckCircle } from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Tournaments = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('live')
  const [searchTerm, setSearchTerm] = useState('')
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await tournamentsAPI.getAll()
      setTournaments(response.data.tournaments)
    } catch (err) {
      console.error('Failed to fetch tournaments:', err)
      setError('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  // Categorize tournaments by status
  const categorizedTournaments = {
    live: tournaments.filter(t => t.status === 'live' || t.status === 'upcoming'),
    upcoming: tournaments.filter(t => t.status === 'upcoming'),
    completed: tournaments.filter(t => t.status === 'completed')
  }

  // Filter tournaments by search term
  const filteredTournaments = categorizedTournaments[activeTab].filter(tournament =>
    tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.tournament_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'live', name: 'Live', count: categorizedTournaments.live.length },
    { id: 'upcoming', name: 'Upcoming', count: categorizedTournaments.upcoming.length },
    { id: 'completed', name: 'Completed', count: categorizedTournaments.completed.length }
  ]

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
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Started'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
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

  const isRegistrationOpen = (tournament) => {
    const now = new Date()
    const regEnd = new Date(tournament.registration_end)
    return now < regEnd && tournament.registered_count < tournament.max_participants
  }

  const TournamentCard = ({ tournament }) => {
    const GameIcon = getGameIcon(tournament.game)
    
    return (
      <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 hover:border-crackzone-yellow/40 transition-all cursor-pointer"
           onClick={() => navigate(`/tournaments/${tournament.id}`)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
              <GameIcon className="w-6 h-6 text-crackzone-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{tournament.title}</h3>
              <p className="text-sm text-gray-400">{tournament.game}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
              {tournament.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTournamentTypeColor(tournament.tournament_type)}`}>
              {tournament.tournament_type}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase">Prize Pool</p>
            <p className="text-lg font-bold text-crackzone-yellow">
              ₹{tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Entry Fee</p>
            <p className="text-lg font-bold text-white">
              {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>{tournament.registered_count || 0}/{tournament.max_participants}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatDate(tournament.start_date)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {tournament.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {tournament.is_registered ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Registered
              </div>
            ) : isRegistrationOpen(tournament) ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Registration Open
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                Registration Closed
              </div>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/tournaments/${tournament.id}`)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tournament.is_registered 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-crackzone-yellow/20 text-crackzone-yellow hover:bg-crackzone-yellow hover:text-crackzone-black'
            }`}
          >
            {tournament.is_registered ? 'Registered' : 'View Details'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-gray-400">Join exciting tournaments and win amazing prizes</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-gray-300 hover:text-crackzone-yellow hover:border-crackzone-yellow/40 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
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

        {/* Tournament Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading tournaments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Tournaments</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchTournaments}
              className="px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}

        {!loading && !error && filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No tournaments found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new tournaments'}
            </p>
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Tournaments