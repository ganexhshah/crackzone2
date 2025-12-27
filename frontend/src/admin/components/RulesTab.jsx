import React, { useState } from 'react';

const RulesTab = ({ tournament }) => {
  const [rules, setRules] = useState({
    general: [
      'No hacking or cheating allowed',
      'Use of emulators is prohibited',
      'Teams must join the room within 5 minutes of room publication',
      'Late joining will result in disqualification'
    ],
    character: [
      'All characters are allowed',
      'Character abilities must be used fairly',
      'No character-specific exploits'
    ],
    weapons: [
      'All weapons are allowed',
      'No weapon glitches or exploits',
      'Fair play with all weapon types'
    ],
    gameplay: [
      'No teaming with other squads',
      'No stream sniping',
      'Play within the designated zone',
      'No intentional feeding or throwing'
    ]
  });

  const [bannedPlayers, setBannedPlayers] = useState([
    {
      id: 1,
      playerName: 'CheaterPlayer123',
      uid: '123456789',
      reason: 'Using aimbot',
      bannedDate: new Date('2024-01-15'),
      banType: 'permanent',
      proof: 'screenshot_evidence.jpg'
    },
    {
      id: 2,
      playerName: 'TeamKiller99',
      uid: '987654321',
      reason: 'Team killing',
      bannedDate: new Date('2024-01-10'),
      banType: 'temporary',
      banExpiry: new Date('2024-02-10'),
      proof: 'video_evidence.mp4'
    }
  ]);

  const [showBanModal, setShowBanModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newBan, setNewBan] = useState({
    playerName: '',
    uid: '',
    reason: '',
    banType: 'temporary',
    banDuration: '7',
    proof: ''
  });

  const handleAddRule = (category, rule) => {
    setRules(prev => ({
      ...prev,
      [category]: [...prev[category], rule]
    }));
  };

  const handleRemoveRule = (category, index) => {
    setRules(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleBanPlayer = async (banData) => {
    try {
      // API call to ban player
      const newBannedPlayer = {
        id: Date.now(),
        ...banData,
        bannedDate: new Date(),
        banExpiry: banData.banType === 'temporary' ? 
          new Date(Date.now() + parseInt(banData.banDuration) * 24 * 60 * 60 * 1000) : null
      };
      setBannedPlayers(prev => [...prev, newBannedPlayer]);
      setShowBanModal(false);
      setNewBan({
        playerName: '',
        uid: '',
        reason: '',
        banType: 'temporary',
        banDuration: '7',
        proof: ''
      });
    } catch (error) {
      console.error('Failed to ban player:', error);
    }
  };

  const handleUnbanPlayer = async (playerId) => {
    try {
      // API call to unban player
      setBannedPlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (error) {
      console.error('Failed to unban player:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rules Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">⚖️ Tournament Rules & Fair Play</h3>
          <button
            onClick={() => setShowRuleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(rules).map(([category, categoryRules]) => (
            <div key={category} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 capitalize text-gray-800">
                {category === 'general' ? '📋 General Rules' :
                 category === 'character' ? '👤 Character Rules' :
                 category === 'weapons' ? '🔫 Weapon Rules' :
                 '🎮 Gameplay Rules'}
              </h4>
              <ul className="space-y-2">
                {categoryRules.map((rule, index) => (
                  <li key={index} className="flex justify-between items-start">
                    <span className="text-sm text-gray-700 flex-1">• {rule}</span>
                    <button
                      onClick={() => handleRemoveRule(category, index)}
                      className="text-red-500 hover:text-red-700 ml-2 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Banned Players Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">🚫 Banned Players</h3>
            <button
              onClick={() => setShowBanModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Ban Player
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ban Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ban Date
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
              {bannedPlayers.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{player.playerName}</div>
                      <div className="text-sm text-gray-500">UID: {player.uid}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{player.reason}</div>
                    {player.proof && (
                      <div className="text-xs text-blue-600">Proof: {player.proof}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      player.banType === 'permanent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.banType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.bannedDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.banType === 'temporary' && player.banExpiry ? (
                      <div className="text-sm">
                        {new Date() > player.banExpiry ? (
                          <span className="text-green-600">Expired</span>
                        ) : (
                          <span className="text-red-600">
                            Until {player.banExpiry.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-red-600 text-sm">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUnbanPlayer(player.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Unban
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      View Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fair Play Guidelines */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🛡️ Fair Play Enforcement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Detection Methods</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Live match monitoring by admins</li>
              <li>• Player reports and complaints</li>
              <li>• Screenshot/video evidence review</li>
              <li>• Suspicious gameplay pattern analysis</li>
              <li>• Community feedback and reports</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Penalty System</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Warning:</strong> First minor offense</li>
              <li>• <strong>7-day ban:</strong> Repeated minor offenses</li>
              <li>• <strong>30-day ban:</strong> Major rule violations</li>
              <li>• <strong>Permanent ban:</strong> Cheating/hacking</li>
              <li>• <strong>Tournament DQ:</strong> Match-specific violations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">📋 Recent Reports</h3>
        
        <div className="space-y-3">
          {[
            {
              id: 1,
              reporter: 'PlayerABC',
              reported: 'SuspiciousPlayer',
              reason: 'Possible aimbot usage',
              status: 'investigating',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
              id: 2,
              reporter: 'TeamCaptain',
              reported: 'RuleBreaker',
              reason: 'Team killing',
              status: 'resolved',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
            }
          ].map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">{report.reporter}</span>
                    <span className="text-gray-400">reported</span>
                    <span className="text-sm font-medium text-red-600">{report.reported}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{report.reason}</div>
                  <div className="text-xs text-gray-500">
                    {report.timestamp.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ban Player Modal */}
      {showBanModal && (
        <BanPlayerModal
          newBan={newBan}
          setNewBan={setNewBan}
          onBan={handleBanPlayer}
          onClose={() => setShowBanModal(false)}
        />
      )}
    </div>
  );
};

// Ban Player Modal Component
const BanPlayerModal = ({ newBan, setNewBan, onBan, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ban Player</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onBan(newBan); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
          <input
            type="text"
            required
            value={newBan.playerName}
            onChange={(e) => setNewBan({...newBan, playerName: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Player UID</label>
          <input
            type="text"
            required
            value={newBan.uid}
            onChange={(e) => setNewBan({...newBan, uid: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            required
            value={newBan.reason}
            onChange={(e) => setNewBan({...newBan, reason: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ban Type</label>
          <select
            value={newBan.banType}
            onChange={(e) => setNewBan({...newBan, banType: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="temporary">Temporary</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>

        {newBan.banType === 'temporary' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ban Duration (days)</label>
            <select
              value={newBan.banDuration}
              onChange={(e) => setNewBan({...newBan, banDuration: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proof (optional)</label>
          <input
            type="text"
            value={newBan.proof}
            onChange={(e) => setNewBan({...newBan, proof: e.target.value})}
            placeholder="Screenshot/video filename or URL"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Ban Player
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default RulesTab;