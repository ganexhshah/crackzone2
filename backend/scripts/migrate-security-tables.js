require('dotenv').config();
const pool = require('../config/database');

const createSecurityTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating security tables...');
    
    // User sessions table for session management
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_agent TEXT,
        ip_address INET,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, user_agent, ip_address)
      );
    `);
    
    // Security logs table for monitoring
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        source_ip INET,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_agent TEXT,
        endpoint TEXT,
        method VARCHAR(10),
        status_code INTEGER,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Blocked IPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id SERIAL PRIMARY KEY,
        ip_address INET NOT NULL UNIQUE,
        reason TEXT NOT NULL,
        blocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        blocked_by VARCHAR(50) DEFAULT 'system',
        is_permanent BOOLEAN DEFAULT FALSE
      );
    `);
    
    // Failed login attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip_address INET NOT NULL,
        email VARCHAR(255),
        username VARCHAR(50),
        attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT FALSE,
        user_agent TEXT,
        failure_reason TEXT
      );
    `);
    
    // Security alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        source_ip INET,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        details JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by VARCHAR(50)
      );
    `);
    
    // Rate limit tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL, -- IP or user ID
        endpoint VARCHAR(255) NOT NULL,
        request_count INTEGER DEFAULT 1,
        window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_request TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(identifier, endpoint, window_start)
      );
    `);
    
    // Two-factor authentication table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_2fa (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        secret VARCHAR(255) NOT NULL,
        is_enabled BOOLEAN DEFAULT FALSE,
        backup_codes TEXT[], -- Array of backup codes
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // API keys table for secure API access
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        key_name VARCHAR(100) NOT NULL,
        key_hash VARCHAR(255) NOT NULL UNIQUE,
        permissions JSONB DEFAULT '[]',
        last_used TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_security_logs_source_ip ON security_logs(source_ip);
      CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
      CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON blocked_ips(expires_at);
      CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
      CREATE INDEX IF NOT EXISTS idx_login_attempts_attempt_time ON login_attempts(attempt_time);
      CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);
      CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
      CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
      CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
    `);
    
    // Add security-related columns to existing users table if they don't exist
    console.log('Adding security columns to users table...');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ban_reason TEXT,
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS banned_by VARCHAR(50),
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS security_questions JSONB,
      ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS login_notifications BOOLEAN DEFAULT TRUE;
    `);
    
    await client.query('COMMIT');
    console.log('✅ Security tables created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating security tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const main = async () => {
  try {
    await createSecurityTables();
    console.log('🔒 Security database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { createSecurityTables };