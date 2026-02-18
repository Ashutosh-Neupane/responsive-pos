'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesStore, useExpensesStore, useProductsStore, useCustomersStore, useAuthStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sales } = useSalesStore();
  const { expenses } = useExpensesStore();
  const { products } = useProductsStore();
  const { customers } = useCustomersStore();

  const [isLoading, setIsLoading] = useState(true);
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartData, setChartData] = useState<any>({
    dailyData: [],
    categoryData: [],
    paymentData: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      // Check if we have more than 2 months of data, default to monthly, else daily
      const allDates = [
        ...sales.map(s => new Date(s.created_at)),
        ...expenses.map(e => new Date(e.expense_date))
      ];
      
      const monthsDiff = allDates.length > 0 
        ? (new Date().getFullYear() - allDates[0].getFullYear()) * 12 + 
          (new Date().getMonth() - allDates[0].getMonth())
        : 0;
      
      const defaultView = monthsDiff > 2 ? 'monthly' : 'daily';
      setChartView(defaultView);

      // Generate last 7 days data
      const last7Days: Record<string, any> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days[dateStr] = { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: 0, expenses: 0 };
      }

      // Generate monthly data (last 12 months)
      const last12Months: Record<string, any> = {};
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        last12Months[monthStr] = { date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), sales: 0, expenses: 0 };
      }

      // Fill daily sales data
      sales.forEach((sale) => {
        const dateStr = sale.created_at.split('T')[0];
        if (last7Days[dateStr]) {
          last7Days[dateStr].sales += sale.total_amount;
        }
        const monthStr = sale.created_at.slice(0, 7);
        if (last12Months[monthStr]) {
          last12Months[monthStr].sales += sale.total_amount;
        }
      });

      // Fill daily expenses data
      expenses.forEach((expense) => {
        if (last7Days[expense.expense_date]) {
          last7Days[expense.expense_date].expenses += expense.amount;
        }
        const monthStr = expense.expense_date.slice(0, 7);
        if (last12Months[monthStr]) {
          last12Months[monthStr].expenses += expense.amount;
        }
      });

      const dailyData = Object.values(last7Days);
      const monthlyData = Object.values(last12Months);

      // Category breakdown
      const categoryMap: Record<string, number> = {};
      sales.forEach((sale) => {
        sale.items?.forEach((item: any) => {
          categoryMap[item.product_name] = (categoryMap[item.product_name] || 0) + item.total_amount;
        });
      });
      const categoryData = Object.entries(categoryMap)
        .slice(0, 5)
        .map(([name, value]) => ({ name: name.substring(0, 15), value }));

      // Payment methods breakdown
      const paymentMap: Record<string, number> = {};
      sales.forEach((sale) => {
        paymentMap[sale.payment_method] = (paymentMap[sale.payment_method] || 0) + sale.total_amount;
      });
      const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

      setChartData({ dailyData, monthlyData, categoryData, paymentData });
    } catch (error) {
      console.error('[v0] Error processing analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, sales, expenses]);

  if (!isAuthenticated) {
    return null;
  }

  // Calculate metrics
  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : '0';
  const avgOrderValue = sales.length > 0 ? (totalSales / sales.length).toFixed(0) : 0;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600">Business performance and insights</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Sales</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg sm:text-xl font-bold">
                  Rs {(totalSales / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-slate-600">{sales.length} tx</p>
              </CardContent>
            </Card>

            <Card className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg sm:text-xl font-bold">
                  Rs {(totalExpenses / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-slate-600">{expenses.length} items</p>
              </CardContent>
            </Card>

            <Card className={`p-3 sm:p-4 ${profit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Profit</CardTitle>
                <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent className="p-0">
                <div className={`text-lg sm:text-xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Rs {(profit / 1000).toFixed(0)}k
                </div>
                <p className="text-xs text-slate-600">{profitMargin}% margin</p>
              </CardContent>
            </Card>

            <Card className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Avg Order</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg sm:text-xl font-bold">Rs {avgOrderValue}</div>
                <p className="text-xs text-slate-600">Per tx</p>
              </CardContent>
            </Card>

            <Card className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg sm:text-xl font-bold">{products.length}</div>
                <p className="text-xs text-slate-600">In stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {!isLoading && (
            <div className="space-y-6">
              {/* Sales vs Expenses Chart */}
              {(chartView === 'daily' ? chartData.dailyData : chartData.monthlyData).length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sales vs Expenses</CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartView('daily')}
                        className={`px-3 py-1 text-xs rounded ${chartView === 'daily' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setChartView('monthly')}
                        className={`px-3 py-1 text-xs rounded ${chartView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartView === 'daily' ? chartData.dailyData : chartData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `Rs ${value}`} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#10b981" name="Sales" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                {chartData.categoryData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Products by Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `Rs ${value}`} />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Methods */}
                {chartData.paymentData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.paymentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: Rs ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.paymentData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `Rs ${value}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Report Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* General Ledger */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-slate-900 mb-3">General Ledger</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-700">Total Revenue:</span>
                          <span className="font-semibold">Rs {totalSales.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Total Expenses:</span>
                          <span className="font-semibold">Rs {totalExpenses.toFixed(0)}</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2 flex justify-between">
                          <span className="text-slate-900 font-semibold">Net Profit:</span>
                          <span className={`font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            Rs {profit.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accounting Summary */}
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <h3 className="font-bold text-slate-900 mb-3">Accounting</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-700">Cash Sales:</span>
                          <span className="font-semibold">Rs {(totalSales * 0.7).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Credit Sales:</span>
                          <span className="font-semibold">Rs {(totalSales * 0.3).toFixed(0)}</span>
                        </div>
                        <div className="border-t border-green-200 pt-2 flex justify-between">
                          <span className="text-slate-900 font-semibold">Outstanding:</span>
                          <span className="font-bold text-orange-700">Rs {(totalSales * 0.3).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Leisure Report (can be customized) */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <h3 className="font-bold text-slate-900 mb-3">Performance</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-700">Profit Margin:</span>
                          <span className="font-semibold">{profitMargin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700">Transactions:</span>
                          <span className="font-semibold">{sales.length}</span>
                        </div>
                        <div className="border-t border-purple-200 pt-2 flex justify-between">
                          <span className="text-slate-900 font-semibold">Avg Order:</span>
                          <span className="font-bold text-slate-900">Rs {avgOrderValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-100 rounded">
                      <p className="text-xs text-slate-600 font-medium">Total Customers</p>
                      <p className="text-2xl font-bold mt-1">{customers.length}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded">
                      <p className="text-xs text-slate-600 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold mt-1">{sales.length}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded">
                      <p className="text-xs text-slate-600 font-medium">Avg Transaction</p>
                      <p className="text-2xl font-bold mt-1">Rs {avgOrderValue}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded">
                      <p className="text-xs text-slate-600 font-medium">Profit Margin</p>
                      <p className="text-2xl font-bold mt-1">{profitMargin}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading analytics...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
