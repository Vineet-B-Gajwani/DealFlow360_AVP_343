'use strict';

const { Invoice } = require('../invoices/invoice.model');
const { Payment } = require('../payments/payment.model');
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
 * Generate customer spend reporting.
 */
async function getCustomerReporting(userId) {
  const customerId = await getCustomerIdForUser(userId);

  // 1. Total Spend and Outstanding Balance from Invoices
  const invoiceAgg = await Invoice.aggregate([
    { $match: { customerId } },
    {
      $group: {
        _id: null,
        totalInvoiced: { $sum: '$grandTotal' },
        totalDiscounts: { $sum: '$discountTotal' },
        invoiceCount: { $sum: 1 },
      }
    }
  ]);

  // 2. Total Payments Made
  const paymentAgg = await Payment.aggregate([
    { $match: { customerId, status: 'COMPLETED' } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        paymentCount: { $sum: 1 },
      }
    }
  ]);

  const invoiced = invoiceAgg[0] || { totalInvoiced: 0, totalDiscounts: 0, invoiceCount: 0 };
  const paid = paymentAgg[0] || { totalPaid: 0, paymentCount: 0 };
  const outstandingBalance = invoiced.totalInvoiced - paid.totalPaid;

  return {
    totalInvoiced: invoiced.totalInvoiced,
    totalDiscounts: invoiced.totalDiscounts,
    invoiceCount: invoiced.invoiceCount,
    totalPaid: paid.totalPaid,
    paymentCount: paid.paymentCount,
    outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
  };
}

module.exports = {
  getCustomerReporting
};
