const express = require('express');
const bcrypt = require('bcrypt');
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

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ message: 'Server error' });
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
      status
    } = req.body;

    const result = await pool.query(`
      INSERT INTO tournaments (
        name, description, start_date, end_date, 
        max_teams, entry_fee, prize_pool, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, description, startDate, endDate, maxTeams, entryFee, prizePool, status]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Server error' });
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

// Get all users
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, username, email, 
        created_at, updated_at, auth_provider, is_profile_complete
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
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
      // Update manual payment request
      const paymentRequest = await pool.query(
        `UPDATE manual_payment_requests 
         SET status = $1, admin_notes = $2, verified_at = CURRENT_TIMESTAMP, verified_by = $3
         WHERE id = $4 
         RETURNING *`,
        [status, adminNotes, req.admin.id || 1, id] // Using admin ID from token
      );

      if (paymentRequest.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Payment request not found' });
      }

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
      } else {
        // Update transaction status to failed
        await pool.query(
          `UPDATE transactions 
           SET status = 'failed', description = 'Manual Payment - Rejected by Admin'
           WHERE manual_payment_request_id = $1`,
          [id]
        );
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