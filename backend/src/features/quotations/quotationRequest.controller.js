'use strict';

const requestService = require('./quotationRequest.service');

async function createCustomerRequest(req, res, next) {
  try {
    const result = await requestService.createRequest(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getCustomerRequests(req, res, next) {
  try {
    const result = await requestService.getRequestsForCustomer(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getPendingRequests(req, res, next) {
  try {
    const result = await requestService.getPendingRequests();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function convertRequestToQuotation(req, res, next) {
  try {
    const result = await requestService.convertRequestToQuotation(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCustomerRequest,
  getCustomerRequests,
  getPendingRequests,
  convertRequestToQuotation,
};
