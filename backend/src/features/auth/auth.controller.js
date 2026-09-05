'use strict';

const authService = require('./auth.service');

// Refresh token cookie settings
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,        // not accessible via JS
  sameSite: 'strict',
  secure: false,         // set to true when behind HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sendTokens(res, { user, accessToken, refreshToken, statusCode = 200 }) {
  // Refresh token delivered via httpOnly cookie
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(statusCode).json({
    success: true,
    data: { user, accessToken },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Controllers — keep these thin; delegate everything to auth.service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    sendTokens(res, { ...result, statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    sendTokens(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Accepts refresh token from httpOnly cookie OR request body (flexibility).
 */
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token not provided' });
    }

    const { accessToken, refreshToken } = await authService.refreshTokens(token);

    // Issue new refresh token cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Requires authentication.
 */
async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);

    // Clear the cookie
    res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, getMe };
