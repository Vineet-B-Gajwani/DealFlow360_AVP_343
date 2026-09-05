'use strict';

const paymentService = require('./payment.service');

async function getPayments(req, res, next) {
  try {
    const payments = await paymentService.getPaymentsForInvoice(req.user.id, req.params.invoiceId);
    res.json({ success: true, data: { payments } });
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const payment = await paymentService.recordPayment(req.user.id, req.body);
    res.status(201).json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPayments,
  recordPayment
};
