const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Stored as 'YYYY-MM-DD' string — sorts correctly lexicographically.
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    // Working duration in minutes (calculated at check-out)
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave'],
      default: 'present',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// ─── Prevent duplicate attendance for same employee on the same day ───────────
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// ─── Faster queries by date alone (for admin daily/weekly views) ──────────────
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
