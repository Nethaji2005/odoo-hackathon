'use strict';

const dns = require('dns');
const mongoose = require('mongoose');

// Use public DNS servers because the system resolver is refusing
// MongoDB Atlas SRV DNS queries on this machine.
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Establishes a connection to MongoDB Atlas using the URI stored in the
 * MONGODB_URI environment variable.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDB };