// User Types
export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  created_at: Date;
  updated_at: Date;
  children?: Category[];
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  category_id?: number;
  brand?: string;
  sku?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: Date;
  updated_at: Date;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: Date;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  variant_value: string;
  price_modifier: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Review Types
export interface ProductReview {
  id: number;
  product_id: number;
  user_id?: number;
  guest_name?: string;
  guest_email?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

// Address Types
export interface Address {
  id: number;
  user_id?: number;
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
  created_at: Date;
  updated_at: Date;
}

// Order Types
export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  guest_email?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_name: string;
  shipping_phone: string;
  shipping_email?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country: string;
  billing_name?: string;
  billing_phone?: string;
  billing_email?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  notes?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  product_sku?: string;
  variant_id?: number;
  variant_details?: string;
  quantity: number;
  price: number;
  total: number;
  created_at: Date;
  product?: Product;
}

// Cart Types
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  product?: Product;
  variant?: ProductVariant;
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
  product?: Product;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
