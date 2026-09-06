const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    resumeUrl:     { type: String, default: '' },
    resumeFileName:{ type: String, default: '' },
    status: {
      type: String,
      enum: ['applied','shortlisted','interview','offered','selected','rejected','withdrawn'],
      default: 'applied',
    },
    appliedAt: { type: Date, default: Date.now },
    remarks:   { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    nocStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'issued'],
      default: 'none',
    },
    nocIssuedAt: { type: Date, default: null },
    dreamOfferCleared: { type: Boolean, default: false },
    offerLetter: {
      isIssued: { type: Boolean, default: false },
      issuedAt: { type: Date, default: null },
      referenceNo: { type: String, default: '' },
      designation: { type: String, default: '' },
      packageLpa: { type: Number, default: 0 },
      baseSalaryLpa: { type: Number, default: 0 },
      bonusLpa: { type: Number, default: 0 },
      joiningDate: { type: String, default: '' },
      workLocation: { type: String, default: '' },
      validUntil: { type: Date, default: null },
      termsAccepted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
