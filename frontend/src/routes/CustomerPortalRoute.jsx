import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

/**
 * CustomerPortalRoute
 *
 * A dedicated route guard for the customer portal.
 * Separate from the internal ProtectedRoute (Member 1).
 *
 * Behaviours:
 *   1. Loading  → show spinner (prevent flash of content)
 *   2. Not authenticated → redirect to /portal/login
 *   3. Authenticated but role !== CUSTOMER → show 403
 *      (prevents ADMIN/SALES_REP navigating to /portal via URL manipulation)
 *   4. Authenticated CUSTOMER → render children
 *
 * All security-sensitive behaviour is also enforced on the backend.
 * This component is a UX guard only.
 */
function CustomerPortalRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Session check in-flight — show portal-styled spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading customer portal…</p>
        </div>
      </div>
    );
  }

  // 2. Not authenticated — redirect to the PORTAL login (not internal /login)
  if (!isAuthenticated) {
    return (
      <Navigate to="/portal/login" state={{ from: location }} replace />
    );
  }

  // 3. Authenticated but not a CUSTOMER
  //    Internal users must not access customer portal routes.
  if (user.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="auth-card text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-1">
            The customer portal is restricted to{' '}
            <span className="text-brand-400 font-semibold">CUSTOMER</span> accounts.
          </p>
          <p className="text-slate-500 text-xs">
            Your account role is:{' '}
            <span className="font-semibold text-slate-300">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // 4. Authenticated CUSTOMER — render portal
  return <Outlet />;
}

export default CustomerPortalRoute;
