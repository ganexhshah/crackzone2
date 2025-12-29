const pool = require('../config/database');

async function fixGameProfiles() {
  try {
    console.log('Starting game profiles fix...');

    // Update lowercase game names to proper case
    const freefireUpdate = await pool.query(`
      UPDATE game_profiles 
      SET game = 'FreeFire' 
      WHERE LOWER(game) = 'freefire'
    `);
    console.log(`Updated ${freefireUpdate.rowCount} FreeFire game profiles`);

    const pubgUpdate = await pool.query(`
      UPDATE game_profiles 
      SET game = 'PUBG' 
      WHERE LOWER(game) = 'pubg'
    `);
    console.log(`Updated ${pubgUpdate.rowCount} PUBG game profiles`);

    // Update user_profiles favorite_game to match
    const freefireProfileUpdate = await pool.query(`
      UPDATE user_profiles 
      SET favorite_game = 'FreeFire' 
      WHERE LOWER(favorite_game) = 'freefire'
    `);
    console.log(`Updated ${freefireProfileUpdate.rowCount} FreeFire user profiles`);

    const pubgProfileUpdate = await pool.query(`
      UPDATE user_profiles 
      SET favorite_game = 'PUBG' 
      WHERE LOWER(favorite_game) = 'pubg'
    `);
    console.log(`Updated ${pubgProfileUpdate.rowCount} PUBG user profiles`);

    console.log('Game profiles fix completed successfully!');
    
    // Show current state
    const gameProfiles = await pool.query('SELECT game, COUNT(*) FROM game_profiles GROUP BY game ORDER BY game');
    console.log('Game profiles by game:');
    gameProfiles.rows.forEach(row => {
      console.log(`  ${row.game}: ${row.count}`);
    });

    const favoriteGames = await pool.query('SELECT favorite_game, COUNT(*) FROM user_profiles WHERE favorite_game IS NOT NULL GROUP BY favorite_game ORDER BY favorite_game');
    console.log('Favorite games:');
    favoriteGames.rows.forEach(row => {
      console.log(`  ${row.favorite_game}: ${row.count}`);
    });

  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixGameProfiles()
    .then(() => {
      console.log('Fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixGameProfiles;