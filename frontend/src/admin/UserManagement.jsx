import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';
import AdminLayout from './AdminLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    page: 1,
    limit: 20
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState('');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await adminAPI.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const details = await adminAPI.getUserDetails(userId);
      setUserDetails(details);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBanUser = async (userId, is_banned, ban_reason = '') => {
    try {
      await adminAPI.updateUserBanStatus(userId, is_banned, ban_reason);
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to update ban status:', error);
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      await adminAPI.resetUserPassword(userId, newPassword);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    }
  };

  const handleWalletUpdate = async (userId, action, amount, reason) => {
    try {
      await adminAPI.updateUserWallet(userId, action, amount, reason);
      fetchUsers();
      fetchUserDetails(userId);
    } catch (error) {
      console.error('Failed to update wallet:', error);
    }
  };

  const handleDeleteUser = async (userId, reason) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId, reason);
        fetchUsers();
        setShowUserModal(false);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleBulkOperation = async (operation, data = {}) => {
    try {
      await adminAPI.performBulkUserOperation(operation, selectedUsers, data);
      fetchUsers();
      setSelectedUsers([]);
      setShowBulkModal(false);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    fetchUserDetails(user.id);
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex space-x-2">
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Bulk Actions ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.activeUsers || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Banned Users</h3>
            <p className="text-2xl font-bold text-red-600">{statistics.bannedUsers || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">New This Month</h3>
            <p className="text-2xl font-bold text-blue-600">{statistics.newUsersThisMonth || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search users..."
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="created_at">Join Date</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="last_login">Last Login</option>
                <option value="total_earnings">Total Earnings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tournaments
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
              {users.map((user) => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{parseFloat(user.wallet_balance || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.tournaments_joined || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.is_banned && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            userDetails={userDetails}
            onClose={() => setShowUserModal(false)}
            onBanUser={handleBanUser}
            onResetPassword={handleResetPassword}
            onWalletUpdate={handleWalletUpdate}
            onDeleteUser={handleDeleteUser}
            onSendNotification={async (title, message, type) => {
              try {
                await adminAPI.sendUserNotification(selectedUser.id, title, message, type);
                alert('Notification sent successfully');
              } catch (error) {
                alert('Failed to send notification');
              }
            }}
          />
        )}

        {/* Bulk Operations Modal */}
        {showBulkModal && (
          <BulkOperationsModal
            selectedCount={selectedUsers.length}
            onClose={() => setShowBulkModal(false)}
            onExecute={handleBulkOperation}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, userDetails, onClose, onBanUser, onResetPassword, onWalletUpdate, onDeleteUser, onSendNotification }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [banReason, setBanReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [walletAction, setWalletAction] = useState('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">User Management - {user.username}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['overview', 'wallet', 'security', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Username:</span> {user.username}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Full Name:</span> {user.full_name || 'Not provided'}</p>
                    <p><span className="font-medium">Phone:</span> {user.phone_number || 'Not provided'}</p>
                    <p><span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Login:</span> {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Wallet Balance:</span> ₹{parseFloat(user.wallet_balance || 0).toFixed(2)}</p>
                    <p><span className="font-medium">Total Earnings:</span> ₹{parseFloat(user.total_earnings || 0).toFixed(2)}</p>
                    <p><span className="font-medium">Total Spent:</span> ₹{parseFloat(user.total_spent || 0).toFixed(2)}</p>
                    <p><span className="font-medium">Tournaments Joined:</span> {user.tournaments_joined || 0}</p>
                    <p><span className="font-medium">Teams Created:</span> {user.teams_created || 0}</p>
                    <p><span className="font-medium">Teams Joined:</span> {user.teams_joined || 0}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {userDetails && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recent Transactions</h3>
                  <div className="bg-gray-50 rounded p-4 max-h-40 overflow-y-auto">
                    {userDetails.recentTransactions?.length > 0 ? (
                      <div className="space-y-2">
                        {userDetails.recentTransactions.map((transaction, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{transaction.description}</span>
                            <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No recent transactions</p>
                    )}
                  </div>
                </div>
              )}

              {/* Ban/Unban Actions */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
                <div className="flex items-center space-x-4">
                  {user.is_banned ? (
                    <button
                      onClick={() => onBanUser(user.id, false)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Unban User
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Ban reason..."
                        className="border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        onClick={() => onBanUser(user.id, true, banReason)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Ban User
                      </button>
                    </div>
                  )}
                </div>
                {user.is_banned && (
                  <div className="mt-2 text-sm text-red-600">
                    <p>Banned on: {new Date(user.banned_at).toLocaleDateString()}</p>
                    <p>Banned by: {user.banned_by}</p>
                    <p>Reason: {user.ban_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Wallet Management</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                      value={walletAction}
                      onChange={(e) => setWalletAction(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="add">Add Money</option>
                      <option value="deduct">Deduct Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={walletReason}
                      onChange={(e) => setWalletReason(e.target.value)}
                      placeholder="Reason for adjustment"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (walletAmount && parseFloat(walletAmount) > 0) {
                      onWalletUpdate(user.id, walletAction, parseFloat(walletAmount), walletReason);
                      setWalletAmount('');
                      setWalletReason('');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Wallet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Password Reset</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newPassword.length >= 6) {
                        onResetPassword(user.id, newPassword);
                        setNewPassword('');
                      }
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Reset Password
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-sm text-red-600 mb-2">
                    Permanently delete this user account. This action cannot be undone.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Reason for deletion..."
                      className="border border-gray-300 rounded px-3 py-2 flex-1"
                    />
                    <button
                      onClick={() => onDeleteUser(user.id, deleteReason)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Send Notification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="Notification title"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Notification message"
                      rows={4}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (notificationTitle && notificationMessage) {
                        onSendNotification(notificationTitle, notificationMessage, 'admin');
                        setNotificationTitle('');
                        setNotificationMessage('');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bulk Operations Modal Component
const BulkOperationsModal = ({ selectedCount, onClose, onExecute }) => {
  const [operation, setOperation] = useState('');
  const [banReason, setBanReason] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleExecute = () => {
    switch (operation) {
      case 'ban':
        onExecute('ban', { reason: banReason });
        break;
      case 'unban':
        onExecute('unban');
        break;
      case 'send_notification':
        onExecute('send_notification', {
          title: notificationTitle,
          message: notificationMessage,
          type: 'admin'
        });
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Bulk Operations</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Performing action on {selectedCount} selected users
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select operation</option>
              <option value="ban">Ban Users</option>
              <option value="unban">Unban Users</option>
              <option value="send_notification">Send Notification</option>
            </select>
          </div>

          {operation === 'ban' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ban Reason</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning users"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}

          {operation === 'send_notification' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Notification message"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={!operation || (operation === 'send_notification' && (!notificationTitle || !notificationMessage))}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;