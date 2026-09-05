'use strict';

const { Customer } = require('../customer-portal/customer.model');
const { Negotiation } = require('./negotiation.model');
const { prepareReapprovalPayload } = require('./reapprovalPrep.service');

/**
 * Helper to resolve Customer profile from req.user.id
 */
async function resolveCustomer(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found for this user account');
    err.statusCode = 404;
    throw err;
  }
  return customer;
}

/**
 * Create a negotiation action (LINE_COMMENT, CHANGE_REQUEST, COUNTER_DISCOUNT, CONFIRMATION).
 */
async function createNegotiation(userId, { quotationId, quotationLineId, type, message, requestedValue }) {
  const customer = await resolveCustomer(userId);

  const negotiation = await Negotiation.create({
    quotationId,
    customerId: customer._id,
    quotationLineId: quotationLineId || null,
    type,
    message,
    requestedValue: requestedValue !== undefined ? requestedValue : null,
    status: 'PENDING',
  });

  // Feature 4 Integration: prepare reapproval payload for commercial changes
  const reapprovalData = prepareReapprovalPayload({
    quotationId,
    quotationLineId,
    customerId: customer._id,
    requestedValue,
    negotiationType: type,
  });

  return {
    negotiation,
    reapprovalData,
  };
}

/**
 * Retrieve full negotiation history for a quotation.
 */
async function getNegotiationHistory(userId, quotationId) {
  const customer = await resolveCustomer(userId);

  const history = await Negotiation.find({
    quotationId,
    customerId: customer._id,
  }).sort({ createdAt: 1 });

  return history;
}

/**
 * Confirm a quotation.
 */
async function confirmQuotation(userId, quotationId, message = 'Quotation accepted and confirmed by customer') {
  const customer = await resolveCustomer(userId);

  const negotiation = await Negotiation.create({
    quotationId,
    customerId: customer._id,
    type: 'CONFIRMATION',
    message,
    status: 'RESOLVED',
  });

  return {
    success: true,
    message: 'Quotation confirmed successfully',
    negotiation,
  };
}

module.exports = {
  createNegotiation,
  getNegotiationHistory,
  confirmQuotation,
};
