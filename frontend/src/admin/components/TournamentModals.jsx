import React from 'react';

// Create Match Modal
export const CreateMatchModal = ({ newMatch, setNewMatch, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Match</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Match Name</label>
          <input
            type="text"
            required
            value={newMatch.name}
            onChange={(e) => setNewMatch({...newMatch, name: e.target.value})}
            placeholder="e.g., Match 1, Semi Final"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Map</label>
          <select
            value={newMatch.map}
            onChange={(e) => setNewMatch({...newMatch, map: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Map</option>
            <option value="Bermuda">Bermuda</option>
            <option value="Purgatory">Purgatory</option>
            <option value="Kalahari">Kalahari</option>
            <option value="Alpine">Alpine</option>
            <option value="Nexterra">Nexterra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Game Mode</label>
          <select
            value={newMatch.gameMode}
            onChange={(e) => setNewMatch({...newMatch, gameMode: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="Battle Royale">Battle Royale</option>
            <option value="Clash Squad">Clash Squad</option>
            <option value="Ranked">Ranked</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
          <input
            type="datetime-local"
            required
            value={newMatch.scheduledTime}
            onChange={(e) => setNewMatch({...newMatch, scheduledTime: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room ID (Optional)</label>
            <input
              type="text"
              value={newMatch.roomId}
              onChange={(e) => setNewMatch({...newMatch, roomId: e.target.value})}
              placeholder="12345678"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Password (Optional)</label>
            <input
              type="text"
              value={newMatch.roomPassword}
              onChange={(e) => setNewMatch({...newMatch, roomPassword: e.target.value})}
              placeholder="1234"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            💡 Tip: You can set room details later or update them before the match starts.
          </p>
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
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Create Match
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Room Details Modal
export const RoomDetailsModal = ({ roomDetails, setRoomDetails, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Update Room Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
          <input
            type="text"
            required
            value={roomDetails.roomId}
            onChange={(e) => setRoomDetails({...roomDetails, roomId: e.target.value})}
            placeholder="12345678"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Password</label>
          <input
            type="text"
            required
            value={roomDetails.roomPassword}
            onChange={(e) => setRoomDetails({...roomDetails, roomPassword: e.target.value})}
            placeholder="1234"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publish Time</label>
          <input
            type="datetime-local"
            value={roomDetails.publishTime}
            onChange={(e) => setRoomDetails({...roomDetails, publishTime: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to publish immediately
          </p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-sm text-yellow-700">
            ⚠️ Room details will be visible to all registered teams once published.
          </p>
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
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Update Room Details
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Announcement Modal
export const AnnouncementModal = ({ announcement, setAnnouncement, teams, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📢 Send Announcement</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title</label>
          <input
            type="text"
            required
            value={announcement.title}
            onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
            placeholder="e.g., Match 1 Starting Soon"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            required
            value={announcement.message}
            onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
            placeholder="Enter your announcement message..."
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
          <select
            value={announcement.targetType}
            onChange={(e) => setAnnouncement({...announcement, targetType: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Teams</option>
            <option value="selected">Selected Teams</option>
            <option value="approved">Approved Teams Only</option>
            <option value="pending">Pending Teams Only</option>
          </select>
        </div>

        {announcement.targetType === 'selected' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Teams</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {teams.map((team) => (
                <label key={team.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={announcement.selectedTeams.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAnnouncement({
                          ...announcement,
                          selectedTeams: [...announcement.selectedTeams, team.id]
                        });
                      } else {
                        setAnnouncement({
                          ...announcement,
                          selectedTeams: announcement.selectedTeams.filter(id => id !== team.id)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{team.teamName}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            📱 Announcements will be sent as push notifications and displayed in the app.
          </p>
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
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Send Announcement
          </button>
        </div>
      </form>
    </div>
  </div>
);