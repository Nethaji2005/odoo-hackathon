const { z } = require('zod');

// Check-in: no required body, but note is optional
const checkInSchema = z.object({
  note: z.string().max(200).optional(),
});

// Check-out: same
const checkOutSchema = z.object({
  note: z.string().max(200).optional(),
});

module.exports = { checkInSchema, checkOutSchema };
