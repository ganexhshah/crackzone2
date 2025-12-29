const pool = require('../config/database');

async function checkTables() {
  try {
    console.log('Checking existing tables...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Existing tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check user count
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\nCurrent users: ${userCount.rows[0].count}`);
    
    // Create basic indexes for existing tables
    console.log('\nCreating basic performance indexes...');
    
    const basicIndexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_google_id ON users(google_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_profile_complete ON users(is_profile_complete)',
    ];
    
    for (const indexQuery of basicIndexes) {
      try {
        await pool.query(indexQuery);
        console.log(`✅ Created: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`✅ Already exists: ${indexQuery.split(' ')[5]}`);
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Basic optimization completed!');
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();