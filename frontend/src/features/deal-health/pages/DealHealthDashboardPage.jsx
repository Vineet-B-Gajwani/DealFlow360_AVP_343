import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dealHealthApi from '../api/dealHealth.api';

function DealHealthDashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data } = await dealHealthApi.getAlerts();
      setAlerts(data.data.alerts);
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
    setIsScanning(true);
    setMessage('');
    try {
      const { data } = await dealHealthApi.triggerScan();
      setMessage(data.message);
      await fetchAlerts();
    } catch (err) {
      setMessage('Scan failed');
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Deal Health & Anomaly Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time monitoring of stalled deals, discount anomalies, and deal risks.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isScanning ? 'Scanning DB...' : '⚡ Run Health Scan'}
          </button>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-brand-950/60 border border-brand-700/50 rounded-xl text-brand-300 text-sm">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading deal alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-white">All Deals Healthy</h3>
            <p className="text-xs text-slate-500 mt-1">No active stalled deals or discount anomalies detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-5 rounded-2xl border backdrop-blur-sm shadow-xl flex flex-col justify-between ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                    : 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-black/40">
                      {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.detectedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium mb-4">{alert.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  {alert.quotationId ? (
                    <Link
                      to={`/quotations/${alert.quotationId._id || alert.quotationId}`}
                      className="font-semibold underline hover:text-white"
                    >
                      Open Quotation →
                    </Link>
                  ) : (
                    <span className="text-slate-400">No quotation linked</span>
                  )}

                  <button
                    onClick={() => handleDismiss(alert._id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DealHealthDashboardPage;
