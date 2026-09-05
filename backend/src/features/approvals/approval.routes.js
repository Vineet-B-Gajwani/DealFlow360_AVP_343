'use strict';

const express = require('express');
const router = express.Router();

const approvalController = require('./approval.controller');
const { validateCreate, validateAction, validateMongoId } = require('./approval.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

/**
 * Role definitions for the approval workflow:
 *
 *  CREATE  — any internal user can submit an approval request
 *            (SALES_REP, SALES_MANAGER, FINANCE_OPERATIONS, ADMIN)
 *
 *  READ    — any of the above may read approval status
 *
 *  APPROVE / REJECT / REVISION
 *          — SALES_MANAGER can act on SALES_MANAGER-level approvals
 *          — FINANCE_OPERATIONS can act on FINANCE-level approvals
 *          — ADMIN can act at any level
 *
 * NOTE: Fine-grained level enforcement (e.g. "only FINANCE_OPERATIONS can
 * approve a FINANCE-level record") belongs in the service layer, not the
 * router, because it requires reading the approval document.
 * The router enforces the broad role gate; the service enforces the level gate.
 */

const ALL_INTERNAL = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];
const REVIEWERS = ['SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];

// POST /api/approvals
router.post(
  '/',
  authenticate,
  authorize(...ALL_INTERNAL),
  validateCreate,
  approvalController.createApproval
);

// GET /api/approvals
router.get(
  '/',
  authenticate,
  authorize(...ALL_INTERNAL),
  approvalController.listApprovals
);

// GET /api/approvals/summary
router.get(
  '/summary',
  authenticate,
  authorize(...ALL_INTERNAL),
  approvalController.getApprovalSummary
);

// GET /api/approvals/:id
router.get(
  '/:id',
  authenticate,
  authorize(...ALL_INTERNAL),
  validateMongoId,
  approvalController.getApprovalById
);

// POST /api/approvals/:id/approve
router.post(
  '/:id/approve',
  authenticate,
  authorize(...REVIEWERS),
  validateMongoId,
  validateAction,
  approvalController.approveApproval
);

// POST /api/approvals/:id/reject
router.post(
  '/:id/reject',
  authenticate,
  authorize(...REVIEWERS),
  validateMongoId,
  validateAction,
  approvalController.rejectApproval
);

// POST /api/approvals/:id/revision
router.post(
  '/:id/revision',
  authenticate,
  authorize(...REVIEWERS),
  validateMongoId,
  validateAction,
  approvalController.returnForRevision
);

module.exports = router;
