require('dotenv').config();
const pool = require('../config/database');

async function migrateTournaments() {
  const client = await pool.connect();
  
  try {
    console.log('Starting tournament migration...');

    // Check if tournaments table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tournaments'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create tournaments table with enhanced structure
      await client.query(`
        CREATE TABLE tournaments (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          game VARCHAR(100) NOT NULL DEFAULT 'Free Fire',
          tournament_type VARCHAR(20) NOT NULL CHECK (tournament_type IN ('SOLO', 'DUO', 'SQUAD')),
          entry_fee DECIMAL(10,2) DEFAULT 0,
          prize_pool DECIMAL(10,2) DEFAULT 0,
          max_participants INTEGER NOT NULL,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          registration_end TIMESTAMP NOT NULL,
          room_id VARCHAR(50),
          room_password VARCHAR(50),
          room_details_updated_at TIMESTAMP,
          status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
          rules TEXT,
          results_updated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Created tournaments table');
    } else {
      // Add missing columns to existing table
      const columns = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'tournaments'
      `);
      
      const existingColumns = columns.rows.map(row => row.column_name);
      
      if (!existingColumns.includes('tournament_type')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN tournament_type VARCHAR(20) DEFAULT 'SOLO' CHECK (tournament_type IN ('SOLO', 'DUO', 'SQUAD'))`);
        console.log('Added tournament_type column');
      }
      
      if (!existingColumns.includes('registration_end')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN registration_end TIMESTAMP`);
        console.log('Added registration_end column');
      }
      
      if (!existingColumns.includes('room_id')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN room_id VARCHAR(50)`);
        console.log('Added room_id column');
      }
      
      if (!existingColumns.includes('room_password')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN room_password VARCHAR(50)`);
        console.log('Added room_password column');
      }
      
      if (!existingColumns.includes('room_details_updated_at')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN room_details_updated_at TIMESTAMP`);
        console.log('Added room_details_updated_at column');
      }
      
      if (!existingColumns.includes('rules')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN rules TEXT`);
        console.log('Added rules column');
      }
      
      if (!existingColumns.includes('results_updated_at')) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN results_updated_at TIMESTAMP`);
        console.log('Added results_updated_at column');
      }

      // Update existing tournaments to have registration_end if null
      await client.query(`
        UPDATE tournaments 
        SET registration_end = start_date - INTERVAL '1 hour'
        WHERE registration_end IS NULL
      `);
      console.log('Updated existing tournaments with registration_end');
    }

    // Create tournament_participants table for SOLO tournaments
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ign VARCHAR(100) NOT NULL,
        uid VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tournament_id, user_id)
      )
    `);
    console.log('Ensured tournament_participants table exists');

    // Create tournament_teams table for DUO/SQUAD tournaments
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_teams (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        team_name VARCHAR(255) NOT NULL,
        captain_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Ensured tournament_teams table exists');

    // Create tournament_team_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES tournament_teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ign VARCHAR(100) NOT NULL,
        uid VARCHAR(50) NOT NULL,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('captain', 'member')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(team_id, user_id)
      )
    `);
    console.log('Ensured tournament_team_members table exists');

    // Create tournament_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_results (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES tournament_participants(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES tournament_teams(id) ON DELETE CASCADE,
        placement INTEGER NOT NULL,
        kills INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tournament_id, participant_id),
        UNIQUE(tournament_id, team_id),
        CHECK ((participant_id IS NOT NULL AND team_id IS NULL) OR (participant_id IS NULL AND team_id IS NOT NULL))
      )
    `);
    console.log('Ensured tournament_results table exists');

    // Insert sample tournaments if none exist
    const tournamentCount = await client.query('SELECT COUNT(*) FROM tournaments');
    if (parseInt(tournamentCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tournaments (
          title, description, game, tournament_type, entry_fee, prize_pool, 
          max_participants, start_date, end_date, registration_end, rules
        ) VALUES 
        (
          'Free Fire Solo Championship', 
          'Ultimate solo battle royale tournament with exciting prizes',
          'Free Fire',
          'SOLO',
          50.00,
          5000.00,
          100,
          NOW() + INTERVAL '2 days',
          NOW() + INTERVAL '2 days 2 hours',
          NOW() + INTERVAL '1 day 23 hours',
          'Standard Free Fire rules apply. No teaming allowed. Cheating will result in disqualification.'
        ),
        (
          'Duo Masters Tournament',
          'Team up with your partner and dominate the battlefield',
          'Free Fire',
          'DUO',
          100.00,
          10000.00,
          50,
          NOW() + INTERVAL '3 days',
          NOW() + INTERVAL '3 days 2 hours',
          NOW() + INTERVAL '2 days 23 hours',
          'Duo tournament rules. Both team members must be present. Communication allowed.'
        ),
        (
          'Squad Legends Championship',
          'The ultimate 4-player squad tournament with massive prizes',
          'Free Fire',
          'SQUAD',
          200.00,
          25000.00,
          25,
          NOW() + INTERVAL '5 days',
          NOW() + INTERVAL '5 days 3 hours',
          NOW() + INTERVAL '4 days 23 hours',
          'Squad tournament with 4 players per team. All members must participate.'
        ),
        (
          'Weekly Solo Scrim',
          'Quick solo matches for practice and fun',
          'Free Fire',
          'SOLO',
          0.00,
          500.00,
          50,
          NOW() + INTERVAL '1 day',
          NOW() + INTERVAL '1 day 1 hour',
          NOW() + INTERVAL '23 hours',
          'Practice tournament. Free entry with small prize pool.'
        )
      `);
      console.log('Inserted sample tournaments');
    } else {
      console.log('Sample tournaments already exist, skipping insertion');
    }

    console.log('Tournament migration completed successfully!');
  } catch (error) {
    console.error('Tournament migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateTournaments()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateTournaments;