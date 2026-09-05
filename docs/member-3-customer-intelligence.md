# Member 3: Customer Portal + Intelligence Architecture

This document outlines the architecture, ownership boundaries, and integration points for the features implemented by Member 3 (Customer Portal & Intelligence vertical) in DealFlow360.

## Overview
Member 3 is responsible for the Customer Portal interface and the intelligence layer spanning negotiations, invoices, payments, reporting, and real-time alerts. This system is heavily integrated with the output of Member 1 (Sales/Quotations) and Member 2 (Approvals/Fulfillment) without duplicating their core business logic or data structures.

## Architectural Principles
1. **No Duplicate Core Models**: The Customer Portal consumes `User` logic from M1 and references `Product` and `Quotation` IDs. It does not re-invent authentication.
2. **Strict Ownership Control**: All requests routed through the portal require the `requireCustomer` middleware. Every database query enforces `customerId: req.user.id` at the service layer, preventing cross-tenant data leaks.
3. **API Contracts**: Instead of tight database coupling, the Customer Portal expects fixed JSON structures (Contracts) from M1/M2 when integrating, allowing independent development.

## Implemented Features (M3-F1 to M3-F9)

### 1. Customer Portal Access Foundation (M3-F1)
- **Role**: Secure gateway.
- **Implementation**: Utilizes `requireCustomer` middleware and validates JWT payload (`req.user.role === 'CUSTOMER'`).
- **Integration**: Depends on Member 1's shared Authentication system.

### 2. Customer Quotation Portal (M3-F2)
- **Role**: Read-only display of finalized/draft quotations.
- **Implementation**: Provides an integration layer `customerPortal.service.js` that acts as a secure proxy to Member 1's quotation endpoints.

### 3. Customer Negotiation (M3-F3)
- **Role**: Captures customer feedback and counter-offers on quotes.
- **Model**: `Negotiation` (`quotationId`, `type`, `message`, `requestedValue`).
- **Integration**: M1 reads these records to determine if an internal rep needs to revise the quote.

### 4. Reapproval Preparation (M3-F4)
- **Role**: Structures negotiation data so M2's approval engine can easily digest it.
- **Implementation**: The `Negotiation` model specifically captures `requestedValue` (e.g., a 15% requested discount) rather than just unstructured text, allowing M2 automated rules to trigger based on thresholds.

### 5. Invoice Management (M3-F5)
- **Role**: Read-only financial ledger for the customer.
- **Model**: `Invoice` (`invoiceNumber`, `sourceOrderId`, `grandTotal`, `paymentStatus`).
- **Integration**: Triggered when M2 finalizes fulfillment or M1 finalizes an order.

### 6. Payment Recording (M3-F6)
- **Role**: Tracks incoming payments against invoices.
- **Model**: `Payment` (`invoiceId`, `amount`, `method`).
- **Implementation**: Automatically updates the linked `Invoice`'s `paymentStatus` to `PARTIAL` or `PAID`.

### 7. Deal Health & Anomaly Detection (M3-F7)
- **Role**: Automated alerting for stalled negotiations or excessive discount requests.
- **Model**: `DealAlert` (`quotationId`, `type`, `severity`).
- **Implementation**: The `dealHealth.service.js` engine scans recent negotiations and creates alerts if anomalies (like a >20% counter-discount) are detected.

### 8. Customer Reporting (M3-F8)
- **Role**: Financial summary and spend analytics.
- **Implementation**: Uses MongoDB aggregation pipelines to calculate total invoiced amounts, total paid, outstanding balances, and accrued savings across the customer's history.

### 9. Notifications (M3-F9)
- **Role**: Real-time alerts for the customer.
- **Implementation**: `Notification` model paired with `Socket.io` to push real-time events (e.g., "Quotation Approved") to the React frontend.

## Integration Handoffs
To complete the system, Members 1 and 2 need to implement the following event hooks/API calls that target Member 3's models:

1. **Quotation Generation (M1)**: Must fire an event or make a proxy call to notify the portal when a quotation changes status so M3 can generate a `Notification`.
2. **Order Finalization (M1/M2)**: Must generate an `Invoice` record in M3's database when an order is finalized.
3. **Approval Triggers (M2)**: Should poll or listen for `Negotiation` records of type `COUNTER_DISCOUNT` to trigger internal reapproval workflows.
