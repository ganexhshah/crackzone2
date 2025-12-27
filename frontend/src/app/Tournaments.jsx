import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Trophy, Calendar, Users, Star, Clock, Target, Flame, Filter, Search, CheckCircle,
  MapPin, DollarSign, Zap, TrendingUp, Award, Eye, Heart, Share2, 
  ChevronDown, SlidersHorizontal, RefreshCw, AlertCircle, BarChart3,
  Gamepad2, Coins, Settings
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Tournaments = () => {
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState('browse') // browse or manage
  const [activeTab, setActiveTab] = useState('live')
  const [searchTerm, setSearchTerm] = useState('')
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('start_date') // start_date, prize_pool, entry_fee
  const [filterBy, setFilterBy] = useState({
    game: 'all',
    type: 'all',
    entryFee: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const { isAuthenticated, user } = useAuth()

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

  // Enhanced categorization with better filtering
  const categorizedTournaments = {
    live: tournaments.filter(t => t.status === 'active' || (t.status === 'upcoming' && new Date(t.start_date) <= new Date())),
    upcoming: tournaments.filter(t => t.status === 'upcoming' && new Date(t.start_date) > new Date()),
    completed: tournaments.filter(t => t.status === 'completed'),
    registered: tournaments.filter(t => t.is_registered)
  }

  // Apply filters and search
  const getFilteredTournaments = () => {
    let filtered = categorizedTournaments[activeTab] || []

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.game?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.tournament_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Game filter
    if (filterBy.game !== 'all') {
      filtered = filtered.filter(t => t.game?.toLowerCase() === filterBy.game.toLowerCase())
    }

    // Type filter
    if (filterBy.type !== 'all') {
      filtered = filtered.filter(t => t.tournament_type === filterBy.type)
    }

    // Entry fee filter
    if (filterBy.entryFee !== 'all') {
      if (filterBy.entryFee === 'free') {
        filtered = filtered.filter(t => !t.entry_fee || t.entry_fee === 0)
      } else if (filterBy.entryFee === 'paid') {
        filtered = filtered.filter(t => t.entry_fee && t.entry_fee > 0)
      }
    }

    // Sort tournaments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'prize_pool':
          return (b.prize_pool || 0) - (a.prize_pool || 0)
        case 'entry_fee':
          return (a.entry_fee || 0) - (b.entry_fee || 0)
        case 'popularity':
          return (b.registered_count || 0) - (a.registered_count || 0)
        case 'start_date':
        default:
          return new Date(a.start_date) - new Date(b.start_date)
      }
    })

    return filtered
  }

  const filteredTournaments = getFilteredTournaments()

  const tabs = [
    { id: 'live', name: 'Live & Active', count: categorizedTournaments.live.length, icon: Zap },
    { id: 'upcoming', name: 'Upcoming', count: categorizedTournaments.upcoming.length, icon: Calendar },
    { id: 'completed', name: 'Completed', count: categorizedTournaments.completed.length, icon: Award },
    { id: 'registered', name: 'My Tournaments', count: categorizedTournaments.registered.length, icon: Star }
  ]

  const managementTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'matches', name: 'My Matches', icon: Gamepad2 },
    { id: 'results', name: 'Results & Ranking', icon: Trophy },
    { id: 'wallet', name: 'Tournament Wallet', icon: Coins },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const mainTabs = [
    { id: 'browse', name: 'Browse Tournaments', icon: Search },
    { id: 'manage', name: 'Manage My Tournaments', icon: Settings }
  ]

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
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTournamentTypeColor = (type) => {
    switch (type) {
      case 'SOLO': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'DUO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'SQUAD': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const isRegistrationOpen = (tournament) => {
    // Match admin panel logic: registration is open when status is 'active'
    return tournament.status === 'active' && (tournament.registered_count || 0) < tournament.max_participants
  }

  const getRegistrationProgress = (tournament) => {
    const registered = tournament.registered_count || 0
    const max = tournament.max_participants || 1
    return Math.min((registered / max) * 100, 100)
  }

  const TournamentCard = ({ tournament, isListView = false }) => {
    const GameIcon = getGameIcon(tournament.game)
    const progress = getRegistrationProgress(tournament)
    
    if (isListView) {
      return (
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4 hover:border-crackzone-yellow/40 transition-all cursor-pointer"
             onClick={() => navigate(`/tournaments/${tournament.id}`)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                <GameIcon className="w-6 h-6 text-crackzone-yellow" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{tournament.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTournamentTypeColor(tournament.tournament_type)}`}>
                    {tournament.tournament_type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Prize: ₹{tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tournament.registered_count || 0}/{tournament.max_participants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(tournament.start_date)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-400">Entry Fee</p>
                <p className="text-lg font-bold text-crackzone-yellow">
                  {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/tournaments/${tournament.id}`)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  tournament.is_registered 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-crackzone-yellow/20 text-crackzone-yellow hover:bg-crackzone-yellow hover:text-crackzone-black border border-crackzone-yellow/30'
                }`}
              >
                {tournament.is_registered ? 'Registered' : 'Join Now'}
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 hover:border-crackzone-yellow/40 transition-all cursor-pointer group"
           onClick={() => navigate(`/tournaments/${tournament.id}`)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center group-hover:bg-crackzone-yellow/30 transition-colors">
              <GameIcon className="w-6 h-6 text-crackzone-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-crackzone-yellow transition-colors">{tournament.title}</h3>
              <p className="text-sm text-gray-400">{tournament.game}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tournament.status)}`}>
              {tournament.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTournamentTypeColor(tournament.tournament_type)}`}>
              {tournament.tournament_type}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Prize Pool
            </p>
            <p className="text-lg font-bold text-crackzone-yellow">
              ₹{tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Entry Fee
            </p>
            <p className="text-lg font-bold text-white">
              {tournament.entry_fee > 0 ? `₹${Number(tournament.entry_fee).toLocaleString()}` : 'Free'}
            </p>
          </div>
        </div>

        {/* Registration Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>{tournament.registered_count || 0}/{tournament.max_participants} registered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{formatDate(tournament.start_date)}</span>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-crackzone-yellow to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {tournament.description || 'Join this exciting tournament and compete for amazing prizes!'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {tournament.is_registered ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                You're registered!
              </div>
            ) : isRegistrationOpen(tournament) ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Registration Open
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Registration Closed
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                // Add to favorites functionality
              }}
              className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/tournaments/${tournament.id}`)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tournament.is_registered 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                  : 'bg-crackzone-yellow/20 text-crackzone-yellow hover:bg-crackzone-yellow hover:text-crackzone-black border border-crackzone-yellow/30'
              }`}
            >
              {tournament.is_registered ? 'View' : 'Join Now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const FilterPanel = () => (
    <div className={`bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4 mb-6 transition-all ${showFilters ? 'block' : 'hidden'}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Game</label>
          <select 
            value={filterBy.game}
            onChange={(e) => setFilterBy({...filterBy, game: e.target.value})}
            className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
          >
            <option value="all">All Games</option>
            <option value="free fire">Free Fire</option>
            <option value="pubg">PUBG</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select 
            value={filterBy.type}
            onChange={(e) => setFilterBy({...filterBy, type: e.target.value})}
            className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
          >
            <option value="all">All Types</option>
            <option value="SOLO">Solo</option>
            <option value="DUO">Duo</option>
            <option value="SQUAD">Squad</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee</label>
          <select 
            value={filterBy.entryFee}
            onChange={(e) => setFilterBy({...filterBy, entryFee: e.target.value})}
            className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
          >
            <option value="start_date">Start Date</option>
            <option value="prize_pool">Prize Pool</option>
            <option value="entry_fee">Entry Fee</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-gray-400">Join exciting tournaments and win amazing prizes</p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments, games, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-crackzone-yellow text-crackzone-black border-crackzone-yellow' 
                  : 'bg-crackzone-gray/50 border-crackzone-yellow/20 text-gray-300 hover:text-crackzone-yellow hover:border-crackzone-yellow/40'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-2 px-4 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-gray-300 hover:text-crackzone-yellow hover:border-crackzone-yellow/40 transition-colors"
            >
              <Eye className="w-5 h-5" />
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </button>
            <button 
              onClick={fetchTournaments}
              className="flex items-center gap-2 px-4 py-3 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-gray-300 hover:text-crackzone-yellow hover:border-crackzone-yellow/40 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        <FilterPanel />

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
                {tab.name} ({tab.count})
              </button>
            )
          })}
        </div>

        {/* Tournament Grid/List */}
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
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} isListView={viewMode === 'list'} />
            ))}
          </div>
        )}

        {!loading && !error && filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No tournaments found</h3>
            <p className="text-gray-500">
              {searchTerm || showFilters ? 'Try adjusting your search terms or filters' : 'Check back later for new tournaments'}
            </p>
            {(searchTerm || showFilters) && (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterBy({ game: 'all', type: 'all', entryFee: 'all' })
                  setShowFilters(false)
                }}
                className="mt-4 px-6 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Tournaments