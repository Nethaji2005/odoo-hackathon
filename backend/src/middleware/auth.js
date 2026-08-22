'use strict';

/**
 * Authentication Middleware — Dayflow HRMS
 *
 * Verifies the JWT and attaches the decoded payload to req.user.
 *
 * CONTRACT (all modules depend on this):
 *   req.user = { id: String, role: "employee" | "admin" | "hr" }
 *
 * Usage:
 *   router.get('/protected', protect, handler)
 *   router.get('/admin-only', protect, authorize('admin', 'hr'), handler)
 */

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required. Please provide a Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Enforce expected shape
    if (!decoded.id || !decoded.role) {
      return sendError(res, 401, 'Token payload is missing required fields (id, role).');
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired — please log in again.');
    }
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }
};

module.exports = { protect };
