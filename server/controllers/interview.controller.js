const Interview = require('../models/Interview.model');
const Application = require('../models/Application.model');
const PlacementDrive = require('../models/PlacementDrive.model');
const Company = require('../models/Company.model');
const Student = require('../models/Student.model');
const { notifyUser } = require('./notification.controller');
const { sendSuccess, sendError } = require('../utils/response');

// ─── POST /api/interviews ──────────────────────────────────────────────────
const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      type = 'technical',
      meetingLink = '',
      location = 'Virtual / Google Meet',
      notes = '',
    } = req.body;

    const scheduledDateTime = req.body.scheduledAt || req.body.scheduledDate;

    if (!applicationId || !scheduledDateTime) {
      return sendError(res, 400, 'Application ID and scheduled date/time are required.');
    }

    const application = await Application.findById(applicationId)
      .populate({
        path: 'driveId',
        select: 'title jobRole companyId createdBy',
        populate: { path: 'companyId', select: 'name logoUrl createdBy' },
      })
      .populate({
        path: 'studentId',
        select: 'userId department rollNo cgpa',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!application) return sendError(res, 404, 'Application not found.');

    // Authorization check if company
    if (req.user.role === 'company') {
      const company = await Company.findOne({ createdBy: req.user._id || req.user.id });
      const driveCompId = application.driveId?.companyId?._id?.toString() || application.driveId?.companyId?.toString();
      if (!company || (driveCompId && driveCompId !== company._id.toString())) {
        return sendError(res, 403, 'Not authorized to schedule interviews for this drive.');
      }
    }

    const roundNumber = Number(req.body.round || req.body.roundNumber) || 1;
    const roundTitle = (req.body.title || req.body.roundName || '').trim() || `Round ${roundNumber}`;
    const interviewerName = (req.body.interviewer || req.body.interviewerName || '').trim() || 'Hiring Team';
    const duration = Number(req.body.durationMinutes || req.body.duration) || 45;

    const interview = await Interview.create({
      applicationId: application._id,
      title: roundTitle,
      round: roundNumber,
      type,
      interviewer: interviewerName,
      scheduledAt: new Date(scheduledDateTime),
      durationMinutes: duration,
      meetingLink: meetingLink.trim(),
      location: location.trim(),
      notes: notes.trim(),
      status: 'scheduled',
    });

    // Update application status to interview
    application.status = 'interview';
    await application.save();

    // Auto-notify student
    const studentUser = application.studentId?.userId;
    const companyName = application.driveId?.companyId?.name || 'Recruiter';
    if (studentUser?._id) {
      const dateStr = new Date(scheduledDateTime).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      await notifyUser({
        userId: studentUser._id,
        title: `🎯 Interview Scheduled — ${companyName}`,
        message: `${companyName} has invited you to ${roundTitle} scheduled for ${dateStr}. Review your meeting link and preparation instructions.`,
        type: 'interview',
        link: '/student/interviews',
        meta: { interviewId: interview._id, driveId: application.driveId?._id },
      });
    }

    const populated = await interview.populate([
      {
        path: 'applicationId',
        populate: [
          { path: 'driveId', select: 'title jobRole companyId', populate: { path: 'companyId', select: 'name logoUrl' } },
          { path: 'studentId', populate: { path: 'userId', select: 'name email' } },
        ],
      },
    ]);

    sendSuccess(res, 201, 'Interview scheduled successfully!', { interview: populated });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/interviews/my (Student) ──────────────────────────────────────
const getMyInterviews = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return sendSuccess(res, 200, 'No interviews found.', { interviews: [] });

    const studentApps = await Application.find({ studentId: student._id }).select('_id');
    const appIds = studentApps.map(a => a._id);

    const interviews = await Interview.find({ applicationId: { $in: appIds } })
      .populate({
        path: 'applicationId',
        select: 'driveId studentId status appliedAt',
        populate: [
          {
            path: 'driveId',
            select: 'title jobRole location package companyId',
            populate: { path: 'companyId', select: 'name logoUrl industry' },
          },
          {
            path: 'studentId',
            populate: { path: 'userId', select: 'name email' },
          },
        ],
      })
      .sort({ scheduledAt: 1 });

    sendSuccess(res, 200, 'Student interviews fetched.', { interviews });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/interviews/company (Company) ──────────────────────────────────
const getCompanyInterviews = async (req, res, next) => {
  try {
    const company = await Company.findOne({ createdBy: req.user.id });
    if (!company) return sendSuccess(res, 200, 'No company profile.', { interviews: [] });

    const drives = await PlacementDrive.find({ companyId: company._id }).select('_id');
    const driveIds = drives.map(d => d._id);

    const apps = await Application.find({ driveId: { $in: driveIds } }).select('_id');
    const appIds = apps.map(a => a._id);

    const interviews = await Interview.find({ applicationId: { $in: appIds } })
      .populate({
        path: 'applicationId',
        select: 'driveId studentId status appliedAt',
        populate: [
          {
            path: 'driveId',
            select: 'title jobRole location package',
          },
          {
            path: 'studentId',
            select: 'rollNo department cgpa backlogs skills resumeUrl userId phone',
            populate: { path: 'userId', select: 'name email' },
          },
        ],
      })
      .sort({ scheduledAt: 1 });

    sendSuccess(res, 200, 'Company interviews fetched.', { interviews });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/interviews/drive/:driveId ────────────────────────────────────
const getDriveInterviews = async (req, res, next) => {
  try {
    const apps = await Application.find({ driveId: req.params.driveId }).select('_id');
    const appIds = apps.map(a => a._id);

    const interviews = await Interview.find({ applicationId: { $in: appIds } })
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'studentId', populate: { path: 'userId', select: 'name email' } },
          { path: 'driveId', select: 'title jobRole' },
        ],
      })
      .sort({ scheduledAt: 1 });

    sendSuccess(res, 200, 'Drive interviews fetched.', { interviews });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/interviews/:id ─────────────────────────────────────────────
const updateInterview = async (req, res, next) => {
  try {
    const { status, feedback, rating, meetingLink, location, notes, interviewer, title } = req.body;
    const scheduledDateTime = req.body.scheduledAt || req.body.scheduledDate;

    const interview = await Interview.findById(req.params.id).populate({
      path: 'applicationId',
      populate: [
        { path: 'studentId', populate: { path: 'userId', select: 'name email' } },
        { path: 'driveId', populate: { path: 'companyId', select: 'name' } },
      ],
    });

    if (!interview) return sendError(res, 404, 'Interview not found.');

    if (status) interview.status = status;
    if (feedback !== undefined) interview.feedback = feedback;
    if (rating !== undefined) interview.rating = Number(rating);
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (location !== undefined) interview.location = location;
    if (scheduledDateTime) interview.scheduledAt = new Date(scheduledDateTime);
    if (notes !== undefined) interview.notes = notes;
    if (interviewer !== undefined) interview.interviewer = interviewer;
    if (title !== undefined) interview.title = title;

    await interview.save();

    // Notify student of important changes
    const studentUser = interview.applicationId?.studentId?.userId;
    const companyName = interview.applicationId?.driveId?.companyId?.name || 'Recruiter';

    if (studentUser?._id) {
      if (status === 'rescheduled') {
        const dateStr = new Date(interview.scheduledAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        await notifyUser({
          userId: studentUser._id,
          title: `🗓️ Interview Rescheduled — ${companyName}`,
          message: `Your interview for ${interview.title} has been rescheduled to ${dateStr}. Please review the updated schedule.`,
          type: 'interview',
          link: '/student/interviews',
        });
      } else if (status === 'completed' && feedback) {
        await notifyUser({
          userId: studentUser._id,
          title: `✅ Interview Feedback Submitted — ${companyName}`,
          message: `${companyName} has updated the status and feedback for ${interview.title}.`,
          type: 'interview',
          link: '/student/interviews',
        });
      }
    }

    sendSuccess(res, 200, 'Interview updated.', { interview });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/interviews/:id ───────────────────────────────────────────
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return sendError(res, 404, 'Interview not found.');
    sendSuccess(res, 200, 'Interview cancelled & removed.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews,
  getCompanyInterviews,
  getDriveInterviews,
  updateInterview,
  deleteInterview,
};
