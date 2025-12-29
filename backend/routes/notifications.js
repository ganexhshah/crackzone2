const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all notifications for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, read, limit } = req.query;

    // Check if notifications table exists
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'notifications'
        );
      `);

      if (!tableExists.rows[0].exists) {
        // Return empty notifications if table doesn't exist
        return res.json({ notifications: [] });
      }
    } catch (tableError) {
      console.log('Table check failed, returning empty notifications:', tableError.message);
      return res.json({ notifications: [] });
    }

    let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.created_at > NOW() - INTERVAL '1 hour' THEN EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 60 || ' minutes ago'
          WHEN n.created_at > NOW() - INTERVAL '1 day' THEN EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 3600 || ' hours ago'
          ELSE EXTRACT(EPOCH FROM (NOW() - n.created_at)) / 86400 || ' days ago'
        END as time_ago
      FROM notifications n 
      WHERE n.user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    // Add type filter
    if (type && type !== 'all') {
      query += ` AND n.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Add read status filter
    if (read !== undefined) {
      query += ` AND n.is_read = $${paramIndex}`;
      params.push(read === 'true');
      paramIndex++;
    }

    query += ` ORDER BY n.created_at DESC`;

    // Add limit if specified
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);

    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json({ notifications: [] });
  }
});

// Get notification statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if notifications table exists
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'notifications'
        );
      `);

      if (!tableExists.rows[0].exists) {
        // Return default stats if table doesn't exist
        return res.json({ 
          stats: {
            total: 0,
            unread: 0,
            tournament: 0,
            team: 0,
            wallet: 0,
            system: 0
          }
        });
      }
    } catch (tableError) {
      console.log('Table check failed, returning default stats:', tableError.message);
      return res.json({ 
        stats: {
          total: 0,
          unread: 0,
          tournament: 0,
          team: 0,
          wallet: 0,
          system: 0
        }
      });
    }

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'tournament' THEN 1 END) as tournament,
        COUNT(CASE WHEN type = 'team' THEN 1 END) as team,
        COUNT(CASE WHEN type = 'wallet' THEN 1 END) as wallet,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system
      FROM notifications 
      WHERE user_id = $1
    `, [userId]);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('Get notification stats error:', error);
    // Return default stats instead of error
    res.json({ 
      stats: {
        total: 0,
        unread: 0,
        tournament: 0,
        team: 0,
        wallet: 0,
        system: 0
      }
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ 
      message: 'All notifications marked as read', 
      updated_count: result.rowCount 
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (internal use)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { user_id, type, title, message } = req.body;

    const result = await pool.query(`
      INSERT INTO notifications (user_id, type, title, message) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [user_id, type, title, message]);

    res.json({ 
      message: 'Notification created successfully', 
      notification: result.rows[0] 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;