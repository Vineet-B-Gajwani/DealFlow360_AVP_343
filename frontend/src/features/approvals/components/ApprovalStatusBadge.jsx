/**
 * ApprovalStatusBadge — pill badge for PENDING / APPROVED / REJECTED / REVISION_REQUIRED.
 */
const CONFIG = {
  PENDING:           { label: 'Pending',           cls: 'bg-amber-500/20  text-amber-300  ring-amber-500/30'  },
  APPROVED:          { label: 'Approved',          cls: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30' },
  REJECTED:          { label: 'Rejected',          cls: 'bg-red-500/20    text-red-300    ring-red-500/30'    },
  REVISION_REQUIRED: { label: 'Revision Required', cls: 'bg-violet-500/20 text-violet-300 ring-violet-500/30' },
};

export default function ApprovalStatusBadge({ status }) {
  const { label, cls } = CONFIG[status] || { label: status, cls: 'bg-slate-700 text-slate-300' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
