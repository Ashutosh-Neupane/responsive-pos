/**
 * Category System for Different Shop Types
 * Provides category lists based on store category
 */

export const STORE_CATEGORIES = {
  grocery: {
    label: 'Grocery/Super Market',
    icon: '🛒',
    description: 'General grocery and supermarket',
    productCategories: [
      'Grains & Cereals',
      'Vegetables',
      'Fruits',
      'Dairy & Eggs',
      'Meat & Fish',
      'Oils & Spices',
      'Flour & Grains',
      'Sugar & Salt',
      'Beverages',
      'Snacks',
      'Frozen Foods',
      'Canned Goods',
      'Bread & Bakery',
      'Condiments',
      'Tea & Coffee',
    ],
  },
  pharmacy: {
    label: 'Pharmacy',
    icon: '💊',
    description: 'Medicines and health products',
    productCategories: [
      'Prescription Medicines',
      'Over-the-Counter Medicines',
      'Vitamins & Supplements',
      'First Aid',
      'Skincare',
      'Personal Care',
      'Medical Equipment',
      'Sanitary Products',
      'Cold & Cough',
      'Digestive Health',
      'Pain Relief',
      'Antibiotic Ointments',
    ],
  },
  restaurant: {
    label: 'Restaurant/Cafe',
    icon: '🍽️',
    description: 'Restaurant and food service',
    productCategories: [
      'Main Course',
      'Appetizers',
      'Desserts',
      'Beverages',
      'Breakfast Items',
      'Soups',
      'Salads',
      'Breads',
      'Snacks',
      'Condiments',
      'Vegetarian',
      'Non-Vegetarian',
    ],
  },
  retail: {
    label: 'General Retail',
    icon: '🏪',
    description: 'General retail store',
    productCategories: [
      'Electronics',
      'Home Appliances',
      'Kitchen Items',
      'Bedding',
      'Furniture',
      'Lighting',
      'Decorations',
      'Tools',
      'Hardware',
      'Cleaning Supplies',
      'Personal Care',
    ],
  },
  clothing: {
    label: 'Clothing & Fashion',
    icon: '👕',
    description: 'Clothing and fashion store',
    productCategories: [
      'Mens Clothing',
      'Womens Clothing',
      'Childrens Clothing',
      'Footwear',
      'Accessories',
      'Ethnic Wear',
      'Casual Wear',
      'Formal Wear',
      'Sportswear',
      'Innerwear',
      'Jackets & Coats',
    ],
  },
  electronics: {
    label: 'Electronics',
    icon: '📱',
    description: 'Electronics and gadgets',
    productCategories: [
      'Mobile Phones',
      'Laptops & Computers',
      'Tablets',
      'Accessories',
      'Chargers & Cables',
      'Headphones',
      'Speakers',
      'Cameras',
      'Smartwatches',
      'Gaming Devices',
      'Power Banks',
    ],
  },
  general: {
    label: 'General Store',
    icon: '🏬',
    description: 'Mixed products store',
    productCategories: [
      'General',
      'Grains',
      'Oils',
      'Spices',
      'Dairy',
      'Vegetables',
      'Fruits',
      'Frozen',
      'Beverages',
      'Snacks',
      'Essentials',
      'Other',
    ],
  },
} as const;

export type StoreCategoryKey = keyof typeof STORE_CATEGORIES;

/**
 * Get all store types for dropdown
 */
export function getStoreTypes() {
  return Object.entries(STORE_CATEGORIES).map(([key, value]) => ({
    id: key,
    label: value.label,
    icon: value.icon,
    description: value.description,
  }));
}

/**
 * Get product categories for a specific store type
 */
export function getCategoriesForStoreType(storeCategory: StoreCategoryKey) {
  return STORE_CATEGORIES[storeCategory]?.productCategories || STORE_CATEGORIES.general.productCategories;
}

/**
 * Get default categories (generic ones that work for all stores)
 */
export function getDefaultCategories() {
  return STORE_CATEGORIES.general.productCategories;
}

/**
 * Get units commonly used
 */
export const PRODUCT_UNITS = [
  { id: 'piece', label: 'Piece (No.)' },
  { id: 'kg', label: 'Kilogram (kg)' },
  { id: 'gram', label: 'Gram (g)' },
  { id: 'liter', label: 'Liter (L)' },
  { id: 'milliliter', label: 'Milliliter (ml)' },
  { id: 'box', label: 'Box' },
  { id: 'pack', label: 'Pack' },
  { id: 'dozen', label: 'Dozen (12)' },
  { id: 'meter', label: 'Meter (m)' },
  { id: 'plate', label: 'Plate' },
  { id: 'bottle', label: 'Bottle' },
  { id: 'jar', label: 'Jar' },
  { id: 'bundle', label: 'Bundle' },
  { id: 'strip', label: 'Strip' },
  { id: 'roll', label: 'Roll' },
] as const;

/**
 * Get payment methods
 */
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card (Debit/Credit)' },
  { id: 'online', label: 'Online Transfer' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'credit', label: 'Credit/Khata' },
] as const;

/**
 * Get user roles
 */
export const USER_ROLES = [
  { id: 'owner', label: 'Owner' },
  { id: 'cashier', label: 'Cashier' },
  { id: 'manager', label: 'Manager' },
  { id: 'staff', label: 'Staff' },
] as const;

/**
 * Get subscription plans
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    label: 'Free',
    description: 'Perfect for small shops',
    features: ['Up to 100 products', 'Basic POS', 'Limited reports'],
  },
  {
    id: 'basic',
    label: 'Basic',
    description: 'For growing businesses',
    features: ['Up to 1000 products', 'Advanced POS', 'Full reports', 'Multi-user', 'Email support'],
  },
  {
    id: 'pro',
    label: 'Professional',
    description: 'For established shops',
    features: ['Unlimited products', 'Advanced analytics', 'Multiple shops', 'API access', 'Priority support'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    description: 'For large operations',
    features: ['Unlimited everything', 'Dedicated support', 'Custom integration', 'Advanced security'],
  },
] as const;
