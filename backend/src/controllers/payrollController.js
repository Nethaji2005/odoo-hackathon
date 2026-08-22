import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Calculate grossSalary and netSalary from the payroll data.
 * Returns the computed values so controllers can store them explicitly.
 */
const calculateSalary = (basicSalary, allowances = [], deductions = []) => {
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  return { grossSalary, netSalary };
};

// ── GET /api/payroll/me ───────────────────────────────────────────────────────
/**
 * Employee views their own payroll — read only.
 * Identity comes from req.user.id (JWT), never from query/body.
 */
export const getMyPayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findOne({ employee: req.user.id })
      .select("-__v")
      .populate("employee", "firstName lastName employeeId jobTitle department");

    if (!payroll) {
      return errorResponse(res, 404, "Payroll record not found for your account");
    }

    return successResponse(res, 200, "Payroll fetched successfully", payroll);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/payroll/:employeeId ──────────────────────────────────────────────
/**
 * Admin/HR views any employee's payroll.
 * :employeeId is the MongoDB _id of the Employee document.
 */
export const getPayrollByEmployee = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return errorResponse(res, 400, "Invalid employee ID format");
    }

    // Verify the employee exists
    const employeeExists = await Employee.exists({ _id: req.params.employeeId });
    if (!employeeExists) {
      return errorResponse(res, 404, "Employee not found");
    }

    const payroll = await Payroll.findOne({ employee: req.params.employeeId })
      .select("-__v")
      .populate("employee", "firstName lastName employeeId jobTitle department");

    if (!payroll) {
      return errorResponse(res, 404, "No payroll record found for this employee");
    }

    return successResponse(res, 200, "Payroll fetched successfully", payroll);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/payroll/:employeeId ─────────────────────────────────────────────
/**
 * Admin/HR creates payroll for an employee.
 * Only one payroll record per employee (enforced by unique index).
 */
export const createPayroll = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return errorResponse(res, 400, "Invalid employee ID format");
    }

    const employeeExists = await Employee.exists({ _id: req.params.employeeId });
    if (!employeeExists) {
      return errorResponse(res, 404, "Employee not found");
    }

    const { basicSalary, allowances = [], deductions = [] } = req.body;
    const { grossSalary, netSalary } = calculateSalary(basicSalary, allowances, deductions);

    const payroll = new Payroll({
      ...req.body,
      employee: req.params.employeeId,
      grossSalary,
      netSalary,
    });

    await payroll.save();

    const populated = await payroll.populate(
      "employee",
      "firstName lastName employeeId jobTitle department"
    );

    return successResponse(res, 201, "Payroll created successfully", populated);
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/payroll/:employeeId ──────────────────────────────────────────────
/**
 * Admin/HR updates payroll for an employee.
 * Always recalculates grossSalary and netSalary on update.
 */
export const updatePayroll = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.employeeId)) {
      return errorResponse(res, 400, "Invalid employee ID format");
    }

    // Fetch existing payroll to merge arrays for recalculation
    const existing = await Payroll.findOne({ employee: req.params.employeeId });
    if (!existing) {
      return errorResponse(res, 404, "Payroll record not found for this employee");
    }

    const mergedBasic = req.body.basicSalary ?? existing.basicSalary;
    const mergedAllowances = req.body.allowances ?? existing.allowances;
    const mergedDeductions = req.body.deductions ?? existing.deductions;

    const { grossSalary, netSalary } = calculateSalary(
      mergedBasic,
      mergedAllowances,
      mergedDeductions
    );

    const updatedPayroll = await Payroll.findOneAndUpdate(
      { employee: req.params.employeeId },
      { $set: { ...req.body, grossSalary, netSalary } },
      { new: true, runValidators: true, select: "-__v" }
    ).populate("employee", "firstName lastName employeeId jobTitle department");

    return successResponse(res, 200, "Payroll updated successfully", updatedPayroll);
  } catch (error) {
    next(error);
  }
};
