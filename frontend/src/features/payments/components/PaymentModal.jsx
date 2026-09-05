import React, { useState } from 'react';
import paymentApi from '../api/paymentApi';

function PaymentModal({ invoice, invoiceId, maxAmount, isOpen = true, onClose, onSuccess }) {
  const targetInvoiceId = invoice?._id || invoiceId;
  const targetInvoiceNum = invoice?.invoiceNumber || targetInvoiceId || 'Invoice';
  const initialMax = maxAmount !== undefined ? maxAmount : (invoice?.total || invoice?.grandTotal || 0);

  const [amount, setAmount] = useState(initialMax > 0 ? initialMax : '');
  const [method, setMethod] = useState('BANK');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentApi.recordPayment({
        invoiceId: targetInvoiceId,
        amount: numAmount,
        method,
        reference,
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>💳</span> Record Payment
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ref: <span className="text-brand-400 font-semibold">{targetInvoiceNum}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={initialMax ? `Balance due: ₹${initialMax}` : 'Enter amount'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                required
              />
            </div>
            {initialMax > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-slate-500">Remaining Balance: ₹{initialMax.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  onClick={() => setAmount(initialMax)}
                  className="text-[11px] text-brand-400 hover:underline font-semibold"
                >
                  Pay Full Balance
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            >
              <option value="BANK">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="ONLINE">Online Payment (UPI/Card/Gateway)</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other / Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Reference / Transaction ID
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UTR123456789 or CHQ-00921"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording...
                </>
              ) : (
                'Confirm & Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
