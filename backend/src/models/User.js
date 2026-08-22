'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Supported roles within the Dayflow HRMS system.
 * Used for role-based authorization across all modules.
 */
const ROLES = ['employee', 'admin', 'hr'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    /**
     * Stored as a bcrypt hash — NEVER stored or returned as plain text.
     * select: false ensures this field is omitted from all query results
     * unless explicitly requested with .select('+password').
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ROLES,
        message: `Role must be one of: ${ROLES.join(', ')}`,
      },
      default: 'employee',
    },

    department: {
      type: String,
      trim: true,
    },

    /** Soft-disable an account without deleting it. */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare plain password against stored hash ───────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return a safe public representation of the user — password hash excluded.
 * Called automatically by JSON.stringify (e.g., res.json()).
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * Static helper for finding a user by email while explicitly including the
 * password field (needed during login to compare hashes).
 */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
