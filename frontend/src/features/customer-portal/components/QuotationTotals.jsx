import React from 'react';

/**
 * QuotationTotals
 *
 * Displays the financial totals section of a quotation:
 * subtotal, discount, tax, and grand total.
 * Also shows the margin percentage if available.
 *
 * Props:
 *   quotation {object} — From the API contract:
 *     { subtotal, discountTotal, taxTotal, grandTotal, margin }
 */
function QuotationTotals({ quotation }) {
  if (!quotation) return null;

  function fmt(value) {
    if (value === null || value === undefined) return '—';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const rows = [
    { id: 'total-subtotal', label: 'Subtotal', value: `₹${fmt(quotation.subtotal)}`, muted: true },
    {
      id: 'total-discount',
      label: 'Discount',
      value: quotation.discountTotal ? `-₹${fmt(quotation.discountTotal)}` : '—',
      accent: 'text-emerald-400',
      muted: false,
    },
    { id: 'total-tax', label: 'Tax', value: `₹${fmt(quotation.taxTotal)}`, muted: true },
  ];

  return (
    <div className="quotation-totals" id="quotation-totals">
      {/* Subtotal, discount, tax */}
      <div className="space-y-2 mb-4">
        {rows.map((row) => (
          <div key={row.id} id={row.id} className="flex justify-between items-center text-sm">
            <span className="text-slate-400">{row.label}</span>
            <span className={row.accent ?? (row.muted ? 'text-slate-300' : 'text-slate-100')}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Grand total */}
      <div
        id="total-grand"
        className="flex justify-between items-center pt-4 border-t border-slate-600/60"
      >
        <span className="text-base font-bold text-white">Grand Total</span>
        <span className="text-xl font-bold text-brand-400">
          ₹{fmt(quotation.grandTotal)}
        </span>
      </div>

      {/* Margin — internal context, shown to customer for transparency */}
      {quotation.margin !== undefined && quotation.margin !== null && (
        <div
          id="total-margin"
          className="mt-3 pt-3 border-t border-slate-700/40 flex justify-between text-xs"
        >
          <span className="text-slate-500">Margin</span>
          <span className="text-slate-400">{quotation.margin}%</span>
        </div>
      )}
    </div>
  );
}

export default QuotationTotals;
