'use strict';

const express = require('express');
const authRoutes = require('./routes/auth.routes');

const app = express();

// ── Global middleware ───────────────────────────────────────────────────────

/** Parse incoming JSON request bodies. */
app.use(express.json());

/** Parse URL-encoded form bodies (for completeness). */
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/health
 * @desc    Lightweight liveness probe (no DB dependency)
 * @access  Public
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Dayflow API is running' });
});

// ── Feature routes ──────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Express 5 forwards async errors automatically; this catches everything else.

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, message });
});

module.exports = app;
