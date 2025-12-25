import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gamepad2, Target, AlertCircle } from 'lucide-react';
import CrackZoneLogo from '../components/CrackZoneLogo';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    game: 'freefire',
    gameUid: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (formData.game === 'freefire' && !formData.gameUid.trim()) {
      setError('FreeFire UID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.completeProfile(formData);
      
      if (response.data.user) {
        updateUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete profile');
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

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <CrackZoneLogo className="w-48 h-18 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Set up your gaming profile to get started</p>
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

        {/* Profile Form */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Gaming Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                placeholder="Choose your gaming username"
              />
              <p className="text-xs text-gray-400 mt-1">This will be your display name in tournaments</p>
            </div>

            {/* Game Selection */}
            <div>
              <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Primary Game
              </label>
              <select
                id="game"
                name="game"
                value={formData.game}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
              >
                <option value="freefire">FreeFire</option>
                <option value="pubg" disabled>PUBG Mobile (Coming Soon)</option>
              </select>
            </div>

            {/* Game UID Field */}
            {formData.game === 'freefire' && (
              <div>
                <label htmlFor="gameUid" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  FreeFire UID
                </label>
                <input
                  type="text"
                  id="gameUid"
                  name="gameUid"
                  value={formData.gameUid}
                  onChange={handleChange}
                  required={formData.game === 'freefire'}
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                  placeholder="Enter your FreeFire UID"
                />
                <p className="text-xs text-gray-400 mt-1">Your unique FreeFire player ID (e.g., 123456789)</p>
              </div>
            )}

            {formData.game === 'pubg' && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  PUBG Mobile tournaments coming soon! You can still create your account.
                </p>
              </div>
            )}

            {/* Complete Profile Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Target className="w-5 h-5" />
              {loading ? 'Setting up...' : 'Complete Profile & Start Gaming'}
            </button>
          </form>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-crackzone-yellow text-sm transition-colors"
            >
              Skip for now (you can complete this later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;