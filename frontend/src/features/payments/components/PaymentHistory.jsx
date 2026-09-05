import React, { useState, useEffect } from 'react';
import paymentApi from '../api/paymentApi';

function PaymentHistory({ invoiceId, refreshTrigger }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const res = await paymentApi.getPaymentsByInvoice(invoiceId);
        setPayments(res.data?.data?.payments || []);
      } catch (err) {
        console.error('Failed to load payments', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (invoiceId) fetchPayments();
  }, [invoiceId, refreshTrigger]); // re-fetch when refreshTrigger changes

  if (isLoading) return <div className="p-6 text-sm text-slate-400">Loading payments...</div>;

  if (payments.length === 0) return (
    <div className="p-6 border-t border-slate-700/60 flex items-center gap-3 text-slate-400 text-sm bg-slate-900/50">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h0M2 9.5h20" /></svg>
      No payments recorded yet.
    </div>
  );

  return (
    <div className="border-t border-slate-700/60 bg-slate-900/50">
      <div className="p-6 md:p-10">
        <h3 className="text-base font-bold text-white mb-4">Payment History</h3>
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment._id} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                  <span className="text-slate-500 ml-2 font-normal">via {payment.method}</span>
                </p>
                {payment.reference && <p className="text-xs text-slate-500 mt-1">Ref: {payment.reference}</p>}
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-emerald-400">₹{payment.amount?.toLocaleString('en-IN')}</p>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{payment.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentHistory;
