'use strict';

const { sendError } = require('../utils/response');

/**
 * authorize(...roles) — role-based access control middleware.
 * Must be used AFTER protect middleware.
 *
 * Usage:
 *   router.get('/admin', protect, authorize('admin', 'hr'), handler)
 *   router.get('/all', protect, authorize('admin', 'hr', 'employee'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Access denied. Required role: ${roles.join(' or ')}.`);
    }
    next();
  };
};

module.exports = { authorize };
