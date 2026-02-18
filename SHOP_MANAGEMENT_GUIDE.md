# Multi-Shop Management System

## Overview
The system supports managing multiple shops/branches for a single owner or organization. Each shop is completely isolated in terms of inventory, customers, and sales data.

## Shop Model

```typescript
interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  owner_id: string;
  category: 'grocery' | 'pharmacy' | 'restaurant' | 'retail' | 'clothing' | 'electronics' | 'general';
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'expired' | 'cancelled';
  logo_url?: string;
  primary_color?: string;      // For theme customization
  accent_color?: string;       // For theme customization
  language: 'en' | 'ne';       // English or Nepali
  currency: string;             // NPR, USD, etc.
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Shop Categories
- **Grocery**: General store, supermarket
- **Pharmacy**: Drug store, medical shop
- **Restaurant**: Food service, café
- **Retail**: General retail store
- **Clothing**: Fashion, apparel
- **Electronics**: Tech products
- **General**: Default category for any other type

## User-Shop Relationship

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  shop_id: string;           // User's primary shop
  role: 'owner' | 'cashier' | 'manager' | 'staff';
  is_active: boolean;
  // ... other fields
}
```

## Shop Switching Implementation

### In POS Page
```typescript
// Get all shops for current user
const { shop, shops, switchShop } = useAuthStore();

// Switch to different shop
const handleSwitchShop = (shopId: string) => {
  switchShop(shopId);
  // POS automatically fetches new shop's products
};
```

### Auto-Fetching on Shop Change
```typescript
useEffect(() => {
  if (shop?.id) {
    // Fetch products for current shop only
    await fetchProducts(shop.id);
    await fetchCustomers(shop.id);
  }
}, [shop?.id]);  // Re-run when shop changes
```

## Data Isolation Strategy

### Products
- Filtered by `product.shop_id === currentShop.id`
- Only show products belonging to current shop
- Each shop maintains separate product catalog

### Customers
- Filtered by `customer.shop_id === currentShop.id`
- Customer credit tracked per shop
- Payment history per shop

### Sales/Transactions
- Each sale records `shop_id: string`
- Sales reports only show current shop data
- Revenue calculations per shop

### Inventory
- Inventory tracked per shop
- Stock levels independent per location
- Low stock alerts per shop

### Expenses
- Expenses tagged with `shop_id`
- Expense reports per shop
- Can be shared across shops (corporate expenses)

## Shop Selector UI

### Visible When
- User has 2 or more shops assigned
- Located in POS header (top right)

### Functionality
```typescript
<ShopSelector>
  {shops.map(shop => (
    <MenuItem>
      {shop.name}
      {shop.id === currentShop.id && <CheckIcon />}
    </MenuItem>
  ))}
</ShopSelector>
```

### Shop Information Displayed
- Shop name
- Shop category
- Active indicator (checkmark)

## Login Flow with Multiple Shops

```
1. User logs in with email/password
   ↓
2. System identifies all shops for user
   ↓
3. If 1 shop: Set as active
   If >1 shop: 
   - Set first as default active
   - Store all shops
   - Show selector in header
   ↓
4. User can switch at any time from POS
   ↓
5. All data automatically filters to current shop
```

## Implementation Code

### Auth Store Enhancement
```typescript
interface AuthState {
  user: User | null;
  shop: Shop | null;              // Currently active shop
  shops: Shop[];                  // All shops for user
  switchShop: (shopId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    switchShop: (shopId: string) => {
      const state = get();
      const selectedShop = state.shops.find(s => s.id === shopId);
      if (selectedShop) {
        set({ shop: selectedShop });
        // POS useEffect will automatically fetch new data
      }
    },
    setUser: (user: User, shop: Shop, shops?: Shop[]) => {
      set({
        user,
        shop,
        shops: shops && shops.length > 0 ? shops : [shop],
      });
    }
  }))
);
```

### Products Store Enhancement
```typescript
export const useProductsStore = create<ProductsState>()(
  persist((set, get) => ({
    fetchProducts: async (shopId?: string) => {
      // When shopId provided, only fetch those products
      // API should filter: WHERE shop_id = ?
      set({ isLoading: true });
      try {
        const response = await fetch(`/api/products?shopId=${shopId}`);
        const products = await response.json();
        set({ products, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
    getProductsByShop: (shopId: string) => {
      const state = get();
      return state.products.filter(p => p.shop_id === shopId);
    }
  }))
);
```

### POS Integration
```typescript
export default function POSPage() {
  const { shop, switchShop } = useAuthStore();
  const { fetchProducts } = useProductsStore();

  // Auto-fetch when shop changes
  useEffect(() => {
    if (shop?.id) {
      fetchProducts(shop.id);
    }
  }, [shop?.id]);

  return (
    <header>
      <ShopSelector />  {/* Shows if >1 shop */}
      <LanguageSwitcher />
    </header>
  );
}
```

## Database Schema (Conceptual)

```sql
-- Shops Table
CREATE TABLE shops (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255),
  category VARCHAR(50),
  primary_color VARCHAR(7),
  accent_color VARCHAR(7),
  language VARCHAR(2),
  currency VARCHAR(3),
  created_at TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  sku VARCHAR(100),
  name VARCHAR(255),
  category VARCHAR(100),
  selling_price DECIMAL,
  cost_price DECIMAL,
  image_url TEXT,
  created_at TIMESTAMP,
  INDEX(shop_id)  -- For fast filtering
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  credit_limit DECIMAL,
  created_at TIMESTAMP,
  INDEX(shop_id)
);

-- Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  customer_id UUID REFERENCES customers(id),
  total_amount DECIMAL,
  payment_method VARCHAR(50),
  created_at TIMESTAMP,
  INDEX(shop_id),
  INDEX(customer_id)
);
```

## Multi-Shop Scenarios

### Scenario 1: Store Manager
- Manages single shop
- All data filtered to that shop automatically
- Shop selector hidden (only 1 shop)

### Scenario 2: Multi-Branch Owner
- Owns 3 branches
- Can quickly switch between branches
- Each branch has separate inventory/customers
- Owner can see consolidated analytics (if implemented)

### Scenario 3: Franchise System
- Different franchisees own different shops
- Each franchisee only sees their shop
- Same software for all franchises
- Centralized reporting for main office

## Best Practices

1. **Always Filter by Shop ID**: Every query should include `WHERE shop_id = ?`
2. **Clear Cache on Switch**: Clear old data when switching shops
3. **Validation**: Verify user owns shop before switching
4. **Error Handling**: Show user message if shop switch fails
5. **Audit Trail**: Log shop switches for security

## Future Enhancements

- [ ] Cross-shop reporting
- [ ] Consolidated KPIs across all shops
- [ ] Stock transfer between shops
- [ ] Centralized supplier management
- [ ] Multi-shop user permissions
- [ ] Shop-specific branding (primary/accent colors)
- [ ] Shop-specific pricing
- [ ] Inventory synchronization

## Troubleshooting

### Products Don't Change When Switching Shops
- Check if `fetchProducts(shop.id)` is called in useEffect
- Verify shop.id is actually changing
- Check browser console for errors

### Same Customer in Multiple Shops
- This is intentional - customers are shop-specific
- Create separate customer records per shop
- If shared customers needed, implement corporate customer system

### Payment/Sales Not Associated with Correct Shop
- Verify sale object includes `shop_id: shop.id`
- Check shop ID is correctly saved in database
- Run query: `SELECT * FROM sales WHERE shop_id = ?`
