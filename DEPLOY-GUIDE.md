# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN SE2025 FASHION

> Tài liệu này hướng dẫn chi tiết cách deploy hệ thống gồm **Backend**, **Website** và **Mobile App** lên server mới.

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
2. [Cấu Trúc Thư Mục Server Config](#2-cấu-trúc-thư-mục-server-config)
3. [Hướng Dẫn Deploy Nhanh (1 Click)](#3-hướng-dẫn-deploy-nhanh-1-click)
4. [Hướng Dẫn Deploy Chi Tiết](#4-hướng-dẫn-deploy-chi-tiết)
5. [Cấu Hình DuckDNS (IP Động)](#5-cấu-hình-duckdns-ip-động)
6. [Cấu Hình Mobile App](#6-cấu-hình-mobile-app)
7. [Kiểm Tra Kết Nối](#7-kiểm-tra-kết-nối)
8. [Xử Lý Lỗi Thường Gặp](#8-xử-lý-lỗi-thường-gặp)

---

## 1. Yêu Cầu Hệ Thống

### Phần Cứng
- **RAM**: Tối thiểu 4GB
- **CPU**: 2 cores trở lên
- **Ổ cứng**: 20GB trống

### Phần Mềm
| Phần mềm | Phiên bản | Kiểm tra |
|----------|-----------|----------|
| Windows Server / Windows 10+ | 64-bit | `winver` |
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Git | Bất kỳ | `git --version` |

### Ports Cần Mở
| Port | Dịch vụ | Ghi chú |
|------|---------|---------|
| 3000 | Backend API | Express.js |
| 5173 | Website | Vite Dev Server |

---

## 2. Cấu Trúc Thư Mục Server Config

```
📁 .server-config/
├── 📄 RUN-AS-ADMIN.bat          # Click đúp để chạy với quyền Admin
├── 📄 apply-server-config.ps1   # Script chính, áp dụng cấu hình
├── 📄 set-mobile-domain.ps1     # Cập nhật domain cho Mobile App
├── 📄 update-duckdns.ps1        # Cập nhật IP động cho DuckDNS
├── 📄 duckdns-config.txt        # Lưu thông tin DuckDNS
├── 📁 backend/
│   └── 📄 .env.example          # Template biến môi trường Backend
└── 📁 website/
    └── 📄 vite.config.js        # Cấu hình Vite cho Website
```

---

## 3. Hướng Dẫn Deploy Nhanh (1 Click)

> **Dành cho trường hợp:** Đã clone code từ GitHub và muốn deploy nhanh.

### Bước 1: Clone Repository
```powershell
git clone <repository-url>
cd se2025_13.1-main
```

### Bước 2: Chạy Script Tự Động
1. Mở thư mục `.server-config`
2. **Click đúp** vào file `RUN-AS-ADMIN.bat`
3. Chọn **Yes** khi Windows hỏi quyền Administrator
4. Đợi script hoàn tất

### Script sẽ tự động thực hiện:
- ✅ Copy các file cấu hình (package.json, vite.config.js, apiClient.ts)
- ✅ Tạo file `.env` từ template
- ✅ Mở Firewall ports (3000, 5173)
- ✅ Cài đặt npm packages
- ✅ Cập nhật DuckDNS (nếu đã cấu hình)
- ✅ Khởi động Backend và Website

---

## 4. Hướng Dẫn Deploy Chi Tiết

### Bước 1: Clone Repository
```powershell
cd C:\
git clone <repository-url>
cd se2025_13.1-main
```

### Bước 2: Cấu Hình Backend

#### 2.1. Tạo file .env
```powershell
# Copy từ template
Copy-Item ".server-config\backend\.env.example" -Destination "backend\.env"
```

#### 2.2. Chỉnh sửa file `backend\.env`

Các biến quan trọng cần thay đổi:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
BASE_URL=http://YOUR_PUBLIC_IP:3000
HOST_IP=0.0.0.0

# JWT Authentication
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Database (PostgreSQL - Supabase)
DATABASE_URL=postgresql://...

# Redis (Upstash)
REDIS_URL=rediss://...

# CORS
CORS_ORIGIN=*
```

#### 2.3. Cài đặt dependencies
```powershell
cd backend
npm install
```

#### 2.4. Khởi động Backend
```powershell
npm run dev
```

### Bước 3: Cấu Hình Website

#### 3.1. Copy file cấu hình Vite
```powershell
Copy-Item ".server-config\website\vite.config.js" -Destination "website\vite.config.js"
```

Cấu hình Vite đã được thiết lập sẵn để:
- Cho phép truy cập từ IP public (`host: "0.0.0.0"`)
- Chấp nhận DuckDNS domain
- Proxy API requests đến Backend

#### 3.2. Cài đặt dependencies
```powershell
cd website
npm install
```

#### 3.3. Khởi động Website
```powershell
npm run dev
```

### Bước 4: Mở Firewall

Chạy PowerShell với quyền **Administrator**:
```powershell
# Mở port Backend
netsh advfirewall firewall add rule name="Backend API Port 3000" dir=in action=allow protocol=tcp localport=3000

# Mở port Website
netsh advfirewall firewall add rule name="Website Vite Port 5173" dir=in action=allow protocol=tcp localport=5173
```

---

## 5. Cấu Hình DuckDNS (IP Động)

> **Dành cho trường hợp:** Server không có IP tĩnh (IP động thay đổi).

### Bước 1: Đăng ký DuckDNS
1. Truy cập: https://www.duckdns.org/
2. Đăng nhập bằng Google/GitHub
3. Tạo subdomain (VD: `se2025fashion`)
   → Bạn sẽ có domain: `se2025fashion.duckdns.org`
4. Copy **TOKEN** từ trang web

### Bước 2: Chạy Script Cập Nhật
```powershell
cd .server-config
.\update-duckdns.ps1
```

Script sẽ hỏi:
- **Domain**: `se2025fashion` (không cần .duckdns.org)
- **Token**: Paste token từ trang web

### Bước 3: Tự Động Cập Nhật IP
Script sẽ tạo Task Scheduler chạy mỗi 5 phút để cập nhật IP tự động.

---

## 6. Cấu Hình Mobile App

> **Dành cho trường hợp:** Cần kết nối Mobile App với server mới.

### Bước 1: Chạy Script Cập Nhật Domain
```powershell
cd .server-config
.\set-mobile-domain.ps1 -Domain "se2025fashion.duckdns.org"
```

Hoặc chạy không có tham số để nhập domain thủ công:
```powershell
.\set-mobile-domain.ps1
```

### Bước 2: Rebuild Mobile App
```powershell
cd mobile
npx react-native start --reset-cache
```

### Các file được cập nhật tự động:
- `mobile/src/config/AppConfig.ts`
- `mobile/src/services/firebaseGoogleService.ts`
- `mobile/src/modules/notifications/service/notificationService.ts`

---

## 7. Kiểm Tra Kết Nối

### Kiểm tra Backend
```powershell
# Từ server
curl http://localhost:3000/api/health

# Từ máy khác
curl http://YOUR_IP:3000/api/health
```

### Kiểm tra Website
1. Mở trình duyệt
2. Truy cập: `http://YOUR_IP:5173` hoặc `http://yourdomain.duckdns.org:5173`

### Kiểm tra Mobile App
1. Đảm bảo điện thoại và server cùng mạng hoặc có Internet
2. Mở Mobile App
3. Thử đăng nhập/đăng ký

---

## 8. Xử Lý Lỗi Thường Gặp

### ❌ Lỗi: "npm is not recognized"
**Nguyên nhân:** Node.js chưa được cài hoặc chưa thêm vào PATH.

**Giải pháp:**
1. Cài Node.js từ https://nodejs.org/
2. Khởi động lại PowerShell

---

### ❌ Lỗi: "EACCES permission denied"
**Nguyên nhân:** Không có quyền Administrator.

**Giải pháp:**
1. Click chuột phải vào PowerShell
2. Chọn "Run as Administrator"
3. Chạy lại script

---

### ❌ Lỗi: Mobile App không kết nối được Backend
**Nguyên nhân:** IP/Domain chưa đúng hoặc Firewall chặn.

**Giải pháp:**
1. Kiểm tra Firewall đã mở port 3000
2. Chạy lại `.\set-mobile-domain.ps1`
3. Rebuild Mobile App với `--reset-cache`

---

### ❌ Lỗi: Website không load được
**Nguyên nhân:** Port 5173 bị chặn.

**Giải pháp:**
```powershell
# Kiểm tra port
netstat -an | findstr 5173

# Mở Firewall
netsh advfirewall firewall add rule name="Website Vite Port 5173" dir=in action=allow protocol=tcp localport=5173
```

---

### ❌ Lỗi: DuckDNS không cập nhật
**Nguyên nhân:** Token sai hoặc mạng bị chặn.

**Giải pháp:**
1. Kiểm tra lại Token trên https://www.duckdns.org/
2. Chạy lại `.\update-duckdns.ps1`

---

## 📞 Liên Hệ Hỗ Trợ

Nếu gặp vấn đề không giải quyết được, vui lòng liên hệ nhóm phát triển.

---

> **Lưu ý:** Tài liệu này được tạo tự động. Cập nhật lần cuối: 22/12/2025
