# POS System - Layout & Architecture Guide

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR                    MAIN POS PAGE                               │
│                      ┌──────────────────────────────────────────┐       │
│  Dashboard           │ Point of Sale  │ [Shop Selector] [Lang] │       │
│  POS                 ├──────────────────────────────────────────┤       │
│  Products            │     [Search Products Bar]               │       │
│  Inventory           ├──────────────────────────────────────────┤       │
│  Customers           │        PRODUCTS GRID (4 COLUMNS)        │       │
│  Khata               │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │       │
│  Expenses            │  │ Prod │  │ Prod │  │ Prod │  │ Prod │ │       │
│  Analytics           │  │ Img  │  │ Img  │  │ Img  │  │ Img  │ │       │
│                      │  │ [+]  │  │ [+]  │  │ [+]  │  │ [+]  │ │       │
│  Settings            │  │ Info │  │ Info │  │ Info │  │ Info │ │       │
│  Logout              │  └──────┘  └──────┘  └──────┘  └──────┘ │       │
│                      ├──────────────────────────────────────────┤       │
│                      │         SHOPPING CART (FULL WIDTH)       │       │
│                      │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │       │
│                      │  │ I │ │ I │ │ I │ │ I │ │ I │ │ I │  │       │
│                      │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  │       │
│                      │  [Qty] [Qty] [Qty] [Qty] [Qty] [Qty]   │       │
│                      ├──────────────────────────────────────────┤       │
│                      │ [Discount] │ [Summary] │ [Checkout]     │       │
│                      │   %  / ₹   │ Sub, Tax  │ Customer       │       │
│                      │            │ Disc, Tot │ Payment        │       │
│                      │            │           │ [Pay] [Clear]  │       │
│                      └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layout Specifications

### Header Section
- **Height**: 100px (py-4 = 1rem each)
- **Content**:
  - Left: "Point of Sale" title (h1)
  - Right: Shop Selector + Language Switcher
  - Below: Search bar (max-width-md)

### Products Grid
- **Responsive Columns**:
  - Desktop (lg): 4 columns
  - Tablet (md): 3 columns  
  - Mobile (sm): 2 columns
- **Card Layout**:
  - Image container: aspect-square (1:1 ratio)
  - Info section: p-3 padding
  - Quick add button: bottom-right overlay
- **Image Fallback**: Gradient background with first letter

### Cart Section (Full Width)
- **Max Height**: 224px (max-h-56)
- **Overflow**: y-auto for scrolling
- **Content**:
  - Empty state when no items
  - Grid layout showing cart items horizontally
  - Item card size: responsive, 6 columns lg, 4 md, 3 sm, 2 mobile

### Checkout Panel (Below Cart)
- **Grid Layout**: 3 columns on desktop
  1. Discount Control (left)
  2. Order Summary (middle)
  3. Payment & Actions (right)
- **Mobile**: Stacks to single column

## Component Architecture

### Store Hierarchy
```
useAuthStore
├── user
├── shop (current active shop)
├── shops (array of all shops)
└── switchShop(shopId) → Updates current shop

useProductsStore
├── products (filtered by current shop)
├── fetchProducts(shopId?)
└── getProductsByShop(shopId)

usePOSStore
├── currentSale
├── addItem(item)
├── removeItem(itemId)
├── updateItemQuantity(itemId, qty)
└── clearSale()

useSalesStore
└── addSale(sale) → Saves completed transaction

useCustomersStore
└── customers

useUIStore
└── language
```

### Component Relationships
```
POSPage
├── Sidebar
├── Header
│   ├── ShopSelector (conditionally shown if >1 shop)
│   └── LanguageSwitcher
├── Products Grid
│   └── ProductCard (implicit - just div items)
├── Cart Section
│   ├── Cart Items Display
│   ├── Discount Controls
│   ├── Summary Panel
│   └── Checkout Controls
```

## Data Flow

### Adding to Cart
1. User clicks [+] on product
2. `handleAddProduct(productId)` called
3. Creates SaleItem object with product details
4. `addItem(saleItem)` updates usePOSStore
5. Cart automatically re-renders with new item

### Completing Sale
1. User fills Customer & Payment
2. Clicks [Checkout] button
3. `handleCompleteSale()` creates Sale object
4. `addSale(sale)` persists to store
5. Alert shown with invoice number
6. Cart cleared, page resets

### Switching Shop
1. User clicks shop selector
2. `switchShop(shopId)` called
3. useAuthStore updates current shop
4. POS useEffect detects shop change
5. `fetchProducts(shop.id)` called to load new products
6. Products display updates, cart cleared

## Multi-Shop Data Isolation

```
Database Structure (conceptual):
┌─── Shop A ─────┐    ┌─── Shop B ─────┐
│ Products       │    │ Products       │
│ - id: uuid     │    │ - id: uuid     │
│ - shop_id: A   │    │ - shop_id: B   │
│ - name: ...    │    │ - name: ...    │
│                │    │                │
│ Customers      │    │ Customers      │
│ - id: uuid     │    │ - id: uuid     │
│ - shop_id: A   │    │ - shop_id: B   │
│                │    │                │
│ Sales          │    │ Sales          │
│ - id: uuid     │    │ - id: uuid     │
│ - shop_id: A   │    │ - shop_id: B   │
└────────────────┘    └────────────────┘

Filter: products.filter(p => p.shop_id === currentShop.id)
```

## Responsive Breakpoints

| Screen | Products | Cart Cols | Layout |
|--------|----------|-----------|--------|
| Mobile (< 640px) | 2 cols | 2 | Single column |
| Tablet (640-1024px) | 3 cols | 3-4 | Full width |
| Desktop (> 1024px) | 4 cols | 6 | Full width |

## Color & Styling

### Product Cards
- Border: `border-slate-200`
- Hover: `shadow-lg border-blue-400`
- Image BG: `bg-slate-100`
- Fallback: `bg-gradient-to-br from-blue-100 to-blue-50`
- Add Button: `bg-blue-600 hover:bg-blue-700`

### Cart Items
- BG: `bg-slate-50`
- Border: `border-slate-200`
- Remove: `text-red-600 hover:bg-red-50`

### Checkout Panel
- Discount: `bg-slate-50`
- Summary: `bg-slate-50`
- Total: `text-blue-600 font-bold`
- Checkout: `bg-green-600 hover:bg-green-700`

## Performance Optimizations

1. **Product Filtering**: Server-side when API integrated
2. **Image Lazy Loading**: Can be added to img tags
3. **Debounced Search**: Implement on search input
4. **Virtual Scrolling**: For large product lists (>100 items)
5. **Cart Optimization**: Uses Zustand for efficient state updates

## Integration Checklist

- [x] 4-column product grid layout
- [x] Full-width cart at bottom
- [x] Shop selector in header
- [x] Language switcher in header
- [x] Multi-shop store support
- [x] Product filtering by shop
- [x] Responsive design
- [x] Cart item controls inline
- [x] Discount management
- [x] Checkout functionality
- [ ] API integration
- [ ] Real product images
- [ ] Receipt printing
- [ ] Barcode scanning
