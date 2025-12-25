const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard routes are working!' });
});

// Get dashboard statistics for authenticated user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Initialize default stats
    const stats = {
      tournaments_won: 0,
      total_tournaments: 0,
      win_rate: 0,
      team_count: 0,
      next_tournament: null,
      wallet_balance: 0
    };

    try {
      // Get tournament statistics (handle if tournament_results table doesn't exist)
      const tournamentStats = await pool.query(`
        SELECT 
          COUNT(CASE WHEN tr.placement = 1 THEN 1 END) as tournaments_won,
          COUNT(*) as total_tournaments,
          ROUND(
            (COUNT(CASE WHEN tr.placement <= 3 THEN 1 END)::decimal / NULLIF(COUNT(*), 0)) * 100, 
            1
          ) as win_rate
        FROM tournament_results tr
        LEFT JOIN tournament_participants tp ON tr.participant_id = tp.id
        LEFT JOIN tournament_teams tt ON tr.team_id = tt.id
        WHERE tp.user_id = $1 OR tt.captain_id = $1 OR EXISTS (
          SELECT 1 FROM tournament_team_members ttm 
          WHERE ttm.team_id = tt.id AND ttm.user_id = $1
        )
      `, [userId]);

      if (tournamentStats.rows[0]) {
        stats.tournaments_won = parseInt(tournamentStats.rows[0].tournaments_won || 0);
        stats.total_tournaments = parseInt(tournamentStats.rows[0].total_tournaments || 0);
        stats.win_rate = parseFloat(tournamentStats.rows[0].win_rate || 0);
      }
    } catch (error) {
      console.log('Tournament stats query failed (table may not exist):', error.message);
    }

    try {
      // Get team count (handle if teams table doesn't exist)
      const teamStats = await pool.query(`
        SELECT COUNT(DISTINCT t.id) as team_count
        FROM teams t
        LEFT JOIN team_members tm ON t.id = tm.team_id
        WHERE t.captain_id = $1 OR tm.user_id = $1
      `, [userId]);

      if (teamStats.rows[0]) {
        stats.team_count = parseInt(teamStats.rows[0].team_count || 0);
      }
    } catch (error) {
      console.log('Team stats query failed (table may not exist):', error.message);
    }

    try {
      // Get next tournament
      const nextTournament = await pool.query(`
        SELECT 
          t.title,
          t.start_date,
          EXTRACT(EPOCH FROM (t.start_date - NOW())) / 86400 as days_until
        FROM tournaments t
        LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
        LEFT JOIN tournament_teams tt ON t.id = tt.tournament_id
        LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
        WHERE (tp.user_id = $1 OR tt.captain_id = $1 OR ttm.user_id = $1)
          AND t.start_date > NOW()
        ORDER BY t.start_date ASC
        LIMIT 1
      `, [userId]);

      stats.next_tournament = nextTournament.rows[0] || null;
    } catch (error) {
      console.log('Next tournament query failed:', error.message);
    }

    try {
      // Get wallet balance (handle if wallets table doesn't exist)
      const walletBalance = await pool.query(`
        SELECT balance FROM wallets WHERE user_id = $1
      `, [userId]);

      if (walletBalance.rows[0]) {
        stats.wallet_balance = parseFloat(walletBalance.rows[0].balance || 0);
      }
    } catch (error) {
      console.log('Wallet balance query failed (table may not exist):', error.message);
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Get recent tournaments for authenticated user
router.get('/recent-tournaments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const recentTournaments = await pool.query(`
        SELECT 
          t.id,
          t.title,
          t.game,
          t.prize_pool,
          t.start_date,
          tr.placement,
          tr.kills,
          tr.points,
          CASE 
            WHEN tr.placement = 1 THEN 'Won'
            WHEN tr.placement <= 3 THEN 'Top 3'
            WHEN tr.placement <= 10 THEN 'Top 10'
            ELSE 'Eliminated'
          END as status,
          CASE 
            WHEN t.tournament_type = 'SOLO' THEN tp.ign
            ELSE tt.team_name
          END as participant_name
        FROM tournaments t
        LEFT JOIN tournament_results tr ON t.id = tr.tournament_id
        LEFT JOIN tournament_participants tp ON tr.participant_id = tp.id
        LEFT JOIN tournament_teams tt ON tr.team_id = tt.id
        LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
        WHERE (tp.user_id = $1 OR tt.captain_id = $1 OR ttm.user_id = $1)
          AND tr.id IS NOT NULL
          AND t.status = 'completed'
        ORDER BY t.start_date DESC
        LIMIT 5
      `, [userId]);

      res.json({ tournaments: recentTournaments.rows });
    } catch (error) {
      console.log('Recent tournaments query failed:', error.message);
      // Return empty array if tables don't exist
      res.json({ tournaments: [] });
    }
  } catch (error) {
    console.error('Get recent tournaments error:', error);
    res.status(500).json({ error: 'Failed to get recent tournaments' });
  }
});

// Get upcoming tournaments
router.get('/upcoming-tournaments', async (req, res) => {
  try {
    const upcomingTournaments = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.game,
        t.tournament_type,
        t.entry_fee,
        t.prize_pool,
        t.max_participants,
        t.start_date,
        t.registration_end,
        CASE 
          WHEN t.tournament_type = 'SOLO' THEN 
            (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id)
          ELSE 
            (SELECT COUNT(*) FROM tournament_teams tt WHERE tt.tournament_id = t.id)
        END as registered_count,
        CASE 
          WHEN NOW() < t.registration_end AND (
            CASE 
              WHEN t.tournament_type = 'SOLO' THEN 
                (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id)
              ELSE 
                (SELECT COUNT(*) FROM tournament_teams tt WHERE tt.tournament_id = t.id)
            END
          ) < t.max_participants THEN true
          ELSE false
        END as registration_open
      FROM tournaments t
      WHERE t.status = 'upcoming' AND t.start_date > NOW()
      ORDER BY t.start_date ASC
      LIMIT 6
    `);

    res.json({ tournaments: upcomingTournaments.rows });
  } catch (error) {
    console.error('Get upcoming tournaments error:', error);
    res.status(500).json({ error: 'Failed to get upcoming tournaments' });
  }
});

