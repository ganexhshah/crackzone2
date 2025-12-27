import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

const WalletControlTab = ({ tournament, teams }) => {
  const [walletStatus, setWalletStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    fetchWalletStatus();
  }, [tournament.id]);

  const fetchWalletStatus = async () => {
    try {
      setLoading(true);
      const status = await adminAPI.getTournamentWalletStatus(tournament.id);
      setWalletStatus(status);
    } catch (error) {
      console.error('Failed to fetch wallet status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectFees = async () => {
    if (!window.confirm('Are you sure you want to collect entry fees from all eligible participants?')) {
      return;
    }

    try {
      setProcessing(true);
      await adminAPI.collectTournamentFees(tournament.id);
      await fetchWalletStatus();
      alert('Entry fees collected successfully!');
    } catch (error) {
      console.error('Failed to collect fees:', error);
      alert('Failed to collect fees: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const calculateFinancials = () => {
    const entryFee = parseFloat(tournament.entry_fee || tournament.entryFee || 0);
    const maxParticipants = parseInt(tournament.max_participants || tournament.maxTeams || tournament.maxParticipants || 0);
    const totalCollection = entryFee * maxParticipants;
    
    let adminProfit = 0;
    const adminProfitType = tournament.admin_profit_type || 'percentage';
    const adminProfitValue = parseFloat(tournament.admin_profit_value || 10);
    
    switch (adminProfitType) {
      case 'percentage':
        adminProfit = totalCollection * (adminProfitValue / 100);
        break;
      case 'fixed_per_team':
      case 'platform_fee':
        adminProfit = adminProfitValue * maxParticipants;
        break;
    }
    
    const prizePool = totalCollection - adminProfit;
    
    return { totalCollection, adminProfit, prizePool };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-900">Loading wallet status...</div>
      </div>
    );
  }

  const financials = calculateFinancials();
  const isSoloTournament = (tournament.tournament_type || tournament.tournamentType) === 'SOLO';
  const entryFee = tournament.entry_fee || tournament.entryFee || 0;
  const maxParticipants = tournament.max_participants || tournament.maxTeams || tournament.maxParticipants || 0;
  const adminProfitType = tournament.admin_profit_type || 'percentage';
  const adminProfitValue = tournament.admin_profit_value || 10;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
        <h3 className="text-xl font-bold mb-4 text-gray-900">💰 Financial Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">₹{financials.totalCollection.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Collection</div>
            <div className="text-xs text-gray-500">
              ₹{entryFee} × {maxParticipants} {isSoloTournament ? 'players' : 'teams'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">₹{financials.adminProfit.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Admin Profit</div>
            <div className="text-xs text-gray-500">
              {adminProfitType === 'percentage' 
                ? `${adminProfitValue}% of collection`
                : `₹${adminProfitValue} per ${isSoloTournament ? 'player' : 'team'}`
              }
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">₹{financials.prizePool.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Prize Pool</div>
            <div className="text-xs text-gray-500">After admin profit deduction</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {isSoloTournament 
                ? (walletStatus?.eligiblePlayers || 0)
                : (walletStatus?.confirmedTeams || 0)
              }
            </div>
            <div className="text-sm text-gray-600">
              {isSoloTournament ? 'Eligible Players' : 'Confirmed Teams'}
            </div>
            <div className="text-xs text-gray-500">Ready to participate</div>
          </div>
        </div>
      </div>

      {/* Tournament Type Specific Logic */}
      {isSoloTournament ? (
        <SoloTournamentWallet 
          walletStatus={walletStatus}
          tournament={tournament}
          onCollectFees={handleCollectFees}
          processing={processing}
        />
      ) : (
        <SquadTournamentWallet 
          walletStatus={walletStatus}
          tournament={tournament}
          onCollectFees={handleCollectFees}
          processing={processing}
        />
      )}

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🔧 Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleCollectFees}
            disabled={processing}
            className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                💳 Collect Entry Fees
              </>
            )}
          </button>
          <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700">
            📊 Generate Report
          </button>
          <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700">
            🔄 Process Refunds
          </button>
        </div>
      </div>

      {/* Prize Distribution Preview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🏆 Prize Distribution Preview</h3>
        {tournament.prize_distribution ? (
          <div className="space-y-2">
            {(() => {
              try {
                const prizeDistribution = typeof tournament.prize_distribution === 'string' 
                  ? JSON.parse(tournament.prize_distribution)
                  : tournament.prize_distribution;
                
                return prizeDistribution.map((prize, index) => {
                  const amount = (financials.prizePool * prize.percentage) / 100;
                  const perPlayerAmount = isSoloTournament ? amount : amount / 4;
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : `#${prize.rank}`}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">Rank {prize.rank}</div>
                          <div className="text-sm text-gray-600">{prize.percentage}% of prize pool</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{amount.toLocaleString()}</div>
                        {!isSoloTournament && (
                          <div className="text-sm text-gray-600">₹{perPlayerAmount.toLocaleString()} per player</div>
                        )}
                      </div>
                    </div>
                  );
                });
              } catch (error) {
                console.error('Error parsing prize distribution:', error);
                return (
                  <div className="text-center py-4 text-gray-500">
                    Prize distribution data is not available or invalid
                  </div>
                );
              }
            })()}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { rank: 1, percentage: 50 },
              { rank: 2, percentage: 30 },
              { rank: 3, percentage: 20 }
            ].map((prize, index) => {
              const amount = (financials.prizePool * prize.percentage) / 100;
              const perPlayerAmount = isSoloTournament ? amount : amount / 4;
              
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : `#${prize.rank}`}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">Rank {prize.rank}</div>
                      <div className="text-sm text-gray-600">{prize.percentage}% of prize pool</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{amount.toLocaleString()}</div>
                    {!isSoloTournament && (
                      <div className="text-sm text-gray-600">₹{perPlayerAmount.toLocaleString()} per player</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Solo Tournament Wallet Component
const SoloTournamentWallet = ({ walletStatus, tournament, onCollectFees, processing }) => {
  if (!walletStatus) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">🧍 Solo Tournament - Player Wallets</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Entry Logic:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Entry Fee: ₹{tournament.entry_fee || tournament.entryFee || 0} per player</li>
          <li>• Each player must have ≥ ₹{tournament.entry_fee || tournament.entryFee || 0} in personal wallet</li>
          <li>• Money is auto-deducted from player wallet on registration</li>
          <li>• Prize credited directly to winner's wallet</li>
        </ul>
      </div>

      {walletStatus.playerRegistrations && walletStatus.playerRegistrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {walletStatus.playerRegistrations.map((player, index) => {
                const balance = parseFloat(player.wallet_balance || 0);
                const entryFee = parseFloat(tournament.entry_fee || tournament.entryFee || 0);
                const isEligible = balance >= entryFee;
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{player.username}</div>
                        <div className="text-sm text-gray-500">{player.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${balance >= entryFee ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{entryFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isEligible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isEligible ? '✅ Eligible' : '❌ Insufficient Funds'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No player registrations found
        </div>
      )}
    </div>
  );
};

// Squad Tournament Wallet Component
const SquadTournamentWallet = ({ walletStatus, tournament, onCollectFees, processing }) => {
  if (!walletStatus) return null;

  const perPlayerFee = parseFloat(tournament.entry_fee || tournament.entryFee || 0) / 4;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">👥 Squad Tournament - Team Wallets</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">Entry Logic:</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Team Entry Fee: ₹{tournament.entry_fee || tournament.entryFee || 0} (₹{perPlayerFee.toFixed(2)} per player)</li>
          <li>• Each player contributes ₹{perPlayerFee.toFixed(2)} from personal wallet</li>
          <li>• Team wallet collects: ₹{perPlayerFee.toFixed(2)} × 4 = ₹{tournament.entry_fee || tournament.entryFee || 0}</li>
          <li>• Team becomes eligible when full amount collected</li>
          <li>• Prize distributed equally among team members</li>
        </ul>
      </div>

      {walletStatus.teamWallets && walletStatus.teamWallets.length > 0 ? (
        <div className="space-y-4">
          {walletStatus.teamWallets.map((teamWallet, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{teamWallet.team_name}</h4>
                  <p className="text-sm text-gray-600">Captain: {teamWallet.captain_name}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  teamWallet.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {teamWallet.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Required Amount</div>
                  <div className="font-medium text-gray-900">₹{parseFloat(teamWallet.required_amount || tournament.entry_fee || tournament.entryFee || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Collected Amount</div>
                  <div className="font-medium text-green-600">₹{parseFloat(teamWallet.paid_amount || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Contributions</div>
                  <div className="font-medium text-gray-900">{teamWallet.contributions_count || 0} / 4</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (parseFloat(teamWallet.paid_amount || 0) / parseFloat(teamWallet.required_amount || tournament.entry_fee || tournament.entryFee || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {teamWallet.status !== 'confirmed' && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Team cannot participate until all 4 players contribute their share
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No team registrations found
        </div>
      )}
    </div>
  );
};

export default WalletControlTab;