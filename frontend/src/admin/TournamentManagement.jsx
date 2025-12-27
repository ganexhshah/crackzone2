import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';
import AdminLayout from './AdminLayout';

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxTeams: '',
    entryFee: '',
    prizePool: '',
    status: 'upcoming',
    tournamentType: 'SOLO',
    adminProfitType: 'percentage',
    adminProfitValue: 10,
    autoCalculatePrize: true,
    teamSize: 1,
    platformFeeVisible: true,
    prizeDistribution: [
      { rank: 1, percentage: 50 },
      { rank: 2, percentage: 30 },
      { rank: 3, percentage: 20 }
    ]
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await adminAPI.getTournaments();
      setTournaments(response);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrizePool = () => {
    const { entryFee, maxTeams, adminProfitType, adminProfitValue, tournamentType } = newTournament;
    
    if (!entryFee || !maxTeams) return 0;
    
    const totalCollection = parseFloat(entryFee) * parseInt(maxTeams);
    let adminProfit = 0;
    
    switch (adminProfitType) {
      case 'percentage':
        adminProfit = totalCollection * (parseFloat(adminProfitValue) / 100);
        break;
      case 'fixed_per_team':
        adminProfit = parseFloat(adminProfitValue) * parseInt(maxTeams);
        break;
      case 'platform_fee':
        adminProfit = parseFloat(adminProfitValue) * parseInt(maxTeams);
        break;
    }
    
    return totalCollection - adminProfit;
  };

  const handleTournamentTypeChange = (type) => {
    setNewTournament({
      ...newTournament,
      tournamentType: type,
      teamSize: type === 'SQUAD' ? 4 : 1
    });
  };

  const handlePrizeDistributionChange = (index, field, value) => {
    const newDistribution = [...newTournament.prizeDistribution];
    newDistribution[index] = { ...newDistribution[index], [field]: parseFloat(value) };
    setNewTournament({ ...newTournament, prizeDistribution: newDistribution });
  };

  const addPrizeRank = () => {
    setNewTournament({
      ...newTournament,
      prizeDistribution: [
        ...newTournament.prizeDistribution,
        { rank: newTournament.prizeDistribution.length + 1, percentage: 0 }
      ]
    });
  };

  const removePrizeRank = (index) => {
    const newDistribution = newTournament.prizeDistribution.filter((_, i) => i !== index);
    setNewTournament({ ...newTournament, prizeDistribution: newDistribution });
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      const calculatedPrizePool = newTournament.autoCalculatePrize ? calculatePrizePool() : parseFloat(newTournament.prizePool);
      const perPlayerFee = newTournament.tournamentType === 'SQUAD' ? 
        parseFloat(newTournament.entryFee) / newTournament.teamSize : 
        parseFloat(newTournament.entryFee);

      const tournamentData = {
        ...newTournament,
        calculatedPrizePool,
        perPlayerFee,
        prizePool: calculatedPrizePool
      };

      await adminAPI.createTournament(tournamentData);
      setShowCreateForm(false);
      setNewTournament({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        maxTeams: '',
        entryFee: '',
        prizePool: '',
        status: 'upcoming',
        tournamentType: 'SOLO',
        adminProfitType: 'percentage',
        adminProfitValue: 10,
        autoCalculatePrize: true,
        teamSize: 1,
        platformFeeVisible: true,
        prizeDistribution: [
          { rank: 1, percentage: 50 },
          { rank: 2, percentage: 30 },
          { rank: 3, percentage: 20 }
        ]
      });
      fetchTournaments();
    } catch (error) {
      console.error('Failed to create tournament:', error);
      alert('Failed to create tournament: ' + error.message);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await adminAPI.deleteTournament(id);
        fetchTournaments();
      } catch (error) {
        console.error('Failed to delete tournament:', error);
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateTournamentStatus(id, status);
      fetchTournaments();
    } catch (error) {
      console.error('Failed to update tournament status:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading tournaments...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tournament Management</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Tournament
          </button>
        </div>

        {/* Create Tournament Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Tournament</h2>
              <form onSubmit={handleCreateTournament} className="space-y-6">
                
                {/* Step 1: Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 1: Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.name}
                        onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        rows="2"
                        value={newTournament.description}
                        onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.startDate}
                        onChange={(e) => setNewTournament({...newTournament, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.endDate}
                        onChange={(e) => setNewTournament({...newTournament, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Tournament Type */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 2: Tournament Type (IMPORTANT)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Type</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tournamentType"
                            value="SOLO"
                            checked={newTournament.tournamentType === 'SOLO'}
                            onChange={(e) => handleTournamentTypeChange(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-gray-900">🧍 Solo Tournament (Individual Players)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tournamentType"
                            value="SQUAD"
                            checked={newTournament.tournamentType === 'SQUAD'}
                            onChange={(e) => handleTournamentTypeChange(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-gray-900">👥 Squad Tournament (4 Players per Team)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {newTournament.tournamentType === 'SOLO' ? 'Max Players' : 'Max Teams'}
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.maxTeams}
                        onChange={(e) => setNewTournament({...newTournament, maxTeams: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Entry & Wallet Logic */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 3: Entry Fee & Wallet Logic</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entry Fee {newTournament.tournamentType === 'SQUAD' ? '(Per Team)' : '(Per Player)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.entryFee}
                        onChange={(e) => setNewTournament({...newTournament, entryFee: e.target.value})}
                      />
                      {newTournament.tournamentType === 'SQUAD' && newTournament.entryFee && (
                        <p className="text-sm text-gray-600 mt-1">
                          Per Player: ₹{(parseFloat(newTournament.entryFee) / 4).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Collection</label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                        value={newTournament.entryFee && newTournament.maxTeams ? 
                          `₹${(parseFloat(newTournament.entryFee) * parseInt(newTournament.maxTeams)).toLocaleString()}` : '₹0'}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Admin Profit Configuration */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 4: Admin Profit Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profit Model</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.adminProfitType}
                        onChange={(e) => setNewTournament({...newTournament, adminProfitType: e.target.value})}
                      >
                        <option value="percentage">Percentage Cut</option>
                        <option value="fixed_per_team">Fixed Per Team</option>
                        <option value="platform_fee">Platform Fee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {newTournament.adminProfitType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        value={newTournament.adminProfitValue}
                        onChange={(e) => setNewTournament({...newTournament, adminProfitValue: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Profit</label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                        value={(() => {
                          if (!newTournament.entryFee || !newTournament.maxTeams) return '₹0';
                          const total = parseFloat(newTournament.entryFee) * parseInt(newTournament.maxTeams);
                          let profit = 0;
                          switch (newTournament.adminProfitType) {
                            case 'percentage':
                              profit = total * (parseFloat(newTournament.adminProfitValue) / 100);
                              break;
                            case 'fixed_per_team':
                            case 'platform_fee':
                              profit = parseFloat(newTournament.adminProfitValue) * parseInt(newTournament.maxTeams);
                              break;
                          }
                          return `₹${profit.toLocaleString()}`;
                        })()}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTournament.platformFeeVisible}
                        onChange={(e) => setNewTournament({...newTournament, platformFeeVisible: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Show platform fee to users</span>
                    </label>
                  </div>
                </div>

                {/* Step 5: Prize Pool */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Step 5: Prize Pool Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={newTournament.autoCalculatePrize}
                          onChange={(e) => setNewTournament({...newTournament, autoCalculatePrize: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Auto-calculate Prize Pool</span>
                      </label>
                      {!newTournament.autoCalculatePrize && (
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          placeholder="Manual Prize Pool"
                          value={newTournament.prizePool}
                          onChange={(e) => setNewTournament({...newTournament, prizePool: e.target.value})}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calculated Prize Pool</label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                        value={`₹${calculatePrizePool().toLocaleString()}`}
                      />
                    </div>
                  </div>

                  {/* Prize Distribution */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">Prize Distribution</h4>
                      <button
                        type="button"
                        onClick={addPrizeRank}
                        className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Add Rank
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newTournament.prizeDistribution.map((prize, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 w-16">
                            {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : `#${prize.rank}`}
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Percentage"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                            value={prize.percentage}
                            onChange={(e) => handlePrizeDistributionChange(index, 'percentage', e.target.value)}
                          />
                          <span className="text-sm text-gray-600 w-20">
                            ₹{((calculatePrizePool() * prize.percentage) / 100).toLocaleString()}
                          </span>
                          {newTournament.prizeDistribution.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrizeRank(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Total: {newTournament.prizeDistribution.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0)}%
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create Tournament
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tournaments List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tournament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prize Pool
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
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
              {tournaments.map((tournament) => (
                <tr key={tournament.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tournament.name || tournament.title}</div>
                      <div className="text-sm text-gray-500">{tournament.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tournament.tournament_type || 'SOLO'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{tournament.entry_fee || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{tournament.calculated_prize_pool || tournament.prize_pool || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tournament.registered_teams || tournament.registered_users || 0} / {tournament.max_teams || tournament.max_participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={tournament.status}
                      onChange={(e) => handleStatusChange(tournament.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => window.open(`/admin/tournaments/${tournament.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Admin Panel
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(tournament.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TournamentManagement;