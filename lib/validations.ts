import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  long_description: z.string().optional(),
  category_id: z.number().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  compare_price: z.number().optional(),
  cost_price: z.number().optional(),
  stock_quantity: z.number().min(0, 'Stock must be non-negative'),
  low_stock_threshold: z.number().default(5),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});

export const variantSchema = z.object({
  variant_name: z.string().min(1, 'Variant name is required'),
  variant_value: z.string().min(1, 'Variant value is required'),
  price_modifier: z.number().default(0),
  stock_quantity: z.number().min(0, 'Stock must be non-negative'),
  sku: z.string().optional(),
  is_active: z.boolean().default(true),
});

// Category Schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parent_id: z.number().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

// Review Schema
export const reviewSchema = z.object({
  product_id: z.number(),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').optional(),
  guest_name: z.string().optional(),
  guest_email: z.string().email().optional(),
});

// Address Schema
export const addressSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional(),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('Bangladesh'),
  is_default: z.boolean().default(false),
  address_type: z.enum(['shipping', 'billing', 'both']).default('both'),
});

// Order Schema
export const checkoutSchema = z.object({
  shipping_name: z.string().min(1, 'Name is required'),
  shipping_phone: z.string().min(10, 'Valid phone number is required'),
  shipping_email: z.string().email('Valid email is required'),
  shipping_address_line1: z.string().min(5, 'Address is required'),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().min(1, 'City is required'),
  shipping_state: z.string().optional(),
  shipping_postal_code: z.string().optional(),
  shipping_country: z.string().default('Bangladesh'),
  billing_same_as_shipping: z.boolean().default(true),
  billing_name: z.string().optional(),
  billing_phone: z.string().optional(),
  billing_email: z.union([z.string().email(), z.literal('')]).optional(),
  billing_address_line1: z.string().optional(),
  billing_address_line2: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_postal_code: z.string().optional(),
  billing_country: z.string().optional(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
