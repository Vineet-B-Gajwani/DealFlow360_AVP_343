'use strict';

/**
 * requireCustomer middleware
 *
 * Ensures the authenticated user has the CUSTOMER role.
 * Must be used AFTER the `authenticate` middleware so that `req.user` exists.
 *
 * Returns:
 *   401 — if no authenticated user (authenticate middleware missing from chain)
 *   403 — if the user's role is not CUSTOMER
 *
 * Usage:
 *   router.get('/portal/me', authenticate, requireCustomer, controller.getMyProfile);
 */
function requireCustomer(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authenticated' });
  }

  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer portal is restricted to CUSTOMER accounts.',
    });
  }

  next();
}

/**
 * requireOwnership — generic ownership-check middleware factory.
 *
 * Used to prevent a customer from accessing another customer's resources by
 * supplying an arbitrary ID. All ownership checks are resolved against
 * `req.user.id` (derived from the signed JWT — not from user-supplied input).
 *
 * @param {Function} getOwnerId
 *   An async function (req) => string|ObjectId that returns the ID of the
 *   resource owner. Return null/undefined to signal "not found".
 *
 * @returns {Function} Express middleware
 *
 * Usage (future quotation feature example):
 *
 *   async function getQuotationOwnerId(req) {
 *     const q = await Quotation.findById(req.params.id).select('customerId');
 *     return q?.customerId?.toString();
 *   }
 *
 *   router.get(
 *     '/quotations/:id',
 *     authenticate,
 *     requireCustomer,
 *     requireOwnership(getQuotationOwnerId),
 *     controller.getQuotation
 *   );
 */
function requireOwnership(getOwnerId) {
  return async function ownershipGuard(req, res, next) {
    try {
      const ownerId = await getOwnerId(req);

      if (ownerId === null || ownerId === undefined) {
        return res
          .status(404)
          .json({ success: false, message: 'Resource not found' });
      }

      // Compare owner ID against the authenticated user's ID from the JWT.
      // req.user.id is set by the authenticate middleware — it is NOT user-supplied.
      if (ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireCustomer, requireOwnership };
