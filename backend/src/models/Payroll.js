'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const allowanceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, 'Allowance amount cannot be negative'] },
  },
  { _id: false }
);

const deductionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, 'Deduction amount cannot be negative'] },
  },
  { _id: false }
);

const payrollSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      unique: true, // one payroll record per employee
    },
    salaryStructure: {
      type: String,
      enum: ['basic', 'standard', 'senior', 'executive'],
      default: 'standard',
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
    },
    allowances: { type: [allowanceSchema], default: [] },
    deductions: { type: [deductionSchema], default: [] },
    grossSalary: { type: Number, min: 0 },
    netSalary: { type: Number, min: 0 },
    payFrequency: {
      type: String,
      enum: ['monthly', 'bi_weekly', 'weekly'],
      default: 'monthly',
    },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    effectiveDate: { type: Date, required: [true, 'Effective date is required'] },
  },
  { timestamps: true }
);

// ── Pre-save: auto-calculate gross and net salary ─────────────────────────────
payrollSchema.pre('save', function (next) {
  const totalAllowances = this.allowances.reduce((s, a) => s + a.amount, 0);
  const totalDeductions = this.deductions.reduce((s, d) => s + d.amount, 0);
  this.grossSalary = this.basicSalary + totalAllowances;
  this.netSalary = this.grossSalary - totalDeductions;
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
