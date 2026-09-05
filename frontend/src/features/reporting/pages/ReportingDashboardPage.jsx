import React, { useState, useEffect } from 'react';
import reportingApi from '../api/reporting.api';

function ReportingDashboardPage() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setIsLoading(true);
        const { data } = await reportingApi.getSummary();
        setReport(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report analytics');
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await reportingApi.exportReport();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dealflow360_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report: ' + (err.message || err));
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 text-white p-6 text-center py-20">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-slate-950 text-rose-400 p-6 text-center py-20">{error}</div>;
  }

  const { overview = {}, analytics = {} } = report || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Executive Analytics & Reporting</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time MongoDB aggregation metrics for pipeline, billing, and payments.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleExport('PDF')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded text-sm font-medium border border-slate-700">
              Export PDF
            </button>
            <button onClick={() => handleExport('XLS')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded text-sm font-medium border border-slate-700">
              Export Excel
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Pipeline Value</div>
            <div className="text-3xl font-bold font-mono text-brand-400">₹{Number(overview.pipelineValue || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">{overview.quotationsCount || 0} Total Quotations</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Invoiced</div>
            <div className="text-3xl font-bold font-mono text-purple-400">₹{Number(overview.totalInvoiced || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">{overview.invoicesCount || 0} Total Invoices</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Collected Payments</div>
            <div className="text-3xl font-bold font-mono text-emerald-400">₹{Number(overview.totalCollected || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Outstanding AR: ₹{Number(overview.outstandingAR || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Analytic breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Averages & Discount Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Average Discount Value per Quote</span>
              <span className="font-mono font-bold text-amber-400">₹{Number(analytics.avgDiscountValue || 0).toLocaleString()}</span>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Average Invoice Amount</span>
              <span className="font-mono font-bold text-brand-400">₹{Number(analytics.avgInvoiceValue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportingDashboardPage;
