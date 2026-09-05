import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

/**
 * ProtectedRoute
 *
 * A route guard that:
 *  1. Shows a loading spinner while the initial auth check is in-flight
 *     (prevents flash-of-unauthenticated-content on refresh)
 *  2. Redirects unauthenticated users to /login
 *  3. Renders a 403 page for authenticated users who lack the required role
 *
 * Props:
 *   - allowedRoles {string[]} (optional) — if omitted, only authentication is checked
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 */
function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ── 1. Initial auth check in-flight ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Authenticated but insufficient role ───────────────────────────────
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="auth-card text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-1">
            Your role (<span className="text-brand-400 font-semibold">{user.role}</span>) does
            not have permission to view this page.
          </p>
          <p className="text-slate-500 text-xs">
            Required: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // ── 4. Authorised ────────────────────────────────────────────────────────
  return <Outlet />;
}

export default ProtectedRoute;
