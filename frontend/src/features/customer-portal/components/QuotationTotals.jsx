import React from 'react';

function QuotationTotals({ quotation }) {
  if (!quotation) return null;

  function fmt(value) {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const subTotal = quotation.subTotal ?? quotation.subtotal ?? 0;
  const discountTotal = quotation.discountTotal ?? 0;
  const taxTotal = quotation.taxTotal ?? 0;
  const grandTotal = quotation.grandTotal ?? 0;

  const rows = [
    { id: 'total-subtotal', label: 'Subtotal', value: `₹${fmt(subTotal)}`, muted: true },
    {
      id: 'total-discount',
      label: 'Discount',
      value: discountTotal ? `-₹${fmt(discountTotal)}` : '₹0.00',
      accent: 'text-emerald-400',
      muted: false,
    },
    { id: 'total-tax', label: 'Tax', value: `₹${fmt(taxTotal)}`, muted: true },
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
          ₹{fmt(grandTotal)}
        </span>
      </div>
    </div>
  );
}

export default QuotationTotals;
