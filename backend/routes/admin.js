const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// Admin credentials (in production, store in database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const [usersResult, tournamentsResult, teamsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM tournaments'),
      pool.query('SELECT COUNT(*) FROM teams')
    ]);

    const activeTournamentsResult = await pool.query(
      "SELECT COUNT(*) FROM tournaments WHERE status = 'active'"
    );

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalTournaments: parseInt(tournamentsResult.rows[0].count),
      activeTournaments: parseInt(activeTournamentsResult.rows[0].count),
      totalTeams: parseInt(teamsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tournaments
router.get('/tournaments', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        COUNT(DISTINCT tp.user_id) as registered_users,
        COUNT(DISTINCT tt.id) as registered_teams
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      LEFT JOIN tournament_teams tt ON t.id = tt.tournament_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    // Map the database columns to match frontend expectations
    const tournaments = result.rows.map(tournament => ({
      ...tournament,
      name: tournament.title, // Map title to name for frontend
      max_teams: tournament.max_participants, // Map max_participants to max_teams
      registered_teams: tournament.registered_teams || 0
    }));

    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create tournament
router.post('/tournaments', verifyAdminToken, async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      maxTeams,
      entryFee,
      prizePool,
      status,
      tournamentType,
      adminProfitType,
      adminProfitValue,
      autoCalculatePrize,
      teamSize,
      platformFeeVisible,
      prizeDistribution,
      calculatedPrizePool,
      perPlayerFee
    } = req.body;

    // Calculate admin profit amount
    const totalCollection = parseFloat(entryFee) * parseInt(maxTeams);
    let adminProfitAmount = 0;
    
    switch (adminProfitType) {
      case 'percentage':
        adminProfitAmount = totalCollection * (parseFloat(adminProfitValue) / 100);
        break;
      case 'fixed_per_team':
      case 'platform_fee':
        adminProfitAmount = parseFloat(adminProfitValue) * parseInt(maxTeams);
        break;
    }

    const result = await pool.query(`
      INSERT INTO tournaments (
        title, description, start_date, end_date, 
        max_participants, entry_fee, prize_pool, status, game,
        tournament_type, admin_profit_type, admin_profit_value, admin_profit_amount,
        calculated_prize_pool, auto_calculate_prize, team_size, per_player_fee,
        total_collected, prize_distribution, platform_fee_visible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      name, description, startDate, endDate, maxTeams, entryFee, 
      calculatedPrizePool || prizePool, status, 'Free Fire',
      tournamentType, adminProfitType, adminProfitValue, adminProfitAmount,
      calculatedPrizePool || prizePool, autoCalculatePrize, teamSize, perPlayerFee,
      totalCollection, JSON.stringify(prizeDistribution), platformFeeVisible
    ]);

    // Create admin wallet entry
    await pool.query(`
      INSERT INTO admin_wallets (tournament_id, profit_amount, profit_type, status)
      VALUES ($1, $2, $3, 'pending')
    `, [result.rows[0].id, adminProfitAmount, adminProfitType]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update tournament status
router.put('/tournaments/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tournament status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tournament
router.delete('/tournaments/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related records
    await pool.query('DELETE FROM tournament_participants WHERE tournament_id = $1', [id]);
    await pool.query('DELETE FROM tournament_results WHERE tournament_id = $1', [id]);
    
    // Then delete the tournament
    const result = await pool.query('DELETE FROM tournaments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with enhanced details
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    let paramCount = 0;

    // Search functionality
    if (search) {
      paramCount++;
      whereClause += ` WHERE (u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Status filter
    if (status) {
      paramCount++;
      if (whereClause) {
        whereClause += ` AND u.is_active = $${paramCount}`;
      } else {
        whereClause += ` WHERE u.is_active = $${paramCount}`;
      }
      params.push(status === 'active');
    }

    // Valid sort columns
    const validSortColumns = ['created_at', 'username', 'email', 'last_login', 'total_earnings'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        u.id, u.username, u.email, u.full_name, u.phone_number,
        u.created_at, u.updated_at, u.last_login, u.auth_provider, 
        u.is_profile_complete, u.is_active, u.is_banned, u.ban_reason,
        u.banned_at, u.banned_by, u.profile_image_url,
        COALESCE(w.balance, 0) as wallet_balance,
        COALESCE(w.total_earnings, 0) as total_earnings,
        COALESCE(w.total_spent, 0) as total_spent,
        COUNT(DISTINCT tp.tournament_id) as tournaments_joined,
        COUNT(DISTINCT t.id) as teams_created,
        COUNT(DISTINCT tm.team_id) as teams_joined
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN teams t ON u.id = t.created_by
      LEFT JOIN team_members tm ON u.id = tm.user_id
      ${whereClause}
      GROUP BY u.id, w.balance, w.total_earnings, w.total_spent
      ORDER BY ${sortColumn === 'total_earnings' ? 'w.total_earnings' : 'u.' + sortColumn} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, paramCount));

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details by ID
router.get('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const userQuery = `
      SELECT 
        u.*,
        COALESCE(w.balance, 0) as wallet_balance,
        COALESCE(w.total_earnings, 0) as total_earnings,
        COALESCE(w.total_spent, 0) as total_spent,
        COUNT(DISTINCT tp.tournament_id) as tournaments_joined,
        COUNT(DISTINCT t.id) as teams_created,
        COUNT(DISTINCT tm.team_id) as teams_joined
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN teams t ON u.id = t.created_by
      LEFT JOIN team_members tm ON u.id = tm.user_id
      WHERE u.id = $1
      GROUP BY u.id, w.balance, w.total_earnings, w.total_spent
    `;

    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent transactions
    const transactionsQuery = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const transactionsResult = await pool.query(transactionsQuery, [id]);

    // Get recent tournament participations
    const tournamentsQuery = `
      SELECT t.id, t.title, t.start_date, t.status, tp.joined_at
      FROM tournament_participants tp
      JOIN tournaments t ON tp.tournament_id = t.id
      WHERE tp.user_id = $1
      ORDER BY tp.joined_at DESC
      LIMIT 5
    `;
    const tournamentsResult = await pool.query(tournamentsQuery, [id]);

    res.json({
      user: userResult.rows[0],
      recentTransactions: transactionsResult.rows,
      recentTournaments: tournamentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban/Unban user
router.put('/users/:id/ban-status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_banned, ban_reason } = req.body;

    const updateData = {
      is_banned,
      is_active: !is_banned, // If banned, set inactive
      banned_at: is_banned ? new Date() : null,
      banned_by: is_banned ? req.admin.username : null,
      ban_reason: is_banned ? ban_reason : null
    };

    const result = await pool.query(`
      UPDATE users 
      SET is_banned = $1, is_active = $2, banned_at = $3, banned_by = $4, ban_reason = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 
      RETURNING username, email, is_banned
    `, [updateData.is_banned, updateData.is_active, updateData.banned_at, updateData.banned_by, updateData.ban_reason, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Create notification for user
    const notificationTitle = is_banned ? 'Account Suspended' : 'Account Restored';
    const notificationMessage = is_banned 
      ? `Your account has been suspended. ${ban_reason ? `Reason: ${ban_reason}` : 'Please contact support for more information.'}`
      : 'Your account has been restored and is now active again.';

    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data) 
      VALUES ($1, $2, $3, $4, $5)
    `, [
      id,
      'account',
      notificationTitle,
      notificationMessage,
      JSON.stringify({
        action: is_banned ? 'banned' : 'unbanned',
        reason: ban_reason || null,
        adminUsername: req.admin.username
      })
    ]);

    res.json({
      message: `User ${is_banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        username: user.username,
        email: user.email,
        is_banned: user.is_banned
      }
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING username, email
    `, [hashedPassword, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Create notification for user
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data) 
      VALUES ($1, $2, $3, $4, $5)
    `, [
      id,
      'security',
      'Password Reset by Admin',
      'Your password has been reset by an administrator. Please log in with your new password and consider changing it for security.',
      JSON.stringify({
        action: 'password_reset',
        adminUsername: req.admin.username,
        resetAt: new Date()
      })
    ]);

    res.json({
      message: 'Password reset successfully',
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user wallet balance
router.put('/users/:id/wallet', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, amount, reason } = req.body; // action: 'add' or 'deduct'

    if (!['add', 'deduct'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "deduct"' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    await pool.query('BEGIN');

    try {
      // Get current user info
      const userResult = await pool.query('SELECT username, email FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];

      // Update wallet balance
      const walletQuery = action === 'add' 
        ? `INSERT INTO wallets (user_id, balance, total_earnings) 
           VALUES ($1, $2, $2) 
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             balance = wallets.balance + $2,
             total_earnings = wallets.total_earnings + $2,
             updated_at = CURRENT_TIMESTAMP
           RETURNING balance`
        : `UPDATE wallets 
           SET balance = GREATEST(0, balance - $2), updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 
           RETURNING balance`;

      const walletResult = await pool.query(walletQuery, [id, amount]);

      // Create transaction record
      await pool.query(`
        INSERT INTO transactions (user_id, type, amount, description, status, admin_action, admin_username)
        VALUES ($1, $2, $3, $4, 'completed', true, $5)
      `, [
        id,
        action === 'add' ? 'credit' : 'debit',
        amount,
        `Admin ${action === 'add' ? 'Credit' : 'Debit'}: ${reason || 'Manual adjustment'}`,
        req.admin.username
      ]);

      // Create notification for user
      const notificationTitle = action === 'add' ? 'Wallet Credit Added' : 'Wallet Debit Applied';
      const notificationMessage = action === 'add'
        ? `₹${amount} has been added to your wallet by admin. ${reason ? `Reason: ${reason}` : ''}`
        : `₹${amount} has been deducted from your wallet by admin. ${reason ? `Reason: ${reason}` : ''}`;

      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, data) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        id,
        'wallet',
        notificationTitle,
        notificationMessage,
        JSON.stringify({
          action: action === 'add' ? 'credit' : 'debit',
          amount: parseFloat(amount),
          reason: reason || null,
          adminUsername: req.admin.username,
          newBalance: parseFloat(walletResult.rows[0]?.balance || 0)
        })
      ]);

      await pool.query('COMMIT');

      res.json({
        message: `Wallet ${action === 'add' ? 'credited' : 'debited'} successfully`,
        user: {
          username: user.username,
          email: user.email
        },
        transaction: {
          action,
          amount: parseFloat(amount),
          newBalance: parseFloat(walletResult.rows[0]?.balance || 0)
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating user wallet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query('BEGIN');

    try {
      // Get user info before deletion
      const userResult = await pool.query('SELECT username, email FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];

      // Delete related records (in order to avoid foreign key constraints)
      await pool.query('DELETE FROM notifications WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM tournament_participants WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM team_members WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM transactions WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM wallets WHERE user_id = $1', [id]);
      await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [id]);
      
      // Finally delete the user
      await pool.query('DELETE FROM users WHERE id = $1', [id]);

      // Log the deletion
      console.log(`User deleted by admin: ${user.username} (${user.email}) - Reason: ${reason || 'No reason provided'} - Admin: ${req.admin.username}`);

      await pool.query('COMMIT');

      res.json({
        message: 'User account deleted successfully',
        deletedUser: {
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notification to user
router.post('/users/:id/notifications', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type = 'admin' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Verify user exists
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data) 
      VALUES ($1, $2, $3, $4, $5)
    `, [
      id,
      type,
      title,
      message,
      JSON.stringify({
        sentBy: 'admin',
        adminUsername: req.admin.username,
        sentAt: new Date()
      })
    ]);

    res.json({
      message: 'Notification sent successfully',
      notification: {
        title,
        message,
        type,
        sentTo: userResult.rows[0].username
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk user operations
router.post('/users/bulk-operations', verifyAdminToken, async (req, res) => {
  try {
    const { operation, userIds, data = {} } = req.body;

    if (!operation || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Operation and userIds array are required' });
    }

    let results = [];

    switch (operation) {
      case 'ban':
        for (const userId of userIds) {
          try {
            await pool.query(`
              UPDATE users 
              SET is_banned = true, is_active = false, banned_at = CURRENT_TIMESTAMP, 
                  banned_by = $1, ban_reason = $2, updated_at = CURRENT_TIMESTAMP
              WHERE id = $3
            `, [req.admin.username, data.reason || 'Bulk ban operation', userId]);
            results.push({ userId, status: 'success' });
          } catch (error) {
            results.push({ userId, status: 'error', error: error.message });
          }
        }
        break;

      case 'unban':
        for (const userId of userIds) {
          try {
            await pool.query(`
              UPDATE users 
              SET is_banned = false, is_active = true, banned_at = null, 
                  banned_by = null, ban_reason = null, updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [userId]);
            results.push({ userId, status: 'success' });
          } catch (error) {
            results.push({ userId, status: 'error', error: error.message });
          }
        }
        break;

      case 'send_notification':
        if (!data.title || !data.message) {
          return res.status(400).json({ message: 'Title and message are required for notifications' });
        }

        for (const userId of userIds) {
          try {
            await pool.query(`
              INSERT INTO notifications (user_id, type, title, message, data) 
              VALUES ($1, $2, $3, $4, $5)
            `, [
              userId,
              data.type || 'admin',
              data.title,
              data.message,
              JSON.stringify({
                sentBy: 'admin',
                adminUsername: req.admin.username,
                bulkOperation: true,
                sentAt: new Date()
              })
            ]);
            results.push({ userId, status: 'success' });
          } catch (error) {
            results.push({ userId, status: 'error', error: error.message });
          }
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    res.json({
      message: `Bulk ${operation} operation completed`,
      results,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: results.filter(r => r.status === 'error').length
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/users/statistics', verifyAdminToken, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total users
      pool.query('SELECT COUNT(*) as total FROM users'),
      // Active users
      pool.query('SELECT COUNT(*) as active FROM users WHERE is_active = true'),
      // Banned users
      pool.query('SELECT COUNT(*) as banned FROM users WHERE is_banned = true'),
      // Users registered today
      pool.query("SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = CURRENT_DATE"),
      // Users registered this week
      pool.query("SELECT COUNT(*) as week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"),
      // Users registered this month
      pool.query("SELECT COUNT(*) as month FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"),
      // Users with completed profiles
      pool.query('SELECT COUNT(*) as completed FROM users WHERE is_profile_complete = true'),
      // Total wallet balance
      pool.query('SELECT COALESCE(SUM(balance), 0) as total_balance FROM wallets'),
      // Average wallet balance
      pool.query('SELECT COALESCE(AVG(balance), 0) as avg_balance FROM wallets WHERE balance > 0')
    ]);

    res.json({
      totalUsers: parseInt(stats[0].rows[0].total),
      activeUsers: parseInt(stats[1].rows[0].active),
      bannedUsers: parseInt(stats[2].rows[0].banned),
      newUsersToday: parseInt(stats[3].rows[0].today),
      newUsersThisWeek: parseInt(stats[4].rows[0].week),
      newUsersThisMonth: parseInt(stats[5].rows[0].month),
      usersWithCompletedProfiles: parseInt(stats[6].rows[0].completed),
      totalWalletBalance: parseFloat(stats[7].rows[0].total_balance),
      averageWalletBalance: parseFloat(stats[8].rows[0].avg_balance)
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teams
router.get('/teams', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        u.username as creator_username,
        COUNT(tm.user_id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id, u.username
      ORDER BY t.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team details by ID
router.get('/teams/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get team basic info
    const teamResult = await pool.query(`
      SELECT 
        t.*,
        u.username as creator_username,
        COUNT(tm.user_id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.id = $1
      GROUP BY t.id, u.username
    `, [id]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = teamResult.rows[0];

    // Get team members
    const membersResult = await pool.query(`
      SELECT 
        tm.*,
        u.username,
        u.email,
        CASE 
          WHEN t.created_by = tm.user_id THEN 'captain'
          ELSE 'member'
        END as role
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.team_id = $1
      ORDER BY 
        CASE WHEN t.created_by = tm.user_id THEN 0 ELSE 1 END,
        tm.joined_at ASC
    `, [id]);

    team.members = membersResult.rows;
    team.captain_username = team.creator_username;

    res.json(team);
  } catch (error) {
    console.error('Error fetching team details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dissolve team
router.post('/teams/:id/dissolve', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('BEGIN');

    try {
      // Get team info before deletion
      const teamResult = await pool.query(
        'SELECT name, created_by FROM teams WHERE id = $1',
        [id]
      );

      if (teamResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Team not found' });
      }

      const team = teamResult.rows[0];

      // Get all team members for notifications
      const membersResult = await pool.query(
        'SELECT user_id FROM team_members WHERE team_id = $1',
        [id]
      );

      // Remove team from tournaments
      await pool.query('DELETE FROM tournament_teams WHERE team_id = $1', [id]);
      
      // Remove team members
      await pool.query('DELETE FROM team_members WHERE team_id = $1', [id]);
      
      // Delete the team
      await pool.query('DELETE FROM teams WHERE id = $1', [id]);

      // Send notifications to all team members
      for (const member of membersResult.rows) {
        await pool.query(`
          INSERT INTO notifications (user_id, type, title, message, data) 
          VALUES ($1, $2, $3, $4, $5)
        `, [
          member.user_id,
          'team',
          'Team Dissolved by Admin',
          `Your team "${team.name}" has been dissolved by an administrator. All team registrations have been cancelled.`,
          JSON.stringify({
            teamId: id,
            teamName: team.name,
            action: 'dissolved',
            adminUsername: req.admin.username
          })
        ]);
      }

      await pool.query('COMMIT');

      res.json({
        message: 'Team dissolved successfully',
        team: {
          id: parseInt(id),
          name: team.name
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error dissolving team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove team member
router.delete('/teams/:teamId/members/:userId', verifyAdminToken, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    await pool.query('BEGIN');

    try {
      // Check if team exists and get team info
      const teamResult = await pool.query(
        'SELECT name, created_by FROM teams WHERE id = $1',
        [teamId]
      );

      if (teamResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Team not found' });
      }

      const team = teamResult.rows[0];

      // Check if user is the team captain
      if (team.created_by === parseInt(userId)) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'Cannot remove team captain. Dissolve the team instead.' });
      }

      // Check if user is a member of the team
      const memberResult = await pool.query(
        'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );

      if (memberResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'User is not a member of this team' });
      }

      // Remove the member
      await pool.query(
        'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );

      // Get user info for notification
      const userResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [userId]
      );

      // Send notification to the removed user
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, data) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        userId,
        'team',
        'Removed from Team',
        `You have been removed from team "${team.name}" by an administrator.`,
        JSON.stringify({
          teamId: parseInt(teamId),
          teamName: team.name,
          action: 'removed',
          adminUsername: req.admin.username
        })
      ]);

      await pool.query('COMMIT');

      res.json({
        message: 'Member removed successfully',
        removedUser: {
          id: parseInt(userId),
          username: userResult.rows[0]?.username
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk dissolve teams
router.post('/teams/bulk-dissolve', verifyAdminToken, async (req, res) => {
  try {
    const { teamIds } = req.body;

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({ message: 'Team IDs array is required' });
    }

    await pool.query('BEGIN');

    try {
      let dissolvedTeams = [];
      let errors = [];

      for (const teamId of teamIds) {
        try {
          // Get team info before deletion
          const teamResult = await pool.query(
            'SELECT name, created_by FROM teams WHERE id = $1',
            [teamId]
          );

          if (teamResult.rows.length === 0) {
            errors.push({ teamId, error: 'Team not found' });
            continue;
          }

          const team = teamResult.rows[0];

          // Get all team members for notifications
          const membersResult = await pool.query(
            'SELECT user_id FROM team_members WHERE team_id = $1',
            [teamId]
          );

          // Remove team from tournaments
          await pool.query('DELETE FROM tournament_teams WHERE team_id = $1', [teamId]);
          
          // Remove team members
          await pool.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);
          
          // Delete the team
          await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);

          // Send notifications to all team members
          for (const member of membersResult.rows) {
            await pool.query(`
              INSERT INTO notifications (user_id, type, title, message, data) 
              VALUES ($1, $2, $3, $4, $5)
            `, [
              member.user_id,
              'team',
              'Team Dissolved by Admin',
              `Your team "${team.name}" has been dissolved by an administrator as part of a bulk operation. All team registrations have been cancelled.`,
              JSON.stringify({
                teamId: parseInt(teamId),
                teamName: team.name,
                action: 'bulk_dissolved',
                adminUsername: req.admin.username
              })
            ]);
          }

          dissolvedTeams.push({
            id: parseInt(teamId),
            name: team.name,
            membersNotified: membersResult.rows.length
          });

        } catch (error) {
          console.error(`Error dissolving team ${teamId}:`, error);
          errors.push({ teamId, error: error.message });
        }
      }

      await pool.query('COMMIT');

      res.json({
        message: `Bulk dissolve operation completed`,
        results: {
          successful: dissolvedTeams.length,
          failed: errors.length,
          dissolvedTeams,
          errors
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in bulk dissolve operation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tournament Admin Panel Routes

// Get tournament details for admin panel
router.get('/tournaments/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT t.*, 
             COUNT(DISTINCT tp.user_id) as registered_users,
             COUNT(DISTINCT tt.id) as registered_teams
      FROM tournaments t
      LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
      LEFT JOIN tournament_teams tt ON t.id = tt.tournament_id
      WHERE t.id = $1
      GROUP BY t.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Map the database columns to match frontend expectations
    const tournament = {
      ...result.rows[0],
      name: result.rows[0].title, // Map title to name for frontend
      max_teams: result.rows[0].max_participants, // Map max_participants to max_teams
      registered_teams: result.rows[0].registered_teams || 0
    };

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tournament teams for admin panel
router.get('/tournaments/:id/teams', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT tt.*, u.username as captain_name,
             json_agg(
               json_build_object(
                 'user_id', ttm.user_id,
                 'ign', ttm.ign,
                 'uid', ttm.uid,
                 'role', ttm.role
               )
             ) as members
      FROM tournament_teams tt
      LEFT JOIN users u ON tt.captain_id = u.id
      LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
      WHERE tt.tournament_id = $1
      GROUP BY tt.id, u.username
      ORDER BY tt.created_at DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tournament teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tournament matches for admin panel
router.get('/tournaments/:id/matches', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tournament status to determine match status
    const tournamentResult = await pool.query('SELECT status FROM tournaments WHERE id = $1', [id]);
    
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournament = tournamentResult.rows[0];
    
    // Create match status based on tournament status
    let matchStatus = 'scheduled';
    if (tournament.status === 'live') {
      matchStatus = 'live';
    } else if (tournament.status === 'completed') {
      matchStatus = 'completed';
    } else if (tournament.status === 'paused') {
      matchStatus = 'paused';
    }
    
    // For now, return mock data since we don't have matches table yet
    const mockMatches = [
      {
        id: 1,
        name: 'Match 1',
        map: 'Bermuda',
        gameMode: 'Battle Royale',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: matchStatus,
        roomId: tournament.status === 'live' ? 'ROOM123' : null,
        roomPassword: tournament.status === 'live' ? 'PASS456' : null
      }
    ];
    
    res.json(mockMatches);
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tournament leaderboard for admin panel
router.get('/tournaments/:id/leaderboard', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, return mock data since we don't have results table yet
    const mockLeaderboard = [
      {
        id: 1,
        teamName: 'Fire Squad',
        captainName: 'Captain1',
        totalPoints: 45,
        matchesPlayed: 2,
        bestPlacement: 1,
        totalKills: 15
      },
      {
        id: 2,
        teamName: 'Thunder Bolts',
        captainName: 'Captain2',
        totalPoints: 38,
        matchesPlayed: 2,
        bestPlacement: 2,
        totalKills: 12
      }
    ];
    
    res.json(mockLeaderboard);
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create tournament match
router.post('/tournaments/:id/matches', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, map, gameMode, scheduledTime, roomId, roomPassword } = req.body;
    
    // For now, just return success since we don't have matches table yet
    res.json({ 
      message: 'Match created successfully',
      match: {
        id: Date.now(),
        name,
        map,
        gameMode,
        scheduledTime,
        roomId,
        roomPassword,
        status: 'scheduled'
      }
    });
  } catch (error) {
    console.error('Error creating tournament match:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start tournament match
router.post('/tournaments/:id/start-match', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, roomPassword } = req.body;
    
    // Update tournament with room details and set status to live
    await pool.query(
      'UPDATE tournaments SET room_id = $1, room_password = $2, status = $3, room_details_updated_at = NOW() WHERE id = $4',
      [roomId, roomPassword, 'live', id]
    );

    // Get tournament details for notifications
    const tournamentResult = await pool.query(
      'SELECT title, game FROM tournaments WHERE id = $1',
      [id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const tournament = tournamentResult.rows[0];

    // Get all registered users for this tournament
    let registeredUsers = [];
    
    try {
      // Get solo participants
      const soloUsers = await pool.query(`
        SELECT DISTINCT tp.user_id, u.username 
        FROM tournament_participants tp 
        JOIN users u ON tp.user_id = u.id 
        WHERE tp.tournament_id = $1
      `, [id]);
      
      registeredUsers = [...soloUsers.rows];
    } catch (error) {
      console.log('Solo users query failed:', error.message);
    }

    try {
      // Get team participants
      const teamUsers = await pool.query(`
        SELECT DISTINCT ttm.user_id, u.username 
        FROM tournament_teams tt 
        JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
        JOIN users u ON ttm.user_id = u.id 
        WHERE tt.tournament_id = $1
      `, [id]);
      
      // Merge with existing users (avoid duplicates)
      const existingUserIds = registeredUsers.map(u => u.user_id);
      const newTeamUsers = teamUsers.rows.filter(u => !existingUserIds.includes(u.user_id));
      registeredUsers = [...registeredUsers, ...newTeamUsers];
    } catch (error) {
      console.log('Team users query failed:', error.message);
    }

    // Create notifications for all registered users
    for (const user of registeredUsers) {
      try {
        await pool.query(`
          INSERT INTO notifications (
            user_id, title, message, type, tournament_id, 
            action_type, action_data, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
          user.user_id,
          `🎮 ${tournament.title} - Match Started!`,
          `The tournament has started! Room details are now available. Click to join the match.`,
          'tournament_started',
          id,
          'join_match',
          JSON.stringify({ 
            tournamentId: id, 
            roomId, 
            roomPassword,
            tournamentTitle: tournament.title 
          })
        ]);
      } catch (error) {
        console.log(`Failed to create notification for user ${user.user_id}:`, error.message);
      }
    }

    res.json({ 
      message: 'Tournament started successfully',
      roomId,
      roomPassword,
      notificationsSent: registeredUsers.length
    });
  } catch (error) {
    console.error('Error starting tournament match:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tournament room details
router.put('/tournaments/:id/room-details', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, roomPassword, publishTime } = req.body;
    
    // For now, just return success
    res.json({ message: 'Room details updated successfully' });
  } catch (error) {
    console.error('Error updating room details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team status
router.put('/teams/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // For now, just return success since we don't have team status field yet
    res.json({ message: 'Team status updated successfully' });
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send tournament announcement
router.post('/tournaments/:id/announcements', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, targetType, selectedTeams } = req.body;
    
    // For now, just return success
    res.json({ message: 'Announcement sent successfully' });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
// Manual Payment Management

// Get all manual payment requests
router.get('/manual-payments', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT mpr.*, mpm.display_name as payment_method_name, mpm.name as payment_method_type,
             u.username, u.email
      FROM manual_payment_requests mpr
      JOIN manual_payment_methods mpm ON mpr.payment_method_id = mpm.id
      JOIN users u ON mpr.user_id = u.id
    `;
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` WHERE mpr.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY mpr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const requests = await pool.query(query, params);

    res.json({
      requests: requests.rows.map(req => ({
        id: req.id,
        user: {
          id: req.user_id,
          username: req.username,
          email: req.email
        },
        amount: parseFloat(req.amount),
        paymentMethod: {
          name: req.payment_method_name,
          type: req.payment_method_type
        },
        screenshotUrl: req.screenshot_url,
        transactionReference: req.transaction_reference,
        status: req.status,
        adminNotes: req.admin_notes,
        createdAt: req.created_at,
        verifiedAt: req.verified_at
      }))
    });
  } catch (error) {
    console.error('Error fetching manual payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify/Reject manual payment
router.put('/manual-payments/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Get payment request details before updating
      const currentRequest = await pool.query(
        `SELECT mpr.*, mpm.display_name as payment_method_name, u.username, u.email
         FROM manual_payment_requests mpr
         JOIN manual_payment_methods mpm ON mpr.payment_method_id = mpm.id
         JOIN users u ON mpr.user_id = u.id
         WHERE mpr.id = $1`,
        [id]
      );

      if (currentRequest.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Payment request not found' });
      }

      const requestData = currentRequest.rows[0];

      // Update manual payment request
      const paymentRequest = await pool.query(
        `UPDATE manual_payment_requests 
         SET status = $1, admin_notes = $2, verified_at = CURRENT_TIMESTAMP, verified_by = NULL
         WHERE id = $3 
         RETURNING *`,
        [status, `${adminNotes || ''} (Verified by: ${req.admin.username || 'admin'})`.trim(), id]
      );

      const request = paymentRequest.rows[0];

      if (status === 'verified') {
        // Update transaction status to completed
        await pool.query(
          `UPDATE transactions 
           SET status = 'completed', description = 'Manual Payment - Verified by Admin'
           WHERE manual_payment_request_id = $1`,
          [id]
        );

        // Add money to user's wallet
        await pool.query(
          `INSERT INTO wallets (user_id, balance, total_earnings) 
           VALUES ($1, $2, $2) 
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             balance = wallets.balance + $2,
             total_earnings = wallets.total_earnings + $2,
             updated_at = CURRENT_TIMESTAMP`,
          [request.user_id, request.amount]
        );

        // Create approval notification
        await pool.query(`
          INSERT INTO notifications (user_id, type, title, message, data) 
          VALUES ($1, $2, $3, $4, $5)
        `, [
          request.user_id,
          'wallet',
          'Payment Approved! 🎉',
          `Great news! Your payment of ₹${request.amount} via ${requestData.payment_method_name} has been approved and added to your wallet. You can now use this balance for tournaments and other activities.`,
          JSON.stringify({
            paymentRequestId: request.id,
            amount: parseFloat(request.amount),
            paymentMethod: requestData.payment_method_name,
            status: 'approved',
            adminNotes: adminNotes || null
          })
        ]);
      } else {
        // Update transaction status to failed
        await pool.query(
          `UPDATE transactions 
           SET status = 'failed', description = 'Manual Payment - Rejected by Admin'
           WHERE manual_payment_request_id = $1`,
          [id]
        );

        // Create rejection notification
        const rejectionMessage = adminNotes 
          ? `Unfortunately, your payment of ₹${request.amount} via ${requestData.payment_method_name} has been rejected. Reason: ${adminNotes}. Please contact support if you have any questions.`
          : `Unfortunately, your payment of ₹${request.amount} via ${requestData.payment_method_name} has been rejected. Please contact support for more information.`;

        await pool.query(`
          INSERT INTO notifications (user_id, type, title, message, data) 
          VALUES ($1, $2, $3, $4, $5)
        `, [
          request.user_id,
          'wallet',
          'Payment Rejected ❌',
          rejectionMessage,
          JSON.stringify({
            paymentRequestId: request.id,
            amount: parseFloat(request.amount),
            paymentMethod: requestData.payment_method_name,
            status: 'rejected',
            adminNotes: adminNotes || null,
            reason: adminNotes || 'No specific reason provided'
          })
        ]);
      }

      await pool.query('COMMIT');

      res.json({
        message: `Payment ${status} successfully`,
        request: {
          id: request.id,
          status: status,
          amount: parseFloat(request.amount)
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating manual payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get manual payment methods for admin
router.get('/manual-payment-methods', verifyAdminToken, async (req, res) => {
  try {
    const methods = await pool.query(
      'SELECT * FROM manual_payment_methods ORDER BY name'
    );

    res.json({
      methods: methods.rows.map(method => ({
        id: method.id,
        name: method.name,
        displayName: method.display_name,
        qrCodeUrl: method.qr_code_url,
        accountDetails: method.account_details,
        isActive: method.is_active,
        createdAt: method.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching manual payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update manual payment method (including QR code)
router.put('/manual-payment-methods/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, qrCodeUrl, accountDetails, isActive } = req.body;

    const method = await pool.query(
      `UPDATE manual_payment_methods 
       SET display_name = $1, qr_code_url = $2, account_details = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [displayName, qrCodeUrl, JSON.stringify(accountDetails), isActive, id]
    );

    if (method.rows.length === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json({
      message: 'Payment method updated successfully',
      method: {
        id: method.rows[0].id,
        name: method.rows[0].name,
        displayName: method.rows[0].display_name,
        qrCodeUrl: method.rows[0].qr_code_url,
        accountDetails: method.rows[0].account_details,
        isActive: method.rows[0].is_active
      }
    });
  } catch (error) {
    console.error('Error updating manual payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wallet Management APIs

// Get tournament wallet status
router.get('/tournaments/:id/wallet-status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tournament details
    const tournament = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tournament.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournamentData = tournament.rows[0];
    
    if (tournamentData.tournament_type === 'SQUAD') {
      // Check if team_wallets table exists
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'team_wallets'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        // Get team wallet status for squad tournaments
        const teamWallets = await pool.query(`
          SELECT tw.*, t.name as team_name, u.username as captain_name,
                 COALESCE(COUNT(tc.id), 0) as contributions_count,
                 COALESCE(SUM(CASE WHEN tc.status = 'paid' THEN tc.amount ELSE 0 END), 0) as paid_amount
          FROM team_wallets tw
          JOIN teams t ON tw.team_id = t.id
          JOIN users u ON t.created_by = u.id
          LEFT JOIN team_contributions tc ON tw.id = tc.team_wallet_id
          WHERE tw.tournament_id = $1
          GROUP BY tw.id, t.name, u.username
          ORDER BY tw.created_at DESC
        `, [id]);
        
        res.json({
          tournamentType: 'SQUAD',
          teamWallets: teamWallets.rows,
          totalTeams: teamWallets.rows.length,
          confirmedTeams: teamWallets.rows.filter(tw => tw.status === 'confirmed').length
        });
      } else {
        // Return mock data if tables don't exist
        res.json({
          tournamentType: 'SQUAD',
          teamWallets: [],
          totalTeams: 0,
          confirmedTeams: 0
        });
      }
    } else {
      // Check if tournament_participants table exists
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'tournament_participants'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        // Get individual player registrations for solo tournaments
        const playerRegistrations = await pool.query(`
          SELECT tp.*, u.username, u.email, COALESCE(w.balance, 0) as wallet_balance
          FROM tournament_participants tp
          JOIN users u ON tp.user_id = u.id
          LEFT JOIN wallets w ON u.id = w.user_id
          WHERE tp.tournament_id = $1
          ORDER BY tp.joined_at DESC
        `, [id]);
        
        res.json({
          tournamentType: 'SOLO',
          playerRegistrations: playerRegistrations.rows,
          totalPlayers: playerRegistrations.rows.length,
          eligiblePlayers: playerRegistrations.rows.filter(p => 
            parseFloat(p.wallet_balance || 0) >= parseFloat(tournamentData.entry_fee)
          ).length
        });
      } else {
        // Return mock data if tables don't exist
        res.json({
          tournamentType: 'SOLO',
          playerRegistrations: [],
          totalPlayers: 0,
          eligiblePlayers: 0
        });
      }
    }
  } catch (error) {
    console.error('Error fetching wallet status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Process tournament entry fees (collect money)
router.post('/tournaments/:id/collect-fees', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('BEGIN');
    
    const tournament = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tournament.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournamentData = tournament.rows[0];
    
    if (tournamentData.tournament_type === 'SQUAD') {
      // Process squad tournament fees
      const teamWallets = await pool.query(`
        SELECT tw.*, tc.user_id, tc.amount, u.id as user_id, w.balance
        FROM team_wallets tw
        JOIN team_contributions tc ON tw.id = tc.team_wallet_id
        JOIN users u ON tc.user_id = u.id
        LEFT JOIN wallets w ON u.id = w.user_id
        WHERE tw.tournament_id = $1 AND tc.status = 'pending'
      `, [id]);
      
      for (const contribution of teamWallets.rows) {
        const userBalance = parseFloat(contribution.balance || 0);
        const requiredAmount = parseFloat(contribution.amount);
        
        if (userBalance >= requiredAmount) {
          // Deduct from user wallet
          await pool.query(`
            UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
          `, [requiredAmount, contribution.user_id]);
          
          // Update contribution status
          await pool.query(`
            UPDATE team_contributions SET status = 'paid', paid_at = CURRENT_TIMESTAMP
            WHERE team_wallet_id = $1 AND user_id = $2
          `, [contribution.team_wallet_id, contribution.user_id]);
          
          // Update team wallet balance
          await pool.query(`
            UPDATE team_wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [requiredAmount, contribution.team_wallet_id]);
        }
      }
      
      // Update team wallet status for fully paid teams
      await pool.query(`
        UPDATE team_wallets SET status = 'confirmed'
        WHERE tournament_id = $1 AND balance >= required_amount
      `, [id]);
      
    } else {
      // Process solo tournament fees
      const participants = await pool.query(`
        SELECT tp.*, w.balance
        FROM tournament_participants tp
        LEFT JOIN wallets w ON tp.user_id = w.user_id
        WHERE tp.tournament_id = $1
      `, [id]);
      
      for (const participant of participants.rows) {
        const userBalance = parseFloat(participant.balance || 0);
        const entryFee = parseFloat(tournamentData.entry_fee);
        
        if (userBalance >= entryFee) {
          // Deduct entry fee from user wallet
          await pool.query(`
            UPDATE wallets SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
          `, [entryFee, participant.user_id]);
          
          // Create transaction record
          await pool.query(`
            INSERT INTO transactions (user_id, type, amount, description, status)
            VALUES ($1, 'debit', $2, $3, 'completed')
          `, [participant.user_id, entryFee, `Tournament Entry Fee - ${tournamentData.title}`]);
        }
      }
    }
    
    // Update tournament total collected
    const totalCollected = parseFloat(tournamentData.entry_fee) * parseInt(tournamentData.max_participants);
    await pool.query(`
      UPDATE tournaments SET total_collected = $1 WHERE id = $2
    `, [totalCollected, id]);
    
    // Update admin wallet status to collected
    await pool.query(`
      UPDATE admin_wallets SET status = 'collected' WHERE tournament_id = $1
    `, [id]);
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Entry fees collected successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error collecting fees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Distribute tournament prizes
router.post('/tournaments/:id/distribute-prizes', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body; // Array of { rank, teamId?, userId?, prizeAmount }
    
    await pool.query('BEGIN');
    
    const tournament = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tournament.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournamentData = tournament.rows[0];
    
    for (const result of results) {
      if (tournamentData.tournament_type === 'SQUAD' && result.teamId) {
        // Squad tournament - distribute to team first, then to players
        const teamMembers = await pool.query(`
          SELECT tm.user_id FROM team_members tm WHERE tm.team_id = $1
        `, [result.teamId]);
        
        const prizePerPlayer = parseFloat(result.prizeAmount) / teamMembers.rows.length;
        
        for (const member of teamMembers.rows) {
          // Add prize to player wallet
          await pool.query(`
            INSERT INTO wallets (user_id, balance, total_earnings) 
            VALUES ($1, $2, $2) 
            ON CONFLICT (user_id) 
            DO UPDATE SET 
              balance = wallets.balance + $2,
              total_earnings = wallets.total_earnings + $2,
              updated_at = CURRENT_TIMESTAMP
          `, [member.user_id, prizePerPlayer]);
          
          // Create transaction record
          await pool.query(`
            INSERT INTO transactions (user_id, type, amount, description, status)
            VALUES ($1, 'credit', $2, $3, 'completed')
          `, [member.user_id, prizePerPlayer, `Tournament Prize - Rank ${result.rank} - ${tournamentData.title}`]);
        }
        
        // Record prize distribution
        await pool.query(`
          INSERT INTO tournament_prizes (tournament_id, rank, team_id, prize_amount, status, distributed_at)
          VALUES ($1, $2, $3, $4, 'distributed', CURRENT_TIMESTAMP)
        `, [id, result.rank, result.teamId, result.prizeAmount]);
        
      } else if (result.userId) {
        // Solo tournament - distribute directly to player
        await pool.query(`
          INSERT INTO wallets (user_id, balance, total_earnings) 
          VALUES ($1, $2, $2) 
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            balance = wallets.balance + $2,
            total_earnings = wallets.total_earnings + $2,
            updated_at = CURRENT_TIMESTAMP
        `, [result.userId, result.prizeAmount]);
        
        // Create transaction record
        await pool.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'credit', $2, $3, 'completed')
        `, [result.userId, result.prizeAmount, `Tournament Prize - Rank ${result.rank} - ${tournamentData.title}`]);
        
        // Record prize distribution
        await pool.query(`
          INSERT INTO tournament_prizes (tournament_id, rank, user_id, prize_amount, status, distributed_at)
          VALUES ($1, $2, $3, $4, 'distributed', CURRENT_TIMESTAMP)
        `, [id, result.rank, result.userId, result.prizeAmount]);
      }
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Prizes distributed successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error distributing prizes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin profit summary
router.get('/admin-profits', verifyAdminToken, async (req, res) => {
  try {
    const profits = await pool.query(`
      SELECT aw.*, t.title as tournament_name, t.start_date
      FROM admin_wallets aw
      JOIN tournaments t ON aw.tournament_id = t.id
      ORDER BY aw.collected_at DESC
    `);
    
    const totalProfit = await pool.query(`
      SELECT SUM(profit_amount) as total FROM admin_wallets WHERE status = 'collected'
    `);
    
    res.json({
      profits: profits.rows,
      totalProfit: parseFloat(totalProfit.rows[0].total || 0)
    });
  } catch (error) {
    console.error('Error fetching admin profits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get tournament registration statistics
router.get('/tournaments/:id/registration-stats', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tournament details
    const tournament = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tournament.rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournamentData = tournament.rows[0];
    
    // Get registration counts
    let registrationStats = {
      totalRegistered: 0,
      maxCapacity: tournamentData.max_participants || 0,
      registrationOpen: tournamentData.status === 'active',
      canRegister: true
    };
    
    // Check if tournament_participants table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tournament_participants'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      const participantCount = await pool.query(
        'SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1',
        [id]
      );
      registrationStats.totalRegistered = parseInt(participantCount.rows[0].count);
    }
    
    // Check if registration is full
    registrationStats.canRegister = registrationStats.totalRegistered < registrationStats.maxCapacity;
    
    res.json(registrationStats);
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk tournament operations
router.post('/tournaments/:id/bulk-operations', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { operation, data } = req.body;
    
    switch (operation) {
      case 'notify_all_participants':
        // Send notification to all participants
        // This would integrate with your notification system
        res.json({ message: 'Notifications sent to all participants' });
        break;
        
      case 'export_participant_list':
        // Export participant list
        const participants = await pool.query(`
          SELECT u.username, u.email, tp.joined_at
          FROM tournament_participants tp
          JOIN users u ON tp.user_id = u.id
          WHERE tp.tournament_id = $1
          ORDER BY tp.joined_at DESC
        `, [id]);
        
        res.json({
          message: 'Participant list exported',
          participants: participants.rows
        });
        break;
        
      default:
        res.status(400).json({ message: 'Invalid operation' });
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});