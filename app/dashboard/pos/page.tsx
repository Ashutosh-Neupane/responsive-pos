'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useProductsStore,
  usePOSStore,
  useCustomersStore,
  useSalesStore,
  useAuthStore,
  useInventoryStore,
} from '@/lib/store';
import { Plus, Minus, Trash2, Search, DollarSign, ShoppingCart, X, RefreshCw, UtensilsCrossed } from 'lucide-react';
import type { SaleItem, Sale } from '@/lib/types';
import { ShopSelector } from '@/components/shop-selector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { v4 as uuidv4 } from 'uuid';

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online' | 'cheque' | 'credit'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [switchingVariant, setSwitchingVariant] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);

  // Get stores
  const { products, fetchProducts } = useProductsStore();
  const { currentSale, addItem, removeItem, updateItemQuantity, clearSale, setTable } = usePOSStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { addSale } = useSalesStore();
  const { user, shop } = useAuthStore();
  const { getProductStock, updateStock } = useInventoryStore();

  const isRestaurant = shop?.category === 'restaurant';
  const tableMode = shop?.table_mode_enabled || false;
  const totalTables = shop?.total_tables || 0;

  // Fetch data on mount and when shop changes
  useEffect(() => {
    const loadData = async () => {
      if (shop?.id) {
        await Promise.all([fetchProducts(shop.id), fetchCustomers()]);
      }
    };
    loadData();
  }, [shop?.id, fetchProducts, fetchCustomers]);

  // Get stock for a product
  const getStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.stock_quantity ?? getProductStock(productId);
  };

  // Get variants for a product
  const getVariants = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    if (product.parent_product_id) {
      return products.filter(p => p.parent_product_id === product.parent_product_id && p.id !== productId);
    }
    
    if (product.is_parent_product) {
      return products.filter(p => p.parent_product_id === product.id);
    }
    
    return [];
  };

  // Switch variant in cart
  const switchVariant = (itemId: string, newProductId: string) => {
    const item = items.find(i => i.id === itemId);
    const newProduct = products.find(p => p.id === newProductId);
    
    if (!item || !newProduct) return;
    
    const availableStock = getStock(newProductId);
    if (availableStock < item.quantity) {
      alert(`Insufficient stock! Only ${availableStock} available for ${newProduct.name}`);
      return;
    }
    
    removeItem(itemId);
    
    const saleItem: SaleItem = {
      id: uuidv4(),
      sale_id: '',
      product_id: newProduct.id,
      product_name: newProduct.name,
      quantity: item.quantity,
      unit_price: newProduct.selling_price,
      tax_percentage: newProduct.tax_percentage,
      discount_percentage: 0,
      subtotal: newProduct.selling_price * item.quantity,
      tax_amount: (newProduct.selling_price * newProduct.tax_percentage / 100) * item.quantity,
      discount_amount: 0,
      total_amount: (newProduct.selling_price + (newProduct.selling_price * newProduct.tax_percentage) / 100) * item.quantity,
    };
    
    addItem(saleItem);
    setSwitchingVariant(null);
  };

  // Search products
  const searchResults = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle adding product to cart
  function handleAddProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Check stock availability
    const availableStock = getStock(productId);
    const currentQtyInCart = items.find(item => item.product_id === productId)?.quantity || 0;
    
    if (availableStock <= currentQtyInCart) {
      alert(`Insufficient stock! Only ${availableStock} available.`);
      return;
    }

    const saleItem: SaleItem = {
      id: uuidv4(),
      sale_id: '',
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.selling_price,
      tax_percentage: product.tax_percentage,
      discount_percentage: 0,
      subtotal: product.selling_price,
      tax_amount: (product.selling_price * product.tax_percentage) / 100,
      discount_amount: 0,
      total_amount: product.selling_price + (product.selling_price * product.tax_percentage) / 100,
    };

    addItem(saleItem);
  }

  // Calculate totals
  const items = currentSale?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalTax = items.reduce((sum, item) => sum + item.tax_amount, 0);
  const itemDiscount = items.reduce((sum, item) => sum + item.discount_amount, 0);
  const cartLevelDiscount = discountType === 'percentage' ? (subtotal * cartDiscount) / 100 : cartDiscount;
  const totalDiscount = itemDiscount + cartLevelDiscount;
  const totalAmount = subtotal + totalTax - totalDiscount;

  // Handle complete sale
  async function handleCompleteSale() {
    if (items.length === 0) {
      alert('Please add items to the sale');
      return;
    }

    if (!user || !shop) {
      alert('User or shop not found');
      return;
    }

    setIsProcessing(true);

    try {
      const sale: Sale = {
        id: uuidv4(),
        shop_id: shop.id,
        sale_number: `SALE-${Date.now()}`,
        customer_id: selectedCustomer || undefined,
        table_number: selectedTable || undefined,
        items,
        subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'credit' ? 'pending' : 'paid',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add sale to store
      addSale(sale);

      // Update inventory for each item
      items.forEach(item => {
        const currentStock = getStock(item.product_id);
        updateStock(item.product_id, currentStock - item.quantity);
      });

      // Show success and reset
      alert(`Sale completed! Invoice: ${sale.sale_number}${selectedTable ? ` | Table: ${selectedTable}` : ''}`);
      clearSale();
      setSelectedCustomer(null);
      setSelectedTable(null);
      setSearchQuery('');
      setPaymentMethod('cash');
    } catch (error) {
      alert('Error completing sale');
      console.error('[v0] Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search & Info */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
            <div className="flex items-center gap-3">
              <ShopSelector />
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </header>

        {/* Main Layout - Products left, Cart right (vertical) */}
        <div className="flex-1 flex overflow-hidden gap-4 p-4 md:p-6 bg-slate-50">
          {/* Left: Products Grid - 4 columns */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-max pr-2">
                {(searchQuery ? searchResults : products.slice(0, 100)).map((product) => {
                  const stock = getStock(product.id);
                  const isOutOfStock = stock === 0;
                  return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddProduct(product.id)}
                    className={`flex flex-col rounded-lg border border-slate-200 bg-white hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer overflow-hidden ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      {/* Quick Add Button */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(product.id);
                        }}
                        className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-2 flex flex-col justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                        <p className={`text-xs mt-1 ${stock <= 10 ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                          {isOutOfStock ? 'Out of Stock' : `Stock: ${stock}`}
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-lg font-bold text-slate-900">Rs {product.selling_price.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart - Vertical */}
          <div className="w-96 flex flex-col bg-white rounded-lg border border-slate-300 shadow-lg overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Cart ({items.length})</h2>
              <ShoppingCart className="h-5 w-5" />
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-center">
                <ShoppingCart className="h-12 w-12 mb-3 text-slate-300" />
                <p className="text-sm">Add products from the left panel</p>
              </div>
            ) : (
              <>
                {/* Cart Items - Vertical List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 border-b border-slate-200 min-h-0">
                  {items.map((item) => {
                    const variants = getVariants(item.product_id);
                    const hasVariants = variants.length > 0;
                    const isShowingVariants = switchingVariant === item.id;
                    
                    return (
                    <div key={item.id} className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-2">{item.product_name}</p>
                          <p className="text-xs text-slate-600 mt-1">Rs {item.unit_price.toFixed(0)} each</p>
                        </div>
                        <div className="flex gap-1">
                          {hasVariants && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSwitchingVariant(isShowingVariants ? null : item.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 p-0 flex-shrink-0"
                              title="Switch variant"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isShowingVariants && (
                        <div className="space-y-1.5 border-t pt-2">
                          <p className="text-xs font-semibold text-slate-700">Switch to:</p>
                          <div className="space-y-1">
                            {variants.map((variant) => {
                              const variantStock = getStock(variant.id);
                              const canSwitch = variantStock >= item.quantity;
                              return (
                                <button
                                  key={variant.id}
                                  onClick={() => canSwitch && switchVariant(item.id, variant.id)}
                                  disabled={!canSwitch}
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs border ${
                                    canSwitch 
                                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 cursor-pointer' 
                                      : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{variant.name}</span>
                                    <span className="text-xs">Rs {variant.selling_price.toFixed(0)}</span>
                                  </div>
                                  {!canSwitch && (
                                    <span className="text-xs text-red-600">Insufficient stock ({variantStock})</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white rounded border border-slate-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-7 w-7 p-0 hover:bg-slate-100"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 p-0 hover:bg-slate-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="font-bold text-base">Rs {item.total_amount.toFixed(0)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Discount Section */}
                <div className="p-4 border-b border-slate-200 space-y-2.5">
                  <p className="text-sm font-semibold text-slate-700">Discount Type</p>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed Amount (Rs)</option>
                  </select>

                  <p className="text-sm font-semibold text-slate-700 mt-2">Discount Amount</p>
                  <Input
                    type="number"
                    min="0"
                    value={cartDiscount}
                    onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Summary Section */}
                <div className="p-4 border-b border-slate-200 space-y-2.5 text-sm bg-slate-50">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                  </div>
                  {totalTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax:</span>
                      <span className="font-semibold">Rs {totalTax.toFixed(0)}</span>
                    </div>
                  )}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-Rs {totalDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2.5 flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span className="text-blue-600 text-lg">Rs {totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Customer & Payment */}
                <div className="p-4 border-b border-slate-200 space-y-3">
                  {/* Table Selection for Restaurant */}
                  {isRestaurant && tableMode && (
                    <div>
                      <label className="text-sm font-semibold text-orange-700 block mb-1.5 flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        Table Number
                      </label>
                      <select
                        value={selectedTable || ''}
                        onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-orange-300 rounded text-sm bg-orange-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      >
                        <option value="">No Table</option>
                        {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            Table {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Customer</label>
                    <select
                      value={selectedCustomer || ''}
                      onChange={(e) => setSelectedCustomer(e.target.value || null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Walk-in</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                      <option value="cheque">Cheque</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-2.5">
                  <Button
                    onClick={handleCompleteSale}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 font-bold h-11 text-base"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      clearSale();
                      setSearchQuery('');
                      setCartDiscount(0);
                    }}
                    className="w-full text-sm h-9"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
