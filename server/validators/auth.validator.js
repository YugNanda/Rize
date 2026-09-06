const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Run validation results and return 400 if any errors found.
 * Used as a standalone middleware after validator chains.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, 'Validation failed', messages);
  }
  next();
};

// Chains only — validate is applied separately in routes
const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['student', 'company', 'admin'])
    .withMessage('Invalid role'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// Export arrays including the validate function at the end
const registerValidator = [...registerRules, validate];
const loginValidator = [...loginRules, validate];
const changePasswordValidator = [...changePasswordRules, validate];

module.exports = { registerValidator, loginValidator, changePasswordValidator, validate };
