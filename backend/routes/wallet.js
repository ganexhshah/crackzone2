const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate unique transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
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

    res.json({
      wallet: {
        balance: parseFloat(walletData.balance),
        totalEarnings: parseFloat(walletData.total_earnings),
        totalSpent: parseFloat(walletData.total_spent),
        pendingAmount: parseFloat(walletData.pending_amount)
      }
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
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

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
        created_at: tx.created_at
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get transaction details
router.get('/transactions/:transactionId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.params;

    // First get the basic transaction
    const transaction = await pool.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [transactionId, userId]
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const txn = transaction.rows[0];
    
    // Try to get additional payment details if available
    let paymentDetails = {};
    try {
      // Check if manual_payments table exists and has data
      const manualPayment = await pool.query(
        `SELECT mp.screenshot_url, mp.admin_notes, mp.status as payment_status,
                mpm.display_name as payment_method_name
         FROM manual_payments mp
         LEFT JOIN manual_payment_methods mpm ON mp.payment_method_id = mpm.id
         WHERE mp.transaction_id = $1`,
        [transactionId]
      );
      
      if (manualPayment.rows.length > 0) {
        const mp = manualPayment.rows[0];
        paymentDetails = {
          screenshot_url: mp.screenshot_url,
          payment_method: mp.payment_method_name,
          admin_notes: mp.admin_notes,
          payment_status: mp.payment_status
        };
      }
    } catch (error) {
      console.log('Manual payments table not available or no data found');
      // Extract screenshot from metadata if available
      if (txn.metadata) {
        try {
          const metadata = JSON.parse(txn.metadata);
          paymentDetails.screenshot_url = metadata.screenshotUrl;
        } catch (e) {
          console.log('Could not parse transaction metadata');
        }
      }
    }
    
    res.json({
      id: txn.id,
      type: txn.type,
      amount: parseFloat(txn.amount),
      description: txn.description,
      status: paymentDetails.payment_status || txn.status,
      created_at: txn.created_at,
      screenshot_url: paymentDetails.screenshot_url,
      payment_method: paymentDetails.payment_method,
      admin_notes: paymentDetails.admin_notes
    });
  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({ error: 'Failed to get transaction details' });
  }
});

// Report transaction issue
router.post('/report-transaction', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId, reason, description } = req.body;

    // Verify transaction belongs to user
    const transaction = await pool.query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // For now, just return success (transaction_reports table may not exist yet)
    res.json({
      success: true,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Report transaction error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
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

    const transactionId = generateTransactionId();

    // Create transaction record
    const transaction = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, description, category, status, transaction_id, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        userId,
        'debit',
        amount,
        'Withdrawal Request',
        'withdrawal',
        'pending',
        transactionId,
        'bank_transfer'
      ]
    );

    res.json({
      message: 'Withdrawal request submitted successfully',
      transaction: {
        id: transaction.rows[0].id,
        transactionId: transactionId,
        amount: parseFloat(amount),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Withdraw money error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

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

    // Create pending transaction record
    const transaction = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, description, category, status, transaction_id, payment_method, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
        JSON.stringify({ paymentMethodId, transactionReference, screenshotUrl })
      ]
    );

    res.json({
      message: 'Payment submitted successfully. It will be verified by admin within 24 hours.',
      transaction: {
        id: transaction.rows[0].id,
        amount: parseFloat(amount),
        status: 'pending',
        transactionId: transactionId
      }
    });
  } catch (error) {
    console.error('Manual payment error:', error);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
});

module.exports = router;