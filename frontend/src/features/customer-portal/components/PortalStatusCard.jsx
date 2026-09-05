import React from 'react';

/**
 * PortalStatusCard
 *
 * Displays the customer's portal status summary:
 * activation date, portal active state, and placeholder counts
 * for future features (quotations, pending actions).
 *
 * Props:
 *   status {object} - From GET /api/portal/status
 *     - portalActive       {boolean}
 *     - portalActivatedAt  {string|null}   ISO date string
 *     - quotationCount     {number}        Placeholder (0 until M3-F2)
 *     - pendingActions     {number}        Placeholder
 *     - lastActivity       {string|null}   ISO date string
 */
function PortalStatusCard({ status }) {
  if (!status) return null;

  const activatedDate = status.portalActivatedAt
    ? new Date(status.portalActivatedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const stats = [
    {
      id: 'stat-quotations',
      label: 'Quotations',
      value: status.quotationCount ?? 0,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'stat-pending',
      label: 'Pending Actions',
      value: status.pendingActions ?? 0,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="portal-status-card">
      {/* Portal active badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100">Portal Status</h2>
        <span className="portal-active-badge">
          <span className="portal-active-dot" aria-hidden="true" />
          Active
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.id} id={stat.id} className="portal-stat">
            <div className="portal-stat-icon">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activation info */}
      <div className="border-t border-slate-700/60 pt-4">
        <p className="text-xs text-slate-500">
          Portal activated:{' '}
          <span className="text-slate-300 font-medium">{activatedDate}</span>
        </p>
      </div>
    </div>
  );
}

export default PortalStatusCard;
