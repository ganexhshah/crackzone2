const pool = require('../config/database');

async function migrateGamePreferences() {
  try {
    console.log('Starting game preferences migration...');

    // Add primary_game column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS primary_game VARCHAR(50) DEFAULT NULL
    `);

    // Add game_username column to game_profiles table if it doesn't exist
    await pool.query(`
      ALTER TABLE game_profiles 
      ADD COLUMN IF NOT EXISTS game_username VARCHAR(100) DEFAULT NULL
    `);

    // Update existing users with freefire game profiles to have primary_game set
    await pool.query(`
      UPDATE users 
      SET primary_game = 'freefire' 
      WHERE id IN (
        SELECT DISTINCT user_id 
        FROM game_profiles 
        WHERE game = 'freefire' AND is_primary = true
      ) AND primary_game IS NULL
    `);

    console.log('Game preferences migration completed successfully!');
    
    // Show current state
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE primary_game IS NOT NULL');
    console.log(`Users with game preferences: ${userCount.rows[0].count}`);
    
    const gameProfiles = await pool.query('SELECT game, COUNT(*) FROM game_profiles GROUP BY game');
    console.log('Game profiles by game:');
    gameProfiles.rows.forEach(row => {
      console.log(`  ${row.game}: ${row.count}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateGamePreferences()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateGamePreferences;