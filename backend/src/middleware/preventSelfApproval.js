'use strict';

const Approval = require('../features/approvals/approval.model').Approval;

/**
 * Middleware to prevent a user from approving/rejecting/revision of their own quotation.
 * It loads the approval by :id param and compares the `requestedBy` field with the authenticated user id.
 */
module.exports = async function preventSelfApproval(req, res, next) {
  try {
    const approval = await Approval.findById(req.params.id).select('requestedBy');
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval not found' });
    }
    if (approval.requestedBy && approval.requestedBy.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot act on an approval you created',
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
