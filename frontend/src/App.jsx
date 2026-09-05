import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import CustomerPortalRoute from './routes/CustomerPortalRoute';
import PortalLoginPage from './features/customer-portal/pages/PortalLoginPage';
import PortalDashboardPage from './features/customer-portal/pages/PortalDashboardPage';
import useAuth from './features/auth/hooks/useAuth';

// ── Temporary placeholder dashboard — replace in a future feature ─────────────
function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="auth-card text-center max-w-sm">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Auth is working!
        </h1>
        <p className="text-slate-400 text-sm mb-1">
          Signed in as{' '}
          <span className="text-brand-400 font-semibold">{user?.email}</span>
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Role:{' '}
          <span className="uppercase tracking-widest font-semibold text-slate-300">
            {user?.role}
          </span>
        </p>
        <button
          id="dashboard-logout"
          onClick={handleLogout}
          className="btn-primary"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated routes (any role) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Route>

        {/* ── Customer Portal routes ─────────────────────────────────────── */}
        {/* Public portal login — separate from internal /login */}
        <Route path="/portal/login" element={<PortalLoginPage />} />

        {/* Protected portal dashboard — CUSTOMER role only */}
        <Route element={<CustomerPortalRoute />}>
          <Route path="/portal" element={<PortalDashboardPage />} />
        </Route>

        {/* Example: ADMIN-only protected route */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route
            path="/admin"
            element={
              <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="auth-card text-center max-w-sm">
                  <div className="text-5xl mb-4">🛡️</div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                  <p className="text-slate-400 text-sm mt-2">
                    This page is restricted to the ADMIN role.
                  </p>
                </div>
              </main>
            }
          />
        </Route>

        {/* Example: SALES_MANAGER + ADMIN protected route */}
        <Route element={<ProtectedRoute allowedRoles={['SALES_MANAGER', 'ADMIN']} />}>
          <Route
            path="/sales-management"
            element={
              <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="auth-card text-center max-w-sm">
                  <div className="text-5xl mb-4">📊</div>
                  <h1 className="text-2xl font-bold text-white">Sales Management</h1>
                  <p className="text-slate-400 text-sm mt-2">
                    Restricted to SALES_MANAGER and ADMIN.
                  </p>
                </div>
              </main>
            }
          />
        </Route>

        {/* Default: redirect root to /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="auth-card text-center max-w-sm">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-white">404</h1>
                <p className="text-slate-400 text-sm mt-2">Page not found</p>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
