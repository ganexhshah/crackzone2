import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Flame, Target, Star, Clock, Users } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const DashboardBanner = () => {
  const navigate = useNavigate()
  const [featuredTournament, setFeaturedTournament] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedTournament()
  }, [])

  const fetchFeaturedTournament = async () => {
    try {
      const response = await dashboardAPI.getUpcomingTournaments()
      const tournaments = response.data.tournaments
      
      // Get the tournament with the highest prize pool that's still open for registration
      const featured = tournaments
        .filter(t => t.registration_open)
        .sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool))[0]
      
      setFeaturedTournament(featured)
    } catch (error) {
      console.error('Failed to fetch featured tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeUntil = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return 'Starting soon'
    if (diffHours < 24) return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

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

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-crackzone-yellow/20 via-crackzone-yellow/10 to-transparent rounded-xl p-6 mb-8 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-6 bg-crackzone-yellow/20 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-crackzone-yellow/20 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-crackzone-yellow/20 rounded w-full mb-4"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-crackzone-yellow/20 rounded w-24"></div>
            <div className="h-10 bg-crackzone-yellow/20 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!featuredTournament) {
    return (
      <div className="relative bg-gradient-to-r from-crackzone-yellow/20 via-crackzone-yellow/10 to-transparent rounded-xl p-6 mb-8 overflow-hidden">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-crackzone-yellow mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Featured Tournaments</h3>
          <p className="text-gray-400 mb-4">Check back later for exciting tournaments!</p>
          <button 
            onClick={() => navigate('/tournaments')}
            className="bg-crackzone-yellow text-crackzone-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Browse All Tournaments
          </button>
        </div>
      </div>
    )
  }

  const GameIcon = getGameIcon(featuredTournament.game)

  return (
    <div className="relative bg-gradient-to-r from-crackzone-yellow/20 via-crackzone-yellow/10 to-transparent rounded-xl p-6 mb-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-crackzone-yellow/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-crackzone-yellow/5 rounded-full blur-xl"></div>
      </div>

      <div className="relative grid md:grid-cols-2 gap-6 items-center">
        {/* Left Content */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-6 h-6 text-crackzone-yellow" />
            <span className="text-crackzone-yellow font-bold text-sm uppercase tracking-wide">
              Featured Tournament
            </span>
            <span className="px-2 py-1 bg-crackzone-yellow/20 text-crackzone-yellow text-xs font-medium rounded-full">
              {featuredTournament.tournament_type}
            </span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {featuredTournament.title}
          </h3>
          
          <p className="text-gray-300 mb-4">
            {featuredTournament.description || `Join the ${featuredTournament.tournament_type} tournament with amazing prizes!`}
          </p>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-crackzone-yellow" />
              <span>{formatTimeUntil(featuredTournament.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4 text-crackzone-yellow" />
              <span>{featuredTournament.registered_count}/{featuredTournament.max_participants} players</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Star className="w-4 h-4 text-crackzone-yellow" />
              <span>Entry: {featuredTournament.entry_fee > 0 ? `₹${Number(featuredTournament.entry_fee).toLocaleString()}` : 'Free'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate(`/tournaments/${featuredTournament.id}`)}
              className="bg-crackzone-yellow text-crackzone-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <GameIcon className="w-4 h-4" />
              {featuredTournament.registration_open ? 'Register Now' : 'View Tournament'}
            </button>
            <button 
              onClick={() => navigate('/tournaments')}
              className="bg-transparent border border-crackzone-yellow/50 text-crackzone-yellow font-medium py-3 px-6 rounded-lg hover:bg-crackzone-yellow/10 transition-colors"
            >
              Browse All
            </button>
          </div>
        </div>

        {/* Right Content - Tournament Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-crackzone-black/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-crackzone-yellow mb-1">
              ₹{Number(featuredTournament.prize_pool).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 uppercase">Prize Pool</div>
          </div>
          
          <div className="bg-crackzone-black/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-crackzone-yellow mb-1">
              {featuredTournament.max_participants}
            </div>
            <div className="text-xs text-gray-400 uppercase">Max Players</div>
          </div>
          
          <div className="bg-crackzone-black/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-crackzone-yellow mb-1">
              {featuredTournament.tournament_type}
            </div>
            <div className="text-xs text-gray-400 uppercase">Game Mode</div>
          </div>
          
          <div className="bg-crackzone-black/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-crackzone-yellow mb-1">
              {featuredTournament.registered_count}
            </div>
            <div className="text-xs text-gray-400 uppercase">Registered</div>
          </div>
        </div>
      </div>

      {/* Game Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-8 h-8 bg-crackzone-yellow/20 rounded-full flex items-center justify-center">
          <GameIcon className="w-4 h-4 text-crackzone-yellow" />
        </div>
        {featuredTournament.registration_open && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  )
}

export default DashboardBanner