'use strict';

const { Invoice } = require('./invoice.model');
const { Customer } = require('../customer-portal/customer.model');

/**
 * Generate a unique sequential-style invoice number
 */
async function generateInvoiceNumber() {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${year}-${sequence}`;
}

/**
 * Create invoice from confirmed commercial transaction/quotation
 */
async function createInvoice(data) {
  const invoiceNumber = await generateInvoiceNumber();

  let subtotal = 0;
  let totalDiscount = 0;

  const processedLines = data.lines.map((line) => {
    const qty = Number(line.quantity);
    const price = Number(line.unitPrice);
    const disc = Number(line.discount || 0);
    const lineSub = qty * price;
    const lineDisc = (lineSub * disc) / 100;
    const lineTotal = lineSub - lineDisc;

    subtotal += lineSub;
    totalDiscount += lineDisc;

    return {
      productId: line.productId,
      productName: line.productName,
      quantity: qty,
      unitPrice: price,
      discount: disc,
      lineTotal,
    };
  });

  const tax = Number(data.tax || 0);
  const total = subtotal - totalDiscount + tax;

  const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const invoice = await Invoice.create({
    invoiceNumber,
    sourceOrderId: data.sourceOrderId,
    customerId: data.customerId,
    lines: processedLines,
    subtotal,
    discount: totalDiscount,
    tax,
    total,
    status: 'ISSUED',
    paymentStatus: 'UNPAID',
    issueDate: new Date(),
    dueDate,
  });

  return invoice;
}

/**
 * List invoices with filtering & pagination.
 * If userRole is CUSTOMER, customerId is derived from req.user.id.
 */
async function listInvoices({ userId, userRole, status, paymentStatus, page = 1, limit = 10 }) {
  const query = {};

  if (userRole === 'CUSTOMER') {
    const customer = await Customer.findOne({ userId });
    if (!customer) return { invoices: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
    query.customerId = customer._id;
  }

  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('customerId', 'companyName phone address'),
    Invoice.countDocuments(query),
  ]);

  return {
    invoices,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

/**
 * Get invoice detail by ID with ownership verification for CUSTOMER role.
 */
async function getInvoiceById(id, userId, userRole) {
  const invoice = await Invoice.findById(id).populate('customerId', 'companyName phone address');
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  if (userRole === 'CUSTOMER') {
    const customer = await Customer.findOne({ userId });
    if (!customer || String(invoice.customerId._id || invoice.customerId) !== String(customer._id)) {
      const err = new Error('Access denied: You do not own this invoice');
      err.statusCode = 403;
      throw err;
    }
  }

  return invoice;
}

/**
 * Update status
 */
async function updateInvoiceStatus(id, status) {
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }
  return invoice;
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
};
