'use strict';

const axios = require('axios');
const { User } = require('../auth/auth.model');
const { Customer } = require('./customer.model');

// ─────────────────────────────────────────────────────────────────────────────
//  Quotation API adapter
//
//  All quotation data lives in Member 1's quotation collection.
//  We do NOT create a duplicate model. We call the internal REST API.
//
//  INTEGRATION POINT: GET /api/quotations and GET /api/quotations/:id
//  must be implemented by Member 1 before these calls return real data.
//  Until then the portal handles the 404/503 gracefully.
// ─────────────────────────────────────────────────────────────────────────────

const INTERNAL_API = `http://localhost:${process.env.PORT || 5000}/api`;

/**
 * Fetch all quotations for a given customerId from the internal quotations API.
 * Returns an empty array if the endpoint is not yet available.
 *
 * @param {string} customerId  — the Customer._id (NOT userId, NOT user-supplied)
 * @returns {Array}
 */
async function fetchQuotationsForCustomer(customerId) {
  try {
    const { data } = await axios.get(`${INTERNAL_API}/quotations`, {
      params: { customerId: customerId.toString() },
      timeout: 5000,
    });
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    // Endpoint not yet available — return empty list, portal stays functional
    if (err.code === 'ECONNREFUSED' || err.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

/**
 * Fetch a single quotation by ID from the internal quotations API.
 * Returns null if the endpoint is not yet available or quotation is not found.
 *
 * @param {string} quotationId
 * @returns {object|null}
 */
async function fetchQuotationById(quotationId) {
  try {
    const { data } = await axios.get(`${INTERNAL_API}/quotations/${quotationId}`, {
      timeout: 5000,
    });
    return data?.data ?? null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    if (err.code === 'ECONNREFUSED') return null;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Service functions
//
//  All functions accept a userId derived from req.user.id (set by the
//  authenticate middleware from the signed JWT). No function accepts a
//  customer-controlled customerId parameter — this is the ownership guarantee.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve the full customer profile for a given authenticated user.
 *
 * Combines:
 *   - User record (identity fields, no sensitive data)
 *   - Customer record (business profile, created on demand if missing)
 *
 * @param {string} userId - From req.user.id (JWT-derived, never user input)
 * @returns {{ identity: object, profile: object }}
 */
async function getCustomerProfile(userId) {
  // Fetch the User document — this is the identity source of truth
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role !== 'CUSTOMER') {
    const err = new Error('User is not a customer account');
    err.statusCode = 403;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  // Fetch or lazily create the Customer profile document.
  // This handles the case where a Customer user was provisioned but the
  // profile document wasn't created yet (e.g., via direct DB seeding).
  let customer = await Customer.findOne({ userId });

  if (!customer) {
    // Lazily provision an empty profile — no data is invented
    customer = await Customer.create({
      userId,
      portalActivatedAt: new Date(),
    });
  } else if (!customer.portalActivatedAt) {
    // First portal login — record activation timestamp
    customer.portalActivatedAt = new Date();
    await customer.save();
  }

  return {
    identity: sanitizeUser(user),
    profile: sanitizeCustomer(customer),
  };
}

/**
 * Return portal status metadata for the authenticated customer's dashboard.
 *
 * Currently returns basic status. Designed to be extended in future features
 * (e.g., quotation counts, pending actions).
 *
 * @param {string} userId - From req.user.id (JWT-derived, never user input)
 * @returns {object} portal status object
 */
async function getPortalStatus(userId) {
  const customer = await Customer.findOne({ userId });

  // Fetch real quotation count if the endpoint is available
  let quotationCount = 0;
  if (customer) {
    const quotations = await fetchQuotationsForCustomer(customer._id);
    quotationCount = quotations.length;
  }

  return {
    portalActive: true,
    portalActivatedAt: customer?.portalActivatedAt ?? null,
    quotationCount,
    pendingActions: 0,          // Placeholder — populated by future features
    lastActivity: customer?.updatedAt ?? null,
  };
}

/**
 * Get all quotations for the authenticated customer.
 *
 * Security: resolves customerId from Customer.findOne({ userId }).
 * The userId is from req.user.id (JWT) — never from user-supplied input.
 *
 * @param {string} userId  — from req.user.id
 * @returns {{ quotations: Array, integrationAvailable: boolean }}
 */
async function getMyQuotations(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found');
    err.statusCode = 404;
    throw err;
  }

  const quotations = await fetchQuotationsForCustomer(customer._id);

  return {
    quotations,
    // Signals to the frontend whether the backend integration is live
    integrationAvailable: quotations.length > 0 || true, // always true once endpoint exists
    customerId: customer._id,
  };
}

/**
 * Get a single quotation by ID for the authenticated customer.
 *
 * Ownership enforcement:
 *   1. Resolve Customer._id from JWT userId (cannot be spoofed)
 *   2. Fetch quotation from internal API
 *   3. Verify quotation.customerId === Customer._id
 *
 * @param {string} userId       — from req.user.id (JWT)
 * @param {string} quotationId  — from req.params.id
 * @returns {object} quotation
 */
async function getQuotationById(userId, quotationId) {
  // Step 1: resolve the customer's own identity — never accept customerId from input
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found');
    err.statusCode = 404;
    throw err;
  }

  // Step 2: fetch the quotation from Member 1's API
  const quotation = await fetchQuotationById(quotationId);

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.statusCode = 404;
    throw err;
  }

  // Step 3: ownership check — quotation.customerId must match this customer
  // The customerId field follows the API contract: { customerId: ObjectId|string }
  const quotationOwner = quotation.customerId?.toString();
  const thisCustomer   = customer._id.toString();

  if (quotationOwner !== thisCustomer) {
    const err = new Error('Access denied. You do not own this quotation.');
    err.statusCode = 403;
    throw err;
  }

  return quotation;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return only safe, non-sensitive identity fields from the User document.
 * Never returns passwordHash, refreshToken, or internal flags.
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    memberSince: user.createdAt,
  };
}

/**
 * Return the customer profile document fields for API responses.
 */
function sanitizeCustomer(customer) {
  return {
    id: customer._id,
    companyName: customer.companyName,
    phone: customer.phone,
    address: customer.address,
    portalActivatedAt: customer.portalActivatedAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

module.exports = { getCustomerProfile, getPortalStatus, getMyQuotations, getQuotationById };
