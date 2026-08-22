import { z } from "zod";

// ── Shared field definitions ──────────────────────────────────────────────────

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, "Phone must be a valid international number (8-15 digits)")
  .optional();

const addressSchema = z
  .object({
    street: z.string().max(100).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    postalCode: z.string().max(20).optional(),
  })
  .optional();

const emergencyContactSchema = z
  .object({
    name: z.string().max(100).optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Emergency phone must be a valid international number")
      .optional(),
  })
  .optional();

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required").max(100),
  type: z.enum(["id_proof", "address_proof", "educational", "experience", "contract", "other"]),
  url: z.string().url("Document URL must be a valid URL"),
  uploadDate: z.string().datetime().optional(),
});

// ── Create Employee (Admin/HR only) ──────────────────────────────────────────
export const createEmployeeSchema = z.object({
  employeeId: z
    .string()
    .regex(/^EMP\d{4,}$/, "Employee ID must be in format EMP0001, EMP0002, etc."),

  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),

  email: z.string().email("Must be a valid email address"),
  phone: phoneSchema,
  address: addressSchema,
  emergencyContact: emergencyContactSchema,

  department: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
  joiningDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  workLocation: z.string().max(100).optional(),
  manager: z.string().optional(), // MongoDB ObjectId as string
  status: z.enum(["active", "inactive", "on_leave", "terminated"]).optional(),

  profilePicture: z.string().url().optional().nullable(),
  documents: z.array(documentSchema).optional(),
});

// ── Update Employee (Admin/HR only — can update all fields) ──────────────────
export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),

  email: z.string().email().optional(),
  phone: phoneSchema,
  address: addressSchema,
  emergencyContact: emergencyContactSchema,

  department: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
  joiningDate: z.string().datetime({ offset: true }).optional().or(z.string().date().optional()),
  workLocation: z.string().max(100).optional(),
  manager: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave", "terminated"]).optional(),

  profilePicture: z.string().url().optional().nullable(),
  documents: z.array(documentSchema).optional(),
});

// ── Self-Update (Employee can only update limited fields) ─────────────────────
// Employees CANNOT change: employeeId, department, jobTitle, joiningDate,
//   employmentType, manager, status, email (to avoid account hijacking)
export const selfUpdateEmployeeSchema = z.object({
  phone: phoneSchema,
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  profilePicture: z.string().url().optional().nullable(),
});

export { documentSchema };
