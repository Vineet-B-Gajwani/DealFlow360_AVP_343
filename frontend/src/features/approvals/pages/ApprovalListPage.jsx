import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApprovals } from '../hooks/useApprovals';
import ApprovalTable from '../components/ApprovalTable';
import NewApprovalForm from '../components/NewApprovalForm';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED'];

export default function ApprovalListPage() {
  const { approvals, loading, error, reload, filters, setFilters } = useApprovals();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, status: e.target.value || undefined }));
  }

  function handleSuccess(newApproval) {
    setShowForm(false);
    navigate(`/approvals/${newApproval._id}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Page header ── */}
        <div className="mb-4">
          <Link to="/approvals/dashboard" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Approval Workflow
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage approval requests across all quotations.
            </p>
          </div>
          <button
            id="btn-new-approval"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors shrink-0"
          >
            {showForm ? '✕ Cancel' : '+ New Approval Request'}
          </button>
        </div>

        {/* ── New approval form ── */}
        {showForm && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Submit Approval Request</h2>
            <NewApprovalForm
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter:
          </label>
          <select
            id="filter-status"
            value={filters.status || ''}
            onChange={handleFilterChange}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-brand-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
          <button
            onClick={reload}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-300">
            <span>⚠</span>
            <div>
              <p className="font-medium">{error}</p>
              <button onClick={reload} className="mt-1 underline text-red-400 hover:no-underline text-xs">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && <ApprovalTable approvals={approvals} />}
      </div>
    </div>
  );
}
