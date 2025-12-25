require('dotenv').config();
const pool = require('../config/database');

const createWalletTables = async () => {
  try {
    console.log('Creating wallet tables...');

    // Wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        balance DECIMAL(10,2) DEFAULT 0.00,
        total_earnings DECIMAL(10,2) DEFAULT 0.00,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        pending_amount DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created wallets table');

    // Transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        payment_method VARCHAR(50),
        payment_gateway VARCHAR(50),
        gateway_transaction_id VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created transactions table');

    // Payment methods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('upi', 'card', 'netbanking', 'bank_account')),
        name VARCHAR(100) NOT NULL,
        details JSONB NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created payment_methods table');

    // Withdrawal requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_method_id INTEGER REFERENCES payment_methods(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        request_id VARCHAR(100) UNIQUE NOT NULL,
        processed_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created withdrawal_requests table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
    `);
    console.log('Created indexes');

    // Create wallet for existing users
    await pool.query(`
      INSERT INTO wallets (user_id, balance, total_earnings, total_spent, pending_amount)
      SELECT id, 0.00, 0.00, 0.00, 0.00 FROM users 
      WHERE id NOT IN (SELECT user_id FROM wallets WHERE user_id IS NOT NULL)
    `);
    console.log('Created wallets for existing users');

    console.log('Wallet tables created successfully!');
    
  } catch (error) {
    console.error('Error creating wallet tables:', error);
    throw error;
  }
};

// Run migration
createWalletTables().then(() => {
  console.log('Wallet migration completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Wallet migration failed:', error);
  process.exit(1);
});