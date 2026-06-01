const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('No MONGODB_URI provided, starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log(`In-memory MongoDB started at ${uri}`);

    // Auto-seed on first connection
    mongoose.connection.once('connected', async () => {
      const existing = await mongoose.connection.db.listCollections({ name: 'users' }).next();
      if (!existing) {
        console.log('Seeding database...');
        const seedData = require('../seed');
        await seedData();
      }
    });
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
