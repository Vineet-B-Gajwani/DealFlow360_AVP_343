import { Link, useParams } from 'react-router-dom';
import { useApproval } from '../hooks/useApproval';
import ApprovalStatusBadge from '../components/ApprovalStatusBadge';
import ApprovalHistory from '../components/ApprovalHistory';
import ActionPanel from '../components/ActionPanel';

const LEVEL_LABEL = {
  NONE: 'None (auto)',
  SALES_MANAGER: 'Sales Manager',
  FINANCE: 'Finance',
};

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const {
    approval,
    loading,
    error,
    reload,
    actionLoading,
    actionError,
    approve,
    reject,
    revision,
    escalate,
  } = useApproval(id);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-300 font-medium">{error}</p>
          <Link to="/approvals" className="mt-4 inline-block text-sm text-brand-400 hover:underline">
            ← Back to Approvals
          </Link>
        </div>
      </div>
    );
  }

  if (!approval) return null;

  const isPending = approval.status === 'PENDING';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Breadcrumb ── */}
        <nav className="text-sm text-slate-500">
          <Link to="/approvals" className="hover:text-brand-400 transition-colors">
            Approvals
          </Link>
          {' / '}
          <span className="text-slate-300 font-mono">{approval._id}</span>
        </nav>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Approval Detail</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quotation:{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300 font-mono">
                {approval.quotationId}
              </code>
            </p>
          </div>
          <ApprovalStatusBadge status={approval.status} />
        </div>

        {/* ── Metadata grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetaCard label="Risk Score">
            <RiskPill score={approval.riskScore} />
          </MetaCard>
          <MetaCard label="Required Level">
            {LEVEL_LABEL[approval.requiredLevel] ?? approval.requiredLevel}
          </MetaCard>
          <MetaCard label="Current Level">
            {LEVEL_LABEL[approval.currentLevel] ?? approval.currentLevel}
          </MetaCard>
          <MetaCard label="Requested By">
            <span className="font-mono text-xs">{approval.requestedBy}</span>
          </MetaCard>
          <MetaCard label="Created">
            {formatDate(approval.createdAt)}
          </MetaCard>
          <MetaCard label="Last Updated">
            {formatDate(approval.updatedAt)}
          </MetaCard>
        </div>

        {/* ── Action error ── */}
        {actionError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-300">
            <span>⚠</span> {actionError}
          </div>
        )}

        {/* ── Reviewer action panel (only when PENDING) ── */}
        {isPending && (
          <ActionPanel
            approval={approval}
            onApprove={approve}
            onReject={reject}
            onRevision={revision}
            onEscalate={escalate}
            loading={actionLoading}
          />
        )}

        {/* ── Audit history ── */}
        <section>
          <h2 className="text-base font-semibold text-white mb-4">
            Approval History
            <span className="ml-2 text-xs font-normal text-slate-600">
              ({approval.history?.length ?? 0} events)
            </span>
          </h2>
          <ApprovalHistory history={approval.history} />
        </section>

        {/* ── Refresh / back links ── */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
          <button
            onClick={reload}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ↻ Refresh
          </button>
          <Link
            to="/approvals"
            className="text-sm text-brand-400 hover:underline transition-colors"
          >
            ← All Approvals
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function MetaCard({ label, children }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <div className="text-sm text-slate-200">{children}</div>
    </div>
  );
}

function RiskPill({ score }) {
  const s = Number(score);
  let cls = 'bg-emerald-500/15 text-emerald-400';
  if (s >= 70) cls = 'bg-red-500/15 text-red-400';
  else if (s >= 40) cls = 'bg-amber-500/15 text-amber-400';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {s}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
