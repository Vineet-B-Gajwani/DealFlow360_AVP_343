import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import NotificationDropdown from '../../notifications/components/NotificationDropdown';

/**
 * PortalHeader
 *
 * Top navigation bar for the customer portal.
 * Displays the DealFlow360 branding, theme toggle, customer name, and a sign-out action.
 */
function PortalHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="DealFlow360 Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <div>
            <span className="portal-brand-name">DealFlow360</span>
            <span className="portal-brand-label">Customer Portal</span>
          </div>
          <nav className="ml-6 hidden md:flex items-center gap-2">
            <Link to="/portal" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
              Dashboard
            </Link>
            <Link to="/portal/buy" className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors flex items-center gap-1">
              🛒 Buy Products
            </Link>
          </nav>
        </div>

        {/* User info + Theme Toggle + notifications + logout */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
          </button>

          <NotificationDropdown />

          <div className="hidden sm:block text-right border-l border-slate-800 pl-3">
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
