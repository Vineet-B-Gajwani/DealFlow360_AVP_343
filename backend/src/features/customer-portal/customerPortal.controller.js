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

/**
 * GET /api/portal/quotations
 *
 * Returns all quotations belonging to the authenticated customer.
 * Ownership is resolved server-side from req.user.id — not from any query param.
 */
async function getMyQuotations(req, res, next) {
  try {
    const result = await portalService.getMyQuotations(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/portal/quotations/:id
 *
 * Returns a single quotation if it belongs to the authenticated customer.
 * Ownership check (customerId === customer identity) is enforced in the service.
 * Returns 403 if the quotation belongs to a different customer.
 */
async function getQuotation(req, res, next) {
  try {
    const quotation = await portalService.getQuotationById(
      req.user.id,
      req.params.id
    );
    res.json({ success: true, data: { quotation } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, getPortalStatus, getMyQuotations, getQuotation };

