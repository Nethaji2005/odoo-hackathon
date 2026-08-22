'use strict';

const { Router } = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getMyProfile, updateMyProfile,
  getEmployees, getEmployeeById,
  createEmployee, updateEmployee,
} = require('../controllers/employeeController');

const router = Router();

// /me must come BEFORE /:id to avoid 'me' being treated as an ID
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Admin / HR only
router.get('/', protect, authorize('admin', 'hr'), getEmployees);
router.post('/', protect, authorize('admin', 'hr'), createEmployee);
router.get('/:id', protect, authorize('admin', 'hr'), getEmployeeById);
router.put('/:id', protect, authorize('admin', 'hr'), updateEmployee);

module.exports = router;
