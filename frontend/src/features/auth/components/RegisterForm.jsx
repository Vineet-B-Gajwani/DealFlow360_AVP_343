import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { registerSchema, ALL_ROLES } from '../schemas/auth.schemas';

const ROLE_LABELS = {
  CUSTOMER: '🏢 Customer (Portal Account)',
  SALES_REP: '💼 Sales Representative',
  SALES_MANAGER: '📊 Sales Manager',
  FINANCE_OPERATIONS: '💰 Finance & Operations',
  ADMIN: '👑 Administrator',
};

function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
      companyName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      taxId: '',
      proofDocId: '',
      tier: 'Standard',
    },
  });

  const selectedRole = watch('role');
  const isCustomer = selectedRole === 'CUSTOMER';

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { confirmPassword: _skip, ...payload } = values;
      const res = await registerUser(payload);
      if (values.role === 'CUSTOMER' || res?.user?.role === 'CUSTOMER') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        setServerError(data.errors.map((e) => e.message).join(' · '));
      } else {
        setServerError(data?.message || 'Registration failed. Please check inputs and try again.');
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
                     text-sm rounded-lg px-4 py-3 animate-fade-in font-medium"
        >
          ⚠️ {serverError}
        </div>
      )}

      {/* Account Type / Role */}
      <div>
        <label htmlFor="reg-role" className="form-label block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Account Type / Role
        </label>
        <select
          id="reg-role"
          {...register('role')}
          className={`form-input bg-slate-900 border-slate-700 text-white font-medium ${errors.role ? 'form-input-error' : ''}`}
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.role && <p className="form-error">{errors.role.message}</p>}
      </div>

      {/* Basic Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-name" className="form-label">
            Full Name / Contact Person
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            {...register('name')}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

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
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-password" className="form-label">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 digit"
            {...register('password')}
            className={`form-input ${errors.password ? 'form-input-error' : ''}`}
          />
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

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
      </div>

      {/* ── CUSTOMER PROFILE QUESTIONS (Address, Proof, Company Details) ───────────────── */}
      {isCustomer && (
        <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Business & Verification Profile</h3>
              <p className="text-xs text-slate-400">Please provide your organization address, tax ID, and proof documents.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-companyName" className="form-label">
                Company / Organization Name
              </label>
              <input
                id="reg-companyName"
                type="text"
                placeholder="Acme Global Solutions Inc."
                {...register('companyName')}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="form-label">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 234-5678"
                {...register('phone')}
                className="form-input"
              />
            </div>
          </div>

          {/* Tax ID & Proof Document ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-taxId" className="form-label">
                Tax Identification Number (Tax ID / GSTIN / EIN)
              </label>
              <input
                id="reg-taxId"
                type="text"
                placeholder="US-TAX-99823411"
                {...register('taxId')}
                className="form-input font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="reg-proofDocId" className="form-label">
                Identity / Proof Document Ref ID
              </label>
              <input
                id="reg-proofDocId"
                type="text"
                placeholder="DOC-REG-PROOF-2026-88"
                {...register('proofDocId')}
                className="form-input font-mono text-sm"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <label htmlFor="reg-address" className="form-label">
              Street Address
            </label>
            <input
              id="reg-address"
              type="text"
              placeholder="742 Evergreen Terrace, Suite 100"
              {...register('address')}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="reg-city" className="form-label">City</label>
              <input id="reg-city" type="text" placeholder="Springfield" {...register('city')} className="form-input" />
            </div>
            <div>
              <label htmlFor="reg-state" className="form-label">State / Province</label>
              <input id="reg-state" type="text" placeholder="IL" {...register('state')} className="form-input" />
            </div>
            <div>
              <label htmlFor="reg-zip" className="form-label">Zip / Postal Code</label>
              <input id="reg-zip" type="text" placeholder="62704" {...register('zipCode')} className="form-input font-mono text-sm" />
            </div>
            <div>
              <label htmlFor="reg-country" className="form-label">Country</label>
              <input id="reg-country" type="text" placeholder="USA" {...register('country')} className="form-input" />
            </div>
          </div>

          {/* Pricing Tier */}
          <div>
            <label htmlFor="reg-tier" className="form-label">
              Pricing Tier Preference
            </label>
            <select id="reg-tier" {...register('tier')} className="form-input bg-slate-900 border-slate-700 text-white font-medium">
              <option value="Standard">Standard Tier (Default commercial catalog pricing)</option>
              <option value="Silver">Silver Tier (Tiered volume discount eligible)</option>
              <option value="Gold">Gold Tier (High priority enterprise customer)</option>
              <option value="Platinum">Platinum Tier (Custom negotiated discount ceiling)</option>
            </select>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-4"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Registration…
          </span>
        ) : (
          `Register ${isCustomer ? 'Customer Profile' : 'Staff Account'}`
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="link font-semibold text-brand-400">
          Sign in here
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
