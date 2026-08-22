'use strict';

/**
 * Auth Controller — unified implementation for Dayflow HRMS.
 *
 * JWT payload contract:
 *   { id: String, role: String }   (id = MongoDB _id of the User document)
 *
 * All downstream middleware (auth.js, attendanceController, leaveController,
 * employeeController, payrollController) reads req.user.id and req.user.role.
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return sendError(res, 409, 'A user with this email already exists.');
    }

    // User.pre('save') handles bcrypt hashing automatically
    const user = await User.create({ name, email, password, role, department });
    const token = signToken(user);

    return sendSuccess(res, 201, 'Registration successful.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('[auth/register]', err);
    return sendError(res, 500, 'Server error. Please try again.');
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    // Must explicitly select password field (select: false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been disabled.');
    }

    const token = signToken(user);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return sendError(res, 500, 'Server error. Please try again.');
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'User fetched.', { user });
  } catch (err) {
    console.error('[auth/me]', err);
    return sendError(res, 500, 'Server error.');
  }
};

module.exports = { login, register, getMe };
