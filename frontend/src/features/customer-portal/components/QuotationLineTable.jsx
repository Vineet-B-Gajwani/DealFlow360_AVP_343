import React from 'react';

/**
 * QuotationLineTable
 *
 * Renders the line items of a quotation in a clean table layout.
 * Handles empty lines gracefully.
 *
 * Props:
 *   lines {Array} — From the quotation API contract:
 *     [{ productId, productName, quantity, unitPrice, discount, lineTotal }]
 */
function QuotationLineTable({ lines = [] }) {
  if (!lines || lines.length === 0) {
    return (
      <div className="portal-empty-state py-10">
        <p className="text-slate-500 text-sm">No line items found.</p>
      </div>
    );
  }

  function fmt(value) {
    if (value === null || value === undefined) return '—';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="quotation-table-wrapper" id="quotation-line-table">
      <table className="quotation-table">
        <thead>
          <tr>
            <th className="quotation-th text-left">Product</th>
            <th className="quotation-th text-right">Qty</th>
            <th className="quotation-th text-right">Unit Price</th>
            <th className="quotation-th text-right">Discount</th>
            <th className="quotation-th text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={line.productId ?? idx} className="quotation-tr">
              <td className="quotation-td">
                <span className="text-slate-100 font-medium">
                  {line.productName || '—'}
                </span>
                {line.productId && (
                  <span className="block text-xs text-slate-500 mt-0.5">
                    ID: {line.productId}
                  </span>
                )}
              </td>
              <td className="quotation-td text-right text-slate-300">
                {line.quantity ?? '—'}
              </td>
              <td className="quotation-td text-right text-slate-300">
                ₹{fmt(line.unitPrice)}
              </td>
              <td className="quotation-td text-right">
                {line.discount ? (
                  <span className="text-emerald-400 font-medium">
                    -{line.discount}%
                  </span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>
              <td className="quotation-td text-right font-semibold text-slate-100">
                ₹{fmt(line.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuotationLineTable;
