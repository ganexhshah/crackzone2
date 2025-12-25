require('dotenv').config();
const pool = require('../config/database');

const updateTablesForGoogleAuth = async () => {
  try {
    console.log('Updating PostgreSQL database for Google OAuth and game profiles...');

    // Test connection first
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    client.release();

    // Add Google OAuth fields to users table
    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE
      `);
      console.log('Added google_id column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('google_id column already exists');
      } else {
        throw error;
      }
    }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local'
      `);
      console.log('Added auth_provider column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('auth_provider column already exists');
      } else {
        throw error;
      }
    }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500)
      `);
      console.log('Added profile_picture_url column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('profile_picture_url column already exists');
      } else {
        throw error;
      }
    }

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN is_profile_complete BOOLEAN DEFAULT FALSE
      `);
      console.log('Added is_profile_complete column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('is_profile_complete column already exists');
      } else {
        throw error;
      }
    }

    // Make password_hash nullable for Google OAuth users
    try {
      await pool.query(`
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL
      `);
      console.log('Made password_hash nullable');
    } catch (error) {
      if (error.code === '42804') {
        console.log('password_hash is already nullable');
      } else {
        throw error;
      }
    }

    // Create game_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game VARCHAR(50) NOT NULL,
        game_uid VARCHAR(100),
        game_username VARCHAR(100),
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game)
      )
    `);
    console.log('Created game_profiles table');

    console.log('PostgreSQL database updated successfully for Google OAuth!');
    
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
updateTablesForGoogleAuth().then(() => {
  console.log('PostgreSQL Google OAuth migration completed!');
  process.exit(0);
}).catch((error) => {
  console.error('PostgreSQL Google OAuth migration failed:', error);
  process.exit(1);
});