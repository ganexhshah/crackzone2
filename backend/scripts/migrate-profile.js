require('dotenv').config();
const pool = require('../config/database');

const createProfileTables = async () => {
  try {
    console.log('Creating profile tables...');

    // User profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        bio TEXT,
        favorite_game VARCHAR(50) DEFAULT 'freefire',
        rank VARCHAR(20) DEFAULT 'bronze',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        next_level_xp INTEGER DEFAULT 1000,
        best_rank VARCHAR(20) DEFAULT 'bronze',
        privacy_setting VARCHAR(20) DEFAULT 'public' CHECK (privacy_setting IN ('public', 'friends', 'private')),
        notifications_enabled BOOLEAN DEFAULT TRUE,
        auto_join_teams BOOLEAN DEFAULT FALSE,
        sound_effects_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created user_profiles table');

    // Achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) DEFAULT 'trophy',
        category VARCHAR(50) DEFAULT 'general',
        requirement_type VARCHAR(50) NOT NULL,
        requirement_value INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created achievements table');

    // User achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      )
    `);
    console.log('Created user_achievements table');

    // Tournament participants table (if not exists from previous migrations)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        position INTEGER,
        prize_amount DECIMAL(10,2) DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);
    console.log('Created/verified tournament_participants table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
      CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
    `);
    console.log('Created indexes');

    // Insert default achievements
    await pool.query(`
      INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value)
      VALUES 
        ('First Victory', 'Win your first tournament', 'trophy', 'tournaments', 'tournaments_won', 1),
        ('Streak Master', 'Win 5 tournaments in a row', 'target', 'tournaments', 'win_streak', 5),
        ('Team Player', 'Join 3 different teams', 'users', 'teams', 'teams_joined', 3),
        ('Rising Star', 'Reach Gold rank', 'star', 'progression', 'rank_achieved', 3),
        ('Tournament King', 'Win 25 tournaments', 'medal', 'tournaments', 'tournaments_won', 25),
        ('Elite Gamer', 'Reach Platinum rank', 'award', 'progression', 'rank_achieved', 4),
        ('Money Maker', 'Earn ₹10,000 in prizes', 'wallet', 'earnings', 'total_earnings', 10000),
        ('Veteran Player', 'Play 100 tournaments', 'gamepad2', 'participation', 'tournaments_played', 100),
        ('Perfect Score', 'Maintain 90% win rate over 20 games', 'target', 'performance', 'win_rate_threshold', 90),
        ('Social Butterfly', 'Add 10 friends', 'users', 'social', 'friends_added', 10)
      ON CONFLICT DO NOTHING
    `);
    console.log('Inserted default achievements');

    // Create user profiles for existing users
    await pool.query(`
      INSERT INTO user_profiles (user_id, bio, favorite_game, rank, level, xp, next_level_xp)
      SELECT id, '', 'freefire', 'bronze', 1, 0, 1000 FROM users 
      WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
    `);
    console.log('Created profiles for existing users');

    console.log('Profile tables created successfully!');
    
  } catch (error) {
    console.error('Error creating profile tables:', error);
    throw error;
  }
};

// Run migration
createProfileTables().then(() => {
  console.log('Profile migration completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Profile migration failed:', error);
  process.exit(1);
});