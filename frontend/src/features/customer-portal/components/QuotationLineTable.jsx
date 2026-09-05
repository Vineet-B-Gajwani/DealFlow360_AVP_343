import React from 'react';

function QuotationLineTable({ lines = [] }) {
  if (!lines || lines.length === 0) {
    return (
      <div className="portal-empty-state py-10">
        <p className="text-slate-500 text-sm">No line items found.</p>
      </div>
    );
  }

  function fmt(value) {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="quotation-table-wrapper" id="quotation-line-table">
      <table className="quotation-table w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
            <th className="quotation-th text-left py-2 px-3">Product</th>
            <th className="quotation-th text-right py-2 px-3">Qty</th>
            <th className="quotation-th text-right py-2 px-3">Unit Price</th>
            <th className="quotation-th text-right py-2 px-3">Discount</th>
            <th className="quotation-th text-right py-2 px-3">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {lines.map((line, idx) => {
            const productName = line.productId?.name || line.productName || 'Product';
            const category = line.productId?.category || '';
            const lineTotal = line.total ?? line.lineTotal ?? ((line.unitPrice || 0) * (line.quantity || 1) - (line.discount || 0));

            return (
              <tr key={line._id || line.productId?._id || idx} className="quotation-tr">
                <td className="quotation-td py-3 px-3">
                  <span className="text-slate-100 font-medium block">
                    {productName}
                  </span>
                  {category && (
                    <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded mt-0.5">
                      {category}
                    </span>
                  )}
                </td>
                <td className="quotation-td text-right text-slate-300 py-3 px-3">
                  {line.quantity ?? 1}
                </td>
                <td className="quotation-td text-right text-slate-300 py-3 px-3">
                  ₹{fmt(line.unitPrice)}
                </td>
                <td className="quotation-td text-right py-3 px-3">
                  {line.discount > 0 ? (
                    <span className="text-emerald-400 font-medium">
                      ₹{fmt(line.discount)}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="quotation-td text-right font-semibold text-slate-100 py-3 px-3">
                  ₹{fmt(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default QuotationLineTable;
