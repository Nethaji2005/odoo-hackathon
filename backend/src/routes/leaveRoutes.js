const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
} = require('../controllers/leaveController');

// ─── Employee routes ──────────────────────────────────────────────────────────
router.post('/', protect, applyLeave);
router.get('/me', protect, getMyLeaves);

// ─── Admin / HR routes ────────────────────────────────────────────────────────
// NOTE: /me must come before /:id to avoid 'me' being treated as an ID
router.get('/', protect, authorize('admin', 'hr'), getAllLeaves);
router.get('/:id', protect, authorize('admin', 'hr'), getLeaveById);
router.patch('/:id/approve', protect, authorize('admin', 'hr'), approveLeave);
router.patch('/:id/reject', protect, authorize('admin', 'hr'), rejectLeave);

module.exports = router;
