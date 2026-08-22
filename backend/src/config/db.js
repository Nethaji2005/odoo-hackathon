'use strict';

const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB Atlas using the URI stored in the
 * MONGODB_URI environment variable.
 *
 * Mongoose 9.x has connection events built in. We log success/error here
 * and let the caller decide whether to abort on failure.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
  console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDB };
