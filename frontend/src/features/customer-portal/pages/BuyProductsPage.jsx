import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import apiClient from '../../auth/api/auth.api';

function BuyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchMyRequests();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await apiClient.get('/products?isActive=true');
      if (res.data?.success) {
        setProducts(res.data.data?.products || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await apiClient.get('/portal/quotation-requests');
      if (res.data?.success) {
        setMyRequests(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const updateQuantity = (productId, qty) => {
    const newQty = Math.max(0, qty);
    setCart((prev) => {
      const next = { ...prev };
      if (newQty === 0) {
        delete next[productId];
      } else {
        next[productId] = newQty;
      }
      return next;
    });
  };

  const selectedItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p._id === productId);
    return {
      productId,
      quantity,
      product,
    };
  }).filter(item => item.product);

  const totalEstimate = selectedItems.reduce((acc, item) => {
    return acc + (item.product.basePrice || 0) * item.quantity;
  }, 0);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one product to request.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const itemsPayload = selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await apiClient.post('/portal/quotation-requests', {
        items: itemsPayload,
        notes,
      });

      if (res.data?.success) {
        setSuccessMessage('🎉 Product demand submitted successfully! A sales representative will create a quotation for you shortly.');
        setCart({});
        setNotes('');
        fetchMyRequests();
      } else {
        setErrorMessage(res.data?.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-layout">
      <PortalHeader />

      <main className="portal-main" id="buy-products-main">
        <div className="portal-container space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Link to="/portal" className="text-xs text-slate-400 hover:text-white mb-1 inline-block">
                ← Back to Portal
              </Link>
              <h1 className="text-2xl font-bold text-white">Buy Products &amp; Request Quote</h1>
              <p className="text-slate-400 text-sm mt-1">
                Select the products you need and submit a demand request to your Sales Representative.
              </p>
            </div>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-medium flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-medium flex justify-between items-center">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Catalog list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-100">Product Catalog</h2>

              {loadingProducts ? (
                <div className="py-12 text-center text-slate-400">Loading catalog...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                  No active products available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const currentQty = cart[product._id] || 0;
                    return (
                      <div
                        key={product._id}
                        className={`p-4 rounded-xl border transition-all ${
                          currentQty > 0
                            ? 'bg-slate-800/90 border-brand-500 shadow-md shadow-brand-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-base">{product.name}</h3>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                          {product.description || 'Enterprise grade solution'}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-xs text-slate-500">Base Price</span>
                            <p className="font-bold text-brand-400 text-sm">
                              ₹{Number(product.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {currentQty === 0 ? (
                              <button
                                onClick={() => updateQuantity(product._id, 1)}
                                className="px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                + Select
                              </button>
                            ) : (
                              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1">
                                <button
                                  onClick={() => updateQuantity(product._id, currentQty - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white font-bold text-sm hover:bg-slate-700 rounded"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-white">{currentQty}</span>
                                <button
                                  onClick={() => updateQuantity(product._id, currentQty + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white font-bold text-sm hover:bg-slate-700 rounded"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Request Summary Panel */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">Request Summary</h2>

                {selectedItems.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">
                    No products selected yet. Click "+ Select" on any catalog item to build your demand request.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedItems.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded border border-slate-700/50">
                          <div>
                            <p className="font-semibold text-slate-200 text-xs">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.product.basePrice}</p>
                          </div>
                          <span className="font-mono text-xs text-white">
                            ₹{(item.product.basePrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                      <span>Estimated Base Total:</span>
                      <span className="text-brand-400 font-mono text-base">
                        ₹{totalEstimate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <form onSubmit={handleSubmitRequest} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Notes / Specific Requirements (Optional)
                        </label>
                        <textarea
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs min-h-[70px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="E.g., Require delivery by Q3, interested in annual subscription discount..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-lg shadow-lg shadow-brand-500/20 disabled:opacity-50 text-sm transition-colors"
                      >
                        {submitting ? 'Submitting Request...' : '📩 Submit Buy Request'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Previous requests */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-white text-sm mb-3">Your Submitted Requests</h3>
                {loadingRequests ? (
                  <p className="text-slate-500 text-xs">Loading requests...</p>
                ) : myRequests.length === 0 ? (
                  <p className="text-slate-500 text-xs">No previous product requests.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
                    {myRequests.map((req) => (
                      <div key={req._id} className="p-2.5 bg-slate-800/40 rounded border border-slate-700/60 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-medium text-slate-200">{req.items?.length || 0} Products Requested</p>
                          <p className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'CONVERTED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BuyProductsPage;
