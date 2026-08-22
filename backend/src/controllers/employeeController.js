'use strict';

const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { sendSuccess, sendError } = require('../utils/response');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET /api/employees/me ─────────────────────────────────────────────────────
// Identity comes from req.user.id (JWT) — never from the request body/query.
const getMyProfile = async (req, res) => {
  try {
    // Try to find by linked user account first, then fall back to _id match
    let employee = await Employee.findOne({ user: req.user.id })
      .select('-__v')
      .populate('manager', 'firstName lastName employeeId jobTitle');

    // Fallback: profile-payroll branch may store _id == user._id
    if (!employee) {
      employee = await Employee.findById(req.user.id)
        .select('-__v')
        .populate('manager', 'firstName lastName employeeId jobTitle');
    }

    if (!employee) {
      return sendError(res, 404, 'Employee profile not found for your account.');
    }

    return sendSuccess(res, 200, 'Employee profile fetched successfully.', { employee });
  } catch (err) {
    console.error('[employees/getMyProfile]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── PUT /api/employees/me ─────────────────────────────────────────────────────
// Employees can only update: phone, address, emergencyContact, profilePicture.
// Restricted fields are blocked here — Zod validator already strips them.
const EMPLOYEE_RESTRICTED = ['employeeId', 'department', 'jobTitle', 'joiningDate',
  'employmentType', 'manager', 'status', 'email', 'user'];

const updateMyProfile = async (req, res) => {
  try {
    // Remove any restricted fields from the update body
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => !EMPLOYEE_RESTRICTED.includes(k))
    );

    let employee = await Employee.findOneAndUpdate(
      { user: req.user.id },
      { $set: update },
      { new: true, runValidators: true, select: '-__v' }
    );

    if (!employee) {
      employee = await Employee.findByIdAndUpdate(
        req.user.id,
        { $set: update },
        { new: true, runValidators: true, select: '-__v' }
      );
    }

    if (!employee) {
      return sendError(res, 404, 'Employee profile not found for your account.');
    }

    return sendSuccess(res, 200, 'Profile updated successfully.', { employee });
  } catch (err) {
    console.error('[employees/updateMyProfile]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── GET /api/employees — Admin/HR ─────────────────────────────────────────────
const getEmployees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    const employees = await Employee.find(filter)
      .select('-__v -documents')
      .populate('manager', 'firstName lastName employeeId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Employees fetched successfully.', { employees });
  } catch (err) {
    console.error('[employees/getEmployees]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── GET /api/employees/:id — Admin/HR ────────────────────────────────────────
const getEmployeeById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid employee ID format.');
    }

    const employee = await Employee.findById(req.params.id)
      .select('-__v')
      .populate('manager', 'firstName lastName employeeId jobTitle');

    if (!employee) return sendError(res, 404, 'Employee not found.');

    return sendSuccess(res, 200, 'Employee fetched successfully.', { employee });
  } catch (err) {
    console.error('[employees/getEmployeeById]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── POST /api/employees — Admin/HR ───────────────────────────────────────────
const createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    return sendSuccess(res, 201, 'Employee created successfully.', { employee });
  } catch (err) {
    console.error('[employees/createEmployee]', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return sendError(res, 409, `${field} already exists.`);
    }
    return sendError(res, 500, 'Server error.');
  }
};

// ── PUT /api/employees/:id — Admin/HR ────────────────────────────────────────
const updateEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid employee ID format.');
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true, select: '-__v' }
    ).populate('manager', 'firstName lastName employeeId jobTitle');

    if (!employee) return sendError(res, 404, 'Employee not found.');

    return sendSuccess(res, 200, 'Employee updated successfully.', { employee });
  } catch (err) {
    console.error('[employees/updateEmployee]', err);
    return sendError(res, 500, 'Server error.');
  }
};

module.exports = { getMyProfile, updateMyProfile, getEmployees, getEmployeeById, createEmployee, updateEmployee };
