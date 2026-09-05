'use strict';

const { Negotiation } = require('./negotiation.model');
const { Customer } = require('../customer-portal/customer.model');

// Integration note: In a real environment, we would also verify that quotationId
// actually belongs to the customerId via Member 1's quotation API before inserting.
// For now, we trust the customer's portal provides correct IDs, but we strictly
// bind the negotiation record to the authenticated Customer's ID.

/**
 * Get the Customer ID for a given authenticated User ID.
 */
async function getCustomerIdForUser(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found');
    err.statusCode = 404;
    throw err;
  }
  return customer._id;
}

/**
 * Fetch all negotiations for a specific quotation.
 * Security: Validates that the quotation is being queried by its owner.
 * 
 * @param {string} userId - From JWT (req.user.id)
 * @param {string} quotationId 
 */
async function getNegotiationsForQuotation(userId, quotationId) {
  const customerId = await getCustomerIdForUser(userId);
  
  // Return negotiations only if they belong to this customer and this quotation
  const negotiations = await Negotiation.find({
    quotationId,
    customerId,
  }).sort({ createdAt: -1 });

  return negotiations;
}

/**
 * Submit a new negotiation action (comment, counter-discount, etc.).
 * Security: Forces the customerId to be the authenticated user's customer ID.
 * Feature 4: Stores requestedValue cleanly for downstream reapproval prep.
 * 
 * @param {string} userId - From JWT (req.user.id)
 * @param {object} payload - { quotationId, quotationLineId, type, message, requestedValue }
 */
async function submitNegotiation(userId, payload) {
  const customerId = await getCustomerIdForUser(userId);

  const negotiation = await Negotiation.create({
    quotationId: payload.quotationId,
    customerId, // Forced server-side
    quotationLineId: payload.quotationLineId || null,
    type: payload.type,
    message: payload.message || '',
    requestedValue: payload.requestedValue || null,
    status: 'PENDING',
  });

  // Feature 4: Integration Point Note
  // At this point, in a fully integrated system, we would fire an event or 
  // call a service to alert Member 1/2's systems that a reapproval might be needed
  // if type === 'COUNTER_DISCOUNT'.
  
  return negotiation;
}

module.exports = {
  getNegotiationsForQuotation,
  submitNegotiation,
};
