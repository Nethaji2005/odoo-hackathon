'use strict';

const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Formats a Zod error into a flat array of human-readable messages.
 * @param {import('zod').ZodError} zodError
 * @returns {string[]}
 */
function formatZodErrors(zodError) {
  return zodError.errors.map((e) => e.message);
}

/**
 * Builds a consistent success response envelope.
 */
function success(data) {
  return { success: true, ...data };
}

/**
 * Builds a consistent error response envelope.
 */
function fail(message, errors = undefined) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return body;
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Request body: { name, email, password, role? }
 * Success  201: { success, message, data: { user, token } }
 * Error    400: validation failure or duplicate email
 */
async function register(req, res) {
  // 1. Validate input
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(fail('Validation failed', formatZodErrors(parsed.error)));
  }

  const { name, email, password, role } = parsed.data;

  // 2. Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(400)
      .json(fail('An account with this email already exists'));
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Persist user
  const user = await User.create({ name, email, password: hashedPassword, role });

  // 5. Issue token (payload carries stable, non-sensitive identifiers only)
  const token = signToken({ userId: user._id, role: user.role });

  // 6. Respond — user.toJSON() strips the password hash
  return res.status(201).json(
    success({
      message: 'Registration successful',
      data: { user, token },
    })
  );
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────

/**
 * Authenticate an existing user.
 *
 * Request body: { email, password }
 * Success  200: { success, message, data: { user, token } }
 * Error    400: validation failure
 * Error    401: invalid credentials
 * Error    403: account disabled
 */
async function login(req, res) {
  // 1. Validate input
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(fail('Validation failed', formatZodErrors(parsed.error)));
  }

  const { email, password } = parsed.data;

  // 2. Find user — must explicitly request password field (select: false)
  const user = await User.findByEmailWithPassword(email);

  // 3. Verify credentials — use a constant-time compare regardless of whether
  //    user exists to prevent user-enumeration via timing differences.
  const passwordMatch = user
    ? await comparePassword(password, user.password)
    : false;

  if (!user || !passwordMatch) {
    return res.status(401).json(fail('Invalid email or password'));
  }

  // 4. Reject disabled accounts
  if (!user.isActive) {
    return res.status(403).json(fail('Your account has been disabled'));
  }

  // 5. Issue token
  const token = signToken({ userId: user._id, role: user.role });

  // 6. Strip password before sending (toJSON handles it, but be explicit)
  const safeUser = user.toJSON();

  return res.status(200).json(
    success({
      message: 'Login successful',
      data: { user: safeUser, token },
    })
  );
}

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

/**
 * Return the currently authenticated user's profile.
 *
 * Requires: valid JWT (attached to req.user by auth middleware)
 * Success  200: { success, data: { user } }
 */
async function getMe(req, res) {
  // req.user is populated by the auth middleware; re-fetch to get latest data
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json(fail('User not found'));
  }

  return res.status(200).json(success({ data: { user } }));
}

module.exports = { register, login, getMe };
