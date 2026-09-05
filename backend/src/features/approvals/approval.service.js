'use strict';

const mongoose = require('mongoose');
const { Approval, APPROVAL_STATUS, REQUIRED_LEVEL } = require('./approval.model');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Build a history entry object.
 * @param {string} action
 * @param {{ id: string, email?: string }} user
 * @param {string} [reason]
 */
function historyEntry(action, user, reason = '') {
  const userIdStr = typeof user === 'string' ? user : (user?.id || user?._id || 'SYSTEM');
  const userLabelStr = typeof user === 'string' ? user : (user?.email || user?.name || userIdStr);
  return {
    action,
    user: String(userIdStr),
    userLabel: String(userLabelStr),
    reason: reason || '',
    timestamp: new Date(),
  };
}

// ── State machine helpers ─────────────────────────────────────────────────────

/**
 * Determine the first active level based on requiredLevel.
 *
 * NONE           → the approval is auto-approved on creation.
 * SALES_MANAGER  → the first active level is SALES_MANAGER.
 * FINANCE        → the first active level is SALES_MANAGER (manager must go first).
 */
function initialCurrentLevel(requiredLevel) {
  if (requiredLevel === REQUIRED_LEVEL.NONE) return REQUIRED_LEVEL.NONE;
  return REQUIRED_LEVEL.SALES_MANAGER; // both SALES_MANAGER and FINANCE start here
}

/**
 * After a SALES_MANAGER approval, what is the next level?
 *
 * SALES_MANAGER chain → done (APPROVED)
 * FINANCE chain       → escalate to FINANCE
 */
function nextLevelAfterManager(requiredLevel) {
  if (requiredLevel === REQUIRED_LEVEL.FINANCE) return REQUIRED_LEVEL.FINANCE;
  return null; // no further level → approve
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Create a new approval request.
 *
 * Integration contract — caller must provide:
 *   { quotationId, riskScore, requiredLevel, requestedBy }
 *
 * If requiredLevel === NONE the approval is immediately APPROVED without
 * requiring any human action.
 *
 * @param {{ quotationId: string, riskScore: number, requiredLevel: string, requestedBy: string }} data
 * @param {{ id: string, email?: string }} actingUser  — the authenticated user making the API call
 */
async function createApproval(data, actingUser) {
  const { quotationId, riskScore, requiredLevel, requestedBy } = data;

  // Prevent duplicate open approvals for the same quotation
  const existing = await Approval.findOne({
    quotationId,
    status: APPROVAL_STATUS.PENDING,
  });
  if (existing) {
    throw makeError(
      `A pending approval already exists for quotation ${quotationId}`,
      409
    );
  }

  const firstLevel = initialCurrentLevel(requiredLevel);
  const isAutoApproved = requiredLevel === REQUIRED_LEVEL.NONE;

  const approval = new Approval({
    quotationId,
    riskScore,
    requiredLevel,
    currentLevel: firstLevel,
    status: isAutoApproved ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING,
    requestedBy,
    currentReviewer: isAutoApproved ? null : null, // set by assigner in future
    history: [
      historyEntry('CREATED', actingUser, `Approval requested at level ${requiredLevel}`),
    ],
  });

  if (isAutoApproved) {
    approval.history.push(
      historyEntry('APPROVED', actingUser, 'Auto-approved: no approval level required')
    );
  }

  await approval.save();
  return approval;
}

/**
 * Approve an approval record.
 *
 * Rules:
 *  - Must be PENDING.
 *  - If SALES_MANAGER chain and currentLevel === SALES_MANAGER → APPROVED.
 *  - If FINANCE chain and currentLevel === SALES_MANAGER → advance to FINANCE level (still PENDING).
 *  - If FINANCE chain and currentLevel === FINANCE → APPROVED.
 *
 * @param {string} id  — Approval ObjectId
 * @param {{ id: string, email?: string }} actingUser
 * @param {string} [reason]
 */
async function approveApproval(id, actingUser, reason = '') {
  const approval = await Approval.findById(id);
  if (!approval) throw makeError('Approval not found', 404);

  if (approval.status !== APPROVAL_STATUS.PENDING) {
    throw makeError(
      `Cannot approve: approval is already ${approval.status}`,
      422
    );
  }

  const entry = historyEntry('APPROVED', actingUser, reason);

  if (approval.currentLevel === REQUIRED_LEVEL.SALES_MANAGER) {
    const next = nextLevelAfterManager(approval.requiredLevel);

    if (next === REQUIRED_LEVEL.FINANCE) {
      // Advance to finance review — still PENDING
      approval.currentLevel = REQUIRED_LEVEL.FINANCE;
      approval.history.push({
        ...entry,
        reason: reason || 'Sales manager approved — escalating to Finance',
      });
    } else {
      // SALES_MANAGER chain is complete
      approval.status = APPROVAL_STATUS.APPROVED;
      approval.currentLevel = REQUIRED_LEVEL.SALES_MANAGER;
      approval.currentReviewer = null;
      approval.history.push(entry);
    }
  } else if (approval.currentLevel === REQUIRED_LEVEL.FINANCE) {
    // Final finance approval
    approval.status = APPROVAL_STATUS.APPROVED;
    approval.currentReviewer = null;
    approval.history.push(entry);
  } else {
    throw makeError('Approval is not awaiting any action', 422);
  }

  await approval.save();

  // ── Sync Quotation status when fully approved ──────────────────────────
  if (approval.status === APPROVAL_STATUS.APPROVED) {
    const QuotationModel = mongoose.models.Quotation;
    if (QuotationModel) {
      await QuotationModel.findByIdAndUpdate(approval.quotationId, { status: 'APPROVED' });
    }
  }

  return approval;
}

/**
 * Reject an approval record.
 * Only allowed when status === PENDING.
 */
async function rejectApproval(id, actingUser, reason = '') {
  const approval = await Approval.findById(id);
  if (!approval) throw makeError('Approval not found', 404);

  if (approval.status !== APPROVAL_STATUS.PENDING) {
    throw makeError(
      `Cannot reject: approval is already ${approval.status}`,
      422
    );
  }

  approval.status = APPROVAL_STATUS.REJECTED;
  approval.currentReviewer = null;
  approval.history.push(historyEntry('REJECTED', actingUser, reason));

  await approval.save();

  // ── Sync Quotation status on rejection ──────────────────────────────────
  const QuotationModelR = mongoose.models.Quotation;
  if (QuotationModelR) {
    await QuotationModelR.findByIdAndUpdate(approval.quotationId, { status: 'REJECTED' });
  }

  return approval;
}

/**
 * Return an approval for revision.
 * Puts it back into REVISION_REQUIRED status.
 * The requestor can then resubmit (future feature: PATCH /resubmit).
 */
async function returnForRevision(id, actingUser, reason = '') {
  const approval = await Approval.findById(id);
  if (!approval) throw makeError('Approval not found', 404);

  if (approval.status !== APPROVAL_STATUS.PENDING) {
    throw makeError(
      `Cannot request revision: approval is already ${approval.status}`,
      422
    );
  }

  approval.status = APPROVAL_STATUS.REVISION_REQUIRED;
  approval.currentReviewer = null;
  approval.history.push(historyEntry('REVISION_REQUIRED', actingUser, reason));

  await approval.save();

  // ── Sync Quotation status on revision request ──────────────────────────
  const QuotationModelRev = mongoose.models.Quotation;
  if (QuotationModelRev) {
    await QuotationModelRev.findByIdAndUpdate(approval.quotationId, { status: 'DRAFT' });
  }

  return approval;
}

/**
 * Get the full history of a single approval.
 */
async function getApprovalHistory(id) {
  const approval = await Approval.findById(id).select('quotationId status history');
  if (!approval) throw makeError('Approval not found', 404);
  return approval;
}

/**
 * List approvals with optional filters.
 * @param {{ status?: string, quotationId?: string }} query
 */
async function listApprovals(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.quotationId) filter.quotationId = query.quotationId;

  const approvals = await Approval.find(filter).sort({ createdAt: -1 });
  return approvals;
}

