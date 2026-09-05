'use strict';

const jwt = require('jsonwebtoken');

/**
 * authenticate middleware
 *
 * Validates the JWT access token from the Authorization header.
 * On success it attaches the decoded payload to `req.user`.
 *
 * Expected header format:
 *   Authorization: Bearer <access_token>
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ success: false, message: 'Access token expired' });
    }
    return res
      .status(401)
      .json({ success: false, message: 'Invalid access token' });
  }
}

module.exports = authenticate;
