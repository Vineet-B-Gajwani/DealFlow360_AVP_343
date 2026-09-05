# M3-F2 — Customer Quotation Portal

**Feature owner:** Member 3  
**Branch:** `customer`  
**Status:** Complete  
**Depends on:** M1-F1 (Authentication & RBAC), M3-F1 (Customer Portal Access Foundation)

---

## Overview

This document describes the customer quotation portal implemented for DealFlow360.

This feature allows customers to view their quotations within the portal. It implements the frontend views and the backend security layer to ensure customers can only access their own quotations.

---

## Quotation Integration Strategy

**Crucial constraint:** Do not duplicate quotation models or business logic. All quotation data is owned by Member 1's backend feature.

The portal backend acts as a secure proxy to the internal quotation API.

### Backend Proxy Routes

| Route | Upstream Internal API | Ownership Check |
|---|---|---|
| `GET /api/portal/quotations` | `GET /api/quotations?customerId=<id>` | `id` is derived from JWT `req.user.id` |
| `GET /api/portal/quotations/:id` | `GET /api/quotations/:id` | Validates `quotation.customerId === customer._id` |

### API Contract

The frontend and backend adapter are built against the following fixed API contract for `GET /api/quotations/:id`:

```json
{
  "id": "q123",
  "quotationNumber": "QT-2023-001",
  "customerId": "c456",
  "customerName": "Acme Corp",
  "status": "SENT_TO_CUSTOMER",
  "subtotal": 10000.00,
  "discountTotal": 500.00,
  "taxTotal": 1900.00,
  "grandTotal": 11400.00,
  "margin": 25.5,
  "lines": [
    {
      "productId": "p789",
      "productName": "Widget A",
      "quantity": 10,
      "unitPrice": 1000.00,
      "discount": 5.0,
      "lineTotal": 9500.00
    }
  ]
}
```

### Missing Integration Tolerance

If Member 1's `/api/quotations` endpoint is not yet available (returns 404 or connection refused), the portal backend intercepts the error and returns an empty array `[]` for the list endpoint. The frontend handles this gracefully by showing the "No quotations yet" empty state.

---

## Frontend Architecture

### New Routes
| Path | Component | Guard |
|---|---|---|
| `/portal/quotations/:id` | `QuotationDetailPage` | `CustomerPortalRoute` |

### Key Components

- **`QuotationsList`**: Dashboard component rendering a grid of `QuotationCard`s. Replaces the M3-F1 placeholder.
- **`QuotationCard`**: Summary card showing quotation number, status, item count, and grand total. Links to detail page.
- **`QuotationDetailPage`**: Full detail view.
- **`QuotationStatusBadge`**: Pill badge rendering color-coded statuses.
- **`QuotationLineTable`**: Table rendering quotation line items.
- **`QuotationTotals`**: Summary of financial totals.

### API Hooks

- `useQuotations()`: Fetches list of quotations. Exposes `integrationAvailable` flag to detect if upstream API is live.
- `useQuotation(id)`: Fetches single quotation. Specifically handles 403 (ownership denied) and 404 (not found) errors for precise UI feedback.

---

## Authorization & Security

This feature relies heavily on the `requireOwnership` middleware factory introduced in M3-F1.

### The Rule

**Never trust `customerId` from frontend input.**

1. `req.user.id` is reliably extracted from the signed JWT by `authenticate`.
2. The `Customer` profile is looked up using `userId: req.user.id`.
3. The internal API is queried.
4. For single item fetch, the `quotation.customerId` is compared strictly against the `Customer._id`. If they do not match, a `403 Access Denied` is returned.

---

## What is NOT implemented

The following are explicitly out of scope for M3-F2:
- Quotation negotiation (accept/reject buttons, comment threads)
- Invoices
- Payments
- Deal health metrics
- Reporting
- AI features

A placeholder UI section exists for "Negotiation & Comments" to clearly demarcate where this functionality will live in future iterations.
