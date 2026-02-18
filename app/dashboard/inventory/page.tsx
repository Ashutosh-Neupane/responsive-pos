'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductsStore, useInventoryStore, useAuthStore } from '@/lib/store';
import { Search, Edit2, AlertCircle, Plus, X } from 'lucide-react';
import type { Inventory } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { products } = useProductsStore();
  const { inventory, updateStock } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 0,
    reorder_level: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredInventory = inventory.filter((inv) => {
    const product = products.find((p) => p.id === inv.product_id);
    return (
      product &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const lowStockItems = filteredInventory.filter((inv) => inv.quantity <= inv.reorder_level);
  const outOfStockItems = filteredInventory.filter((inv) => inv.quantity === 0);

  const handleReset = () => {
    setFormData({
      product_id: '',
      quantity: 0,
      reorder_level: 0,
    });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.product_id) {
      setError('Please select a product');
      return;
    }

    if (formData.quantity < 0 || formData.reorder_level < 0) {
      setError('Quantity and reorder level cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        const item = inventory.find((i) => i.id === editingId);
        if (item) {
          updateStock(item.product_id, formData.quantity);
        }
      }
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Inventory) => {
    setFormData({
      product_id: item.product_id,
      quantity: item.quantity,
      reorder_level: item.reorder_level,
    });
    setEditingId(item.id);
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown Product';
  };

  const getProductSku = (productId: string) => {
    return products.find((p) => p.id === productId)?.sku || 'N/A';
  };

  const availableProducts = products.filter(
    (p) => !inventory.find((inv) => inv.product_id === p.id)
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
              <p className="text-slate-600">Track stock levels and reorder points</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-slate-600">In inventory</p>
              </CardContent>
            </Card>

            <Card className={lowStockItems.length > 0 ? 'border-yellow-200 bg-yellow-50' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-yellow-700' : ''}`}>
                  {lowStockItems.length}
                </div>
                <p className="text-xs text-slate-600">Below reorder level</p>
              </CardContent>
            </Card>

            <Card className={outOfStockItems.length > 0 ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${outOfStockItems.length > 0 ? 'text-red-700' : ''}`}>
                  {outOfStockItems.length}
                </div>
                <p className="text-xs text-slate-600">Zero quantity</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {outOfStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-900">
                  <AlertCircle className="h-4 w-4" />
                  Out of Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-red-800">
                  {outOfStockItems.slice(0, 3).map((item) => (
                    <p key={item.id}>• {getProductName(item.product_id)} ({getProductSku(item.product_id)})</p>
                  ))}
                  {outOfStockItems.length > 3 && <p>• +{outOfStockItems.length - 3} more items</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Section */}
          {editingId && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Update Stock Level</CardTitle>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Input
                        id="product"
                        value={getProductName(formData.product_id)}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Current Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reorder">Reorder Level</Label>
                      <Input
                        id="reorder"
                        type="number"
                        value={formData.reorder_level}
                        onChange={(e) =>
                          setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })
                        }
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
                      {isSubmitting ? 'Saving...' : 'Update Stock'}
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
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Inventory List */}
          {filteredInventory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg mb-4">
                  {searchQuery ? 'No inventory items found' : 'No inventory tracked yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">SKU</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Current Stock</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Reorder Level</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-700">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-700">Last Updated</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const isLowStock = item.quantity <= item.reorder_level && item.quantity > 0;
                    const isOutOfStock = item.quantity === 0;
                    const status = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';
                    const statusColor = isOutOfStock ? 'bg-red-100 text-red-700' : isLowStock ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

                    return (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{getProductName(item.product_id)}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{getProductSku(item.product_id)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.reorder_level}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-600">
                          {new Date(item.last_count_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
