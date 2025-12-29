const pool = require('../config/database');

// Middleware to check if required tables exist
const checkTablesExist = (requiredTables) => {
  return async (req, res, next) => {
    try {
      for (const tableName of requiredTables) {
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);

        if (!tableExists.rows[0].exists) {
          console.log(`Table ${tableName} does not exist, initializing database...`);
          
          // Auto-initialize database if tables are missing
          const { autoInitializeDatabase } = require('../scripts/auto-initialize-db');
          await autoInitializeDatabase();
          break;
        }
      }
      next();
    } catch (error) {
      console.error('Table check error:', error);
      next(); // Continue anyway
    }
  };
};

module.exports = { checkTablesExist };