'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomersStore, useAuthStore } from '@/lib/store';
import { Search, DollarSign, AlertCircle, Plus, X } from 'lucide-react';

export default function KhataPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { customers, khata, updateKhataBalance } = useCustomersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedKhataId, setSelectedKhataId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredKhata = khata.filter((k) => {
    const customer = customers.find((c) => c.id === k.customer_id);
    return (
      customer &&
      (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery))
    );
  });

  const totalOutstanding = khata.reduce((sum, k) => sum + Math.max(0, k.total_credit - k.amount_paid), 0);
  const totalCredit = khata.reduce((sum, k) => sum + k.total_credit, 0);
  const totalPaid = khata.reduce((sum, k) => sum + k.amount_paid, 0);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown';
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedKhataId || !paymentAmount) {
      setError('Please select khata and enter payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      updateKhataBalance(selectedKhataId, amount);
      setPaymentAmount('');
      setSelectedKhataId(null);
      setShowPaymentForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Khata Management</h1>
              <p className="text-slate-600">Track customer credit and payments</p>
            </div>
            <Button
              onClick={() => setShowPaymentForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs {totalCredit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-slate-600">Given to customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">Rs {totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-slate-600">Recovered from customers</p>
              </CardContent>
            </Card>

            <Card className={totalOutstanding > 0 ? 'border-orange-200 bg-orange-50' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                  Rs {totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-slate-600">To be collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          {showPaymentForm && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Record Customer Payment</CardTitle>
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setError('');
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Select Customer *</Label>
                      <select
                        id="customer"
                        value={selectedKhataId || ''}
                        onChange={(e) => setSelectedKhataId(e.target.value || null)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        required
                      >
                        <option value="">-- Select Customer --</option>
                        {filteredKhata.map((k) => {
                          const balance = k.total_credit - k.amount_paid;
                          return (
                            <option key={k.id} value={k.id}>
                              {getCustomerName(k.customer_id)} - Due: Rs {balance}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Payment Amount (Rs) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (isNaN(val) || val < 0) setPaymentAmount('0');
                        }}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Recording...' : 'Record Payment'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
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
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Khata List */}
          {filteredKhata.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg">
                  {searchQuery ? 'No khata records found' : 'No credit transactions yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredKhata.map((k) => {
                const balance = k.total_credit - k.amount_paid;
                const isOverdue = balance > 0;

                return (
                  <Card key={k.id} className={isOverdue ? 'border-orange-200 bg-orange-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-bold text-slate-900">{getCustomerName(k.customer_id)}</p>
                          <p className="text-xs text-slate-600">Customer Account</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-slate-600">Total Credit</p>
                          <p className="font-bold text-slate-900">Rs {k.total_credit}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-slate-600">Paid Amount</p>
                          <p className="font-bold text-green-700">Rs {k.amount_paid}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-slate-600">Outstanding</p>
                          <p className={`font-bold text-lg ${isOverdue ? 'text-orange-700' : 'text-green-700'}`}>
                            Rs {balance}
                          </p>
                        </div>

                        <div className="flex justify-end">
                          {isOverdue && (
                            <div className="flex items-center gap-1 text-orange-700 text-xs">
                              <AlertCircle className="h-4 w-4" />
                              <span>Due</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
