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
/**
 * Generate PDF buffer for paid invoice
 */
function generateInvoicePDFBuffer(invoice, payments = []) {
  const customerName = invoice.customerId?.companyName || invoice.customerId?.identity?.name || 'Valued Customer';
  const grandTotal = invoice.total || invoice.grandTotal || 0;
  const subtotal = invoice.subtotal || 0;
  const tax = invoice.tax || 0;
  const discount = invoice.discount || 0;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const textLines = [
    '====================================================================',
    '                   DEALFLOW360 - COMMERCIAL INVOICE                 ',
    '                         OFFICIAL PAID RECEIPT                      ',
    '====================================================================',
    '',
    `Invoice Ref Number : ${invoice.invoiceNumber}`,
    `Issue Date         : ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}`,
    `Payment Status     : ${invoice.paymentStatus} (CONFIRMED & FULLY PAID)`,
    `Customer           : ${customerName}`,
    '',
    '--------------------------------------------------------------------',
    'LINE ITEMS & PRODUCT DETAILS',
    '--------------------------------------------------------------------',
  ];

  (invoice.lines || []).forEach((line, i) => {
    textLines.push(
      `${i + 1}. ${line.productName || 'Product Line'} | Qty: ${line.quantity} | Unit Price: INR ${line.unitPrice} | Total: INR ${line.lineTotal}`
    );
  });

  textLines.push(
    '--------------------------------------------------------------------',
    'FINANCIAL SUMMARY',
    '--------------------------------------------------------------------',
    `Subtotal           : INR ${subtotal.toLocaleString('en-IN')}`,
    `Discount           : INR ${discount.toLocaleString('en-IN')}`,
    `Tax (GST/VAT)      : INR ${tax.toLocaleString('en-IN')}`,
    `Grand Total        : INR ${grandTotal.toLocaleString('en-IN')}`,
    `Total Amount Paid  : INR ${(totalPaid || grandTotal).toLocaleString('en-IN')}`,
    `Remaining Balance  : INR 0.00`,
    '--------------------------------------------------------------------',
    '',
    'STATUS: FULLY PAID & CONFIRMED',
    'Thank you for your business!',
    'Generated by DealFlow360 Enterprise Revenue Management Platform',
    '===================================================================='
  );

  let stream = `BT\n/F1 11 Tf\n14 TL\n40 730 Td\n`;
  textLines.forEach((line) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    stream += `(${escaped}) ' \n`;
  });
  stream += `ET`;

  const streamLen = Buffer.byteLength(stream);

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000311 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${420 + streamLen}
%%EOF`;

  return Buffer.from(pdfString, 'utf-8');
}

async function generateInvoicePDF(id, userId, userRole) {
  const invoice = await getInvoiceById(id, userId, userRole);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  if (invoice.paymentStatus !== 'PAID' && invoice.status !== 'PAID') {
    const err = new Error('Invoice PDF download is only available after payment is fully completed and confirmed.');
    err.statusCode = 400;
    throw err;
  }

  const { Payment } = require('../payments/payment.model');
  const payments = await Payment.find({ invoiceId: id, status: 'COMPLETED' });

  const pdfBuffer = generateInvoicePDFBuffer(invoice, payments);
  return { invoice, pdfBuffer };
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  generateInvoicePDF,
};
