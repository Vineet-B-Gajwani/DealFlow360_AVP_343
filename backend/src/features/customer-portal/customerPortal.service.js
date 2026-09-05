'use strict';

const { User } = require('../auth/auth.model');
const { Customer } = require('./customer.model');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
//  Direct Mongoose Quotation access
//
//  Instead of HTTP loopback (which fails without auth headers), we use
//  the Quotation model directly. This is safe because both the portal
//  service and quotation model live in the same process.
// ─────────────────────────────────────────────────────────────────────────────

function getQuotationModel() {
  return mongoose.models.Quotation;
}

/**
 * Fetch all quotations for a given customerId directly from MongoDB.
 */
async function fetchQuotationsForCustomer(customerId) {
  const Quotation = getQuotationModel();
  if (!Quotation) return [];
  return await Quotation.find({ customerId }).sort({ createdAt: -1 });
}

/**
 * Fetch a single quotation by ID directly from MongoDB.
 */
async function fetchQuotationById(quotationId) {
  const Quotation = getQuotationModel();
  if (!Quotation) return null;
  return await Quotation.findById(quotationId).populate('lines.productId');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Service functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve the full customer profile for a given authenticated user.
 */
async function getCustomerProfile(userId) {
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

  let customer = await Customer.findOne({ userId });

  if (!customer) {
    customer = await Customer.create({
      userId,
      portalActivatedAt: new Date(),
    });
  } else if (!customer.portalActivatedAt) {
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
 */
async function getPortalStatus(userId) {
  const customer = await Customer.findOne({ userId });

  let quotationCount = 0;
  if (customer) {
    const quotations = await fetchQuotationsForCustomer(customer._id);
    quotationCount = quotations.length;
  }

  return {
    portalActive: true,
    portalActivatedAt: customer?.portalActivatedAt ?? null,
    quotationCount,
    pendingActions: 0,
    lastActivity: customer?.updatedAt ?? null,
  };
}

/**
 * Get all quotations for the authenticated customer.
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
    integrationAvailable: true,
    customerId: customer._id,
  };
}

/**
 * Get a single quotation by ID for the authenticated customer.
 * Ownership enforcement via JWT userId.
 */
async function getQuotationById(userId, quotationId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found');
    err.statusCode = 404;
    throw err;
  }

  const quotation = await fetchQuotationById(quotationId);

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check
  const quotationOwner = quotation.customerId?.toString();
  const thisCustomer = customer._id.toString();

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

function sanitizeCustomer(customer) {
  return {
    id: customer._id,
    companyName: customer.companyName,
    phone: customer.phone,
    address: customer.address,
    tier: customer.tier,
    portalActivatedAt: customer.portalActivatedAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

module.exports = { getCustomerProfile, getPortalStatus, getMyQuotations, getQuotationById };
