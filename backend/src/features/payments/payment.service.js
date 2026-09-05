'use strict';

const { Payment } = require('./payment.model');
const { Invoice } = require('../invoices/invoice.model');

/**
 * Record a payment and update the associated invoice paymentStatus
 */
async function recordPayment({ invoiceId, amount, method = 'BANK', reference = null }) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  // Create payment record
  const payment = await Payment.create({
    invoiceId,
    amount: Number(amount),
    method,
    reference,
    status: 'COMPLETED',
  });

  // Calculate total payments made for this invoice
  const allPayments = await Payment.find({ invoiceId, status: 'COMPLETED' });
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // Update invoice payment status
  if (totalPaid >= invoice.total) {
    invoice.paymentStatus = 'PAID';
    invoice.status = 'PAID';
  } else if (totalPaid > 0) {
    invoice.paymentStatus = 'PARTIAL';
    invoice.status = 'PARTIALLY_PAID';
  } else {
    invoice.paymentStatus = 'UNPAID';
  }

  await invoice.save();

  return {
    payment,
    invoice: {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      totalPaid,
      remainingBalance: Math.max(0, invoice.total - totalPaid),
      paymentStatus: invoice.paymentStatus,
      status: invoice.status,
    },
  };
}

/**
 * List payments for an invoice
 */
async function listInvoicePayments(invoiceId) {
  const payments = await Payment.find({ invoiceId }).sort({ createdAt: -1 });
  return payments;
}

module.exports = {
  recordPayment,
  listInvoicePayments,
};
