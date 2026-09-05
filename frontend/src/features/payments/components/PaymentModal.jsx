import React, { useState } from 'react';
import paymentApi from '../api/paymentApi';

function PaymentModal({ invoiceId, maxAmount, onClose, onSuccess }) {
  const [amount, setAmount] = useState(maxAmount || '');
  const [method, setMethod] = useState('ONLINE');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await paymentApi.recordPayment({
        invoiceId,
        amount: parseFloat(amount),
        method,
        reference
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Record Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01"
              min="1"
              max={maxAmount}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
            {maxAmount && <p className="text-xs text-slate-500 mt-1">Remaining balance: ₹{maxAmount.toLocaleString('en-IN')}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ONLINE">Online / Card</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Reference (Optional)</label>
            <input 
              type="text" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              placeholder="Transaction ID, Cheque #, etc."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
