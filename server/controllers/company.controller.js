const Company = require('../models/Company.model');
const User = require('../models/User.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/companies/profile  — company's own profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne({ createdBy: req.user.id });

    if (!company) {
      // Auto-create on first access using user data
      const user = await User.findById(req.user.id);
      company = await Company.create({
        name: user.name,
        email: user.email,
        createdBy: req.user.id,
      });
    }

    sendSuccess(res, 200, 'Company profile fetched.', { company });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/companies/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'website', 'industry', 'description', 'location', 'logoUrl'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const company = await Company.findOneAndUpdate(
      { createdBy: req.user.id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    sendSuccess(res, 200, 'Company profile updated.', { company });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/companies/logo
 */
const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'No logo file provided.');

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const company = await Company.findOneAndUpdate(
      { createdBy: req.user.id },
      { logoUrl },
      { new: true, upsert: true }
    );

    sendSuccess(res, 200, 'Logo uploaded.', { company });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/companies  — Admin: list all companies
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Company.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Companies fetched.', {
      companies,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/companies/:id  — Anyone can fetch a company profile
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return sendError(res, 404, 'Company not found.');
    sendSuccess(res, 200, 'Company fetched.', { company });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/companies/:id/verify  — Admin: verify a company
 */
const verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!company) return sendError(res, 404, 'Company not found.');
    sendSuccess(res, 200, 'Company verified.', { company });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, updateProfile, uploadLogo, getAllCompanies, getCompanyById, verifyCompany };
