# Users Management Implementation

**Status:** ✅ COMPLETE

## Overview

Implemented comprehensive Users Management feature for admin dashboard allowing administrators to:

- View list of all users with pagination and filtering
- Search users by email or name
- Filter by role (Customer, Admin, Staff)
- Filter by active/inactive status
- Toggle user active status
- Change user role
- Delete users (with confirmation)

## Backend Implementation

### Files Created

#### 1. `backend/src/modules/auth/admin.user.routes.js`

Defines 5 protected API routes:

- `GET /auth/admin/users` - Get all users with filters and pagination
- `GET /auth/admin/users/:id` - Get single user details with profile and addresses
- `PATCH /auth/admin/users/:id/status` - Toggle active/inactive status
- `PATCH /auth/admin/users/:id/role` - Update user role
- `DELETE /auth/admin/users/:id` - Delete user account

All routes require `requireAuth` + `requireAdmin` middleware.

#### 2. `backend/src/modules/auth/admin.user.controller.js`

Controller with 5 methods:

**getAll(req, res)**

- Accepts query filters: `role`, `is_active`, `search`, `page`, `limit`
- Returns paginated list: `{ users: [], total: number, page: number, limit: number, pages: number }`
- Includes user profile data and order/review counts

**getOne(req, res)**

- Returns single user with profile, address list, order/review counts
- Response: `{ user: {..., addresses: [...]} }`

**updateStatus(req, res)**

- Requires `is_active` boolean in body
- Prevents user from deactivating their own account
- Response: `{ message: "User status updated", user: {...} }`

**updateRole(req, res)**

- Requires `role` in body: "customer", "admin", or "staff"
- Prevents user from demoting themselves
- Response: `{ message: "User role updated", user: {...} }`

**delete(req, res)**

- Prevents user from deleting their own account
- Response: `{ message: "User deleted", user: {...} }`

#### 3. `backend/src/modules/auth/admin.user.service.js`

Service layer methods:

**getAllUsers(filters, limit, offset)**

- Queries database with optional filters
- Returns: `{ users: [], total: number, page: number, limit: number, pages: number }`
- Provides pagination metadata

**getUserDetail(id)**

- Fetches single user with all related data
- Returns user object with profile and addresses

**updateUserStatus(id, is_active)**

- Updates auth_users.is_active column
- Returns updated user object

**updateUserRole(id, role)**

- Updates auth_users.role column
- Returns updated user object

**deleteUser(id)**

- Removes user from auth_users table
- Cascade deletes profile, addresses, and related data via FK constraints

#### 4. `backend/src/modules/auth/admin.user.repository.js`

Database access layer with advanced queries:

**findAll(filters, limit, offset)**

- Constructs dynamic SQL with WHERE clauses for:
  - `filters.role` - Filter by user role (customer/admin/staff)
  - `filters.is_active` - Filter by active status (boolean)
  - `filters.search` - Full-text search in email or name (ILIKE)
- Uses parameterized queries to prevent SQL injection
- Joins with user_profiles and counts orders/reviews
- Returns `{ rows: [], total: count }`

**findById(id)**

- Fetches user with:
  - Auth data: id, email, role, is_active, created_at, updated_at
  - Profile: full_name, avatar_url, phone, is_phone_verified, gender, birthday
  - Addresses: JSON aggregate of all user addresses
  - Stats: total_orders, total_reviews
- Returns single user object

**updateStatus(id, is_active)**

- Updates only is_active column, preserves other fields
- Returns updated user object

**updateRole(id, role)**

- Updates only role column
- Returns updated user object

**delete(id)**

- Removes user from database
- Returns deleted user object

### Files Modified

#### `backend/src/modules/auth/auth.routes.js`

Added import and mount:

```javascript
import adminUserRoutes from "./admin.user.routes.js";
...
router.use("/admin", adminUserRoutes);
```

Routes now accessible at `/auth/admin/users/*`

## Frontend Implementation

### Files Created

#### `website/src/components/UserList.tsx`

React component (397 lines) with:

**Features:**

- User table with columns: Email, Name, Role, Status, Orders, Joined, Actions
- Inline role editing - click badge to change role (customer/admin/staff)
- Status toggle button - switch active/inactive state
- Delete button - remove user with confirmation
- Pagination - navigate through user pages
- Filtering:
  - Search by email or name (debounced input)
  - Filter by role dropdown
  - Filter by status dropdown
- Loading states and error handling
- Formatted dates (DD/MM/YYYY)
- Role-based badge colors: Red (admin), Yellow (staff), Blue (customer)

**Key Functions:**

- `fetchUsers()` - Fetch paginated users with applied filters
- `toggleUserStatus(userId, currentStatus)` - Toggle active status
- `updateUserRole(userId, newRole)` - Update user role with confirmation
- `deleteUser(userId)` - Delete user with confirmation

