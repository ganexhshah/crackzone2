import { useState, useEffect } from 'react';
import DashboardNavbar from './DashboardNavbar';
import MobileBottomMenu from './MobileBottomMenu';
import { leaderboardAPI } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'overall',
    game: '',
    timeframe: 'all',
    page: 1
  });

  const leaderboardTypes = [
    { value: 'overall', label: 'Overall Score', icon: '🏆' },
    { value: 'earnings', label: 'Total Earnings', icon: '💰' },
    { value: 'wins', label: 'Tournament Wins', icon: '🥇' }
  ];

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'This Year' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  const games = [
    { value: '', label: 'All Games' },
    { value: 'freefire', label: 'Free Fire' },
    { value: 'pubg', label: 'PUBG Mobile' },
    { value: 'codm', label: 'Call of Duty Mobile' },
    { value: 'valorant', label: 'Valorant' }
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [filters]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getGlobalLeaderboard(filters);
      
      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard);
      } else {
        throw new Error('API returned unsuccessful response');
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leaderboardAPI.getLeaderboardStats({
        game: filters.game,
        timeframe: filters.timeframe
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-600';
  };

  const formatValue = (type, value) => {
    switch (type) {
      case 'earnings':
        return `₹${value.toLocaleString()}`;
      case 'wins':
        return `${value} wins`;
      default:
        return `${value} pts`;
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black main-app">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Global Leaderboard</h1>
          <p className="text-gray-400">Compete with the best players across all tournaments</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4">
              <div className="text-blue-200 text-sm">Total Players</div>
              <div className="text-2xl font-bold">{stats.totalPlayers.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4">
              <div className="text-green-200 text-sm">Tournaments</div>
              <div className="text-2xl font-bold">{stats.totalTournaments.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-4">
              <div className="text-yellow-200 text-sm">Prize Pool</div>
              <div className="text-2xl font-bold">₹{stats.totalPrizePool.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4">
              <div className="text-purple-200 text-sm">Champions</div>
              <div className="text-2xl font-bold">{stats.totalWinners.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Leaderboard Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leaderboard Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
              >
                {leaderboardTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Game Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game
              </label>
              <select
                value={filters.game}
                onChange={(e) => handleFilterChange('game', e.target.value)}
                className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
              >
                {games.map(game => (
                  <option key={game.value} value={game.value}>
                    {game.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={filters.timeframe}
                onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                className="w-full bg-crackzone-gray border border-crackzone-yellow/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-crackzone-yellow"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  fetchLeaderboard();
                  fetchStats();
                }}
                disabled={loading}
                className="w-full bg-crackzone-yellow hover:bg-yellow-400 disabled:bg-gray-600 text-crackzone-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Top Performer Highlight */}
        {stats?.topPerformer && (
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">👑</div>
              <div>
                <div className="text-yellow-100 text-sm">Current Champion</div>
                <div className="text-xl font-bold">{stats.topPerformer.username}</div>
                <div className="text-yellow-200 text-sm">
                  {stats.topPerformer.wins} wins • ₹{stats.topPerformer.earnings.toLocaleString()} earned
                </div>
              </div>
              {stats.topPerformer.profilePictureUrl && (
                <img
                  src={stats.topPerformer.profilePictureUrl}
                  alt={stats.topPerformer.username}
                  className="w-16 h-16 rounded-full border-2 border-yellow-300 ml-auto"
                />
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-xl mb-6">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-crackzone-yellow/20">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>{leaderboardTypes.find(t => t.value === filters.type)?.icon}</span>
              <span>{leaderboardTypes.find(t => t.value === filters.type)?.label} Leaderboard</span>
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-4">🏆</div>
              <div className="text-lg">No players found</div>
              <div className="text-sm">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="divide-y divide-crackzone-yellow/10">
              {leaderboard.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 flex items-center space-x-4 hover:bg-crackzone-gray/30 transition-colors ${
                    player.rank <= 3 ? 'bg-crackzone-gray/30' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-2xl font-bold w-16 text-center ${getRankColor(player.rank)}`}>
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                    {player.profilePictureUrl ? (
                      <img
                        src={player.profilePictureUrl}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{player.username}</div>
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <span className="bg-crackzone-gray px-2 py-1 rounded text-xs">
                        {player.gameRank}
                      </span>
                      <span>{player.favoriteGame}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatValue(filters.type, 
                        filters.type === 'earnings' ? player.totalEarnings :
                        filters.type === 'wins' ? player.tournamentsWon :
                        player.overallScore
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {player.tournamentsPlayed} tournaments • {player.winRate}% win rate
                    </div>
                  </div>

                  {/* Podium Finishes */}
                  <div className="text-right text-sm text-gray-400 w-20">
                    <div>🏆 {player.tournamentsWon}</div>
                    <div>🥉 {player.podiumFinishes}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {leaderboard.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={loading}
              className="bg-crackzone-gray/50 hover:bg-crackzone-gray/70 disabled:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-crackzone-yellow/20 hover:border-crackzone-yellow/40"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <MobileBottomMenu />
    </div>
  );
};

export default Leaderboard;