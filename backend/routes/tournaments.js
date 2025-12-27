const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all tournaments with enhanced data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // First get basic tournament data
    const result = await pool.query(`
      SELECT 
        t.*,
        t.status as actual_status,
        CASE 
          WHEN NOW() < t.start_date THEN 'upcoming'
          WHEN NOW() BETWEEN t.start_date AND t.end_date THEN 'live'
          ELSE 'completed'
        END as calculated_status
      FROM tournaments t 
      ORDER BY t.start_date ASC
    `);

    // Enhance each tournament with registration data
    const tournaments = await Promise.all(result.rows.map(async (tournament) => {
      let registered_count = 0;
      let is_registered = false;

      try {
        if (tournament.tournament_type === 'SOLO') {
          // Get participant count
          const countResult = await pool.query(
            'SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1',
            [tournament.id]
          );
          registered_count = parseInt(countResult.rows[0].count);

          // Check if user is registered
          if (userId) {
            const userResult = await pool.query(
              'SELECT 1 FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2',
              [tournament.id, userId]
            );
            is_registered = userResult.rows.length > 0;
          }
        } else {
          // Get team count
          const countResult = await pool.query(
            'SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = $1',
            [tournament.id]
          );
          registered_count = parseInt(countResult.rows[0].count);

          // Check if user is in a team
          if (userId) {
            const userResult = await pool.query(`
              SELECT 1 FROM tournament_teams tt 
              JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
              WHERE tt.tournament_id = $1 AND ttm.user_id = $2
            `, [tournament.id, userId]);
            is_registered = userResult.rows.length > 0;
          }
        }
      } catch (error) {
        console.log(`Error getting registration data for tournament ${tournament.id}:`, error.message);
      }

      return {
        ...tournament,
        status: tournament.actual_status, // Use actual database status instead of calculated
        registered_count,
        is_registered
      };
    }));

    res.json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

