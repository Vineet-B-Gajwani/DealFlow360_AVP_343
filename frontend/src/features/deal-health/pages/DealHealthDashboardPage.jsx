import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dealHealthApi from '../api/dealHealth.api';
import useAuth from '../../auth/hooks/useAuth';

function DealHealthDashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const canRunScan = user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER';

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data } = await dealHealthApi.getAlerts();
      setAlerts(data?.data?.alerts || data?.alerts || []);
    } catch (err) {
      console.error('Failed to load deal health alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleScan = async () => {
    if (!canRunScan) return;
    setIsScanning(true);
    setMessage('');
    try {
      const { data } = await dealHealthApi.triggerScan();
      setMessage(data.message || 'Deal health scan completed successfully!');
      await fetchAlerts();
    } catch (err) {
      setMessage('Health scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await dealHealthApi.updateStatus(alertId, 'DISMISSED');
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  // KPIs
  const stalledAlerts = alerts.filter(a => a.type === 'STALLED_DEAL');
  const discountAlerts = alerts.filter(a => a.type === 'DISCOUNT_ANOMALY');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (severityFilter === 'HIGH') return a.severity === 'HIGH';
    if (severityFilter === 'STALLED') return a.type === 'STALLED_DEAL';
    if (severityFilter === 'DISCOUNT') return a.type === 'DISCOUNT_ANOMALY';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Deal Health & Anomaly Engine
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Real-time automated detection of stalled quotations, margin erosion, and discount limit violations.
            </p>
          </div>

          {canRunScan && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Scanning Database...
                  </>
                ) : (
                  '⚡ Run Health Scan'
                )}
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className="p-3.5 bg-brand-950/80 border border-brand-700/60 rounded-xl text-brand-300 text-sm font-medium animate-fade-in flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs text-brand-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Active Alerts</span>
            <p className="text-2xl font-bold font-mono text-white mt-2">{alerts.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Requires sales team review</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Critical Risk Alerts</span>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-2">{criticalAlerts.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">High margin or policy breach</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stalled Deals</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-2">{stalledAlerts.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Inactive for more than 3 days without progress</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Discount Anomalies</span>
            <p className="text-2xl font-bold font-mono text-indigo-400 mt-2">{discountAlerts.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Exceeds rep historical average</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            {[
              { label: 'ALL', value: 'ALL' },
              { label: 'CRITICAL', value: 'CRITICAL' },
              { label: 'STALLED DEALS', value: 'STALLED' },
              { label: 'DISCOUNT ANOMALIES', value: 'DISCOUNT' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSeverityFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  severityFilter === tab.value
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">Showing {filteredAlerts.length} alert records</span>
        </div>

        {/* Alerts Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-white">All Active Deals Healthy</h3>
            <p className="text-xs text-slate-500 mt-1">No stalled quotations or margin discount anomalies detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => {
              const quoteObj = alert.quotationId;
              const quoteIdStr = typeof quoteObj === 'object' ? quoteObj?._id : alert.quotationId;
              const quoteNum = typeof quoteObj === 'object' ? quoteObj?.quotationNumber : null;

              return (
                <div
                  key={alert._id}
                  className={`p-5 rounded-2xl border backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-4 transition-all ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-200 hover:border-rose-700'
                      : 'bg-amber-950/30 border-amber-800/60 text-amber-200 hover:border-amber-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase tracking-wider ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-900/60 text-rose-200 border border-rose-700/60' : 'bg-amber-900/60 text-amber-200 border border-amber-700/60'
                      }`}>
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(alert.detectedAt || alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-relaxed mb-2">
                      {alert.reason}
                    </p>

                    {quoteNum && (
                      <span className="text-xs font-mono text-slate-400 block">
                        Linked Quote: <span className="text-brand-300 font-bold">#{quoteNum}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    {quoteIdStr ? (
                      <Link
                        to={`/quotations/${quoteIdStr}`}
                        className="font-bold text-brand-300 hover:text-white underline transition-colors"
                      >
                        Open Quotation →
                      </Link>
                    ) : (
                      <span className="text-slate-500">No quotation reference</span>
                    )}

                    <button
                      onClick={() => handleDismiss(alert._id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Dismiss Alert
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DealHealthDashboardPage;
