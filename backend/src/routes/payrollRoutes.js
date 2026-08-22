import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import validate from "../validators/validate.js";
import { createPayrollSchema, updatePayrollSchema } from "../validators/payrollValidators.js";
import {
  getMyPayroll,
  getPayrollByEmployee,
  createPayroll,
  updatePayroll,
} from "../controllers/payrollController.js";

const router = Router();

// ── Employee self-route (/me must come BEFORE /:employeeId) ──────────────────

// GET /api/payroll/me — employee views their own payroll (read-only)
router.get("/me", requireAuth, getMyPayroll);

// ── Admin / HR routes ─────────────────────────────────────────────────────────

// GET  /api/payroll/:employeeId — admin/hr views any employee's payroll
router.get("/:employeeId", requireAuth, requireRole("admin", "hr"), getPayrollByEmployee);

// POST /api/payroll/:employeeId — admin/hr creates payroll for an employee
router.post(
  "/:employeeId",
  requireAuth,
  requireRole("admin", "hr"),
  validate(createPayrollSchema),
  createPayroll
);

// PUT  /api/payroll/:employeeId — admin/hr updates payroll
router.put(
  "/:employeeId",
  requireAuth,
  requireRole("admin", "hr"),
  validate(updatePayrollSchema),
  updatePayroll
);

export default router;