/**
 * Get a single approval by id.
 */
async function getApprovalById(id) {
  const approval = await Approval.findById(id);
  if (!approval) throw makeError('Approval not found', 404);
  return approval;
}

/**
 * Get approval dashboard summary metrics.
 */
async function getApprovalSummary() {
  const total = await Approval.countDocuments();
  const pending = await Approval.countDocuments({ status: APPROVAL_STATUS.PENDING });
  const approved = await Approval.countDocuments({ status: APPROVAL_STATUS.APPROVED });
  const rejected = await Approval.countDocuments({ status: APPROVAL_STATUS.REJECTED });
  const revision = await Approval.countDocuments({ status: APPROVAL_STATUS.REVISION_REQUIRED });

  return {
    total,
    pending,
    approved,
    rejected,
    revision,
  };
}

/**
 * Escalate an approval request to the Finance Department level.
 */
async function escalateToFinance(id, actingUser, reason = '') {
  const approval = await Approval.findById(id);
  if (!approval) throw makeError('Approval not found', 404);

  if (approval.status !== APPROVAL_STATUS.PENDING) {
    throw makeError(
      `Cannot escalate: approval is already ${approval.status}`,
      422
    );
  }

  approval.requiredLevel = REQUIRED_LEVEL.FINANCE;
  approval.currentLevel = REQUIRED_LEVEL.FINANCE;
  approval.history.push(
    historyEntry(
      'ESCALATED',
      actingUser,
      reason || 'Escalated to Finance Department by Sales Manager'
    )
  );

  await approval.save();
  return approval;
}

module.exports = {
  createApproval,
  approveApproval,
  rejectApproval,
  returnForRevision,
  escalateToFinance,
  getApprovalHistory,
  listApprovals,
  getApprovalById,
  getApprovalSummary,
};
