# 📚 API Documentation - DoubleD Fashion

## 🌐 Base URL & Authentication

### Base URL

```
Local (Android Emulator): http://10.0.2.2:3000/api
Local (Device/Web):       http://<YOUR_IP>:3000/api
Production:               http://se2025fashion.duckdns.org:3000/api
```

### Authentication Header

```
Authorization: Bearer <ACCESS_TOKEN>
```

Token được lấy sau khi đăng nhập/đăng ký thành công.

### Phân quyền

- 🟢 **Public** - Không cần token
- 🔒 **User** - Cần token người dùng
- 🛡️ **Admin** - Cần token quản trị viên

---

## 1️⃣ Authentication & User Management

| Method | Endpoint                | Auth | Mô tả                       |
| ------ | ----------------------- | ---- | --------------------------- |
| `POST` | `/auth/register`        | 🟢   | Đăng ký tài khoản mới       |
| `POST` | `/auth/login`           | 🟢   | Đăng nhập email/password    |
| `POST` | `/auth/firebase`        | 🟢   | Đăng nhập Google (Firebase) |
| `POST` | `/auth/forgot-password` | 🟢   | Gửi OTP quên mật khẩu       |
| `POST` | `/auth/reset-password`  | 🟢   | Đặt lại mật khẩu với OTP    |
| `GET`  | `/auth/me`              | 🔒   | Lấy thông tin profile       |
| `PUT`  | `/auth/profile`         | 🔒   | Cập nhật thông tin cá nhân  |
| `POST` | `/auth/logout`          | 🔒   | Đăng xuất                   |

**Request Body Examples:**

```json
// Register
{ "email": "user@example.com", "password": "123456", "name": "Nguyen Van A", "phone": "0901234567" }

// Login
{ "email": "user@example.com", "password": "123456" }

// Update Profile
{ "full_name": "Nguyen Van A", "phone": "0901234567", "gender": "male", "birthday": "1990-01-01", "avatar_url": "..." }
```

---

## 2️⃣ Products & Categories

### Products

| Method   | Endpoint        | Auth | Mô tả                                              |
| -------- | --------------- | ---- | -------------------------------------------------- |
| `GET`    | `/products`     | 🟢   | Danh sách sản phẩm (có filter, search, pagination) |
| `GET`    | `/products/:id` | 🟢   | Chi tiết sản phẩm                                  |
| `POST`   | `/products`     | 🛡️   | Tạo sản phẩm mới                                   |
| `PUT`    | `/products/:id` | 🛡️   | Cập nhật sản phẩm                                  |
| `DELETE` | `/products/:id` | 🛡️   | Xóa sản phẩm (soft delete)                         |

**Query Parameters (GET /products):**

- `page`, `limit` - Phân trang
- `q` - Từ khóa tìm kiếm
- `category_id` - Lọc theo danh mục
- `min_price`, `max_price` - Lọc theo giá
- `sort_by`, `sort_order` - Sắp xếp (price, created_at)

### Categories

| Method   | Endpoint           | Auth | Mô tả                      |
| -------- | ------------------ | ---- | -------------------------- |
| `GET`    | `/categories`      | 🟢   | Cây danh mục (nested)      |
| `GET`    | `/categories/flat` | 🟢   | Danh sách phẳng (dropdown) |
| `POST`   | `/categories`      | 🛡️   | Tạo danh mục               |
| `PUT`    | `/categories/:id`  | 🛡️   | Cập nhật danh mục          |
| `DELETE` | `/categories/:id`  | 🛡️   | Xóa danh mục               |

---

## 3️⃣ Shopping Cart

| Method   | Endpoint         | Auth | Mô tả                 |
| -------- | ---------------- | ---- | --------------------- |
| `GET`    | `/cart`          | 🔒   | Lấy giỏ hàng hiện tại |
| `POST`   | `/cart`          | 🔒   | Thêm sản phẩm vào giỏ |
| `PUT`    | `/cart/:item_id` | 🔒   | Cập nhật số lượng     |
| `DELETE` | `/cart/:item_id` | 🔒   | Xóa khỏi giỏ hàng     |

**Request Body:**

```json
// Add to cart
{ "variant_id": "uuid", "quantity": 1 }

// Update quantity
{ "quantity": 5 }
```

---

## 4️⃣ Orders & Checkout

### User Orders

| Method | Endpoint               | Auth | Mô tả                     |
| ------ | ---------------------- | ---- | ------------------------- |
| `POST` | `/orders`              | 🔒   | Tạo đơn hàng (checkout)   |
| `GET`  | `/orders`              | 🔒   | Lịch sử đơn hàng          |
| `GET`  | `/orders/:id`          | 🔒   | Chi tiết đơn hàng         |
| `PUT`  | `/orders/:id/cancel`   | 🔒   | Hủy đơn (chỉ khi pending) |
| `PUT`  | `/orders/:id/complete` | 🔒   | Xác nhận đã nhận hàng     |

### Admin Orders

| Method | Endpoint             | Auth | Mô tả               |
| ------ | -------------------- | ---- | ------------------- |
| `GET`  | `/orders/admin/all`  | 🛡️   | Tất cả đơn hàng     |
| `GET`  | `/orders/admin/:id`  | 🛡️   | Chi tiết đơn hàng   |
| `PUT`  | `/orders/:id/status` | 🛡️   | Cập nhật trạng thái |

**Checkout Request:**

```json
{
  "address_id": "uuid",
  "payment_method": "cod",
  "voucher_code": "SALE50",
  "type": "cart", // hoặc "buy_now"
  "items": [{ "variant_id": "uuid", "quantity": 2 }] // chỉ dùng khi type = "buy_now"
}
```

**Order Status Flow:**

```
pending → confirmed → preparing → shipping → delivered → completed
                                           ↓
                                      cancelled
```

---

## 5️⃣ Addresses

| Method   | Endpoint                 | Auth | Mô tả                    |
| -------- | ------------------------ | ---- | ------------------------ |
| `GET`    | `/addresses`             | 🔒   | Danh sách địa chỉ        |
| `POST`   | `/addresses`             | 🔒   | Thêm địa chỉ mới         |
| `PUT`    | `/addresses/:id`         | 🔒   | Cập nhật địa chỉ         |
| `DELETE` | `/addresses/:id`         | 🔒   | Xóa địa chỉ              |
| `PATCH`  | `/addresses/:id/default` | 🔒   | Đặt làm địa chỉ mặc định |

**Request Body:**

```json
{
  "recipient_name": "Nguyen Van A",
  "recipient_phone": "0901234567",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "address_detail": "123 Đường ABC",
  "is_default": true
}
```

---

## 6️⃣ Vouchers & Promotions

| Method   | Endpoint          | Auth | Mô tả                      |
| -------- | ----------------- | ---- | -------------------------- |
| `GET`    | `/vouchers`       | 🟢   | Danh sách voucher khả dụng |
| `POST`   | `/vouchers/check` | 🟢   | Kiểm tra mã voucher        |
| `GET`    | `/vouchers/:id`   | 🛡️   | Chi tiết voucher           |
| `POST`   | `/vouchers`       | 🛡️   | Tạo voucher mới            |
| `PUT`    | `/vouchers/:id`   | 🛡️   | Cập nhật voucher           |
| `DELETE` | `/vouchers/:id`   | 🛡️   | Xóa voucher                |

**Check Voucher:**

```json
{
  "code": "SALE50",
  "total_amount": 200000
}
```

---

## 7️⃣ Reviews & Ratings

| Method | Endpoint                      | Auth | Mô tả                             |
| ------ | ----------------------------- | ---- | --------------------------------- |
| `POST` | `/reviews`                    | 🔒   | Viết đánh giá (verified purchase) |
| `GET`  | `/reviews/product/:productId` | 🟢   | Xem đánh giá theo sản phẩm        |
| `GET`  | `/reviews/order/:orderId`     | 🔒   | Xem đánh giá theo đơn hàng        |

**Create Review:**

```json
{
  "order_item_id": "uuid",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!",
  "images": ["url1", "url2"]
}
```

---

## 8️⃣ Wishlist (Yêu thích)

| Method | Endpoint           | Auth | Mô tả                          |
| ------ | ------------------ | ---- | ------------------------------ |
| `POST` | `/wishlist/toggle` | 🔒   | Thêm/Bỏ yêu thích              |
| `GET`  | `/wishlist`        | 🔒   | Danh sách sản phẩm yêu thích   |
| `GET`  | `/wishlist/ids`    | 🔒   | Danh sách ID (để highlight UI) |

---

## 9️⃣ Notifications

| Method | Endpoint                  | Auth | Mô tả               |
| ------ | ------------------------- | ---- | ------------------- |
| `POST` | `/notifications/device`   | 🔒   | Đăng ký FCM token   |
| `GET`  | `/notifications`          | 🔒   | Danh sách thông báo |
| `PUT`  | `/notifications/:id/read` | 🔒   | Đánh dấu đã đọc     |

**Register Device:**

```json
{
  "fcm_token": "firebase_cloud_messaging_token",
  "platform": "android" // hoặc "ios"
}
```

---

## 🔟 File Upload

| Method | Endpoint         | Auth | Mô tả               |
| ------ | ---------------- | ---- | ------------------- |
| `POST` | `/upload/avatar` | 🔒   | Upload ảnh đại diện |
| `POST` | `/upload`        | 🛡️   | Upload ảnh sản phẩm |

**Format:** `multipart/form-data` với key `image`

---

## 1️⃣1️⃣ Admin Statistics & Dashboard

| Method | Endpoint                 | Auth | Mô tả                              |
| ------ | ------------------------ | ---- | ---------------------------------- |
| `GET`  | `/stats/dashboard`       | 🛡️   | Tổng quan dashboard                |
| `GET`  | `/stats/revenue?range=7` | 🛡️   | Biểu đồ doanh thu (7 hoặc 30 ngày) |
| `GET`  | `/stats/top-products`    | 🛡️   | Top sản phẩm bán chạy              |
| `GET`  | `/stats/order-status`    | 🛡️   | Phân bố trạng thái đơn hàng        |

---

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🔐 Error Codes

| Code  | Meaning                                                       |
| ----- | ------------------------------------------------------------- |
| `400` | Bad Request - Dữ liệu không hợp lệ                            |
| `401` | Unauthorized - Chưa đăng nhập hoặc token hết hạn              |
| `403` | Forbidden - Không có quyền truy cập                           |
| `404` | Not Found - Không tìm thấy tài nguyên                         |
| `409` | Conflict - Xung đột dữ liệu (email đã tồn tại, hết hàng, ...) |
| `500` | Internal Server Error - Lỗi server                            |

---

## 💡 Notes

- Tất cả timestamps sử dụng định dạng ISO 8601: `2024-01-01T00:00:00.000Z`
- Tất cả ID sử dụng UUID v4
- File upload giới hạn 5MB/file
- Rate limiting: 100 requests/phút cho mỗi IP
- Token hết hạn sau 7 ngày (có thể refresh)
