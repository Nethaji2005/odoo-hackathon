'use strict';

const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware.
 *
 * Expects an Authorization header of the form:
 *   Authorization: Bearer <token>
 *
 * On success: attaches the decoded payload to req.user and calls next().
 * On failure: responds with 401 (missing/malformed token) or 401 (invalid/expired).
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: no token provided',
    });
  }

  const token = authHeader.slice(7); // remove "Bearer " prefix

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired — please log in again',
      });
    }

    // JsonWebTokenError, NotBeforeError, or any other JWT problem
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
}

module.exports = { authenticate };
