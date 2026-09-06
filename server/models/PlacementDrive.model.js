const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    package: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    eligibility: {
      minCGPA: { type: Number, default: 0 },
      maxBacklogs: { type: Number, default: 0 },
      allowedDepartments: { type: [String], default: [] },
      min10Percentage: { type: Number, default: 0 },
      min12Percentage: { type: Number, default: 0 },
      requiredSkills: { type: [String], default: [] },
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    driveDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'completed'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
