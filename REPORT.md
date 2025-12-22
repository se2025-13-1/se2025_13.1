# GOALS AND OBJECTIVES

## Đề tài: Xây dựng Hệ thống Thương mại Điện tử Thời trang (Fashion E-commerce System)

### 1. Project Goals (Mục đích dự án)

Dự án được xây dựng với tầm nhìn tạo ra một giải pháp thương mại điện tử toàn diện, hiện đại, tập trung vào trải nghiệm mua sắm liền mạch cho người dùng cuối và khả năng quản trị hiệu quả cho nhà bán hàng.

Mục đích cốt lõi của dự án bao gồm:

- **Giải quyết bài toán thực tế:** Cung cấp một nền tảng mua sắm quần áo trực tuyến với đầy đủ các quy trình nghiệp vụ từ tìm kiếm, đặt hàng, thanh toán đến giao vận, giải quyết các vấn đề về quản lý biến thể sản phẩm (màu sắc, kích cỡ) và tồn kho thực tế.
- **Làm chủ công nghệ:** Áp dụng các công nghệ lập trình hiện đại (Node.js, React Native, Docker) để xây dựng hệ thống có khả năng mở rộng (Scalability), hiệu năng cao (Performance) và dễ bảo trì (Maintainability).
- **Hoàn thiện quy trình phát triển:** Thực hành quy trình phát triển phần mềm chuyên nghiệp (SDLC), từ thiết kế Cơ sở dữ liệu (ERD), xây dựng RESTful API, đến triển khai ứng dụng (Deployment).

### 2. Project Objectives (Mục tiêu cụ thể)

Để đạt được các mục đích trên, dự án đặt ra các mục tiêu cụ thể được chia theo từng phân hệ như sau:

#### 2.1. Backend & Database (Hệ thống lõi)

- **Kiến trúc hệ thống:** Xây dựng RESTful API sử dụng **Node.js** và **Express**, tuân thủ mô hình Layered Architecture (Controller - Service - Repository) để đảm bảo code sạch và dễ mở rộng.
- **Cơ sở dữ liệu:** Thiết kế và triển khai CSDL quan hệ **PostgreSQL** chuẩn hóa, xử lý tốt các quan hệ phức tạp (Sản phẩm - Biến thể - Hình ảnh). Sử dụng Indexing để tối ưu tốc độ truy vấn.
- **Hiệu năng & Caching:** Tích hợp **Redis** để cache các dữ liệu truy cập thường xuyên (Danh mục, Sản phẩm, Thống kê), giảm tải cho Database chính.
- **Bảo mật:**
  - Triển khai cơ chế xác thực (Authentication) bằng **JWT (JSON Web Token)**.
  - Mã hóa mật khẩu người dùng với **bcrypt**.
  - Phân quyền (Authorization) chặt chẽ giữa User và Admin.
- **Nghiệp vụ phức tạp:** Xử lý thành công bài toán **Transaction** trong quy trình đặt hàng (Order Placement) để đảm bảo tính toàn vẹn dữ liệu kho hàng và tài chính.

#### 2.2. Mobile Application (Dành cho Khách hàng)

- **Công nghệ lõi:** Xây dựng ứng dụng di động trên nền tảng **React Native**, tích hợp sâu các **Native Modules** (Android/iOS) để xử lý các tác vụ phức tạp như Push Notification (Firebase), OAuth (Google/Facebook SDK) và Local Storage.
- **Quản lý trạng thái (State Management):** Sử dụng **Context API** để quản lý trạng thái toàn cục (Authentication, Cart, Theme), đảm bảo luồng dữ liệu nhất quán mà không cần phụ thuộc vào thư viện bên thứ 3 nặng nề như Redux.
- **Giao diện (UI/UX):**
  - Thiết kế giao diện tùy biến cao (Custom UI) sử dụng **StyleSheet** thuần, tối ưu hóa hiệu năng render so với các thư viện UI Kit có sẵn.
  - Hiện thực hóa luồng **"Lazy Auth"** và kỹ thuật **Infinite Scroll** để tối ưu trải nghiệm người dùng.
- **Tính năng:**
  - Tìm kiếm và Bộ lọc sản phẩm nâng cao.
  - Quản lý Giỏ hàng, Sổ địa chỉ và Ví Voucher.
  - Tích hợp **Firebase Cloud Messaging (FCM)** để nhận thông báo đẩy thời gian thực.

#### 2.3. Web Admin Dashboard (Dành cho Quản trị viên)

- **Công nghệ:** Xây dựng Single Page Application (SPA) sử dụng **ReactJS**, **Vite** và **TailwindCSS**.
- **Trực quan hóa dữ liệu:** Tích hợp thư viện **Recharts** để vẽ các biểu đồ thống kê (Doanh thu, Tỷ lệ đơn hàng) trực quan và có tính tương tác cao.
- **Xử lý Form:** Xây dựng các form nhập liệu phức tạp (Sản phẩm đa biến thể, Upload ảnh) theo cơ chế **Controlled Components**, giúp kiểm soát chặt chẽ dữ liệu đầu vào và validation ngay tại thời điểm gõ (real-time feedback).
- **Quản lý dữ liệu:** Cung cấp giao diện CRUD toàn diện cho Sản phẩm, Danh mục và quy trình xử lý Đơn hàng.

#### 2.4. DevOps & Deployment (Vận hành)

- **Containerization:** Đóng gói toàn bộ ứng dụng (Backend, Database, Redis) sử dụng **Docker** và **Docker Compose** để đảm bảo môi trường phát triển và triển khai đồng nhất.
- **Cloud Storage:** Tích hợp **Supabase Storage** để lưu trữ và quản lý hình ảnh sản phẩm tối ưu.

### 3. Scope of Work (Phạm vi dự án)

- **In Scope (Trong phạm vi):**
  - Các chức năng mua bán B2C (Business to Customer).
  - Thanh toán khi nhận hàng (COD).
  - Quản lý kho hàng cơ bản.
- **Out of Scope (Ngoài phạm vi - Phát triển sau):**
  - Thanh toán Online (VNPay/Momo) (Dự kiến phát triển giai đoạn 2).
  - Hệ thống Chat trực tuyến giữa người mua và người bán.
  - Hệ thống Recommendation (Gợi ý sản phẩm bằng AI).
