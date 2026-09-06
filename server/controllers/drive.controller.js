const PlacementDrive = require('../models/PlacementDrive.model');
const Company = require('../models/Company.model');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const { notifyUser } = require('./notification.controller');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Eligibility checker ───────────────────────────────────────────────────
const checkEligibility = (student, eligibility) => {
  const issues = [];

  if (eligibility.minCGPA && student.cgpa < eligibility.minCGPA)
    issues.push(`Minimum CGPA required: ${eligibility.minCGPA} (yours: ${student.cgpa || 'not set'})`);

  if (eligibility.maxBacklogs !== undefined && student.backlogs > eligibility.maxBacklogs)
    issues.push(`Max backlogs allowed: ${eligibility.maxBacklogs} (yours: ${student.backlogs})`);

  if (eligibility.allowedDepartments?.length && !eligibility.allowedDepartments.includes(student.department))
    issues.push(`Department not eligible. Allowed: ${eligibility.allowedDepartments.join(', ')}`);

  if (eligibility.min10Percentage && student.tenthPercentage < eligibility.min10Percentage)
    issues.push(`Minimum 10th percentage: ${eligibility.min10Percentage}%`);

  if (eligibility.min12Percentage && student.twelfthPercentage < eligibility.min12Percentage)
    issues.push(`Minimum 12th percentage: ${eligibility.min12Percentage}%`);

  return { eligible: issues.length === 0, issues };
};

// ─── GET /api/drives ───────────────────────────────────────────────────────
const getDrives = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status, jobType, search, sortBy = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;

    // Students only see open drives by default
    if (req.user.role === 'student' && !status) filter.status = 'open';

    // Company sees only their drives
    if (req.user.role === 'company') {
      const company = await Company.findOne({ createdBy: req.user.id });
      if (company) filter.companyId = company._id;
    }

    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { jobRole: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];

    const [drives, total] = await Promise.all([
      PlacementDrive.find(filter)
        .populate('companyId', 'name logoUrl industry location isVerified')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      PlacementDrive.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Drives fetched.', {
      drives,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/drives/counts ────────────────────────────────────────────────
const getDriveCounts = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'admin' || role === 'tpcell') {
      const [pendingDrives, openDrives, totalDrives] = await Promise.all([
        PlacementDrive.countDocuments({ status: 'draft' }),
        PlacementDrive.countDocuments({ status: 'open' }),
        PlacementDrive.countDocuments(),
      ]);
      return sendSuccess(res, 200, 'Drive counts fetched.', {
        pendingDrives,
        openDrives,
        totalDrives,
      });
    }

    if (role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      const openDrives = await PlacementDrive.countDocuments({ status: 'open' });
      let appliedCount = 0;
      if (student) {
        appliedCount = await Application.countDocuments({ studentId: student._id });
      }

      const { since } = req.query;
      let newDrives = 0;
      if (since && !isNaN(Number(since))) {
        newDrives = await PlacementDrive.countDocuments({
          status: 'open',
          updatedAt: { $gt: new Date(Number(since)) },
        });
      }

      return sendSuccess(res, 200, 'Drive counts fetched.', {
        openDrives,
        newDrives,
        appliedCount,
      });
    }

    if (role === 'company') {
      const company = await Company.findOne({ createdBy: req.user.id });
      if (!company) {
        return sendSuccess(res, 200, 'Drive counts fetched.', { pendingDrives: 0, openDrives: 0, totalDrives: 0 });
      }
      const [pendingDrives, openDrives, totalDrives] = await Promise.all([
        PlacementDrive.countDocuments({ companyId: company._id, status: 'draft' }),
        PlacementDrive.countDocuments({ companyId: company._id, status: 'open' }),
        PlacementDrive.countDocuments({ companyId: company._id }),
      ]);
      return sendSuccess(res, 200, 'Drive counts fetched.', {
        pendingDrives,
        openDrives,
        totalDrives,
      });
    }

    sendSuccess(res, 200, 'Drive counts fetched.', {});
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/drives/:id ───────────────────────────────────────────────────
const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('companyId', 'name logoUrl website industry location description isVerified')
      .populate('createdBy', 'name email');

    if (!drive) return sendError(res, 404, 'Drive not found.');

    // Check eligibility if student
    let eligibilityResult = null;
    let alreadyApplied = false;
    let userApplication = null;

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (student) {
        eligibilityResult = checkEligibility(student, drive.eligibility);
        const existing = await Application.findOne({
          driveId: drive._id,
          studentId: student._id,
        });
        alreadyApplied = !!existing;
        userApplication = existing || null;
      }
    }

    sendSuccess(res, 200, 'Drive fetched.', { drive, eligibilityResult, alreadyApplied, userApplication });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/drives ──────────────────────────────────────────────────────
