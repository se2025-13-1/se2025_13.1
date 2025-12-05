# 📊 Tài liệu tích hợp Module Thống kê (Statistics)

    Phiên bản: 1.0
    Đối tượng sử dụng: Admin Dashboard (Web)
    Yêu cầu chung:
        Auth: Tất cả API đều yêu cầu Header Authorization: Bearer <Admin_Token>.
        Caching: Dữ liệu được cache trong 5-10 phút. Nếu vừa có đơn hàng mới mà chưa thấy số liệu nhảy, vui lòng đợi một chút hoặc xóa cache Redis (nếu đang dev).

## 1. Tổng quan (Dashboard Overview)

    API này cung cấp 4 chỉ số quan trọng nhất để hiển thị ở các thẻ (Cards) trên cùng của Dashboard.
    - Endpoint: GET /api/stats/dashboard
    - Mục đích: Hiển thị cái nhìn nhanh về tình hình kinh doanh.

    Response Example:
    {
        "message": "Lấy thống kê thành công",
        "data": {
            "total_revenue": 15000000,  // Tổng doanh thu (VND) - Chỉ tính đơn 'completed'
            "total_orders": 150,        // Tổng số đơn hàng phát sinh
            "total_users": 45,          // Tổng số khách hàng (trừ admin)
            "low_stock_count": 5        // Số lượng mẫu mã sắp hết hàng (< 10)
        }
    }

    💡 Gợi ý cho FE:

    total_revenue: Cần format tiền tệ (VD: 15.000.000 ₫).
    low_stock_count: Nếu > 0, nên hiển thị màu đỏ hoặc icon cảnh báo để Admin chú ý nhập hàng.

## 2. Biểu đồ Doanh thu (Revenue Chart)

    Dữ liệu để vẽ biểu đồ đường (Line Chart) hoặc cột (Bar Chart) theo thời gian.

    Endpoint: GET /api/stats/revenue

    Query Params:
        range: Số ngày muốn xem (Mặc định là 7). Ví dụ: ?range=30.

    Logic Backend: Backend đã tự động điền 0 cho những ngày không có doanh thu. FE không cần xử lý logic lấp đầy ngày tháng.

    Response Example:
    {
        "data": [
            { "date": "2023-11-01", "revenue": 500000 },
            { "date": "2023-11-02", "revenue": 0 },       // Ngày này ế, backend trả về 0
            { "date": "2023-11-03", "revenue": 1200000 },
            { "date": "2023-11-04", "revenue": 2500000 }
            // ...
        ]
    }

    💡 Gợi ý cho FE:

    Trục X (Hoành): Hiển thị date. Nên format lại cho đẹp (VD: "01/11").

    Trục Y (Tung): Hiển thị revenue.

    Thư viện gợi ý: Recharts, Chart.js, hoặc ECharts.

## 3. Hiệu quả Sản phẩm (Product Performance)

    API này trả về 2 danh sách: Top bán chạy và Top tồn kho.

    Endpoint: GET /api/stats/top-products

    Mục đích: Hiển thị 2 bảng (Table) hoặc List.

    Response Example:
    {
        "data": {
            "best_sellers": [ // Top 5 bán chạy nhất (theo số lượng)
            {
                "id": "uuid-sp-1",
                "name": "Áo Thun Basic - Trắng",
                "base_price": "150000",
                "total_sold": "50", // Số lượng đã bán
                "thumbnail": "https://supabase.../img1.jpg" // Ảnh đại diện (ưu tiên ảnh chung)
            },
            // ...
            ],
            "high_stock": [ // Top 5 tồn kho nhiều nhất (cần xả hàng)
            {
                "id": "uuid-sp-2",
                "name": "Áo Khoác Mùa Đông",
                "total_stock": "1000", // Số lượng tồn
                "thumbnail": "https://supabase.../img2.jpg"
            }
            // ...
            ]
        }
    }

    💡 Gợi ý cho FE:

    Hiển thị dạng 2 bảng cạnh nhau hoặc Tab chuyển đổi.

    thumbnail: Nếu null, hãy hiển thị một ảnh placeholder mặc định.

    Click vào tên sản phẩm nên link sang trang chi tiết sản phẩm.

## 4. Trạng thái Đơn hàng (Order Status)

    Dữ liệu phân bổ tỉ lệ các đơn hàng.

    Endpoint: GET /api/stats/order-status

    Mục đích: Vẽ biểu đồ tròn (Pie Chart / Donut Chart).

    Logic Backend: Luôn trả về đủ 6 trạng thái (kể cả khi giá trị là 0).

    Response Example:

    {
        "data": [
            { "name": "Pending",   "value": 5,  "status_key": "pending" },
            { "name": "Confirmed", "value": 2,  "status_key": "confirmed" },
            { "name": "Shipping",  "value": 10, "status_key": "shipping" },
            { "name": "Completed", "value": 50, "status_key": "completed" },
            { "name": "Cancelled", "value": 3,  "status_key": "cancelled" },
            { "name": "Returned",  "value": 0,  "status_key": "returned" }
        ]
    }

    💡 Gợi ý cho FE (Màu sắc biểu đồ):
    Nên map màu sắc dựa theo status_key để đồng bộ giao diện:

    pending: 🟡 Vàng (Warning)

    confirmed: 🔵 Xanh dương (Info)

    shipping: 🟣 Tím/Cam

    completed: 🟢 Xanh lá (Success)

    cancelled: 🔴 Đỏ (Error)

    returned: ⚫ Xám

## 5. Mã lỗi thường gặp (Error Codes)

    401	Unauthorized	Thiếu Token hoặc Token hết hạn.	Redirect về trang Login.
    403	Forbidden	User đăng nhập nhưng không phải Admin.	Báo lỗi "Bạn không có quyền truy cập".
    500	Internal Server Error	Lỗi Server/Database.	Báo dev Backend check log.
