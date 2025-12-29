const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's teams with detailed information
router.get('/my-teams', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get teams with member count and user's role
    const teamsResult = await pool.query(`
      SELECT 
        t.*,
        tm.role,
        COUNT(tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      WHERE tm.user_id = $1
      GROUP BY t.id, tm.role
      ORDER BY t.created_at DESC
    `, [userId]);

    // Get team members for each team
    const teams = [];
    for (const team of teamsResult.rows) {
      const membersResult = await pool.query(`
        SELECT u.id, u.username, tm.role
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = $1
        ORDER BY 
          CASE WHEN tm.role = 'leader' THEN 1 ELSE 2 END,
          tm.joined_at
      `, [team.id]);

      teams.push({
        id: team.id,
        name: team.name,
        game: team.game,
        description: team.description,
        members: parseInt(team.member_count),
        maxMembers: team.max_members || 5,
        role: team.role,
        wins: 0, // Simplified - no match results table
        losses: 0,
        rank: 'Unranked',
        avatar: '🎮',
        teamCode: `T${team.id.toString().padStart(6, '0')}`,
        membersList: membersResult.rows.map(member => ({
          id: member.id,
          name: member.username,
          role: member.role,
          status: 'online'
        })),
        createdAt: team.created_at
      });
    }

    res.json({ teams });
  } catch (error) {
    console.error('Get my teams error:', error);
    res.status(500).json({ error: 'Failed to get teams' });
  }
});

// Get available teams to join
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { game, search } = req.query;
    
    let query = `
      SELECT 
        t.*,
        COUNT(tm.user_id) as member_count,
        'Min. Bronze Rank' as requirements,
        'Unranked' as rank
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.id NOT IN (
        SELECT team_id FROM team_members WHERE user_id = $1
      )
    `;
    
    const params = [userId];
    let paramCount = 1;
    
    if (game) {
      paramCount++;
      query += ` AND t.game = $${paramCount}`;
      params.push(game);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (t.name ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += `
      GROUP BY t.id
      HAVING COUNT(tm.user_id) < t.max_members
      ORDER BY t.created_at DESC
      LIMIT 20
    `;

    const result = await pool.query(query, params);
    
    const teams = result.rows.map(team => ({
      id: team.id,
      name: team.name,
      game: team.game,
      description: team.description,
      members: parseInt(team.member_count),
      maxMembers: team.max_members || 5,
      rank: team.rank,
      requirements: team.requirements,
      avatar: '🎮',
      has_pending_request: false // Simplified - no join requests table
    }));

    res.json({ teams });
  } catch (error) {
    console.error('Get available teams error:', error);
    res.status(500).json({ error: 'Failed to get available teams' });
  }
});

// Create team
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      game, 
      maxMembers = 5
    } = req.body;
    const userId = req.user.id;

    if (!name || !game) {
      return res.status(400).json({ error: 'Team name and game are required' });
    }

    // Check if user is already in any team
    const existingTeamMember = await pool.query(`
      SELECT t.name FROM team_members tm 
      JOIN teams t ON tm.team_id = t.id 
      WHERE tm.user_id = $1
    `, [userId]);

    if (existingTeamMember.rows.length > 0) {
      return res.status(400).json({ 
        error: `You are already a member of "${existingTeamMember.rows[0].name}". Leave your current team before creating a new one.` 
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create team
      const teamResult = await pool.query(
        `INSERT INTO teams (name, description, game, max_members, created_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, description, game, maxMembers, userId]
      );

      const team = teamResult.rows[0];

      // Add creator as team leader
      await pool.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
        [team.id, userId, 'leader']
      );

      await pool.query('COMMIT');

      // Return formatted team data
      const newTeam = {
        id: team.id,
        name: team.name,
        game: team.game,
        description: team.description,
        members: 1,
        maxMembers: maxMembers,
        role: 'leader',
        wins: 0,
        losses: 0,
        rank: 'Unranked',
        avatar: '🎮',
        teamCode: `T${team.id.toString().padStart(6, '0')}`,
        membersList: [{
          id: userId,
          name: req.user.username,
          role: 'leader',
          status: 'online'
        }],
        createdAt: team.created_at
      };

      res.status(201).json({ 
        message: 'Team created successfully',
        team: newTeam
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Join team directly (simplified - no join requests)
router.post('/:teamId/join', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is already in any team
    const existingTeamMember = await pool.query(
      'SELECT t.name FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = $1',
      [userId]
    );

    if (existingTeamMember.rows.length > 0) {
      return res.status(400).json({ 
        error: `You are already a member of "${existingTeamMember.rows[0].name}". Leave your current team first.` 
      });
    }

    // Check if team exists and has space
    const teamResult = await pool.query(`
      SELECT t.*, COUNT(tm.user_id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.id = $1
      GROUP BY t.id
    `, [teamId]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0];
    if (team.member_count >= team.max_members) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Add user to team directly
    await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [teamId, userId, 'member']
    );

    res.json({ message: 'Successfully joined team!' });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// Get user's join requests (simplified - returns empty)
router.get('/my-join-requests', authenticateToken, async (req, res) => {
  try {
    // Simplified - no join requests table
    res.json({ requests: [] });
  } catch (error) {
    console.error('Get my join requests error:', error);
    res.status(500).json({ error: 'Failed to get join requests' });
  }
});

// Leave team
router.delete('/:teamId/leave', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is in the team
    const memberResult = await pool.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'You are not a member of this team' });
    }

    const role = memberResult.rows[0].role;

    // If user is the leader, check if there are other members
    if (role === 'leader') {
      const memberCount = await pool.query(
        'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
        [teamId]
      );

      if (parseInt(memberCount.rows[0].count) > 1) {
        return res.status(400).json({ 
          error: 'Transfer leadership before leaving the team' 
        });
      }

      // If leader is the only member, delete the team
      await pool.query('BEGIN');
      try {
        await pool.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);
        await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
        await pool.query('COMMIT');
        
        return res.json({ message: 'Team deleted successfully' });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } else {
      // Remove member from team
      await pool.query(
        'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );
    }

    res.json({ message: 'Successfully left team' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

// Delete team (leader only)
router.delete('/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can delete teams' });
    }

    // Delete team and all members (cascade)
    await pool.query('BEGIN');
    try {
      await pool.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);
      await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
      await pool.query('COMMIT');

      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Update team (leader only)
router.put('/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { name, description, game } = req.body;

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can edit teams' });
    }

    if (!name || !game) {
      return res.status(400).json({ error: 'Team name and game are required' });
    }

    // Update team
    const updateResult = await pool.query(
      `UPDATE teams 
       SET name = $1, description = $2, game = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, description, game, teamId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ 
      message: 'Team updated successfully',
      team: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Get team details
router.get('/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Get team info
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0];

    // Get team members
    const membersResult = await pool.query(`
      SELECT u.id, u.username, tm.role, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY 
        CASE WHEN tm.role = 'leader' THEN 1 ELSE 2 END,
        tm.joined_at
    `, [teamId]);

    res.json({
      team: {
        ...team,
        members: membersResult.rows
      }
    });
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ error: 'Failed to get team details' });
  }
});

module.exports = router;