'use strict';

// Load .env file BEFORE importing any module that reads process.env
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀  Dayflow API listening on port ${PORT}`);
      console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
