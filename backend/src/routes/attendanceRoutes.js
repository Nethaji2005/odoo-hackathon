const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyToday,
  getMyWeek,
  getAllAttendance,
  getEmployeeAttendance,
} = require('../controllers/attendanceController');

// ─── Employee routes ──────────────────────────────────────────────────────────
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/me/today', protect, getMyToday);
router.get('/me/week', protect, getMyWeek);
router.get('/me', protect, getMyAttendance);

// ─── Admin / HR routes ────────────────────────────────────────────────────────
// NOTE: /employee/:id must be declared BEFORE / to avoid ambiguity
router.get('/employee/:id', protect, authorize('admin', 'hr'), getEmployeeAttendance);
router.get('/', protect, authorize('admin', 'hr'), getAllAttendance);

module.exports = router;
