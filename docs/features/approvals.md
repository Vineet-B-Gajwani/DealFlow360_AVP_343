# M2-F2 — Approval Workflow

## Overview

The Approval Workflow is a **reusable, standalone engine** that processes
authorization decisions for any business object that requires human sign-off.

In DealFlow360 its first integration point is quotation discount approval, but
the engine itself has no dependency on the Quotation collection. It communicates
via a simple integration payload (see §Integration Contract below).

---

## Approval Model

**Collection:** `approvals`  
**File:** `backend/src/features/approvals/approval.model.js`

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | Mongo primary key |
| `quotationId` | String | ✅ | External reference — the quotation this approval covers |
| `riskScore` | Number (0–100) | ✅ | Risk score from the caller's risk engine |
| `requiredLevel` | Enum | ✅ | `NONE` / `SALES_MANAGER` / `FINANCE` |
| `currentLevel` | Enum | auto | Tracks which level of the chain is active |
| `status` | Enum | auto | `PENDING` / `APPROVED` / `REJECTED` / `REVISION_REQUIRED` |
| `requestedBy` | String | ✅ | User ID who submitted the request |
| `currentReviewer` | String | — | User ID of the current expected reviewer (future: assignee) |
| `history` | Array | auto | Full audit trail (see below) |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### History entry sub-document

Each entry in `history[]` contains:

| Field | Description |
|---|---|
| `action` | `CREATED` / `APPROVED` / `REJECTED` / `REVISION_REQUIRED` / `RESUBMITTED` |
| `user` | User ID string |
| `userLabel` | Human-readable label (email) |
| `reason` | Optional freetext explanation |
| `timestamp` | UTC Date |

---

## State Machine

```
                  ┌─────────────────────────────────────┐
                  │         createApproval()             │
                  └──────────────┬──────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │ requiredLevel = NONE?               │
              └─────┬───────────────────────────────┘
                    │ YES                  │ NO
                    ▼                      ▼
              ┌─────────────┐      ┌──────────────────┐
              │  APPROVED   │      │    PENDING        │
              │ (immediate) │      │ currentLevel =    │
              └─────────────┘      │ SALES_MANAGER     │
                                   └──────┬────────────┘
                                          │
                        ┌─────────────────▼──────────────────────┐
                        │         Reviewer acts                   │
                        └──────┬───────────┬──────────┬──────────┘
                               │           │          │
                          approve()    reject()   revision()
                               │           │          │
                   ┌───────────▼──┐ ┌──────▼──┐ ┌────▼────────────────┐
                   │ requiredLevel│ │REJECTED │ │REVISION_REQUIRED    │
                   │ = FINANCE?   │ └─────────┘ └─────────────────────┘
                   └──┬───────┬───┘
                      │YES    │NO
                      ▼       ▼
              currentLevel  APPROVED
              → FINANCE     (terminal)
              (still PENDING)
                      │
              ┌───────▼──────────┐
              │ Finance reviews  │
              └───┬──────────────┘
                  ▼
               APPROVED (terminal)
```

### Required Levels

| Level | Chain |
|---|---|
| `NONE` | Auto-approved on creation. No human action needed. |
| `SALES_MANAGER` | One approval round from a `SALES_MANAGER` or `ADMIN`. |
| `FINANCE` | First SALES_MANAGER approval, then FINANCE_OPERATIONS approval. |

---

## API Endpoints

Base path: `/api/approvals`

All endpoints require `Authorization: Bearer <access_token>`.

### `POST /api/approvals`
**Roles:** `SALES_REP`, `SALES_MANAGER`, `FINANCE_OPERATIONS`, `ADMIN`

**Body:**
```json
{
  "quotationId":    "QUO-2024-001",
  "riskScore":      72,
  "requiredLevel":  "FINANCE",
  "requestedBy":    "<user-id>"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": { ...approval }
}
```

