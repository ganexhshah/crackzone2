const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get global leaderboard
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
    const validTypes = ['overall', 'earnings', 'wins'];
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
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Build the main query based on type
    let orderBy = '';
    switch (type) {
      case 'earnings':
        orderBy = 'total_earnings DESC, tournaments_won DESC';
        break;
      case 'wins':
        orderBy = 'tournaments_won DESC, total_earnings DESC';
        break;
      default: // overall
        orderBy = 'overall_score DESC, tournaments_won DESC, total_earnings DESC';
    }

    const query = `
      SELECT 
        u.id,
        u.username,
        u.profile_picture_url,
        COALESCE(up.rank, 'Bronze') as game_rank,
        COALESCE(up.favorite_game, 'BGMI') as favorite_game,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played,
        COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as tournaments_won,
        COUNT(CASE WHEN tr.placement <= 3 THEN 1 END) as podium_finishes,
        COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as total_earnings,
        CASE 
          WHEN COUNT(DISTINCT tp.tournament_id) > 0 
          THEN ROUND((COUNT(CASE WHEN tr.placement = 1 THEN 1 END)::float / COUNT(DISTINCT tp.tournament_id) * 100)::numeric, 1)
          ELSE 0 
        END as win_rate,
        (
          COUNT(CASE WHEN tr.placement = 1 THEN 1 END) * 100 +
          COUNT(CASE WHEN tr.placement = 2 THEN 1 END) * 50 +
          COUNT(CASE WHEN tr.placement = 3 THEN 1 END) * 25 +
          COUNT(DISTINCT tp.tournament_id) * 5
        ) as overall_score
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
      WHERE u.id IS NOT NULL ${whereClause}
      GROUP BY u.id, u.username, u.profile_picture_url, up.rank, up.favorite_game
      HAVING COUNT(DISTINCT tp.tournament_id) > 0
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);
    
    console.log('Executing leaderboard query with params:', params);
    
    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      WHERE u.id IS NOT NULL ${whereClause}
      AND tp.id IS NOT NULL
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);

    // Format leaderboard data
    const leaderboard = result.rows.map((player, index) => ({
      rank: offset + index + 1,
      id: player.id,
      username: player.username,
      profilePictureUrl: player.profile_picture_url,
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
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Get general statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT u.id) as total_players,
        COUNT(DISTINCT tp.tournament_id) as total_tournaments,
        COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as total_prize_pool,
        COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as total_winners
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
      WHERE u.id IS NOT NULL ${whereClause}
      AND tp.id IS NOT NULL
    `;

    const statsResult = await pool.query(statsQuery, params);
    const stats = statsResult.rows[0];

    // Get top performer
    const topPerformerQuery = `
      SELECT 
        u.username,
        u.profile_picture_url,
        COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as wins,
        COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as earnings,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played
      FROM users u
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
      WHERE u.id IS NOT NULL ${whereClause}
      GROUP BY u.id, u.username, u.profile_picture_url
      HAVING COUNT(DISTINCT tp.tournament_id) > 0
      ORDER BY wins DESC, earnings DESC
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
          profilePictureUrl: topPerformer.profile_picture_url,
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
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '30 days'`;
          break;
        case 'year':
          timeCondition = ` AND tp.created_at >= NOW() - INTERVAL '365 days'`;
          break;
      }
      whereClause += timeCondition;
    }

    // Get user's stats
    const userStatsQuery = `
      SELECT 
        u.id,
        u.username,
        u.profile_picture_url,
        COALESCE(up.rank, 'Bronze') as game_rank,
        COALESCE(up.favorite_game, 'BGMI') as favorite_game,
        COUNT(DISTINCT tp.tournament_id) as tournaments_played,
        COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as tournaments_won,
        COUNT(CASE WHEN tr.placement <= 3 THEN 1 END) as podium_finishes,
        COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as total_earnings,
        CASE 
          WHEN COUNT(DISTINCT tp.tournament_id) > 0 
          THEN ROUND((COUNT(CASE WHEN tr.placement = 1 THEN 1 END)::float / COUNT(DISTINCT tp.tournament_id) * 100)::numeric, 1)
          ELSE 0 
        END as win_rate,
        (
          COUNT(CASE WHEN tr.placement = 1 THEN 1 END) * 100 +
          COUNT(CASE WHEN tr.placement = 2 THEN 1 END) * 50 +
          COUNT(CASE WHEN tr.placement = 3 THEN 1 END) * 25 +
          COUNT(DISTINCT tp.tournament_id) * 5
        ) as overall_score
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN tournament_participants tp ON u.id = tp.user_id
      LEFT JOIN tournaments t ON tp.tournament_id = t.id
      LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
      WHERE u.id = $1 ${whereClause}
      GROUP BY u.id, u.username, u.profile_picture_url, up.rank, up.favorite_game
    `;

    const userStatsResult = await pool.query(userStatsQuery, params);
    
    if (userStatsResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          position: null,
          message: 'User has not participated in any tournaments yet'
        }
      });
    }

    const userStats = userStatsResult.rows[0];

    // Calculate user's rank based on type
    let scoreField = '';
    switch (type) {
      case 'earnings':
        scoreField = 'total_earnings';
        break;
      case 'wins':
        scoreField = 'tournaments_won';
        break;
      default: // overall
        scoreField = 'overall_score';
    }

    const userScore = parseFloat(userStats[scoreField]) || 0;

    // Count how many users have better scores
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT 
          COALESCE(SUM(CASE WHEN tr.placement <= 3 THEN 100 * (4 - tr.placement) ELSE 0 END), 0) as total_earnings,
          COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as tournaments_won,
          (
            COUNT(CASE WHEN tr.placement = 1 THEN 1 END) * 100 +
            COUNT(CASE WHEN tr.placement = 2 THEN 1 END) * 50 +
            COUNT(CASE WHEN tr.placement = 3 THEN 1 END) * 25 +
            COUNT(DISTINCT tp.tournament_id) * 5
          ) as overall_score
        FROM users u
        LEFT JOIN tournament_participants tp ON u.id = tp.user_id
        LEFT JOIN tournaments t ON tp.tournament_id = t.id
        LEFT JOIN tournament_results tr ON tp.id = tr.participant_id
        WHERE u.id != $1 ${whereClause}
        GROUP BY u.id
        HAVING COUNT(DISTINCT tp.tournament_id) > 0
      ) ranked_users
      WHERE ${scoreField} > $${params.length + 1}
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
          profilePictureUrl: userStats.profile_picture_url,
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