const createDrive = async (req, res, next) => {
  try {
    const company = await Company.findOne({ createdBy: req.user.id });
    if (!company) return sendError(res, 400, 'Create a company profile first.');

    const drive = await PlacementDrive.create({
      ...req.body,
      companyId: company._id,
      createdBy: req.user.id,
      status: req.body.status || 'draft', // defaults to draft (pending T&P Cell approval)
    });

    const populated = await drive.populate('companyId', 'name logoUrl industry');

    // Notify T&P Cell of incoming drive submission
    try {
      const tpUsers = await User.find({ role: { $in: ['tpcell', 'admin'] } });
      for (const tp of tpUsers) {
        await notifyUser({
          userId: tp._id,
          title: `🏢 Drive Submitted — ${company.name}`,
          message: `${company.name} created "${drive.title}". Review package and approve to publish.`,
          type: 'drive',
          link: '/tpcell/drives',
        });
      }
    } catch (e) {
      console.error('Failed to notify T&P Cell:', e.message);
    }

    sendSuccess(res, 201, 'Drive created and submitted for T&P Cell approval.', { drive: populated });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/drives/:id ───────────────────────────────────────────────────
const updateDrive = async (req, res, next) => {
  try {
    const isGov = ['admin', 'tpcell'].includes(req.user.role);
    const filter = isGov
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user.id };

    const drive = await PlacementDrive.findOne(filter);
    if (!drive) return sendError(res, 404, 'Drive not found or not authorized.');
    if (drive.status === 'completed') return sendError(res, 400, 'Cannot edit a completed drive.');

    const updated = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('companyId', 'name logoUrl industry');

    sendSuccess(res, 200, 'Drive updated.', { drive: updated });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/drives/:id/status ─────────────────────────────────────────
const updateDriveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'open', 'closed', 'completed'];
    if (!validStatuses.includes(status)) return sendError(res, 400, 'Invalid status.');

    const isGov = ['admin', 'tpcell'].includes(req.user.role);
    const filter = isGov
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user.id };

    const drive = await PlacementDrive.findOneAndUpdate(filter, { status }, { new: true })
      .populate('companyId', 'name');
    if (!drive) return sendError(res, 404, 'Drive not found or not authorized.');

    // If drive is approved and open, broadcast notification to verified students
    if (status === 'open') {
      try {
        const students = await Student.find({ isVerified: true }).populate('userId');
        const compName = drive.companyId?.name || 'Recruiter';
        for (const st of students) {
          if (st.userId?._id) {
            await notifyUser({
              userId: st.userId._id,
              title: `🚀 Drive Open: ${drive.title}`,
              message: `${compName} is now accepting applications! Review eligibility and submit your resume.`,
              type: 'drive',
              link: `/student/drives/${drive._id}`,
            });
          }
        }
      } catch (e) {
        console.error('Failed to broadcast drive notification:', e.message);
      }
    }

    sendSuccess(res, 200, `Drive status updated to ${status}.`, { drive });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/drives/:id ────────────────────────────────────────────────
const deleteDrive = async (req, res, next) => {
  try {
    const isGov = ['admin', 'tpcell'].includes(req.user.role);
    const filter = isGov
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user.id, status: { $in: ['draft', 'closed'] } };

    const drive = await PlacementDrive.findOneAndDelete(filter);
    if (!drive) return sendError(res, 404, 'Drive not found, not authorized, or cannot delete open drive.');
    sendSuccess(res, 200, 'Drive deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDrives, getDriveById, getDriveCounts, createDrive, updateDrive, updateDriveStatus, deleteDrive };

