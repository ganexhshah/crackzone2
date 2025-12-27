import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Target, Flame, AlertCircle, ChevronRight } from 'lucide-react';
import CrackZoneLogo from '../components/CrackZoneLogo';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const GameSelection = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const games = [
    {
      id: 'freefire',
      name: 'FreeFire',
      description: 'Battle Royale • Available Now',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/30 hover:border-orange-500/60',
      bgColor: 'bg-orange-500/10',
      available: true
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      description: 'Battle Royale • Coming Soon',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-gray-500/30',
      bgColor: 'bg-gray-500/10',
      available: false
    }
  ];

  const handleGameSelect = (gameId) => {
    if (games.find(g => g.id === gameId)?.available) {
      setSelectedGame(gameId);
      setError('');
    }
  };

  const handleContinue = async () => {
    if (!selectedGame) {
      setError('Please select a game to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save game preference
      const response = await authAPI.updateGamePreference({ game: selectedGame });
      
      if (response.data.user) {
        updateUser(response.data.user);
      }

      // Navigate to game-specific profile setup
      navigate('/setup-game-profile', { state: { selectedGame } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save game preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crackzone-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crackzone-yellow/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <CrackZoneLogo className="w-48 h-18 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Battle Arena</h1>
          <p className="text-gray-400">Select your primary game to get started with tournaments</p>
        </div>

        {/* Profile Picture */}
        {user?.profile_picture_url && (
          <div className="text-center mb-6">
            <img 
              src={user.profile_picture_url} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mx-auto border-2 border-crackzone-yellow/50"
            />
            <p className="text-gray-300 text-sm mt-2">Welcome, {user.email}!</p>
          </div>
        )}

        {/* Game Selection */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            {games.map((game) => {
              const GameIcon = game.icon;
              const isSelected = selectedGame === game.id;
              const isAvailable = game.available;
              
              return (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game.id)}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                    ${isSelected 
                      ? `${game.borderColor.split('hover:')[1]} ${game.bgColor}` 
                      : isAvailable 
                        ? `${game.borderColor} hover:scale-105` 
                        : 'border-gray-600/30 bg-gray-600/10 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-16 h-16 rounded-xl flex items-center justify-center
                      ${isAvailable ? `bg-gradient-to-br ${game.color}` : 'bg-gray-600/30'}
                    `}>
                      <GameIcon className={`w-8 h-8 ${isAvailable ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-1 ${isAvailable ? 'text-white' : 'text-gray-500'}`}>
                        {game.name}
                      </h3>
                      <p className={`text-sm ${isAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
                        {game.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 bg-crackzone-yellow rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-crackzone-black rounded-full"></div>
                      </div>
                    )}

                    {!isAvailable && (
                      <div className="text-gray-500 text-sm font-medium">
                        Coming Soon
                      </div>
                    )}
                  </div>

                  {game.id === 'freefire' && isSelected && (
                    <div className="mt-4 p-4 bg-crackzone-black/30 rounded-lg border border-crackzone-yellow/20">
                      <div className="flex items-center gap-2 text-crackzone-yellow text-sm font-medium mb-2">
                        <Flame className="w-4 h-4" />
                        What you'll get with FreeFire
                      </div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Daily tournaments with cash prizes</li>
                        <li>• Custom rooms and scrimmages</li>
                        <li>• Leaderboards and rankings</li>
                        <li>• Team management tools</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedGame || loading}
            className="w-full bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Gamepad2 className="w-5 h-5" />
            {loading ? 'Setting up...' : 'Continue to Game Setup'}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-crackzone-yellow text-sm transition-colors"
            >
              Skip for now (you can select a game later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;