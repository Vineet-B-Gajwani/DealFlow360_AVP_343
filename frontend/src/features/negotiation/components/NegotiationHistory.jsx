import React from 'react';

function NegotiationHistory({ negotiations, isLoading, error }) {
  if (isLoading) return <div className="text-slate-400 text-sm">Loading history...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (!negotiations || negotiations.length === 0) return <div className="text-slate-500 text-sm">No negotiation history yet.</div>;

  const typeLabels = {
    LINE_COMMENT: 'Commented on line',
    CHANGE_REQUEST: 'Requested change',
    COUNTER_DISCOUNT: 'Proposed counter-discount',
    CONFIRMATION: 'Confirmed quotation',
  };

  return (
    <div className="space-y-4">
      {negotiations.map(neg => (
        <div key={neg._id} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-brand-300">
              {typeLabels[neg.type] || neg.type}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(neg.createdAt).toLocaleDateString()}
            </span>
          </div>
          {neg.requestedValue !== null && (
            <div className="text-sm text-emerald-400 mb-2 font-medium">
              Requested discount: {neg.requestedValue}%
            </div>
          )}
          {neg.message && (
            <p className="text-sm text-slate-300">{neg.message}</p>
          )}
          <div className="mt-3 text-xs text-slate-500">
            Status: <span className="uppercase font-medium text-slate-400">{neg.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NegotiationHistory;
