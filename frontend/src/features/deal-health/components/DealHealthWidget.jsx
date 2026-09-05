import React from 'react';
import { Link } from 'react-router-dom';
import { useDealHealth } from '../hooks/useDealHealth';

function DealHealthWidget() {
  const { alerts, isLoading, runScan } = useDealHealth();

  if (isLoading) return <div className="portal-card animate-pulse h-32 bg-slate-800/20"></div>;

  return (
    <div className="portal-card" id="deal-health-widget">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Deal Health
        </h2>
        <button onClick={runScan} className="text-xs text-brand-400 hover:text-brand-300 transition-colors bg-brand-900/20 px-2 py-1 rounded">
          Run Scan
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-sm text-slate-400 p-4 border border-slate-700/50 rounded-lg bg-slate-800/30 text-center">
          No active anomalies detected. All deals look healthy.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert._id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">{alert.type.replace('_', ' ')}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/40 text-amber-400'
                }`}>{alert.severity}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{alert.reason}</p>
              <Link to={`/portal/quotations/${alert.quotationId}`} className="text-xs text-brand-400 hover:underline">
                View Quotation &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DealHealthWidget;
