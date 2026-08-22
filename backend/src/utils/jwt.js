'use strict';

const jwt = require('jsonwebtoken');

/**
 * Signs a JWT access token.
 * @param {Object} payload - Data to embed (userId, role, etc.).
 * @returns {string} Signed JWT string.
 */
function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies a JWT access token.
 * @param {string} token - The JWT string to verify.
 * @returns {Object} Decoded payload if valid.
 * @throws {JsonWebTokenError|TokenExpiredError} If invalid or expired.
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
