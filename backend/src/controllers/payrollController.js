'use strict';

const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const { sendSuccess, sendError } = require('../utils/response');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const calculateSalary = (basicSalary, allowances = [], deductions = []) => {
  const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0);
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  return { grossSalary, netSalary };
};

// ── GET /api/payroll/me ───────────────────────────────────────────────────────
const getMyPayroll = async (req, res) => {
  try {
    // Find the employee record linked to the logged-in user
    let employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      employee = await Employee.findById(req.user.id);
    }

    if (!employee) {
      return sendError(res, 404, 'Employee profile not found for your account.');
    }

    const payroll = await Payroll.findOne({ employee: employee._id })
      .select('-__v')
      .populate('employee', 'firstName lastName employeeId jobTitle department');

    if (!payroll) {
      return sendError(res, 404, 'Payroll record not found for your account.');
    }

    return sendSuccess(res, 200, 'Payroll fetched successfully.', { payroll });
  } catch (err) {
    console.error('[payroll/getMyPayroll]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── GET /api/payroll/:employeeId ──────────────────────────────────────────────
const getPayrollByEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return sendError(res, 400, 'Invalid employee ID format.');
    }

    const exists = await Employee.exists({ _id: req.params.employeeId });
    if (!exists) return sendError(res, 404, 'Employee not found.');

    const payroll = await Payroll.findOne({ employee: req.params.employeeId })
      .select('-__v')
      .populate('employee', 'firstName lastName employeeId jobTitle department');

    if (!payroll) return sendError(res, 404, 'No payroll record found for this employee.');

    return sendSuccess(res, 200, 'Payroll fetched successfully.', { payroll });
  } catch (err) {
    console.error('[payroll/getPayrollByEmployee]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ── POST /api/payroll/:employeeId — Admin/HR ──────────────────────────────────
const createPayroll = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return sendError(res, 400, 'Invalid employee ID format.');
    }

    const exists = await Employee.exists({ _id: req.params.employeeId });
    if (!exists) return sendError(res, 404, 'Employee not found.');

    const { basicSalary, allowances = [], deductions = [] } = req.body;
    const { grossSalary, netSalary } = calculateSalary(basicSalary, allowances, deductions);

    const payroll = new Payroll({
      ...req.body,
      employee: req.params.employeeId,
      grossSalary,
      netSalary,
    });

    await payroll.save();
    await payroll.populate('employee', 'firstName lastName employeeId jobTitle department');

    return sendSuccess(res, 201, 'Payroll created successfully.', { payroll });
  } catch (err) {
    console.error('[payroll/createPayroll]', err);
    if (err.code === 11000) return sendError(res, 409, 'Payroll already exists for this employee.');
    return sendError(res, 500, 'Server error.');
  }
};

// ── PUT /api/payroll/:employeeId — Admin/HR ───────────────────────────────────
const updatePayroll = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return sendError(res, 400, 'Invalid employee ID format.');
    }

    const existing = await Payroll.findOne({ employee: req.params.employeeId });
    if (!existing) return sendError(res, 404, 'Payroll record not found for this employee.');

    const mergedBasic = req.body.basicSalary !== undefined ? req.body.basicSalary : existing.basicSalary;
    const mergedAllowances = req.body.allowances !== undefined ? req.body.allowances : existing.allowances;
    const mergedDeductions = req.body.deductions !== undefined ? req.body.deductions : existing.deductions;

    const { grossSalary, netSalary } = calculateSalary(mergedBasic, mergedAllowances, mergedDeductions);

    const payroll = await Payroll.findOneAndUpdate(
      { employee: req.params.employeeId },
      { $set: { ...req.body, grossSalary, netSalary } },
      { new: true, runValidators: true, select: '-__v' }
    ).populate('employee', 'firstName lastName employeeId jobTitle department');

    return sendSuccess(res, 200, 'Payroll updated successfully.', { payroll });
  } catch (err) {
    console.error('[payroll/updatePayroll]', err);
    return sendError(res, 500, 'Server error.');
  }
};

module.exports = { getMyPayroll, getPayrollByEmployee, createPayroll, updatePayroll };
