const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate unique transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Generate unique request ID
const generateRequestId = () => {
  return 'REQ' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Get wallet details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create wallet
    let wallet = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0) {
      // Create wallet if doesn't exist
      const newWallet = await pool.query(
        'INSERT INTO wallets (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
      wallet = newWallet;
    }

    const walletData = wallet.rows[0];

    // Get recent transactions
    const recentTransactions = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    res.json({
      wallet: {
        balance: parseFloat(walletData.balance),
        totalEarnings: parseFloat(walletData.total_earnings),
        totalSpent: parseFloat(walletData.total_spent),
        pendingAmount: parseFloat(walletData.pending_amount)
      },
      recentTransactions: recentTransactions.rows.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        date: tx.created_at.toISOString().split('T')[0],
        time: tx.created_at.toTimeString().split(' ')[0].slice(0, 5),
        status: tx.status,
        transactionId: tx.transaction_id,
        category: tx.category
      }))
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to get wallet data' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, status, category } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    let params = [userId];
    let paramCount = 1;

    // Add filters
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const transactions = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    let countParams = [userId];
    let countParamCount = 1;

    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      transactions: transactions.rows.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        date: tx.created_at.toISOString().split('T')[0],
        time: tx.created_at.toTimeString().split(' ')[0].slice(0, 5),
        status: tx.status,
        transactionId: tx.transaction_id,
        category: tx.category,
        paymentMethod: tx.payment_method,
        metadata: tx.metadata
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        totalPages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Add money to wallet
router.post('/add-money', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const transactionId = generateTransactionId();

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create transaction record
      const transaction = await pool.query(
        `INSERT INTO transactions 
         (user_id, type, amount, description, category, status, transaction_id, payment_method, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          userId,
          'credit',
          amount,
          `Wallet Top-up via ${paymentMethod.toUpperCase()}`,
          'topup',
          'pending', // In real app, this would be pending until payment gateway confirms
          transactionId,
          paymentMethod,
          JSON.stringify(paymentDetails || {})
        ]
      );

      // For demo purposes, we'll mark it as completed immediately
      // In real app, this would be handled by payment gateway webhook
      await pool.query(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        ['completed', transaction.rows[0].id]
      );

      // Update wallet balance
      await pool.query(
        `INSERT INTO wallets (user_id, balance, total_earnings) 
         VALUES ($1, $2, $2) 
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           balance = wallets.balance + $2,
           total_earnings = wallets.total_earnings + $2,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, amount]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Money added successfully',
        transaction: {
          id: transaction.rows[0].id,
          transactionId: transactionId,
          amount: parseFloat(amount),
          status: 'completed'
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Failed to add money' });
  }
});

