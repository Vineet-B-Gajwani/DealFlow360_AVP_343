import React, { useEffect, useState } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../auth/api/auth.api';

function QuotationListPage() {
  const [quotations, setQuotations] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [quotRes, reqRes] = await Promise.allSettled([
        apiClient.get('/quotations'),
        apiClient.get('/quotations/requests')
      ]);

      if (quotRes.status === 'fulfilled' && quotRes.value.data?.success) {
        setQuotations(quotRes.value.data.data || []);
      } else if (quotRes.status === 'rejected') {
        setError(quotRes.reason?.response?.data?.message || 'Failed to load quotations');
      }

      if (reqRes.status === 'fulfilled' && reqRes.value.data?.success) {
        setCustomerRequests(reqRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('An unexpected error occurred loading quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertRequest = async (requestId) => {
    try {
      setConvertingId(requestId);
      const res = await apiClient.post(`/quotations/requests/${requestId}/convert`);
      if (res.data?.success) {
        const createdQuotation = res.data.data;
        // Directly navigate into the new draft quotation builder!
        navigate(`/quotations/${createdQuotation._id}`);
      } else {
        alert(res.data?.message || 'Failed to convert request');
      }
    } catch (err) {
      console.error('Failed to convert request', err);
      alert(err.response?.data?.message || 'Failed to convert customer request');
    } finally {
      setConvertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-slate-600 dark:text-slate-300 font-medium animate-pulse text-base">
          Loading quotation pipeline & customer requests...
        </div>
      </div>
    );
  }

  // Group by status
  const columns = {
    DRAFT: quotations.filter(q => q.status === 'DRAFT'),
    PENDING_APPROVAL: quotations.filter(q => q.status === 'PENDING_APPROVAL'),
    APPROVED: quotations.filter(q => q.status === 'APPROVED'),
    NEGOTIATING: quotations.filter(q => q.status === 'NEGOTIATING' || q.status === 'SENT'),
    CONFIRMED: quotations.filter(q => q.status === 'CONFIRMED'),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quotation Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage deal proposals and convert customer product buy demands</p>
        </div>
        {(user?.role === 'SALES_REP' || user?.role === 'ADMIN') && (
          <button 
            className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2.5 rounded-lg font-medium shadow-md shadow-brand-500/20 text-sm transition-colors"
            onClick={() => navigate('/quotations/new')}
          >
            + New Quotation
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Customer Product Demands / Quote Requests Section */}
      {customerRequests.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-purple-200 flex items-center gap-2">
              <span>📩 Incoming Customer Product Buy Demands</span>
              <span className="text-xs bg-purple-500/30 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-full font-mono">
                {customerRequests.length} Pending
              </span>
            </h2>
            <span className="text-xs text-slate-400">Convert demand into a pre-filled draft quotation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerRequests.map((req) => {
              const customerName = req.customerId?.companyName || req.customerId?.userId?.name || 'Customer';
              const isConverting = convertingId === req._id;

              return (
                <div key={req._id} className="bg-slate-800/80 border border-purple-500/20 rounded-lg p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-sm">{customerName}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-purple-300 font-semibold">Requested Products:</p>
                      <ul className="text-xs text-slate-300 space-y-1 pl-1">
                        {req.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>• {item.productId?.name || 'Product'}</span>
                            <span className="font-mono text-slate-400">Qty: {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-400 italic mt-2 bg-slate-900/60 p-2 rounded border border-slate-700/50">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleConvertRequest(req._id)}
                    disabled={isConverting}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-md shadow-md shadow-purple-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    {isConverting ? 'Creating Quotation...' : '⚡ Create Quotation from Request'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="h-[70vh] flex flex-col">
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([status, quotes]) => (
            <div key={status} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl min-w-[300px] w-[300px] flex flex-col shadow-sm">
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center rounded-t-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide">{status.replace('_', ' ')}</h3>
                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">{quotes.length}</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {quotes.map(quote => {
                  const quoteId = quote._id || quote.id;
                  return (
                    <div 
                      key={quoteId} 
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer transition-colors"
                      onClick={() => navigate(`/quotations/${quoteId}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">{quote.quotationNumber}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(quote.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        ₹{quote.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </h4>
                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                        <span>{quote.customerId?.companyName || quote.customerId?.userId?.name || 'Customer'}</span>
                        <span>{quote.lines?.length || 0} items</span>
                      </div>
                    </div>
                  );
                })}
                {quotes.length === 0 && (
                  <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No deals
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuotationListPage;
