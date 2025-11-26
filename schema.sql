-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(100),
--   email VARCHAR(150) UNIQUE NOT NULL,
--   password_hash TEXT,
--   phone VARCHAR(20),
--   role VARCHAR(20) DEFAULT 'user',
--   avatar_url TEXT,
--   is_verified BOOLEAN DEFAULT false,
--   otp_sent_at TIMESTAMP,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE auth_providers (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   provider VARCHAR(50) NOT NULL,  -- 'google' | 'facebook' | 'github' | ...
--   provider_user_id VARCHAR(255) NOT NULL, -- ID từ Google/Facebook
--   access_token TEXT,
--   refresh_token TEXT,
--   token_expires_at TIMESTAMP,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE UNIQUE INDEX idx_provider_user ON auth_providers (provider, provider_user_id);

-- CREATE TABLE products (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   sku VARCHAR(50) UNIQUE,
--   price NUMERIC(10,2) NOT NULL,
--   discount NUMERIC(5,2) DEFAULT 0,
--   stock INT DEFAULT 0,
--   category VARCHAR(100),
--   short_description TEXT,
--   image_url TEXT[],
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW(),
--   is_active BOOLEAN DEFAULT TRUE
-- );


-- CREATE TABLE orders (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id),
--   total_amount NUMERIC(10,2),
--   status VARCHAR(50) DEFAULT 'pending', -- pending | processing | shipped | delivered | cancelled
--   shipping_address JSONB,
--   payment_method VARCHAR(50), -- COD | CARD | STRIPE | MOMO
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );


-- CREATE TABLE order_items (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
--   product_id UUID REFERENCES products(id),
--   quantity INT DEFAULT 1,
--   price NUMERIC(10,2)
-- );


-- CREATE TABLE payments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_id UUID REFERENCES orders(id),
--   amount NUMERIC(10,2),
--   status VARCHAR(50) DEFAULT 'unpaid', -- unpaid | paid | failed
--   method VARCHAR(50),
--   transaction_id VARCHAR(100),
--   paid_at TIMESTAMP
-- );


-- CREATE TABLE reviews (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   product_id UUID REFERENCES products(id),
--   user_id UUID REFERENCES users(id),
--   rating INT CHECK (rating BETWEEN 1 AND 5),
--   comment TEXT,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE vouchers (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   code VARCHAR(50) UNIQUE,
--   discount_percent NUMERIC(5,2),
--   valid_from DATE,
--   valid_to DATE,
--   is_active BOOLEAN DEFAULT TRUE
-- );


-- CREATE INDEX idx_products_category ON products(category);
-- CREATE INDEX idx_orders_user ON orders(user_id);
-- CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Hàm tự động cập nhật cột updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Bảng user gốc (nhẹ, dùng để auth)
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT, -- Null nếu login bằng FB/GG
  role VARCHAR(20) DEFAULT 'customer', -- customer, admin, staff
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Xác thực
  is_email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20) UNIQUE, -- SĐT dùng để login hoặc verify OTP
  is_phone_verified BOOLEAN DEFAULT FALSE, -- Cờ quan trọng cho luồng OTP
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Liên kết Social (Google, Facebook)
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'apple'
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Thông tin cá nhân (Tách riêng cho gọn)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  gender VARCHAR(20),
  birthday DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sổ địa chỉ (Để user lưu Nhà riêng, Công ty...)
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  address_detail TEXT NOT NULL, -- Số nhà, tên đường
  province VARCHAR(100),        -- Tỉnh/TP
  district VARCHAR(100),        -- Quận/Huyện
  ward VARCHAR(100),            -- Phường/Xã
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Danh mục (Ví dụ: Nam -> Áo -> Áo Thun)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Đệ quy danh mục cha
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sản phẩm chung
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE, -- URL thân thiện SEO
  description TEXT,
  base_price NUMERIC(15,2) NOT NULL, -- Giá gốc hiển thị
  is_active BOOLEAN DEFAULT TRUE,    -- Ẩn/Hiện sản phẩm
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Biến thể (SKU cụ thể: Áo đỏ size M)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE, -- Mã quản lý kho
  color VARCHAR(50),      -- Màu: Red, Blue
  size VARCHAR(20),       -- Size: S, M, L, XL
  price NUMERIC(15,2),    -- Giá riêng cho biến thể (nếu có)
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ảnh sản phẩm (Tách ra để gán theo màu)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  color_ref VARCHAR(50), -- Nếu null là ảnh chung, nếu có value thì là ảnh của màu đó
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- Mã nhập: SALE50
  description TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percent', 'fixed')), -- % hoặc trừ tiền thẳng
  discount_value NUMERIC(15,2) NOT NULL,
  min_order_value NUMERIC(15,2) DEFAULT 0,
  max_discount_amount NUMERIC(15,2), -- Giảm tối đa bao nhiêu (cho loại %)
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  usage_limit INT, -- Giới hạn số lần dùng toàn hệ thống
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Giỏ hàng (Hỗ trợ cả Guest và User)
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE, -- Null nếu là Guest
  session_id VARCHAR(255), -- ID lưu ở LocalStorage máy khách (quan trọng cho Guest)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),       -- 1 User 1 giỏ
  UNIQUE(session_id)     -- 1 Máy 1 giỏ
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cart_id, product_variant_id) -- Tránh trùng lặp dòng
);

-- Đơn hàng (Thông tin tĩnh - Snapshot)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
  
  -- Thông tin giao hàng (Lưu chết tại thời điểm mua - Snapshot)
  shipping_info JSONB NOT NULL, -- Chứa: {name, phone, address, province, district...}
  
  -- Thông tin thanh toán
  subtotal_amount NUMERIC(15,2) NOT NULL, -- Tiền hàng
  shipping_fee NUMERIC(15,2) DEFAULT 0,   -- Phí ship
  discount_amount NUMERIC(15,2) DEFAULT 0,-- Tiền giảm giá
  total_amount NUMERIC(15,2) NOT NULL,    -- Tổng thanh toán cuối cùng
  
  payment_method VARCHAR(50) DEFAULT 'cod', -- cod, vnpay, momo
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, refunded
  
  -- Trạng thái đơn
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipping, delivered, cancelled
  voucher_id UUID REFERENCES vouchers(id), -- Voucher đã dùng
  
  note TEXT, -- Ghi chú của khách
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chi tiết đơn hàng
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id), -- Tham chiếu để biết sp nào
  product_name VARCHAR(255), -- Lưu tên lúc mua (đề phòng sp bị sửa tên sau này)
  variant_info JSONB,        -- Lưu {color: "Red", size: "M"}
  quantity INT NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL, -- Giá tại thời điểm mua
  total_price NUMERIC(15,2) NOT NULL -- unit_price * quantity
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id), -- Bắt buộc phải mua mới được review
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[], -- Mảng URL ảnh review
  is_approved BOOLEAN DEFAULT TRUE, -- Có hiện lên không (để admin ẩn review xấu/tục tĩu)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_auth_users_modtime BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_modtime BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_addresses_modtime BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_modtime BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_carts_modtime BEFORE UPDATE ON carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cart_items_modtime BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();