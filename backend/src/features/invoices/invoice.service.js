'use strict';

const { Invoice } = require('./invoice.model');
const { Customer } = require('../customer-portal/customer.model');

/**
 * Get Customer ID for User ID
 */
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
 * Get all invoices for the authenticated customer.
 */
async function getMyInvoices(userId) {
  const customerId = await getCustomerIdForUser(userId);
  const invoices = await Invoice.find({ customerId }).sort({ issueDate: -1, createdAt: -1 });
  return invoices;
}

/**
 * Get a single invoice by ID, ensuring it belongs to the authenticated customer.
 */
async function getInvoiceById(userId, invoiceId) {
  const customerId = await getCustomerIdForUser(userId);
  const invoice = await Invoice.findOne({ _id: invoiceId, customerId });
  
  if (!invoice) {
    const err = new Error('Invoice not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return invoice;
}

// Integration Point for M1/M2:
// When an order is confirmed, they will call a method (e.g. `createInvoiceFromOrder(orderData)`)
// to populate the Invoice collection. Since this is just the portal side, 
// we only implement the read side for customers for now. 
// A mock creation script could be added later if needed for demo purposes.

module.exports = {
  getMyInvoices,
  getInvoiceById
};
