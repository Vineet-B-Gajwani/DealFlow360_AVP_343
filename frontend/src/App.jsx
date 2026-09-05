import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import CustomerPortalRoute from './routes/CustomerPortalRoute';
import PortalLoginPage from './features/customer-portal/pages/PortalLoginPage';

import QuotationListPage from './features/quotations/pages/QuotationListPage';
import QuotationCreatePage from './features/quotations/pages/QuotationCreatePage';
import QuotationDetail from './features/quotations/pages/QuotationDetail';
import PortalDashboardPage from './features/customer-portal/pages/PortalDashboardPage';
import ProductListPage from './features/products/pages/ProductListPage';
import ProductCreatePage from './features/products/pages/ProductCreatePage';
import ProductEditPage from './features/products/pages/ProductEditPage';
import PricingConfigPage from './features/products/pages/PricingConfigPage';
import InvoiceListPage from './features/invoices/pages/InvoiceListPage';
import InvoiceDetailPage from './features/invoices/pages/InvoiceDetailPage';
import DealHealthDashboardPage from './features/deal-health/pages/DealHealthDashboardPage';
import ReportingDashboardPage from './features/reporting/pages/ReportingDashboardPage';
import ApprovalDashboardPage from './features/approvals/pages/ApprovalDashboardPage';
import ApprovalListPage from './features/approvals/pages/ApprovalListPage';
import ApprovalDetailPage from './features/approvals/pages/ApprovalDetailPage';
import QuotationDetailPage from './features/customer-portal/pages/QuotationDetailPage';
import BuyProductsPage from './features/customer-portal/pages/BuyProductsPage';
import InventoryListPage from './features/inventory/pages/InventoryListPage';
import FulfillmentDashboardPage from './features/fulfillment/pages/FulfillmentDashboardPage';
import SubscriptionPlansPage from './features/subscriptions/pages/SubscriptionPlansPage';
import BillingDashboardPage from './features/billing/pages/BillingDashboardPage';
import AppLayout from './layouts/AppLayout';
import DashboardHome from './pages/DashboardHome';

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Internal authenticated routes ──────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard Home — ALL internal roles */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Products Catalogue — Read access for SALES_REP, ADMIN, SALES_MANAGER */}
            <Route path="/products" element={<ProductListPage />} />

            {/* Quotations — ADMIN, SALES_REP, SALES_MANAGER */}
            <Route path="/quotations" element={<QuotationListPage />} />
            <Route path="/quotations/new" element={<QuotationCreatePage />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
          </Route>
        </Route>

        {/* ── Role Restricted Routes: Admin & Sales Manager ──── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']} />}>
          <Route element={<AppLayout />}>
            <Route path="/deal-health" element={<DealHealthDashboardPage />} />
            <Route path="/products/new" element={<ProductCreatePage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/products/pricing-config" element={<PricingConfigPage />} />
            <Route path="/reporting" element={<ReportingDashboardPage />} />
          </Route>
        </Route>

        {/* ── Role Restricted Routes: Approvals ───────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE_OPERATIONS']} />}>
          <Route element={<AppLayout />}>
            <Route path="/approvals" element={<ApprovalDashboardPage />} />
            <Route path="/approvals/dashboard" element={<ApprovalDashboardPage />} />
            <Route path="/approvals/list" element={<ApprovalListPage />} />
            <Route path="/approvals/:id" element={<ApprovalDetailPage />} />
          </Route>
        </Route>

        {/* ── Role Restricted Routes: Operations & Finance ──────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_OPERATIONS']} />}>
          <Route element={<AppLayout />}>
            <Route path="/inventory" element={<InventoryListPage />} />
            <Route path="/fulfillment" element={<FulfillmentDashboardPage />} />
            <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
            <Route path="/billing" element={<BillingDashboardPage />} />
          </Route>
        </Route>

        {/* ── Invoices Routes ──────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_OPERATIONS', 'CUSTOMER', 'SALES_MANAGER', 'SALES_REP']} />}>
          <Route element={<AppLayout />}>
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>
        </Route>

        {/* ── Customer Portal routes ─────────────────────────────────────── */}
        <Route path="/portal/login" element={<PortalLoginPage />} />

        <Route element={<CustomerPortalRoute />}>
          <Route path="/portal" element={<PortalDashboardPage />} />
          <Route path="/portal/buy" element={<BuyProductsPage />} />
          <Route path="/portal/quotations/:id" element={<QuotationDetailPage />} />
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
