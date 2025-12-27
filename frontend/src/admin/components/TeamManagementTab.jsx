import React, { useState } from 'react';

const TeamManagementTab = ({ teams, onTeamAction, tournament }) => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTeams = teams.filter(team => {
    if (filterStatus === 'all') return true;
    return team.status === filterStatus;
  });

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleBulkAction = (action) => {
    selectedTeams.forEach(teamId => {
      onTeamAction(teamId, action);
    });
    setSelectedTeams([]);
  };

  return (
    <div className="space-y-6">
      {/* Team Management Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Management</h3>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Teams</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disqualified">Disqualified</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTeams.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedTeams.length} team(s) selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedTeams([])}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-xl font-bold text-gray-700">{teams.length}</div>
            <div className="text-sm text-gray-600">Total Teams</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-xl font-bold text-green-700">
              {teams.filter(t => t.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-xl font-bold text-yellow-700">
              {teams.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-xl font-bold text-red-700">
              {teams.filter(t => t.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeams(filteredTeams.map(t => t.id));
                    } else {
                      setSelectedTeams([]);
                    }
                  }}
                  checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeams.map((team) => (
              <tr key={team.id} className={selectedTeams.includes(team.id) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() => handleSelectTeam(team.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                    <div className="text-sm text-gray-500">Captain: {team.captainName}</div>
                    <div className="text-sm text-gray-500">ID: #{team.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {team.members?.map((member, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{member.ign}</span>
                        <span className="text-gray-500 ml-2">({member.uid})</span>
                        {member.role === 'captain' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Captain
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    team.status === 'approved' ? 'bg-green-100 text-green-800' :
                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    team.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{new Date(team.registeredAt).toLocaleDateString()}</div>
                  <div>{new Date(team.registeredAt).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {team.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onTeamAction(team.id, 'approve')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onTeamAction(team.id, 'reject')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {team.status === 'approved' && (
                    <button
                      onClick={() => onTeamAction(team.id, 'disqualify')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Disqualify
                    </button>
                  )}
                  <button
                    onClick={() => {/* Open team details modal */}}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Validation Rules */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Team Validation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Automatic Checks</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Team size matches tournament type ({tournament.tournamentType})</li>
              <li>✓ All players have valid IGN and UID</li>
              <li>✓ No duplicate players across teams</li>
              <li>✓ Captain is part of the team</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Manual Review Required</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verify player identities</li>
              <li>• Check for banned players</li>
              <li>• Validate payment status</li>
              <li>• Review team composition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementTab;