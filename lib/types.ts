// Store Categories
export type StoreCategory = 'grocery' | 'pharmacy' | 'restaurant' | 'retail' | 'clothing' | 'electronics' | 'general';

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Only in creation/update requests
  phone?: string;
  shop_id: string;
  role: 'owner' | 'cashier' | 'manager' | 'staff';
  cashier_pin?: string; // Optional PIN for cashiers to bypass khata approvals
  can_manage_khata?: boolean; // Cashier permission to manage khata
  password_reset_token?: string;
  password_reset_expiry?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  owner_id: string;
  category: StoreCategory;
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'expired' | 'cancelled';
  logo_url?: string;
  primary_color?: string; // Hex color code
  accent_color?: string; // Hex color code
  language: 'en' | 'ne'; // English or Nepali
  currency: string; // NPR, USD, etc.
  table_mode_enabled?: boolean; // Restaurant table mode
  total_tables?: number; // Total number of tables
  // IRD Compliance Fields
  pan_number?: string; // Permanent Account Number
  vat_number?: string; // VAT Registration Number
  ird_registered?: boolean; // IRD registered business
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Recipe Management
export interface RecipeIngredient {
  product_id: string; // Raw material product ID
  product_name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  product_id: string; // Final product ID
  ingredients: RecipeIngredient[];
  yield_quantity: number; // How many units this recipe produces
  created_at: string;
  updated_at: string;
}

// Products
export interface VariantOption {
  name: string; // e.g., "Chicken", "Buff", "Pork"
  cost_price: number;
  selling_price: number;
}

export interface VariantType {
  name: string; // e.g., "Type", "Size", "Color"
  options: VariantOption[];
}

export interface Product {
  id: string;
  shop_id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string; // kg, liter, piece, box, plate, bowl, cup, bottle, etc.
  cost_price: number;
  selling_price: number;
  margin_percentage: number;
  tax_percentage: number; // 13% VAT for Nepal
  discount_percentage?: number; // Optional percentage discount
  discount_amount?: number; // Optional fixed amount discount
  image_url?: string; // Product image URL
  parent_product_id?: string; // For variants
  is_parent_product?: boolean; // True if has variants
  variant_types?: VariantType[]; // Variant configuration for parent products
  variant_values?: Record<string, string>; // For child products: {"Type": "Chicken"}
  stock_quantity?: number; // Current stock
  reorder_level?: number; // Low stock warning level
  is_raw_material?: boolean; // True if used as ingredient
  has_recipe?: boolean; // True if product is made from recipe
  show_in_pos?: boolean; // Show in POS (false for raw materials)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Inventory
export interface Inventory {
  id: string;
  shop_id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  last_count_date: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  shop_id: string;
  product_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string; // Bill ID, Khata ID, etc.
  notes?: string;
  created_by: string;
  created_at: string;
}

// Restaurant Tables
export interface Table {
  id: string;
  shop_id: string;
  table_number: number;
  status: 'available' | 'occupied' | 'reserved';
  current_sale_id?: string;
  occupied_at?: string;
  updated_at: string;
}

// KOT (Kitchen Order Ticket)
export interface KOT {
  id: string;
  shop_id: string;
  kot_number: string;
  table_number?: number;
  items: KOTItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  created_by: string;
  created_at: string;
  prepared_at?: string;
  ready_at?: string;
  served_at?: string;
}

export interface KOTItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  notes?: string;
}

// Sales & POS
export interface Sale {
  id: string;
  shop_id: string;
  sale_number: string;
  customer_id?: string;
  table_number?: number; // For restaurant mode
  items: SaleItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'online' | 'cheque' | 'credit';
  payment_status: 'paid' | 'pending' | 'partial';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  discount_percentage: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
}

// Customers & Khata (Credit System)
export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  pan_number?: string; // For IRD compliance
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Khata {
  id: string;
  shop_id: string;
  customer_id: string;
  total_credit: number;
  total_paid: number;
  balance: number;
  last_transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface KhataTransaction {
  id: string;
  shop_id: string;
  khata_id: string;
  customer_id: string;
  transaction_type: 'credit' | 'payment';
  amount: number;
  reference_id?: string; // Sale ID, Payment ID, etc.
  notes?: string;
  requires_approval: boolean; // True if cashier lacked PIN
  status: 'pending' | 'approved' | 'rejected'; // Approval status
  approved_by?: string; // Owner ID who approved
  created_by: string;
  created_at: string;
}

// Expenses
export interface Expense {
  id: string;
  shop_id: string;
  category: string; // rent, utilities, salary, supplies, etc.
  amount: number;
  description?: string;
  payment_method: string;
  reference_number?: string;
  receipt_image_url?: string; // Barcode/receipt image
  is_recurring?: boolean; // Is this a recurring expense
  recurring_type?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom'; // Repeat frequency
  custom_repeat_days?: number; // For custom repeat frequency
  next_due_date?: string; // Next occurrence date
  recurring_end_date?: string; // When to stop recurring
  created_by?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

// Analytics & Reports
export interface DailySales {
  id: string;
  shop_id: string;
  date: string;
  total_sales: number;
  total_transactions: number;
  avg_transaction_value: number;
  total_tax: number;
  total_discount: number;
  payment_breakdown: {
    cash: number;
    card: number;
    online: number;
    cheque: number;
    credit: number;
  };
}

export interface DailyExpenses {
  id: string;
  shop_id: string;
  date: string;
  total_expenses: number;
  category_breakdown: Record<string, number>;
}

// Offline-First Sync
export interface SyncQueue {
  id: string;
  shop_id: string;
  entity_type: 'sale' | 'inventory_log' | 'khata_transaction' | 'expense' | 'customer';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  synced: boolean;
  error_message?: string;
  created_at: string;
  synced_at?: string;
}

// Session/Auth State
export interface AuthSession {
  user: User;
  shop: Shop;
  token?: string;
}

export interface DashboardStats {
  total_sales_today: number;
  total_transactions: number;
  avg_transaction_value: number;
  total_customers: number;
  outstanding_khata: number;
  low_stock_products: Product[];
}

// Theme System
export interface Theme {
  id: string;
  category: StoreCategory;
  primaryColor: string; // Hex color
  accentColor: string; // Hex color
  secondaryColor: string; // Hex color
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

// Variant Templates
export interface VariantTemplate {
  id: string;
  shop_id: string;
  category: StoreCategory;
  name: string; // e.g., "Size", "Strength", "Color"
  options: string[]; // e.g., ["XS", "S", "M", "L", "XL", "XXL"]
  is_default: boolean; // Use as default for new products
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  name: string; // e.g., "Red - Large"
  option_values: Record<string, string>; // {"Color": "Red", "Size": "Large"}
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Localization
export interface LocalizedStrings {
  [key: string]: {
    en: string;
    ne: string;
  };
}
