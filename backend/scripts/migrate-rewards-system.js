const pool = require('../config/database');

async function migrateRewardsSystem() {
  try {
    console.log('Starting rewards system migration...');

    // Create redeemable_rewards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS redeemable_rewards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cost INTEGER NOT NULL DEFAULT 0,
        type VARCHAR(50) NOT NULL DEFAULT 'coins',
        category VARCHAR(50) DEFAULT 'general',
        available BOOLEAN DEFAULT true,
        icon VARCHAR(50) DEFAULT 'Gift',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create system_achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_achievements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reward INTEGER NOT NULL DEFAULT 0,
        type VARCHAR(50) NOT NULL DEFAULT 'coins',
        icon VARCHAR(50) DEFAULT 'Trophy',
        rarity VARCHAR(20) DEFAULT 'common',
        category VARCHAR(50) DEFAULT 'general',
        requirement_type VARCHAR(50),
        requirement_value INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create system_challenges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reward INTEGER NOT NULL DEFAULT 0,
        type VARCHAR(50) NOT NULL DEFAULT 'coins',
        difficulty VARCHAR(20) DEFAULT 'easy',
        category VARCHAR(50) DEFAULT 'daily',
        requirement_type VARCHAR(50),
        requirement_value INTEGER DEFAULT 0,
        duration_hours INTEGER DEFAULT 24,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_challenge_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_challenge_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES system_challenges(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, challenge_id)
      )
    `);

    // Create reward_redemptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES redeemable_rewards(id) ON DELETE CASCADE,
        cost INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default redeemable rewards
    await pool.query(`
      INSERT INTO redeemable_rewards (title, description, cost, type, icon) VALUES
      ('Free Fire Diamonds', '100 Diamonds', 1000, 'game_currency', 'Gift'),
      ('PUBG UC', '60 UC', 800, 'game_currency', 'Gift'),
      ('Tournament Entry', 'Free premium tournament entry', 2000, 'tournament', 'Trophy'),
      ('Exclusive Avatar', 'Limited edition profile avatar', 3000, 'cosmetic', 'Star')
      ON CONFLICT DO NOTHING
    `);

    // Insert default achievements
    await pool.query(`
      INSERT INTO system_achievements (title, description, reward, icon, rarity, requirement_type, requirement_value) VALUES
      ('First Victory', 'Win your first tournament', 500, 'Trophy', 'common', 'tournament_wins', 1),
      ('Streak Master', 'Maintain a 10-day login streak', 1000, 'Flame', 'rare', 'login_streak', 10),
      ('Tournament Legend', 'Win 5 tournaments', 2500, 'Crown', 'epic', 'tournament_wins', 5),
      ('Team Player', 'Join 3 different teams', 750, 'Users', 'common', 'teams_joined', 3),
      ('Elite Performer', 'Achieve top 3 in 10 tournaments', 2000, 'Award', 'rare', 'top3_finishes', 10)
      ON CONFLICT DO NOTHING
    `);

    // Insert default challenges
    await pool.query(`
      INSERT INTO system_challenges (title, description, reward, difficulty, requirement_type, requirement_value, duration_hours) VALUES
      ('Daily Warrior', 'Play 3 matches today', 200, 'easy', 'matches_played', 3, 24),
      ('Victory Rush', 'Win 2 matches in a row', 500, 'medium', 'consecutive_wins', 2, 48),
      ('Elite Performance', 'Achieve top 3 in 5 tournaments', 1500, 'hard', 'top3_finishes', 5, 168),
      ('Social Butterfly', 'Join 2 teams this week', 300, 'easy', 'teams_joined', 2, 168),
      ('Dedication', 'Login for 7 consecutive days', 800, 'medium', 'login_streak', 7, 168)
      ON CONFLICT DO NOTHING
    `);

    console.log('Rewards system migration completed successfully!');
    
    // Show current state
    const rewardsCount = await pool.query('SELECT COUNT(*) FROM redeemable_rewards');
    const achievementsCount = await pool.query('SELECT COUNT(*) FROM system_achievements');
    const challengesCount = await pool.query('SELECT COUNT(*) FROM system_challenges');
    
    console.log(`Created ${rewardsCount.rows[0].count} redeemable rewards`);
    console.log(`Created ${achievementsCount.rows[0].count} achievements`);
    console.log(`Created ${challengesCount.rows[0].count} challenges`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateRewardsSystem()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateRewardsSystem;