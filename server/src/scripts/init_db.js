const fs = require('fs');
const path = require('path');
const { getDbConnection } = require('../config/db');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema and seed data...');
    const db = await getDbConnection();

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    await db.exec(schemaSql);
    console.log('✅ Database schema created successfully.');

    // Check if users exist before seeding
    const userCount = await db.get('SELECT COUNT(*) as count FROM Users');
    if (userCount.count === 0) {
      await db.exec(seedSql);
      console.log('✅ Seed data inserted successfully.');
    } else {
      console.log('ℹ️ Seed data skipped (users already exist).');
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
