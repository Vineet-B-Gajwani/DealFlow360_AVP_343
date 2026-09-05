import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { z } from 'zod';
import useAuth from '../../auth/hooks/useAuth';

// Login schema — same rules as auth.schemas.js loginSchema.
// Defined locally to keep this feature self-contained.
const portalLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * PortalLoginPage
 *
 * Customer-only login page at /portal/login.
 *
 * After a successful login the user's role is checked:
 *   - CUSTOMER → redirect to /portal
 *   - Any other role → show an access-denied error and log out.
 *     This prevents internal users from "becoming" a customer by
 *     navigating to /portal/login.
 *
 * Uses the shared login() from AuthContext (Member 1's auth system).
 * Does NOT create a second JWT or second login mechanism.
 */
function PortalLoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(portalLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values);

      // Security: only CUSTOMER accounts may enter the portal.
      // If an internal user (ADMIN, SALES_REP, etc.) logs in here,
      // we immediately invalidate the session and show an error.
      if (user.role !== 'CUSTOMER') {
        await logout();
        setServerError(
          'This portal is for customer accounts only. Please use the internal login instead.'
        );
        return;
      }

      // Redirect back to the originally requested portal page, or /portal
      const from = location.state?.from?.pathname || '/portal';
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-900/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-800/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-950/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg shadow-brand-900/60 mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            DealFlow<span className="text-brand-400">360</span>
          </h1>
          <p className="mt-1 text-slate-400 text-sm">Customer Portal</p>
        </div>

        {/* Login card */}
        <div className="auth-card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Customer sign in</h2>
            <p className="text-slate-400 text-sm mt-1">
              Access your quotations and portal
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Server-level error */}
            {serverError && (
              <div
                role="alert"
                className="bg-red-500/10 border border-red-500/30 text-red-400
                           text-sm rounded-lg px-4 py-3 animate-fade-in"
              >
                {serverError}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="portal-login-email" className="form-label">
                Email address
              </label>
              <input
                id="portal-login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="portal-login-password" className="form-label">
                Password
              </label>
              <input
                id="portal-login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="portal-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in to portal'
              )}
            </button>
          </form>

          {/* Quick Customer Demo Login */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setValue('email', 'customer@acme.local');
                setValue('password', 'password123');
                onSubmit({ email: 'customer@acme.local', password: 'password123' });
              }}
              className="w-full p-2.5 bg-brand-950/60 hover:bg-brand-900/60 border border-brand-800/50 text-brand-300 rounded text-xs flex justify-between items-center"
            >
              <div className="text-left">
                <span className="font-bold text-white block">⚡ Quick Demo Customer Login</span>
                <span>customer@acme.local (Acme Corp)</span>
              </div>
              <span className="text-[10px] bg-brand-700 text-white px-2 py-1 rounded">Sign In</span>
            </button>
          </div>

          {/* Internal link */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Internal DealFlow360 user?{' '}
            <Link to="/login" className="link text-xs">
              Use the staff login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default PortalLoginPage;
