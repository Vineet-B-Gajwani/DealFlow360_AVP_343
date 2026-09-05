import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApprovalSummary } from '../api/approvalApi';

export default function ApprovalDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const result = await fetchApprovalSummary();
        setSummary(result.data);
      } catch (err) {
        console.error('Failed to load approval summary', err);
        setError('Failed to load approval summary');
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Approval Dashboard</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Overview of your approval workflows and their current statuses.
            </p>
          </div>
          <Link
            to="/approvals/list"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            View All Approvals
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Approvals</h3>
              <p className="mt-2 text-3xl font-bold text-white">{summary.total}</p>
            </div>
            
            <div className="rounded-xl border border-yellow-800/30 bg-yellow-900/10 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500/80">Pending</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-400">{summary.pending}</p>
            </div>

            <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/10 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500/80">Approved</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-400">{summary.approved}</p>
            </div>

            <div className="rounded-xl border border-red-800/30 bg-red-900/10 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500/80">Rejected</h3>
              <p className="mt-2 text-3xl font-bold text-red-400">{summary.rejected}</p>
            </div>

            <div className="rounded-xl border border-orange-800/30 bg-orange-900/10 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-500/80">Revision Required</h3>
              <p className="mt-2 text-3xl font-bold text-orange-400">{summary.revision}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
