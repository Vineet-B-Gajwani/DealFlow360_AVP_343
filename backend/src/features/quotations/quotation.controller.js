'use strict';

const quotationService = require('./quotation.service');

async function createQuotation(req, res, next) {
  try {
    const actingUser = req.user;
    const quotation = await quotationService.createQuotation(req.body, actingUser);
    res.status(201).json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

async function getQuotations(req, res, next) {
  try {
    const quotations = await quotationService.getQuotations(req.query);
    res.json({ success: true, data: quotations });
  } catch (err) {
    next(err);
  }
}

async function getQuotationById(req, res, next) {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id);
    res.json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

async function addQuotationLine(req, res, next) {
  try {
    const quotation = await quotationService.addQuotationLine(req.params.id, req.body);
    res.json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

async function submitQuotation(req, res, next) {
  try {
    const actingUser = req.user;
    const quotation = await quotationService.submitQuotation(req.params.id, actingUser);
    res.json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

async function confirmQuotation(req, res, next) {
  try {
    const quotation = await quotationService.confirmQuotation(req.params.id);
    res.json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

async function listCustomers(req, res, next) {
  try {
    const customers = await quotationService.listCustomers();
    res.json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const recommendations = await quotationService.getRecommendations(req.params.id);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
}

async function removeQuotationLine(req, res, next) {
  try {
    const quotation = await quotationService.removeQuotationLine(req.params.id, req.params.lineId);
    res.json({ success: true, data: quotation });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  addQuotationLine,
  submitQuotation,
  confirmQuotation,
  listCustomers,
  getRecommendations,
  removeQuotationLine,
};
