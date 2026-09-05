# Member 3 — Customer + Intelligence Vertical Documentation

## Overview
This document covers the complete **Customer + Intelligence** vertical owned by Member 3, spanning Features 1 through 9:
1. Customer Portal Access Foundation
2. Customer Quotation Portal
3. Customer Negotiation
4. Negotiation → Reapproval Preparation
5. Invoice Management
6. Payment Recording
7. Deal Health & Anomaly Detection
8. Reporting & Analytics
9. Notifications (Socket.IO & Persistent Storage)

---

## 1. Feature Breakdown & Architecture

### Feature 3: Customer Negotiation
- **Mongoose Model**: `Negotiation` (`backend/src/features/negotiation/negotiation.model.js`)
  - Fields: `quotationId`, `customerId`, `quotationLineId`, `type` (`LINE_COMMENT`, `CHANGE_REQUEST`, `COUNTER_DISCOUNT`, `CONFIRMATION`), `message`, `requestedValue`, `status`, `timestamps`.
- **Security & Ownership**: `customerId` is strictly resolved on the backend from `req.user.id` (`Customer.findOne({ userId })`). Requests supplying `customerId` in payload body are ignored.
- **Frontend Components**:
  - `NegotiationThread.jsx`: History timeline of comments, requests, counter-discounts, and confirmations.
  - `NegotiationForm.jsx`: Interactive action form supporting counter-discount %, change requests, comments, and single-click quotation confirmation.

### Feature 4: Negotiation → Reapproval Preparation
- **Service Boundary**: `reapprovalPrep.service.js` (`backend/src/features/negotiation/reapprovalPrep.service.js`)
- **Integration Function**: `prepareReapprovalPayload()`
- **Output Schema**:
  ```json
  {
    "quotationId": "...",
    "quotationLineId": "...",
    "customerId": "...",
    "requestedValue": 15,
    "negotiationType": "COUNTER_DISCOUNT",
    "reapprovalRequired": true,
    "status": "PENDING_REAPPROVAL",
    "preparedAt": "2026-09-05T12:00:00.000Z"
  }
  ```
- **Boundary Contract**: Pure service boundary formatting commercial customer requests so Member 1 (discount risk engine) and Member 2 (approval engine) can consume reapproval events.

### Feature 5: Invoice Management
- **Mongoose Model**: `Invoice` (`backend/src/features/invoices/invoice.model.js`)
  - Fields: `invoiceNumber` (unique string, e.g., `INV-2026-0001`), `sourceOrderId` (Quotation ref), `customerId`, `lines` (productId, productName, quantity, unitPrice, discount, lineTotal), `subtotal`, `discount`, `tax`, `total`, `status` (`DRAFT`, `ISSUED`, `PAID`, `PARTIALLY_PAID`, `CANCELLED`, `OVERDUE`), `paymentStatus` (`UNPAID`, `PARTIAL`, `PAID`), `issueDate`, `dueDate`, `timestamps`.
- **API Endpoints**:
  - `GET /api/invoices`: List invoices (Filtered by customer for `CUSTOMER` role, global for `ADMIN`/`SALES_MANAGER`).
  - `GET /api/invoices/:id`: Fetch invoice details with ownership check.
  - `POST /api/invoices`: Create invoice from confirmed commercial transaction (`ADMIN`, `SALES_MANAGER`).
  - `PATCH /api/invoices/:id/status`: Update invoice status.

### Feature 6: Payment Recording
- **Mongoose Model**: `Payment` (`backend/src/features/payments/payment.model.js`)
  - Fields: `invoiceId`, `amount`, `paymentDate`, `method` (`CASH`, `BANK`, `ONLINE`, `OTHER`), `reference`, `status` (`COMPLETED`, `PENDING`, `FAILED`), `timestamps`.
- **Business Service**: `payment.service.js`
  - Records payment and calculates total `COMPLETED` payments against `invoice.total`.
  - Automatically updates `invoice.paymentStatus`:
    - Total paid ≥ Total amount → `PAID` (and `invoice.status = 'PAID'`)
    - Total paid > 0 → `PARTIAL` (and `invoice.status = 'PARTIALLY_PAID'`)
    - Total paid = 0 → `UNPAID`

### Feature 7: Deal Health & Anomaly Detection
- **Mongoose Model**: `DealAlert` (`backend/src/features/deal-health/dealAlert.model.js`)
  - Fields: `quotationId`, `type` (`STALLED_DEAL`, `DISCOUNT_ANOMALY`, `DELIVERY_SLIPPAGE`), `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `reason`, `detectedAt`, `status` (`ACTIVE`, `RESOLVED`, `DISMISSED`).
- **Detection Engines** (`dealHealth.service.js`):
  - **Stalled Deal Detection**: Scans database for active quotations untouched for > configurable days (default 7 days).
  - **Discount Anomaly Detection**: Aggregates historical sales rep discount values from MongoDB and flags deals where requested discount exceeds sales rep historical mean by 1.8x.
- **Frontend Page**: `DealHealthDashboardPage.jsx` (`/deal-health`).

### Feature 8: Reporting & Aggregations
- **Aggregation Engine**: `reporting.service.js` (`backend/src/features/reporting/reporting.service.js`)
- **MongoDB Aggregation Pipelines**:
  - `Invoice.aggregate()` for `totalInvoiced`, `totalInvoices`, `avgInvoiceValue`.
  - `Payment.aggregate()` for `totalCollected` and AR balance calculation (`totalInvoiced - totalCollected`).
  - `Quotation.aggregate()` for `totalQuotations`, `totalPipelineValue`, `avgDiscount`.
- **Frontend Page**: `ReportingDashboardPage.jsx` (`/reporting`).

### Feature 9: Notifications & Socket.IO
- **Mongoose Model**: `Notification` (`backend/src/features/notifications/notification.model.js`)
  - Fields: `userId`, `recipientRole`, `type` (`APPROVAL_REQUIRED`, `CUSTOMER_NEGOTIATION`, `QUOTATION_STATUS`, `FULFILLMENT_ISSUE`, `INVOICE_PAYMENT`, `STALLED_DEAL`), `title`, `message`, `link`, `isRead`, `timestamps`.
- **Real-Time Engine**: `socket.service.js` utilizing Socket.IO for rooms (`user:<id>` and `role:<role>`).
- **Frontend Component**: `NotificationBell.jsx` displaying live unread counts, notification list, and mark-as-read toggles.

---

## 2. Integration Contracts for Members 1 and 2

| Field / Entity | Stable Interface Type | Consuming Feature | Source Owner |
|---|---|---|---|
| `quotationId` | `ObjectId` | Customer Negotiation, Invoice, Deal Health | Member 1 |
| `quotationLineId` | `String` | Line Comments, Counter Discount | Member 1 |
| `customerId` | `ObjectId` | Customer Portal, Negotiation, Invoice | Member 3 |
| `invoiceId` | `ObjectId` | Payments | Member 3 |
| `reapprovalData` | `Object` payload | Approval Engine | Member 2 |
| `riskScore` | `Number` | Deal Health Dashboard | Member 1 |
