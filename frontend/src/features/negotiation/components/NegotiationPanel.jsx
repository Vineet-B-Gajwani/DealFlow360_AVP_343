import React, { useState } from 'react';
import useNegotiation from '../hooks/useNegotiation';
import NegotiationHistory from './NegotiationHistory';

function NegotiationPanel({ quotationId }) {
  const { negotiations, isLoading, error, submitAction, isSubmitting } = useNegotiation(quotationId);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'new'
  
  const [formType, setFormType] = useState('CHANGE_REQUEST');
  const [message, setMessage] = useState('');
  const [requestedValue, setRequestedValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && formType !== 'COUNTER_DISCOUNT') return;

    const payload = {
      type: formType,
      message,
      requestedValue: formType === 'COUNTER_DISCOUNT' ? parseFloat(requestedValue) : null,
    };

    const success = await submitAction(payload);
    if (success) {
      setMessage('');
      setRequestedValue('');
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="CHANGE_REQUEST">Request Change</option>
                <option value="COUNTER_DISCOUNT">Counter-Discount</option>
                <option value="CONFIRMATION">Confirm Quotation</option>
              </select>
            </div>

            {formType === 'COUNTER_DISCOUNT' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Requested Discount %</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. 10.5"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">Message</label>
              <textarea 
                required={formType !== 'COUNTER_DISCOUNT'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Details..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
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
