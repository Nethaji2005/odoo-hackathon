'use strict';

const bcrypt = require('bcrypt');

/** Number of salt rounds for bcrypt. Increases cost exponentially. */
const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password.
 * @param {string} plainPassword
 * @returns {Promise<string>} Bcrypt hash.
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
