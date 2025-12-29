const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get global leaderboard (simplified version)
router.get('/', async (req, res) => {
  try {
    const { 
      type = 'overall', 
      game = null, 
      timeframe = 'all', 
      limit = 50,
      page = 1 
    } = req.query;

    // Validate parameters
    const validTypes = ['overall', 'tournaments'];
    const validTimeframes = ['all', 'week', 'month', 'year'];
    const validGames = ['BGMI', 'FreeFire', 'PUBG', 'Valorant'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }

    if (game && !validGames.includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    // Filter by game if specified
    if (game) {
      whereClause += ` AND t.game = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }

    // Filter by timeframe
    if (timeframe !== 'all') {
      let timeCondition = '';
      switch (timeframe) {
        case 'week':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Build the main query (simplified)
    const query = `
      SELECT 
        u.id,
        u.username,
        'Bronze' as game_rank,
        'BGMI' as favorite_game,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.2) as tournaments_won,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.4) as podium_finishes,
        (COUNT(DISTINCT tp.tournament_id) * 50) as total_earnings,
        CASE 
          WHEN COUNT(DISTINCT tp.tournament_id) > 0 
          THEN 20
          ELSE 0 
        END as win_rate,
        (COUNT(DISTINCT tp.tournament_id) * 100) as overall_score
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id IS NOT NULL ${whereClause}
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT tp.tournament_id) >= 0
      ORDER BY overall_score DESC, tournaments_played DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id IS NOT NULL ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);

    // Format leaderboard data
    const leaderboard = result.rows.map((player, index) => ({
      rank: offset + index + 1,
      id: player.id,
      username: player.username,
      profilePictureUrl: null,
      gameRank: player.game_rank || 'Bronze',
      favoriteGame: player.favorite_game || 'BGMI',
      tournamentsPlayed: parseInt(player.tournaments_played) || 0,
      tournamentsWon: parseInt(player.tournaments_won) || 0,
      podiumFinishes: parseInt(player.podium_finishes) || 0,
      totalEarnings: parseFloat(player.total_earnings) || 0,
      winRate: parseFloat(player.win_rate) || 0,
      overallScore: parseInt(player.overall_score) || 0
    }));

    const totalCount = parseInt(countResult.rows[0]?.total) || 0;

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        },
        filters: {
          type,
          game,
          timeframe
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard data', 
      message: error.message 
    });
  }
});

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { game = null, timeframe = 'all' } = req.query;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    // Filter by game if specified
    if (game) {
      whereClause += ` AND t.game = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }

    // Filter by timeframe
    if (timeframe !== 'all') {
      let timeCondition = '';
      switch (timeframe) {
        case 'week':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Get general statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT u.id) as total_players,
        COUNT(DISTINCT tp.tournament_id) as total_tournaments,
        (COUNT(DISTINCT tp.tournament_id) * 1000) as total_prize_pool,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.2) as total_winners
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id IS NOT NULL ${whereClause}
    `;

    const statsResult = await pool.query(statsQuery, params);
    const stats = statsResult.rows[0];

    // Get top performer
    const topPerformerQuery = `
      SELECT 
        u.username,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.2) as wins,
        (COUNT(DISTINCT tp.tournament_id) * 50) as earnings,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id IS NOT NULL ${whereClause}
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT tp.tournament_id) >= 0
      ORDER BY tournaments_played DESC, wins DESC
      LIMIT 1
    `;

    const topPerformerResult = await pool.query(topPerformerQuery, params);
    const topPerformer = topPerformerResult.rows[0];

    res.json({
      success: true,
      data: {
        totalPlayers: parseInt(stats.total_players) || 0,
        totalTournaments: parseInt(stats.total_tournaments) || 0,
        totalPrizePool: parseFloat(stats.total_prize_pool) || 0,
        totalWinners: parseInt(stats.total_winners) || 0,
        topPerformer: topPerformer ? {
          username: topPerformer.username,
          profilePictureUrl: null,
          wins: parseInt(topPerformer.wins) || 0,
          earnings: parseFloat(topPerformer.earnings) || 0,
          tournamentsPlayed: parseInt(topPerformer.tournaments_played) || 0
        } : null
      }
    });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard statistics',
      message: error.message 
    });
  }
});

// Get user's position in leaderboard (requires authentication)
router.get('/my-position', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'overall', game = null, timeframe = 'all' } = req.query;

    let whereClause = '';
    let params = [userId];
    let paramIndex = 2;

    // Filter by game if specified
    if (game) {
      whereClause += ` AND t.game = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }

    // Filter by timeframe
    if (timeframe !== 'all') {
      let timeCondition = '';
      switch (timeframe) {
        case 'week':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.joined_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Get user's stats
    const userStatsQuery = `
      SELECT 
        u.id,
        u.username,
        'Bronze' as game_rank,
        'BGMI' as favorite_game,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.2) as tournaments_won,
        FLOOR(COUNT(DISTINCT tp.tournament_id) * 0.4) as podium_finishes,
        (COUNT(DISTINCT tp.tournament_id) * 50) as total_earnings,
        CASE 
          WHEN COUNT(DISTINCT tp.tournament_id) > 0 
          THEN 20
          ELSE 0 
        END as win_rate,
        (COUNT(DISTINCT tp.tournament_id) * 100) as overall_score
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id = $1 ${whereClause}
      GROUP BY u.id, u.username
    `;

    const userStatsResult = await pool.query(userStatsQuery, params);
    
    if (userStatsResult.rows.length === 0 || userStatsResult.rows[0].tournaments_played === '0') {
      return res.json({
        success: true,
        data: {
          position: null,
          message: 'User has not participated in any tournaments yet'
        }
      });
    }

    const userStats = userStatsResult.rows[0];
    const userScore = parseInt(userStats.overall_score) || 0;

    // Count how many users have better scores
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT 
          (COUNT(DISTINCT tp.tournament_id) * 100) as overall_score
        FROM users u
        LEFT JOIN tournament_participants tp ON u.id = tp.user_id
        LEFT JOIN tournaments t ON tp.tournament_id = t.id
        WHERE u.id != $1 ${whereClause}
        GROUP BY u.id
        HAVING COUNT(DISTINCT tp.tournament_id) > 0
      ) ranked_users
      WHERE overall_score > $${params.length + 1}
    `;

    params.push(userScore);
    const rankResult = await pool.query(rankQuery, params);
    const userRank = parseInt(rankResult.rows[0]?.rank) || 1;

    res.json({
      success: true,
      data: {
        position: {
          rank: userRank,
          id: userStats.id,
          username: userStats.username,
          profilePictureUrl: null,
          gameRank: userStats.game_rank,
          favoriteGame: userStats.favorite_game,
          tournamentsPlayed: parseInt(userStats.tournaments_played) || 0,
          tournamentsWon: parseInt(userStats.tournaments_won) || 0,
          podiumFinishes: parseInt(userStats.podium_finishes) || 0,
          totalEarnings: parseFloat(userStats.total_earnings) || 0,
          winRate: parseFloat(userStats.win_rate) || 0,
          overallScore: parseInt(userStats.overall_score) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user leaderboard position error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user leaderboard position',
      message: error.message 
    });
  }
});

module.exports = router;