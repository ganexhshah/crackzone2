import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Flame, Target, User, AlertCircle } from 'lucide-react';

const TestGameFlow = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testGamePreference = async (game) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateGamePreference({ game });
      updateUser(response.data.user);
      setSuccess(`Game preference updated to ${game}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update game preference');
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('username', user?.username || 'TestUser');
      formData.append('game', 'freefire');
      formData.append('gameUid', '123456789');
      formData.append('gameUsername', 'TestFireUser');

      const response = await authAPI.completeGameProfile(formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Game Flow</h1>

        {/* Current User Info */}
        <div className="bg-crackzone-gray/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Current User Info</h2>
          {user ? (
            <div className="space-y-2 text-gray-300">
              <p><strong>Username:</strong> {user.username || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Primary Game:</strong> {user.primary_game || 'Not set'}</p>
              <p><strong>Profile Complete:</strong> {user.is_profile_complete ? 'Yes' : 'No'}</p>
              {user.profile_picture_url && (
                <div>
                  <strong>Profile Picture:</strong>
                  <img src={user.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Not logged in</p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Test Actions */}
        <div className="space-y-4">
          <div className="bg-crackzone-gray/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Test Game Preference</h3>
            <div className="flex gap-4">
              <button
                onClick={() => testGamePreference('freefire')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Flame className="w-4 h-4" />
                Set FreeFire
              </button>
              <button
                onClick={() => testGamePreference('pubg')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Target className="w-4 h-4" />
                Set PUBG
              </button>
            </div>
          </div>

          <div className="bg-crackzone-gray/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Test Profile Update</h3>
            <button
              onClick={testProfileUpload}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-crackzone-yellow text-crackzone-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              <User className="w-4 h-4" />
              Update Profile
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crackzone-yellow mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGameFlow;