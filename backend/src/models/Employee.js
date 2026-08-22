'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

// ── Document sub-schema ───────────────────────────────────────────────────────
const documentSchema = new Schema(
  {
    name: { type: String, required: [true, 'Document name is required'], trim: true },
    type: {
      type: String,
      enum: ['id_proof', 'address_proof', 'educational', 'experience', 'contract', 'other'],
      required: [true, 'Document type is required'],
    },
    url: { type: String, required: [true, 'Document URL is required'], trim: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Employee schema ───────────────────────────────────────────────────────────
const employeeSchema = new Schema(
  {
    // Reference to the User account for this employee
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true, // allows null (admin-created records without login yet)
    },

    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^EMP\d{4,}$/, 'Employee ID must be in format EMP0001'],
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    profilePicture: { type: String, trim: true, default: null },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, 'Please provide a valid phone number'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    department: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      default: 'full_time',
    },
    joiningDate: { type: Date },
    workLocation: { type: String, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    documents: { type: [documentSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: fullName ─────────────────────────────────────────────────────────
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
