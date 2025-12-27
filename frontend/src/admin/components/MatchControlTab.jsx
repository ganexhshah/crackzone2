import React, { useState } from 'react';
import { adminAPI } from '../../services/adminAPI';

const MatchControlTab = ({ matches, tournament, onCreateMatch, onUpdateRoomDetails, onRefresh }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [roomDetails, setRoomDetails] = useState({ roomId: '', roomPassword: '' });
  const [loading, setLoading] = useState(false);

  // Get tournament status for dynamic button display
  const getTournamentStatus = () => {
    if (!tournament) return 'scheduled';
    return tournament.status || 'scheduled';
  };

  const isLive = getTournamentStatus() === 'live';
  const isCompleted = getTournamentStatus() === 'completed';
  const isActive = getTournamentStatus() === 'active';

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMatchAction = async (matchId, action) => {
    try {
      if (action === 'start') {
        setShowStartModal(true);
      } else if (action === 'pause') {
        // Pause the tournament
        await adminAPI.updateTournamentStatus(tournament.id, 'paused');
        alert('Tournament paused successfully!');
        if (onRefresh) onRefresh();
      } else if (action === 'end') {
        // End the tournament
        if (confirm('Are you sure you want to end this tournament? This action cannot be undone.')) {
          await adminAPI.updateTournamentStatus(tournament.id, 'completed');
          alert('Tournament ended successfully!');
          if (onRefresh) onRefresh();
        }
      } else if (action === 'resume') {
        // Resume the tournament
        await adminAPI.updateTournamentStatus(tournament.id, 'live');
        alert('Tournament resumed successfully!');
        if (onRefresh) onRefresh();
      } else {
        console.log(`${action} match ${matchId}`);
      }
    } catch (error) {
      console.error(`Failed to ${action} match:`, error);
      alert(`Failed to ${action} tournament: ${error.message}`);
    }
  };

  const handleStartMatch = async () => {
    if (!roomDetails.roomId || !roomDetails.roomPassword) {
      alert('Please enter both Room ID and Password');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.startTournamentMatch(tournament.id, roomDetails);
      
      alert('Tournament started successfully! Notifications sent to all registered users.');
      setShowStartModal(false);
      setRoomDetails({ roomId: '', roomPassword: '' });
      
      // Refresh the tournament data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to start tournament:', error);
      alert('Failed to start tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Control Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Match & Room Management</h3>
          <div className="space-x-2">
            {!isLive && !isCompleted && (
              <button
                onClick={onCreateMatch}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create New Match
              </button>
            )}
            {isLive && (
              <button
                onClick={onUpdateRoomDetails}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Update Room Details
              </button>
            )}
          </div>
        </div>

        {/* Tournament Status Banner */}
        <div className={`mb-4 p-4 rounded-lg border-l-4 ${
          isLive ? 'bg-green-50 border-green-500' :
          isCompleted ? 'bg-gray-50 border-gray-500' :
          isActive ? 'bg-blue-50 border-blue-500' :
          'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-semibold ${
                isLive ? 'text-green-700' :
                isCompleted ? 'text-gray-700' :
                isActive ? 'text-blue-700' :
                'text-yellow-700'
              }`}>
                Tournament Status: {getTournamentStatus().toUpperCase()}
              </h4>
              <p className={`text-sm ${
                isLive ? 'text-green-600' :
                isCompleted ? 'text-gray-600' :
                isActive ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {isLive ? `Tournament is currently live${tournament?.room_id ? ` - Room: ${tournament.room_id}` : ''}` :
                 isCompleted ? 'Tournament has been completed' :
                 isActive ? 'Tournament is active and accepting registrations' :
                 'Tournament is scheduled'}
              </p>
            </div>
            
            {/* Dynamic Action Buttons */}
            <div className="flex space-x-2">
              {isActive && !isLive && !isCompleted && (
                <button
                  onClick={() => handleMatchAction(1, 'start')}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Tournament'}
                </button>
              )}
              
              {isLive && (
                <>
                  <button
                    onClick={() => handleMatchAction(1, 'pause')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    disabled={loading}
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleMatchAction(1, 'end')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    disabled={loading}
                  >
                    End Tournament
                  </button>
                </>
              )}
              
              {tournament?.status === 'paused' && (
                <button
                  onClick={() => handleMatchAction(1, 'resume')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  disabled={loading}
                >
                  Resume
                </button>
              )}
              
              {isCompleted && (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md font-semibold">
                  Tournament Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-xl font-bold text-gray-700">{matches.length}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-xl font-bold text-blue-700">
              {matches.filter(m => m.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-xl font-bold text-green-700">
              {matches.filter(m => m.status === 'live').length}
            </div>
            <div className="text-sm text-gray-600">Live</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-xl font-bold text-gray-700">
              {matches.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map((match) => (
              <tr key={match.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{match.name}</div>
                    <div className="text-sm text-gray-500">Map: {match.map}</div>
                    <div className="text-sm text-gray-500">Mode: {match.gameMode}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(match.scheduledTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(match.scheduledTime).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {match.roomId ? (
                      <>
                        <div className="font-medium">ID: {match.roomId}</div>
                        <div className="text-gray-500">Pass: {match.roomPassword}</div>
                        {match.roomPublishTime && (
                          <div className="text-xs text-green-600">
                            Published: {new Date(match.roomPublishTime).toLocaleTimeString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatchStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="space-x-2">
                    {/* Show buttons based on tournament status, not individual match status */}
                    {isActive && !isLive && !isCompleted && (
                      <>
                        <button
                          onClick={() => handleMatchAction(match.id, 'start')}
                          className="text-green-600 hover:text-green-900 font-semibold"
                          disabled={loading}
                        >
                          {loading ? 'Starting...' : 'Start'}
                        </button>
                        <button
                          onClick={() => handleMatchAction(match.id, 'cancel')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {isLive && (
                      <>
                        <button
                          onClick={() => handleMatchAction(match.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-900"
                          disabled={loading}
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => handleMatchAction(match.id, 'end')}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          End
                        </button>
                      </>
                    )}
                    {tournament?.status === 'paused' && (
                      <button
                        onClick={() => handleMatchAction(match.id, 'resume')}
                        className="text-green-600 hover:text-green-900"
                        disabled={loading}
                      >
                        Resume
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-gray-500 font-medium">Completed</span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setShowMatchDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Match Control Panel */}
      {isLive && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-4 text-green-700">🔴 Live Match Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Tournament Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Room ID:</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-mono">
                    {tournament?.room_id || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Room Password:</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-mono">
                    {tournament?.room_password || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Registered Players:</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {tournament?.registered_count || 0}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Match Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => handleMatchAction(1, 'pause')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700"
                  disabled={loading}
                >
                  Pause Tournament
                </button>
                <button 
                  onClick={onUpdateRoomDetails}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                >
                  Update Room Details
                </button>
                <button 
                  onClick={() => handleMatchAction(1, 'end')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                  disabled={loading}
                >
                  End Tournament
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tournament Timer</h4>
              <div className="text-2xl font-mono text-center py-4 bg-gray-50 rounded">
                {tournament?.room_details_updated_at ? 
                  new Date(tournament.room_details_updated_at).toLocaleTimeString() : 
                  'Live'
                }
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Tournament in progress
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Management Guidelines */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Room Management Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Room Creation Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Publish room details 10-15 minutes before match</li>
              <li>• Use secure passwords (mix of letters and numbers)</li>
              <li>• Set appropriate map and game mode</li>
              <li>• Enable spectator mode for monitoring</li>
              <li>• Lock room once all teams join</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Match Monitoring</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monitor team join status</li>
              <li>• Watch for rule violations</li>
              <li>• Record match highlights</li>
              <li>• Take screenshots for proof</li>
              <li>• Be ready to pause/stop if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Match Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Start Tournament Match</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomDetails.roomId}
                  onChange={(e) => setRoomDetails(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Password
                </label>
                <input
                  type="text"
                  value={roomDetails.roomPassword}
                  onChange={(e) => setRoomDetails(prev => ({ ...prev, roomPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room password"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Starting the match will:
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Set tournament status to "Live"</li>
                  <li>Make room details visible to all registered users</li>
                  <li>Send notifications to all participants</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setRoomDetails({ roomId: '', roomPassword: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleStartMatch}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Match'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {showMatchDetails && selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => {
            setShowMatchDetails(false);
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
};

// Match Details Modal Component
const MatchDetailsModal = ({ match, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{match.name} - Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Map</label>
            <p className="text-sm text-gray-900">{match.map}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Game Mode</label>
            <p className="text-sm text-gray-900">{match.gameMode}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
          <p className="text-sm text-gray-900">
            {new Date(match.scheduledTime).toLocaleString()}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Room ID</label>
            <p className="text-sm text-gray-900">{match.roomId || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Password</label>
            <p className="text-sm text-gray-900">{match.roomPassword || 'Not set'}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            match.status === 'live' ? 'bg-green-100 text-green-800' :
            match.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {match.status}
          </span>
        </div>
        
        {/* Participating Teams */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Participating Teams</label>
          <div className="space-y-2">
            {match.teams?.map((team, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{team.name}</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  team.joinStatus === 'joined' ? 'bg-green-100 text-green-800' :
                  team.joinStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {team.joinStatus || 'pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default MatchControlTab;