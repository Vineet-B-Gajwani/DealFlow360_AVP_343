import React from 'react';
import LoginForm from '../components/LoginForm';
import { useTheme } from '../../../context/ThemeContext';

function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <span>{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
        </button>
      </div>

      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-900/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="DealFlow360 Logo"
            className="w-16 h-16 rounded-2xl shadow-lg shadow-brand-900/50 mb-4 mx-auto object-cover border border-slate-700/50"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            DealFlow<span className="text-brand-400">360</span>
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Internal Operations Platform
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
