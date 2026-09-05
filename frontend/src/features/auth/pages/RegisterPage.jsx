import React from 'react';
import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-900/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                       bg-brand-600 shadow-lg shadow-brand-900/50 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
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
            <h2 className="text-xl font-bold text-white">Create an account</h2>
            <p className="text-slate-400 text-sm mt-1">
              Register as an internal DealFlow360 team member
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
