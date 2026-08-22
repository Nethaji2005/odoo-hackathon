'use strict';

const mongoose = require('mongoose');

/**
 * Supported roles within the Dayflow system.
 * - employee : standard staff member
 * - hr       : human resources personnel with elevated privileges
 */
const ROLES = ['employee', 'hr'];

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
     * The `select: false` option ensures this field is omitted from all
     * query results unless explicitly requested with `.select('+password')`.
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

    /** Soft-disable an account without deleting it. */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    versionKey: false,
  }
);

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
