import React from 'react';

function NegotiationHistory({ negotiations, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        Loading negotiation history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
        {error}
      </div>
    );
  }

  if (!negotiations || negotiations.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
        💬 No negotiation history recorded yet.
      </div>
    );
  }

  const typeLabels = {
    LINE_COMMENT: '💬 Line Comment',
    CHANGE_REQUEST: '📝 Requested Change',
    COUNTER_DISCOUNT: '🏷️ Counter-Discount Offer',
    CONFIRMATION: '✅ Quotation Confirmed',
  };

  return (
    <div className="space-y-3">
      {negotiations.map((neg) => {
        const custName = neg.customerId?.companyName || neg.customerId?.name || 'Customer';

        return (
          <div
            key={neg._id}
            className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2.5 shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-brand-300 uppercase tracking-wider bg-brand-950/80 px-2.5 py-0.5 rounded border border-brand-800/50">
                  {typeLabels[neg.type] || neg.type}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-2">
                  by <span className="text-white font-semibold">{custName}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(neg.createdAt).toLocaleString()}
              </span>
            </div>

            {neg.requestedValue !== null && neg.requestedValue !== undefined && (
              <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-xs font-mono font-bold text-emerald-300 flex items-center justify-between">
                <span>Requested Discount Rate:</span>
                <span className="text-sm bg-emerald-900/80 px-2 py-0.5 rounded text-white">{neg.requestedValue}% OFF</span>
              </div>
            )}

            {neg.message && (
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                <span className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">Customer Note / Proposal:</span>
                "{neg.message}"
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-700/40 font-mono">
              <span>Status: <span className="font-bold text-slate-200 uppercase">{neg.status}</span></span>
              {neg.status === 'PENDING' && (
                <span className="text-amber-400 font-semibold">⚡ Awaiting Sales Action</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NegotiationHistory;
