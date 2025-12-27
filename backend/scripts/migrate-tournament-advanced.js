const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crackzone_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function migrateAdvancedTournaments() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add new columns to tournaments table for advanced features
    console.log('Adding advanced tournament columns...');
    
    // Check if columns exist before adding them
    const existingColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'tournaments' AND table_schema = 'public'
    `);
    
    const columnNames = existingColumns.rows.map(row => row.column_name);
    
    const columnsToAdd = [
      { name: 'tournament_type', sql: 'tournament_type VARCHAR(20) DEFAULT \'SOLO\' CHECK (tournament_type IN (\'SOLO\', \'SQUAD\'))' },
      { name: 'admin_profit_type', sql: 'admin_profit_type VARCHAR(20) DEFAULT \'percentage\' CHECK (admin_profit_type IN (\'percentage\', \'fixed_per_team\', \'platform_fee\'))' },
      { name: 'admin_profit_value', sql: 'admin_profit_value DECIMAL(10,2) DEFAULT 0' },
      { name: 'admin_profit_amount', sql: 'admin_profit_amount DECIMAL(10,2) DEFAULT 0' },
      { name: 'calculated_prize_pool', sql: 'calculated_prize_pool DECIMAL(10,2) DEFAULT 0' },
      { name: 'auto_calculate_prize', sql: 'auto_calculate_prize BOOLEAN DEFAULT true' },
      { name: 'team_size', sql: 'team_size INTEGER DEFAULT 1' },
      { name: 'per_player_fee', sql: 'per_player_fee DECIMAL(10,2) DEFAULT 0' },
      { name: 'total_collected', sql: 'total_collected DECIMAL(10,2) DEFAULT 0' },
      { name: 'prize_distribution', sql: 'prize_distribution JSONB DEFAULT \'[{"rank": 1, "percentage": 50}, {"rank": 2, "percentage": 30}, {"rank": 3, "percentage": 20}]\'' },
      { name: 'rules_text', sql: 'rules_text TEXT' },
      { name: 'platform_fee_visible', sql: 'platform_fee_visible BOOLEAN DEFAULT true' }
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        await client.query(`ALTER TABLE tournaments ADD COLUMN ${column.sql}`);
        console.log(`Added column: ${column.name}`);
      }
    }

    // Create team_wallets table for squad tournaments
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_wallets (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        balance DECIMAL(10,2) DEFAULT 0,
        required_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, tournament_id)
      )
    `);
    console.log('Created team_wallets table');

    // Create team_contributions table to track individual player contributions
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_contributions (
        id SERIAL PRIMARY KEY,
        team_wallet_id INTEGER REFERENCES team_wallets(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_wallet_id, user_id)
      )
    `);
    console.log('Created team_contributions table');

    // Create admin_wallets table to track admin profits
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_wallets (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        profit_amount DECIMAL(10,2) NOT NULL,
        profit_type VARCHAR(20) NOT NULL,
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'refunded'))
      )
    `);
    console.log('Created admin_wallets table');

    // Create tournament_prizes table for detailed prize tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_prizes (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        rank INTEGER NOT NULL,
        team_id INTEGER REFERENCES teams(id),
        user_id INTEGER REFERENCES users(id),
        prize_amount DECIMAL(10,2) NOT NULL,
        distributed_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created tournament_prizes table');

    // Add indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_team_wallets_tournament ON team_wallets(tournament_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_team_contributions_wallet ON team_contributions(team_wallet_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament ON tournament_prizes(tournament_id)');

    await client.query('COMMIT');
    console.log('Advanced tournament migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateAdvancedTournaments()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAdvancedTournaments };