// backend/src/middleware/roleCheck.js
'use strict';
/**
 * roleCheck middleware factory
 *
 * Returns an Express middleware that checks whether the authenticated user
 * has at least one of the allowed roles. This is useful for routes that
 * can be accessed by multiple roles (e.g., ADMIN or SALES_MANAGER).
 *
 * Must be used AFTER the `authenticate` middleware so that `req.user`
 * is populated.
 *
 * Usage examples:
 *   router.get('/admin-or-manager', authenticate, roleCheck(['ADMIN', 'SALES_MANAGER']), controller);
 *   router.post('/sales-only', authenticate, roleCheck('SALES'), controller);
 *
 * @param {...string|Array<string>} allowedRoles - One or more role strings or an array of role strings.
 * @returns {function} Express middleware
 */
function roleCheck(...allowedRoles) {
  // Support passing a single array as the first argument
  if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
    allowedRoles = allowedRoles[0];
  }

  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = roleCheck;
