import { z } from "zod";

// ── Shared ────────────────────────────────────────────────────────────────────
const allowanceSchema = z.object({
  name: z.string().min(1, "Allowance name is required").max(100),
  amount: z.number({ coerce: true }).nonnegative("Allowance amount cannot be negative"),
});

const deductionSchema = z.object({
  name: z.string().min(1, "Deduction name is required").max(100),
  amount: z.number({ coerce: true }).nonnegative("Deduction amount cannot be negative"),
});

// ── Create Payroll (Admin/HR only) ────────────────────────────────────────────
export const createPayrollSchema = z.object({
  salaryStructure: z.enum(["basic", "standard", "senior", "executive"]).optional(),

  basicSalary: z
    .number({ coerce: true, required_error: "Basic salary is required" })
    .nonnegative("Basic salary cannot be negative"),

  allowances: z.array(allowanceSchema).optional().default([]),
  deductions: z.array(deductionSchema).optional().default([]),

  payFrequency: z.enum(["monthly", "bi_weekly", "weekly"]).optional(),
  currency: z.string().max(3).optional(),

  effectiveDate: z
    .string({ required_error: "Effective date is required" })
    .datetime({ offset: true })
    .or(z.string().date()),
});

// ── Update Payroll (Admin/HR only — all fields optional) ──────────────────────
export const updatePayrollSchema = z.object({
  salaryStructure: z.enum(["basic", "standard", "senior", "executive"]).optional(),
  basicSalary: z.number({ coerce: true }).nonnegative("Basic salary cannot be negative").optional(),
  allowances: z.array(allowanceSchema).optional(),
  deductions: z.array(deductionSchema).optional(),
  payFrequency: z.enum(["monthly", "bi_weekly", "weekly"]).optional(),
  currency: z.string().max(3).optional(),
  effectiveDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
});
