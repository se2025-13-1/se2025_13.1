# Website Schema Alignment Update

## Overview

The website admin panel has been realigned to match the PostgreSQL database schema. All TypeScript interfaces and React components now use the correct field names and data structures.

## Changes Made

### 1. **types.ts** - Updated All Interfaces

Converted from camelCase to snake_case to match database schema:

#### Product Model

- `categoryId` → `category_id`
- `price` → `base_price`
- `image` → `images` (array of ProductImage objects)
- Added fields: `slug`, `is_active`, `rating_average`, `review_count`
- Added ProductImage interface with `image_url`, `color_ref`, `display_order`

#### ProductVariant Model

- `stock` → `stock_quantity`
- Added fields: `product_id`, `price`, `created_at`, `updated_at`, `sku`
- Now fully matches database product_variants table

#### Order Model

- `customerName` → `shipping_info.recipient_name`
- `customerPhone` → `shipping_info.recipient_phone`
- `address` → `shipping_info` (full object)
- `totalAmount` → `total_amount`
- `createdAt` → `created_at`
- Added fields: `subtotal_amount`, `shipping_fee`, `discount_amount`, `payment_method`, `payment_status`, `voucher_id`

#### OrderStatus Enum

- Changed values from PascalCase to lowercase:
  - `"Pending"` → `"pending"`
  - `"Completed"` → `"completed"`
  - `"Shipping"` → `"shipping"`
  - `"Cancelled"` → `"cancelled"`
  - Added: `"returned"`

### 2. **App.tsx** - Updated Data Handling

- Fixed stats calculation:
  - `o.totalAmount` → `o.total_amount`
  - `v.stock` → `v.stock_quantity`
  - `o.status === OrderStatus.COMPLETED` (now using correct enum values)

### 3. **ProductList.tsx** - Updated Display Logic

- Changed image source: `product.image` → `product.images[0].image_url`
- Updated price display: `product.price` → `product.base_price`
- Updated stock calculation: `v.stock` → `v.stock_quantity`
- Added safe optional chaining for variants and images

### 4. **OrderList.tsx** - Updated Order Display

- Changed customer info from direct fields to nested object:
  - `order.customerName` → `order.shipping_info.recipient_name`
  - `order.customerPhone` → `order.shipping_info.recipient_phone`
- Updated amount field: `order.totalAmount` → `order.total_amount`
- Updated date field: `order.createdAt` → `order.created_at`
- Shortened order ID display (first 8 chars) since UUIDs are long

### 5. **ProductForm.tsx** - Updated Form Handling

- Added slug field for URL-friendly product names
- Changed price field: `price` → `basePrice`
- Updated variant form:
  - `vStock` → `vStockQuantity`
  - Added `vPrice` field for variant-specific pricing
  - Updated stock display: `v.stock` → `v.stock_quantity`
- Updated product submission structure to match schema

## Database Field Mappings

| Frontend Field | Database Field | Type          |
| -------------- | -------------- | ------------- |
| name           | name           | VARCHAR(255)  |
| slug           | slug           | VARCHAR(300)  |
| description    | description    | TEXT          |
| base_price     | base_price     | NUMERIC(15,2) |
| category_id    | category_id    | UUID          |
| is_active      | is_active      | BOOLEAN       |
| rating_average | rating_average | NUMERIC(3,1)  |
| review_count   | review_count   | INT           |

### ProductVariant Table

| Frontend       | Database       | Type          |
| -------------- | -------------- | ------------- |
| sku            | sku            | VARCHAR(50)   |
| color          | color          | VARCHAR(50)   |
| size           | size           | VARCHAR(20)   |
| price          | price          | NUMERIC(15,2) |
| stock_quantity | stock_quantity | INT           |

### Order Table

| Frontend       | Database       | Type          |
| -------------- | -------------- | ------------- |
| shipping_info  | shipping_info  | JSONB         |
| total_amount   | total_amount   | NUMERIC(15,2) |
| payment_method | payment_method | VARCHAR(50)   |
| payment_status | payment_status | VARCHAR(50)   |
| status         | status         | VARCHAR(50)   |

## Testing Checklist

- [ ] Products load correctly with new field structure
- [ ] Product creation works with slug and base_price
- [ ] Product variants display stock_quantity correctly
- [ ] Orders display shipping info from nested object
- [ ] Dashboard stats calculate correctly with new fields
- [ ] Order status updates work with lowercase enum values

## Notes

- All field names now follow snake_case convention to match PostgreSQL database
- The website is now fully aligned with the database schema defined in `schema.sql`
- No breaking changes to API contracts - the apiClient remains unchanged
- Backend API should return data in the same structure as the database
