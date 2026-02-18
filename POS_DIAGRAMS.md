# POS System - Visual Diagrams & Architecture

## 1. Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                               │
│                                                              │
│  User Input              Auth Process        Store Update   │
│  ┌──────────────┐       ┌────────────────┐  ┌────────────┐ │
│  │ Email/Pass   │──────→│ Verify Creds   │─→│ useAuth    │ │
│  └──────────────┘       │ Fetch Shops    │  │ - user     │ │
│                         │ Fetch Perms    │  │ - shop     │ │
│                         └────────────────┘  │ - shops[]  │ │
│                                             └────────────┘ │
│                                                      │       │
│                                                      ↓       │
│                                        ┌─────────────────┐  │
│                                        │ All Stores Sync │  │
│                                        │ - Products      │  │
│                                        │ - Customers     │  │
│                                        │ - Inventory     │  │
│                                        └─────────────────┘  │
│                                                      │       │
│                                                      ↓       │
│                                        ┌─────────────────┐  │
│                                        │ Redirect        │  │
│                                        │ to POS Page     │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 2. POS User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      POS PAGE LOAD                               │
│                                                                  │
│  ┌──────────────┐      ┌────────────┐      ┌───────────────┐   │
│  │ Load Stores  │─────→│ Check Shop │─────→│ Fetch Data    │   │
│  │ from Auth    │      │ Selection  │      │ - Products    │   │
│  │              │      │            │      │ - Customers   │   │
│  └──────────────┘      └────────────┘      │ - Inventory   │   │
│                              │               └───────────────┘   │
│                              ↓                                    │
│                    ┌──────────────────┐                          │
│                    │ Shop Selector    │                          │
│                    │ (if >1 shop)     │                          │
│                    └──────────────────┘                          │
│                              │                                    │
│                              ↓                                    │
│                    ┌──────────────────────────────────┐          │
│                    │ RENDER POS INTERFACE             │          │
│                    │ ┌─ Header ────────────────────┐  │          │
│                    │ │ Shop | Language | Search   │  │          │
│                    │ └──────────────────────────────┘  │          │
│                    │ ┌─ Products Grid (4 cols) ──┐   │          │
│                    │ │ [Product] [Product] ...   │   │          │
│                    │ │ [Product] [Product] ...   │   │          │
│                    │ └──────────────────────────────┘  │          │
│                    │ ┌─ Cart (Full Width) ──────┐     │          │
│                    │ │ [Item] [Item] [Item]      │     │          │
│                    │ │ [Discount|Summary|Action]│     │          │
│                    │ └──────────────────────────────┘  │          │
│                    └──────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Product Selection to Sale Flow

```
         PRODUCTS         ADD TO CART         CHECKOUT
         ┌─────────┐      ┌──────────┐       ┌─────────┐
         │ Product │      │ Sale     │       │ Payment │
         │ Card    │      │ Item     │       │ Details │
         │ [+]btn  │─────→│ - qty    │──────→│ - Cust  │
         │         │      │ - price  │       │ - Method│
         │         │      │ - total  │       │         │
         └─────────┘      └──────────┘       └─────────┘
              ▲                                    │
              │                                   ↓
              │           ┌──────────────────────────────┐
              │           │  SALE COMPLETE               │
              │           │  - Save to database          │
              │           │  - Print receipt (future)    │
              │           │  - Update inventory          │
              └───────────│  - Record customer khata     │
                          │  - Clear cart               │
                          └──────────────────────────────┘
```

## 4. State Management Flow

```
                      useAuthStore
                    ┌──────────────┐
                    │  - user      │
                    │  - shop      │
                    │  - shops[]   │◄──┐
                    │  methods:    │   │
                    │  - logout    │   │
                    │  - setUser   │   │
                    │  - switchShop├──→ triggers re-fetch
                    └──────────────┘
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
         useProducts    useCustomers  usePOS
         ┌──────────┐   ┌──────────┐  ┌─────────┐
         │Products  │   │Customers │  │Current  │
         │by shop   │   │by shop   │  │Sale     │
         │          │   │          │  │Items[]  │
         └──────────┘   └──────────┘  └─────────┘
                │            │             │
                └────────────┼─────────────┘
                             ▼
                    useSalesStore
                    ┌──────────────┐
                    │ Saves sale   │
                    │ Complete     │
                    └──────────────┘
```

