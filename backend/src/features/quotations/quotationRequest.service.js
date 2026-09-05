'use strict';

const QuotationRequest = require('./quotationRequest.model');
const { Customer } = require('../customer-portal/customer.model');
const quotationService = require('./quotation.service');

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Customer submits a product demand / quote request
 */
async function createRequest(userId, { items, notes = '', requestedDeliveryDate }) {
  const customer = await Customer.findOne({ userId });
  if (!customer) throw makeError('Customer profile not found', 404);

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw makeError('At least one product item is required', 400);
  }

  const formattedItems = items.map((item) => ({
    productId: item.productId,
    quantity: parseInt(item.quantity || 1, 10),
  }));

  const request = new QuotationRequest({
    customerId: customer._id,
    requestedBy: userId,
    items: formattedItems,
    notes,
    requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : null,
  });

  await request.save();
  return await QuotationRequest.findById(request._id).populate('items.productId');
}

/**
 * Get all quotation requests created by the authenticated customer
 */
async function getRequestsForCustomer(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) throw makeError('Customer profile not found', 404);

  return await QuotationRequest.find({ customerId: customer._id })
    .populate('items.productId')
    .sort({ createdAt: -1 });
}

/**
 * Get pending quotation requests for Sales Reps / Admins
 */
async function getPendingRequests() {
  return await QuotationRequest.find({ status: 'PENDING' })
    .populate({
      path: 'customerId',
      populate: { path: 'userId', select: 'name email' },
    })
    .populate('items.productId')
    .sort({ createdAt: -1 });
}

/**
 * Sales Rep converts a customer quote request into a real draft Quotation
 */
async function convertRequestToQuotation(requestId, actingUser) {
  const reqDoc = await QuotationRequest.findById(requestId);
  if (!reqDoc) throw makeError('Quotation request not found', 404);
  if (reqDoc.status !== 'PENDING') {
    throw makeError(`Request is already ${reqDoc.status}`, 400);
  }

  // Create new draft quotation
  const newQuotation = await quotationService.createQuotation(
    {
      customerId: reqDoc.customerId,
      quotationRequestId: reqDoc._id,
      notes: reqDoc.notes ? `Created from customer buy demand: ${reqDoc.notes}` : 'Created from customer buy demand',
      requestedDeliveryDate: reqDoc.requestedDeliveryDate,
    },
    actingUser
  );

  // Add all requested items as quotation lines
  for (const item of reqDoc.items) {
    if (item.productId) {
      await quotationService.addQuotationLine(newQuotation._id, {
        productId: item.productId,
        quantity: item.quantity,
        discount: 0,
      });
    }
  }

  // Mark request as converted
  reqDoc.status = 'CONVERTED';
  reqDoc.convertedQuotationId = newQuotation._id;
  await reqDoc.save();

  // Return fresh populated quotation
  return await quotationService.getQuotationById(newQuotation._id);
}

module.exports = {
  createRequest,
  getRequestsForCustomer,
  getPendingRequests,
  convertRequestToQuotation,
};
