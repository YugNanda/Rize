const Application = require('../models/Application.model');
const PlacementDrive = require('../models/PlacementDrive.model');
const Student = require('../models/Student.model');
const Company = require('../models/Company.model');
const User = require('../models/User.model');
const { notifyUser } = require('./notification.controller');
const { sendSuccess, sendError } = require('../utils/response');

// ─── POST /api/applications/drives/:driveId ────────────────────────────────
const applyToDrive = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return sendError(res, 400, 'Complete your student profile first.');
    if (!student.resumeUrl) return sendError(res, 400, 'Upload your resume before applying.');

    const drive = await PlacementDrive.findById(req.params.driveId);
    if (!drive) return sendError(res, 404, 'Drive not found.');
    if (drive.status !== 'open') return sendError(res, 400, 'This drive is not accepting applications.');

    if (drive.applicationDeadline < new Date())
      return sendError(res, 400, 'Application deadline has passed.');

    // Check duplicate
    const existing = await Application.findOne({ driveId: drive._id, studentId: student._id });
    if (existing) return sendError(res, 409, 'Already applied to this drive.');

    // Eligibility check
    const eligibility = drive.eligibility || {};
    if (eligibility.minCGPA && student.cgpa < eligibility.minCGPA)
      return sendError(res, 400, `CGPA too low. Required: ${eligibility.minCGPA}`);
    if (eligibility.maxBacklogs !== undefined && student.backlogs > eligibility.maxBacklogs)
      return sendError(res, 400, `Too many backlogs. Max allowed: ${eligibility.maxBacklogs}`);
    if (eligibility.allowedDepartments?.length && !eligibility.allowedDepartments.includes(student.department))
      return sendError(res, 400, 'Your department is not eligible for this drive.');

    const application = await Application.create({
      driveId: drive._id,
      studentId: student._id,
      appliedAt: new Date(),
    });

    const populated = await application.populate([
      { path: 'driveId', select: 'title jobRole location package status companyId', populate: { path: 'companyId', select: 'name logoUrl' } },
      { path: 'studentId', populate: { path: 'userId', select: 'name email' } },
    ]);

    // Notify company recruiter
    if (drive.createdBy) {
      await notifyUser({
        userId: drive.createdBy,
        title: `📥 New Application: ${drive.title}`,
        message: `${student.rollNo || 'A student'} submitted an application for ${drive.title}.`,
        type: 'application',
        link: '/company/applicants',
      });
    }

    sendSuccess(res, 201, 'Application submitted!', { application: populated });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications/my  — Student: my applications ─────────────────
const getMyApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return sendSuccess(res, 200, 'No applications.', { applications: [] });

    const { status } = req.query;
    const filter = { studentId: student._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate({
        path: 'driveId',
        select: 'title jobRole location package status applicationDeadline driveDate companyId',
        populate: { path: 'companyId', select: 'name logoUrl industry' },
      })
      .sort({ appliedAt: -1 });

    sendSuccess(res, 200, 'Applications fetched.', { applications });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications/company  — Company: all applicants across their drives ─
const getCompanyApplications = async (req, res, next) => {
  try {
    const company = await Company.findOne({ createdBy: req.user.id });
    if (!company) {
      return sendSuccess(res, 200, 'Company profile not found.', { applications: [], drives: [] });
    }

    const drives = await PlacementDrive.find({ companyId: company._id })
      .select('title jobRole package location status applicationDeadline')
      .sort({ createdAt: -1 });

    const driveIds = drives.map(d => d._id);

    const { status, driveId } = req.query;
    const filter = { driveId: { $in: driveIds } };

    if (driveId && driveIds.some(id => id.toString() === driveId.toString())) {
      filter.driveId = driveId;
    }
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'driveId',
        select: 'title jobRole location package status companyId',
      })
      .sort({ appliedAt: -1 });

    sendSuccess(res, 200, 'Company applications fetched.', { applications, drives });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications/drives/:driveId  — Company: see applicants ─────
const getDriveApplications = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.driveId);
    if (!drive) return sendError(res, 404, 'Drive not found.');

    // Verify company owns this drive
    if (req.user.role === 'company') {
      const company = await Company.findOne({ createdBy: req.user.id });
      const driveCompId = drive.companyId?._id || drive.companyId;
      const isOwner = (company && driveCompId && driveCompId.toString() === company._id.toString()) ||
                      (drive.createdBy && drive.createdBy.toString() === req.user.id);
      if (!isOwner) return sendError(res, 403, 'Not authorized.');
    }

    const { status } = req.query;
    const filter = { driveId: drive._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'driveId',
        select: 'title jobRole location package status companyId',
      })
      .sort({ appliedAt: -1 });

    sendSuccess(res, 200, 'Applicants fetched.', { applications });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/applications/:id/status  — Company/Admin ──────────────────
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, remarks } = req.body;
    const valid = ['applied', 'shortlisted', 'interview', 'offered', 'selected', 'rejected', 'withdrawn'];
    if (!valid.includes(status)) return sendError(res, 400, 'Invalid status.');

    const application = await Application.findById(req.params.id)
      .populate({ path: 'driveId', populate: { path: 'companyId' } });

    if (!application) return sendError(res, 404, 'Application not found.');

    // Verify authorization
    if (req.user.role === 'company') {
      const company = await Company.findOne({ createdBy: req.user.id });
      const driveCompId = application.driveId?.companyId?._id || application.driveId?.companyId;
      const isOwner = (company && driveCompId && driveCompId.toString() === company._id.toString()) ||
                      (application.driveId?.createdBy && application.driveId.createdBy.toString() === req.user.id);
      if (!isOwner) {
        return sendError(res, 403, 'Not authorized.');
      }
    }

    application.status = status;
    if (status === 'rejected') {
      application.rejectionReason = rejectionReason || 'Profile did not meet criteria.';
    } else {
      // Clear rejection reason if status changed away from rejected
      application.rejectionReason = '';
    }
    if (remarks !== undefined) {
      application.remarks = remarks;
    }

    // Auto-generate official corporate offer letter when candidate is offered / selected
    if (['offered', 'selected'].includes(status)) {
      const drive = application.driveId || {};
      const company = drive.companyId || {};
      const compName = company.name || 'Corporate Recruiter';
      const compInitials = compName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'RIZ';
      const year = new Date().getFullYear();
      const randomSuffix = application._id.toString().slice(-4).toUpperCase();
      const refNo = `OFFER/${compInitials}/${year}/${randomSuffix}`;

      const totalPkg = drive.package?.max || drive.package?.min || 12;
      const baseSalary = Number((totalPkg * 0.85).toFixed(2));
      const bonus = Number((totalPkg * 0.15).toFixed(2));

      if (!application.offerLetter?.isIssued) {
        application.offerLetter = {
          isIssued: true,
          issuedAt: new Date(),
          referenceNo: refNo,
          designation: drive.jobRole || drive.title || 'Software Development Engineer',
          packageLpa: totalPkg,
          baseSalaryLpa: baseSalary,
          bonusLpa: bonus,
          joiningDate: 'July 15, 2026',
          workLocation: drive.location || 'Bengaluru HQ / Hybrid',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          termsAccepted: false,
        };
      }
    }

    await application.save();

    // Auto-notify student & T&P Cell of status change & offer letter
    try {
      const studentDoc = await Student.findById(application.studentId).populate('userId');
      const compName = application.driveId?.companyId?.name || 'Recruiter';
      const driveTitle = application.driveId?.title || 'Placement Drive';
      const studentName = studentDoc?.userId?.name || 'Candidate';
      const totalPkg = application.driveId?.package?.max || application.driveId?.package?.min || 12;

      if (studentDoc?.userId?._id) {
        let notifTitle = `Application Update — ${compName}`;
        let notifMsg = `Your application for "${driveTitle}" is now: ${status.toUpperCase()}.`;
        let notifType = 'application';

        if (status === 'shortlisted') {
          notifTitle = `🎉 Shortlisted — ${compName}`;
          notifMsg = `Congratulations! You have been shortlisted by ${compName} for ${driveTitle}.`;
        } else if (status === 'interview') {
          notifTitle = `🎯 Interview Scheduled — ${compName}`;
          notifMsg = `${compName} moved your application to Interview stage for ${driveTitle}.`;
          notifType = 'interview';
        } else if (status === 'offered' || status === 'selected') {
          notifTitle = `🏆 Formal Offer Letter Issued — ${compName}!`;
          notifMsg = `Congratulations ${studentName}! ${compName} has officially selected you for ${driveTitle} (₹${totalPkg} LPA). Your formal Offer Letter & Appointment Order is now available in PDF!`;
          notifType = 'offer';
        } else if (status === 'rejected') {
          notifTitle = `Status Update — ${compName}`;
          notifMsg = `Your application for ${driveTitle} was not selected. Reason: ${application.rejectionReason}`;
        }

        await notifyUser({
          userId: studentDoc.userId._id,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          link: '/student/applications',
        });
      }

      // Also notify T&P Cell administrators whenever an offer letter is issued
      if (status === 'offered' || status === 'selected') {
        const adminUsers = await User.find({ role: { $in: ['admin', 'tpcell'] } }).select('_id');
        for (const admin of adminUsers) {
          await notifyUser({
            userId: admin._id,
            title: `📜 Campus Offer Letter Issued: ${studentName}`,
            message: `${studentName} received an official offer letter from ${compName} for ${driveTitle} (₹${totalPkg} LPA). Downloadable appointment order generated in PDF format.`,
            type: 'application',
            link: '/tpcell/applications',
          });
        }
      }
    } catch (e) {
      console.error('Failed to dispatch notifications:', e.message);
    }

    sendSuccess(res, 200, `Application marked as ${status}.`, { application });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/applications/:id  — Student: withdraw ────────────────────
const withdrawApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    const application = await Application.findOne({ _id: req.params.id, studentId: student?._id });

    if (!application) return sendError(res, 404, 'Application not found.');
    if (application.status !== 'applied')
      return sendError(res, 400, 'Cannot withdraw application at this stage.');

    await application.deleteOne();
    sendSuccess(res, 200, 'Application withdrawn.');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications/stats  — Admin stats ───────────────────────────
const getStats = async (req, res, next) => {
  try {
    const stats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result = {};
    stats.forEach((s) => { result[s._id] = s.count; });
    sendSuccess(res, 200, 'Stats fetched.', { stats: result });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications  — Admin / T&P Cell: view all applications across college ─────
const getAllApplications = async (req, res, next) => {
  try {
    const { status, driveId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (driveId && driveId !== 'all') filter.driveId = driveId;

    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'studentId',
          populate: { path: 'userId', select: 'name email' },
        })
        .populate({
          path: 'driveId',
          populate: { path: 'companyId', select: 'name logoUrl industry' },
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Applications fetched.', {
      applications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/applications/:id/noc  — T&P Cell: issue NOC / Dream offer clearance ─────
const updateApplicationNoc = async (req, res, next) => {
  try {
    const { nocStatus, dreamOfferCleared } = req.body;
    const updates = {};
    if (nocStatus) {
      updates.nocStatus = nocStatus;
      if (nocStatus === 'issued' || nocStatus === 'approved') {
        updates.nocIssuedAt = new Date();
      }
    }
    if (dreamOfferCleared !== undefined) {
      updates.dreamOfferCleared = dreamOfferCleared;
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name logoUrl industry' },
      });

    if (!application) return sendError(res, 404, 'Application not found.');
    sendSuccess(res, 200, 'Application clearance updated.', { application });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/applications/:id/offer-letter ─────────────────────────────────
const getOfferLetter = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId' },
      });

    if (!application) return sendError(res, 404, 'Application not found.');

    if (!['offered', 'selected'].includes(application.status)) {
      return sendError(res, 400, 'Offer letter is only generated for offered or selected candidates.');
    }

    // Auto-generate offerLetter details if not previously stored
    if (!application.offerLetter?.isIssued) {
      const drive = application.driveId || {};
      const company = drive.companyId || {};
      const compName = company.name || 'Corporate Recruiter';
      const compInitials = compName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'RIZ';
      const year = new Date().getFullYear();
      const randomSuffix = application._id.toString().slice(-4).toUpperCase();
      const totalPkg = drive.package?.max || drive.package?.min || 12;

      application.offerLetter = {
        isIssued: true,
        issuedAt: application.updatedAt || new Date(),
        referenceNo: `OFFER/${compInitials}/${year}/${randomSuffix}`,
        designation: drive.jobRole || drive.title || 'Software Development Engineer',
        packageLpa: totalPkg,
        baseSalaryLpa: Number((totalPkg * 0.85).toFixed(2)),
        bonusLpa: Number((totalPkg * 0.15).toFixed(2)),
        joiningDate: 'July 15, 2026',
        workLocation: drive.location || 'Bengaluru HQ / Hybrid',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        termsAccepted: false,
      };
      await application.save();
    }

    sendSuccess(res, 200, 'Offer letter fetched successfully.', { application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  getDriveApplications,
  getCompanyApplications,
  updateApplicationStatus,
  withdrawApplication,
  getStats,
  getAllApplications,
  updateApplicationNoc,
  getOfferLetter,
};
