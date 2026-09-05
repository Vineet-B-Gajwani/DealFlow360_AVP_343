'use strict';

const negotiationService = require('./negotiation.service');

async function createNegotiation(req, res, next) {
  try {
    const result = await negotiationService.createNegotiation(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Negotiation action recorded',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getNegotiationHistory(req, res, next) {
  try {
    const history = await negotiationService.getNegotiationHistory(
      req.user.id,
      req.params.quotationId
    );
    res.json({
      success: true,
      data: { history },
    });
  } catch (err) {
    next(err);
  }
}

async function confirmQuotation(req, res, next) {
  try {
    const result = await negotiationService.confirmQuotation(
      req.user.id,
      req.params.quotationId,
      req.body.message
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createNegotiation,
  getNegotiationHistory,
  confirmQuotation,
};
