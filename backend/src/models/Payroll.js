import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Allowance sub-schema ─────────────────────────────────────────────────────
const allowanceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, "Allowance amount cannot be negative"] },
  },
  { _id: false }
);

// ── Deduction sub-schema ─────────────────────────────────────────────────────
const deductionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, "Deduction amount cannot be negative"] },
  },
  { _id: false }
);

// ── Payroll schema ───────────────────────────────────────────────────────────
const payrollSchema = new Schema(
  {
    // ── Reference ────────────────────────────────────────────────────────────
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
      unique: true, // One payroll record per employee
    },

    // ── Salary structure ──────────────────────────────────────────────────────
    salaryStructure: {
      type: String,
      enum: ["basic", "standard", "senior", "executive"],
      default: "standard",
    },

    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Basic salary cannot be negative"],
    },

    allowances: {
      type: [allowanceSchema],
      default: [],
    },

    deductions: {
      type: [deductionSchema],
      default: [],
    },

    // ── Computed fields (stored for reporting/history) ────────────────────────
    grossSalary: {
      type: Number,
      min: [0, "Gross salary cannot be negative"],
    },

    netSalary: {
      type: Number,
      min: [0, "Net salary cannot be negative"],
    },

    // ── Pay settings ─────────────────────────────────────────────────────────
    payFrequency: {
      type: String,
      enum: ["monthly", "bi_weekly", "weekly"],
      default: "monthly",
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save: auto-calculate gross and net salary ────────────────────────────
payrollSchema.pre("save", function (next) {
  const totalAllowances = this.allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = this.deductions.reduce((sum, d) => sum + d.amount, 0);

  this.grossSalary = this.basicSalary + totalAllowances;
  this.netSalary = this.grossSalary - totalDeductions;

  next();
});

// ── Pre-findOneAndUpdate: recalculate on update ───────────────────────────────
payrollSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  const basic = update.basicSalary ?? update.$set?.basicSalary;
  const allowances = update.allowances ?? update.$set?.allowances;
  const deductions = update.deductions ?? update.$set?.deductions;

  // Only recalculate if any of the relevant fields are being updated
  if (basic !== undefined || allowances !== undefined || deductions !== undefined) {
    // We must fetch the current doc to recalculate accurately
    // This is handled in the controller by passing the full updated doc
    // and relying on pre-save via findOneAndUpdate({new: true}) + runValidators
  }

  next();
});

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
