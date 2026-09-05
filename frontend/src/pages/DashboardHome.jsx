import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

function DashboardHome() {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'ADMIN': return 'System Administration Overview';
      case 'SALES_REP': return 'Your Sales Pipeline, Quotations & Deal Health';
      case 'SALES_MANAGER': return 'Team Pipeline & Commercial Approvals';
      case 'FINANCE_OPERATIONS': return 'Billing, Invoices & Warehouse Fulfillment';
      default: return 'Welcome to DealFlow360';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || user?.email?.split('@')[0]}</h1>
        <p className="text-slate-400 text-sm">{getWelcomeMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Quotations */}
        {(user?.role === 'ADMIN' || user?.role === 'SALES_REP' || user?.role === 'SALES_MANAGER') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">📄</div>
            <h3 className="text-lg font-bold text-white mb-1">Quotations</h3>
            <p className="text-slate-400 text-xs mb-4">Create, review, and manage customer quotations.</p>
            <Link to="/quotations" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Quotations &rarr;</Link>
          </div>
        )}

        {/* Products Catalogue */}
        {(user?.role === 'ADMIN' || user?.role === 'SALES_REP' || user?.role === 'SALES_MANAGER') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-white mb-1">Products Catalogue</h3>
            <p className="text-slate-400 text-xs mb-4">
              {user?.role === 'SALES_REP' ? 'Browse products, prices, and stock availability.' : 'Manage catalog, variants, and pricing rules.'}
            </p>
            <Link to="/products" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Products &rarr;</Link>
          </div>
        )}

        {/* Deal Health */}
        {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-1">Deal Health & Risks</h3>
            <p className="text-slate-400 text-xs mb-4">Monitor stalled quotations and discount anomalies.</p>
            <Link to="/deal-health" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Deal Health &rarr;</Link>
          </div>
        )}

        {/* Approvals */}
        {(user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">🛡️</div>
            <h3 className="text-lg font-bold text-white mb-1">Approvals</h3>
            <p className="text-slate-400 text-xs mb-4">Review and decide pending commercial discount approvals.</p>
            <Link to="/approvals/dashboard" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Approvals &rarr;</Link>
          </div>
        )}

        {/* Billing & Invoices */}
        {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">💳</div>
            <h3 className="text-lg font-bold text-white mb-1">Billing & Invoices</h3>
            <p className="text-slate-400 text-xs mb-4">Manage customer invoices and subscription schedules.</p>
            <Link to="/billing" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Billing &rarr;</Link>
          </div>
        )}

        {/* Fulfillment */}
        {(user?.role === 'ADMIN' || user?.role === 'FINANCE_OPERATIONS') && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-500 transition-all shadow-xl">
            <div className="text-2xl mb-3">🏬</div>
            <h3 className="text-lg font-bold text-white mb-1">Warehouse Fulfillment</h3>
            <p className="text-slate-400 text-xs mb-4">Split allocation engine and backorder consolidation.</p>
            <Link to="/fulfillment" className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1">View Fulfillment &rarr;</Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardHome;
