import React from 'react';

/**
 * NegotiationThread
 *
 * Displays list of comments, change requests, counter discounts, and confirmations.
 */
function NegotiationThread({ history = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        <div className="inline-block animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full mr-2" />
        Loading negotiation history...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm border border-dashed border-slate-700/60 rounded-xl">
        No negotiation history yet for this quotation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item._id}
          className={`p-4 rounded-xl border text-sm transition-all ${
            item.type === 'CONFIRMATION'
              ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
              : item.type === 'COUNTER_DISCOUNT'
              ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
              : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/60">
              {item.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-slate-300">{item.message}</p>

          {item.requestedValue !== null && item.requestedValue !== undefined && (
            <div className="mt-2 text-xs font-mono font-medium text-amber-400">
              Requested discount: {item.requestedValue}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default NegotiationThread;
