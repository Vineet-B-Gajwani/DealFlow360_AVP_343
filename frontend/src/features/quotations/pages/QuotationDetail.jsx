import React, { useEffect, useState, Component } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import apiClient from '../../auth/api/auth.api';
import NegotiationPanel from '../../negotiation/components/NegotiationPanel';

// Price List to Tier Mapping
const PRICE_LIST_TO_TIER = {
  'Standard Price List': 'Standard',
  'Gold Tier 2026': 'Gold',
  'Platinum Tier 2026': 'Platinum',
  'Wholesale Bulk': 'Silver',
};

// Fallback Tier Limits if backend rules mapping is loading
const FALLBACK_TIER_LIMITS = {
  Standard: { Hardware: 5, Service: 5, Subscription: 5 },
  Silver: { Hardware: 10, Service: 8, Subscription: 8 },
  Gold: { Hardware: 15, Service: 10, Subscription: 5 },
  Platinum: { Hardware: 20, Service: 15, Subscription: 10 },
};

// Error Boundary Fallback for QuotationDetail Component
class QuotationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QuotationDetail Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-lg">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong displaying this quotation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 font-mono text-left bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto text-xs">
            {this.state.error?.toString() || 'Unknown rendering error'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded shadow transition-colors"
            >
              🔄 Reload Page
            </button>
            <a
              href="/quotations"
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs rounded transition-colors"
            >
              Back to Quotations List
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function QuotationDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [priceList, setPriceList] = useState('Standard Price List');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [quotRes, prodRes, recRes] = await Promise.allSettled([
        apiClient.get(`/quotations/${id}`),
        apiClient.get('/products'),
        apiClient.get(`/quotations/${id}/recommendations`)
      ]);

      if (quotRes.status === 'fulfilled' && quotRes.value.data?.success) {
        const qData = quotRes.value.data.data;
        if (qData) {
          setQuotation(qData);
          if (qData.priceList) setPriceList(qData.priceList);
        } else {
          setError('Quotation data not found.');
        }
      } else {
        const msg = quotRes.status === 'rejected'
          ? quotRes.reason?.response?.data?.message || 'Quotation not found.'
          : quotRes.value.data?.message || 'Quotation not found.';
        setError(msg);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        const rawData = prodRes.value.data.data;
        const prodList = Array.isArray(rawData) ? rawData : (rawData?.products || []);
        setProducts(prodList);
      }

      if (recRes.status === 'fulfilled' && recRes.value.data?.success) {
        const recList = Array.isArray(recRes.value.data.data) ? recRes.value.data.data : [];
        setRecommendations(recList);
      }
    } catch (err) {
      console.error('Error fetching quotation data', err);
      setError('An unexpected error occurred while loading quotation.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceListChange = async (newPriceList) => {
    setPriceList(newPriceList);
    try {
      const res = await apiClient.put(`/quotations/${id}`, { priceList: newPriceList });
      if (res.data?.success) {
        setQuotation(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update price list', err);
    }
  };

  const handleAddLine = async (productIdToAdd, qty = quantity, disc = discountPercent) => {
    const pId = productIdToAdd || selectedProduct;
    if (!pId) {
      alert('Please select a product from the dropdown.');
      return;
    }

    try {
      const res = await apiClient.post(`/quotations/${id}/lines`, {
        productId: pId,
        quantity: parseInt(qty || 1, 10),
        discountPercent: parseFloat(disc || 0)
      });
      if (res.data?.success) {
        setQuotation(res.data.data);
        setSelectedProduct('');
        setQuantity(1);
        setDiscountPercent(0);
      } else {
        alert(res.data?.message || 'Failed to add line');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add line item');
    }
  };

  // Helper to handle clicks on Upsell Suggestion Cards
  const handleUpsellClick = async (typeKey, defaultPromoDisc = 0) => {
    if (products.length === 0) return;

    let targetProd = null;
    if (typeKey === 'mouse') {
      targetProd = products.find(p => p.name.toLowerCase().includes('mouse'))
        || products.find(p => p.category === 'Hardware')
        || products[0];
    } else if (typeKey === 'dock') {
      targetProd = products.find(p => p.name.toLowerCase().includes('switch') || p.name.toLowerCase().includes('dock'))
        || products.find(p => p.category === 'Hardware')
        || products[1] || products[0];
    } else if (typeKey === 'care') {
      targetProd = products.find(p => p.productType === 'SERVICE' || p.category === 'Service' || p.category === 'Subscription')
        || products[2] || products[0];
    } else {
      targetProd = products[0];
    }

    if (targetProd) {
      await handleAddLine(targetProd._id, 1, defaultPromoDisc);
    }
  };

  const handleUpdateLine = async (lineId, newQty, newDiscPercent) => {
    try {
      const res = await apiClient.put(`/quotations/${id}/lines/${lineId}`, {
        quantity: parseInt(newQty || 1, 10),
        discountPercent: parseFloat(newDiscPercent || 0)
      });
      if (res.data?.success) {
        setQuotation(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update line', err);
    }
  };

  const handleRemoveLine = async (lineId) => {
    try {
      const res = await apiClient.delete(`/quotations/${id}/lines/${lineId}`);
      if (res.data?.success) {
        setQuotation(res.data.data);
      } else {
        alert(res.data?.message || 'Failed to remove line');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to remove line item');
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const res = await apiClient.put(`/quotations/${id}`, { priceList });
      if (res.data?.success) {
        alert('Quotation draft saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await apiClient.post(`/quotations/${id}/submit`);
      if (res.data?.success) {
        navigate('/quotations');
      } else {
        alert(res.data?.message || 'Submit failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submit failed');
    }
  };

  const handleSyncCustomerNeeds = async () => {
    if (!quotation?.quotationRequestId?.items) return;
    const reqItems = quotation.quotationRequestId.items;

    for (const item of reqItems) {
      const pId = item?.productId?._id || item?.productId;
      if (pId) {
        await handleAddLine(pId, item.quantity || 1, 0);
      }
    }
  };

  // Helper to compute discount limit % based on selected price list / tier
  const getLimitForCategory = (tierName, categoryName = 'Hardware') => {
    const backendRules = quotation?.discountRules;
    if (backendRules && backendRules[tierName] && backendRules[tierName][categoryName] !== undefined) {
      return backendRules[tierName][categoryName];
    }
    const fallback = FALLBACK_TIER_LIMITS[tierName] || FALLBACK_TIER_LIMITS.Standard;
    return fallback[categoryName] !== undefined ? fallback[categoryName] : 15;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-slate-600 dark:text-slate-300 font-medium animate-pulse text-base">
          Loading quotation details...
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-lg">
        <div className="text-4xl mb-3">📄</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quotation Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          {error || "The requested quotation could not be loaded or does not exist."}
        </p>
        <button
          onClick={() => navigate('/quotations')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow transition-colors text-xs font-semibold"
        >
          Back to Quotations List
        </button>
      </div>
    );
  }

  const isEditable = quotation.status === 'DRAFT' || quotation.status === 'NEGOTIATING';
  const lines = Array.isArray(quotation.lines) ? quotation.lines : [];
  const customerName = quotation.customerId?.companyName 
    || quotation.customerId?.userId?.name 
    || (typeof quotation.customerId === 'string' ? quotation.customerId : 'Acme Corp');
  
  const customerRequest = quotation.quotationRequestId;
  const isReqObject = Boolean(customerRequest && typeof customerRequest === 'object' && !Array.isArray(customerRequest));

  // Determine active tier based on selected price list or customer tier
  const activeTier = PRICE_LIST_TO_TIER[priceList] || quotation.customerId?.tier || 'Standard';

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 font-sans">
      {/* Top Navbar Header (Matching Wireframe Mockup) */}
      <div className="bg-[#1A56B0] text-white rounded-t-xl px-4 py-2.5 flex items-center justify-between shadow-sm overflow-x-auto text-xs font-medium">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm tracking-wide flex items-center gap-2">
            <img src="/logo.jpg" alt="DealFlow360 Logo" className="w-6 h-6 rounded object-cover shadow-xs" />
            DealFlow360
          </span>
          <nav className="flex items-center gap-2">
            <Link to="/dashboard" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Dashboard</Link>
            <Link to="/quotations" className="px-3 py-1 rounded bg-white text-[#1A56B0] font-bold shadow-xs">Quotations</Link>
            {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER' || user?.role === 'FINANCE_OPERATIONS') && (
              <Link to="/approvals" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Approvals</Link>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OPERATIONS') && (
              <>
                <Link to="/fulfillment" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Fulfillment</Link>
                <Link to="/subscriptions" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Subscriptions</Link>
                <Link to="/invoices" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Invoices</Link>
              </>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER') && (
              <Link to="/deal-health" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Deal Health</Link>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER') && (
              <Link to="/reporting" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Reports</Link>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'SALES_REP' || user?.role === 'SALES_MANAGER') && (
              <Link to="/products" className="px-3 py-1 rounded hover:bg-blue-600/50 transition-colors">Product</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main Quotation Builder Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-b-xl rounded-t-none p-6 shadow-md space-y-6">
        
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Quotation Detail: {quotation.quotationNumber || 'Q-1042'} ({customerName})
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {quotation.status || 'DRAFT'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Opened by clicking a row on the Quotations list. Add products, apply discounts, review upsells.
          </p>
        </div>

        {/* Customer Need & Requirements Visibility Panel (Sales Rep View) */}
        {isReqObject && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <span>📋 Customer Buy Demand / Needs</span>
                <span className="text-[10px] bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded font-mono">
                  Requested by Customer
                </span>
              </h3>
              {isEditable && (
                <button
                  onClick={handleSyncCustomerNeeds}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded shadow transition-colors"
                >
                  ⚡ Sync Customer Needs to Quotation
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold">Notes:</span> {customerRequest.notes || 'No specific notes added.'}
            </p>
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Requested Items:</span>{' '}
              {Array.isArray(customerRequest.items) && customerRequest.items.map((it, idx) => {
                if (!it) return null;
                const prodName = it.productId?.name || (typeof it.productId === 'string' ? it.productId : 'Product');
                return (
                  <span key={idx} className="inline-block bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded px-2 py-0.5 mr-2 text-[11px] font-mono">
                    {prodName} (Qty: {it.quantity || 1})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Controls: Customer & Price List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer</label>
            <input
              type="text"
              readOnly
              value={`${customerName} (${activeTier} Tier)`}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Price List (Governs Tier Limits)</label>
            <select
              disabled={!isEditable}
              value={priceList}
              onChange={(e) => handlePriceListChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard Price List">Standard Price List (5% Limit)</option>
              <option value="Wholesale Bulk">Wholesale Bulk / Silver (10% Limit)</option>
              <option value="Gold Tier 2026">Gold Tier Price List (15% Limit)</option>
              <option value="Platinum Tier 2026">Platinum Tier Price List (20% Limit)</option>
            </select>
          </div>
        </div>

        {/* Line Items Table ( exact wireframe match) */}
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 font-bold uppercase tracking-wider">
                <th className="p-3">Product</th>
                <th className="p-3 w-20 text-center">Qty</th>
                <th className="p-3 w-28 text-right">Price</th>
                <th className="p-3 w-28 text-center">Discount</th>
                <th className="p-3 w-24 text-center">Limit</th>
                <th className="p-3 w-32 text-center">Status</th>
                {isEditable && <th className="p-3 w-16 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={isEditable ? 7 : 6} className="p-6 text-center text-slate-400 italic">
                    No products added to this quotation yet. Select products or add recommendations below.
                  </td>
                </tr>
              ) : (
                lines.map((line, index) => {
                  if (!line) return null;
                  const category = line.productId?.category || 'Hardware';
                  const pName = line.productId?.name || (typeof line.productId === 'string' ? line.productId : 'Product');
                  const unitP = Number(line.unitPrice || 0);
                  const discP = Number(line.discountPercent || 0);

                  // Calculate limit percent live based on selected Price List / Tier!
                  const limitP = getLimitForCategory(activeTier, category);
                  const isOver = discP > limitP;
                  const excessPt = Math.round(discP - limitP);
                  const statusLabel = isOver ? `OVER (+${excessPt}pt)` : 'OK';

                  return (
                    <tr key={line._id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {pName}
                        {category && (
                          <span className="ml-2 text-[10px] font-normal px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400">
                            {category}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isEditable ? (
                          <input
                            type="number"
                            min="1"
                            value={line.quantity || 1}
                            onChange={(e) => handleUpdateLine(line._id, e.target.value, line.discountPercent)}
                            className="w-14 text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        ) : (
                          <span className="font-mono">{line.quantity}</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        ₹{unitP.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-center">
                        {isEditable ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={discP}
                              onChange={(e) => handleUpdateLine(line._id, line.quantity, e.target.value)}
                              className="w-16 text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        ) : (
                          <span className="font-mono">{discP}%</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                        {limitP}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-tight ${
                            isOver
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      {isEditable && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveLine(line._id)}
                            className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 text-sm p-1 font-bold transition-colors"
                            title="Remove line item"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Live Limit Check Alert Box (Yellow wireframe banner) */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-lg text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2 shadow-xs">
          <span className="text-base">⚡</span>
          <span>
            Discount is checked against each line's own limit live ({activeTier} Tier limit applies), as soon as it is entered, not only at submit time.
          </span>
        </div>

        {/* Add Product Form */}
        {isEditable && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Add Product Line Item
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddLine();
              }}
              className="flex flex-wrap md:flex-nowrap items-end gap-3"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Product</label>
                <select
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select product to add...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.category}) — ₹{p.basePrice?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="w-28">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!selectedProduct}
                className="px-4 py-2 bg-[#1A56B0] hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50 transition-colors shadow-xs"
              >
                + Add Line
              </button>
            </form>
          </div>
        )}

        {/* Upsell and Cross-Sell Suggestions Section (Exact Wireframe match) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#1A56B0] dark:text-blue-400">
            Upsell and Cross-Sell Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => {
                if (!rec) return null;
                const prod = rec.recommendedProduct || rec;
                const pName = prod?.name || 'Recommended Product';
                const pPrice = prod?.basePrice || 0;
                const pId = prod?._id || rec._id;
                const pDisc = rec.discountPercentage || 0;

                return (
                  <div
                    key={pId || idx}
                    onClick={() => pId && handleAddLine(pId, 1, pDisc)}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        + {pName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        {pDisc > 0 ? `Promo: ${pDisc}% off` : `Margin +₹${Math.round((pPrice || 100) * 0.35).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    {isEditable && pId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddLine(pId, 1, pDisc); }}
                        className="mt-3 w-full py-1.5 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 font-semibold text-xs rounded transition-colors text-center"
                      >
                        + Add to Quote
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {/* Wireframe Mockup Suggestion Cards — Fully Functional */}
                <div
                  onClick={() => handleUpsellClick('mouse', 0)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                >
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">+ Wireless Mouse / Hardware</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">Margin +₹1,450</p>
                </div>
                <div
                  onClick={() => handleUpsellClick('dock', 12)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                >
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">+ Docking Station / Network Switch</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">Promo: 12% off</p>
                </div>
                <div
                  onClick={() => handleUpsellClick('care', 0)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                >
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">+ Care Plan / IT Service</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">Margin +₹3,600</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Negotiation & History Section */}
        {quotation?.status === 'NEGOTIATING' && (
          <div className="p-4 bg-blue-950/80 border border-blue-700/60 rounded-xl text-blue-200 text-xs font-medium flex items-center gap-3 shadow-lg">
            <span className="text-xl">💬</span>
            <div>
              <span className="font-bold block text-sm text-white">Active Customer Negotiation</span>
              <span>The customer has submitted a counter-discount request or change proposal. Review the messages in the Negotiation History tab below.</span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-[#1A56B0] dark:text-blue-400 flex items-center gap-2">
            <span>💬 Customer Negotiation & Communication History</span>
          </h2>
          <NegotiationPanel quotationId={id} />
        </div>

        {/* Bottom Action Buttons (Matching Mockup Wireframe) */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          {isEditable && lines.length > 0 && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#1A56B0] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              {user?.role === 'SALES_REP' ? 'Send to Sales Manager for Approval' : 'Submit for Manager Approval'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function QuotationDetail() {
  return (
    <QuotationErrorBoundary>
      <QuotationDetailContent />
    </QuotationErrorBoundary>
  );
}
