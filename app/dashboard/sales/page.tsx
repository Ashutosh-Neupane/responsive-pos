'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, useSalesStore } from '@/lib/store';
import { Receipt, Calendar, DollarSign } from 'lucide-react';
import { RoleGuard } from '@/components/role-guard';

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { sales } = useSalesStore();

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
                      <div className="flex items-center justify-between">
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

                        {/* Right: Amounts */}
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
      </div>
    </RoleGuard>
  );
}