// Get leaderboard around user's position (requires authentication)
router.get('/around-me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'overall', game = null, timeframe = 'all', range = 5 } = req.query;

    // First get user's position
    const positionResponse = await new Promise((resolve, reject) => {
      const mockReq = { user: req.user, query: { type, game, timeframe } };
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({ json: (data) => reject({ status: code, ...data }) })
      };
      
      // Call the my-position endpoint logic
      router.stack.find(layer => layer.route.path === '/my-position')
        .route.stack[0].handle(mockReq, mockRes);
    });

    if (!positionResponse.success || !positionResponse.data.position) {
      return res.json({
        success: true,
        data: {
          leaderboard: [],
          userPosition: null,
          message: 'User has not participated in any tournaments yet'
        }
      });
    }

    const userRank = positionResponse.data.position.rank;
    const rangeSize = parseInt(range);
    
    // Calculate the range around user
    const startRank = Math.max(1, userRank - rangeSize);
    const endRank = userRank + rangeSize;
    
    // Get leaderboard data for this range
    const page = Math.ceil(startRank / 20); // Assuming 20 items per page
    const leaderboardResponse = await new Promise((resolve, reject) => {
      const mockReq = { query: { type, game, timeframe, page, limit: endRank - startRank + 1 } };
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({ json: (data) => reject({ status: code, ...data }) })
      };
      
      // Call the main leaderboard endpoint logic
      router.stack.find(layer => layer.route.path === '/')
        .route.stack[0].handle(mockReq, mockRes);
    });

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardResponse.data?.leaderboard || [],
        userPosition: positionResponse.data.position,
        range: {
          start: startRank,
          end: endRank,
          center: userRank
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard around user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard around user',
      message: error.message 
    });
  }
});

module.exports = router;