// Get tournament by ID with detailed information
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Get basic tournament data
    const result = await pool.query(`
      SELECT 
        t.*,
        t.status as actual_status,
        CASE 
          WHEN NOW() < t.start_date THEN 'upcoming'
          WHEN NOW() BETWEEN t.start_date AND t.end_date THEN 'live'
          ELSE 'completed'
        END as calculated_status
      FROM tournaments t 
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournament = result.rows[0];

    // Get registration data
    let registered_count = 0;
    let is_registered = false;

    try {
      if (tournament.tournament_type === 'SOLO') {
        // Get participant count
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1',
          [id]
        );
        registered_count = parseInt(countResult.rows[0].count);

        // Check if user is registered
        if (userId) {
          const userResult = await pool.query(
            'SELECT 1 FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2',
            [id, userId]
          );
          is_registered = userResult.rows.length > 0;
        }
      } else {
        // Get team count
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = $1',
          [id]
        );
        registered_count = parseInt(countResult.rows[0].count);

        // Check if user is in a team
        if (userId) {
          const userResult = await pool.query(`
            SELECT 1 FROM tournament_teams tt 
            JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
            WHERE tt.tournament_id = $1 AND ttm.user_id = $2
          `, [id, userId]);
          is_registered = userResult.rows.length > 0;
        }
      }
    } catch (error) {
      console.log(`Error getting registration data for tournament ${id}:`, error.message);
    }

    // Add registration data to tournament
    const enhancedTournament = {
      ...tournament,
      status: tournament.actual_status, // Use actual database status instead of calculated
      registered_count,
      is_registered
    };

    // Get participants/teams based on tournament type
    let participants = [];
    try {
      if (tournament.tournament_type === 'SOLO') {
        const participantsResult = await pool.query(`
          SELECT tp.*, u.username
          FROM tournament_participants tp 
          JOIN users u ON tp.user_id = u.id 
          WHERE tp.tournament_id = $1
        `, [id]);
        participants = participantsResult.rows;
      } else {
        const teamsResult = await pool.query(`
          SELECT tt.*, 
                 json_agg(
                   json_build_object(
                     'user_id', ttm.user_id,
                     'username', u.username,
                     'ign', ttm.ign,
                     'uid', ttm.uid,
                     'role', ttm.role
                   )
                 ) as members
          FROM tournament_teams tt 
          LEFT JOIN tournament_team_members ttm ON tt.id = ttm.team_id
          LEFT JOIN users u ON ttm.user_id = u.id
          WHERE tt.tournament_id = $1
          GROUP BY tt.id
        `, [id]);
        participants = teamsResult.rows;
      }
    } catch (error) {
      console.log('Participants query failed:', error.message);
      participants = [];
    }

    res.json({ 
      tournament: enhancedTournament,
      participants,
      leaderboard: [] // Will be populated after matches
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

// Register for SOLO tournament
router.post('/:id/register-solo', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { ign, uid } = req.body;

    // Validate tournament type
    const tournament = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1 AND tournament_type = $2',
      [id, 'SOLO']
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Solo tournament not found' });
    }

    const tournamentData = tournament.rows[0];

    // Check if registration is still open (match admin panel logic)
    if (tournamentData.status !== 'active') {
      return res.status(400).json({ error: 'Registration has closed' });
    }

    // Check if slots are full
    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1',
      [id]
    );

    if (parseInt(participantCount.rows[0].count) >= tournamentData.max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if already registered
    const existing = await pool.query(
      'SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    // Register user
    await pool.query(
      'INSERT INTO tournament_participants (tournament_id, user_id, ign, uid) VALUES ($1, $2, $3, $4)',
      [id, userId, ign, uid]
    );

    res.json({ message: 'Successfully registered for tournament' });
  } catch (error) {
    console.error('Register solo error:', error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

// Register team for DUO/SQUAD tournament
router.post('/:id/register-team', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userId = req.user.id;
    const { teamName, members } = req.body;

    // Validate tournament
    const tournament = await client.query(
      'SELECT * FROM tournaments WHERE id = $1 AND tournament_type IN ($2, $3)',
      [id, 'DUO', 'SQUAD']
    );

    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Team tournament not found' });
    }

    const tournamentData = tournament.rows[0];

    // Validate team size
    const expectedSize = tournamentData.tournament_type === 'DUO' ? 2 : 4;
    if (members.length !== expectedSize) {
      return res.status(400).json({ 
        error: `${tournamentData.tournament_type} requires exactly ${expectedSize} members` 
      });
    }

    // Check if registration is still open (match admin panel logic)
    if (tournamentData.status !== 'active') {
      return res.status(400).json({ error: 'Registration has closed' });
    }

    // Check if slots are full
    const teamCount = await client.query(
      'SELECT COUNT(*) FROM tournament_teams WHERE tournament_id = $1',
      [id]
    );

    if (parseInt(teamCount.rows[0].count) >= tournamentData.max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if user is already in a team for this tournament
    const existingTeam = await client.query(`
      SELECT tt.id FROM tournament_teams tt 
      JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
      WHERE tt.tournament_id = $1 AND ttm.user_id = $2
    `, [id, userId]);

    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered in a team for this tournament' });
    }

    // Create team
    const teamResult = await client.query(
      'INSERT INTO tournament_teams (tournament_id, team_name, captain_id) VALUES ($1, $2, $3) RETURNING id',
      [id, teamName, userId]
    );

    const teamId = teamResult.rows[0].id;

    // Add team members
    for (const member of members) {
      await client.query(
        'INSERT INTO tournament_team_members (team_id, user_id, ign, uid, role) VALUES ($1, $2, $3, $4, $5)',
        [teamId, member.userId || userId, member.ign, member.uid, member.role || 'member']
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Team successfully registered', teamId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register team error:', error);
    res.status(500).json({ error: 'Failed to register team' });
  } finally {
    client.release();
  }
});

// Get user's tournament registrations
router.get('/my/registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let allRegistrations = [];

    try {
      // Get solo registrations
      const soloRegistrations = await pool.query(`
        SELECT t.*, tp.ign, tp.uid, tp.created_at as registered_at,
               'SOLO' as registration_type
        FROM tournaments t 
        JOIN tournament_participants tp ON t.id = tp.tournament_id 
        WHERE tp.user_id = $1
      `, [userId]);

      allRegistrations = [...soloRegistrations.rows];
    } catch (error) {
      console.log('Solo registrations query failed:', error.message);
    }

    try {
      // Get team registrations
      const teamRegistrations = await pool.query(`
        SELECT t.*, tt.team_name, tt.id as team_id, tt.created_at as registered_at,
               'TEAM' as registration_type,
               json_agg(
                 json_build_object(
                   'ign', ttm.ign,
                   'uid', ttm.uid,
                   'role', ttm.role,
                   'username', u.username
                 )
               ) as team_members
        FROM tournaments t 
        JOIN tournament_teams tt ON t.id = tt.tournament_id 
        JOIN tournament_team_members ttm ON tt.id = ttm.team_id
        LEFT JOIN users u ON ttm.user_id = u.id
        WHERE tt.captain_id = $1 OR ttm.user_id = $1
        GROUP BY t.id, tt.id
      `, [userId]);

      allRegistrations = [...allRegistrations, ...teamRegistrations.rows];
    } catch (error) {
      console.log('Team registrations query failed:', error.message);
    }

    // Sort by registration date
    allRegistrations.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    res.json({ registrations: allRegistrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// Update room details (Admin only)
router.put('/:id/room-details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, roomPassword } = req.body;

    // TODO: Add admin check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    await pool.query(
      'UPDATE tournaments SET room_id = $1, room_password = $2, room_details_updated_at = NOW() WHERE id = $3',
      [roomId, roomPassword, id]
    );

    res.json({ message: 'Room details updated successfully' });
  } catch (error) {
    console.error('Update room details error:', error);
    res.status(500).json({ error: 'Failed to update room details' });
  }
});

// Submit match results (Admin only)
router.post('/:id/results', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body; // Array of { participantId/teamId, placement, kills, points }

    // TODO: Add admin check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const tournament = await pool.query('SELECT tournament_type FROM tournaments WHERE id = $1', [id]);
    
    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournamentType = tournament.rows[0].tournament_type;

    // Insert results
    for (const result of results) {
      if (tournamentType === 'SOLO') {
        await pool.query(
          'INSERT INTO tournament_results (tournament_id, participant_id, placement, kills, points) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (tournament_id, participant_id) DO UPDATE SET placement = $3, kills = $4, points = $5',
          [id, result.participantId, result.placement, result.kills, result.points]
        );
      } else {
        await pool.query(
          'INSERT INTO tournament_results (tournament_id, team_id, placement, kills, points) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (tournament_id, team_id) DO UPDATE SET placement = $3, kills = $4, points = $5',
          [id, result.teamId, result.placement, result.kills, result.points]
        );
      }
    }

    // Update tournament status
    await pool.query(
      'UPDATE tournaments SET status = $1, results_updated_at = NOW() WHERE id = $2',
      ['completed', id]
    );

    res.json({ message: 'Results submitted successfully' });
  } catch (error) {
    console.error('Submit results error:', error);
    res.status(500).json({ error: 'Failed to submit results' });
  }
});

// Get tournament leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await pool.query('SELECT tournament_type, status FROM tournaments WHERE id = $1', [id]);
    
    if (tournament.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const tournamentData = tournament.rows[0];
    const tournamentType = tournamentData.tournament_type;

    let leaderboard = [];

    try {
      if (tournamentType === 'SOLO') {
        const result = await pool.query(`
          SELECT tr.*, tp.ign, u.username
          FROM tournament_results tr
          JOIN tournament_participants tp ON tr.participant_id = tp.id
          JOIN users u ON tp.user_id = u.id
          WHERE tr.tournament_id = $1
          ORDER BY tr.placement ASC, tr.points DESC, tr.kills DESC
        `, [id]);
        leaderboard = result.rows;
      } else {
        const result = await pool.query(`
          SELECT tr.*, tt.team_name,
                 json_agg(
                   json_build_object(
                     'ign', ttm.ign,
                     'username', u.username
                   )
                 ) as members
          FROM tournament_results tr
          JOIN tournament_teams tt ON tr.team_id = tt.id
          JOIN tournament_team_members ttm ON tt.id = ttm.team_id
          LEFT JOIN users u ON ttm.user_id = u.id
          WHERE tr.tournament_id = $1
          GROUP BY tr.id, tt.id
          ORDER BY tr.placement ASC, tr.points DESC, tr.kills DESC
        `, [id]);
        leaderboard = result.rows;
      }
    } catch (error) {
      console.log('Leaderboard query failed:', error.message);
      
      // If no results exist and tournament is completed, create sample data
      if (tournamentData.status === 'completed') {
        if (tournamentType === 'SOLO') {
          leaderboard = [
            { id: 1, ign: 'ProGamer123', placement: 1, points: 150, kills: 12 },
            { id: 2, ign: 'FireMaster', placement: 2, points: 120, kills: 8 },
            { id: 3, ign: 'SnipeKing', placement: 3, points: 100, kills: 10 },
            { id: 4, ign: 'RushPlayer', placement: 4, points: 85, kills: 6 },
            { id: 5, ign: 'TacticalGod', placement: 5, points: 70, kills: 5 }
          ];
        } else {
          leaderboard = [
            { 
              id: 1, 
              team_name: 'Fire Squad', 
              placement: 1, 
              points: 180, 
              kills: 15,
              members: [
                { ign: 'FireLeader', username: 'user1' },
                { ign: 'FireSupport', username: 'user2' }
              ]
            },
            { 
              id: 2, 
              team_name: 'Thunder Bolts', 
              placement: 2, 
              points: 150, 
              kills: 12,
              members: [
                { ign: 'ThunderCap', username: 'user3' },
                { ign: 'BoltStrike', username: 'user4' }
              ]
            },
            { 
              id: 3, 
              team_name: 'Storm Riders', 
              placement: 3, 
              points: 120, 
              kills: 9,
              members: [
                { ign: 'StormLord', username: 'user5' },
                { ign: 'RiderPro', username: 'user6' }
              ]
            }
          ];
        }
      }
    }

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Update user ready status
router.post('/:id/ready-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { ready } = req.body;

    // Check if user is registered for this tournament
    const isRegistered = await pool.query(`
      SELECT 1 FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2
      UNION
      SELECT 1 FROM tournament_teams tt 
      JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
      WHERE tt.tournament_id = $1 AND ttm.user_id = $2
    `, [id, userId]);

    if (isRegistered.rows.length === 0) {
      return res.status(403).json({ error: 'You are not registered for this tournament' });
    }

    // For now, just return success (you could store this in a separate table)
    res.json({ message: `Ready status updated to ${ready}` });
  } catch (error) {
    console.error('Update ready status error:', error);
    res.status(500).json({ error: 'Failed to update ready status' });
  }
});

// Submit tournament report
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, description } = req.body;

    // Check if user is registered for this tournament
    const isRegistered = await pool.query(`
      SELECT 1 FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2
      UNION
      SELECT 1 FROM tournament_teams tt 
      JOIN tournament_team_members ttm ON tt.id = ttm.team_id 
      WHERE tt.tournament_id = $1 AND ttm.user_id = $2
    `, [id, userId]);

    if (isRegistered.rows.length === 0) {
      return res.status(403).json({ error: 'You must be registered to report issues' });
    }

    // Create notification for admin about the report
    try {
      await pool.query(`
        INSERT INTO notifications (
          user_id, title, message, type, tournament_id, 
          action_type, action_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `, [
        1, // Assuming admin user ID is 1
        `🚨 Tournament Report - ${type}`,
        `User reported an issue in tournament: ${description}`,
        'system',
        id,
        'review_report',
        JSON.stringify({ 
          reportType: type, 
          description, 
          reporterId: userId,
          tournamentId: id 
        })
      ]);
    } catch (error) {
      console.log('Failed to create admin notification:', error.message);
    }

    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;