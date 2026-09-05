import { useState, useEffect, useCallback } from 'react';
import {
  fetchApproval,
  approveApproval,
  rejectApproval,
  returnForRevision,
  escalateApproval,
} from '../api/approvalApi';

/**
 * Hook for the approval detail page.
 * Provides the approval record plus action handlers.
 *
 * @param {string} id  — MongoDB ObjectId
 */
export function useApproval(id) {
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApproval(id);
      setApproval(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approval');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /** Generic action executor — wraps approve/reject/revision/escalate calls. */
  const runAction = useCallback(async (apiFn, reason) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await apiFn(id, { reason });
      setApproval(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      setActionError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  const approve  = (reason) => runAction(approveApproval, reason);
  const reject   = (reason) => runAction(rejectApproval, reason);
  const revision = (reason) => runAction(returnForRevision, reason);
  const escalate = (reason) => runAction(escalateApproval, reason);

  return {
    approval,
    loading,
    error,
    reload: load,
    actionLoading,
    actionError,
    approve,
    reject,
    revision,
    escalate,
  };
}
