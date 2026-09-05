'use strict';

const mongoose = require('mongoose');
const { Customer } = require('../customer-portal/customer.model');
const { Negotiation } = require('./negotiation.model');
const { prepareReapprovalPayload } = require('./reapprovalPrep.service');
const { Quotation, QUOTATION_STATUS } = require('../quotations/quotation.model');

/**
 * Helper to resolve Customer profile from req.user.id or quotation
 */
async function resolveCustomer(userId, quotationId) {
  let customer = await Customer.findOne({ userId });
  if (!customer && quotationId) {
    const quotation = await Quotation.findById(quotationId);
    if (quotation && quotation.customerId) {
      customer = await Customer.findById(quotation.customerId);
    }
  }
  if (!customer) {
    customer = await Customer.findOne({});
  }
  return customer;
}

/**
 * Create a negotiation action (LINE_COMMENT, CHANGE_REQUEST, COUNTER_DISCOUNT, CONFIRMATION).
 */
async function createNegotiation(userId, { quotationId, quotationLineId, type, message, requestedValue }) {
  const customer = await resolveCustomer(userId, quotationId);

  const defaultMsg = type === 'COUNTER_DISCOUNT'
    ? `Customer requested counter-discount rate of ${requestedValue || 0}%`
    : 'Negotiation proposal submitted';

  const negotiation = await Negotiation.create({
    quotationId,
    customerId: customer ? customer._id : null,
    quotationLineId: quotationLineId || null,
    type,
    message: message && message.trim() ? message.trim() : defaultMsg,
    requestedValue: requestedValue !== undefined && requestedValue !== null ? Number(requestedValue) : null,
    status: 'PENDING',
  });

  const quotation = await Quotation.findById(quotationId);
  if (quotation) {
    quotation.status = QUOTATION_STATUS.NEGOTIATING;
    await quotation.save();
  }

  // Feature 4 Integration: prepare reapproval payload for commercial changes
  const reapprovalData = prepareReapprovalPayload({
    quotationId,
    quotationLineId,
    customerId: customer ? customer._id : null,
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
  if (!quotationId) return [];

  let query = { quotationId };
  if (mongoose.Types.ObjectId.isValid(quotationId)) {
    const objId = new mongoose.Types.ObjectId(quotationId);
    query = {
      $or: [
        { quotationId: objId },
        { quotationId: String(quotationId) }
      ]
    };
  }

  const history = await Negotiation.find(query)
    .sort({ createdAt: 1 })
    .populate('customerId', 'companyName name email');

  return history;
}

/**
 * Confirm a quotation.
 */
async function confirmQuotation(userId, quotationId, message = 'Quotation accepted and confirmed by customer') {
  const customer = await resolveCustomer(userId, quotationId);

  const negotiation = await Negotiation.create({
    quotationId,
    customerId: customer ? customer._id : null,
    type: 'CONFIRMATION',
    message,
    status: 'RESOLVED',
  });

  const quotationService = require('../quotations/quotation.service');
  await quotationService.confirmQuotation(quotationId);

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
