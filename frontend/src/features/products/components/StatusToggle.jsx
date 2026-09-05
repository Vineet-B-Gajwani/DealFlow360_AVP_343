import React from 'react';

/**
 * StatusToggle
 *
 * Reusable dark-mode toggle switch for activating/deactivating a product.
 *
 * Props:
 *   isActive   {boolean}
 *   onToggle   {function}
 *   isDisabled {boolean}
 *   id         {string}
 */
function StatusToggle({ isActive, onToggle, isDisabled = false, id }) {
  return (
    <button
      id={id}
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      title={isActive ? 'Deactivate product' : 'Activate product'}
      className={`
        relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900
        ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      role="switch"
      aria-checked={isActive}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          isActive ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default StatusToggle;
