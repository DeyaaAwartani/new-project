# Wallet Module Implementation Task

## Overview

Implement a wallet and order management system that allows users to purchase items using credits, with admin approval workflow.

---

## Requirements

### 1. Wallet Module

- **Entity**: Create `Wallet` entity with:
  - `id` (Primary Key)
  - `userId` (Foreign Key to User)
  - `balance` (decimal, default: 0)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- **Auto-Creation**: Wallet should be automatically created for each new user database insertion
  - **Hint**: Look up TypeORM's `@EventSubscriber()`

### 2. Credit Management (Admin Feature)

- **Endpoint**: `POST /admin/wallets/:userId/add-credits`
  - Only ADMIN role can access
  - Adds to user's wallet balance
  - Returns updated wallet details

### 3. Order Module

- **Entity**: Create `Order` entity with:
  - `id` (Primary Key)
  - `userId` (Foreign Key to User)
  - `productId` (Foreign Key to Product)
  - `amount` (decimal - cost of item at time of order)
  - `status` (enum: `pending`, `approved`, `rejected`, `completed`)
  - `createdAt` (timestamp)
  - `approvedAt` (timestamp, nullable)

- **Status Rules**:
  - Order is created with status `pending` ONLY IF user has sufficient wallet balance
  - If user lacks balance, order creation fails with 400 error
  - Admin must approve order to complete purchase

### 4. Order Creation (User Feature)

- **Endpoint**: `POST /orders`
  - Request body: `{ productId: number }`
  - Fetch product details by ID to get current price
  - Validate: User wallet balance >= product price
  - If valid: Create order with status `pending`
  - If invalid: Return error "Insufficient wallet balance"
  - DO NOT deduct credits on creation, only reserve/pending

### 5. Admin Dashboard & Order Approval

- **Endpoint**: `GET /admin/orders`
  - List all pending orders (paginated)
  - Only ADMIN role can access

- **Endpoint**: `POST /admin/orders/:orderId/approve`
  - Approve the order
  - Deduct credits from user's wallet
  - Update order status to `approved`
  - Only ADMIN role can access

- **Endpoint**: `POST /admin/orders/:orderId/reject`
  - Reject the order
  - Order status changes to `rejected`
  - Wallet balance remains unchanged
  - Only ADMIN role can access

---

## Notes

- Do NOT deduct credits when order is created, only when admin approves
- Validate wallet balance before allowing order creation
- All timestamps should be auto-managed by database/TypeORM
