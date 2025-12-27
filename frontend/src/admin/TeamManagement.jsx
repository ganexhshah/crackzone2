import { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';
import AdminLayout from './AdminLayout';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await adminAPI.getTeams();
      setTeams(response);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = async (team) => {
    try {
      const teamDetails = await adminAPI.getTeamDetails(team.id);
      setSelectedTeam(teamDetails);
      setShowTeamModal(true);
    } catch (error) {
      console.error('Failed to fetch team details:', error);
    }
  };

  const handleDissolveTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to dissolve this team? This action cannot be undone.')) {
      try {
        await adminAPI.dissolveTeam(teamId);
        fetchTeams();
        alert('Team dissolved successfully');
      } catch (error) {
        console.error('Failed to dissolve team:', error);
        alert('Failed to dissolve team');
      }
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await adminAPI.removeTeamMember(teamId, userId);
        // Refresh team details
        const teamDetails = await adminAPI.getTeamDetails(teamId);
        setSelectedTeam(teamDetails);
        fetchTeams();
        alert('Member removed successfully');
      } catch (error) {
        console.error('Failed to remove member:', error);
        alert('Failed to remove member');
      }
    }
  };

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const handleSelectAllTeams = () => {
    if (selectedTeams.length === sortedTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(sortedTeams.map(team => team.id));
    }
  };

  const handleBulkDissolve = async () => {
    if (selectedTeams.length === 0) return;
    
    if (window.confirm(`Are you sure you want to dissolve ${selectedTeams.length} selected teams? This action cannot be undone.`)) {
      try {
        await adminAPI.bulkDissolveTeams(selectedTeams);
        setSelectedTeams([]);
        fetchTeams();
        alert(`${selectedTeams.length} teams dissolved successfully`);
      } catch (error) {
        console.error('Failed to dissolve teams:', error);
        alert('Failed to dissolve teams');
      }
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.creator_username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'created_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                Total Teams: {teams.length}
              </span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-green-700">
                Active: {teams.filter(t => t.status !== 'disbanded').length}
              </span>
            </div>
            <div className="bg-yellow-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">
                Avg Members: {teams.length > 0 ? Math.round(teams.reduce((sum, t) => sum + (t.member_count || 0), 0) / teams.length) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Teams
              </label>
              <input
                type="text"
                placeholder="Search by team name or captain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="disbanded">Disbanded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="name">Team Name</option>
                <option value="member_count">Member Count</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTeams.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-700">
                  {selectedTeams.length} team{selectedTeams.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedTeams([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDissolve}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Dissolve Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTeams.length === sortedTeams.length && sortedTeams.length > 0}
                    onChange={handleSelectAllTeams}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Captain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
              {sortedTeams.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No teams match your filters' : 'No teams found'}
                  </td>
                </tr>
              ) : (
                sortedTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => handleSelectTeam(team.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        {team.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {team.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.creator_username || team.captain_username || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.member_count || 0} members
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(team.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        team.status === 'active' ? 'bg-green-100 text-green-800' :
                        team.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {team.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTeam(team)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDissolveTeam(team.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Dissolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Team Details Modal */}
        {showTeamModal && selectedTeam && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Team Details: {selectedTeam.name}
                </h3>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <p className="text-sm text-gray-900">{selectedTeam.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Captain</label>
                    <p className="text-sm text-gray-900">{selectedTeam.captain_username || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTeam.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedTeam.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedTeam.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeam.status || 'Active'}
                    </span>
                  </div>
                </div>

                {selectedTeam.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedTeam.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members ({selectedTeam.members?.length || 0})
                  </label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Username
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Joined
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTeam.members?.map((member) => (
                          <tr key={member.user_id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {member.username}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                member.role === 'captain' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.role || 'Member'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium">
                              {member.role !== 'captain' && (
                                <button
                                  onClick={() => handleRemoveMember(selectedTeam.id, member.user_id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                              No members found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDissolveTeam(selectedTeam.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Dissolve Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeamManagement;