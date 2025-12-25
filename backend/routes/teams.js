const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to cancel all pending join requests for a user
const cancelUserPendingRequests = async (userId) => {
  await pool.query(
    'UPDATE team_join_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND status = $3',
    ['cancelled', userId, 'pending']
  );
};

// Get user's teams with detailed information
router.get('/my-teams', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get teams with member count and user's role
    const teamsResult = await pool.query(`
      SELECT 
        t.*,
        tm.role,
        COUNT(tm2.user_id) as member_count,
        COALESCE(ts.wins, 0) as wins,
        COALESCE(ts.losses, 0) as losses,
        COALESCE(ts.rank, 'Unranked') as rank
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      LEFT JOIN (
        SELECT 
          COALESCE(m.team1_id, m.team2_id) as team_id,
          COUNT(CASE WHEN m.winner_team_id = COALESCE(m.team1_id, m.team2_id) THEN 1 END) as wins,
          COUNT(CASE WHEN m.winner_team_id != COALESCE(m.team1_id, m.team2_id) AND m.winner_team_id IS NOT NULL THEN 1 END) as losses,
          'Gold' as rank
        FROM matches m
        WHERE m.status = 'completed' AND (m.team1_id IS NOT NULL OR m.team2_id IS NOT NULL)
        GROUP BY COALESCE(m.team1_id, m.team2_id)
      ) ts ON t.id = ts.team_id
      WHERE tm.user_id = $1
      GROUP BY t.id, tm.role, ts.wins, ts.losses, ts.rank
      ORDER BY t.created_at DESC
    `, [userId]);

    // Get team members for each team
    const teams = [];
    for (const team of teamsResult.rows) {
      const membersResult = await pool.query(`
        SELECT u.id, u.username, tm.role, 'online' as status
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
        maxMembers: 4, // Default max members
        role: team.role,
        wins: parseInt(team.wins),
        losses: parseInt(team.losses),
        rank: team.rank,
        avatar: '🎮', // Default avatar
        teamCode: `T${team.id.toString().padStart(6, '0')}`,
        membersList: membersResult.rows.map(member => ({
          id: member.id,
          name: member.username,
          role: member.role,
          status: member.status
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
        COALESCE(ts.rank, 'Unranked') as rank,
        EXISTS(
          SELECT 1 FROM team_join_requests tjr 
          WHERE tjr.team_id = t.id AND tjr.user_id = $1 AND tjr.status = 'pending'
        ) as has_pending_request
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN (
        SELECT 
          COALESCE(m.team1_id, m.team2_id) as team_id,
          'Gold' as rank
        FROM matches m
        WHERE m.status = 'completed' AND (m.team1_id IS NOT NULL OR m.team2_id IS NOT NULL)
        GROUP BY COALESCE(m.team1_id, m.team2_id)
      ) ts ON t.id = ts.team_id
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
      GROUP BY t.id, ts.rank
      HAVING COUNT(tm.user_id) < 4
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
      maxMembers: 4,
      rank: team.rank,
      requirements: team.requirements,
      avatar: '🎮',
      has_pending_request: team.has_pending_request
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
      requirements, 
      maxMembers = 4, 
      isPrivate = false, 
      avatar = '🎮' 
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

    // Check if user has any pending join requests
    const existingPendingRequest = await pool.query(`
      SELECT t.name FROM team_join_requests tjr 
      JOIN teams t ON tjr.team_id = t.id 
      WHERE tjr.user_id = $1 AND tjr.status = 'pending'
    `, [userId]);

    if (existingPendingRequest.rows.length > 0) {
      return res.status(400).json({ 
        error: `You have a pending join request for "${existingPendingRequest.rows[0].name}". Cancel it before creating a new team.` 
      });
    }

    // Check if user has already created a team that still exists (one team creation per user limit)
    const existingCreatedTeam = await pool.query(`
      SELECT t.name FROM teams t 
      WHERE t.created_by = $1
    `, [userId]);

    if (existingCreatedTeam.rows.length > 0) {
      return res.status(400).json({ 
        error: `You have already created a team "${existingCreatedTeam.rows[0].name}". Delete your existing team before creating a new one.` 
      });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create team
      const teamResult = await pool.query(
        `INSERT INTO teams (name, description, game, created_by) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, game, userId]
      );

      const team = teamResult.rows[0];

      // Add creator as team leader
      await pool.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
        [team.id, userId, 'leader']
      );

      // Cancel all pending join requests for this user since they now have a team
      await cancelUserPendingRequests(userId);

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
        avatar: avatar,
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

// Request to join team
router.post('/:teamId/join', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { message = '' } = req.body;

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

    // Check if user has any pending join requests
    const existingPendingRequest = await pool.query(`
      SELECT t.name FROM team_join_requests tjr 
      JOIN teams t ON tjr.team_id = t.id 
      WHERE tjr.user_id = $1 AND tjr.status = 'pending'
    `, [userId]);

    if (existingPendingRequest.rows.length > 0) {
      return res.status(400).json({ 
        error: `You already have a pending join request for "${existingPendingRequest.rows[0].name}". Wait for approval or cancel it first.` 
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
    if (team.member_count >= 4) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if user is already in this specific team (redundant but safe)
    const existingMember = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Create join request
    await pool.query(
      'INSERT INTO team_join_requests (team_id, user_id, message, status) VALUES ($1, $2, $3, $4)',
      [teamId, userId, message, 'pending']
    );

    res.json({ message: 'Join request sent successfully. Wait for team leader approval.' });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ error: 'Failed to send join request' });
  }
});

// Get join requests for a team (leader only)
router.get('/:teamId/join-requests', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can view join requests' });
    }

    // Get pending join requests
    const requestsResult = await pool.query(`
      SELECT 
        tjr.id,
        tjr.message,
        tjr.created_at,
        u.id as user_id,
        u.username,
        u.avatar_url
      FROM team_join_requests tjr
      JOIN users u ON tjr.user_id = u.id
      WHERE tjr.team_id = $1 AND tjr.status = 'pending'
      ORDER BY tjr.created_at DESC
    `, [teamId]);

    res.json({ requests: requestsResult.rows });
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({ error: 'Failed to get join requests' });
  }
});

// Approve or reject join request (leader only)
router.post('/:teamId/join-requests/:requestId/:action', authenticateToken, async (req, res) => {
  try {
    const { teamId, requestId, action } = req.params;
    const userId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use approve or reject.' });
    }

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can manage join requests' });
    }

    // Get the join request
    const requestResult = await pool.query(
      'SELECT * FROM team_join_requests WHERE id = $1 AND team_id = $2 AND status = $3',
      [requestId, teamId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found or already processed' });
    }

    const joinRequest = requestResult.rows[0];

    await pool.query('BEGIN');

    try {
      if (action === 'approve') {
        // Check if user is already in any team (they might have joined another team while request was pending)
        const existingTeamMember = await pool.query(
          'SELECT t.name FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = $1',
          [joinRequest.user_id]
        );

        if (existingTeamMember.rows.length > 0) {
          await pool.query('ROLLBACK');
          // Update request status to rejected since user is no longer available
          await pool.query(
            'UPDATE team_join_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['rejected', requestId]
          );
          return res.status(400).json({ 
            error: `User is already a member of "${existingTeamMember.rows[0].name}". Request automatically rejected.` 
          });
        }

        // Check if team still has space
        const teamResult = await pool.query(`
          SELECT COUNT(tm.user_id) as member_count
          FROM team_members tm
          WHERE tm.team_id = $1
        `, [teamId]);

        if (parseInt(teamResult.rows[0].member_count) >= 4) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: 'Team is now full' });
        }

        // Add user to team
        await pool.query(
          'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
          [teamId, joinRequest.user_id, 'member']
        );

        // Cancel all other pending join requests for this user
        await cancelUserPendingRequests(joinRequest.user_id);

        // Update this request status to approved
        await pool.query(
          'UPDATE team_join_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['approved', requestId]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Join request approved successfully' });
      } else {
        // Reject request
        await pool.query(
          'UPDATE team_join_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['rejected', requestId]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Join request rejected' });
      }
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Manage join request error:', error);
    res.status(500).json({ error: 'Failed to process join request' });
  }
});

// Get user's own pending join requests
router.get('/my-join-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const requestsResult = await pool.query(`
      SELECT 
        tjr.id,
        tjr.message,
        tjr.created_at,
        t.id as team_id,
        t.name as team_name,
        t.game
      FROM team_join_requests tjr
      JOIN teams t ON tjr.team_id = t.id
      WHERE tjr.user_id = $1 AND tjr.status = 'pending'
      ORDER BY tjr.created_at DESC
    `, [userId]);

    res.json({ requests: requestsResult.rows });
  } catch (error) {
    console.error('Get my join requests error:', error);
    res.status(500).json({ error: 'Failed to get join requests' });
  }
});

// Cancel own join request
router.delete('/join-requests/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Check if the request belongs to the user and is pending
    const requestResult = await pool.query(
      'SELECT * FROM team_join_requests WHERE id = $1 AND user_id = $2 AND status = $3',
      [requestId, userId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found or already processed' });
    }

    // Cancel the request
    await pool.query(
      'UPDATE team_join_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', requestId]
    );

    res.json({ message: 'Join request cancelled successfully' });
  } catch (error) {
    console.error('Cancel join request error:', error);
    res.status(500).json({ error: 'Failed to cancel join request' });
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
    const { name, description, game, requirements, maxMembers, avatar } = req.body;

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

// Search users for invitation
router.get('/:teamId/search-users', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { search = '' } = req.query;

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can search users' });
    }

    // Get users not in this team and not already invited
    let query = `
      SELECT u.id, u.username, u.avatar_url
      FROM users u
      WHERE u.id != $1
      AND u.id NOT IN (
        SELECT tm.user_id FROM team_members tm WHERE tm.team_id = $2
      )
      AND u.id NOT IN (
        SELECT ti.invited_user_id FROM team_invitations ti 
        WHERE ti.team_id = $2 AND ti.status = 'pending'
      )
    `;
    
    const params = [userId, teamId];
    
    if (search.trim()) {
      query += ` AND u.username ILIKE $3`;
      params.push(`%${search.trim()}%`);
    }
    
    query += ` ORDER BY u.username LIMIT 10`;

    const result = await pool.query(query, params);
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Invite user to team (leader only)
router.post('/:teamId/invite', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { username, userId: invitedUserId } = req.body;

    if (!username && !invitedUserId) {
      return res.status(400).json({ error: 'Username or user ID is required' });
    }

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can invite members' });
    }

    // Check if team has space
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
    if (team.member_count >= 4) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Find user by username or ID
    let userResult;
    if (invitedUserId) {
      userResult = await pool.query(
        'SELECT id, username FROM users WHERE id = $1',
        [invitedUserId]
      );
    } else {
      userResult = await pool.query(
        'SELECT id, username FROM users WHERE username = $1',
        [username]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const invitedUser = userResult.rows[0];

    // Check if user is already in any team
    const existingTeamMember = await pool.query(
      'SELECT t.name FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = $1',
      [invitedUser.id]
    );

    if (existingTeamMember.rows.length > 0) {
      return res.status(400).json({ 
        error: `${invitedUser.username} is already a member of "${existingTeamMember.rows[0].name}"` 
      });
    }

    // Check if user has any pending join requests or invitations
    const existingPendingRequest = await pool.query(`
      SELECT t.name FROM team_join_requests tjr 
      JOIN teams t ON tjr.team_id = t.id 
      WHERE tjr.user_id = $1 AND tjr.status = 'pending'
    `, [invitedUser.id]);

    if (existingPendingRequest.rows.length > 0) {
      return res.status(400).json({ 
        error: `${invitedUser.username} already has a pending join request for "${existingPendingRequest.rows[0].name}"` 
      });
    }

    // Check if user is already in this team
    const existingMember = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, invitedUser.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    // Check if invitation already exists
    const existingInvite = await pool.query(
      'SELECT id FROM team_invitations WHERE team_id = $1 AND invited_user_id = $2 AND status = $3',
      [teamId, invitedUser.id, 'pending']
    );

    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'Invitation already sent to this user' });
    }

    // Create invitation
    await pool.query(
      `INSERT INTO team_invitations (team_id, invited_user_id, invited_by_user_id, status) 
       VALUES ($1, $2, $3, $4)`,
      [teamId, invitedUser.id, userId, 'pending']
    );

    res.json({ 
      message: `Invitation sent to ${userResult.rows[0].username}`,
      invitedUser: {
        id: invitedUser.id,
        username: invitedUser.username
      }
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Remove member from team (leader only)
router.delete('/:teamId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.id;

    // Check if user is the team leader
    const leaderCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only team leaders can remove members' });
    }

    // Check if member exists and is not the leader
    const memberCheck = await pool.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, memberId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this team' });
    }

    if (memberCheck.rows[0].role === 'leader') {
      return res.status(400).json({ error: 'Cannot remove team leader' });
    }

    // Remove member
    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, memberId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
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