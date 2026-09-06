const path = require('path');
const fs = require('fs');
const Student = require('../models/Student.model');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/students/profile
 * Returns logged-in student's profile (joined with User)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email role avatar createdAt'
    );

    if (!student) {
      // Auto-create profile on first access
      const newStudent = await Student.create({ userId: req.user.id });
      const populated = await newStudent.populate('userId', 'name email role avatar createdAt');
      return sendSuccess(res, 200, 'Profile fetched.', { student: populated });
    }

    sendSuccess(res, 200, 'Profile fetched.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/profile
 * Update student profile fields
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'rollNo', 'registrationNo', 'department', 'batch', 'semester',
      'phone', 'cgpa', 'backlogs', 'activeBacklogs', 'skills',
      'tenthPercentage', 'twelfthPercentage', 'profilePhotoUrl',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email role avatar');

    if (updates.profilePhotoUrl) {
      await User.findByIdAndUpdate(req.user.id, { avatar: updates.profilePhotoUrl });
    }

    sendSuccess(res, 200, 'Profile updated.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/resume
 * Upload resume PDF (stored in MongoDB for serverless durability)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'No resume file provided.');

    let student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      student = new Student({ userId: req.user.id });
    }

    const resumeBase64 = req.file.buffer.toString('base64');
    const resumeMimeType = req.file.mimetype || 'application/pdf';
    const resumeFileName = req.file.originalname || 'resume.pdf';
    const resumeUrl = `/api/students/${student._id}/resume`;

    student.resumeUrl = resumeUrl;
    student.resumeFileName = resumeFileName;
    student.resumeData = resumeBase64;
    student.resumeMimeType = resumeMimeType;
    await student.save();

    await student.populate('userId', 'name email role avatar');

    sendSuccess(res, 200, 'Resume uploaded successfully.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id/resume
 * Stream student's resume PDF
 */
const getStudentResume = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('+resumeData');
    if (!student || !student.resumeData) {
      if (student && student.resumeUrl && student.resumeUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', student.resumeUrl);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      }
      return sendError(res, 404, 'Resume not found.');
    }

    const fileBuffer = Buffer.from(student.resumeData, 'base64');
    res.set({
      'Content-Type': student.resumeMimeType || 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(student.resumeFileName || 'resume.pdf')}"`,
      'Content-Length': fileBuffer.length,
      'Cache-Control': 'public, max-age=86400',
    });

    return res.end(fileBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students/photo
 * Upload profile photo
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'No photo provided.');

    const profilePhotoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      { profilePhotoUrl },
      { new: true, upsert: true }
    ).populate('userId', 'name email role avatar');

    await User.findByIdAndUpdate(req.user.id, { avatar: profilePhotoUrl });

    sendSuccess(res, 200, 'Photo uploaded.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id  — Admin / Company: view a specific student
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'userId', 'name email role'
    );
    if (!student) return sendError(res, 404, 'Student not found.');
    sendSuccess(res, 200, 'Student fetched.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students — Admin: list all students with pagination + search
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, department, batch, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (status) filter.placementStatus = status;

    let query = Student.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const [students, total] = await Promise.all([
      query,
      Student.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Students fetched.', {
      students,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/students/:id/verify — T&P Cell / Admin: verify student marksheet & eligibility
 */
const verifyStudent = async (req, res, next) => {
  try {
    const { verificationStatus = 'verified', verificationRemarks = '' } = req.body;
    const isVerified = verificationStatus === 'verified';

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        isVerified,
        verificationRemarks,
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!student) return sendError(res, 404, 'Student not found.');
    sendSuccess(res, 200, 'Student verification updated.', { student });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/students/:id/noc — T&P Cell / Admin: Issue college NOC
 */
const issueStudentNoc = async (req, res, next) => {
  try {
    const { nocIssued = true } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        nocIssued,
        nocIssuedAt: nocIssued ? new Date() : null,
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!student) return sendError(res, 404, 'Student not found.');
    sendSuccess(res, 200, `Student NOC ${nocIssued ? 'issued' : 'revoked'}.`, { student });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadResume,
  getStudentResume,
  uploadPhoto,
  getStudentById,
  getAllStudents,
  verifyStudent,
  issueStudentNoc,
};
