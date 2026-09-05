'use strict';

const { Router } = require('express');
const controller = require('./customerPortal.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

// ── Security chain applied to ALL portal routes ───────────────────────────────
//
//  Every route in this file is protected by:
//    1. authenticate  — validates JWT, sets req.user = { id, email, role }
//    2. requireCustomer — rejects (403) if role !== 'CUSTOMER'
//
//  This means:
//    - Unauthenticated requests → 401
//    - SALES_REP / ADMIN / WAREHOUSE users → 403
//    - CUSTOMER with valid token → proceed
//
//  Resource lookups inside controllers always use req.user.id (from the
//  JWT payload), never a customer-supplied ID from the request.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/portal/me
 *
 * Returns the authenticated customer's identity + business profile.
 * No request body or path parameters are accepted.
 */
router.get('/me', authenticate, requireCustomer, controller.getMyProfile);

/**
 * GET /api/portal/status
 *
 * Returns portal status metadata for the customer dashboard:
 * activation date, placeholder counts for future features (quotations, etc.).
 */
router.get('/status', authenticate, requireCustomer, controller.getPortalStatus);

// ── Quotation routes ──────────────────────────────────────────────────────────

/**
 * GET /api/portal/quotations
 *
 * Returns all quotations belonging to the authenticated customer.
 * customerId is resolved from req.user.id (JWT) — never from query params.
 *
 * INTEGRATION POINT: Proxies to GET /api/quotations?customerId=<id>
 * Requires Member 1's quotation endpoint to be available.
 */
router.get('/quotations', authenticate, requireCustomer, controller.getMyQuotations);

/**
 * GET /api/portal/quotations/:id
 *
 * Returns a single quotation. Enforces ownership:
 *   quotation.customerId must match the authenticated customer's ID.
 * Returns 403 if the customer does not own the quotation.
 *
 * INTEGRATION POINT: Proxies to GET /api/quotations/:id
 */
router.get('/quotations/:id', authenticate, requireCustomer, controller.getQuotation);

module.exports = router;

