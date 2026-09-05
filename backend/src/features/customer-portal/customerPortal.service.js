'use strict';

const { User } = require('../auth/auth.model');
const { Customer } = require('./customer.model');

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

  return {
    portalActive: true,
    portalActivatedAt: customer?.portalActivatedAt ?? null,
    quotationCount: 0,          // Placeholder — populated by M3-F2 (quotation feature)
    pendingActions: 0,          // Placeholder — populated by future features
    lastActivity: customer?.updatedAt ?? null,
  };
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

module.exports = { getCustomerProfile, getPortalStatus };
