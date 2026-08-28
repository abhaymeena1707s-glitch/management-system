const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const defaultDb = process.env.NODE_ENV === 'test' ? 'library_management_test_db' : 'library_management_db';
    const mongoUri = process.env.MONGO_URI || `mongodb://localhost:27017/${defaultDb}`;
    
    // Configure mongoose settings
    mongoose.set('strictQuery', false);

    let conn;
    try {
      conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] Connected to MongoDB host: ${conn.connection.host}`);
    } catch (err) {
      console.warn(`[MongoDB] Could not connect to standard URI (${mongoUri}): ${err.message}`);
      console.log(`[MongoDB] Initializing in-memory Mongo database for seamless execution...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to In-Memory Database at ${uri}`);
    }

    // Auto seed default data if database has no users
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 No users found in database. Auto-seeding initial data...');
      const seedData = require('../seeders/seed');
      await seedData({ exitProcess: false, shouldConnect: false });
    }

    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
