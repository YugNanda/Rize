const { sendError } = require('../utils/response');

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin', 'company')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated.');
    }
    const effectiveRoles = [...roles];
    if (roles.includes('admin') && !effectiveRoles.includes('tpcell')) {
      effectiveRoles.push('tpcell');
    }
    if (!effectiveRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }
    next();
  };
};

module.exports = { authorize };
