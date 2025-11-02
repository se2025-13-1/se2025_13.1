CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  otp_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- 'google' | 'facebook' | 'github' | ...
  provider_user_id VARCHAR(255) NOT NULL, -- ID từ Google/Facebook
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_provider_user ON auth_providers (provider, provider_user_id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  discount NUMERIC(5,2) DEFAULT 0,
  stock INT DEFAULT 0,
  category VARCHAR(100),
  short_description TEXT,
  image_url TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_amount NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'pending', -- pending | processing | shipped | delivered | cancelled
  shipping_address JSONB,
  payment_method VARCHAR(50), -- COD | CARD | STRIPE | MOMO
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  price NUMERIC(10,2)
);


CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'unpaid', -- unpaid | paid | failed
  method VARCHAR(50),
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP
);


CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE,
  discount_percent NUMERIC(5,2),
  valid_from DATE,
  valid_to DATE,
  is_active BOOLEAN DEFAULT TRUE
);


CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

