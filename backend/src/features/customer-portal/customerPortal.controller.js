'use strict';

const portalService = require('./customerPortal.service');

// ─────────────────────────────────────────────────────────────────────────────
//  Customer Portal Controllers
//
//  All controllers are thin HTTP handlers. Business logic lives in the service.
//  req.user is guaranteed to exist (authenticate runs first in the route chain).
//  req.user.role === 'CUSTOMER' is guaranteed (requireCustomer runs first).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/portal/me
 *
 * Returns the authenticated customer's full profile (identity + business profile).
 * The lookup is keyed on req.user.id — not on any request body/param.
 */
async function getMyProfile(req, res, next) {
  try {
    const result = await portalService.getCustomerProfile(req.user.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/portal/status
 *
 * Returns portal metadata for the customer dashboard:
 * portal active status, activation date, and placeholder counts for future features.
 * The lookup is keyed on req.user.id — not on any request body/param.
 */
async function getPortalStatus(req, res, next) {
  try {
    const status = await portalService.getPortalStatus(req.user.id);

    res.json({
      success: true,
      data: { status },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, getPortalStatus };
