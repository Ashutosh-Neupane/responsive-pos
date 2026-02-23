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
  useKOTStore,
} from '@/lib/store';
import { Plus, Minus, Trash2, Search, DollarSign, ShoppingCart, X, RefreshCw, UtensilsCrossed, Printer, Send } from 'lucide-react';
import type { SaleItem, Sale, KOT, KOTItem } from '@/lib/types';
import { ShopSelector } from '@/components/shop-selector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/lib/useTranslation';

export default function POSPage() {
  const { t, showVAT } = useTranslation();
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
  const { addKOT } = useKOTStore();

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
      alert(t('pos.insufficientStock', { stock: availableStock }));
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
      alert(t('pos.addItemsFirst'));
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

  // Handle send to kitchen (KOT)
  async function handleSendToKitchen() {
    if (items.length === 0) {
      alert(t('pos.addItemsFirst'));
      return;
    }

    if (!user || !shop) {
      alert('User or shop not found');
      return;
    }

    if (isRestaurant && tableMode && !selectedTable) {
      alert(t('pos.selectTable'));
      return;
    }

    try {
      const kotCount = (useKOTStore.getState().kots.length + 1).toString().padStart(4, '0');
      const kotNumber = `KOT-${kotCount}`;

      const kotItems: KOTItem[] = items.map(item => ({
        id: uuidv4(),
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
      }));

      const kot: KOT = {
        id: uuidv4(),
        shop_id: shop.id,
        kot_number: kotNumber,
        table_number: selectedTable || undefined,
        items: kotItems,
        status: 'pending',
        created_by: user.id,
        created_at: new Date().toISOString(),
      };

      addKOT(kot);
      alert(`KOT ${kotNumber} sent to kitchen!`);
    } catch (error) {
      alert('Error sending to kitchen');
      console.error('KOT Error:', error);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-bold text-slate-900 flex-shrink-0">{t('pos.title')}</h1>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={`${t('common.search')}...`}
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
          <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-20 md:pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(searchQuery ? searchResults : posProducts.slice(0, 100)).map((product) => {
                const stock = getStock(product.id);
                const isOutOfStock = stock === 0;
                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddProduct(product.id)}
                    className={`bg-white rounded-lg border p-2 cursor-pointer hover:shadow-md transition flex flex-col ${isOutOfStock ? 'opacity-50' : ''}`}
                  >
                    <div className="relative aspect-[4/3] sm:aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded flex items-center justify-center mb-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">{product.name.charAt(0)}</span>
                      )}
                      {/* Stock Badge - Top Left */}
                      <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold shadow-lg ${
                        isOutOfStock ? 'bg-red-500 text-white' : stock <= (product.reorder_level || 10) ? 'bg-orange-500 text-white' : 'bg-slate-800/80 text-white'
                      }`}>
                        {isOutOfStock ? t('pos.outOfStock') : `${t('pos.stock')}: ${stock}`}
                      </div>
                    </div>
                    <p className="font-semibold text-xs line-clamp-2 mb-0">{product.name}</p>
                    <div className="flex-1"></div>
                    <p className="font-bold text-sm">Rs {product.selling_price.toFixed(0)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar - Desktop Only */}
          <div className="hidden lg:flex w-80 lg:w-96 bg-white border-l flex-col h-full">
            {/* Cart Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold">{t('pos.cart')} ({items.length})</h2>
              <ShoppingCart className="h-5 w-5" />
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <ShoppingCart className="h-16 w-16 text-slate-300 mb-3" />
                <p className="text-slate-500">{t('pos.cartEmpty')}</p>
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
                      <span>{t('pos.subtotal')}:</span>
                      <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                    </div>
                    {(totalDiscount > 0 || cartDiscount > 0) && (
                      <div className="flex justify-between text-green-700">
                        <span>{t('pos.discount')}:</span>
                        <span className="font-semibold">-Rs {(totalDiscount + cartDiscount).toFixed(0)}</span>
                      </div>
                    )}
                    {showVAT() && totalTax > 0 && (
                      <div className="flex justify-between">
                        <span>{t('pos.vat')} (13%):</span>
                        <span className="font-semibold">Rs {totalTax.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>{t('pos.total')}:</span>
                      <span className="text-blue-600">Rs {totalAmount.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Total Discount Before VAT */}
                  <div className="px-3 py-2 border-t bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">{t('pos.extraDiscount')}:</span>
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
                        <option value="">{t('pos.selectTable')}</option>
                        {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>{t('pos.table')} {num}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={selectedCustomer || ''}
                      onChange={(e) => setSelectedCustomer(e.target.value || null)}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value="">{t('pos.walkIn')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value="cash">{t('pos.cash')}</option>
                      <option value="card">{t('pos.card')}</option>
                      <option value="online">{t('pos.online')}</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 space-y-2">
                    {isRestaurant && (
                      <Button
                        onClick={handleSendToKitchen}
                        className="w-full bg-orange-600 hover:bg-orange-700 h-10"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {t('pos.sendToKitchen')}
                      </Button>
                    )}
                    <Button
                      onClick={handleCompleteSale}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 h-10"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isProcessing ? t('common.processing') : t('pos.completeSale')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { clearSale(); setSearchQuery(''); }}
                      className="w-full h-8 text-sm"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      {t('common.clear')}
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
            className="lg:hidden fixed bottom-20 right-4 z-50 bg-blue-600 text-white rounded-full p-4 shadow-xl"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {items.length}
            </span>
          </button>
        )}

        {/* Mobile Cart Bottom Sheet */}
        {showCart && (
          <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
            {/* Semi-transparent backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowCart(false)} />
            
            {/* Cart Sheet */}
            <div className="relative w-full bg-white rounded-t-2xl flex flex-col shadow-2xl" style={{ maxHeight: 'calc(100vh - 80px)' }} onClick={(e) => e.stopPropagation()}>
              {/* Cart Header */}
              <div className="bg-blue-600 text-white px-3 py-2 flex items-center justify-between rounded-t-2xl flex-shrink-0">
                <h2 className="font-bold text-sm">{t('pos.cart')} ({items.length})</h2>
                <button onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
                {items.map((item) => {
                  const variants = getVariants(item.product_id);
                  const product = products.find(p => p.id === item.product_id);
                  const itemDiscount = itemDiscounts[item.id] || { type: 'percentage', value: 0 };
                  
                  return (
                  <div key={item.id} className="bg-slate-50 rounded p-1.5 border text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                        {product?.image_url ? (
                          <img src={product.image_url} alt={item.product_name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <span className="text-sm font-bold text-blue-600">{item.product_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {variants.length > 0 ? (
                          <select
                            value={item.product_id}
                            onChange={(e) => switchVariant(item.id, e.target.value)}
                            className="w-full text-xs font-semibold bg-transparent border-0 p-0 focus:ring-0"
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
                      <div className="flex items-center gap-0.5 bg-white rounded border">
                        <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-1">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-bold w-14 text-right">Rs {item.total_amount.toFixed(0)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-red-600 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
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
                          if (isNaN(val) || val < 0) setItemDiscounts({...itemDiscounts, [item.id]: {...itemDiscount, value: 0}});
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
              
              {/* Fixed Bottom Section */}
              <div className="flex-shrink-0 border-t bg-white">
                {/* Summary */}
                <div className="px-2 py-1 bg-slate-50 space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span>{t('pos.subtotal')}:</span>
                    <span className="font-semibold">Rs {subtotal.toFixed(0)}</span>
                  </div>
                  {(totalDiscount > 0 || cartDiscount > 0) && (
                    <div className="flex justify-between text-green-700">
                      <span>{t('pos.discount')}:</span>
                      <span className="font-semibold">-Rs {(totalDiscount + cartDiscount).toFixed(0)}</span>
                    </div>
                  )}
                  {showVAT() && totalTax > 0 && (
                    <div className="flex justify-between">
                      <span>{t('pos.vat')} (13%):</span>
                      <span className="font-semibold">Rs {totalTax.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t pt-0.5">
                    <span>{t('pos.total')}:</span>
                    <span className="text-blue-600">Rs {totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Extra Discount */}
                <div className="px-2 py-1 border-t bg-yellow-50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-700">{t('pos.extraDiscount')}:</span>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="text-[10px] border rounded px-1 py-0.5 w-10"
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
                      className="text-[10px] border rounded px-1 py-0.5 w-14"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Payment Options - 2 Column */}
                <div className="px-2 py-1 border-t">
                  <div className="grid grid-cols-2 gap-1">
                    {isRestaurant && tableMode && (
                      <select
                        value={selectedTable || ''}
                        onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
                        className="col-span-2 px-2 py-1 border rounded text-xs"
                      >
                        <option value="">{t('pos.table')}</option>
                        {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>{t('pos.table')} {num}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={selectedCustomer || ''}
                      onChange={(e) => setSelectedCustomer(e.target.value || null)}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      <option value="">{t('pos.walkIn')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      <option value="cash">{t('pos.cash')}</option>
                      <option value="card">{t('pos.card')}</option>
                      <option value="online">{t('pos.online')}</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-2 py-1.5 space-y-1">
                  {isRestaurant && (
                    <Button
                      onClick={handleSendToKitchen}
                      className="w-full bg-orange-600 hover:bg-orange-700 h-9 text-sm font-semibold"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {t('pos.sendToKitchen')}
                    </Button>
                  )}
                  <Button
                    onClick={handleCompleteSale}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm font-semibold"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    {isProcessing ? t('common.processing') : t('pos.completeSale')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { clearSale(); setSearchQuery(''); setShowCart(false); }}
                    className="w-full h-7 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && completedSale && (
          <>
            <style jsx global>{`
              @media print {
                @page { size: A4; margin: 10mm; }
                body * { visibility: hidden; }
                #invoice-print, #invoice-print * { visibility: visible; }
                #invoice-print { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 100%; 
                  max-width: 210mm;
                  margin: 0;
                  padding: 20px;
                }
                .print-hide { display: none !important; }
                .invoice-header-row { display: flex !important; }
              }
            `}</style>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between print-hide">
                  <h2 className="font-bold text-lg">{t('invoice.preview')}</h2>
                  <button onClick={() => setShowInvoice(false)} className="text-slate-600 hover:text-slate-900">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div id="invoice-print" className="p-8">
                  {/* Invoice Header Row - Invoice & Print */}
                  <div className="invoice-header-row flex items-center justify-between mb-6 pb-3 border-b-2 border-black">
                    <div>
                      <h2 className="text-2xl font-bold">{t('invoice.title')}</h2>
                      <p className="text-sm text-slate-600 mt-1">{completedSale.sale_number}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => window.print()} 
                      className="bg-blue-600 hover:bg-blue-700 print-hide"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      {t('common.print')}
                    </Button>
                  </div>

                  {/* Business Details */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('invoice.from')}:</h3>
                      <p className="font-bold text-base">{shop?.name}</p>
                      {shop?.ird_registered && <p className="text-xs font-semibold mt-1">{t('invoice.taxInvoice')}</p>}
                      <p className="text-sm mt-1">{shop?.address}</p>
                      <p className="text-sm">Phone: {shop?.phone}</p>
                      {shop?.pan_number && <p className="text-sm">PAN: {shop?.pan_number}</p>}
                      {shop?.vat_number && <p className="text-sm">VAT: {shop?.vat_number}</p>}
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg mb-2">{t('invoice.details')}:</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-semibold">{t('invoice.date')}:</span> {new Date(completedSale.created_at).toLocaleDateString('en-GB')}</p>
                        <p><span className="font-semibold">{t('invoice.time')}:</span> {new Date(completedSale.created_at).toLocaleTimeString('en-GB')}</p>
                        {completedSale.table_number && (
                          <p><span className="font-semibold">{t('pos.table')}:</span> #{completedSale.table_number}</p>
                        )}
                        <p><span className="font-semibold">{t('invoice.payment')}:</span> <span className="uppercase">{completedSale.payment_method}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-y-2 border-black">
                          <th className="text-left py-2 px-3 font-bold">{t('invoice.item')}</th>
                          <th className="text-center py-2 px-3 font-bold">{t('invoice.qty')}</th>
                          <th className="text-right py-2 px-3 font-bold">{t('invoice.rate')}</th>
                          <th className="text-right py-2 px-3 font-bold">{t('invoice.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedSale.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-300">
                            <td className="py-2 px-3">{item.product_name}</td>
                            <td className="text-center py-2 px-3">{item.quantity}</td>
                            <td className="text-right py-2 px-3">Rs {item.unit_price.toFixed(2)}</td>
                            <td className="text-right py-2 px-3 font-semibold">Rs {item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('pos.subtotal')}:</span>
                        <span className="font-semibold">Rs {completedSale.subtotal.toFixed(2)}</span>
                      </div>
                      {completedSale.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-700">
                          <span>{t('pos.discount')}:</span>
                          <span className="font-semibold">-Rs {completedSale.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {showVAT() && (
                        <div className="flex justify-between text-sm">
                          <span>{t('pos.vat')} (13%):</span>
                          <span className="font-semibold">Rs {completedSale.tax_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
                        <span>{t('pos.total').toUpperCase()}:</span>
                        <span>Rs {completedSale.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm border-t border-slate-300 pt-4 space-y-1">
                    <p className="font-semibold">{t('invoice.thankYou')}</p>
                    {shop?.ird_registered && (
                      <p className="text-xs text-slate-600">{t('invoice.computerGenerated')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
