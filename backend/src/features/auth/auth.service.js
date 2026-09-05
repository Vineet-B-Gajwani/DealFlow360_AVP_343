'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./auth.model');
const { Customer } = require('../customer-portal/customer.model');

const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────────────────────
//  Token helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Service functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user (Internal staff or Customer).
 * Returns the created user (without passwordHash) plus token pair.
 */
async function register({
  name,
  email,
  password,
  role = 'CUSTOMER',
  companyName,
  phone,
  address,
  city,
  state,
  zipCode,
  country,
  tier = 'Standard',
  taxId,
  proofDocId,
}) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Check for existing email
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user identity
  const user = await User.create({ name, email: cleanEmail, passwordHash, role });

  // If registering as a CUSTOMER, create customer business profile record
  if (role === 'CUSTOMER') {
    await Customer.create({
      userId: user._id,
      companyName: companyName || name,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      country: country || null,
      tier: tier || 'Standard',
      taxId: taxId || null,
      proofDocId: proofDocId || null,
      portalActivatedAt: new Date(),
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist hashed refresh token
  user.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Login with email, password, and RBAC role validation.
 * Returns the user (without passwordHash) plus token pair.
 */
async function login({ email, password, role }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Explicitly select passwordHash (excluded by default)
  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash +refreshToken');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated. Contact an administrator.');
    err.statusCode = 403;
    throw err;
  }

  // RBAC Role check — if a role was selected, verify it matches the user's account role
  if (role && user.role !== role) {
    const err = new Error(`Role mismatch: Your account has role '${user.role}', but '${role}' was selected in the form.`);
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Generate new token pair on every login
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist hashed refresh token (replaces any previous session)
  user.refreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Rotate the access token using a valid refresh token.
 * Implements refresh token rotation — a new refresh token is issued on
 * every call and the old one is invalidated.
 */
async function refreshTokens(incomingRefreshToken) {
  let payload;
  try {
    payload = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || !user.refreshToken) {
    const err = new Error('Refresh token not recognised');
    err.statusCode = 401;
    throw err;
  }

  // Verify stored hash matches incoming token (prevents token reuse)
  const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  if (!isValid) {
    // Possible token reuse attack — invalidate stored token
    user.refreshToken = null;
    await user.save();
    const err = new Error('Refresh token reuse detected. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  // Rotate tokens
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logout — nullify the stored refresh token so it can never be reused.
 */
async function logout(userId) {
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

/**
 * Return the authenticated user's profile (no sensitive fields).
 */
async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401; // Return 401 so frontend clears stale token
    throw err;
  }
  return sanitizeUser(user);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip sensitive fields before returning user data to the client.
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { register, login, refreshTokens, logout, getMe };
