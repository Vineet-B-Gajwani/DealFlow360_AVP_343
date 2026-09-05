'use strict';

const { Router } = require('express');
const controller = require('./auth.controller');
const { registerRules, loginRules, validate } = require('./auth.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Register a new internal DealFlow360 user.
 */
router.post('/register', registerRules, validate, controller.register);

/**
 * POST /api/auth/login
 * Authenticate with email + password; receive access token + refresh token cookie.
 */
router.post('/login', loginRules, validate, controller.login);

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token (and rotated refresh token).
 * Token may be provided via httpOnly cookie or request body.
 */
router.post('/refresh', controller.refresh);

// ── Authenticated routes ──────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 * Invalidate the server-side refresh token and clear the cookie.
 */
router.post('/logout', authenticate, controller.logout);

/**
 * GET /api/auth/me
 * Return the current user's profile.
 */
router.get('/me', authenticate, controller.getMe);

// ── Protected route example (role-based) ─────────────────────────────────────

/**
 * GET /api/auth/admin-only
 * Example of a route that only ADMIN users can access.
 * This demonstrates the authorize() middleware to Members 2 and 3.
 */
router.get(
  '/admin-only',
  authenticate,
  authorize('ADMIN'),
  (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome, Admin! This route is restricted to ADMIN role only.',
    });
  }
);

/**
 * GET /api/auth/managers
 * Example route accessible by SALES_MANAGER and ADMIN.
 */
router.get(
  '/managers',
  authenticate,
  authorize('SALES_MANAGER', 'ADMIN'),
  (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome! This route is accessible to SALES_MANAGER and ADMIN.',
    });
  }
);

module.exports = router;
