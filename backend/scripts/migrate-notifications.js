require('dotenv').config();
const pool = require('../config/database');

async function migrateNotifications() {
  const client = await pool.connect();
  
  try {
    console.log('Starting notifications migration...');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('tournament', 'team', 'team_invitation', 'wallet', 'system', 'match', 'achievement')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `);

    // Insert sample notifications for existing users
    const users = await client.query('SELECT id FROM users LIMIT 3');
    
    if (users.rows.length > 0) {
      const sampleNotifications = [
        {
          type: 'tournament',
          title: 'Tournament Starting Soon',
          message: 'FreeFire Championship starts in 30 minutes. Get ready!',
          data: { tournament_id: 1 }
        },
        {
          type: 'team_invitation',
          title: 'Team Invitation',
          message: 'Elite Gamers invited you to join their team',
          data: { team_id: 1, team_name: 'Elite Gamers' }
        },
        {
          type: 'wallet',
          title: 'Prize Money Received',
          message: 'You received ₹5,000 for winning FreeFire Championship',
          data: { amount: 5000, tournament_id: 1 }
        },
        {
          type: 'tournament',
          title: 'Tournament Result',
          message: 'Congratulations! You finished 2nd in PUBG Squad Battle',
          data: { tournament_id: 2, placement: 2 }
        },
        {
          type: 'system',
          title: 'Maintenance Notice',
          message: 'Scheduled maintenance on Dec 26, 2024 from 2:00 AM to 4:00 AM',
          data: { maintenance_start: '2024-12-26T02:00:00Z', maintenance_end: '2024-12-26T04:00:00Z' }
        },
        {
          type: 'team',
          title: 'Team Match Reminder',
          message: 'Fire Squad has a match scheduled for tomorrow at 8 PM',
          data: { team_id: 1, match_time: '2024-12-26T20:00:00Z' }
        }
      ];

      for (const user of users.rows) {
        for (const notification of sampleNotifications) {
          await client.query(`
            INSERT INTO notifications (user_id, type, title, message, data, read, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 72)} hours')
          `, [
            user.id,
            notification.type,
            notification.title,
            notification.message,
            JSON.stringify(notification.data),
            Math.random() > 0.6 // 40% chance of being unread
          ]);
        }
      }
      
      console.log(`Created sample notifications for ${users.rows.length} users`);
    }

    console.log('Notifications migration completed successfully!');
  } catch (error) {
    console.error('Notifications migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateNotifications()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateNotifications;