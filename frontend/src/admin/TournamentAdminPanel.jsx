import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import AdminLayout from './AdminLayout';
import TeamManagementTab from './components/TeamManagementTab';
import MatchControlTab from './components/MatchControlTab';
import ResultsTab from './components/ResultsTab';
import WalletControlTab from './components/WalletControlTab';
import RulesTab from './components/RulesTab';
import { CreateMatchModal, RoomDetailsModal, AnnouncementModal } from './components/TournamentModals';

const TournamentAdminPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  
  // Form states
  const [newMatch, setNewMatch] = useState({
    name: '',
    map: '',
    gameMode: 'Battle Royale',
    scheduledTime: '',
    roomId: '',
    roomPassword: ''
  });
  
  const [roomDetails, setRoomDetails] = useState({
    roomId: '',
    roomPassword: '',
    publishTime: ''
  });
  
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    targetType: 'all', // all, selected, specific
    selectedTeams: []
  });

  useEffect(() => {
    if (id) {
      fetchTournamentData();
    }
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentData, teamsData, matchesData, leaderboardData] = await Promise.all([
        adminAPI.getTournamentDetails(id),
        adminAPI.getTournamentTeams(id),
        adminAPI.getTournamentMatches(id),
        adminAPI.getTournamentLeaderboard(id)
      ]);
      
      setTournament(tournamentData);
      setTeams(teamsData);
      setMatches(matchesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournament = () => {
    fetchTournamentData();
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTournamentMatch(id, newMatch);
      setShowCreateMatch(false);
      setNewMatch({
        name: '',
        map: '',
        gameMode: 'Battle Royale',
        scheduledTime: '',
        roomId: '',
        roomPassword: ''
      });
      fetchTournamentData();
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  const handleUpdateRoomDetails = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateTournamentRoomDetails(id, roomDetails);
      setShowRoomDetails(false);
      fetchTournamentData();
    } catch (error) {
      console.error('Failed to update room details:', error);
    }
  };

  const handleTeamAction = async (teamId, action) => {
    try {
      await adminAPI.updateTeamStatus(teamId, action);
      fetchTournamentData();
    } catch (error) {
      console.error(`Failed to ${action} team:`, error);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.sendTournamentAnnouncement(id, announcement);
      setShowAnnouncementModal(false);
      setAnnouncement({
        title: '',
        message: '',
        targetType: 'all',
        selectedTeams: []
      });
    } catch (error) {
      console.error('Failed to send announcement:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading tournament data...</div>
      </AdminLayout>
    );
  }

  if (!tournament) {
    return (
      <AdminLayout>
        <div className="p-6">Tournament not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate('/admin/tournaments')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Tournaments
            </button>
            <h1 className="text-2xl font-bold">{tournament.name} - Admin Panel</h1>
            <p className="text-gray-600">{tournament.description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              📢 Send Announcement
            </button>
            <button
              onClick={() => setShowRoomDetails(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              🎮 Room Details
            </button>
          </div>
        </div>

        {/* Tournament Status Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tournament.tournament_type === 'SOLO' 
                  ? (tournament.registered_users || 0)
                  : teams.length
                }
              </div>
              <div className="text-sm text-gray-600">
                {tournament.tournament_type === 'SOLO' ? 'Registered Players' : 'Registered Teams'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{matches.length}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{tournament.calculated_prize_pool || tournament.prize_pool || tournament.prizePool || 0}
              </div>
              <div className="text-sm text-gray-600">Prize Pool</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                tournament.status === 'active' ? 'text-green-600' : 
                tournament.status === 'upcoming' ? 'text-yellow-600' : 
                tournament.status === 'completed' ? 'text-blue-600' :
                tournament.status === 'cancelled' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {tournament.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-xs text-gray-500 mt-1">
                {tournament.status === 'active' && 'Registration Open'}
                {tournament.status === 'upcoming' && 'Registration Closed'}
                {tournament.status === 'completed' && 'Tournament Ended'}
                {tournament.status === 'cancelled' && 'Tournament Cancelled'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'teams', name: 'Team Management', icon: '👥' },
              { id: 'matches', name: 'Match Control', icon: '🎮' },
              { id: 'results', name: 'Results & Ranking', icon: '🏆' },
              { id: 'wallet', name: 'Wallet Control', icon: '💰' },
              { id: 'rules', name: 'Rules & Fair Play', icon: '⚖️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            tournament={tournament} 
            teams={teams} 
            matches={matches}
            onCreateMatch={() => setShowCreateMatch(true)}
            onUpdateTournament={handleUpdateTournament}
          />
        )}
        
        {activeTab === 'teams' && (
          <TeamManagementTab 
            teams={teams} 
            onTeamAction={handleTeamAction}
            tournament={tournament}
          />
        )}
        
        {activeTab === 'matches' && (
          <MatchControlTab 
            matches={matches} 
            tournament={tournament}
            onCreateMatch={() => setShowCreateMatch(true)}
            onUpdateRoomDetails={() => setShowRoomDetails(true)}
            onRefresh={fetchTournamentData}
          />
        )}
        
        {activeTab === 'results' && (
          <ResultsTab 
            leaderboard={leaderboard} 
            matches={matches}
            tournament={tournament}
            onShowResults={() => setShowResultsModal(true)}
          />
        )}
        
        {activeTab === 'wallet' && (
          <WalletControlTab 
            tournament={tournament} 
            teams={teams}
          />
        )}
        
        {activeTab === 'rules' && (
          <RulesTab 
            tournament={tournament}
          />
        )}

        {/* Modals */}
        {showCreateMatch && (
          <CreateMatchModal
            newMatch={newMatch}
            setNewMatch={setNewMatch}
            onSubmit={handleCreateMatch}
            onClose={() => setShowCreateMatch(false)}
          />
        )}

        {showRoomDetails && (
          <RoomDetailsModal
            roomDetails={roomDetails}
            setRoomDetails={setRoomDetails}
            onSubmit={handleUpdateRoomDetails}
            onClose={() => setShowRoomDetails(false)}
          />
        )}

        {showAnnouncementModal && (
          <AnnouncementModal
            announcement={announcement}
            setAnnouncement={setAnnouncement}
            teams={teams}
            onSubmit={handleSendAnnouncement}
            onClose={() => setShowAnnouncementModal(false)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Overview Tab Component
const OverviewTab = ({ tournament, teams, matches, onCreateMatch, onUpdateTournament }) => {
  const [processing, setProcessing] = useState(false);

  const handleRegistrationToggle = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} registration for this tournament?`)) {
      return;
    }

    try {
      setProcessing(true);
      const newStatus = action === 'open' ? 'active' : 'upcoming';
      await adminAPI.updateTournamentStatus(tournament.id, newStatus);
      onUpdateTournament();
      alert(`Registration ${action === 'open' ? 'opened' : 'closed'} successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} registration:`, error);
      alert(`Failed to ${action} registration`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelTournament = async () => {
    if (!window.confirm('Are you sure you want to cancel this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await adminAPI.updateTournamentStatus(tournament.id, 'cancelled');
      onUpdateTournament();
      alert('Tournament cancelled successfully!');
    } catch (error) {
      console.error('Failed to cancel tournament:', error);
      alert('Failed to cancel tournament');
    } finally {
      setProcessing(false);
    }
  };

  const getRegistrationButtonText = () => {
    if (tournament.status === 'active') return 'Close Registration';
    if (tournament.status === 'upcoming') return 'Open Registration';
    return 'Registration Closed';
  };

  const getRegistrationAction = () => {
    if (tournament.status === 'active') return 'close';
    if (tournament.status === 'upcoming') return 'open';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tournament Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Tournament Information</h3>
          <div className="space-y-2">
            <div><strong>Type:</strong> {tournament.tournament_type || tournament.tournamentType || 'SOLO'}</div>
            <div><strong>Game:</strong> Free Fire</div>
            <div><strong>Entry Fee:</strong> ₹{tournament.entry_fee || tournament.entryFee || 0}</div>
            <div><strong>Max Teams:</strong> {tournament.max_participants || tournament.maxTeams || 0}</div>
            <div><strong>Start Date:</strong> {new Date(tournament.start_date || tournament.startDate).toLocaleString()}</div>
            <div><strong>End Date:</strong> {new Date(tournament.end_date || tournament.endDate).toLocaleString()}</div>
            <div><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                tournament.status === 'active' ? 'bg-green-100 text-green-800' :
                tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                tournament.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tournament.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={onCreateMatch}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                '🎮'
              )}
              Create New Match
            </button>
            
            {getRegistrationAction() && (
              <button
                onClick={() => handleRegistrationToggle(getRegistrationAction())}
                disabled={processing}
                className={`w-full py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 ${
                  getRegistrationAction() === 'open' 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  getRegistrationAction() === 'open' ? '✅' : '⏸️'
                )}
                {getRegistrationButtonText()}
              </button>
            )}
            
            {tournament.status !== 'cancelled' && tournament.status !== 'completed' && (
              <button
                onClick={handleCancelTournament}
                disabled={processing}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  '❌'
                )}
                Cancel Tournament
              </button>
            )}
            
            {tournament.status === 'cancelled' && (
              <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-center">
                Tournament Cancelled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tournament Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Tournament Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {tournament.tournament_type === 'SOLO' 
                ? (tournament.registered_users || 0)
                : teams.length
              }
            </div>
            <div className="text-sm text-gray-600">
              {tournament.tournament_type === 'SOLO' ? 'Registered Players' : 'Registered Teams'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{matches.length}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₹{tournament.calculated_prize_pool || tournament.prize_pool || tournament.prizePool || 0}
            </div>
            <div className="text-sm text-gray-600">Prize Pool</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {tournament.max_participants || tournament.maxTeams || 0}
            </div>
            <div className="text-sm text-gray-600">Max Capacity</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          {tournament.tournament_type === 'SOLO' ? (
            // For SOLO tournaments, show participant count instead of individual teams
            tournament.registered_users > 0 ? (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                  <span className="text-gray-900">{tournament.registered_users} player{tournament.registered_users !== 1 ? 's' : ''} registered</span>
                </div>
                <span className="text-sm text-gray-500">Recently</span>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No participants registered yet
              </div>
            )
          ) : (
            // For team tournaments, show teams as before
            <>
              {teams.slice(0, 5).map((team, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <span className="text-gray-900">Team "{team.teamName || team.team_name || `Team ${index + 1}`}" registered</span>
                  </div>
                  <span className="text-sm text-gray-500">Recently</span>
                </div>
              ))}
              
              {teams.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No teams registered yet
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentAdminPanel;