import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

function DashboardHome() {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'ADMIN': return 'System Administration Overview';
      case 'SALES_REP': return 'Your Sales Pipeline & Quotations';
      case 'SALES_MANAGER': return 'Team Pipeline & Approvals';
      case 'FINANCE_OPERATIONS': return 'Billing, Inventory & Operations';
      default: return 'Welcome to DealFlow360';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || user?.email?.split('@')[0]}</h1>
        <p className="text-slate-400">{getWelcomeMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Quick Links based on roles */}
        {(user?.role === 'ADMIN' || user?.role === 'SALES_REP' || user?.role === 'SALES_MANAGER') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-brand-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Quotations</h3>
            <p className="text-slate-400 text-sm mb-4">Create and manage customer quotations.</p>
            <Link to="/quotations" className="text-brand-400 hover:text-brand-300 text-sm font-medium">View Quotations &rarr;</Link>
          </div>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-brand-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Approvals</h3>
            <p className="text-slate-400 text-sm mb-4">Review pending commercial approvals.</p>
            <Link to="/approvals/dashboard" className="text-brand-400 hover:text-brand-300 text-sm font-medium">View Approvals &rarr;</Link>
          </div>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-brand-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Billing & Invoices</h3>
            <p className="text-slate-400 text-sm mb-4">Manage invoices and subscription plans.</p>
            <Link to="/billing" className="text-brand-400 hover:text-brand-300 text-sm font-medium">View Billing &rarr;</Link>
          </div>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-brand-500 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Fulfillment</h3>
            <p className="text-slate-400 text-sm mb-4">Manage inventory and product backorders.</p>
            <Link to="/fulfillment" className="text-brand-400 hover:text-brand-300 text-sm font-medium">View Fulfillment &rarr;</Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardHome;
