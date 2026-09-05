import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loginSchema } from '../schemas/auth.schemas';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

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
        err?.response?.data?.message || 'Login failed. Please try again.';
      setServerError(message);
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
    onSubmit({ email, password: 'password123' });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server-level error banner */}
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
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Demo Credentials Switcher */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
          ⚡ Quick Demo Logins
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('sales@dealflow360.local')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left"
          >
            <span className="font-bold text-white block">Sales Rep</span>
            sales@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('manager@dealflow360.local')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left"
          >
            <span className="font-bold text-white block">Sales Manager</span>
            manager@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('finance@dealflow360.local')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left"
          >
            <span className="font-bold text-white block">Finance Ops</span>
            finance@dealflow360.local
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@dealflow360.local')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left"
          >
            <span className="font-bold text-white block">Admin</span>
            admin@dealflow360.local
          </button>
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@acme.local')}
            className="w-full p-2 bg-brand-950/40 hover:bg-brand-900/40 border border-brand-800/40 text-brand-300 rounded text-left flex justify-between items-center"
          >
            <div>
              <span className="font-bold text-white block">Customer Account</span>
              customer@acme.local
            </div>
            <span className="text-[10px] bg-brand-800/60 text-brand-200 px-2 py-1 rounded">Customer Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
