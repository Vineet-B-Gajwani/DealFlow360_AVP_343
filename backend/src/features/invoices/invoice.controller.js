'use strict';

const invoiceService = require('./invoice.service');

async function getMyInvoices(req, res, next) {
  try {
    const invoices = await invoiceService.getMyInvoices(req.user.id);
    res.json({ success: true, data: { invoices } });
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.user.id, req.params.id);
    res.json({ success: true, data: { invoice } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyInvoices,
  getInvoiceById
};
