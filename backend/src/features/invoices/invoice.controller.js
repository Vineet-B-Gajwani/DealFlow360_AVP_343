'use strict';

const invoiceService = require('./invoice.service');

async function createInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  } catch (err) {
    next(err);
  }
}

async function listInvoices(req, res, next) {
  try {
    const { status, paymentStatus, page, limit } = req.query;
    const result = await invoiceService.listInvoices({
      userId: req.user.id,
      userRole: req.user.role,
      status,
      paymentStatus,
      page,
      limit,
    });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({
      success: true,
      data: { invoice },
    });
  } catch (err) {
    next(err);
  }
}

async function updateInvoiceStatus(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id,
      req.body.status
    );
    res.json({
      success: true,
      message: 'Invoice status updated',
      data: { invoice },
    });
  } catch (err) {
    next(err);
  }
}

async function downloadInvoicePDF(req, res, next) {
  try {
    const { invoice, pdfBuffer } = await invoiceService.generateInvoicePDF(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${invoice.invoiceNumber}_Paid.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  downloadInvoicePDF,
};
