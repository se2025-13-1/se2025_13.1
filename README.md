# se2025_13.1 : 🛍️ Fashion E-Commerce Platform (Single Seller)

## 📌 Giới thiệu

Dự án **se2025_13.1** là hệ thống thương mại điện tử chuyên biệt cho thời trang (quần áo, phụ kiện) theo mô hình một nhà cung cấp (Single Seller). Hệ thống tập trung tối ưu hóa trải nghiệm người dùng (UX) với luồng mua sắm hiện đại: cho phép xem hàng tự do (Guest Browsing), đăng ký nhanh gọn và thanh toán bảo mật.

Hệ thống bao gồm:

- **Mobile App (React Native):** Dành cho khách hàng (User).
- **Web App (ReactJS):** Dành cho quản trị viên (Admin/Seller).
- **Backend (NodeJS + Express):** RESTful API hiệu suất cao.
- **Docker:** Môi trường triển khai đồng nhất.

---

## ⚙️ Công nghệ sử dụng

| Thành phần            | Công nghệ                    | Ghi chú                                            |
| :-------------------- | :--------------------------- | :------------------------------------------------- |
| **Frontend (Web)**    | ReactJS + Vite + TailwindCSS | Dashboard quản lý tốc độ cao                       |
| **Frontend (Mobile)** | React Native CLI             | Trải nghiệm Native mượt mà                         |
| **Backend**           | NodeJS + ExpressJS           | Kiến trúc Layered (Controller-Service-Repo)        |
| **Database**          | **PostgreSQL**               | **Lưu trữ toàn bộ dữ liệu (Product, User, Order)** |
| **Cache**             | Redis                        | Cache danh sách sản phẩm & Chi tiết                |
| **Deployment**        | Docker + Docker Compose      | Container hóa ứng dụng                             |
| **Authentication**    | JWT + OTP (SĐT)              | Bảo mật 2 lớp khi thanh toán                       |

---

## 🧱 Cấu trúc thư mục

```text
se2025_13.1/
│
├── backend/        # NodeJS (Express) - REST API Server
├── docker/         # Cấu hình Docker Compose (PgSQL, Redis)
├── website/        # ReactJS Web App (Admin Dashboard)
├── mobile/         # React Native App (Customer App)
└── README.md

```

## 🔐 Phân quyền & Tính năng

    Vai trò Nền tảng Chức năng chính
    Admin Web   - Quản lý danh mục đa cấp, Sản phẩm, Biến thể (Màu/Size)
                - Quản lý đơn hàng, trạng thái vận chuyển
                - Tạo mã giảm giá (Voucher)<br>- Báo cáo doanh thu

    User Mobile - Guest Mode: Xem hàng, thêm giỏ hàng không cần Login
                - Lazy Auth: Chỉ đăng nhập khi cần thiết (Checkout/Like)
                - Quản lý sổ địa chỉ, Lịch sử đơn hàng<br>- Đánh giá sản phẩm

## 🧠 Kiến trúc tổng thể

    ┌─────────────────────────┐ ┌─────────────────────────┐
    │     Mobile App (User)   │ │       Website (Admin)   │
    └────────────┬────────────┘ └────────────┬────────────┘
                 │                           │
                 └────────────┐ ┌────────────┘
                              ▼ ▼
                    ┌───────────────────────┐
                    │     Backend API       │
                    │   (NodeJS + Express)  │
                    └──────────┬────────────┘
                               │
           ┌───────────────────┴───────────────────┐
           ▼                                       ▼
        ┌──────────────┐                    ┌──────────────┐
        │ PostgreSQL   │                    │    Redis     │
        │ (Main Data)  │                    │   (Cache)    │
        └──────────────┘                    └──────────────┘

## 🧩 Cơ sở dữ liệu (PostgreSQL Schema)

Hệ thống sử dụng PostgreSQL làm cơ sở dữ liệu duy nhất, với thiết kế chuẩn hóa cao:

    Auth & Users:

        auth_users: Tài khoản, mật khẩu, xác thực OTP.

        user_profiles: Thông tin cá nhân.

        user_addresses: Sổ địa chỉ (Nhà riêng, Công ty).

    Products (Thời trang):

        categories: Danh mục đa cấp (đệ quy).

        products: Thông tin chung (Tên, mô tả, giá gốc).

        product_variants: Biến thể SKU (Màu sắc, Size, Tồn kho).

        product_images: Ảnh sản phẩm gắn theo màu sắc.

    Sales & Orders:

        carts & cart_items: Giỏ hàng (Hỗ trợ Guest Session).

        orders: Đơn hàng (Lưu Snapshot địa chỉ & giá lúc mua).

        vouchers: Mã giảm giá.

## 🚀 Hướng dẫn cài đặt (Local Development)

1️⃣ Clone dự án

    git clone https://github.com/<your-repo>/se2025_13.1.git
    cd se2025_13.1

2️⃣ Khởi động Database & Cache (Docker)

    cd docker
    docker compose up -d

Lệnh này sẽ chạy PostgreSQL (port 5432) và Redis (port 6379)

3️⃣ Cài đặt Backend

Yêu cầu: Node.js >= 16

Lưu ý: Tạo file .env trong thư mục backend dựa trên .env.example.

    cd backend
    npm install

4️⃣ Cài đặt Web Admin

    cd website
    npm install
    npm run dev

5️⃣ Cài đặt Mobile App

    Yêu cầu: Đã cài đặt môi trường React Native (Android Studio).
    cd mobile

    npm install

    # Chạy trên Android
    npx react-native start
    npx react-native run-android
