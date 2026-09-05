import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import productsApi from '../api/products.api';
import ProductFilters from '../components/ProductFilters';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';
import useAuth from '../../auth/hooks/useAuth';

/**
 * ProductListPage
 *
 * Main product management hub.
 * Route: /products
 */
function ProductListPage() {
  const { user } = useAuth();
  const {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    refetch,
    categories,
  } = useProducts();

  const [isToggling, setIsToggling] = useState(null);
  const [toggleError, setToggleError] = useState('');
  const canEditProducts = user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER';

  const handleToggle = async (product) => {
    if (!canEditProducts) return;
    setIsToggling(product._id);
    setToggleError('');
    try {
      await productsApi.setStatus(product._id, !product.isActive);
      refetch();
    } catch (err) {
      setToggleError(
        err.response?.data?.message || 'Failed to update product status.'
      );
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Decorative background ─────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-brand-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-300">Products</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Product Catalogue</h1>
            <p className="text-slate-400 text-sm mt-1">
              {total > 0 ? `${total} product${total !== 1 ? 's' : ''}` : 'View product catalogue and prices'}
            </p>
          </div>

          {canEditProducts && (
            <Link
              to="/products/new"
              id="create-product-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-900/30 transition-all hover:shadow-brand-800/40 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add product
            </Link>
          )}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 mb-6">
          <ProductFilters
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
          />
        </div>

        {/* ── Toggle error banner ──────────────────────────────────────── */}
        {toggleError && (
          <div role="alert" className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {toggleError}
          </div>
        )}

        {/* ── Main content card ────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6">

          {/* Loading */}
          {isLoading && (
            <div id="products-loading" className="flex flex-col items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading products…</p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div id="products-error" className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2">Failed to load products</h2>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button id="products-retry" onClick={refetch} className="btn-primary max-w-xs">
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <>
              <ProductTable
                products={products}
                onToggle={handleToggle}
                isToggling={isToggling}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={filters.limit}
                onPage={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;