// Withdraw money from wallet
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethodId, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100' });
    }

    // Check wallet balance
    const wallet = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0 || parseFloat(wallet.rows[0].balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const requestId = generateRequestId();
    const transactionId = generateTransactionId();

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create withdrawal request
      const withdrawalRequest = await pool.query(
        `INSERT INTO withdrawal_requests 
         (user_id, amount, payment_method_id, status, request_id)
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, amount, paymentMethodId, 'pending', requestId]
      );

      // Create transaction record
      const transaction = await pool.query(
        `INSERT INTO transactions 
         (user_id, type, amount, description, category, status, transaction_id, payment_method, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          userId,
          'debit',
          amount,
          'Withdrawal to Bank Account',
          'withdrawal',
          'pending',
          transactionId,
          'bank_transfer',
          JSON.stringify({ requestId, bankDetails })
        ]
      );

      // Update wallet balance (deduct amount)
      await pool.query(
        `UPDATE wallets 
         SET balance = balance - $1, 
             total_spent = total_spent + $1,
             pending_amount = pending_amount + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [amount, userId]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Withdrawal request submitted successfully',
        withdrawalRequest: {
          id: withdrawalRequest.rows[0].id,
          requestId: requestId,
          amount: parseFloat(amount),
          status: 'pending'
        },
        transaction: {
          id: transaction.rows[0].id,
          transactionId: transactionId
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Withdraw money error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await pool.query(
      'SELECT * FROM payment_methods WHERE user_id = $1 AND is_active = true ORDER BY is_primary DESC, created_at DESC',
      [userId]
    );

    res.json({
      paymentMethods: paymentMethods.rows.map(pm => ({
        id: pm.id,
        type: pm.type,
        name: pm.name,
        details: pm.details,
        isPrimary: pm.is_primary,
        createdAt: pm.created_at
      }))
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Add payment method
router.post('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, name, details, isPrimary = false } = req.body;

    if (!type || !name || !details) {
      return res.status(400).json({ error: 'Type, name, and details are required' });
    }

    // If setting as primary, unset other primary methods
    if (isPrimary) {
      await pool.query(
        'UPDATE payment_methods SET is_primary = false WHERE user_id = $1',
        [userId]
      );
    }

    const paymentMethod = await pool.query(
      `INSERT INTO payment_methods (user_id, type, name, details, is_primary)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, type, name, JSON.stringify(details), isPrimary]
    );

    res.json({
      message: 'Payment method added successfully',
      paymentMethod: {
        id: paymentMethod.rows[0].id,
        type: paymentMethod.rows[0].type,
        name: paymentMethod.rows[0].name,
        details: paymentMethod.rows[0].details,
        isPrimary: paymentMethod.rows[0].is_primary
      }
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Get withdrawal requests
router.get('/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT wr.*, pm.name as payment_method_name, pm.details as payment_method_details
      FROM withdrawal_requests wr
      LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
      WHERE wr.user_id = $1
    `;
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND wr.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY wr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const withdrawals = await pool.query(query, params);

    res.json({
      withdrawals: withdrawals.rows.map(wr => ({
        id: wr.id,
        requestId: wr.request_id,
        amount: parseFloat(wr.amount),
        status: wr.status,
        paymentMethod: {
          name: wr.payment_method_name,
          details: wr.payment_method_details
        },
        createdAt: wr.created_at,
        processedAt: wr.processed_at,
        notes: wr.notes
      }))
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Failed to get withdrawal requests' });
  }
});

module.exports = router;
// Get manual payment methods
router.get('/manual-payment-methods', async (req, res) => {
  try {
    const methods = await pool.query(
      'SELECT * FROM manual_payment_methods WHERE is_active = true ORDER BY name'
    );

    res.json({
      methods: methods.rows.map(method => ({
        id: method.id,
        name: method.name,
        displayName: method.display_name,
        qrCodeUrl: method.qr_code_url,
        accountDetails: method.account_details
      }))
    });
  } catch (error) {
    console.error('Get manual payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Submit manual payment request
router.post('/manual-payment', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId, amount, screenshotUrl, transactionReference } = req.body;

    if (!paymentMethodId || !amount || !screenshotUrl) {
      return res.status(400).json({ error: 'Payment method, amount, and screenshot are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const transactionId = generateTransactionId();

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create manual payment request
      const paymentRequest = await pool.query(
        `INSERT INTO manual_payment_requests 
         (user_id, payment_method_id, amount, screenshot_url, transaction_reference)
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, paymentMethodId, amount, screenshotUrl, transactionReference]
      );

      // Create pending transaction record
      const transaction = await pool.query(
        `INSERT INTO transactions 
         (user_id, type, amount, description, category, status, transaction_id, payment_method, manual_payment_request_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          userId,
          'credit',
          amount,
          'Manual Payment - Pending Verification',
          'manual_topup',
          'pending',
          transactionId,
          'manual',
          paymentRequest.rows[0].id,
          JSON.stringify({ paymentMethodId, transactionReference })
        ]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Payment submitted successfully. It will be verified by admin within 24 hours.',
        paymentRequest: {
          id: paymentRequest.rows[0].id,
          amount: parseFloat(amount),
          status: 'pending',
          transactionId: transactionId
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Manual payment error:', error);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
});

// Get user's manual payment requests
router.get('/manual-payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT mpr.*, mpm.display_name as payment_method_name, mpm.name as payment_method_type
      FROM manual_payment_requests mpr
      JOIN manual_payment_methods mpm ON mpr.payment_method_id = mpm.id
      WHERE mpr.user_id = $1
    `;
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND mpr.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY mpr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const requests = await pool.query(query, params);

    res.json({
      requests: requests.rows.map(req => ({
        id: req.id,
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
    console.error('Get manual payments error:', error);
    res.status(500).json({ error: 'Failed to get payment requests' });
  }
});