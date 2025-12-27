import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Target, Flame, AlertCircle, Upload, Camera, Gamepad2 } from 'lucide-react';
import CrackZoneLogo from '../components/CrackZoneLogo';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const SetupGameProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    gameUid: '',
    gameUsername: '',
    profilePicture: null
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedGame = location.state?.selectedGame || 'freefire';

  useEffect(() => {
    // Pre-fill username if user has one
    if (user?.username) {
      setFormData(prev => ({ ...prev, username: user.username }));
    }
    
    // Set profile picture preview if user has one
    if (user?.profile_picture_url) {
      setProfilePreview(user.profile_picture_url);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setFormData({ ...formData, profilePicture: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target.result);
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (selectedGame === 'freefire' && !formData.gameUid.trim()) {
      setError('FreeFire UID is required');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('game', selectedGame);
      
      if (formData.gameUid) {
        submitData.append('gameUid', formData.gameUid);
      }
      
      if (formData.gameUsername) {
        submitData.append('gameUsername', formData.gameUsername);
      }
      
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      const response = await authAPI.completeGameProfile(submitData);
      
      if (response.data.user) {
        updateUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  const getGameInfo = () => {
    switch (selectedGame) {
      case 'freefire':
        return {
          name: 'FreeFire',
          icon: Flame,
          color: 'from-orange-500 to-red-500',
          description: 'Set up your FreeFire gaming profile'
        };
      case 'pubg':
        return {
          name: 'PUBG Mobile',
          icon: Target,
          color: 'from-blue-500 to-cyan-500',
          description: 'Set up your PUBG Mobile gaming profile'
        };
      default:
        return {
          name: 'Gaming',
          icon: Gamepad2,
          color: 'from-crackzone-yellow to-yellow-400',
          description: 'Set up your gaming profile'
        };
    }
  };

  const gameInfo = getGameInfo();
  const GameIcon = gameInfo.icon;

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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${gameInfo.color} rounded-xl flex items-center justify-center`}>
              <GameIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{gameInfo.name} Setup</h1>
              <p className="text-gray-400 text-sm">{gameInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-crackzone-yellow/30 flex items-center justify-center overflow-hidden bg-crackzone-black/50 mx-auto">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label htmlFor="profilePicture" className="absolute -bottom-2 -right-2 w-8 h-8 bg-crackzone-yellow rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors">
                  <Camera className="w-4 h-4 text-crackzone-black" />
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Click camera icon to upload profile picture</p>
            </div>

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

            {/* Game-specific fields */}
            {selectedGame === 'freefire' && (
              <>
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
                    required
                    className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                    placeholder="Enter your FreeFire UID"
                  />
                  <p className="text-xs text-gray-400 mt-1">Your unique FreeFire player ID (e.g., 123456789)</p>
                </div>

                <div>
                  <label htmlFor="gameUsername" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    FreeFire In-Game Name
                  </label>
                  <input
                    type="text"
                    id="gameUsername"
                    name="gameUsername"
                    value={formData.gameUsername}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                    placeholder="Your name in FreeFire (optional)"
                  />
                  <p className="text-xs text-gray-400 mt-1">The name displayed in your FreeFire account</p>
                </div>
              </>
            )}

            {/* Complete Setup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <GameIcon className="w-5 h-5" />
              {loading ? 'Setting up profile...' : 'Complete Setup & Start Gaming'}
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

export default SetupGameProfile;