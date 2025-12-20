# 📘 API Documentation - Fashion E-commerce

Base URL:

    Local (Android Emulator): http://10.0.2.2:3000/api

    Local (Device/Web): http://<YOUR_IP>:3000/api (Ví dụ: http://192.168.1.5:3000/api)

Authentication:

    Header: Authorization: Bearer <ACCESS_TOKEN>

    Token lấy được sau khi Login/Register.

## 1. Authentication (Người dùng)

🟢 Đăng ký

    Endpoint: POST /auth/register

    Body:
    code JSON


    {
      "email": "user@example.com",
      "password": "password123",
      "name": "Nguyen Van A",
      "phone": "0987654321" // Optional
    }

🟢 Đăng nhập

    Endpoint: POST /auth/login

    Body:
    code JSON


    {
      "email": "user@example.com",
      "password": "password123"
    }



    Response: Trả về accessToken và thông tin user.

🔒 Lấy thông tin cá nhân (Profile)

    Endpoint: GET /auth/me

    Header: Cần Token.

    Response: Trả về thông tin user, bao gồm cả mảng addresses (địa chỉ).

🔒 Cập nhật hồ sơ

    Endpoint: PUT /auth/profile

    Header: Cần Token.

    Body: (Gửi các trường cần sửa)
    code JSON

    {
    "full_name": "Ten Moi",
    "phone": "09999999",
    "gender": "male", // male, female, other
    "birthday": "1999-01-01",
    "avatar_url": "https://..."
    }

## 2. Products (Sản phẩm)

🟢 Lấy danh sách & Tìm kiếm (Quan trọng)

API này dùng cho cả Trang chủ, Tìm kiếm, Lọc, Admin List.

    Endpoint: GET /products

    Query Params (Tùy chọn):

        page: Số trang (Mặc định 1).

        limit: Số lượng (Mặc định 20).

        q: Từ khóa tìm kiếm (Tên sản phẩm).

        category_id: ID danh mục.

        min_price / max_price: Khoảng giá.

        min_rating: Số sao tối thiểu (VD: 4).

        sort_by: price, rating, sold, name (Không bắt buộc).
            - Nếu không truyền → Mặc định sắp xếp theo created_at DESC (Mới nhất).

        sort_order: asc (Tăng dần), desc (Giảm dần, Mặc định).

    Ví dụ: /products?q=áo&min_price=100000&sort_by=price&sort_order=asc

🟢 Chi tiết sản phẩm

    Endpoint: GET /products/:id

🔒 Tạo sản phẩm (Admin)

    Endpoint: POST /products

    Body:
    code JSON


    {
      "name": "Áo Thun",
      "base_price": 200000,
      "category_id": "uuid...",
      "description": "Mô tả...",
      "variants": [
        { "sku": "A-RED-S", "color": "Red", "size": "S", "stock_quantity": 10, "price": 200000 }
      ],
      "images": [
        { "image_url": "https://...", "color_ref": null }, // Ảnh chung
        { "image_url": "https://...", "color_ref": "Red" } // Ảnh màu đỏ
      ]
    }

🔒 Cập nhật / Xóa (Admin)

    Update: PUT /products/:id

    Delete: DELETE /products/:id (Soft delete)

## 3. Categories (Danh mục)

🟢 Lấy cây danh mục (Menu)

    Endpoint: GET /categories

    Response: Trả về dạng cây lồng nhau (children: []). Dùng để hiển thị Menu đa cấp.

🟢 Lấy danh sách phẳng (Dropdown)

    Endpoint: GET /categories/flat

    Response: Mảng phẳng. Dùng cho Admin chọn danh mục cha.

## 4. Cart (Giỏ hàng)

🔒 Lấy giỏ hàng

    Endpoint: GET /cart

🔒 Thêm vào giỏ

    Endpoint: POST /cart

    Body:
    code JSON


    {
      "variant_id": "uuid-cua-bien-the-mau-size", // KHÔNG PHẢI product_id
      "quantity": 1
    }

🔒 Cập nhật số lượng

    Endpoint: PUT /cart/:item_id (Lưu ý: item_id là ID dòng trong giỏ hàng)

    Body: { "quantity": 5 }

🔒 Xóa khỏi giỏ

    Endpoint: DELETE /cart/:item_id

## 5. Address (Địa chỉ)

    List: GET /addresses

    Create: POST /addresses

        Body: { recipient_name, recipient_phone, province, district, ward, address_detail, is_default }

    Update: PUT /addresses/:id

    Delete: DELETE /addresses/:id

    Set Default: PATCH /addresses/:id/default

## 6. Vouchers (Mã giảm giá)

🟢 Lấy danh sách Banner (Trang chủ)

    Endpoint: GET /vouchers

    Logic: Hiển thị các mã đang chạy để user bấm "Lưu".

🔒 Lưu Voucher (Sưu tầm)

    Endpoint: POST /vouchers/:id/collect

🔒 Ví Voucher (Trang Checkout)

    Endpoint: GET /vouchers/my-wallet

    Query: ?total_amount=500000 (Gửi tổng tiền lên để Server check xem mã nào sáng/tối).

🟢 Check mã thủ công (Nhập tay)

    Endpoint: POST /vouchers/check

    Body: { "code": "SALE50", "total_amount": 200000 }

## 7. Orders (Đơn hàng) - QUAN TRỌNG ⚠️

🔒 Tạo đơn hàng (Checkout)

    Endpoint: POST /orders

    Body (Mua từ giỏ hàng):
    code JSON

{
"address_id": "uuid...",
"payment_method": "cod",
"voucher_code": "SALE50", // Optional
"type": "cart",
"cart_item_ids": ["id1", "id2"] // Hoặc [] để mua hết
}

Body (Mua ngay - Buy Now):
code JSON

    {
      "address_id": "uuid...",
      "type": "buy_now",
      "items": [
         { "variant_id": "uuid...", "quantity": 1 }
      ]
    }

🔒 Lịch sử đơn hàng (User)

    List: GET /orders

    Detail: GET /orders/:id

    Cancel: PUT /orders/:id/cancel (Chỉ hủy được khi status là pending).

🔒 Quản lý đơn hàng (Admin)

    List All: GET /orders/admin/all

    Update Status: PUT /orders/:id/status (Body: { "status": "shipping" })

## 8. Reviews (Đánh giá)

🔒 Viết đánh giá

    Endpoint: POST /reviews

    Body:
    code JSON


    {
      "order_item_id": "uuid-trong-don-hang", // Bắt buộc
      "rating": 5,
      "comment": "Hàng đẹp",
      "images": ["url1", "url2"]
    }

🟢 Xem đánh giá (Trang chi tiết SP)

    Endpoint: GET /reviews/product/:productId

## 9. Upload (Tải ảnh)

🔒 Upload ảnh

    Endpoint: POST /upload

    Content-Type: multipart/form-data

    Key: image (File).

    Response: { "url": "https://supabase..." }

## 10. Statistics (Admin Dashboard)

    Tổng quan: GET /stats/dashboard

    Biểu đồ: GET /stats/revenue?range=7

    Top sản phẩm: GET /stats/top-products

    Trạng thái đơn: GET /stats/order-status

## 11. Notifications (Thông báo)

    Đăng ký Token: POST /notifications/device (Body: { fcm_token, platform })

    Lấy danh sách: GET /notifications

    Đánh dấu đã đọc: PUT /notifications/:id/read
