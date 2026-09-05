# Product Management Feature (M1-F2)

## Overview
Product is a shared domain entity that future features (pricing, quotations, inventory, billing) will consume. It provides full CRUD operations, advanced search and filtering, pagination, variant management, and status toggling for products, services, and subscription plans in DealFlow360.

---

## 1. Product Data Model

**Model Location**: `backend/src/features/products/product.model.js`

### Schema Fields

| Field | Type | Required | Default | Validation / Constraints |
|---|---|---|---|---|
| `name` | String | Yes | — | Trimmed, 2–150 characters |
| `category` | String | Yes | — | Trimmed, 2–100 characters |
| `description` | String | No | `""` | Max 1000 characters |
| `productType` | String | Yes | `PRODUCT` | Enum: `PRODUCT`, `SERVICE`, `SUBSCRIPTION` |
| `basePrice` | Number | Yes | — | Minimum 0 |
| `costPrice` | Number | No | `0` | Minimum 0, must be ≤ `basePrice` |
| `taxRate` | Number | No | `0` | Range: 0–100 (%) |
| `unit` | String | Yes | `unit` | Enum: `unit`, `kg`, `meter`, `hour`, `month`, `year` |
| `variants` | Array | No | `[]` | Array of Variant objects |
| `isActive` | Boolean | No | `true` | Indexed for status filtering |
| `createdAt` | Date | Auto | `now` | Managed by Mongoose `timestamps` |
| `updatedAt` | Date | Auto | `now` | Managed by Mongoose `timestamps` |

### Variant Subdocument Schema

| Field | Type | Required | Default | Validation / Constraints |
|---|---|---|---|---|
| `sku` | String | Yes | — | Uppercase, alphanumeric + dash/underscore, max 50 chars |
| `name` | String | Yes | — | Trimmed, 1–100 chars (e.g. "Red / Large") |
| `priceAdjustment` | Number | No | `0` | Numeric (can be positive or negative) |
| `attributes` | Map of Strings | No | `{}` | Key-value pairs (e.g., `{ color: "Red", size: "L" }`) |

---

## 2. API Endpoints Reference

All endpoints are mounted at `/api/products` and require standard JWT bearer authentication headers or cookies.

### 2.1 Get Distinct Categories
- **GET** `/api/products/categories`
- **Access**: All authenticated users
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": { "categories": ["Electronics", "Software", "Support Services"] }
  }
  ```

### 2.2 List Products
- **GET** `/api/products`
- **Query Params**:
  - `search` (string): Search name & description
  - `category` (string): Exact match category filter
  - `productType` (string): Enum filter (`PRODUCT`, `SERVICE`, `SUBSCRIPTION`)
  - `isActive` (boolean): `true` or `false`
  - `page` (number): Page index (default: `1`)
  - `limit` (number): Items per page (default: `10`, max: `100`)
- **Access**: All authenticated users
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "products": [...],
      "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
    }
  }
  ```

### 2.3 Get Product by ID
- **GET** `/api/products/:id`
- **Access**: All authenticated users
- **Response**: `200 OK` or `404 Not Found`

### 2.4 Create Product
- **POST** `/api/products`
- **Access**: `ADMIN`, `SALES_MANAGER`
- **Body**: Complete Product JSON
- **Response**: `201 Created`

### 2.5 Full Update Product
- **PUT** `/api/products/:id`
- **Access**: `ADMIN`, `SALES_MANAGER`
- **Body**: Complete Product JSON
- **Response**: `200 OK`

### 2.6 Toggle Active Status
- **PATCH** `/api/products/:id/status`
- **Access**: `ADMIN`, `SALES_MANAGER`
- **Body**: `{ "isActive": false }`
- **Response**: `200 OK`

---

## 3. Frontend Architecture

**Directory**: `frontend/src/features/products/`

### Components
- `ProductFilters.jsx`: Real-time debounced search bar, category dropdown, product type selector, active status toggle, and reset filters button.
- `ProductTable.jsx`: Dark-mode table with category tags, pricing formatted in INR (₹), status toggle switch, and edit action buttons.
- `StatusToggle.jsx`: Reusable switch component for toggling active/inactive state.
- `ProductForm.jsx`: Dynamic form supporting base product fields and dynamic addition/removal of product variants with custom attributes.
- `Pagination.jsx`: Clean pagination bar with intelligent ellipsis display and total count label.

### Pages
- `ProductListPage.jsx` (`/products`): Main hub with list view, search, filters, pagination, and Add Product CTA.
- `ProductCreatePage.jsx` (`/products/new`): Product creation form.
- `ProductEditPage.jsx` (`/products/:id/edit`): Product modification form pre-populated with existing data.

### Hooks & API Layer
- `api/products.api.js`: Axios request wrapper for product CRUD endpoints.
- `hooks/useProducts.js`: Custom hook for list fetching, debounced search, filtering, pagination, and status toggling.
- `hooks/useProduct.js`: Custom hook for fetching single product details by ID.

---

## 4. Security & Role Matrix

| Action | Route | ADMIN | SALES_MANAGER | Other Roles |
|---|---|:---:|:---:|:---:|
| List / Search Products | `GET /api/products` | ✅ | ✅ | ✅ |
| Get Product Categories | `GET /api/products/categories` | ✅ | ✅ | ✅ |
| View Single Product | `GET /api/products/:id` | ✅ | ✅ | ✅ |
| Create Product | `POST /api/products` | ✅ | ✅ | ❌ |
| Update Product | `PUT /api/products/:id` | ✅ | ✅ | ❌ |
| Toggle Active Status | `PATCH /api/products/:id/status` | ✅ | ✅ | ❌ |
