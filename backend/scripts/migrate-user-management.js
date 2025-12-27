require('dotenv').config();
const { Pool } = require('pg');

// Create a direct pool connection for migration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crackzone_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'admin'), // Ensure password is a string
  ssl: false
});

const updateTablesForUserManagement = async () => {
  try {
    console.log('Updating PostgreSQL database for user management features...');

    // Test connection first
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    client.release();

    // Add user management fields to users table
    const userManagementColumns = [
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE', description: 'User active status' },
      { name: 'is_banned', type: 'BOOLEAN DEFAULT FALSE', description: 'User banned status' },
      { name: 'ban_reason', type: 'TEXT', description: 'Reason for ban' },
      { name: 'banned_at', type: 'TIMESTAMP', description: 'When user was banned' },
      { name: 'banned_by', type: 'VARCHAR(100)', description: 'Admin who banned the user' },
      { name: 'last_login', type: 'TIMESTAMP', description: 'Last login timestamp' },
      { name: 'full_name', type: 'VARCHAR(255)', description: 'User full name' },
      { name: 'phone_number', type: 'VARCHAR(20)', description: 'User phone number' },
      { name: 'profile_image_url', type: 'VARCHAR(500)', description: 'Profile image URL' }
    ];

    for (const column of userManagementColumns) {
      try {
        await pool.query(`
          ALTER TABLE users ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Added ${column.name} column - ${column.description}`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`${column.name} column already exists`);
        } else {
          throw error;
        }
      }
    }

    // Add wallet management fields to wallets table
    const walletColumns = [
      { name: 'total_spent', type: 'DECIMAL(10,2) DEFAULT 0', description: 'Total amount spent by user' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', description: 'Wallet creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', description: 'Wallet last update timestamp' }
    ];

    for (const column of walletColumns) {
      try {
        await pool.query(`
          ALTER TABLE wallets ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Added ${column.name} column to wallets - ${column.description}`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`${column.name} column already exists in wallets`);
        } else if (error.code === '42P01') {
          console.log('Wallets table does not exist, will be created when needed');
          break;
        } else {
          throw error;
        }
      }
    }

    // Add admin action fields to transactions table
    const transactionColumns = [
      { name: 'admin_action', type: 'BOOLEAN DEFAULT FALSE', description: 'Whether transaction was performed by admin' },
      { name: 'admin_username', type: 'VARCHAR(100)', description: 'Admin who performed the action' }
    ];

    for (const column of transactionColumns) {
      try {
        await pool.query(`
          ALTER TABLE transactions ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`Added ${column.name} column to transactions - ${column.description}`);
      } catch (error) {
        if (error.code === '42701') {
          console.log(`${column.name} column already exists in transactions`);
        } else if (error.code === '42P01') {
          console.log('Transactions table does not exist, will be created when needed');
          break;
        } else {
          throw error;
        }
      }
    }

    // Create admin_logs table for tracking admin actions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_username VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created admin_logs table for tracking admin actions');

    // Create user_login_history table for tracking login attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_login_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        failure_reason VARCHAR(255)
      )
    `);
    console.log('Created user_login_history table for tracking login attempts');

    // Update existing users to have default values
    await pool.query(`
      UPDATE users 
      SET is_active = TRUE, is_banned = FALSE 
      WHERE is_active IS NULL OR is_banned IS NULL
    `);
    console.log('Updated existing users with default status values');

    console.log('PostgreSQL database updated successfully for user management!');
    
  } catch (error) {
    console.error('Error updating PostgreSQL database:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('PostgreSQL server is not running or connection refused');
      console.error('Please ensure PostgreSQL is installed and running on localhost:5432');
    } else if (error.message.includes('password')) {
      console.error('Authentication failed. Please check your PostgreSQL credentials in .env file');
    }
    
    throw error;
  }
};

// Run migration
updateTablesForUserManagement().then(() => {
  console.log('PostgreSQL user management migration completed!');
  pool.end();
  process.exit(0);
}).catch((error) => {
  console.error('PostgreSQL user management migration failed:', error);
  pool.end();
  process.exit(1);
});