const pool = require('../config/database');

async function optimizeDatabase() {
  try {
    console.log('Starting database optimization for high-scale users...');

    // Add indexes for frequently queried columns
    const indexes = [
      // Users table indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_google_id ON users(google_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_primary_game ON users(primary_game)',
      
      // Game profiles indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_profiles_user_id ON game_profiles(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_profiles_game ON game_profiles(game)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_profiles_game_uid ON game_profiles(game_uid)',
      
      // Tournaments indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_status ON tournaments(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_game ON tournaments(game)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_registration_open ON tournaments(registration_open)',
      
      // Tournament registrations indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_registrations_user_id ON tournament_registrations(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_registrations_created_at ON tournament_registrations(created_at)',
      
      // Teams indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_captain_id ON teams(captain_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_created_at ON teams(created_at)',
      
      // Team members indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_user_id ON team_members(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)',
      
      // Wallet transactions indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type)',
      
      // Notifications indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(read)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)',
      
      // Composite indexes for common queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_game_status ON tournaments(game, status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_game_active ON users(primary_game, is_profile_complete)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at)',
    ];

    for (const indexQuery of indexes) {
      try {
        console.log(`Creating index: ${indexQuery.split(' ')[5]}`);
        await pool.query(indexQuery);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`Index already exists: ${indexQuery.split(' ')[5]}`);
        } else {
          console.error(`Error creating index: ${error.message}`);
        }
      }
    }

    // Optimize PostgreSQL settings for high concurrency
    console.log('Applying PostgreSQL optimizations...');
    
    // These would typically be set in postgresql.conf, but we can suggest them
    const optimizationSuggestions = [
      'max_connections = 200',
      'shared_buffers = 256MB',
      'effective_cache_size = 1GB',
      'work_mem = 4MB',
      'maintenance_work_mem = 64MB',
      'checkpoint_completion_target = 0.9',
      'wal_buffers = 16MB',
      'default_statistics_target = 100',
      'random_page_cost = 1.1',
      'effective_io_concurrency = 200'
    ];

    console.log('\nRecommended PostgreSQL configuration for high-scale:');
    optimizationSuggestions.forEach(setting => {
      console.log(`  ${setting}`);
    });

    // Create materialized views for expensive queries
    console.log('\nCreating materialized views for performance...');
    
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
      SELECT 
        u.id,
        u.username,
        u.primary_game,
        COUNT(DISTINCT tr.id) as tournaments_joined,
        COUNT(DISTINCT t.id) as teams_count,
        COALESCE(w.balance, 0) as wallet_balance,
        u.created_at
      FROM users u
      LEFT JOIN tournament_registrations tr ON u.id = tr.user_id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.is_profile_complete = true
      GROUP BY u.id, u.username, u.primary_game, w.balance, u.created_at
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_id ON user_stats(id)
    `);

    // Tournament leaderboard materialized view
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS tournament_leaderboard AS
      SELECT 
        u.id as user_id,
        u.username,
        u.primary_game,
        COUNT(tr.id) as tournaments_played,
        COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as wins,
        AVG(tr.placement::numeric) as avg_placement,
        SUM(tr.kills) as total_kills,
        MAX(tr.created_at) as last_played
      FROM users u
      JOIN tournament_registrations tr ON u.id = tr.user_id
      WHERE tr.placement IS NOT NULL
      GROUP BY u.id, u.username, u.primary_game
      ORDER BY wins DESC, avg_placement ASC, total_kills DESC
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_leaderboard_user_id ON tournament_leaderboard(user_id)
    `);

    console.log('Database optimization completed successfully!');
    
    // Show current database stats
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const tournamentCount = await pool.query('SELECT COUNT(*) FROM tournaments');
    const registrationCount = await pool.query('SELECT COUNT(*) FROM tournament_registrations');
    
    console.log('\nCurrent database statistics:');
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log(`  Tournaments: ${tournamentCount.rows[0].count}`);
    console.log(`  Registrations: ${registrationCount.rows[0].count}`);

  } catch (error) {
    console.error('Database optimization failed:', error);
    process.exit(1);
  }
}

// Function to refresh materialized views (should be run periodically)
async function refreshMaterializedViews() {
  try {
    console.log('Refreshing materialized views...');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY tournament_leaderboard');
    console.log('Materialized views refreshed successfully');
  } catch (error) {
    console.error('Error refreshing materialized views:', error);
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase()
    .then(() => {
      console.log('Optimization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Optimization failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeDatabase, refreshMaterializedViews };