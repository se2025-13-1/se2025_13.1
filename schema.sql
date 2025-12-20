/* 
 * ======================================================================================
 *  FASHION E-COMMERCE DATABASE SCHEMA (FINAL VERSION)
 *  Features: Lazy Auth, Product Variants, Cart, Orders, Vouchers (Collect), Reviews, Wishlist
 * ======================================================================================
 */

-- 1. CẤU HÌNH CƠ BẢN
-- Kích hoạt extension để tạo UUID và hỗ trợ tìm kiếm Full-text
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Hỗ trợ tìm kiếm like %name% nhanh hơn
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Hỗ trợ tìm kiếm tiếng Việt không dấu

-- Hàm tự động cập nhật thời gian 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ======================================================================================
-- 2. MODULE AUTH & USER (NGƯỜI DÙNG)
-- ======================================================================================

-- Bảng tài khoản đăng nhập (Tối giản)
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT, -- Null nếu login bằng Google/FB
  role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin', 'staff'
  is_active BOOLEAN DEFAULT TRUE, -- Để Admin khóa tài khoản
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng liên kết mạng xã hội
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook'
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Bảng thông tin cá nhân (Mở rộng)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  gender VARCHAR(20), -- 'male', 'female', 'other'
  birthday DATE,
  phone VARCHAR(20), -- SĐT liên lạc (Cập nhật sau khi checkout)
  is_phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng sổ địa chỉ (Logistics)
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  province VARCHAR(100),       -- Tỉnh/TP
  district VARCHAR(100),       -- Quận/Huyện (Quan trọng để tính ship)
  ward VARCHAR(100),           -- Phường/Xã
  address_detail TEXT,         -- Số nhà, tên đường
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================================================================
-- 3. MODULE PRODUCT (SẢN PHẨM)
-- ======================================================================================

-- Danh mục đa cấp (Cây thư mục)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sản phẩm cha
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE,
  description TEXT,
  base_price NUMERIC(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Cache thống kê (Để hiển thị nhanh ngoài danh sách)
  rating_average NUMERIC(3, 1) DEFAULT 0, -- VD: 4.5
  review_count INT DEFAULT 0,             -- VD: 100
  sold_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Biến thể sản phẩm (SKU)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE,
  color VARCHAR(50),      -- VD: Red, Blue
  size VARCHAR(20),       -- VD: S, M, L
  price NUMERIC(15,2),    -- Giá riêng cho biến thể (nếu khác giá gốc)
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ảnh sản phẩm
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  color_ref VARCHAR(50), -- Null: Ảnh chung. Có giá trị: Ảnh theo màu.
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================================================================================
-- 4. MODULE MARKETING (VOUCHER)
-- ======================================================================================

-- Bảng Voucher gốc
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(15,2) NOT NULL,
  min_order_value NUMERIC(15,2) DEFAULT 0,
  max_discount_amount NUMERIC(15,2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  usage_limit INT,                        -- Tổng số lượng mã toàn hệ thống
  used_count INT DEFAULT 0,               -- Đã dùng bao nhiêu
  limit_per_user INT DEFAULT 1,           -- Mỗi người được lưu/dùng mấy lần
  collected_count INT DEFAULT 0,          -- Số người đã lưu vào ví
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ví Voucher của người dùng (Tính năng Sưu tầm)
CREATE TABLE user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, voucher_id) -- Chặn lưu trùng nếu limit_per_user = 1
);

-- ======================================================================================
-- 5. MODULE SHOPPING (GIỎ HÀNG & YÊU THÍCH)
-- ======================================================================================

-- Giỏ hàng
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cart_id, product_variant_id)
);

-- Sản phẩm yêu thích (Wishlist)
CREATE TABLE wishlists (
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ======================================================================================
-- 6. MODULE ORDER (ĐƠN HÀNG)
-- ======================================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  
  -- Snapshot thông tin giao hàng (Lưu cứng JSON để không bị đổi khi user sửa profile)
  shipping_info JSONB NOT NULL, 
  
  -- Tài chính
  subtotal_amount NUMERIC(15,2) NOT NULL,
  shipping_fee NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipping, completed, cancelled, returned
  
  voucher_id UUID REFERENCES vouchers(id), -- Voucher đã dùng
  note TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id),
  
  -- Snapshot sản phẩm (Lưu cứng tên/giá lúc mua)
  product_name VARCHAR(255),
  variant_info JSONB, -- { color: "Red", size: "M" }
  
  quantity INT NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  total_price NUMERIC(15,2) NOT NULL
);

-- ======================================================================================
-- 7. MODULE SOCIAL (ĐÁNH GIÁ)
-- ======================================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE, -- Verified Purchase
  
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  is_approved BOOLEAN DEFAULT TRUE, -- Mặc định hiện, Admin ẩn sau nếu vi phạm
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(order_item_id) -- Một món trong đơn hàng chỉ được review 1 lần
);

-- ======================================================================================
-- 8. MODULE NOTIFICATION (THÔNG BÁO)
-- ======================================================================================

-- 1. Bảng lưu Token thiết bị
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  platform VARCHAR(20), -- 'ios', 'android'
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(fcm_token) -- Một token chỉ lưu 1 lần
);

-- 2. Bảng lưu nội dung thông báo
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50), -- 'order', 'promo'
  data JSONB,       -- Dữ liệu để navigate: { "orderId": "..." }
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ======================================================================================
-- 9. TẠO INDEX & TRIGGER (TỐI ƯU HIỆU NĂNG)
-- ======================================================================================

-- Index cho khóa ngoại (Tăng tốc độ JOIN)
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_images_product ON product_images(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating_average);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_sold_count ON products(sold_count);

-- Index cho tìm kiếm
CREATE INDEX idx_products_name_trigram ON products USING gin (name gin_trgm_ops);

-- Trigger tự động update 'updated_at'
CREATE TRIGGER update_auth_users_modtime BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_modtime BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_addresses_modtime BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_modtime BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_carts_modtime BEFORE UPDATE ON carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cart_items_modtime BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();