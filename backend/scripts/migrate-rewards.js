const pool = require('../config/database');

async function migrateRewards() {
  try {
    console.log('Creating rewards system tables...');

    // Create user_rewards table for tracking points and rewards
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent')),
        reward_type VARCHAR(50) NOT NULL, -- 'daily_login', 'tournament_win', 'achievement', 'redemption', etc.
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        reward_amount INTEGER NOT NULL,
        reward_type VARCHAR(20) DEFAULT 'coins',
        icon VARCHAR(50),
        rarity VARCHAR(20) DEFAULT 'common',
        conditions JSONB, -- Store achievement conditions
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_achievements table for tracking completed achievements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      )
    `);

    // Create challenges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        reward_amount INTEGER NOT NULL,
        reward_type VARCHAR(20) DEFAULT 'coins',
        difficulty VARCHAR(20) DEFAULT 'easy',
        duration_hours INTEGER DEFAULT 24, -- How long the challenge lasts
        conditions JSONB, -- Store challenge conditions
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_challenges table for tracking challenge progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    // Create redeemable_rewards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS redeemable_rewards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL, -- Points required
        reward_type VARCHAR(50) NOT NULL, -- 'game_currency', 'tournament', 'cosmetic', etc.
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        stock INTEGER DEFAULT -1, -- -1 for unlimited
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reward_redemptions table for tracking redemptions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES redeemable_rewards(id),
        cost INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'fulfilled', 'cancelled'
        fulfillment_data JSONB, -- Store fulfillment details
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fulfilled_at TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_rewards_type ON user_rewards(reward_type);
      CREATE INDEX IF NOT EXISTS idx_user_rewards_created_at ON user_rewards(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
      CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
    `);

    // Insert default achievements
    await pool.query(`
      INSERT INTO achievements (title, description, reward_amount, icon, rarity, conditions) 
      VALUES 
        ('First Victory', 'Win your first tournament', 500, 'Trophy', 'common', '{"tournament_wins": 1}'),
        ('Streak Master', 'Maintain a 10-day login streak', 1000, 'Flame', 'rare', '{"login_streak": 10}'),
        ('Tournament Legend', 'Win 5 tournaments', 2500, 'Crown', 'epic', '{"tournament_wins": 5}'),
        ('Team Player', 'Join 3 different teams', 750, 'Users', 'common', '{"teams_joined": 3}'),
        ('Elite Performer', 'Achieve top 3 in 10 tournaments', 2000, 'Award', 'rare', '{"top3_finishes": 10}'),
        ('Dedication', 'Login for 30 consecutive days', 3000, 'Calendar', 'epic', '{"login_streak": 30}')
      ON CONFLICT DO NOTHING
    `);

    // Insert default challenges
    await pool.query(`
      INSERT INTO challenges (title, description, reward_amount, difficulty, duration_hours, conditions) 
      VALUES 
        ('Daily Warrior', 'Play 3 matches today', 200, 'easy', 24, '{"matches_played": 3}'),
        ('Victory Rush', 'Win 2 matches in a row', 500, 'medium', 48, '{"consecutive_wins": 2}'),
        ('Elite Performance', 'Achieve top 3 in 5 tournaments', 1500, 'hard', 168, '{"top3_finishes": 5}'),
        ('Social Player', 'Join 2 teams this week', 300, 'easy', 168, '{"teams_joined": 2}'),
        ('Tournament Master', 'Win 3 tournaments this week', 2000, 'hard', 168, '{"tournament_wins": 3}')
      ON CONFLICT DO NOTHING
    `);

    // Insert default redeemable rewards
    await pool.query(`
      INSERT INTO redeemable_rewards (title, description, cost, reward_type) 
      VALUES 
        ('Free Fire Diamonds', '100 Diamonds', 1000, 'game_currency'),
        ('PUBG UC', '60 UC', 800, 'game_currency'),
        ('Tournament Entry', 'Free premium tournament entry', 2000, 'tournament'),
        ('Exclusive Avatar', 'Limited edition profile avatar', 3000, 'cosmetic'),
        ('Double XP Boost', '24-hour double XP boost', 1500, 'boost'),
        ('Premium Badge', 'Show off with a premium badge', 2500, 'cosmetic')
      ON CONFLICT DO NOTHING
    `);

    console.log('Rewards system migration completed successfully!');
  } catch (error) {
    console.error('Rewards migration error:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateRewards()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateRewards;