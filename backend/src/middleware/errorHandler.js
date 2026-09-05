'use strict';

/**
 * Centralized Express error handler.
 *
 * Must be registered as the last middleware in app.js (after all routes).
 *
 * Normalizes error responses to a consistent JSON shape:
 *   { success: false, message: string, errors?: any, stack?: string }
 *
 * The `stack` field is only included in development to aid debugging.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const body = {
    success: false,
    message,
  };

  // Attach validation errors array when present (express-validator)
  if (err.errors) {
    body.errors = err.errors;
  }

  // Include stack trace in non-production environments
  if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
