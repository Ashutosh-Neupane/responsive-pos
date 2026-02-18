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
import { Plus, Minus, Trash2, Search, DollarSign, ShoppingCart, X, RefreshCw, UtensilsCrossed, Printer } from 'lucide-react';
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
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { type: 'percentage' | 'fixed'; value: number }>>({});
  const [showInvoice, setShowInvoice] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

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

  // Calculate totals with VAT-inclusive pricing
  const items = currentSale?.items || [];
  
  // Subtotal is sum of all item prices (VAT already included)
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  
  // Calculate item-level discounts
  const itemLevelDiscount = items.reduce((sum, item) => {
    const discount = itemDiscounts[item.id];
    if (!discount || discount.value === 0) return sum;
    const itemSubtotal = item.unit_price * item.quantity;
    return sum + (discount.type === 'percentage' ? (itemSubtotal * discount.value / 100) : discount.value);
  }, 0);
  
  // Calculate cart-level discount on subtotal after item discounts
  const subtotalAfterItemDiscount = subtotal - itemLevelDiscount;
  const cartLevelDiscount = discountType === 'percentage' 
    ? (subtotalAfterItemDiscount * cartDiscount / 100) 
    : cartDiscount;
  
  const totalDiscount = itemLevelDiscount + cartLevelDiscount;
  const netAmount = subtotal - totalDiscount;
  
  // Reverse calculate VAT from net amount (VAT is 13% of base, so price = base * 1.13)
  // base = netAmount / 1.13, VAT = netAmount - base
  const totalTax = netAmount - (netAmount / 1.13);
  const totalAmount = netAmount;

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
      // Generate IRD-compliant invoice number: INV-YYYY-NNNN
      const year = new Date().getFullYear();
      const invoiceCount = (useSalesStore.getState().sales.length + 1).toString().padStart(4, '0');
      const invoiceNumber = `INV-${year}-${invoiceCount}`;
      
      const sale: Sale = {
        id: uuidv4(),
        shop_id: shop.id,
        sale_number: invoiceNumber,
        customer_id: selectedCustomer || undefined,
        table_number: selectedTable || undefined,
        items,
        subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount + cartDiscount,
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

      // Show invoice
      setCompletedSale(sale);
      setShowInvoice(true);
      
      // Clear cart
      clearSale();
      setSelectedCustomer(null);
      setSelectedTable(null);
      setSearchQuery('');
      setPaymentMethod('cash');
      setItemDiscounts({});
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
        <header className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-bold text-slate-900 flex-shrink-0">POS</h1>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ShopSelector />
              <LanguageSwitcher />
            </div>
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
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {items.map((item) => {
                    const variants = getVariants(item.product_id);
                    const product = products.find(p => p.id === item.product_id);
                    const itemDiscount = itemDiscounts[item.id] || { type: 'percentage', value: 0 };
                    
                    return (
                    <div key={item.id} className="bg-slate-50 rounded p-1.5 border text-xs">
                      {/* Main Row - One Line with Image */}
                      <div className="flex items-center gap-1.5">
                        {/* Product Image */}
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                          {product?.image_url ? (
                            <img src={product.image_url} alt={item.product_name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <span className="text-sm font-bold text-blue-600">{item.product_name.charAt(0)}</span>
                          )}
                        </div>
                        
                        {/* Product Name & Variant Selector */}
                        <div className="flex-1 min-w-0">
                          {variants.length > 0 ? (
                            <select
                              value={item.product_id}
                              onChange={(e) => switchVariant(item.id, e.target.value)}
                              className="w-full text-xs font-semibold bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                            >
                              <option value={item.product_id}>{item.product_name}</option>
                              {variants.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          ) : (
                            <p className="font-semibold truncate">{item.product_name}</p>
                          )}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-0.5 bg-white rounded border">
                          <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-0.5">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-semibold">{item.quantity}</span>
                          <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-0.5">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <span className="font-bold w-16 text-right">Rs {item.total_amount.toFixed(0)}</span>
                        
                        {/* Remove */}
                        <button onClick={() => removeItem(item.id)} className="text-red-600 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Discount Row */}
                      <div className="flex items-center gap-1 mt-1 pt-1 border-t">
                        <span className="text-[10px] text-slate-600">Disc:</span>
                        <select
                          value={itemDiscount.type}
                          onChange={(e) => setItemDiscounts({...itemDiscounts, [item.id]: {...itemDiscount, type: e.target.value as any}})}
                          className="text-[10px] border rounded px-1 py-0.5 w-12"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">Rs</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={itemDiscount.value || ''}
                          onChange={(e) => setItemDiscounts({...itemDiscounts, [item.id]: {...itemDiscount, value: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0}})}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val) || val < 0) {
                              setItemDiscounts({...itemDiscounts, [item.id]: {...itemDiscount, value: 0}});
                            }
                          }}
                          className="text-[10px] border rounded px-1 py-0.5 w-12"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-slate-500">@Rs {item.unit_price.toFixed(0)}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Summary & Actions */}
                <div className="flex-shrink-0 border-t">
                  {/* Summary */}
                  <div className="p-3 bg-slate-50 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                    </div>
                    {(totalDiscount > 0 || cartDiscount > 0) && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount:</span>
                        <span className="font-semibold">-Rs {(totalDiscount + cartDiscount).toFixed(0)}</span>
                      </div>
                    )}
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

                  {/* Total Discount Before VAT */}
                  <div className="px-3 py-2 border-t bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Extra Discount:</span>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="text-xs border rounded px-1 py-0.5 w-12"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Rs</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={cartDiscount || ''}
                        onChange={(e) => setCartDiscount(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val) || val < 0) setCartDiscount(0);
                        }}
                        className="text-xs border rounded px-2 py-0.5 w-16"
                        placeholder="0"
                      />
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
                {items.map((item) => {
                  const variants = getVariants(item.product_id);
                  return (
                  <div key={item.id} className="bg-slate-50 rounded p-2 border text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      {variants.length > 0 ? (
                        <select
                          value={item.product_id}
                          onChange={(e) => switchVariant(item.id, e.target.value)}
                          className="flex-1 text-xs font-semibold bg-white border rounded px-2 py-1"
                        >
                          <option value={item.product_id}>{item.product_name}</option>
                          {variants.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="flex-1 font-semibold">{item.product_name}</p>
                      )}
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
                  );
                })}
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

        {/* Invoice Modal */}
        {showInvoice && completedSale && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                <h2 className="font-bold text-lg">Invoice</h2>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.print()} className="bg-blue-600">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <button onClick={() => setShowInvoice(false)} className="text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 font-mono text-sm">
                {/* Invoice Header */}
                <div className="text-center border-b-2 border-dashed pb-3 mb-3">
                  <h1 className="text-lg font-bold">{shop?.name}</h1>
                  {shop?.ird_registered && <p className="text-xs font-bold mt-1">TAX INVOICE</p>}
                  <p className="text-xs mt-1">{shop?.address}</p>
                  <p className="text-xs">Phone: {shop?.phone}</p>
                  {shop?.pan_number && <p className="text-xs">PAN: {shop?.pan_number}</p>}
                  {shop?.vat_number && <p className="text-xs">VAT: {shop?.vat_number}</p>}
                </div>

                {/* Invoice Details */}
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{completedSale.sale_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(completedSale.created_at).toLocaleString()}</span>
                  </div>
                  {completedSale.table_number && (
                    <div className="flex justify-between">
                      <span>Table:</span>
                      <span className="font-bold">#{completedSale.table_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase">{completedSale.payment_method}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t-2 border-b-2 border-dashed py-2 mb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSale.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-1">{item.product_name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-right">{item.unit_price.toFixed(0)}</td>
                          <td className="text-right font-semibold">{item.subtotal.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs {completedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {completedSale.discount_amount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount:</span>
                      <span>-Rs {completedSale.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (13%):</span>
                    <span>Rs {completedSale.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t-2 pt-2 mt-2">
                    <span>TOTAL:</span>
                    <span>Rs {completedSale.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs border-t border-dashed pt-3 space-y-1">
                  <p className="font-semibold">Thank you for your visit!</p>
                  {shop?.ird_registered && (
                    <p className="text-xs text-slate-600">Computer generated invoice</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
