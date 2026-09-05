import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';

function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch Quotation
      const res = await fetch(`http://localhost:5000/api/quotations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setQuotation(data.data);
      }

      // Fetch Products
      const prodRes = await fetch(`http://localhost:5000/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.data);
      }

      // Fetch Upsell Recommendations
      const recRes = await fetch(`http://localhost:5000/api/quotations/${id}/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recData = await recRes.json();
      if (recData.success) {
        setRecommendations(recData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = async (productIdToAdd, qty = quantity, disc = discountPercent) => {
    const pId = productIdToAdd || selectedProduct;
    if (!pId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/quotations/${id}/lines`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: pId,
          quantity: parseInt(qty, 10),
          discount: parseFloat(disc)
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setSelectedProduct('');
        setQuantity(1);
        setDiscountPercent(0);
      } else {
        alert(data.message || 'Failed to add line');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLine = async (lineId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/quotations/${id}/lines/${lineId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Failed to remove line');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/quotations/${id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        navigate('/quotations');
      } else {
        alert(data.message || 'Submit failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!quotation) return <div className="p-8 text-white">Quotation not found.</div>;

  const isEditable = quotation.status === 'DRAFT' || quotation.status === 'NEGOTIATING';

  // Calculate estimated margin
  const totalCost = (quotation.lines || []).reduce((acc, line) => {
    const cost = line.productId?.costPrice || (line.unitPrice * 0.7);
    return acc + (cost * line.quantity);
  }, 0);
  const totalRevenue = quotation.subTotal - quotation.discountTotal;
  const estimatedMargin = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quote Builder</h1>
          <p className="text-slate-400 font-mono mt-1">
            {quotation.quotationNumber} • <span className="bg-slate-800 text-xs px-2 py-1 rounded text-white">{quotation.status}</span>
          </p>
        </div>
        <div className="space-x-3">
          <button onClick={() => navigate('/quotations')} className="px-4 py-2 border border-slate-700 text-slate-300 rounded hover:bg-slate-800">
            Back
          </button>
          {isEditable && quotation.lines.length > 0 && (
            <button onClick={handleSubmit} className="px-4 py-2 bg-brand-500 text-white font-medium rounded hover:bg-brand-400">
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lines */}
        <div className="col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-lg font-medium text-white mb-4">Line Items</h2>
            
            {quotation.lines.length === 0 ? (
              <p className="text-slate-500 text-sm">No products added yet.</p>
            ) : (
              <div className="space-y-3">
                {quotation.lines.map((line, idx) => (
                  <div key={line._id || idx} className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">{line.productId?.name || 'Product'}</h4>
                        {line.productId?.category && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                            {line.productId.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Qty: {line.quantity} • Unit: ₹{line.unitPrice} • Disc: ₹{(line.discount || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-white">₹{line.total?.toFixed(2)}</p>
                      </div>
                      {isEditable && (
                        <button
                          onClick={() => handleRemoveLine(line._id)}
                          className="text-rose-400 hover:text-rose-300 text-sm p-1"
                          title="Remove line"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Line Form */}
          {isEditable && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="font-medium text-white mb-4">Add Product</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleAddLine(); }} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Product</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.category}) — ₹{p.basePrice}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-slate-400 mb-1">Qty</label>
                  <input 
                    type="number" min="1"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                    value={quantity} onChange={e => setQuantity(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-slate-400 mb-1">Discount (%)</label>
                  <input 
                    type="number" min="0" max="100"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
                    value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!selectedProduct} className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded disabled:opacity-50 font-medium">
                  Add
                </button>
              </form>
            </div>
          )}

          {/* Upsell / Cross-sell Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-lg p-5 bg-gradient-to-r from-purple-950/20 to-slate-900">
              <h3 className="font-semibold text-purple-300 text-sm mb-3 flex items-center gap-2">
                <span>💡 Recommended Upsells & Add-ons</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec) => (
                  <div key={rec._id} className="p-3 bg-slate-800/80 rounded border border-purple-500/20 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-slate-100">{rec.recommendedProduct?.name}</div>
                      <div className="text-xs text-slate-400">₹{rec.recommendedProduct?.basePrice} • {rec.recommendationType || 'Cross-sell'}</div>
                      {rec.discountPercentage > 0 && (
                        <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{rec.discountPercentage}% Bundle Promo</div>
                      )}
                    </div>
                    {isEditable && (
                      <button
                        onClick={() => handleAddLine(rec.recommendedProduct?._id, 1, rec.discountPercentage || 0)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded font-medium"
                      >
                        + Add to Quote
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Totals & Margin */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-lg font-medium text-white mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{quotation.subTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-brand-400">
                <span>Total Discount</span>
                <span>-₹{quotation.discountTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span>₹{quotation.taxTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between font-bold text-white text-lg">
                <span>Grand Total</span>
                <span>₹{quotation.grandTotal?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Margin Indicator */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Deal Margin:</span>
                <span className={`font-mono font-bold ${Number(estimatedMargin) >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {estimatedMargin}%
                </span>
              </div>
            </div>

            {isEditable && quotation.discountTotal > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200/80 text-xs">
                ⚠️ Blended Discount Risk will be evaluated upon submission. High risk lines will trigger approval workflow.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationDetail;
