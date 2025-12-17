# ✅ VOUCHERS FRONTEND-BACKEND COMPATIBILITY CHECK

## 🔄 API Flow Validation

### 1. GET /api/vouchers (List All)

**Backend Response Format:**

```javascript
// voucher.controller.js - getAll()
return res.json({ vouchers: [...array...] })
```

**Frontend Handling:**

```typescript
// apiClient.ts - request()
if (body?.vouchers) responseData = body.vouchers; // ✅ NORMALIZED

// VoucherList.tsx - fetchVouchers()
const res = await apiClient.getVouchers();
if (res.data && Array.isArray(res.data)) {
  // ✅ res.data = array
  setVouchers(res.data);
}
```

✅ **Status**: COMPATIBLE

---

### 2. POST /api/vouchers (Create)

**Frontend Request:**

```typescript
const payload = {
  code: "SUMMER20", // string
  description: "...", // string
  discount_type: "percent", // "percent" | "fixed"
  discount_value: 20, // number
  min_order_value: 100000, // number (default: 0)
  max_discount_amount: 500000, // number (optional)
  start_date: "2025-06-01", // ISO string
  end_date: "2025-08-31", // ISO string
  usage_limit: 100, // number (default: 100)
  limit_per_user: 1, // number (default: 1)
};
```

**Backend Expectation:**

```javascript
const {
  code, // required
  description, // optional
  discount_type, // required
  discount_value, // required
  min_order_value, // optional (default: 0)
  max_discount_amount, // optional
  start_date, // optional
  end_date, // optional
  usage_limit, // optional
  limit_per_user, // optional
} = req.body;

// Validation
if (!code || !discount_type || !discount_value) {
  return res.status(400).json({ error: "..." });
}

// Processing
await VoucherService.createVoucher({
  code: code.toUpperCase(),
  description,
  discount_type,
  discount_value,
  min_order_value: min_order_value || 0,
  max_discount_amount,
  start_date,
  end_date,
  usage_limit,
  limit_per_user: limit_per_user || 1,
});
```

**Field Type Matching:**
| Field | Frontend | Backend | Type |
|-------|----------|---------|------|
| code | string | string | ✅ |
| description | string | string | ✅ |
| discount_type | "percent"\|"fixed" | string (checked) | ✅ |
| discount_value | number (parseFloat) | number | ✅ |
| min_order_value | number (parseInt) | number | ✅ |
| max_discount_amount | number\|undefined | any | ✅ |
| start_date | ISO string | string | ✅ |
| end_date | ISO string | string | ✅ |
| usage_limit | number (parseInt) | number | ✅ |
| limit_per_user | number (parseInt) | number | ✅ |

✅ **Status**: FULLY COMPATIBLE

---

### 3. PUT /api/vouchers/:id (Update)

**Frontend Request:**

```typescript
const payload = { ...partialUpdates... };
await apiClient.updateVoucher(editingVoucher.id, payload);
```

**Backend Handler:**

```javascript
async update(req, res) {
  const { id } = req.params;
  const updates = req.body; // accepts any fields

  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }

  const voucher = await VoucherService.updateVoucher(id, updates);
}
```

**Repository Implementation:**

```javascript
async update(id, data) {
  const updates = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = [
    "code", "description", "discount_type", "discount_value",
    "min_order_value", "max_discount_amount", "start_date", "end_date",
    "usage_limit", "limit_per_user", "is_active",
  ];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  // Dynamic SQL UPDATE with only specified fields
}
```

✅ **Status**: FULLY COMPATIBLE (Partial updates supported)

---

### 4. DELETE /api/vouchers/:id (Delete)

**Frontend Request:**

```typescript
await apiClient.deleteVoucher(id);
```

**Backend Response:**

```javascript
const deleted = await VoucherService.deleteVoucher(id);
if (!deleted) return res.status(404).json({ error: "Voucher not found" });
return res.json({ message: "Voucher deleted" });
```

✅ **Status**: COMPATIBLE

---

### 5. POST /api/vouchers/check (Public - Validate)

**Frontend Call:**

```typescript
async checkVoucher(code: string, total_amount: number)
  return this.request("/vouchers/check", {
    method: "POST",
    body: JSON.stringify({ code, total_amount }),
  });
```

**Backend Handler:**

```javascript
async check(req, res) {
  const { code, total_amount } = req.body;

  if (!code || !total_amount) {
    return res.status(400).json({ error: "..." });
  }

  const result = await VoucherService.validateAndCalculate(code, total_amount);
  return res.json({
    message: "Mã hợp lệ",
    data: result,
  });
}
```

