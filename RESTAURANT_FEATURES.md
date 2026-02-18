# Restaurant Features Implementation

## ✨ Features Implemented

### 1. **Table Mode for Restaurants**
- **Signup Enhancement**: When selecting "Restaurant" category, users can enable table mode
- **Table Configuration**: Set total number of tables (1-100)
- **POS Integration**: Table number selector appears in checkout for restaurant mode
- **Order Tracking**: Each sale can be assigned to a specific table

#### How it works:
1. During signup, select "Restaurant" category
2. Check "Enable Table Mode" checkbox
3. Set total number of tables
4. In POS, select table number before completing sale
5. Table number is saved with the sale record

### 2. **Recipe Management System**
- **Recipe Creation**: Create recipes from raw materials
- **Ingredient Tracking**: Link finished products to raw material ingredients
- **Inventory Integration**: Track raw material usage
- **Yield Management**: Specify how many units a recipe produces

#### How it works:
1. Mark products as "Raw Materials" in product management
2. Go to Recipes page (visible only for restaurants)
3. Create recipe by:
   - Selecting final product
   - Adding raw material ingredients with quantities
   - Setting yield quantity
4. System tracks ingredient usage when product is sold

### 3. **Enhanced UI for Restaurants**
- **Orange Theme**: Restaurant-specific orange color scheme
- **Chef Icons**: Recipe management with chef hat icons
- **Table Icons**: Utensils icons for table selection
- **Category-Based Menus**: Recipes menu only shows for restaurants

## 📋 Database Schema Updates

### Shop Table
```typescript
{
  table_mode_enabled?: boolean;  // Enable table mode
  total_tables?: number;         // Total number of tables
}
```

### Product Table
```typescript
{
  is_raw_material?: boolean;     // Mark as ingredient
  has_recipe?: boolean;          // Has recipe defined
}
```

### Recipe Table
```typescript
{
  id: string;
  product_id: string;            // Final product
  ingredients: RecipeIngredient[];
  yield_quantity: number;
  created_at: string;
  updated_at: string;
}
```

### RecipeIngredient
```typescript
{
  product_id: string;            // Raw material ID
  product_name: string;
  quantity: number;
  unit: string;
}
```

### Sale Table
```typescript
{
  table_number?: number;         // Table assignment
}
```

## 🎨 UI Enhancements

### Restaurant-Specific Colors
- Primary: Orange (#EA580C)
- Accent: Red (#DC2626)
- Background: Orange-50 to Red-50 gradient

### Role-Based Access
- **Owner/Manager**: Full access to recipes
- **Cashier/Staff**: Can select tables in POS
- **All Roles**: See table number in sales

## 🚀 Usage Guide

### For Restaurant Owners:
1. **Setup**: Enable table mode during signup
2. **Products**: Mark raw materials (flour, oil, spices, etc.)
3. **Recipes**: Create recipes for menu items (Momo, Chowmein, etc.)
4. **POS**: Staff can assign orders to tables
5. **Reports**: Track sales by table

### Example Recipe:
**Product**: Chicken Momo (10 pieces)
**Ingredients**:
- Flour: 200g
- Chicken: 150g
- Oil: 20ml
- Spices: 10g
**Yield**: 10 pieces

When 1 order of Chicken Momo is sold:
- Inventory deducts: 200g flour, 150g chicken, 20ml oil, 10g spices
- Sale records: Table number, items, total

## 📱 Mobile Responsive
- Table selector works on mobile
- Recipe management optimized for tablets
- Touch-friendly interface

## 🔐 Security
- Role-based access to recipes
- Only restaurant category sees recipe menu
- Table mode optional per shop

## 🎯 Future Enhancements
- Table status (available/occupied/reserved)
- Kitchen display system
- Recipe cost calculation
- Batch cooking tracking
- Table reservation system
