const pool = require('../config/database');

async function autoInitializeDatabase() {
  try {
    console.log('🗄️  Checking database initialization...');
    
    // Check if tables already exist
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (existingTables.rows.length > 0) {
      console.log('✅ Database already initialized with tables:', existingTables.rows.map(row => row.table_name));
      return;
    }
    
    console.log('🔧 Initializing database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        auth_provider VARCHAR(20) DEFAULT 'local',
        is_profile_complete BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tournaments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        game VARCHAR(100) NOT NULL,
        tournament_type VARCHAR(50) DEFAULT 'single_elimination',
        max_participants INTEGER DEFAULT 16,
        entry_fee DECIMAL(10,2) DEFAULT 0,
        prize_pool DECIMAL(10,2) DEFAULT 0,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        registration_deadline TIMESTAMP,
        status VARCHAR(50) DEFAULT 'upcoming',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create tournament_participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        team_name VARCHAR(255),
        registration_type VARCHAR(20) DEFAULT 'solo',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);
    
    // Create teams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        game VARCHAR(100) NOT NULL,
        max_members INTEGER DEFAULT 5,
        is_public BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create team_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      )
    `);
    
    // Create wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        balance DECIMAL(10,2) DEFAULT 0,
        total_earnings DECIMAL(10,2) DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create wallet_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create basic indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
      'CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status)',
      'CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game)',
      'CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id)',
      'CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_teams_game ON teams(game)',
      'CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id)',
      'CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    
    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, auth_provider, is_profile_complete, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin', 'admin@crackzone.com', hashedPassword, 'local', true, true]);
    
    // Create wallet for admin
    const adminUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminUser.rows.length > 0) {
      await pool.query(`
        INSERT INTO wallets (user_id, balance, total_earnings)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO NOTHING
      `, [adminUser.rows[0].id, 1000.00, 1000.00]);
    }
    
    // Add some sample tournaments
    await pool.query(`
      INSERT INTO tournaments (name, title, description, game, tournament_type, max_participants, entry_fee, prize_pool, start_date, end_date, registration_deadline, status)
      VALUES 
        ('Free Fire Championship', 'Free Fire Championship', 'Join the ultimate Free Fire tournament', 'Free Fire', 'battle_royale', 64, 50.00, 2000.00, NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', NOW() + INTERVAL '1 day', 'upcoming'),
        ('BGMI Squad Battle', 'BGMI Squad Battle', 'Team up for the BGMI squad tournament', 'BGMI', 'squad', 32, 100.00, 5000.00, NOW() + INTERVAL '5 days', NOW() + INTERVAL '6 days', NOW() + INTERVAL '4 days', 'upcoming'),
        ('Valorant Pro League', 'Valorant Pro League', 'Professional Valorant competition', 'Valorant', 'team', 16, 200.00, 10000.00, NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days', NOW() + INTERVAL '6 days', 'upcoming')
      ON CONFLICT DO NOTHING
    `);
    
    // Add sample teams
    if (adminUser.rows.length > 0) {
      await pool.query(`
        INSERT INTO teams (name, description, game, created_by)
        VALUES 
          ('Fire Squad', 'Elite Free Fire team looking for skilled players', 'Free Fire', $1),
          ('BGMI Warriors', 'Competitive BGMI team with tournament experience', 'BGMI', $1),
          ('Valorant Legends', 'Professional Valorant team seeking new members', 'Valorant', $1)
        ON CONFLICT DO NOTHING
      `, [adminUser.rows[0].id]);
    }
    
    console.log('✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

module.exports = { autoInitializeDatabase };