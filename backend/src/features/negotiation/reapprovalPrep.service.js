'use strict';

/**
 * Reapproval Preparation Service
 *
 * Feature 4 Boundary Interface.
 * When a customer submits a commercial modification (COUNTER_DISCOUNT or CHANGE_REQUEST),
 * this service formats and prepares a clean integration payload for future consumption
 * by Member 1 (discount risk engine) and Member 2 (approval workflow engine).
 */

/**
 * Prepares and returns a structured reapproval payload when a commercial change is requested.
 *
 * @param {object} params
 * @param {string} params.quotationId
 * @param {string} [params.quotationLineId]
 * @param {string} params.customerId
 * @param {number} [params.requestedValue]
 * @param {string} params.negotiationType
 * @returns {object} Structured reapproval record
 */
function prepareReapprovalPayload({
  quotationId,
  quotationLineId = null,
  customerId,
  requestedValue = null,
  negotiationType,
}) {
  const isCommercialChange =
    negotiationType === 'COUNTER_DISCOUNT' || negotiationType === 'CHANGE_REQUEST';

  return {
    quotationId,
    quotationLineId,
    customerId,
    requestedValue,
    negotiationType,
    reapprovalRequired: isCommercialChange,
    status: isCommercialChange ? 'PENDING_REAPPROVAL' : 'NO_REAPPROVAL_REQUIRED',
    preparedAt: new Date().toISOString(),
  };
}

module.exports = {
  prepareReapprovalPayload,
};
