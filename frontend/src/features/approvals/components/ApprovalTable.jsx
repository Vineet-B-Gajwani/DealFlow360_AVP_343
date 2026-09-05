import { Link } from 'react-router-dom';
import ApprovalStatusBadge from './ApprovalStatusBadge';

const LEVEL_LABEL = {
  NONE: '—',
  SALES_MANAGER: 'Sales Manager',
  FINANCE: 'Finance',
};

/**
 * ApprovalTable — renders the list of approvals.
 * Handles the empty state inline.
 */
export default function ApprovalTable({ approvals }) {
  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg className="mb-4 h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
        <p className="font-medium text-slate-400">No approvals found</p>
        <p className="mt-1 text-sm text-slate-600">Submit a new approval request to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Quotation ID</th>
            <th className="px-5 py-3 font-semibold">Risk Score</th>
            <th className="px-5 py-3 font-semibold">Required Level</th>
            <th className="px-5 py-3 font-semibold">Current Level</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Requested By</th>
            <th className="px-5 py-3 font-semibold">Created</th>
            <th className="px-5 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {approvals.map((a) => (
            <tr key={a._id} className="bg-slate-950 hover:bg-slate-900/60 transition-colors">
              <td className="px-5 py-3.5">
                <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300 font-mono">
                  {a.quotationId}
                </code>
              </td>
              <td className="px-5 py-3.5">
                <RiskPill score={a.riskScore} />
              </td>
              <td className="px-5 py-3.5 text-slate-400">{LEVEL_LABEL[a.requiredLevel] ?? a.requiredLevel}</td>
              <td className="px-5 py-3.5 text-slate-400">{LEVEL_LABEL[a.currentLevel] ?? a.currentLevel}</td>
              <td className="px-5 py-3.5"><ApprovalStatusBadge status={a.status} /></td>
              <td className="px-5 py-3.5 text-slate-500 font-mono text-xs truncate max-w-[120px]">{a.requestedBy}</td>
              <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(a.createdAt)}</td>
              <td className="px-5 py-3.5 text-right">
                <Link
                  to={`/approvals/${a._id}`}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-500/10 transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskPill({ score }) {
  const s = Number(score);
  let cls = 'bg-emerald-500/15 text-emerald-400';
  if (s >= 70) cls = 'bg-red-500/15 text-red-400';
  else if (s >= 40) cls = 'bg-amber-500/15 text-amber-400';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {s}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
