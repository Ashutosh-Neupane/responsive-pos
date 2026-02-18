'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, useSalesStore, useExpensesStore, useProductsStore, useInventoryStore, useCustomersStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    outstandingCredit: 0,
    lowStockItems: 0,
  });

  // Get data from stores
  const { getSalesToday, getTotalSalesToday, sales } = useSalesStore();
  const { getExpensesToday, getTotalExpensesToday, expenses } = useExpensesStore();
  const { products } = useProductsStore();
  const { getLowStockProducts } = useInventoryStore();
  const { customers, khata } = useCustomersStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = () => {
      try {
        const salesToday = getSalesToday();
        const totalToday = getTotalSalesToday();
        const lowStock = getLowStockProducts();
        const outstandingTotal = khata.reduce((sum, k) => sum + Math.max(0, k.total_credit - k.amount_paid), 0);

        setStats({
          todaySales: totalToday,
          totalTransactions: salesToday.length,
          totalCustomers: customers.length,
          outstandingCredit: outstandingTotal,
          lowStockItems: lowStock.length,
        });
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, getSalesToday, getTotalSalesToday, getLowStockProducts, khata, customers]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
            </div>
          </div>

          {/* Quick Actions - Compact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/dashboard/pos" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                <DollarSign className="h-3 w-3 mr-1" />
                New Sale
              </Button>
            </Link>
            <Link href="/dashboard/products" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm">
                <Package className="h-3 w-3 mr-1" />
                Add Product
              </Button>
            </Link>
            <Link href="/dashboard/customers" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                <Users className="h-3 w-3 mr-1" />
                New Customer
              </Button>
            </Link>
            <Link href="/dashboard/analytics" className="w-full">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analytics
              </Button>
            </Link>
          </div>

          {/* Stats Grid - All in one line */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {/* Today's Sales */}
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Sales</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">Rs {(stats.todaySales / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-slate-600 mt-1">{stats.totalTransactions} tx</p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
            </Card>

            {/* Total Customers */}
            <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Customers</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalCustomers}</p>
                  <p className="text-xs text-slate-600 mt-1">Total</p>
                </div>
                <Users className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            </Card>

            {/* Outstanding Khata */}
            <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Khata Due</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">Rs {(stats.outstandingCredit / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-slate-600 mt-1">Pending</p>
                </div>
                <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0" />
              </div>
            </Card>

            {/* Low Stock Items */}
            <Card className={`p-3 ${stats.lowStockItems > 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200' : 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Low Stock</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.lowStockItems > 0 ? 'text-orange-900' : 'text-slate-900'}`}>{stats.lowStockItems}</p>
                  <p className="text-xs text-slate-600 mt-1">Items</p>
                </div>
                <Package className={`h-5 w-5 flex-shrink-0 ${stats.lowStockItems > 0 ? 'text-orange-600' : 'text-slate-600'}`} />
              </div>
            </Card>

            {/* Today's Expenses */}
            <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">Expenses</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">Rs {getTotalExpensesToday() > 0 ? (getTotalExpensesToday() / 1000).toFixed(0) + 'k' : '0'}</p>
                  <p className="text-xs text-slate-600 mt-1">Today</p>
                </div>
                <DollarSign className="h-5 w-5 text-red-600 flex-shrink-0" />
              </div>
            </Card>
          </div>

          {/* Alerts */}
            {stats.lowStockItems > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-orange-900">
                    <AlertCircle className="h-4 w-4" />
                    Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-orange-800">
                    {stats.lowStockItems} items are below reorder level.
                  </p>
                  <Link href="/dashboard/inventory">
                    <Button variant="outline" className="w-full text-orange-700 border-orange-300 hover:bg-orange-100">
                      View Inventory
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No sales recorded yet</p>
                  <Link href="/dashboard/pos">
                    <Button variant="outline" className="mt-4">
                      Start First Sale
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {sales.slice(-5).reverse().map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Sale {sale.sale_number}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(sale.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        Rs {sale.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
