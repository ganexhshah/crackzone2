import React, { useState } from 'react';

const ResultsTab = ({ leaderboard, matches, tournament, onShowResults }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showResultsForm, setShowResultsForm] = useState(false);
  const [matchResults, setMatchResults] = useState([]);

  const handleSubmitResults = async (matchId, results) => {
    try {
      // API call to submit match results
      console.log('Submitting results for match:', matchId, results);
      setShowResultsForm(false);
    } catch (error) {
      console.error('Failed to submit results:', error);
    }
  };

  const handleDeclareFinalWinners = async () => {
    try {
      // API call to finalize tournament and declare winners
      console.log('Declaring final winners');
    } catch (error) {
      console.error('Failed to declare winners:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Results & Ranking System</h3>
          <div className="space-x-2">
            <button
              onClick={() => setShowResultsForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Enter Match Results
            </button>
            <button
              onClick={handleDeclareFinalWinners}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Declare Winners
            </button>
          </div>
        </div>

        {/* Points System Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Current Point System</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1st Place (Booyah):</span>
                <span className="font-medium">20 points</span>
              </div>
              <div className="flex justify-between">
                <span>2nd Place:</span>
                <span className="font-medium">15 points</span>
              </div>
              <div className="flex justify-between">
                <span>3rd Place:</span>
                <span className="font-medium">12 points</span>
              </div>
              <div className="flex justify-between">
                <span>4th-6th Place:</span>
                <span className="font-medium">8 points</span>
              </div>
              <div className="flex justify-between">
                <span>7th-12th Place:</span>
                <span className="font-medium">4 points</span>
              </div>
              <div className="flex justify-between">
                <span>Per Kill:</span>
                <span className="font-medium">1 point</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Prize Distribution</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1st Place:</span>
                <span className="font-medium">₹{tournament.prizePool * 0.5}</span>
              </div>
              <div className="flex justify-between">
                <span>2nd Place:</span>
                <span className="font-medium">₹{tournament.prizePool * 0.3}</span>
              </div>
              <div className="flex justify-between">
                <span>3rd Place:</span>
                <span className="font-medium">₹{tournament.prizePool * 0.2}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-medium">Total Prize Pool:</span>
                <span className="font-bold">₹{tournament.prizePool}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Leaderboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">🏆 Overall Tournament Leaderboard</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matches Played
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best Placement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Kills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prize
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((team, index) => (
              <tr key={team.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                    {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                    {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                    <div className="text-sm text-gray-500">Captain: {team.captainName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-600">{team.totalPoints}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.matchesPlayed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  #{team.bestPlacement}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.totalKills}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {index < 3 && (
                    <span className="text-sm font-medium text-green-600">
                      ₹{index === 0 ? tournament.prizePool * 0.5 : 
                         index === 1 ? tournament.prizePool * 0.3 : 
                         tournament.prizePool * 0.2}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Match-wise Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Match-wise Results</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{match.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    match.status === 'completed' ? 'bg-green-100 text-green-800' :
                    match.status === 'live' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                
                {match.status === 'completed' && match.results ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>🥇 Winner:</span>
                        <span className="font-medium">{match.results.winner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Kills:</span>
                        <span>{match.results.totalKills}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="w-full text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Full Results
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {match.status === 'scheduled' ? 'Not started yet' : 'Results pending'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Entry Form Modal */}
      {showResultsForm && (
        <ResultsEntryModal
          matches={matches.filter(m => m.status === 'completed' && !m.results)}
          onSubmit={handleSubmitResults}
          onClose={() => setShowResultsForm(false)}
        />
      )}

      {/* Match Results Detail Modal */}
      {selectedMatch && (
        <MatchResultsModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

// Results Entry Modal Component
const ResultsEntryModal = ({ matches, onSubmit, onClose }) => {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [results, setResults] = useState([]);

  const handleMatchSelect = (matchId) => {
    setSelectedMatchId(matchId);
    // Initialize results array for the selected match
    // This would typically come from the teams participating in the match
    setResults([
      { teamId: 1, teamName: 'Fire Squad', placement: '', kills: '', points: 0 },
      { teamId: 2, teamName: 'Thunder Bolts', placement: '', kills: '', points: 0 },
      { teamId: 3, teamName: 'Storm Riders', placement: '', kills: '', points: 0 },
    ]);
  };

  const calculatePoints = (placement, kills) => {
    const placementPoints = {
      1: 20, 2: 15, 3: 12, 4: 8, 5: 8, 6: 8,
      7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4
    };
    return (placementPoints[placement] || 0) + (parseInt(kills) || 0);
  };

  const updateResult = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    
    if (field === 'placement' || field === 'kills') {
      newResults[index].points = calculatePoints(
        newResults[index].placement,
        newResults[index].kills
      );
    }
    
    setResults(newResults);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Enter Match Results</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => handleMatchSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Choose a match...</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.name} - {new Date(match.scheduledTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedMatchId && (
            <div>
              <h3 className="text-lg font-medium mb-3">Team Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kills</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={result.teamId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.teamName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={result.placement}
                            onChange={(e) => updateResult(index, 'placement', e.target.value)}
                            className="w-20 border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={result.kills}
                            onChange={(e) => updateResult(index, 'kills', e.target.value)}
                            className="w-20 border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {result.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selectedMatchId, results)}
            disabled={!selectedMatchId || results.some(r => !r.placement)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Results
          </button>
        </div>
      </div>
    </div>
  );
};

// Match Results Detail Modal Component
const MatchResultsModal = ({ match, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{match.name} - Detailed Results</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Match Date</label>
            <p className="text-sm text-gray-900">{new Date(match.scheduledTime).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Map</label>
            <p className="text-sm text-gray-900">{match.map}</p>
          </div>
        </div>
        
        {match.results && (
          <div>
            <h3 className="text-lg font-medium mb-3">Final Standings</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kills</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {match.results.teams?.map((team, index) => (
                  <tr key={team.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      #{team.placement}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {team.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {team.kills}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default ResultsTab;