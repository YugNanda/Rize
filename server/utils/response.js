/**
 * Send a standardized success response.
 * Shape: { success: true, message, data }
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send a standardized error response.
 * Shape: { success: false, message, errors }
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong', errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { sendSuccess, sendError };
