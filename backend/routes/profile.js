const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile with stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user basic info
    const userResult = await pool.query(
      `SELECT id, username, email, profile_picture_url, auth_provider, 
              created_at, is_profile_complete
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user profile details
    const profileResult = await pool.query(
      `SELECT bio, favorite_game, rank, level, xp, next_level_xp, 
              privacy_setting, notifications_enabled, auto_join_teams, 
              sound_effects_enabled
       FROM user_profiles WHERE user_id = $1`,
      [userId]
    );

    let profile = profileResult.rows[0] || {};

    // Get game profiles
    const gameProfilesResult = await pool.query(
      'SELECT game, game_uid, game_username, is_primary FROM game_profiles WHERE user_id = $1',
      [userId]
    );

    // Get wallet balance
    const walletResult = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    );

    // Get tournament statistics
    const statsResult = await pool.query(
      `SELECT 
         COUNT(DISTINCT tp.tournament_id) as tournaments_played,
         COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as tournaments_won,
         COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as total_earnings
       FROM tournament_participants tp
       LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
       WHERE tp.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const winRate = stats.tournaments_played > 0 
      ? Math.round((stats.tournaments_won / stats.tournaments_played) * 100) 
      : 0;

    // Get current streak (simplified - just check if last tournament was won)
    const streakResult = await pool.query(
      `SELECT CASE 
         WHEN tr.placement = 1 THEN 1 
         ELSE 0 
       END as current_streak
       FROM tournament_participants tp
       LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
       WHERE tp.user_id = $1
       ORDER BY tp.created_at DESC
       LIMIT 1`,
      [userId]
    );

    // Get achievements
    const achievementsResult = await pool.query(
      `SELECT ua.achievement_id, ua.earned_at, a.name, a.description, a.icon, a.category
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );

    // Get recent matches
    const matchesResult = await pool.query(
      `SELECT t.title as tournament_name, tr.placement as position, 
              CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END as prize_amount,
              tp.created_at, t.game
       FROM tournament_participants tp
       JOIN tournaments t ON tp.tournament_id = t.id
       LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
       WHERE tp.user_id = $1
       ORDER BY tp.created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profile_picture_url,
        authProvider: user.auth_provider,
        joinDate: user.created_at,
        isProfileComplete: user.is_profile_complete,
        bio: profile.bio || '',
        favoriteGame: profile.favorite_game || 'FreeFire',
        rank: profile.rank || 'Bronze',
        level: profile.level || 1,
        xp: profile.xp || 0,
        nextLevelXp: profile.next_level_xp || 1000,
        privacySetting: profile.privacy_setting || 'public',
        notificationsEnabled: profile.notifications_enabled !== false,
        autoJoinTeams: profile.auto_join_teams || false,
        soundEffectsEnabled: profile.sound_effects_enabled !== false
      },
      gameProfiles: gameProfilesResult.rows,
      wallet: {
        balance: walletResult.rows[0]?.balance || 0
      },
      stats: {
        tournamentsPlayed: parseInt(stats.tournaments_played),
        tournamentsWon: parseInt(stats.tournaments_won),
        winRate: winRate,
        totalEarnings: parseFloat(stats.total_earnings),
        currentStreak: parseInt(streakResult.rows[0]?.current_streak || 0),
        bestRank: profile.best_rank || 'Bronze'
      },
      achievements: achievementsResult.rows.map(ach => ({
        id: ach.achievement_id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        earnedAt: ach.earned_at
      })),
      recentMatches: matchesResult.rows.map(match => ({
        tournamentName: match.tournament_name,
        result: match.position === 1 ? 'Won' : 
                match.position === 2 ? 'Runner-up' : 
                match.position === 3 ? 'Third Place' : 
                match.position ? 'Eliminated' : 'In Progress',
        position: match.position || 'TBD',
        prize: match.prize_amount ? `₹${match.prize_amount}` : '-',
        date: match.created_at,
        game: match.game
      }))
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile data' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      username, 
      bio, 
      favoriteGame, 
      gameId,
      privacySetting,
      notificationsEnabled,
      autoJoinTeams,
      soundEffectsEnabled
    } = req.body;

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Update username in users table if provided
      if (username) {
        // Check if username is taken by another user
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, userId]
        );

        if (existingUser.rows.length > 0) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: 'Username already taken' });
        }

        await pool.query(
          'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [username, userId]
        );
      }

      // Update or create user profile
      await pool.query(
        `INSERT INTO user_profiles (
           user_id, bio, favorite_game, privacy_setting, 
           notifications_enabled, auto_join_teams, sound_effects_enabled
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           bio = COALESCE($2, user_profiles.bio),
           favorite_game = COALESCE($3, user_profiles.favorite_game),
           privacy_setting = COALESCE($4, user_profiles.privacy_setting),
           notifications_enabled = COALESCE($5, user_profiles.notifications_enabled),
           auto_join_teams = COALESCE($6, user_profiles.auto_join_teams),
           sound_effects_enabled = COALESCE($7, user_profiles.sound_effects_enabled),
           updated_at = CURRENT_TIMESTAMP`,
        [userId, bio, favoriteGame, privacySetting, notificationsEnabled, autoJoinTeams, soundEffectsEnabled]
      );

      // Update game profile if provided
      if (gameId && favoriteGame) {
        await pool.query(
          `INSERT INTO game_profiles (user_id, game, game_uid, is_primary)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (user_id, game)
           DO UPDATE SET 
             game_uid = $3,
             is_primary = true,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, favoriteGame.toLowerCase(), gameId]
        );
      }

      await pool.query('COMMIT');

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update profile picture
router.put('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    await pool.query(
      'UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [avatarUrl, userId]
    );

    res.json({ 
      message: 'Profile picture updated successfully',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all achievements with user's progress
    const achievementsResult = await pool.query(
      `SELECT a.id, a.name, a.description, a.icon, a.category, a.requirement_value,
              ua.earned_at, ua.progress,
              CASE WHEN ua.user_id IS NOT NULL THEN true ELSE false END as earned
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
       ORDER BY earned DESC, a.category, a.id`,
      [userId]
    );

    const achievements = achievementsResult.rows.map(ach => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      requirementValue: ach.requirement_value,
      earned: ach.earned,
      earnedAt: ach.earned_at,
      progress: ach.progress || 0
    }));

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Get match history with pagination
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, game } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.title as tournament_name, tr.placement as position,
             CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END as prize_amount,
             tp.created_at, t.game, t.max_participants, t.status
      FROM tournament_participants tp
      JOIN tournaments t ON tp.tournament_id = t.id
      LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
      WHERE tp.user_id = $1
    `;
    let params = [userId];
    let paramCount = 1;

    if (game) {
      paramCount++;
      query += ` AND t.game = $${paramCount}`;
      params.push(game);
    }

    query += ` ORDER BY tp.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const matchesResult = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*)
      FROM tournament_participants tp
      JOIN tournaments t ON tp.tournament_id = t.id
      WHERE tp.user_id = $1
    `;
    let countParams = [userId];

    if (game) {
      countQuery += ` AND t.game = $2`;
      countParams.push(game);
    }

    const totalCount = await pool.query(countQuery, countParams);

    const matches = matchesResult.rows.map(match => ({
      tournamentName: match.tournament_name,
      result: match.position === 1 ? 'Won' : 
              match.position === 2 ? 'Runner-up' : 
              match.position === 3 ? 'Third Place' : 
              match.position ? 'Eliminated' : 'In Progress',
      position: match.position || 'TBD',
      prize: match.prize_amount ? `₹${match.prize_amount}` : '-',
      date: match.created_at,
      game: match.game,
      maxParticipants: match.max_participants,
      status: match.status
    }));

    res.json({
      matches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        totalPages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get match history' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      privacySetting,
      notificationsEnabled,
      autoJoinTeams,
      soundEffectsEnabled
    } = req.body;

    await pool.query(
      `INSERT INTO user_profiles (
         user_id, privacy_setting, notifications_enabled, 
         auto_join_teams, sound_effects_enabled
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         privacy_setting = COALESCE($2, user_profiles.privacy_setting),
         notifications_enabled = COALESCE($3, user_profiles.notifications_enabled),
         auto_join_teams = COALESCE($4, user_profiles.auto_join_teams),
         sound_effects_enabled = COALESCE($5, user_profiles.sound_effects_enabled),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, privacySetting, notificationsEnabled, autoJoinTeams, soundEffectsEnabled]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;