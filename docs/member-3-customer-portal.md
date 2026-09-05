# M3-F1 — Customer Portal Access Foundation

**Feature owner:** Member 3  
**Branch:** `feature/m3-customer-portal-access`  
**Status:** Complete  
**Depends on:** M1-F1 (Authentication & RBAC)

---

## Overview

This document describes the customer portal access foundation implemented for DealFlow360.

Customers access a separate, restricted portal (`/portal`) that is isolated from all internal staff routes. This feature establishes the security boundary, authentication integration, and portal shell. Quotation functionality will be added in M3-F2.

---

## Customer Access Model

Customers log in using the same shared JWT authentication system (M1-F1). Their identity is stored in the shared `User` model with `role: 'CUSTOMER'`.

### What customers CAN access

| Route | Description |
|---|---|
| `/portal/login` | Customer login page |
| `/portal` | Customer dashboard |
| `GET /api/portal/me` | Own identity + business profile |
| `GET /api/portal/status` | Own portal status metadata |

### What customers CANNOT access

Customers are explicitly blocked from all internal routes, enforced at both the API and frontend layers:

| Protected Area | Enforcement |
|---|---|
| Internal auth routes (`/api/auth/*`) | These work for login/logout but carry no customer-portal data |
| Internal dashboard (`/dashboard`) | `ProtectedRoute` — any role admitted, but customer has no reason to go there |
| Admin routes (`/admin`) | `ProtectedRoute allowedRoles={['ADMIN']}` + `authorize('ADMIN')` on backend |
| Sales management (`/sales-management`) | `ProtectedRoute allowedRoles={[...]}` + backend `authorize()` |
| All `/api/portal/*` routes by non-customers | `requireCustomer` middleware → `403` |

---

## User ↔ Customer Relationship

The data model enforces a strict boundary:

```
User (auth.model.js — Member 1's file, do NOT modify)
  ├── _id           ObjectId
  ├── name          String
  ├── email         String  (unique)
  ├── passwordHash  String  (select: false)
  ├── role          'CUSTOMER' | 'ADMIN' | 'SALES_REP' | ...
  ├── isActive      Boolean
  └── refreshToken  String  (select: false)

Customer (customer.model.js — M3 file)
  ├── _id               ObjectId
  ├── userId            ObjectId → ref: User  (unique, 1-to-1)
  ├── companyName       String  (optional)
  ├── phone             String  (optional)
  ├── address           String  (optional)
  └── portalActivatedAt Date    (set on first portal login)
```

**Rule:**
- `User` = identity and authentication (name, email, password hash, role, tokens)
- `Customer` = customer-specific business profile (company, contact, portal metadata)
- Authentication data is **never** duplicated in the `Customer` model.

### Importing the shared User model

```js
// Correct — use Member 1's model
const { User, ROLES } = require('../auth/auth.model');

// NEVER do this
const User = new mongoose.model('User', ...); // ← creates a second model
```

### Customer profile provisioning

The `Customer` profile document is created **lazily** on the customer's first portal access. This ensures that:
1. A customer user provisioned directly in the DB (via seed or admin tool) automatically gets a profile record on first login.
2. No separate "create customer profile" step is required at account creation time.

---

## Protected Routes

### Backend Routes

All routes mounted at `/api/portal/*` require:
1. `authenticate` — verifies JWT access token → sets `req.user = { id, email, role }`
2. `requireCustomer` — rejects `403` if `req.user.role !== 'CUSTOMER'`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/portal/me` | JWT + CUSTOMER | Own identity + business profile |
| GET | `/api/portal/status` | JWT + CUSTOMER | Portal status metadata |

### Frontend Routes

| Path | Component | Guard |
|---|---|---|
| `/portal/login` | `PortalLoginPage` | Public — but redirects to `/portal` if already authenticated as CUSTOMER |
| `/portal` | `PortalDashboardPage` | `CustomerPortalRoute` — redirects to `/portal/login` if unauthenticated or wrong role |

Customer-facing routes are **separate** from internal routes — they use a dedicated `CustomerPortalRoute` guard that redirects to `/portal/login` rather than the internal `/login`.

---

## Authorization Behaviour

### Middleware chain on all `/api/portal/*` routes

```
Request
    │
    ▼
authenticate (backend/src/middleware/authenticate.js — M1)
    │  Verifies JWT_ACCESS_SECRET
    │  Sets req.user = { id, email, role, iat, exp }
    │  Returns 401 if missing/invalid/expired
    │
    ▼
requireCustomer (backend/src/middleware/requireCustomer.js — M3)
    │  Returns 403 if req.user.role !== 'CUSTOMER'
    │
    ▼
Controller
    │  Looks up resource using req.user.id ONLY
    │  Never accepts customerId from request body/params
    ▼
Response
```

### Role outcomes

| Caller | authenticate | requireCustomer | Result |
|---|---|---|---|
| No token | ❌ 401 | — | Rejected at authenticate |
| Expired token | ❌ 401 | — | Rejected at authenticate |
| Valid token, role=ADMIN | ✅ | ❌ 403 | Rejected at requireCustomer |
| Valid token, role=SALES_REP | ✅ | ❌ 403 | Rejected at requireCustomer |
| Valid token, role=CUSTOMER, isActive=false | ✅ | ✅ | Rejected in service layer (403) |
| Valid token, role=CUSTOMER, isActive=true | ✅ | ✅ | ✅ Proceed |

### Frontend guard behaviour

| State | CustomerPortalRoute behaviour |
|---|---|
| Session loading | Shows spinner — prevents flash of unauthenticated content |
| Not authenticated | Redirect to `/portal/login` |
| Authenticated, role ≠ CUSTOMER | Shows inline 403 page — internal users blocked |
| Authenticated, role = CUSTOMER | Renders portal dashboard |

---

## Ownership Strategy

### The rule

**All resource lookups are keyed on `req.user.id`** — derived from the signed JWT payload set by the `authenticate` middleware. This value is **never** taken from user-supplied request data.

This means a customer cannot submit `?customerId=<someone-elses-id>` and gain access to another customer's data.

### `requireOwnership` factory

The `requireOwnership` factory in `backend/src/middleware/requireCustomer.js` is an extension point for future resource-level ownership checks (e.g., quotation access in M3-F2):

```js
// Future usage example (M3-F2 quotation feature):
const { requireCustomer, requireOwnership } = require('../../middleware/requireCustomer');

async function getQuotationOwnerId(req) {
  const q = await Quotation.findById(req.params.id).select('customerId');
  return q?.customerId?.toString();
}

router.get(
  '/quotations/:id',
  authenticate,           // 1. Verify JWT → req.user
  requireCustomer,        // 2. Enforce CUSTOMER role
  requireOwnership(getQuotationOwnerId),  // 3. Verify customer owns this quotation
  controller.getQuotation // 4. Serve data
);
```

The factory:
- Calls `getOwnerId(req)` to resolve the resource's owner ID
- Returns `404` if the resource doesn't exist
- Returns `403` if `ownerId !== req.user.id` (ownership mismatch)
- The comparison uses `toString()` on both sides to handle ObjectId vs string comparison

---

## Backend Architecture

```
backend/src/
├── features/
│   ├── auth/                          ← Member 1 — do not modify
│   │   ├── auth.model.js              ← User model + ROLES (shared)
│   │   ├── auth.service.js
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   │
│   └── customer-portal/               ← M3 — this feature
│       ├── customer.model.js          ← Customer business profile model
│       ├── customerPortal.service.js  ← Business logic (profile, status)
│       ├── customerPortal.controller.js ← Thin HTTP handlers
│       ├── customerPortal.routes.js   ← Route definitions
│       └── customerPortal.validation.js ← Validation rules (future use)
│
├── middleware/
│   ├── authenticate.js               ← Member 1 — JWT verification
│   ├── authorize.js                  ← Member 1 — role guard factory
│   ├── errorHandler.js              ← Member 1 — centralized error handler
│   └── requireCustomer.js           ← M3 — CUSTOMER guard + ownership factory
│
├── config/
│   └── db.js                        ← Member 1 — MongoDB connection
└── app.js                           ← Member 1 + M3 — portal routes mounted
```

---

## Frontend Architecture

```
frontend/src/
├── routes/
│   ├── ProtectedRoute.jsx            ← Member 1 — internal route guard
│   └── CustomerPortalRoute.jsx       ← M3 — CUSTOMER-only portal guard
│
├── features/
│   ├── auth/                         ← Member 1 — do not modify
│   │   ├── api/auth.api.js           ← Shared apiClient (used by portal too)
│   │   ├── hooks/useAuth.js          ← Shared auth state
│   │   └── ...
│   │
│   └── customer-portal/              ← M3 — this feature
│       ├── api/
│       │   └── portalApi.js          ← GET /api/portal/me, /status
│       ├── hooks/
│       │   └── useCustomerPortal.js  ← Data fetching hook
│       ├── components/
│       │   ├── PortalHeader.jsx      ← Top nav bar
│       │   ├── CustomerIdentityCard.jsx ← Identity + profile display
│       │   ├── PortalStatusCard.jsx  ← Portal status + stats
│       │   └── QuotationsPlaceholder.jsx ← Empty state (until M3-F2)
│       └── pages/
│           ├── PortalLoginPage.jsx   ← /portal/login
│           └── PortalDashboardPage.jsx ← /portal
│
└── context/
    └── AuthContext.jsx               ← Member 1 — shared auth context
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally on port 27017
- Member 1's `.env` configured (see `backend/.env.example`)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
npm install
npm run dev
# API: http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### Creating a test customer account

The existing `/api/auth/register` endpoint's validation intentionally **excludes** `CUSTOMER` from the allowed roles (to prevent self-registration of customer accounts through the public endpoint). To create a customer account for testing, use a database seed script or a direct MongoDB insert:

```bash
# Example: create a CUSTOMER user via API with a temporary override
# (In production, customers are provisioned by an admin — no self-registration)

# Option 1: Directly via Mongoose in a seed script
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./src/features/auth/auth.model');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('Customer1!', 12);
  await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    passwordHash: hash,
    role: 'CUSTOMER',
  });
  console.log('Customer created');
  process.exit(0);
})();
"
```

Once created, log in at `http://localhost:5173/portal/login`.

### Verifying backend security

```bash
# 1. Register an internal user (SALES_REP)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sales","email":"sales@test.com","password":"Sales123!","role":"SALES_REP"}'

# 2. Login as SALES_REP → get access token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sales@test.com","password":"Sales123!"}'

# 3. Attempt to access /api/portal/me with SALES_REP token → expect 403
curl -X GET http://localhost:5000/api/portal/me \
  -H "Authorization: Bearer <SALES_REP_ACCESS_TOKEN>"
# {"success":false,"message":"Access denied. Customer portal is restricted to CUSTOMER accounts."}

# 4. Login as CUSTOMER → get access token
# 5. Access /api/portal/me with CUSTOMER token → expect 200
curl -X GET http://localhost:5000/api/portal/me \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>"
# {"success":true,"data":{"identity":{...},"profile":{...}}}
```

---

## What is NOT implemented (by design)

The following are explicitly out of scope for M3-F1 and will be added in future features:

- Quotation viewing / editing (M3-F2)
- Quotation negotiation
- Counter discounts
- Invoice / payment
- Deal health metrics
- Reporting / analytics
- AI features
- Customer self-registration
