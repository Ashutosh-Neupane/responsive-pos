'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExpensesStore, useAuthStore } from '@/lib/store';
import { Plus, Search, Trash2, DollarSign, X, Upload, Repeat2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Expense } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Supplies', 'Maintenance', 'Insurance', 'Transportation', 'Marketing', 'Other'];

interface ExpenseFormData {
  category: string;
  amount: number;
  description: string;
  payment_method: string;
  expense_date: string;
  receipt_image_url?: string;
  is_recurring?: boolean;
  recurring_type?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom';
  custom_repeat_days?: number;
  recurring_end_date?: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { expenses, addExpense } = useExpensesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: 'Supplies',
    amount: 0,
    description: '',
    payment_method: 'cash',
    expense_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_type: 'monthly',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredExpenses = expenses.filter(
    (e) =>
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReset = () => {
    setFormData({
      category: 'Supplies',
      amount: 0,
      description: '',
      payment_method: 'cash',
      expense_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_type: 'monthly',
    });
    setShowForm(false);
    setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, receipt_image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.category || formData.amount <= 0) {
      setError('Category and valid amount are required');
      return;
    }

    setIsSubmitting(true);

    try {
      let nextDueDate = undefined;
      if (formData.is_recurring) {
        const date = new Date(formData.expense_date);
        switch (formData.recurring_type) {
          case 'daily':
            date.setDate(date.getDate() + 1);
            break;
          case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
          case 'bi-weekly':
            date.setDate(date.getDate() + 14);
            break;
          case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
          case 'custom':
            date.setDate(date.getDate() + (formData.custom_repeat_days || 1));
            break;
        }
        nextDueDate = date.toISOString().split('T')[0];
      }

      const newExpense: Expense = {
        id: uuidv4(),
        shop_id: 'shop-1',
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        payment_method: formData.payment_method as any,
        receipt_image_url: formData.receipt_image_url,
        is_recurring: formData.is_recurring,
        recurring_type: formData.recurring_type,
        custom_repeat_days: formData.custom_repeat_days,
        next_due_date: nextDueDate,
        recurring_end_date: formData.recurring_end_date,
        expense_date: formData.expense_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addExpense(newExpense);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const todayExpenses = expenses.filter((e) => {
    const today = new Date().toISOString().split('T')[0];
    return e.expense_date === today;
  });

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
              <p className="text-slate-600">Track and manage business expenses</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs {todayTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-slate-600">{todayExpenses.length} entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs {totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-slate-600">{expenses.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(categoryTotals).length}</div>
                <p className="text-xs text-slate-600">Used categories</p>
              </CardContent>
            </Card>
          </div>

          {/* Form Modal */}
          {showForm && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Add New Expense</CardTitle>
                <button
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        required
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (Rs) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })
                        }
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val) || val < 0) setFormData({ ...formData, amount: 0 });
                        }}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <select
                        id="method"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional details about the expense"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="receipt">Receipt/Barcode Image</Label>
                      <div className="flex gap-2">
                        <input
                          id="receipt"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="receipt" className="flex-1">
                          <Button type="button" variant="outline" className="w-full justify-start" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.receipt_image_url ? 'Change Image' : 'Upload Image'}
                            </span>
                          </Button>
                        </label>
                        {formData.receipt_image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, receipt_image_url: undefined })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {formData.receipt_image_url && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                          <img src={formData.receipt_image_url} alt="Receipt" className="h-24 object-contain" />
                        </div>
                      )}
                    </div>

                    {/* Recurring Expense Section */}
                    <div className="space-y-2 md:col-span-2 border-t pt-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="recurring"
                          checked={formData.is_recurring || false}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_recurring: checked as boolean })
                          }
                        />
                        <Label htmlFor="recurring" className="cursor-pointer flex items-center gap-2">
                          <Repeat2 className="h-4 w-4" />
                          Make this a recurring expense
                        </Label>
                      </div>

                      {formData.is_recurring && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="space-y-2">
                            <Label htmlFor="recur-type">Repeat Frequency</Label>
                            <select
                              id="recur-type"
                              value={formData.recurring_type || 'monthly'}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  recurring_type: e.target.value as any,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="custom">Custom Days</option>
                            </select>
                          </div>

                          {formData.recurring_type === 'custom' && (
                            <div className="space-y-2">
                              <Label htmlFor="custom-days">Repeat Every (Days)</Label>
                              <Input
                                id="custom-days"
                                type="number"
                                min="1"
                                value={formData.custom_repeat_days || ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    custom_repeat_days: e.target.value === '' ? 1 : parseInt(e.target.value) || 1,
                                  })
                                }
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val) || val < 1) setFormData({ ...formData, custom_repeat_days: 1 });
                                }}
                                placeholder="e.g., 15"
                                className="text-sm"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="end-date">End Date (Optional)</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={formData.recurring_end_date || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, recurring_end_date: e.target.value })
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Saving...' : 'Add Expense'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by category or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Summary */}
          {Object.keys(categoryTotals).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(categoryTotals).map(([category, total]) => (
                    <div key={category} className="p-3 bg-slate-100 rounded text-center">
                      <p className="text-xs text-slate-600 font-medium">{category}</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">Rs {total}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expenses List */}
          {filteredExpenses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg mb-4">
                  {searchQuery ? 'No expenses found' : 'No expenses recorded yet'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Method</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{expense.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{expense.description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 capitalize">{expense.payment_method}</td>
                      <td className="px-4 py-3 text-sm font-bold text-right">Rs {expense.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
