const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/** Sign a JWT for a given user document */
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    // password field has select:false — must explicitly include it
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
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

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────
// Used for seeding demo users (employee + admin) during the hackathon.
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

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────
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
