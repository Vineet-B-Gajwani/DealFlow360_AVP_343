'use strict';

const negotiationService = require('./negotiation.service');

/**
 * GET /api/negotiation/quotation/:quotationId
 */
async function getNegotiations(req, res, next) {
  try {
    const negotiations = await negotiationService.getNegotiationsForQuotation(
      req.user.id,
      req.params.quotationId
    );
    res.json({ success: true, data: { negotiations } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/negotiation
 */
async function submitNegotiation(req, res, next) {
  try {
    const negotiation = await negotiationService.submitNegotiation(
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, data: { negotiation } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNegotiations,
  submitNegotiation,
};
