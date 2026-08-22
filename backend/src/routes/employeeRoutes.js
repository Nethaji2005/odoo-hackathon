import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import validate from "../validators/validate.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  selfUpdateEmployeeSchema,
} from "../validators/employeeValidators.js";
import {
  getMyProfile,
  updateMyProfile,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
} from "../controllers/employeeController.js";

const router = Router();

// ── Employee self-routes (/me must come BEFORE /:id) ─────────────────────────

// GET  /api/employees/me — any authenticated user (employee/admin/hr)
router.get("/me", requireAuth, getMyProfile);

// PUT  /api/employees/me — any authenticated user (restricted fields via schema)
router.put("/me", requireAuth, validate(selfUpdateEmployeeSchema), updateMyProfile);

// ── Admin / HR routes ─────────────────────────────────────────────────────────

// GET  /api/employees — list all employees
router.get("/", requireAuth, requireRole("admin", "hr"), getEmployees);

// POST /api/employees — create employee
router.post("/", requireAuth, requireRole("admin", "hr"), validate(createEmployeeSchema), createEmployee);

// GET  /api/employees/:id — view single employee
router.get("/:id", requireAuth, requireRole("admin", "hr"), getEmployeeById);

// PUT  /api/employees/:id — update any employee
router.put("/:id", requireAuth, requireRole("admin", "hr"), validate(updateEmployeeSchema), updateEmployee);

export default router;
