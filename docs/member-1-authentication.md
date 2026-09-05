# M1-F1 — Authentication & Role-Based Access Control

**Feature owner:** Member 1  
**Branch:** `feature/m1-auth`  
**Status:** Complete

---

## Overview

This document describes the authentication and RBAC foundation implemented for DealFlow360.
All other features build on top of this layer.

---

## User Model

**File:** [`backend/src/features/auth/auth.model.js`](../backend/src/features/auth/auth.model.js)

```js
{
  name:         String   // required, 2–100 chars
  email:        String   // required, unique, lowercase
  passwordHash: String   // bcrypt hash; never raw — select: false in queries
  role:         String   // enum (see Roles section)
  isActive:     Boolean  // default: true; deactivated users cannot log in
  refreshToken: String   // bcrypt-hashed server-side token; null on logout — select: false
  createdAt:    Date     // auto (timestamps: true)
  updatedAt:    Date     // auto (timestamps: true)
}
```

> **Important for Members 2 & 3:** Import the User model from:
> ```js
> const { User, ROLES } = require('../features/auth/auth.model');
> ```
> Do **not** create a second User model.

---

## Roles

| Role constant       | Description                                    |
|---------------------|------------------------------------------------|
| `SALES_REP`         | Sales representative (creates deals, quotes)   |
| `SALES_MANAGER`     | Manages sales team; approves deals             |
| `FINANCE_OPERATIONS`| Finance & operations team                      |
| `ADMIN`             | Full system access                             |
| `CUSTOMER`          | Reserved — customer portal (not implemented yet)|

---

## Authentication Flow

### Registration

```
POST /api/auth/register
Body: { name, email, password, role }

1. Validate request body (express-validator)
2. Check email uniqueness
3. Hash password with bcrypt (12 rounds)
4. Create User document
5. Generate access token (JWT, 15 min)
6. Generate refresh token (JWT, 7 days)
7. Hash refresh token with bcrypt, store in User.refreshToken
8. Return access token in JSON + refresh token in httpOnly cookie
```

### Login

```
POST /api/auth/login
Body: { email, password }

1. Validate request body
2. Find user by email (select +passwordHash +refreshToken)
3. Check isActive
4. bcrypt.compare(password, passwordHash)
5. Generate new token pair
6. Replace User.refreshToken with new bcrypt hash
7. Return access token in JSON + refresh token in httpOnly cookie
```

### Token Refresh

```
POST /api/auth/refresh
Cookie: refreshToken (httpOnly) — OR body: { refreshToken }

1. Verify JWT signature with JWT_REFRESH_SECRET
2. Find User by decoded id (select +refreshToken)
3. bcrypt.compare(incoming, stored hash)
4. If mismatch → token reuse detected → null stored token → 401
5. If valid → generate new token pair (rotation)
6. Store new hashed refresh token
7. Return new access token in JSON + new refresh token cookie
```

### Logout

```
POST /api/auth/logout
Header: Authorization: Bearer <access_token>

1. authenticate middleware verifies access token
2. Set User.refreshToken = null in database
3. Clear refreshToken cookie
4. Return 200
```

---

## Token Flow

```
┌──────────┐          POST /login          ┌─────────────┐
│  Client  │──────────────────────────────▶│   Backend   │
│          │◀── { accessToken } + cookie ──│             │
│          │                               │             │
│          │  GET /api/protected           │             │
│          │  Authorization: Bearer <AT>   │             │
│          │──────────────────────────────▶│             │
│          │◀── 200 OK ────────────────────│             │
│          │                               │             │
│  AT exp  │  POST /api/auth/refresh       │             │
│          │  cookie: refreshToken         │             │
│          │──────────────────────────────▶│             │
│          │◀── { new accessToken } + new cookie         │
└──────────┘                               └─────────────┘
```

**Access token** — short-lived (15 min), stored in `localStorage`, attached to requests via `Authorization: Bearer` header.

**Refresh token** — long-lived (7 days), stored in an `httpOnly` cookie (not accessible by JS), also stored as a bcrypt hash in the database. On every refresh call, a new token pair is issued (rotation). Reuse of an old refresh token triggers immediate invalidation.

---

## API Endpoints

| Method | Path                     | Auth required | Description                          |
|--------|--------------------------|---------------|--------------------------------------|
| POST   | `/api/auth/register`     | No            | Create a new internal user           |
| POST   | `/api/auth/login`        | No            | Login; receive token pair            |
| POST   | `/api/auth/refresh`      | No (cookie)   | Rotate token pair                    |
| POST   | `/api/auth/logout`       | Yes           | Invalidate refresh token             |
| GET    | `/api/auth/me`           | Yes           | Get current user's profile           |
| GET    | `/api/auth/admin-only`   | Yes (ADMIN)   | Example role-protected endpoint      |
| GET    | `/api/auth/managers`     | Yes (MANAGER+)| Example multi-role endpoint          |
| GET    | `/api/health`            | No            | Server health check                  |

### Response shape

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human readable error",
  "errors": [ { "field": "email", "message": "Must be valid email" } ]
}
```

---

## Middleware

### `authenticate`

**File:** [`backend/src/middleware/authenticate.js`](../backend/src/middleware/authenticate.js)

Reads the `Authorization: Bearer <token>` header, verifies the JWT access token, and attaches the decoded payload to `req.user`:

```js
req.user = { id, email, role, iat, exp }
```

Returns `401` if the token is missing, invalid, or expired.

### `authorize(...roles)`

**File:** [`backend/src/middleware/authorize.js`](../backend/src/middleware/authorize.js)

A middleware factory. Must be used **after** `authenticate`.

```js
// Usage examples:
router.get('/admin',    authenticate, authorize('ADMIN'),                     handler);
router.get('/managers', authenticate, authorize('SALES_MANAGER', 'ADMIN'),   handler);
router.get('/any-role', authenticate, authorize('SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'), handler);
```

Returns `403` if the user's role is not in the allowed list.

---

## Frontend Protected Routes

### `ProtectedRoute`

**File:** [`frontend/src/routes/ProtectedRoute.jsx`](../frontend/src/routes/ProtectedRoute.jsx)

React Router v6 Outlet-based route guard.

```jsx
// Any authenticated user
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Specific roles only
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

Behaviours:
- While session check is in-flight → loading spinner (no flash of content)
- Unauthenticated → redirect to `/login` (preserves intended URL)
- Wrong role → 403 page rendered inline

> **Reminder:** Frontend role checks are a UX convenience only.
> The backend **must** enforce authorization on every API call.

---

## Auth State Management

**File:** [`frontend/src/context/AuthContext.jsx`](../frontend/src/context/AuthContext.jsx)

`AuthProvider` wraps the app. On mount it calls `GET /api/auth/me` to restore the session from the httpOnly refresh token cookie (the Axios interceptor handles silent token refresh if the access token in `localStorage` is expired).

Provided values:
```js
const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

Import via the convenience hook:
```js
import useAuth from './features/auth/hooks/useAuth';
```

---

## Backend Architecture

```
backend/src/
├── features/
│   └── auth/
│       ├── auth.model.js       ← Mongoose User schema + ROLES constant
│       ├── auth.validation.js  ← express-validator rule chains
│       ├── auth.service.js     ← All business logic (bcrypt, JWT, DB)
│       ├── auth.controller.js  ← Thin HTTP handlers; delegate to service
│       └── auth.routes.js      ← Route definitions + middleware composition
├── middleware/
│   ├── authenticate.js         ← JWT verification; attaches req.user
│   ├── authorize.js            ← Role guard factory: authorize(...roles)
│   └── errorHandler.js        ← Centralized error handler
├── config/
│   └── db.js                   ← Mongoose connection
└── app.js                      ← Express app setup
```

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in JWT_ACCESS_SECRET and JWT_REFRESH_SECRET with long random strings
npm install
npm run dev
# Server: http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### Generating secure secrets (PowerShell)

```powershell
# Run twice — once for each secret
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## Integration Notes for Members 2 & 3

### Importing the User model

```js
const { User, ROLES } = require('../../features/auth/auth.model');
```

### Protecting your routes

```js
const authenticate = require('../../middleware/authenticate');
const authorize    = require('../../middleware/authorize');

// Any authenticated user
router.get('/resource', authenticate, controller.getResource);

// Specific roles
router.post('/resource', authenticate, authorize('SALES_MANAGER', 'ADMIN'), controller.createResource);
```

### Accessing the current user in a controller

After `authenticate` runs:
```js
req.user.id    // MongoDB ObjectId string
req.user.email
req.user.role  // 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE_OPERATIONS' | 'ADMIN' | 'CUSTOMER'
```

### Frontend — consuming auth state

```jsx
import useAuth from '../features/auth/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  // user.role is available for conditional rendering
}
```

### Frontend — API calls

Use the pre-configured Axios instance which automatically attaches the access token and silently refreshes it on expiry:

```js
import apiClient from '../features/auth/api/auth.api';

// All your feature API calls should use apiClient (not bare axios)
const response = await apiClient.get('/your-feature/endpoint');
```
