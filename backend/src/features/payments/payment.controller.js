'use strict';

const paymentService = require('./payment.service');

async function recordPayment(req, res, next) {
  try {
    const result = await paymentService.recordPayment(req.body);
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function listInvoicePayments(req, res, next) {
  try {
    const payments = await paymentService.listInvoicePayments(req.params.invoiceId);
    res.json({
      success: true,
      data: { payments },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordPayment,
  listInvoicePayments,
};
