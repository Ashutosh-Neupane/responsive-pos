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
  const { products, fetchProducts, getPOSProducts } = useProductsStore();
  const { currentSale, addItem, removeItem, updateItemQuantity, clearSale, setTable } = usePOSStore();
  const { customers, fetchCustomers } = useCustomersStore();
  const { addSale } = useSalesStore();
  const { user, shop } = useAuthStore();
  const { getProductStock, updateStock } = useInventoryStore();

  const isRestaurant = shop?.category === 'restaurant';
  const tableMode = shop?.table_mode_enabled || false;
  const totalTables = shop?.total_tables || 0;

  // Get only products that should show in POS
  const posProducts = getPOSProducts();

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
    ? posProducts.filter(
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 md:py-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h1 className="text-base md:text-2xl font-bold text-slate-900">POS</h1>
            <div className="flex items-center gap-2">
              <ShopSelector />
              <LanguageSwitcher />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(searchQuery ? searchResults : posProducts.slice(0, 100)).map((product) => {
                const stock = getStock(product.id);
                const isOutOfStock = stock === 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddProduct(product.id)}
                    className={`bg-white rounded-lg border p-2 cursor-pointer hover:shadow-md transition ${isOutOfStock ? 'opacity-50' : ''}`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-blue-600">{product.name.charAt(0)}</span>
                    </div>
                    <p className="font-semibold text-xs line-clamp-2 mb-1">{product.name}</p>
                    <p className="text-xs text-slate-500 mb-1">{isOutOfStock ? 'Out' : `Stock: ${stock}`}</p>
                    <p className="font-bold text-sm">Rs {product.selling_price.toFixed(0)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar - Full Height */}
          <div className="w-80 lg:w-96 bg-white border-l flex flex-col h-full">
            {/* Cart Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold">Cart ({items.length})</h2>
              <ShoppingCart className="h-5 w-5" />
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <ShoppingCart className="h-16 w-16 text-slate-300 mb-3" />
                <p className="text-slate-500">Cart is empty</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="bg-slate-50 rounded p-2 border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-sm line-clamp-1">{item.product_name}</p>
                          <p className="text-xs text-slate-600">Rs {item.unit_price.toFixed(0)}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-600 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white rounded border">
                          <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-1">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-bold text-sm">Rs {item.total_amount.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary & Actions */}
                <div className="flex-shrink-0 border-t">
                  {/* Summary */}
                  <div className="p-3 bg-slate-50 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                    </div>
                    {totalTax > 0 && (
                      <div className="flex justify-between">
                        <span>VAT (13%):</span>
                        <span className="font-semibold">Rs {totalTax.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>Total:</span>
                      <span className="text-blue-600">Rs {totalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="p-3 space-y-2">
                    {isRestaurant && tableMode && (
                      <select
                        value={selectedTable || ''}
                        onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      >
                        <option value="">Select Table</option>
                        {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>Table {num}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={selectedCustomer || ''}
                      onChange={(e) => setSelectedCustomer(e.target.value || null)}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value="">Walk-in</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 space-y-2">
                    <Button
                      onClick={handleCompleteSale}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 h-10"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Complete Sale'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { clearSale(); setSearchQuery(''); }}
                      className="w-full h-8 text-sm"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Cart Button */}
        {items.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="md:hidden fixed bottom-20 right-4 z-50 bg-blue-600 text-white rounded-full p-4 shadow-xl"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {items.length}
            </span>
          </button>
        )}

        {/* Mobile Cart Modal */}
        {showCart && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
                <h2 className="font-bold">Cart ({items.length})</h2>
                <button onClick={() => setShowCart(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded p-2 border">
                    <div className="flex justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.product_name}</p>
                        <p className="text-xs text-slate-600">Rs {item.unit_price.toFixed(0)}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white rounded border">
                        <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-2">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold">Rs {item.total_amount.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4 space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                  </div>
                  {totalTax > 0 && (
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span className="font-semibold">Rs {totalTax.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-1">
                    <span>Total:</span>
                    <span className="text-blue-600">Rs {totalAmount.toFixed(0)}</span>
                  </div>
                </div>
                <Button onClick={handleCompleteSale} disabled={isProcessing} className="w-full bg-green-600 h-12">
                  <DollarSign className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Complete Sale'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
