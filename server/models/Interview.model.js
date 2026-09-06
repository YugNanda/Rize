const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    round: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    type: {
      type: String,
      enum: ['technical', 'hr', 'group-discussion', 'aptitude', 'managerial', 'system-design', 'other'],
      default: 'technical',
    },
    interviewer: {
      type: String,
      default: '',
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: 'Virtual / Online',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    feedback: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
