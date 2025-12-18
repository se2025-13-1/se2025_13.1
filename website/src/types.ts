// Data Models matching the PostgreSQL database schema

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPING = "shipping",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export interface AuthUser {
  id: string;
  email: string;
  role: "customer" | "admin" | "staff";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  is_phone_verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string;
  created_at?: string;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  color_ref: string | null; // Quan trọng: null là ảnh chung
  display_order?: number;
}

export interface Product {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  rating_average?: number;
  review_count?: number;
  sold_count?: number;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id?: string;
  product_name: string;
  variant_info: {
    color?: string;
    size?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShippingInfo {
  name?: string;
  phone?: string;
  recipient_name?: string;
  recipient_phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  address_detail?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  shipping_info: ShippingInfo;
  subtotal_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  voucher_id?: string;
  note?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Voucher {
  id: string;
  code: string;
  description?: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  used_count: number;
  limit_per_user: number;
  collected_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_item_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockAlerts: number;
}