## 5. Multi-Shop Architecture

```
        ┌─────────────────────────────────────────┐
        │        Owner/Manager Login              │
        │                                         │
        │   Email: admin@company.com              │
        │   Password: ••••••••••                  │
        └──────────────────┬──────────────────────┘
                           │
                           ↓
        ┌─────────────────────────────────────────┐
        │  useAuthStore.setUser(user, shop,      │
        │    [shop1, shop2, shop3])               │
        └──────────────────┬──────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ Shop 1       │      │ Shop 2       │
        │ - Name       │      │ - Name       │
        │ - Category   │      │ - Category   │
        │ - Products   │      │ - Products   │
        │ - Customers  │      │ - Customers  │
        │ - Sales      │      │ - Sales      │
        └──────────────┘      └──────────────┘

        ShopSelector in Header:
        ┌─────────────────────┐
        │ Current: Shop 1 [▼] │
        │ - Shop 1      ✓     │◄── switchShop("shop2")
        │ - Shop 2            │   - Updates currentShop
        │ - Shop 3            │   - Triggers fetchProducts(shop2.id)
        └─────────────────────┘   - UI re-renders with shop2 products
```

## 6. Component Hierarchy

```
POSPage
│
├─ Sidebar
│  └─ Menu items + Logout
│
├─ Header
│  ├─ Title "Point of Sale"
│  ├─ ShopSelector (conditional)
│  │  └─ DropdownMenu with shops
│  ├─ LanguageSwitcher
│  │  └─ DropdownMenu (en/ne)
│  └─ Search Input
│
├─ Main Layout (flex col)
│  │
│  ├─ Products Section (flex-1)
│  │  └─ Grid (4 cols responsive)
│  │     └─ Product Cards (map)
│  │        ├─ Image Container
│  │        │  ├─ img (if image_url)
│  │        │  └─ Fallback gradient
│  │        │     └─ Quick Add Button
│  │        └─ Info Section
│  │           ├─ Name
│  │           ├─ SKU
│  │           └─ Price
│  │
│  └─ Cart Section (fixed height)
│     ├─ Empty State
│     ├─ Cart Items Grid (map)
│     │  └─ Cart Item Card
│     │     ├─ Product Name
│     │     ├─ Qty Controls (+/-)
│     │     ├─ Price
│     │     └─ Remove Button
│     └─ Checkout Panel (3 cols)
│        ├─ Discount Controls
│        ├─ Summary Display
│        └─ Action Buttons
│
└─ Responsive Handlers
   ├─ Mobile viewport
   ├─ Tablet viewport
   └─ Desktop viewport
```

## 7. Data Flow: Adding Product to Cart

```
User Action:
Click [+] on Product Card
│
├─ Event Handler
│  └─ handleAddProduct(productId)
│     │
│     ├─ Find product from products array
│     │  └─ product = products.find(p => p.id === productId)
│     │
│     ├─ Create SaleItem object
│     │  └─ {
│     │      id: uuid,
│     │      product_id: product.id,
│     │      product_name: product.name,
│     │      quantity: 1,
│     │      unit_price: product.selling_price,
│     │      tax_percentage: product.tax_percentage,
│     │      discount_percentage: 0,
│     │      subtotal: product.selling_price,
│     │      tax_amount: calculated,
│     │      discount_amount: 0,
│     │      total_amount: calculated
│     │    }
│     │
│     └─ Call addItem(saleItem)
│        │
│        └─ usePOSStore.addItem()
│           │
│           ├─ If no current sale: Create new sale with item
│           ├─ If sale exists:
│           │  ├─ Check if product already in cart
│           │  ├─ If exists: Increment quantity
│           │  └─ If not: Add new item
│           │
│           └─ Update store state
│              │
│              └─ UI re-renders
│                 │
│                 ├─ New item appears in cart
│                 ├─ Cart totals recalculate
│                 ├─ Item count updates
│                 └─ Checkout button enabled

```

