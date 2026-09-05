'use strict';

/**
 * authorize middleware factory
 *
 * Returns an Express middleware that checks whether the authenticated user
 * has one of the permitted roles.
 *
 * Must be used AFTER the `authenticate` middleware so that `req.user` exists.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('ADMIN'), controller);
 *   router.get('/managers', authenticate, authorize('SALES_MANAGER', 'ADMIN'), controller);
 *
 * @param {...string} roles - One or more role strings that are permitted access.
 * @returns {Function} Express middleware
 */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = authorize;
