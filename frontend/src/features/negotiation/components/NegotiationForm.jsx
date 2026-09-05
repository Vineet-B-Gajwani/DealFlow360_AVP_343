import React, { useState } from 'react';

function NegotiationForm({ quotationId, onSubmit, onConfirm, isSubmitting = false }) {
  const [type, setType] = useState('LINE_COMMENT');
  const [message, setMessage] = useState('');
  const [requestedValue, setRequestedValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmit({
      quotationId,
      type,
      message,
      requestedValue: requestedValue ? Number(requestedValue) : null,
    });

    setMessage('');
    setRequestedValue('');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Submit Counter-Offer or Comment</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            Action Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="LINE_COMMENT">Line Comment</option>
            <option value="CHANGE_REQUEST">Change Request</option>
            <option value="COUNTER_DISCOUNT">Counter Discount (%)</option>
          </select>
        </div>

        {type === 'COUNTER_DISCOUNT' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Requested Discount Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={requestedValue}
              onChange={(e) => setRequestedValue(e.target.value)}
              placeholder="e.g. 15"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
            Message / Note
          </label>
          <textarea
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message or negotiation terms..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Submit Action'}
          </button>

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-all border border-emerald-500/30"
            >
              Confirm & Accept Quotation
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default NegotiationForm;
