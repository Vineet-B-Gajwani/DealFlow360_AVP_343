import React from 'react';
import { Link } from 'react-router-dom';
import StatusToggle from './StatusToggle';

const TYPE_COLORS = {
  PRODUCT: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  SERVICE: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  SUBSCRIPTION: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
};

const TYPE_LABELS = {
  PRODUCT: 'Product',
  SERVICE: 'Service',
  SUBSCRIPTION: 'Subscription',
};

/**
 * ProductTable
 *
 * Renders the product list as a premium dark-mode data table.
 *
 * Props:
 *   products    {Product[]}          Data rows
 *   onToggle    {function}           (product) => void — called on status toggle
 *   isToggling  {string|null}        ID of the product currently being toggled
 */
function ProductTable({ products, onToggle, isToggling }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-semibold text-base mb-1">No products found</h3>
        <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/60 border-b border-slate-700/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
              Base Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
              Tax
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {products.map((product) => (
            <tr
              key={product._id}
              className="group bg-slate-900/40 hover:bg-slate-800/40 transition-colors"
            >
              {/* Name + description */}
              <td className="px-4 py-3">
                <div className="font-medium text-slate-100 group-hover:text-white transition-colors truncate max-w-[220px]">
                  {product.name}
                </div>
                {product.description && (
                  <div className="text-xs text-slate-500 truncate max-w-[220px] mt-0.5">
                    {product.description}
                  </div>
                )}
                {product.variants?.length > 0 && (
                  <div className="text-xs text-brand-400 mt-0.5">
                    {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                  </div>
                )}
              </td>

              {/* Category */}
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-slate-400 text-xs">{product.category}</span>
              </td>

              {/* Type badge */}
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${TYPE_COLORS[product.productType] || ''}`}>
                  {TYPE_LABELS[product.productType] || product.productType}
                </span>
              </td>

              {/* Base price */}
              <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                ₹{Number(product.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                <span className="text-slate-500 text-xs ml-1">/ {product.unit}</span>
              </td>

              {/* Tax rate */}
              <td className="px-4 py-3 text-right text-slate-400 text-xs tabular-nums hidden lg:table-cell">
                {product.taxRate ?? 0}%
              </td>

              {/* Status toggle */}
              <td className="px-4 py-3 text-center">
                <StatusToggle
                  id={`product-toggle-${product._id}`}
                  isActive={product.isActive}
                  onToggle={() => onToggle(product)}
                  isDisabled={isToggling === product._id}
                />
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/products/${product._id}/edit`}
                  id={`product-edit-${product._id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 transition-all duration-150"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
