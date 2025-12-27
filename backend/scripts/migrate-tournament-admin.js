const pool = require('../config/database');

async function migrateTournamentAdmin() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating tournament admin tables...');
    
    // Create tournament_matches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_matches (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        map VARCHAR(100),
        game_mode VARCHAR(100) DEFAULT 'Battle Royale',
        scheduled_time TIMESTAMP WITH TIME ZONE,
        status VARCHAR(50) DEFAULT 'scheduled',
        room_id VARCHAR(20),
        room_password VARCHAR(20),
        room_publish_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tournament_match_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_match_results (
        id SERIAL PRIMARY KEY,
        match_id INTEGER REFERENCES tournament_matches(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES tournament_teams(id) ON DELETE CASCADE,
        placement INTEGER,
        kills INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tournament_announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_announcements (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_type VARCHAR(50) DEFAULT 'all',
        target_teams INTEGER[],
        created_by INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add status column to tournament_teams if it doesn't exist
    await client.query(`
      ALTER TABLE tournament_teams 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
    `);
    
    // Add payment_status column to tournament_teams if it doesn't exist
    await client.query(`
      ALTER TABLE tournament_teams 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'
    `);
    
    // Add wallet_balance column to tournament_teams if it doesn't exist
    await client.query(`
      ALTER TABLE tournament_teams 
      ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id 
      ON tournament_matches(tournament_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tournament_match_results_match_id 
      ON tournament_match_results(match_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tournament_announcements_tournament_id 
      ON tournament_announcements(tournament_id)
    `);
    
    await client.query('COMMIT');
    console.log('Tournament admin tables created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tournament admin tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateTournamentAdmin()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateTournamentAdmin };