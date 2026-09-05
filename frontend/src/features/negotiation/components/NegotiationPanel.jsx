import React, { useState } from 'react';
import useNegotiation from '../hooks/useNegotiation';
import NegotiationHistory from './NegotiationHistory';

function NegotiationPanel({ quotationId }) {
  const { negotiations, isLoading, error, submitAction, isSubmitting } = useNegotiation(quotationId);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'new'
  
  const [formType, setFormType] = useState('CHANGE_REQUEST');
  const [message, setMessage] = useState('');
  const [requestedValue, setRequestedValue] = useState('');

  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const maxDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && formType !== 'COUNTER_DISCOUNT') return;

    const payload = {
      type: formType,
      message,
      requestedValue: formType === 'COUNTER_DISCOUNT' ? parseFloat(requestedValue) : null,
      requestedDeliveryDate: requestedDeliveryDate || null,
    };

    const success = await submitAction(payload);
    if (success) {
      setMessage('');
      setRequestedValue('');
      setRequestedDeliveryDate('');
      setActiveTab('history');
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/60 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700/60">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'history' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'new' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          New Action
        </button>
      </div>

      <div className="p-5">
        {activeTab === 'history' ? (
          <NegotiationHistory negotiations={negotiations} isLoading={isLoading} error={error} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Action Type</label>
              <select 
                value={formType} 
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="CHANGE_REQUEST">Request Change</option>
                <option value="COUNTER_DISCOUNT">Counter-Discount Proposal</option>
                <option value="CONFIRMATION">Confirm Quotation</option>
              </select>
            </div>

            {/* Wireframe-matching 2-column input row for Counter Discount % and Requested Delivery Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formType === 'COUNTER_DISCOUNT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Counter Discount %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 font-mono"
                    placeholder="e.g. 15.0%"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Requested Delivery Date <span className="text-brand-400 text-[10px]">(Max 30 days)</span>
                </label>
                <input 
                  type="date" 
                  min={todayStr}
                  max={maxDateStr}
                  value={requestedDeliveryDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Message / Terms Comment</label>
              <textarea 
                required={formType !== 'COUNTER_DISCOUNT'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Specific comments or requirements for the sales representative..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Action'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default NegotiationPanel;
