const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const dbPath = path.resolve(__dirname, '../../database/attendance.db');

let dbInstance = null;

async function getDbConnection() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await dbInstance.run('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

module.exports = { getDbConnection, dbPath };
