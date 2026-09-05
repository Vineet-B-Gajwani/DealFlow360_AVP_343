import React from 'react';

/**
 * Pagination
 *
 * Simple previous / next / page-number pagination bar.
 *
 * Props:
 *   page        {number}    Current page (1-indexed)
 *   totalPages  {number}
 *   total       {number}    Total result count
 *   limit       {number}    Items per page
 *   onPage      {function}  (page: number) => void
 */
function Pagination({ page, totalPages, total, limit = 20, onPage }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build a compact page range: [1, ..., page-1, page, page+1, ..., last]
  const pages = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-xs text-slate-500">
        Showing <span className="text-slate-300 font-medium">{from}–{to}</span> of{' '}
        <span className="text-slate-300 font-medium">{total}</span> products
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          id="pagination-prev"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-600 text-xs select-none">…</span>
          ) : (
            <button
              key={p}
              id={`pagination-page-${p}`}
              onClick={() => onPage(p)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                p === page
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border-slate-700/50'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          id="pagination-next"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;
