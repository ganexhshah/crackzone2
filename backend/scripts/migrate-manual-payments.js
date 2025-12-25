require('dotenv').config();
const pool = require('../config/database');

async function migrateManualPayments() {
  try {
    console.log('Creating manual payment tables...');

    // Create manual_payment_methods table for admin-uploaded QR codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manual_payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL, -- 'esewa', 'khalti', 'bank'
        display_name VARCHAR(100) NOT NULL,
        qr_code_url TEXT,
        account_details JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create manual_payment_requests table for user payment submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manual_payment_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        payment_method_id INTEGER REFERENCES manual_payment_methods(id),
        amount DECIMAL(10,2) NOT NULL,
        screenshot_url TEXT NOT NULL,
        transaction_reference VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
        admin_notes TEXT,
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add manual payment support to transactions table
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS manual_payment_request_id INTEGER REFERENCES manual_payment_requests(id)
    `);

    // Insert default manual payment methods
    await pool.query(`
      INSERT INTO manual_payment_methods (name, display_name, account_details) 
      VALUES 
        ('esewa', 'eSewa', '{"account_number": "9800000000", "account_name": "CrackZone Gaming"}'),
        ('khalti', 'Khalti', '{"account_number": "9800000001", "account_name": "CrackZone Gaming"}'),
        ('bank', 'Bank Transfer', '{"bank_name": "Nepal Investment Bank", "account_number": "1234567890", "account_name": "CrackZone Gaming Pvt. Ltd."}')
      ON CONFLICT DO NOTHING
    `);

    console.log('✓ Manual payment tables created successfully');
    console.log('✓ Default payment methods inserted');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrateManualPayments();