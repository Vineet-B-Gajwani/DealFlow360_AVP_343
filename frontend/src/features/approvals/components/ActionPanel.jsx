import { useState } from 'react';

/**
 * ActionPanel — shows Approve / Reject / Return for Revision buttons.
 * Only displayed when the approval status is PENDING.
 *
 * @param {{ onApprove, onReject, onRevision, loading }} props
 */
export default function ActionPanel({ onApprove, onReject, onRevision, loading }) {
  const [reason, setReason] = useState('');
  const [active, setActive] = useState(null); // 'approve' | 'reject' | 'revision'

  const handleSubmit = async (type) => {
    if (type === 'approve') await onApprove(reason);
    if (type === 'reject')  await onReject(reason);
    if (type === 'revision') await onRevision(reason);
    setReason('');
    setActive(null);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Reviewer Action
      </h3>

      {/* Reason textarea — shown when an action is selected */}
      {active && (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Reason / Comment <span className="text-slate-600">(optional)</span>
          </label>
          <textarea
            id="action-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              active === 'approve'
                ? 'Add an approval note…'
                : active === 'reject'
                ? 'State the reason for rejection…'
                : 'Describe what needs to be revised…'
            }
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Approve */}
        {active !== 'approve' ? (
          <button
            id="btn-approve"
            onClick={() => setActive('approve')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            ✓ Approve
          </button>
        ) : (
          <button
            id="btn-approve-confirm"
            onClick={() => handleSubmit('approve')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner /> : '✓ Confirm Approval'}
          </button>
        )}

        {/* Reject */}
        {active !== 'reject' ? (
          <button
            id="btn-reject"
            onClick={() => setActive('reject')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            ✕ Reject
          </button>
        ) : (
          <button
            id="btn-reject-confirm"
            onClick={() => handleSubmit('reject')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner /> : '✕ Confirm Rejection'}
          </button>
        )}

        {/* Return for revision */}
        {active !== 'revision' ? (
          <button
            id="btn-revision"
            onClick={() => setActive('revision')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-600 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
          >
            ↩ Return for Revision
          </button>
        ) : (
          <button
            id="btn-revision-confirm"
            onClick={() => handleSubmit('revision')}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-600 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner /> : '↩ Confirm Revision Request'}
          </button>
        )}

        {/* Cancel */}
        {active && (
          <button
            onClick={() => { setActive(null); setReason(''); }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors px-2"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}
