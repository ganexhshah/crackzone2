const pool = require('../config/database');

async function createUserFollowsTable() {
  try {
    console.log('Creating user_follows table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id)
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_follows_follower 
      ON user_follows(follower_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_follows_following 
      ON user_follows(following_id)
    `);

    console.log('✅ user_follows table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_follows table:', error);
    throw error;
  }
}

async function addBestRankColumn() {
  try {
    console.log('Adding best_rank column to user_profiles...');
    
    await pool.query(`
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS best_rank VARCHAR(20) DEFAULT 'Bronze'
    `);

    console.log('✅ best_rank column added successfully');
  } catch (error) {
    console.error('❌ Error adding best_rank column:', error);
    throw error;
  }
}

async function main() {
  try {
    await createUserFollowsTable();
    await addBestRankColumn();
    console.log('🎉 User follows migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createUserFollowsTable, addBestRankColumn };