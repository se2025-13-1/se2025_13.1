# se2025_13.1

## 🛍️ E-Commerce Platform (Single Seller)

📌 Giới thiệu

    Dự án E-Commerce Platform là hệ thống bán hàng một nhà cung cấp (single seller) gồm:

    Mobile App (React Native): dành cho khách hàng (user)

    Web App (ReactJS): dành cho quản trị viên (admin/seller)

    Backend (NodeJS + Express): xử lý API, kết nối cơ sở dữ liệu

    Docker: giúp đảm bảo môi trường đồng nhất khi phát triển

    🔹 Admin = Seller: Một người quản lý duy nhất có quyền thêm sản phẩm, xem đơn hàng, và thống kê doanh thu.

⚙️ Công nghệ sử dụng

    Frontend (Web) ReactJS + Vite + TailwindCSS

    Frontend (Mobile) React Native CLI

    Backend NodeJS + ExpressJS

    Database (Quan hệ) PostgreSQL

    Database (Phi cấu trúc) MongoDB

    Cache Redis

    Containerization Docker + Docker Compose

    Authentication JWT (JSON Web Token)

    Search (mở rộng) ElasticSearch (dự kiến)

🧱 Cấu trúc thư mục

    se2025_13.1/
    │
    ├── backend/ # NodeJS (Express) - REST API
    ├── docker/ # Docker Compose config
    ├── website/ # ReactJS web app (Admin)
    ├── mobile/ # React Native mobile app (User)
    └── README.md

🔐 Phân quyền hệ thống

    Vai trò Nền tảng Chức năng chính
    Admin (Seller) Web Quản lý sản phẩm, đơn hàng, khách hàng, báo cáo
    User (Khách hàng) Mobile Xem sản phẩm, đặt hàng, thanh toán, đánh giá

📱 Ứng dụng Mobile (User)

    Home: Hiển thị danh sách sản phẩm
    Product Detail: Chi tiết sản phẩm, thêm vào giỏ hàng
    Cart: Quản lý giỏ hàng
    Checkout: Thanh toán
    Orders: Theo dõi đơn hàng
    Profile: Cập nhật thông tin cá nhân

💻 Ứng dụng Web (Admin)

    Dashboard	Thống kê doanh thu, đơn hàng
    Products	CRUD sản phẩm
    Orders	Quản lý và xử lý đơn hàng
    Customers	Danh sách khách hàng
    Reports	Báo cáo kinh doanh

🧠 Kiến trúc tổng thể

    ┌───────────────────────────────────────────────┐
    │  Mobile App (User)   │    Website (Admin)     │
    └──────────────────────┬────────────────────────┘
                           │
    ┌──────────────────────▼────────────────────────┐
    │                   Backend API                 │ NodeJS + Express + JWT
    │               (Auth, Orders, CRUD)            │
    └──────────────────────┬────────────────────────┘
    │
    ┌──────────────────────┴────────────────────────┐
    │                                               │
    ▼                                               ▼
    PostgreSQL                                    MongoDB
    (Relational)                             (Metadata, Logs)
    └──────────────────────┬────────────────────────┘
                           │
                           ▼
                         Redis
                     (Cache Layer)

🧩 Database Design (tóm tắt)

    PostgreSQL

        users – thông tin khách hàng

        products – sản phẩm

        orders – đơn hàng

        order_items – chi tiết đơn hàng

        payments – giao dịch thanh toán

        reviews – đánh giá

    MongoDB

        activity_logs – thao tác người dùng

        product_metadata – mô tả chi tiết, ảnh, tag

    Redis

        Cache sản phẩm được xem nhiều

        Lưu session và token tạm thời

🚀 Hướng dẫn cài đặt

    1️⃣ Clone repository
        git clone https://github.com/<your-repo>/se2025_13.1.git
        cd se2025_13.1

    2️⃣ Khởi động môi trường Docker
        cd docker
        docker compose up -d

    3️⃣ Cài đặt backend
        cd backend
        npm install
        npm run dev

    4️⃣ Cài đặt web (admin)
        cd website
        npm install
        npm run dev

    5️⃣ Cài đặt mobile (user)
        cd mobile
        npm install
        npx react-native start
        npx react-native run-android
