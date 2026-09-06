const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNo: {
      type: String,
      trim: true,
      default: '',
    },
    registrationNo: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    batch: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: '',
    },
    profilePhotoUrl: {
      type: String,
      default: '',
    },
    placementStatus: {
      type: String,
      enum: ['not_placed', 'placed', 'offer_received', 'opted_out'],
      default: 'not_placed',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'flagged'],
      default: 'verified',
    },
    verificationRemarks: {
      type: String,
      default: '',
    },
    nocIssued: {
      type: Boolean,
      default: false,
    },
    nocIssuedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