## 8. Shop Switching Flow

```
User Interaction:
Click Shop Selector in Header
│
├─ Dropdown Opens
│  └─ Shows all shops (maps from shops[])
│
├─ User Selects Different Shop
│  └─ onClick={() => switchShop(shopId)}
│
├─ switchShop(shopId) in useAuthStore
│  │
│  ├─ Find selected shop from shops array
│  │  └─ selectedShop = shops.find(s => s.id === shopId)
│  │
│  └─ Update store
│     └─ set({ shop: selectedShop })
│
├─ POS useEffect detects shop.id change
│  │
│  ├─ shop.id !== previous shop.id ✓
│  │
│  └─ Dependency array triggers: [shop?.id]
│     │
│     ├─ Call fetchProducts(shop.id)
│     │  └─ Fetch from store: "/api/products?shopId=..."
│     │
│     ├─ Call fetchCustomers(shop.id)
│     │  └─ Fetch from store: "/api/customers?shopId=..."
│     │
│     └─ Update state with new data
│        │
│        └─ UI Re-renders
│           │
│           ├─ Products Grid updates
│           ├─ Customers dropdown updates
│           ├─ Shop selector shows new shop as active
│           └─ Cart persists (items remain)
```

## 9. Discount Calculation Flow

```
                    Items in Cart
                    ┌────────────┐
                    │ item1: ₹100│
                    │ item2: ₹200│ → Subtotal = ₹300
                    └────────────┘
                           │
                           ↓
                    ┌─────────────┐
                    │ Calculate   │
                    │ Item Tax    │
                    │ (if tax %)  │ → Tax = ₹30
                    └─────────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │ Item Discount    │
                    │ (if any set on   │ → Item Discount = ₹10
                    │  individual item)│
                    └──────────────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │ Cart-Level       │
                    │ Discount %/Fixed │ → Cart Discount = ₹5
                    │ Toggle % vs ₹    │   (or % of subtotal)
                    └──────────────────┘
                           │
                           ↓
                    ┌──────────────────┐
                    │ Final Calc       │
                    │ Total =          │
                    │ Sub + Tax        │
                    │ - Item Disc      │
                    │ - Cart Disc      │ → Total = ₹315
                    └──────────────────┘
```

## 10. Responsive Grid Breakdown

```
MOBILE (< 640px):
┌─────────────────────────────┐
│ [2 col grid]                │
│ ┌──────┐ ┌──────┐           │
│ │ Prod │ │ Prod │           │
│ ├──────┤ ├──────┤           │
│ │ Prod │ │ Prod │           │
│ └──────┘ └──────┘           │
└─────────────────────────────┘

TABLET (640px - 1024px):
┌──────────────────────────────────┐
│ [3 col grid]                     │
│ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ Prod │ │ Prod │ │ Prod │      │
│ ├──────┤ ├──────┤ ├──────┤      │
│ │ Prod │ │ Prod │ │ Prod │      │
│ └──────┘ └──────┘ └──────┘      │
└──────────────────────────────────┘

DESKTOP (> 1024px):
┌───────────────────────────────────────────┐
│ [4 col grid]                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ Prod │ │ Prod │ │ Prod │ │ Prod │      │
│ ├──────┤ ├──────┤ ├──────┤ ├──────┤      │
│ │ Prod │ │ Prod │ │ Prod │ │ Prod │      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
└───────────────────────────────────────────┘
```

---

These diagrams provide visual understanding of:
- Application flow and user journey
- Component hierarchy and structure
- State management relationships
- Multi-shop architecture
- Data transformations
- Responsive behavior
