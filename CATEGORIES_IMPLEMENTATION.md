# 📋 CATEGORY MANAGEMENT - IMPLEMENTATION CHECKLIST

## ✅ FRONTEND (Website) - HOÀN THÀNH

### 1. Components Created/Updated

- ✅ **CategoryList.tsx** - Component quản lý danh mục
  - ✅ Liệt kê danh mục (tree view)
  - ✅ Tìm kiếm danh mục
  - ✅ Tạo danh mục (Create)
  - ✅ Chỉnh sửa danh mục (Update)
  - ✅ Xóa danh mục (Delete)
  - ✅ Form modal
  - ✅ Hỗ trợ subcategories (hierarchical)
  - ✅ Preview ảnh

### 2. Files Modified

- ✅ **App.tsx** - Thêm import CategoryList và switch case
- ✅ **Icons.tsx** - Thêm ChevronRight icon
- ✅ **apiClient.ts** - Thêm 5 endpoints:
  - ✅ `getCategories()` - Lấy flat list
  - ✅ `getCategoryTree()` - Lấy tree structure
  - ✅ `createCategory()`
  - ✅ `updateCategory()`
  - ✅ `deleteCategory()`

### 3. Type System

- ✅ **types.ts** - Category interface đã tồn tại

### 4. Features

- ✅ Real-time data fetch
- ✅ Loading states
- ✅ Error handling
- ✅ Tree view with expand/collapse
- ✅ Prevent self-referencing in parent select
- ✅ Image URL preview
- ✅ Form validation

---

## ✅ BACKEND (API) - HOÀN THÀNH

### 1. Routes (Đã có sẵn)

```
GET    /api/categories        → getTree() - Lấy tree structure
GET    /api/categories/flat   → getFlat() - Lấy danh sách phẳng (dropdown)
POST   /api/categories        → create() [Admin only]
PUT    /api/categories/:id    → update() [Admin only]
DELETE /api/categories/:id    → remove() [Admin only]
```

### 2. Controllers & Services

- ✅ CategoryController - Xử lý requests
- ✅ CategoryService - Business logic
- ✅ CategoryRepository - Database queries

### 3. Security

- ✅ Public endpoints: GET
- ✅ Protected endpoints: POST/PUT/DELETE with `requireAuth` + `requireAdmin`

### 4. Features

- ✅ Auto slug generation từ name
- ✅ Hierarchical categories (parent_id)
- ✅ Image URL storage
- ✅ Redis cache management

---

## 🧪 HOW TO TEST

### Step 1: Verify Backend is Running

```bash
# Terminal 1: Chạy backend
cd backend
npm run dev
# Kiểm tra: http://127.0.0.1:3000/api/categories (public endpoint)
```

### Step 2: Login to Admin

```
URL: http://localhost:5173
Email: admin@example.com
Password: password
```

### Step 3: Navigate to Categories Tab

1. Sidebar → Click "Categories" icon (🏷️)
2. Should see Categories Management page

### Step 4: Test CRUD Operations

#### ✅ CREATE

1. Click "New Category" button
2. Fill in:
   - Category Name: "Electronics"
   - Parent Category: (leave empty for top-level)
   - Image URL: (optional)
3. Click Save
4. Should see new category in list

#### ✅ CREATE SUBCATEGORY

1. Click "New Category" button
2. Fill in:
   - Category Name: "Smartphones"
   - Parent Category: "Electronics"
3. Click Save
4. Electronics should expand to show Smartphones

#### ✅ READ (Expand/Collapse)

1. Click ▶ next to parent category
2. Should expand to show children
3. Click ▼ to collapse

#### ✅ UPDATE

1. Click Edit (pencil) icon on any category
2. Change name or image URL
3. Click Save

#### ✅ DELETE

1. Click Delete (trash) icon on any category
2. Confirm deletion
3. Category should disappear

#### ✅ SEARCH

1. Type in search box
2. List should filter in real-time
3. Only matching categories show

### Step 5: Check Data Persistence

```bash
# Open Database (PostgreSQL)
SELECT * FROM categories;
# Should see your created categories

# Or use curl
curl http://127.0.0.1:3000/api/categories/flat \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 6: Test Integration with Products

1. Go to Products
2. Create new product
3. Category dropdown should show all your categories
4. Should be able to select any category

---

## 🔍 COMMON ISSUES & FIXES

### Issue 1: "Cannot find module CategoryList"

**Fix**: Make sure CategoryList.tsx was created in `website/src/components/`

### Issue 2: API returns "Cannot read property 'map' of undefined"

**Fix**: Check backend response format. Should be:

```json
{
  "categories": [...]  // for getCategoryTree()
  // OR
  "categories": [...]  // for getFlat()
}
```

### Issue 3: Parent category select shows the category itself

**Fix**: Already handled in CategoryList component:

```tsx
categories.filter((c) => c.id !== editingCategory?.id);
```

### Issue 4: Image preview doesn't show

**Fix**: Check URL is valid and image is accessible (CORS)

### Issue 5: Delete doesn't work

**Fix**: Check backend logs for database foreign key constraints

```bash
# Check if products reference this category
SELECT * FROM products WHERE category_id = 'category-id';
```

---

## 📊 NEXT STEPS

After Categories is working:

1. **Vouchers Management** (15-30 min) - Similar CRUD pattern
2. **Users Management** (30-45 min) - List users, activate/deactivate
3. **Reviews Management** (20-30 min) - Approve/reject reviews

---

## 📝 API RESPONSE EXAMPLES

### GET /api/categories (Tree)

```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "Electronics",
      "slug": "electronics",
      "image_url": "https://...",
      "children": [
        {
          "id": "cat-2",
          "name": "Smartphones",
          "slug": "smartphones",
          "children": []
        }
      ]
    }
  ]
}
```

### GET /api/categories/flat (Dropdown)

```json
{
  "categories": [
    { "id": "cat-1", "name": "Electronics", "slug": "electronics", ... },
    { "id": "cat-2", "name": "Smartphones", "slug": "smartphones", ... }
  ]
}
```

### POST /api/categories

```json
{
  "name": "New Category",
  "parent_id": null,
  "image_url": "https://..."
}
```

Response:

```json
{
  "message": "Category created",
  "category": {
    "id": "cat-123",
    "name": "New Category",
    "slug": "new-category",
    ...
  }
}
```

---

**Status**: ✅ READY FOR TESTING
