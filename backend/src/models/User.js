const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User / Employee model.
 *
 * NOTE FOR AUTH TEAMMATE:
 *   This is a minimal stub created so the Attendance and Leave modules
 *   work end-to-end. You can extend this model (add fields like avatar,
 *   phone, address etc.) without breaking anything here.
 *   Do NOT rename `role`, `email`, or `password` fields — they are
 *   referenced by auth middleware and other modules.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['employee', 'admin', 'hr'],
      default: 'employee',
    },
    department: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
