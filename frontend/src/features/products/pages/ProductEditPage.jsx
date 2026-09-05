import React, { useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import useProduct from '../hooks/useProduct';
import productsApi from '../api/products.api';

/**
 * ProductEditPage
 *
 * Route: /products/:id/edit
 * Roles: ADMIN, SALES_MANAGER (enforced on backend)
 */
function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isJustCreated = location.state?.created;

  const { product, isLoading, error: loadError, refetch } = useProduct(id);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    isJustCreated ? 'Product created successfully!' : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await productsApi.update(id, data);
      setSuccessMsg('Product updated successfully.');
      refetch();
    } catch (err) {
      const apiData = err?.response?.data;
      if (apiData?.errors?.length) {
        setServerError(apiData.errors.map((e) => e.message).join(' · '));
      } else {
        setServerError(apiData?.message || 'Failed to update product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background glow blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-900/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <Link to="/products" className="hover:text-slate-300 transition-colors">Products</Link>
            <span>›</span>
            <span className="text-slate-300">{isLoading ? 'Loading...' : product?.name || 'Edit product'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isLoading ? 'Edit Product' : `Edit ${product?.name}`}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Update catalogue details, pricing, variants, and settings.
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-400 hover:text-emerald-200 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading / Error / Form container */}
        {isLoading ? (
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mb-3" />
            <p className="text-slate-400 text-sm">Loading product details...</p>
          </div>
        ) : loadError ? (
          <div className="bg-slate-900/70 backdrop-blur-sm border border-rose-700/50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-white font-semibold text-lg mb-1">Product Not Found</h3>
            <p className="text-slate-400 text-sm mb-6">{loadError}</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700 text-sm"
            >
              ← Back to Products
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
            <ProductForm
              initialData={product}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              serverError={serverError}
              submitLabel="Save changes"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductEditPage;
