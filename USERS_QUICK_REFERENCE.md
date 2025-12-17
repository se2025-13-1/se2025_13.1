# Users Management - Quick Reference Guide

## Feature Overview

Complete user management system for admins to manage customer accounts, roles, and statuses.

---

## How to Use (Admin Interface)

### Access Users Management

1. Log in as admin user
2. Click **"Users"** in the sidebar menu
3. See table of all registered users

### Search Users

1. Type in the **"Search by email or name"** field
2. Results filter automatically
3. Search is case-insensitive and matches partial strings

### Filter Users

1. **By Role:** Select from dropdown (All Roles / Customer / Admin / Staff)
2. **By Status:** Select from dropdown (All Users / Active / Inactive)
3. Filters work in combination
4. Click **"Refresh"** to update results

### View User Details

1. Click on any user email/name row
2. Slide out details panel shows:
   - Full name
   - Phone number
   - Email verification status
   - Addresses (if any)
   - Total orders
   - Reviews count

### Change User Role

1. Click on the role badge (shows current role)
2. Dropdown appears
3. Select new role: Customer / Admin / Staff
4. Confirm action if promoting to Admin/Staff
5. Role updates immediately in the table

### Toggle User Status

1. Click the status button (shows Active/Inactive)
2. Status button changes color and updates
3. User becomes locked out if set to Inactive
4. User can login again if set to Active

### Delete User

1. Click **"Delete"** button in Actions column
2. Confirm deletion in popup dialog
3. User is permanently removed from system
4. User cannot log in anymore

### Pagination

1. View page number at bottom
2. Use **"Previous" / "Next"** buttons to navigate
3. Or click specific page number
4. Each page shows 10 users

---

## API Endpoints (For Developers)

### Get All Users

```bash
GET /auth/admin/users?page=1&limit=10&search=john&role=customer&is_active=true
Authorization: Bearer TOKEN
```

### Get Single User

```bash
GET /auth/admin/users/{USER_ID}
Authorization: Bearer TOKEN
```

### Update User Status

```bash
PATCH /auth/admin/users/{USER_ID}/status
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "is_active": true
}
```

### Update User Role

```bash
PATCH /auth/admin/users/{USER_ID}/role
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```

### Delete User

```bash
DELETE /auth/admin/users/{USER_ID}
Authorization: Bearer TOKEN
```

---

## Response Format

### List Users Response

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "role": "customer",
      "is_active": true,
      "full_name": "John Doe",
      "phone": "0901234567",
      "is_phone_verified": true,
      "total_orders": 5,
      "total_reviews": 2,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

---

## Security & Protections

### You Cannot:

- ❌ Deactivate your own account
- ❌ Demote yourself from admin role
- ❌ Delete your own account

### Backend Protections:

- ✅ Requires valid JWT token
- ✅ Requires admin role
- ✅ Validates all input data
- ✅ Uses parameterized SQL queries

### Self-Protection Features:

- ✅ UI confirmation dialogs for destructive actions
- ✅ Backend prevents self-harm actions
- ✅ Proper error messages if action blocked
- ✅ Admin user cannot be locked out completely

---

## Common Tasks

### Promote User to Admin

1. Find user in list
2. Click role badge → select "Admin"
3. Confirm promotion
4. User now has admin access

### Suspend Inactive User

1. Find user in list
2. Click Active button → changes to Inactive
3. User cannot log in
4. Click again to reactivate

### Delete Spam/Test Account

1. Find user in list
2. Click "Delete" button
3. Confirm deletion
4. User and all data removed

### Find User by Email

1. Type email in search box
2. Results filter instantly
3. Can use partial email (e.g., just "john" for john@example.com)

### Filter by Role

1. Select role from dropdown
2. View only users with that role
3. Can combine with search and status filters

---

## Troubleshooting

### I Can't Find a User

1. Check search spelling
2. Try searching by partial name
3. Reset filters to "All Roles" and "All Users"
4. Make sure user is active (not soft-deleted)

### Error: "Access Denied"

- You must be an admin to access this feature
- Contact system administrator for role assignment

### Error: "User Not Found"

- User may have been deleted
- Refresh page and try again
- Check if user ID is correct

### Role Change Not Working

- Confirm the new role in the dropdown
- Check if you're trying to demote yourself (not allowed)
- Try refreshing the page

### Delete Button Disabled

- You cannot delete your own account
- Try deleting a different user
- If permanently stuck, contact support

---

## Best Practices

### Before Deleting a User

1. ✅ Verify you have correct user
2. ✅ Check their order history
3. ✅ Consider archiving instead of deleting
4. ✅ Document reason for deletion

### Role Management

1. ✅ Use specific roles (don't make everyone admin)
2. ✅ Review permissions before promoting
3. ✅ Demote when user changes responsibilities
4. ✅ Audit role changes for security

### Monitoring Users

1. ✅ Check newly registered users for spam
2. ✅ Monitor order patterns
3. ✅ Watch for suspicious activity
4. ✅ Disable inactive accounts after period

---

## Keyboard Shortcuts

- `Enter` - Confirm action / Submit form
- `Escape` - Close modal / Cancel action
- `Tab` - Navigate between fields
- `Ctrl/Cmd + F` - Browser find (works on page)

---

## Related Features

- **Categories Management** - Manage product categories
- **Vouchers Management** - Create and manage discount codes
- **Products Management** - Add and edit products
- **Orders Management** - View and update order statuses
- **Dashboard** - Overview statistics and metrics

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review implementation documentation: `USERS_IMPLEMENTATION.md`
3. Review compatibility check: `USERS_COMPATIBILITY_CHECK.md`
4. Contact development team

---

**Last Updated:** 2025
**Feature Status:** ✅ Production Ready
