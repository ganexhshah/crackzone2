const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all notifications for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, read, limit } = req.query;

    let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.created_at > NOW() - INTERVAL '1 hour' THEN EXTRACT(EPOCH FROM (NOW() - n.created_at)) || ' minutes ago'
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
      query += ` AND n.read = $${paramIndex}`;
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
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Get notification statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN read = false THEN 1 END) as unread,
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
    res.status(500).json({ error: 'Failed to get notification statistics' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
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

// Mark notification as unread
router.put('/:id/unread', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET read = false, read_at = NULL WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as unread', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification as unread error:', error);
    res.status(500).json({ error: 'Failed to mark notification as unread' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false',
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

// Clear all notifications
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    );

    res.json({ 
      message: 'All notifications cleared', 
      deleted_count: result.rowCount 
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ error: 'Failed to clear all notifications' });
  }
});

// Create notification (internal use)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { user_id, type, title, message, data } = req.body;

    const result = await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [user_id, type, title, message, JSON.stringify(data || {})]);

    res.json({ 
      message: 'Notification created successfully', 
      notification: result.rows[0] 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Handle team invitation actions
router.post('/:id/action', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept', 'decline', 'mark_joined'
    const userId = req.user.id;

    // Get the notification
    const notification = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (notification.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notificationData = notification.rows[0];
    
    // Handle different notification types
    if (notificationData.type === 'team_invitation') {
      // Parse notification data
      const data = JSON.parse(notificationData.data || '{}');

      if (action === 'accept') {
        // Add user to team (this would need to be implemented based on your team structure)
        // For now, just mark as handled
        await pool.query(
          'UPDATE notifications SET data = $1 WHERE id = $2',
          [JSON.stringify({ ...data, status: 'accepted' }), id]
        );
        
        res.json({ message: 'Team invitation accepted' });
      } else if (action === 'decline') {
        await pool.query(
          'UPDATE notifications SET data = $1 WHERE id = $2',
          [JSON.stringify({ ...data, status: 'declined' }), id]
        );
        
        res.json({ message: 'Team invitation declined' });
      } else {
        res.status(400).json({ error: 'Invalid action for team invitation. Use "accept" or "decline"' });
      }
    } else if (notificationData.type === 'tournament_started' && notificationData.action_type === 'join_match') {
      if (action === 'mark_joined') {
        // Update notification to mark user as joined
        await pool.query(
          'UPDATE notifications SET action_taken = $1, action_taken_at = NOW() WHERE id = $2',
          ['joined', id]
        );

        res.json({ message: 'Marked as joined successfully' });
      } else {
        res.status(400).json({ error: 'Invalid action for tournament notification. Use "mark_joined"' });
      }
    } else {
      res.status(400).json({ error: 'This notification does not support actions' });
    }
  } catch (error) {
    console.error('Handle notification action error:', error);
    res.status(500).json({ error: 'Failed to handle notification action' });
  }
});

// Helper function to create notifications (for internal use by other routes)
async function createNotification(userId, type, title, message, data = {}) {
  try {
    const result = await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [userId, type, title, message, JSON.stringify(data)]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper function to create notifications for multiple users
async function createNotificationForUsers(userIds, type, title, message, data = {}) {
  try {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification(userId, type, title, message, data);
      notifications.push(notification);
    }
    return notifications;
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
}

// Export helper functions for use in other routes
router.createNotification = createNotification;
router.createNotificationForUsers = createNotificationForUsers;

module.exports = router;