**Response:**

```json
{
  "message": "Mã hợp lệ",
  "data": {
    "voucherId": "uuid",
    "code": "SUMMER20",
    "discountAmount": 100000
  }
}
```

✅ **Status**: COMPATIBLE (Route moved before admin middleware ✅)

---

## 🔐 Authentication & Authorization

### Admin Endpoints

```javascript
router.use(requireAuth, requireAdmin);
```

**Protected:**

- GET /api/vouchers
- GET /api/vouchers/:id
- POST /api/vouchers
- PUT /api/vouchers/:id
- DELETE /api/vouchers/:id

**Public:**

- POST /api/vouchers/check ✅ (Moved outside middleware)

✅ **Status**: CORRECT CONFIGURATION

---

## 📊 Data Validation Summary

### Frontend Validation

```typescript
if (!formData.code.trim() || !formData.discount_value) {
  setFormError("Code and discount value are required");
  return;
}
```

### Backend Validation

```javascript
if (!code || !discount_type || !discount_value) {
  return res
    .status(400)
    .json({ error: "Code, discount_type, discount_value are required" });
}
```

| Check                   | Frontend | Backend | Match |
| ----------------------- | -------- | ------- | ----- |
| code required           | ✅       | ✅      | ✅    |
| discount_value required | ✅       | ✅      | ✅    |
| discount_type required  | ❌       | ✅      | ⚠️    |

⚠️ **IMPROVEMENT**: Frontend should validate discount_type is selected

---

## 🔄 Response Data Format

### Create/Update Response

```json
{
  "message": "Voucher created",
  "voucher": {
    "id": "...",
    "code": "SUMMER20",
    "description": "...",
    "discount_type": "percent",
    "discount_value": "20",
    "min_order_value": "100000",
    "max_discount_amount": "500000",
    "start_date": "2025-06-01T00:00:00Z",
    "end_date": "2025-08-31T23:59:59Z",
    "usage_limit": 100,
    "used_count": 0,
    "limit_per_user": 1,
    "collected_count": 0,
    "is_active": true,
    "created_at": "2025-12-17T10:00:00Z"
  }
}
```

**apiClient normalization:**

- Backend returns: `{ voucher, message }`
- apiClient extracts: `body?.voucher` ❌ **NOT HANDLED**

⚠️ **ISSUE FOUND**: Single voucher responses are not normalized!

---

## 🚨 ISSUES FOUND & FIXED

### ✅ FIXED #1: /check endpoint not public

- **Issue**: `router.post("/check")` was AFTER `router.use(requireAuth, requireAdmin)`
- **Fix**: Moved to BEFORE middleware
- **Status**: ✅ FIXED

### ✅ FIXED #2: Response normalization missing vouchers

- **Issue**: apiClient didn't normalize `{ vouchers }` response
- **Fix**: Added `else if (body?.vouchers) responseData = body.vouchers;`
- **Status**: ✅ FIXED

### ⚠️ TODO #3: Single voucher response normalization

- **Issue**: `{ voucher }` response from create/update not normalized
- **Status**: Need to add to apiClient
- **Impact**: After create/update, response.data won't contain voucher object

### ⚠️ TODO #4: Frontend discount_type validation

- **Issue**: Frontend doesn't validate discount_type is selected
- **Status**: Should add validation before submit
- **Impact**: User can submit form without selecting type

---

## 📋 VERIFICATION CHECKLIST

- ✅ POST /check is public (no auth required)
- ✅ GET /api/vouchers returns { vouchers: [...] }
- ✅ apiClient normalizes vouchers response
- ✅ All CRUD endpoints require admin auth
- ✅ Field types match (string, number, etc)
- ✅ Optional fields handled correctly
- ⚠️ Single voucher response needs normalization
- ⚠️ discount_type validation should be added to FE

---

## 🔧 RECOMMENDED IMPROVEMENTS

### 1. Add voucher response normalization to apiClient

```typescript
else if (body?.voucher) responseData = body.voucher;
```

### 2. Add discount_type validation to frontend

```typescript
if (!formData.discount_type) {
  setFormError("Discount type is required");
  return;
}
```

### 3. Consider consistent response format in backend

- All list endpoints: `{ [items]: [...] }`
- All detail endpoints: `{ item: {...} }`
- Consider using `{ data: [...] }` for consistency

---

**Overall Status**: 🟡 **MOSTLY COMPATIBLE - Minor fixes recommended**
