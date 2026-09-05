/**
 * ApprovalHistory — renders the ordered audit trail for an approval.
 *
 * @param {{ history: Array }} props
 */

const ACTION_STYLE = {
  CREATED:           { icon: '📋', cls: 'text-slate-400',   label: 'Created'           },
  APPROVED:          { icon: '✅', cls: 'text-emerald-400', label: 'Approved'          },
  REJECTED:          { icon: '❌', cls: 'text-red-400',     label: 'Rejected'          },
  REVISION_REQUIRED: { icon: '↩', cls: 'text-violet-400',  label: 'Revision Required' },
  RESUBMITTED:       { icon: '🔄', cls: 'text-brand-400',   label: 'Resubmitted'       },
  ESCALATED:         { icon: '🏛️', cls: 'text-amber-400',    label: 'Escalated to Finance' },
};

export default function ApprovalHistory({ history = [] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-slate-600 py-4">No history entries.</p>
    );
  }

  return (
    <ol className="relative border-l border-slate-800 space-y-6 pl-6">
      {history.map((entry, i) => {
        const { icon, cls, label } = ACTION_STYLE[entry.action] || {
          icon: '•',
          cls: 'text-slate-400',
          label: entry.action,
        };

        return (
          <li key={i} className="relative">
            {/* Timeline dot */}
            <span className="absolute -left-[1.625rem] flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-xs">
              {icon}
            </span>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${cls}`}>{label}</span>
                <span className="text-xs text-slate-600">{formatTs(entry.timestamp)}</span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                By:{' '}
                <span className="font-mono text-slate-400">
                  {entry.userLabel || entry.user}
                </span>
              </p>

              {entry.reason && (
                <p className="mt-2 text-sm text-slate-300 italic">&ldquo;{entry.reason}&rdquo;</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatTs(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
