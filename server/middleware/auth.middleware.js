const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendError } = require('../utils/response');

/**
 * Verify JWT from HTTP-only cookie or Authorization header.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check cookie first (preferred)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback: Authorization header (for Postman/API clients)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authenticated. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
