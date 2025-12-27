import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Trophy, Users, User, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { tournamentsAPI, teamsAPI, profileAPI } from '../services/api'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    tournaments: [],
    teams: [],
    users: []
  })
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (query.length > 2) {
      performSearch()
    } else {
      setResults({ tournaments: [], teams: [], users: [] })
    }
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const [tournamentsRes, teamsRes, usersRes] = await Promise.all([
        tournamentsAPI.getAll().catch(() => ({ data: [] })),
        teamsAPI.getAvailable({ search: query }).catch(() => ({ data: [] })),
        profileAPI.searchUsers(query).catch(() => ({ data: { users: [] } }))
      ])

      const tournaments = tournamentsRes.data.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.game.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)

      const teams = teamsRes.data.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)

      const users = usersRes.data.users.slice(0, 5)

      setResults({
        tournaments,
        teams,
        users
      })
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (type, item) => {
    onClose()
    setQuery('')
    
    switch (type) {
      case 'tournament':
        navigate(`/tournaments/${item.id}`)
        break
      case 'team':
        navigate(`/teams/${item.id}`)
        break
      case 'user':
        navigate(`/u/${item.username}`)
        break
      default:
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/30 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center gap-4 p-6 border-b border-crackzone-yellow/20">
          <Search className="w-6 h-6 text-crackzone-yellow" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tournaments, teams, players..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg outline-none"
          />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          ) : query.length <= 2 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Type at least 3 characters to search</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Tournaments */}
              {results.tournaments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
                    Tournaments
                  </h3>
                  <div className="space-y-2">
                    {results.tournaments.map((tournament) => (
                      <button
                        key={tournament.id}
                        onClick={() => handleResultClick('tournament', tournament)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-crackzone-yellow/10 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-crackzone-yellow" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{tournament.title}</p>
                          <p className="text-sm text-gray-400">{tournament.game} • ₹{tournament.prize_pool}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {results.teams.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
                    Teams
                  </h3>
                  <div className="space-y-2">
                    {results.teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => handleResultClick('team', team)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-crackzone-yellow/10 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{team.name}</p>
                          <p className="text-sm text-gray-400">{team.game} • {team.members_count}/{team.max_members} members</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
                    Players
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleResultClick('user', user)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-crackzone-yellow/10 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-lg flex items-center justify-center overflow-hidden">
                          {user.profilePictureUrl ? (
                            <img 
                              src={user.profilePictureUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-crackzone-yellow" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.bio || `${user.rank} Rank`}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.rank === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                            user.rank === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                            user.rank === 'platinum' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-amber-600/20 text-amber-400'
                          }`}>
                            {user.rank?.charAt(0).toUpperCase() + user.rank?.slice(1)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.tournaments.length === 0 && results.teams.length === 0 && results.users.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try searching for tournaments, teams, or players</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal