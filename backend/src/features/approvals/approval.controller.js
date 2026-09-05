'use strict';

const { validationResult } = require('express-validator');
const approvalService = require('./approval.service');

// ── Helper ────────────────────────────────────────────────────────────────────

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true; // signals "respond was sent"
  }
  return false;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/approvals
 * Body: { quotationId, riskScore, requiredLevel, requestedBy }
 *
 * The acting user is req.user (from authenticate middleware).
 */
async function createApproval(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const approval = await approvalService.createApproval(req.body, req.user);
    res.status(201).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/approvals
 * Optional query: ?status=PENDING&quotationId=xyz
 */
async function listApprovals(req, res, next) {
  try {
    const approvals = await approvalService.listApprovals(req.query);
    res.status(200).json({ success: true, count: approvals.length, data: approvals });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/approvals/:id
 */
async function getApprovalById(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const approval = await approvalService.getApprovalById(req.params.id);
    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/approvals/:id/approve
 * Body: { reason? }
 */
async function approveApproval(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const approval = await approvalService.approveApproval(
      req.params.id,
      req.user,
      req.body.reason
    );
    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/approvals/:id/reject
 * Body: { reason? }
 */
async function rejectApproval(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const approval = await approvalService.rejectApproval(
      req.params.id,
      req.user,
      req.body.reason
    );
    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/approvals/:id/revision
 * Body: { reason? }
 */
async function returnForRevision(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const approval = await approvalService.returnForRevision(
      req.params.id,
      req.user,
      req.body.reason
    );
    res.status(200).json({ success: true, data: approval });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/approvals/summary
 */
async function getApprovalSummary(req, res, next) {
  try {
    const summary = await approvalService.getApprovalSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApproval,
  listApprovals,
  getApprovalById,
  approveApproval,
  rejectApproval,
  returnForRevision,
  getApprovalSummary,
};
