'use strict';

const { ROLES } = require('../models/User');

/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('hr'), handler)
 *   router.get('/shared', authenticate, authorize('hr', 'employee'), handler)
 *
 * Must be used AFTER the `authenticate` middleware so that req.user is populated.
 *
 * @param {...string} allowedRoles - One or more roles permitted to access the route.
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  // Validate at startup that only known roles are passed to this factory.
  for (const role of allowedRoles) {
    if (!ROLES.includes(role)) {
      throw new Error(
        `authorize() received unknown role "${role}". Valid roles: ${ROLES.join(', ')}`
      );
    }
  }

  return function (req, res, next) {
    if (!req.user) {
      // This should not happen if authenticate() is used first, but guard anyway.
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires one of [${allowedRoles.join(', ')}] role`,
      });
    }

    next();
  };
}

module.exports = { authorize };
