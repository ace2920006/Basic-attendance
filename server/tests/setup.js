const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_test_db';
process.env.JWT_SECRET = 'test_jwt_super_secret_key_2026';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_2026';

beforeAll(async () => {
  try {
    // Try connecting to local MongoDB server if running
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('🍃 Connected to local MongoDB test database');
  } catch (err) {
    // Fallback to MongoMemoryServer
    console.log('⚡ Local MongoDB not found, starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.6'
      }
    });
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
  }
});

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
