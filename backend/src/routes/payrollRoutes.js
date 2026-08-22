'use strict';

const { Router } = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getMyPayroll, getPayrollByEmployee,
  createPayroll, updatePayroll,
} = require('../controllers/payrollController');

const router = Router();

// /me before /:employeeId
router.get('/me', protect, getMyPayroll);

// Admin / HR only
router.get('/:employeeId', protect, authorize('admin', 'hr'), getPayrollByEmployee);
router.post('/:employeeId', protect, authorize('admin', 'hr'), createPayroll);
router.put('/:employeeId', protect, authorize('admin', 'hr'), updatePayroll);

module.exports = router;
