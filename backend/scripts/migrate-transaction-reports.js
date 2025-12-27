const pool = require('../config/database');

async function createTransactionReportsTable() {
  try {
    console.log('Creating transaction_reports table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_reports (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `);

    console.log('✅ transaction_reports table created successfully');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transaction_reports_transaction_id 
      ON transaction_reports(transaction_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transaction_reports_user_id 
      ON transaction_reports(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transaction_reports_status 
      ON transaction_reports(status)
    `);

    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Error creating transaction_reports table:', error);
    throw error;
  }
}

async function main() {
  try {
    await createTransactionReportsTable();
    console.log('🎉 Transaction reports migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTransactionReportsTable };