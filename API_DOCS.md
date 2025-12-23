# 📘 API Documentation - DoubleD Fashion

### Base URL:

    Local (Android Emulator): http://10.0.2.2:3000/api

    Local (Device/Web): http://<YOUR_IP>:3000/api (Ví dụ: http://192.168.1.5:3000/api)

### Authentication:

    Header: Authorization: Bearer <ACCESS_TOKEN>

    Token lấy được sau khi Login/Register.

### Ký hiệu:

    🟢 Public: Không cần đăng nhập.

    🔒 User: Cần Token User.

    🛡️ Admin: Cần Token Admin.

## 1. Authentication (Xác thực)

🟢 Đăng ký

    Endpoint: POST /auth/register

    Body: { "email": "...", "password": "...", "name": "...", "phone": "..." }

🟢 Đăng nhập (Email/Pass)

    Endpoint: POST /auth/login

    Body: { "email": "...", "password": "..." }

🟢 Đăng nhập bằng Firebase (Google)

    Endpoint: POST /auth/firebase

    Body: { "idToken": "token_tu_firebase_client" }

🟢 Quên mật khẩu

    Endpoint: POST /auth/forgot-password

    Body: { "email": "..." }

🟢 Đặt lại mật khẩu

    Endpoint: POST /auth/reset-password

    Body: { "email": "...", "otp": "...", "newPassword": "..." }

🔒 Lấy thông tin cá nhân (Profile)

    Endpoint: GET /auth/me

🔒 Cập nhật hồ sơ

    Endpoint: PUT /auth/profile

    Body: { "full_name": "...", "phone": "...", "gender": "...", "birthday": "...", "avatar_url": "..." }

🔒 Đăng xuất

    Endpoint: POST /auth/logout

## 2. Products (Sản phẩm)

🟢 Lấy danh sách & Tìm kiếm

    Endpoint: GET /products

    Query: page, limit, q (keyword), category_id, min_price, max_price, sort_by, sort_order.

🟢 Chi tiết sản phẩm

    Endpoint: GET /products/:id

🛡️ Tạo sản phẩm (Admin)

    Endpoint: POST /products

    Body: JSON chứa thông tin sản phẩm, variants, images.

🛡️ Cập nhật sản phẩm (Admin)

    Endpoint: PUT /products/:id

🛡️ Xóa sản phẩm (Admin - Soft Delete)

    Endpoint: DELETE /products/:id

🛡️ Sửa lỗi Slug (Admin - Utility)

    Endpoint: POST /products/fix-slugs

## 3. Categories (Danh mục)

🟢 Lấy cây danh mục (Menu App)

    Endpoint: GET /categories

    Response: Dạng cây (nested children).

🟢 Lấy danh sách phẳng (Dropdown Admin)

    Endpoint: GET /categories/flat

🛡️ Tạo danh mục (Admin)

    Endpoint: POST /categories

    Body: { "name": "...", "parent_id": "..." }

🛡️ Cập nhật danh mục (Admin)

    Endpoint: PUT /categories/:id

🛡️ Xóa danh mục (Admin)

    Endpoint: DELETE /categories/:id

## 4. Cart (Giỏ hàng)

🔒 Lấy giỏ hàng

    Endpoint: GET /cart

🔒 Thêm vào giỏ

    Endpoint: POST /cart

    Body: { "variant_id": "...", "quantity": 1 }

🔒 Cập nhật số lượng

    Endpoint: PUT /cart/:item_id

    Body: { "quantity": 5 }

🔒 Xóa khỏi giỏ

    Endpoint: DELETE /cart/:item_id

## 5. Address (Địa chỉ)

🔒 Lấy danh sách

    Endpoint: GET /addresses

🔒 Thêm địa chỉ

    Endpoint: POST /addresses

    Body: { "recipient_name": "...", "recipient_phone": "...", "province": "...", "district": "...", "ward": "...", "address_detail": "...", "is_default": true/false }

🔒 Cập nhật địa chỉ

    Endpoint: PUT /addresses/:id

🔒 Xóa địa chỉ

    Endpoint: DELETE /addresses/:id

🔒 Đặt làm mặc định

    Endpoint: PATCH /addresses/:id/default

## 6. Vouchers (Mã giảm giá)

🟢 Kiểm tra mã (Check Code)

    Endpoint: POST /vouchers/check

    Body: { "code": "SALE50", "total_amount": 200000 }

🟢 Lấy danh sách Voucher khả dụng (Banner)

    Endpoint: GET /vouchers

🛡️ Lấy chi tiết Voucher (Admin)

    Endpoint: GET /vouchers/:id

🛡️ Tạo Voucher (Admin)

    Endpoint: POST /vouchers

    Body: { "code": "...", "discount_type": "percent/fixed", "discount_value": 10, ... }

🛡️ Cập nhật Voucher (Admin)

    Endpoint: PUT /vouchers/:id

🛡️ Xóa Voucher (Admin)

    Endpoint: DELETE /vouchers/:id

## 7. Orders (Đơn hàng) - QUAN TRỌNG ⚠️

🔒 Tạo đơn hàng (Checkout)

    Endpoint: POST /orders

    Body: { "address_id": "...", "payment_method": "cod", "voucher_code": "...", "type": "cart/buy_now", "items": [...] }

🔒 Lịch sử đơn hàng (User)

    Endpoint: GET /orders

🔒 Chi tiết đơn hàng (User)

    Endpoint: GET /orders/:id

🔒 Hủy đơn hàng (User - Pending only)

    Endpoint: PUT /orders/:id/cancel

🔒 Xác nhận đã nhận hàng (User)

    Endpoint: PUT /orders/:id/complete

🛡️ Lấy tất cả đơn hàng (Admin)

    Endpoint: GET /orders/admin/all

🛡️ Chi tiết đơn hàng (Admin)

    Endpoint: GET /orders/admin/:id

🛡️ Cập nhật trạng thái (Admin)

    Endpoint: PUT /orders/:id/status

    Body: { "status": "shipping" }

## 8. Reviews (Đánh giá)

🔒 Viết đánh giá

    Endpoint: POST /reviews

    Body: { "order_item_id": "...", "rating": 5, "comment": "...", "images": [] }

🟢 Xem đánh giá theo Sản phẩm

    Endpoint: GET /reviews/product/:productId

🔒 Xem đánh giá theo Đơn hàng (User check lịch sử)

    Endpoint: GET /reviews/order/:orderId

## 9. Upload (Tải ảnh)

🔒 Upload Avatar (User)

    Endpoint: POST /upload/avatar

    Format: multipart/form-data, Key: image.

🛡️ Upload ảnh Sản phẩm (Admin)

    Endpoint: POST /upload

    Format: multipart/form-data, Key: image.

## 10. Statistics (Admin Dashboard)

🛡️ Tổng quan Dashboard

    Endpoint: GET /stats/dashboard

🛡️ Biểu đồ doanh thu

    Endpoint: GET /stats/revenue

    Query: ?range=7 (hoặc 30).

🛡️ Top sản phẩm

    Endpoint: GET /stats/top-products

🛡️ Trạng thái đơn hàng

    Endpoint: GET /stats/order-status

## 11. Notifications (Thông báo)

🔒 Đăng ký Token thiết bị (FCM)

    Endpoint: POST /notifications/device

    Body: { "fcm_token": "...", "platform": "android/ios" }

🔒 Lấy danh sách thông báo

    Endpoint: GET /notifications

🔒 Đánh dấu đã đọc

    Endpoint: PUT /notifications/:id/read

## 12. Wishlist (Yêu thích)

🔒 Toggle Yêu thích (Like/Unlike)

    Endpoint: POST /wishlist/toggle

    Body: { "product_id": "..." }

🔒 Lấy danh sách yêu thích

    Endpoint: GET /wishlist

🔒 Lấy danh sách ID (Để tô đỏ tim)

    Endpoint: GET /wishlist/ids
