'use strict';

const { Payment } = require('./payment.model');
const { Invoice } = require('../invoices/invoice.model');
const { Customer } = require('../customer-portal/customer.model');

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
 * Fetch payments for a specific invoice.
 */
async function getPaymentsForInvoice(userId, invoiceId) {
  const customerId = await getCustomerIdForUser(userId);
  
  // Verify invoice belongs to customer first
  const invoice = await Invoice.findOne({ _id: invoiceId, customerId });
  if (!invoice) {
    const err = new Error('Invoice not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const payments = await Payment.find({ invoiceId, customerId }).sort({ paymentDate: -1, createdAt: -1 });
  return payments;
}

/**
 * Record a new payment and update invoice status.
 */
async function recordPayment(userId, payload) {
  const customerId = await getCustomerIdForUser(userId);
  const { invoiceId, amount, method, reference } = payload;

  // 1. Validate Invoice ownership and state
  const invoice = await Invoice.findOne({ _id: invoiceId, customerId });
  if (!invoice) {
    const err = new Error('Invoice not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  if (invoice.paymentStatus === 'PAID') {
    const err = new Error('Invoice is already fully paid');
    err.statusCode = 400;
    throw err;
  }

  // 2. Create Payment Record
  const payment = await Payment.create({
    invoiceId,
    customerId,
    amount,
    method,
    reference,
    status: 'COMPLETED'
  });

  // 3. Recalculate Invoice Payment Status
  const allPayments = await Payment.find({ invoiceId, status: 'COMPLETED' });
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

  let newPaymentStatus = 'UNPAID';
  if (totalPaid >= invoice.grandTotal) {
    newPaymentStatus = 'PAID';
  } else if (totalPaid > 0) {
    newPaymentStatus = 'PARTIAL';
  }

  // Update invoice
  invoice.paymentStatus = newPaymentStatus;
  await invoice.save();

  return payment;
}

module.exports = {
  getPaymentsForInvoice,
  recordPayment
};
