'use strict';

const { z } = require('zod');

/**
 * Validation schema for user registration.
 *
 * Rules:
 *  - name: 2–100 characters, stripped of leading/trailing whitespace
 *  - email: valid email address, lowercased
 *  - password: minimum 8 characters, must contain at least one letter and one digit
 *  - role: optional, defaults to 'employee'; must be 'employee' or 'hr'
 */
const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      'Password must contain at least one letter and one number'
    ),

  role: z
    .enum(['employee', 'hr'], {
      errorMap: () => ({ message: "Role must be 'employee' or 'hr'" }),
    })
    .optional()
    .default('employee'),
});

/**
 * Validation schema for user login.
 *
 * Rules:
 *  - email: valid email address, lowercased
 *  - password: required, non-empty
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