// Get user's active registrations
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let allRegistrations = [];

    try {
      // Get solo registrations
      const soloRegistrations = await pool.query(`
        SELECT 
          t.id,
          t.title,
          t.game,
          t.tournament_type,
          t.start_date,
          t.room_id,
          t.room_password,
          'SOLO' as registration_type,
          tp.ign as participant_name
        FROM tournaments t 
        JOIN tournament_participants tp ON t.id = tp.tournament_id 
        WHERE tp.user_id = $1 AND t.status IN ('upcoming', 'live')
      `, [userId]);

      allRegistrations = [...soloRegistrations.rows];
    } catch (error) {
      console.log('Solo registrations query failed:', error.message);
    }

    try {
      // Get team registrations
      const teamRegistrations = await pool.query(`
        SELECT 
          t.id,
          t.title,
          t.game,
          t.tournament_type,
          t.start_date,
          t.room_id,
          t.room_password,
          'TEAM' as registration_type,
          tt.team_name as participant_name
        FROM tournaments t 
        JOIN tournament_teams tt ON t.id = tt.tournament_id 
        LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
        WHERE (tt.captain_id = $1 OR ttm.user_id = $1) AND t.status IN ('upcoming', 'live')
        GROUP BY t.id, tt.id
      `, [userId]);

      allRegistrations = [...allRegistrations, ...teamRegistrations.rows];
    } catch (error) {
      console.log('Team registrations query failed:', error.message);
    }

    // Sort by start date
    allRegistrations.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    res.json({ registrations: allRegistrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let activities = [];

    try {
      // Try to get tournament registration activities
      const tournamentActivities = await pool.query(`
        SELECT 
          'tournament_registration' as type,
          t.title as description,
          tp.created_at as timestamp,
          'Registered for tournament' as action
        FROM tournament_participants tp
        JOIN tournaments t ON tp.tournament_id = t.id
        WHERE tp.user_id = $1
        ORDER BY tp.created_at DESC
        LIMIT 5
      `, [userId]);

      activities = [...activities, ...tournamentActivities.rows];
    } catch (error) {
      console.log('Tournament activities query failed:', error.message);
    }

    try {
      // Try to get team activities
      const teamActivities = await pool.query(`
        SELECT 
          'team_registration' as type,
          CONCAT('Joined team for ', t.title) as description,
          tt.created_at as timestamp,
          'Team registration' as action
        FROM tournament_teams tt
        JOIN tournaments t ON tt.tournament_id = t.id
        LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
        WHERE tt.captain_id = $1 OR ttm.user_id = $1
        ORDER BY tt.created_at DESC
        LIMIT 5
      `, [userId]);

      activities = [...activities, ...teamActivities.rows];
    } catch (error) {
      console.log('Team activities query failed:', error.message);
    }

    try {
      // Try to get wallet activities
      const walletActivities = await pool.query(`
        SELECT 
          'wallet_transaction' as type,
          CASE 
            WHEN tr.type = 'credit' THEN CONCAT('Added ₹', tr.amount, ' to wallet')
            ELSE CONCAT('Spent ₹', tr.amount, ' from wallet')
          END as description,
          tr.created_at as timestamp,
          'Wallet activity' as action
        FROM transactions tr
        WHERE tr.user_id = $1
        ORDER BY tr.created_at DESC
        LIMIT 5
      `, [userId]);

      activities = [...activities, ...walletActivities.rows];
    } catch (error) {
      console.log('Wallet activities query failed:', error.message);
    }

    // Sort all activities by timestamp and limit to 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    activities = activities.slice(0, 10);

    res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

module.exports = router;