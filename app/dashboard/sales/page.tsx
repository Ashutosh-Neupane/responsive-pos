'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore, useSalesStore } from '@/lib/store';
import { Receipt, Calendar, DollarSign, Eye, Printer, X } from 'lucide-react';
import { RoleGuard } from '@/components/role-guard';
import type { Sale } from '@/lib/types';

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, user, shop } = useAuthStore();
  const { sales } = useSalesStore();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [invoiceSize, setInvoiceSize] = useState<'thermal' | 'a5' | 'a4'>('a4');
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Auto-select invoice size based on total amount
  const getDefaultInvoiceSize = (total: number): 'thermal' | 'a5' | 'a4' => {
    if (total < 5000) return 'thermal'; // Small receipt for under Rs 5,000
    if (total < 20000) return 'a5'; // Medium invoice for Rs 5,000-20,000
    return 'a4'; // Full invoice for Rs 20,000+
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <RoleGuard>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-8 w-8" />
                Sales Invoices
              </h1>
              <p className="text-slate-600">View all sales transactions</p>
            </div>

            {/* Sales List */}
            <div className="space-y-3">
              {sortedSales.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Receipt className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No sales yet</p>
                  </CardContent>
                </Card>
              ) : (
                sortedSales.map((sale) => (
                  <Card key={sale.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Invoice Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <span className="font-bold text-lg">{sale.sale_number}</span>
                            {sale.table_number && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                Table {sale.table_number}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              sale.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {sale.payment_status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(sale.created_at).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <span>•</span>
                            <span>{sale.items.length} items</span>
                            <span>•</span>
                            <span className="uppercase text-xs">{sale.payment_method}</span>
                          </div>
                        </div>

                        {/* Right: Amounts & Actions */}
                        <div className="flex flex-col items-end gap-2">
                        <div className="text-right space-y-1">
                          {sale.discount_amount > 0 && (
                            <div className="text-sm text-green-700">
                              Discount: -Rs {sale.discount_amount.toFixed(2)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 justify-end">
                            <DollarSign className="h-5 w-5 text-slate-600" />
                            <span className="text-2xl font-bold text-blue-600">
                              Rs {sale.total_amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            (incl. VAT Rs {sale.tax_amount.toFixed(2)})
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedSale(sale);
                            setInvoiceSize(getDefaultInvoiceSize(sale.total_amount));
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Invoice
                        </Button>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-2">
                          {sale.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {item.quantity}x {item.product_name}
                            </span>
                          ))}
                          {sale.items.length > 3 && (
                            <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">
                              +{sale.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Invoice Modal */}
        {selectedSale && (
          <>
            <style jsx global>{`
              @media print {
                @page.thermal { size: 80mm auto; margin: 5mm; }
                @page.a5 { size: A5; margin: 10mm; }
                @page.a4 { size: A4; margin: 10mm; }
                body * { visibility: hidden; }
                #invoice-print, #invoice-print * { visibility: visible; }
                #invoice-print { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 100%; 
                  margin: 0;
                }
                #invoice-print.thermal { max-width: 80mm; padding: 10px; font-size: 11px; }
                #invoice-print.a5 { max-width: 148mm; padding: 15px; font-size: 12px; }
                #invoice-print.a4 { max-width: 210mm; padding: 20px; font-size: 14px; }
                .print-hide { display: none !important; }
                .invoice-header-row { display: flex !important; }
              }
            `}</style>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between print-hide z-10">
                  <h2 className="font-bold text-lg">Invoice Preview</h2>
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      onClick={() => setShowPrintDialog(true)} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <button onClick={() => setSelectedSale(null)} className="text-slate-600 hover:text-slate-900">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>>
                      <select 
                        value={invoiceSize} 
                        onChange={(e) => setInvoiceSize(e.target.value as any)}
                        className="text-sm border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="thermal">Thermal (80mm) - Small</option>
                        <option value="a5">A5 - Medium</option>
                        <option value="a4">A4 - Full</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSale(null)} className="text-slate-600 hover:text-slate-900">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div id="invoice-print" className={`${invoiceSize === 'thermal' ? 'p-4 text-xs' : invoiceSize === 'a5' ? 'p-6 text-sm' : 'p-8'} ${invoiceSize}`}>
                  {/* Invoice Header Row - Invoice & Print */}
                  <div className="invoice-header-row flex items-center justify-between mb-6 pb-3 border-b-2 border-black">
                    <div>
                      <h2 className="text-2xl font-bold">INVOICE</h2>
                      <p className="text-sm text-slate-600 mt-1">{selectedSale.sale_number}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => window.print()} 
                      className="bg-blue-600 hover:bg-blue-700 print-hide"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  {/* Business Details */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">From:</h3>
                      <p className="font-bold text-base">{shop?.name}</p>
                      {shop?.ird_registered && <p className="text-xs font-semibold mt-1">TAX INVOICE</p>}
                      <p className="text-sm mt-1">{shop?.address}</p>
                      <p className="text-sm">Phone: {shop?.phone}</p>
                      {shop?.pan_number && <p className="text-sm">PAN: {shop?.pan_number}</p>}
                      {shop?.vat_number && <p className="text-sm">VAT: {shop?.vat_number}</p>}
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg mb-2">Invoice Details:</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-semibold">Date:</span> {new Date(selectedSale.created_at).toLocaleDateString('en-GB')}</p>
                        <p><span className="font-semibold">Time:</span> {new Date(selectedSale.created_at).toLocaleTimeString('en-GB')}</p>
                        {selectedSale.table_number && (
                          <p><span className="font-semibold">Table:</span> #{selectedSale.table_number}</p>
                        )}
                        <p><span className="font-semibold">Payment:</span> <span className="uppercase">{selectedSale.payment_method}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-y-2 border-black">
                          <th className="text-left py-2 px-3 font-bold">Item</th>
                          <th className="text-center py-2 px-3 font-bold">Qty</th>
                          <th className="text-right py-2 px-3 font-bold">Rate</th>
                          <th className="text-right py-2 px-3 font-bold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.items.map((item, idx) => (
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
                        <span>Subtotal:</span>
                        <span className="font-semibold">Rs {selectedSale.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedSale.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-700">
                          <span>Discount:</span>
                          <span className="font-semibold">-Rs {selectedSale.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>VAT (13%):</span>
                        <span className="font-semibold">Rs {selectedSale.tax_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-2">
                        <span>TOTAL:</span>
                        <span>Rs {selectedSale.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm border-t border-slate-300 pt-4 space-y-1">
                    <p className="font-semibold">Thank you for your business!</p>
                    {shop?.ird_registered && (
                      <p className="text-xs text-slate-600">This is a computer generated invoice</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Print Dialog */}
            {showPrintDialog && selectedSale && (
              <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-xl font-bold mb-4">Print Invoice</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select Invoice Size:
                      </label>
                      <select 
                        value={invoiceSize} 
                        onChange={(e) => setInvoiceSize(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="thermal">Thermal (80mm) - Small Receipt</option>
                        <option value="a5">A5 (148mm) - Medium Invoice</option>
                        <option value="a4">A4 (210mm) - Full Invoice</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        {invoiceSize === 'thermal' && 'Best for small transactions under Rs 5,000'}
                        {invoiceSize === 'a5' && 'Best for medium transactions Rs 5,000-20,000'}
                        {invoiceSize === 'a4' && 'Best for large transactions over Rs 20,000'}
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => {
                          setShowPrintDialog(false);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Now
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowPrintDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
