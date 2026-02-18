'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomersStore, useAuthStore } from '@/lib/store';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { customers, addCustomer, updateCustomer, getCustomerKhata } = useCustomersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        const customer = customers.find((c) => c.id === editingId);
        if (customer) {
          updateCustomer({
            ...customer,
            ...formData,
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        const newCustomer: Customer = {
          id: uuidv4(),
          shop_id: 'shop-1',
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || '',
          address: formData.address || undefined,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        addCustomer(newCustomer);
      }
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      // Delete functionality
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
              <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
              <p className="text-slate-600">Manage your customer database</p>
            </div>
            <Button
              onClick={() => {
                handleReset();
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{editingId ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
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
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Ramesh Kumar"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., 9841234567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g., ramesh@example.com"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g., Kathmandu, Nepal"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Saving...' : editingId ? 'Update Customer' : 'Add Customer'}
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
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customers List */}
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg mb-4">
                  {searchQuery ? 'No customers found' : 'No customers yet'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => {
                const khata = getCustomerKhata(customer.id);
                const creditBalance = khata ? khata.balance : 0;

                return (
                  <Card key={customer.id} className="hover:shadow-lg transition">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{customer.name}</CardTitle>
                        {creditBalance > 0 && (
                          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Due: Rs {creditBalance}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700 truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700 text-xs">{customer.address}</span>
                          </div>
                        )}
                      </div>

                      {khata && (
                        <div className="p-3 bg-slate-100 rounded space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Total Credit:</span>
                            <span className="font-medium">Rs {khata.total_credit}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Paid Amount:</span>
                            <span className="font-medium">Rs {khata.total_paid}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t pt-1">
                            <span className="text-slate-600">Outstanding:</span>
                            <span className={`font-bold ${creditBalance > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                              Rs {creditBalance}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                          className="flex-1"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(customer.id)}
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
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
