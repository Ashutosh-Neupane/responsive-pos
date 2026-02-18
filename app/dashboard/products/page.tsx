'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductForm } from '@/components/product-form';
import { ProductCard } from '@/components/product-card';
import { useProductsStore, useAuthStore } from '@/lib/store';
import { Plus, Search, X } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct } = useProductsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingVariantFor, setCreatingVariantFor] = useState<Product | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product);
      setEditingProduct(null);
    } else {
      addProduct(product);
      
      // Generate child products from variant configuration
      if (product.is_parent_product && product.variant_types && product.variant_types.length > 0) {
        generateVariantProducts(product);
      }
    }
    setShowForm(false);
    setCreatingVariantFor(null);
  };

  const generateVariantProducts = (parentProduct: Product) => {
    if (!parentProduct.variant_types || parentProduct.variant_types.length === 0) return;

    // Generate all combinations of variants
    const generateCombinations = (types: typeof parentProduct.variant_types): any[] => {
      if (!types || types.length === 0) return [];
      if (types.length === 1) {
        return types[0].options.map(opt => [{ type: types[0].name, option: opt }]);
      }
      
      const [first, ...rest] = types;
      const restCombinations = generateCombinations(rest);
      const combinations: any[] = [];
      
      first.options.forEach(opt => {
        if (restCombinations.length === 0) {
          combinations.push([{ type: first.name, option: opt }]);
        } else {
          restCombinations.forEach(combo => {
            combinations.push([{ type: first.name, option: opt }, ...combo]);
          });
        }
      });
      
      return combinations;
    };

    const combinations = generateCombinations(parentProduct.variant_types);
    
    combinations.forEach((combo, index) => {
      const variantName = combo.map((c: any) => c.option.name).join(' - ');
      const variantValues: Record<string, string> = {};
      let totalCost = 0;
      let totalSelling = 0;
      
      combo.forEach((c: any) => {
        variantValues[c.type] = c.option.name;
        totalCost += c.option.cost_price;
        totalSelling += c.option.selling_price;
      });
      
      const childProduct: Product = {
        id: `${parentProduct.id}-var-${index}`,
        shop_id: parentProduct.shop_id,
        sku: `${parentProduct.sku}-${index}`,
        name: `${parentProduct.name} - ${variantName}`,
        description: parentProduct.description,
        category: parentProduct.category,
        unit: parentProduct.unit,
        cost_price: totalCost,
        selling_price: totalSelling,
        margin_percentage: totalSelling > 0 ? ((totalSelling - totalCost) / totalSelling * 100) : 0,
        tax_percentage: parentProduct.tax_percentage,
        discount_percentage: parentProduct.discount_percentage,
        discount_amount: parentProduct.discount_amount,
        image_url: parentProduct.image_url,
        parent_product_id: parentProduct.id,
        is_parent_product: false,
        variant_values: variantValues,
        stock_quantity: parentProduct.stock_quantity,
        reorder_level: parentProduct.reorder_level,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      addProduct(childProduct);
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setCreatingVariantFor(null);
  };

  const handleCreateVariant = (parentProduct: Product) => {
    setCreatingVariantFor(parentProduct);
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Manage your product inventory</p>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <Card className="border-2 border-blue-200 bg-blue-50 sticky top-4 z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg sm:text-xl">
                  {editingProduct ? 'Edit Product' : creatingVariantFor ? `Create Variant for ${creatingVariantFor.name}` : 'Add New Product'}
                </CardTitle>
                <button
                  onClick={handleCancel}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent>
                <ProductForm
                  product={editingProduct || (creatingVariantFor ? { parent_product_id: creatingVariantFor.id, category: 'General' } as any : undefined)}
                  onSubmit={handleAddProduct}
                  onCancel={handleCancel}
                  parentProducts={products}
                />
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 text-lg mb-4">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
              {filteredProducts.map((product) => {
                const variants = products.filter(p => p.parent_product_id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variants={variants}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreateVariant={handleCreateVariant}
                    onDuplicate={(p) => {
                      const duplicated = { ...p, id: `prod-${Date.now()}`, name: `${p.name} (Copy)` };
                      addProduct(duplicated);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