**Errors:** `400` validation, `409` duplicate pending approval for same quotationId.

---

### `GET /api/approvals`
**Roles:** all internal  
**Query params:** `?status=PENDING`, `?quotationId=QUO-2024-001`

**Success `200`:**
```json
{ "success": true, "count": 3, "data": [ ...approvals ] }
```

---

### `GET /api/approvals/:id`
**Roles:** all internal  
**Success `200`:** single approval document.

---

### `POST /api/approvals/:id/approve`
**Roles:** `SALES_MANAGER`, `FINANCE_OPERATIONS`, `ADMIN`  
**Body:** `{ "reason": "Looks good" }` *(reason optional)*

Advances the state machine one step. If the chain is complete, sets `status = APPROVED`.

---

### `POST /api/approvals/:id/reject`
**Roles:** `SALES_MANAGER`, `FINANCE_OPERATIONS`, `ADMIN`  
**Body:** `{ "reason": "Margin too low" }` *(reason optional)*  
Sets `status = REJECTED` (terminal).

---

### `POST /api/approvals/:id/revision`
**Roles:** `SALES_MANAGER`, `FINANCE_OPERATIONS`, `ADMIN`  
**Body:** `{ "reason": "Need updated pricing" }` *(reason optional)*  
Sets `status = REVISION_REQUIRED`.

---

## Role Permissions

| Action | SALES_REP | SALES_MANAGER | FINANCE_OPERATIONS | ADMIN |
|---|---|---|---|---|
| Create approval | ✅ | ✅ | ✅ | ✅ |
| List / read approvals | ✅ | ✅ | ✅ | ✅ |
| Approve / Reject / Revision | ❌ | ✅ | ✅ | ✅ |

> Fine-grained level enforcement (e.g. only `FINANCE_OPERATIONS` may approve a
> `FINANCE`-level record) is intentionally **not** enforced in this sprint.
> The service layer is designed to accept it — the role check can be tightened
> in `approval.routes.js` or `approval.service.js` once the team aligns on policy.

---

## Integration Contract

When Member 3 (customer negotiation) or Member 1 (discount risk engine) triggers
an approval, they must `POST /api/approvals` with exactly:

```json
{
  "quotationId":   "<string>  — external quotation identifier",
  "riskScore":     "<number>  — 0–100, calculated by the risk engine",
  "requiredLevel": "<NONE|SALES_MANAGER|FINANCE>  — decided by the risk engine",
  "requestedBy":   "<string>  — user ID who initiated the quotation change"
}
```

The approval service does **not** calculate discount, risk, or pricing.
It accepts these values as-is from the caller.

---

## File Structure

```
backend/src/features/approvals/
  approval.model.js        # Mongoose schema + exported constants
  approval.service.js      # State machine + business logic
  approval.controller.js   # Thin HTTP handlers
  approval.routes.js       # Express router (uses M1 auth middleware)
  approval.validation.js   # express-validator rules

frontend/src/features/approvals/
  api/
    approvalApi.js          # Axios API client
  hooks/
    useApprovals.js         # List hook with filter support
    useApproval.js          # Detail hook + action handlers
  components/
    ApprovalStatusBadge.jsx # Status pill badge
    ApprovalTable.jsx       # List table + empty state
    ApprovalHistory.jsx     # Audit trail timeline
    ActionPanel.jsx         # Approve / Reject / Revision UI
    NewApprovalForm.jsx     # Create-approval form
  pages/
    ApprovalListPage.jsx    # /approvals
    ApprovalDetailPage.jsx  # /approvals/:id

docs/features/
  approvals.md             # This file
```

---

## Local Setup

Approval routes are registered in `backend/src/app.js` under `/api/approvals`.
No additional setup is needed beyond the standard backend start:

```bash
cd backend && npm run dev   # http://localhost:5000
cd frontend && npm run dev  # http://localhost:5173
```

Navigate to `/approvals` after logging in (any internal role).
