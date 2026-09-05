import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { registerSchema, INTERNAL_ROLES } from '../schemas/auth.schemas';

const ROLE_LABELS = {
  SALES_REP: 'Sales Representative',
  SALES_MANAGER: 'Sales Manager',
  FINANCE_OPERATIONS: 'Finance & Operations',
  ADMIN: 'Administrator',
};

function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      // confirmPassword is for UI only — do not send to the API
      const { confirmPassword: _skip, ...payload } = values;
      await registerUser(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        setServerError(data.errors.map((e) => e.message).join(' · '));
      } else {
        setServerError(data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-400
                     text-sm rounded-lg px-4 py-3 animate-fade-in"
        >
          {serverError}
        </div>
      )}

      {/* Full name */}
      <div>
        <label htmlFor="reg-name" className="form-label">
          Full name
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          {...register('name')}
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="form-label">
          Email address
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register('email')}
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="reg-role" className="form-label">
          Role
        </label>
        <select
          id="reg-role"
          {...register('role')}
          className={`form-input ${errors.role ? 'form-input-error' : ''}`}
        >
          <option value="">Select a role…</option>
          {INTERNAL_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.role && <p className="form-error">{errors.role.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="form-label">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          {...register('password')}
          className={`form-input ${errors.password ? 'form-input-error' : ''}`}
        />
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="reg-confirm" className="form-label">
          Confirm password
        </label>
        <input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
        />
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating account…
          </span>
        ) : (
          'Create account'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
