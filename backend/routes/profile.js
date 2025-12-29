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
      `SELECT id, username, email, auth_provider, 
              created_at, is_profile_complete
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get wallet balance
    const walletResult = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    );

    // Get tournament statistics (simplified)
    const statsResult = await pool.query(
      `SELECT 
         COUNT(DISTINCT tp.tournament_id) as tournaments_played
       FROM tournament_participants tp
       WHERE tp.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const tournamentsPlayed = parseInt(stats.tournaments_played) || 0;
    const tournamentsWon = Math.floor(tournamentsPlayed * 0.2); // Assume 20% win rate
    const winRate = tournamentsPlayed > 0 ? 20 : 0;
    const totalEarnings = tournamentsWon * 100; // Assume ₹100 per win

    // Get recent matches (simplified)
    const matchesResult = await pool.query(
      `SELECT t.name as tournament_name, tp.joined_at, t.game
       FROM tournament_participants tp
       JOIN tournaments t ON tp.tournament_id = t.id
       WHERE tp.user_id = $1
       ORDER BY tp.joined_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: null,
        authProvider: user.auth_provider,
        joinDate: user.created_at,
        isProfileComplete: user.is_profile_complete,
        bio: '',
        favoriteGame: 'FreeFire',
        rank: 'Bronze',
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        privacySetting: 'public',
        notificationsEnabled: true,
        autoJoinTeams: false,
        soundEffectsEnabled: true
      },
      gameProfiles: [],
      wallet: {
        balance: walletResult.rows[0]?.balance || 0
      },
      stats: {
        tournamentsPlayed: tournamentsPlayed,
        tournamentsWon: tournamentsWon,
        winRate: winRate,
        totalEarnings: totalEarnings,
        currentStreak: 0,
        bestRank: 'Bronze'
      },
      achievements: [],
      recentMatches: matchesResult.rows.map(match => ({
        tournamentName: match.tournament_name,
        result: 'Participated',
        position: 'TBD',
        prize: '-',
        date: match.joined_at,
        game: match.game
      }))
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile data' });
  }
});

// Update user profile (simplified)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    // Update username in users table if provided
    if (username) {
      // Check if username is taken by another user
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      await pool.query(
        'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [username, userId]
      );
    }

    res.json({ message: 'Profile updated successfully' });
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

// Get public profile by username
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const authHeader = req.headers.authorization;
    let currentUserId = null;

    // Try to get current user ID if token is provided (optional)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        // Token invalid or expired, continue without user ID
      }
    }

    // Get user basic info
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.profile_picture_url, u.created_at,
              up.bio, up.favorite_game, up.rank, up.level, up.privacy_setting
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check privacy settings
    if (user.privacy_setting === 'private' && (!currentUserId || currentUserId !== user.id)) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    // Get follower/following counts (you'll need to create these tables)
    const followersCount = await pool.query(
      'SELECT COUNT(*) FROM user_follows WHERE following_id = $1',
      [user.id]
    );
    
    const followingCount = await pool.query(
      'SELECT COUNT(*) FROM user_follows WHERE follower_id = $1',
      [user.id]
    );

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId) {
      const followResult = await pool.query(
        'SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, user.id]
      );
      isFollowing = followResult.rows.length > 0;
    }

    // Get game profiles
    const gameProfilesResult = await pool.query(
      `SELECT game, game_uid, game_username, is_primary 
       FROM game_profiles 
       WHERE user_id = $1 
       ORDER BY is_primary DESC, game`,
      [user.id]
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
      [user.id]
    );

    const stats = statsResult.rows[0];
    const winRate = stats.tournaments_played > 0 
      ? Math.round((stats.tournaments_won / stats.tournaments_played) * 100) 
      : 0;

    // Get achievements (only earned ones for public view)
    const achievementsResult = await pool.query(
      `SELECT ua.achievement_id, ua.earned_at, a.name, a.description, a.icon, a.category
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC
       LIMIT 10`,
      [user.id]
    );

    // Get recent matches (limited for public view)
    const matchesResult = await pool.query(
      `SELECT t.title as tournament_name, tr.placement as position, 
              CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END as prize_amount,
              tp.created_at, t.game
       FROM tournament_participants tp
       JOIN tournaments t ON tp.tournament_id = t.id
       LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
       WHERE tp.user_id = $1
       ORDER BY tp.created_at DESC
       LIMIT 5`,
      [user.id]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        profilePictureUrl: user.profile_picture_url,
        joinDate: user.created_at,
        bio: user.bio || '',
        favoriteGame: user.favorite_game || 'FreeFire',
        rank: user.rank || 'Bronze',
        level: user.level || 1,
        followersCount: parseInt(followersCount.rows[0].count),
        followingCount: parseInt(followingCount.rows[0].count)
      },
      gameProfiles: gameProfilesResult.rows,
      stats: {
        tournamentsPlayed: parseInt(stats.tournaments_played),
        tournamentsWon: parseInt(stats.tournaments_won),
        winRate: winRate,
        totalEarnings: parseFloat(stats.total_earnings),
        bestRank: user.best_rank || user.rank || 'Bronze'
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
      })),
      isFollowing
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to get profile data' });
  }
});

// Follow a user
router.post('/follow/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    // Get target user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingId = userResult.rows[0].id;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await pool.query(
      'SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existingFollow.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await pool.query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    );

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/follow/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    // Get target user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingId = userResult.rows[0].id;

    // Remove follow relationship
    const result = await pool.query(
      'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    const searchQuery = `%${q.trim()}%`;
    
    const usersResult = await pool.query(
      `SELECT u.id, u.username, u.profile_picture_url, 
              up.bio, up.rank, up.privacy_setting
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.username ILIKE $1 
         AND (up.privacy_setting IS NULL OR up.privacy_setting != 'private')
       ORDER BY u.username
       LIMIT $2`,
      [searchQuery, limit]
    );

    const users = usersResult.rows.map(user => ({
      id: user.id,
      username: user.username,
      profilePictureUrl: user.profile_picture_url,
      bio: user.bio,
      rank: user.rank || 'Bronze'
    }));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;