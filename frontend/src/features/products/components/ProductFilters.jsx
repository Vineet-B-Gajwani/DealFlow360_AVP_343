import React from 'react';

const PRODUCT_TYPES = ['PRODUCT', 'SERVICE', 'SUBSCRIPTION'];

const TYPE_LABELS = {
  PRODUCT: 'Product',
  SERVICE: 'Service',
  SUBSCRIPTION: 'Subscription',
};

/**
 * ProductFilters
 *
 * Search bar + dropdown filters for the product list.
 * Calls onFilterChange({ search, category, productType, isActive }) on any change.
 */
function ProductFilters({ filters, onFilterChange, categories = [] }) {
  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="product-search"
          type="text"
          placeholder="Search products…"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="form-input pl-9"
        />
      </div>

      {/* Category */}
      <select
        id="product-filter-category"
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
        className="form-input sm:w-44"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Product type */}
      <select
        id="product-filter-type"
        value={filters.productType || ''}
        onChange={(e) => handleChange('productType', e.target.value)}
        className="form-input sm:w-44"
      >
        <option value="">All types</option>
        {PRODUCT_TYPES.map((t) => (
          <option key={t} value={t}>{TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Status */}
      <select
        id="product-filter-status"
        value={filters.isActive ?? ''}
        onChange={(e) => handleChange('isActive', e.target.value)}
        className="form-input sm:w-36"
      >
        <option value="">All status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  );
}

export default ProductFilters;