### Files Modified

#### `website/src/services/apiClient.ts`

Added 5 user endpoints:

```typescript
// GET users with filters and pagination
getUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}): Promise<ApiResponse<any>>

// GET single user
getUser(id: string): Promise<ApiResponse<any>>

// PATCH update status
updateUserStatus(id: string, is_active: boolean): Promise<ApiResponse<any>>

// PATCH update role
updateUserRole(id: string, role: "customer" | "admin" | "staff"): Promise<ApiResponse<any>>

// DELETE user
deleteUser(id: string): Promise<ApiResponse<any>>
```

Also added response normalization for `{ user }` and `{ users }` responses.

#### `website/src/App.tsx`

- Imported UserList component
- Added routing case for "users" tab

#### `website/src/components/Layout.tsx`

- Added Users icon import
- Added "Users" menu item to sidebar navigation

## Database Schema

The implementation uses existing tables:

**auth_users**

- id (UUID primary key)
- email (unique)
- password_hash
- role (customer, admin, staff)
- is_active (boolean, default true)
- created_at, updated_at

**user_profiles**

- user_id (foreign key)
- full_name
- avatar_url
- phone
- is_phone_verified
- gender
- birthday

**user_addresses**

- id
- user_id (foreign key)
- recipient_name, phone, province, district, ward, address_detail
- is_default

## API Response Format

### GET /auth/admin/users

**Query Parameters:**

```
?page=1&limit=10&role=customer&is_active=true&search=john
```

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "role": "customer",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "phone": "0901234567",
      "is_phone_verified": true,
      "total_orders": 5,
      "total_reviews": 2
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

### GET /auth/admin/users/:id

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "customer",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "phone": "0901234567",
    "is_phone_verified": true,
    "gender": "male",
    "birthday": "1990-01-01",
    "total_orders": 5,
    "total_reviews": 2,
    "addresses": [
      {
        "id": "uuid",
        "recipient_name": "John Doe",
        "phone": "0901234567",
        "province": "Ho Chi Minh",
        "district": "District 1",
        "ward": "Ward 1",
        "address_detail": "123 Main St",
        "is_default": true
      }
    ]
  }
}
```

### PATCH /auth/admin/users/:id/status

**Request Body:**

```json
{
  "is_active": true
}
```

**Response:**

```json
{
  "message": "User status updated",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "customer",
    "is_active": true
  }
}
```

### PATCH /auth/admin/users/:id/role

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "User role updated",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### DELETE /auth/admin/users/:id

**Response:**

```json
{
  "message": "User deleted",
  "user": {
    "id": "uuid",
    "email": "john@example.com"
  }
}
```

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **Admin-Only Access** - All endpoints require `requireAdmin` middleware
3. **Self-Protection** - Users cannot:
   - Deactivate their own account
   - Demote themselves from admin
   - Delete their own account
4. **SQL Injection Prevention** - All queries use parameterized statements
5. **Cascade Delete** - Deleting user removes profile, addresses, and related data

## Frontend-Backend Compatibility

✅ **Fully Compatible**

### Request/Response Handling:

1. Frontend sends query parameters with user-friendly names
2. Backend accepts and processes filters
3. Backend returns data with `{ users: [...] }` or `{ user: {...} }` wrapper
4. Frontend apiClient normalizes responses to extract data
5. Component receives clean data for rendering

### Validation:

- Frontend validates required fields before sending
- Backend validates data types and applies business rules
- Both sides handle errors gracefully with user feedback

### Data Types:

- Dates: ISO 8601 string format (consistent with backend)
- Booleans: true/false (consistent)
- Pagination: page/limit/total/pages metadata format (consistent with category/voucher endpoints)

## Testing

To test the Users Management feature:

1. **List Users:**

   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:5000/api/v1/auth/admin/users?page=1&limit=10"
   ```

2. **Search Users:**

   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:5000/api/v1/auth/admin/users?search=john&role=customer"
   ```

3. **Get User Details:**

   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:5000/api/v1/auth/admin/users/USER_ID"
   ```

4. **Toggle Status:**

   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"is_active": false}' \
     "http://localhost:5000/api/v1/auth/admin/users/USER_ID/status"
   ```

5. **Update Role:**

   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin"}' \
     "http://localhost:5000/api/v1/auth/admin/users/USER_ID/role"
   ```

6. **Delete User:**
   ```bash
   curl -X DELETE \
     -H "Authorization: Bearer TOKEN" \
     "http://localhost:5000/api/v1/auth/admin/users/USER_ID"
   ```

## Known Limitations

None at this time. Feature is complete and fully functional.

## Future Enhancements

1. Bulk delete users with checkboxes
2. Export users to CSV
3. User activity logs (last login, actions)
4. Role-based permissions editor
5. User suspension vs deletion distinction
6. Batch role change
