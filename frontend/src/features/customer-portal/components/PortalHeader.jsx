import React from 'react';
import useAuth from '../../auth/hooks/useAuth';

/**
 * PortalHeader
 *
 * Top navigation bar for the customer portal.
 * Displays the DealFlow360 branding, customer name, and a sign-out action.
 */
function PortalHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="portal-brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="portal-brand-name">DealFlow360</span>
            <span className="portal-brand-label">Customer Portal</span>
          </div>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-100 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            id="portal-logout-btn"
            onClick={handleLogout}
            className="portal-logout-btn"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline ml-1.5">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default PortalHeader;
