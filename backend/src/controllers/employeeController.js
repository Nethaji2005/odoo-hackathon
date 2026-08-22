import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fields that ONLY admin/hr can modify.
 * Used to strip restricted fields from employee self-update requests.
 */
const ADMIN_ONLY_FIELDS = [
  "employeeId",
  "department",
  "jobTitle",
  "employmentType",
  "joiningDate",
  "manager",
  "status",
  "email",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET /api/employees/me ─────────────────────────────────────────────────────
/**
 * Returns the profile of the currently authenticated employee.
 * req.user.id is the MongoDB _id set by requireAuth.
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.user.id)
      .select("-__v")
      .populate("manager", "firstName lastName employeeId jobTitle");

    if (!employee) {
      return errorResponse(res, 404, "Employee profile not found");
    }

    return successResponse(res, 200, "Employee profile fetched successfully", employee);
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/employees/me ─────────────────────────────────────────────────────
/**
 * Employee self-update — only allowed fields: phone, address, emergencyContact, profilePicture.
 * The selfUpdateEmployeeSchema Zod validator already strips other fields before this runs.
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true, select: "-__v" }
    ).populate("manager", "firstName lastName employeeId jobTitle");

    if (!employee) {
      return errorResponse(res, 404, "Employee profile not found");
    }

    return successResponse(res, 200, "Profile updated successfully", employee);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/employees ────────────────────────────────────────────────────────
/**
 * List all employees — admin/hr only.
 * Supports optional ?status=active and ?department=Engineering filters.
 */
export const getEmployees = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    const employees = await Employee.find(filter)
      .select("-__v -documents")
      .populate("manager", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Employees fetched successfully", employees);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/employees/:id ────────────────────────────────────────────────────
/**
 * Get a single employee — admin/hr only.
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, 400, "Invalid employee ID format");
    }

    const employee = await Employee.findById(req.params.id)
      .select("-__v")
      .populate("manager", "firstName lastName employeeId jobTitle");

    if (!employee) {
      return errorResponse(res, 404, "Employee not found");
    }

    return successResponse(res, 200, "Employee fetched successfully", employee);
  } catch (error) {
    next(error);
  }
};

// ── POST /api/employees ───────────────────────────────────────────────────────
/**
 * Create employee — admin/hr only.
 */
export const createEmployee = async (req, res, next) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();

    return successResponse(res, 201, "Employee created successfully", employee);
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/employees/:id ────────────────────────────────────────────────────
/**
 * Update any employee — admin/hr only.
 */
export const updateEmployee = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return errorResponse(res, 400, "Invalid employee ID format");
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true, select: "-__v" }
    ).populate("manager", "firstName lastName employeeId jobTitle");

    if (!employee) {
      return errorResponse(res, 404, "Employee not found");
    }

    return successResponse(res, 200, "Employee updated successfully", employee);
  } catch (error) {
    next(error);
  }
};
