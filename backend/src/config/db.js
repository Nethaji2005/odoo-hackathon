'use strict';

const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using MONGODB_URI from environment variables.
 * Validates that the URI is set, logs success, and exits the process on failure.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('✖  MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✔  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`✖  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { connectDB };
