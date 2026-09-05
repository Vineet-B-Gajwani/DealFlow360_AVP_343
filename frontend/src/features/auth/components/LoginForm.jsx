import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loginSchema } from '../schemas/auth.schemas';

const ROLE_OPTIONS = [
  { id: 'SALES_REP', label: 'Sales Representative', icon: '💼' },
  { id: 'SALES_MANAGER', label: 'Sales Manager', icon: '📊' },
  { id: 'FINANCE_OPERATIONS', label: 'Finance & Operations', icon: '💰' },
  { id: 'ADMIN', label: 'Administrator', icon: '👑' },
  { id: 'CUSTOMER', label: 'Customer Portal', icon: '🏢' },
];

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: 'SALES_REP' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const loggedUser = await login(values);
      if (loggedUser?.role === 'CUSTOMER') {
        navigate('/portal', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Login failed. Please check credentials and role.';
      setServerError(message);
    }
  };

  const handleQuickLogin = (email, role) => {
    setValue('email', email);
    setValue('password', 'password123');
    setValue('role', role);
    onSubmit({ email, password: 'password123', role });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server-level error banner */}
        {serverError && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 text-red-400
                       text-sm rounded-lg px-4 py-3 animate-fade-in font-medium"
          >
            ⚠️ {serverError}
          </div>
        )}

        {/* RBAC Role Selection */}
        <div>
          <label htmlFor="login-role" className="form-label block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Select Your Account Role (RBAC)
          </label>
          <select
            id="login-role"
            {...register('role')}
            className={`form-input bg-slate-900 border-slate-700 text-white font-medium ${errors.role ? 'form-input-error' : ''}`}
          >
            <option value="">-- Choose Account Role --</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.icon} {r.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="form-error mt-1">{errors.role.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="login-email" className="form-label">
            Email address
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
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
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Authenticating RBAC Session…
            </span>
          ) : (
            `Sign in as ${ROLE_OPTIONS.find((r) => r.id === selectedRole)?.label || 'User'}`
          )}
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-slate-400 pt-2">
          New Customer or Team Member?{' '}
          <Link to="/register" className="link font-semibold text-brand-400">
            Create an Account / Register Customer Profile
          </Link>
        </p>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider text-center">
          ⚡ 1-Click RBAC Demo Sign-Ins
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('sales@dealflow360.local', 'SALES_REP')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-colors"
          >
            <span className="font-bold text-white block">💼 Sales Rep</span>
            sales@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('manager@dealflow360.local', 'SALES_MANAGER')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-colors"
          >
            <span className="font-bold text-white block">📊 Sales Manager</span>
            manager@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('finance@dealflow360.local', 'FINANCE_OPERATIONS')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-colors"
          >
            <span className="font-bold text-white block">💰 Finance Ops</span>
            finance@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@dealflow360.local', 'ADMIN')}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-colors"
          >
            <span className="font-bold text-white block">👑 Admin</span>
            admin@dealflow360.local
          </button>
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@acme.local', 'CUSTOMER')}
            className="w-full p-2.5 bg-brand-950/50 hover:bg-brand-900/50 border border-brand-800/50 text-brand-300 rounded text-left flex justify-between items-center transition-colors"
          >
            <div>
              <span className="font-bold text-white block">🏢 Customer (Acme Corp)</span>
              customer@acme.local
            </div>
            <span className="text-[10px] bg-brand-700 text-white font-semibold px-2 py-1 rounded">Customer Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
