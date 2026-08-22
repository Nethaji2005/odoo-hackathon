const { z } = require('zod');

// ─── Apply leave (employee) ───────────────────────────────────────────────────
const applyLeaveSchema = z.object({
  leaveType: z.enum(['paid', 'sick', 'unpaid'], {
    error: 'Leave type must be one of: paid, sick, unpaid',
  }),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }),
  remarks: z
    .string()
    .min(1, 'Remarks are required')
    .max(500, 'Remarks cannot exceed 500 characters'),
});

// ─── Review leave (admin/HR — approve or reject) ──────────────────────────────
const reviewLeaveSchema = z.object({
  adminComment: z.string().max(500).optional(),
});

module.exports = { applyLeaveSchema, reviewLeaveSchema };
