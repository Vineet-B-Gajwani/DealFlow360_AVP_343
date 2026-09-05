'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./features/auth/auth.routes');
const customerPortalRoutes = require('./features/customer-portal/customerPortal.routes');
const productRoutes = require('./features/products/product.routes');
const negotiationRoutes = require('./features/negotiation/negotiation.routes');
const invoiceRoutes = require('./features/invoices/invoice.routes');
const paymentRoutes = require('./features/payments/payment.routes');
const dealHealthRoutes = require('./features/deal-health/dealHealth.routes');
const reportingRoutes = require('./features/reporting/reporting.routes');
const notificationRoutes = require('./features/notifications/notification.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // allow cookies (refresh token cookie)
  })
);

// ── Body / Cookie parsing ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── HTTP request logging (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/portal', customerPortalRoutes);
app.use('/api/portal/negotiations', negotiationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deal-health', dealHealthRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
