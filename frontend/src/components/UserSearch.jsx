import React, { useState, useEffect } from 'react'
import { Search, User, X, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { profileAPI } from '../services/api'

const UserSearch = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      // You'll need to add this endpoint to your API
      const response = await profileAPI.searchUsers(searchQuery)
      setSearchResults(response.data.users || [])
    } catch (err) {
      setError('Failed to search users')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (username) => {
    navigate(`/u/${username}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-crackzone-yellow/20">
          <h2 className="text-lg font-bold text-white">Search Users</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow"
              autoFocus
            />
            {loading && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-crackzone-yellow animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          )}

          {searchQuery.trim().length <= 2 && (
            <div className="p-4 text-center text-gray-400">
              Type at least 3 characters to search
            </div>
          )}

          {searchQuery.trim().length > 2 && !loading && searchResults.length === 0 && !error && (
            <div className="p-4 text-center text-gray-400">
              No users found
            </div>
          )}

          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.username)}
              className="flex items-center gap-3 p-4 hover:bg-crackzone-yellow/10 cursor-pointer transition-colors border-b border-crackzone-yellow/10 last:border-b-0"
            >
              <div className="w-10 h-10 bg-crackzone-yellow/20 rounded-full flex items-center justify-center text-lg border-2 border-crackzone-yellow/30 overflow-hidden flex-shrink-0">
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
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.username}</p>
                <p className="text-sm text-gray-400 truncate">{user.bio || 'No bio available'}</p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserSearch