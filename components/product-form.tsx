'use client';

import { useState } from 'react';
import type { Product, VariantType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { BarcodeGenerator } from './barcode-generator';
import { VariantConfig } from './variant-config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
  onCancel?: () => void;
  categories?: string[];
  units?: string[];
  parentProducts?: Product[]; // For creating child products
}

const defaultUnits = ['piece', 'kg', 'liter', 'box', 'pack', 'gram', 'meter', 'dozen'];
const defaultCategories = ['General', 'Grains', 'Oils', 'Spices', 'Dairy', 'Vegetables', 'Fruits', 'Frozen'];

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  categories = defaultCategories,
  units = defaultUnits,
  parentProducts = [],
}: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      sku: '',
      category: 'General',
      unit: units[0],
      cost_price: 0,
      selling_price: 0,
      discount_percentage: 0,
      discount_amount: 0,
      tax_percentage: 5,
      stock_quantity: 0,
      reorder_level: 10,
      is_parent_product: false,
      variant_types: [],
      is_active: true,
    }
  );
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [selectedSku, setSelectedSku] = useState(product?.sku || '');

  const finalPrice = (formData.selling_price || 0) -
    ((formData.discount_percentage || 0) * (formData.selling_price || 0) / 100) -
    (formData.discount_amount || 0);

  const margin = formData.selling_price && formData.cost_price
    ? ((formData.selling_price - formData.cost_price) / formData.selling_price * 100).toFixed(2)
    : 0;

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      id: product?.id || `prod-${Date.now()}`,
      shop_id: product?.shop_id || 'shop-1',
      sku: selectedSku,
      margin_percentage: parseFloat(margin.toString()),
      is_active: true,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...formData,
    } as Product);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image_url: undefined });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Click to upload image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* SKU / Barcode */}
          <BarcodeGenerator
            initialSku={product?.sku}
            onSkuChange={setSelectedSku}
            allowManualInput={true}
          />
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cost Price (NPR) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.cost_price || ''}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, cost_price: 0 });
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Selling Price (NPR) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.selling_price || ''}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, selling_price: 0 });
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Margin Display */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700">
              Margin: <span className="font-semibold text-blue-600">{margin}%</span>
            </p>
          </div>

          {/* Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Percentage (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount_percentage || ''}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, discount_percentage: 0 });
                  else if (val > 100) setFormData({ ...formData, discount_percentage: 100 });
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Amount (NPR)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_amount || ''}
                onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, discount_amount: 0 });
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Final Price */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Final Price after Discounts</p>
            <p className="text-2xl font-bold text-slate-900">Rs. {finalPrice.toFixed(2)}</p>
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <Label>Tax Percentage (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.tax_percentage || ''}
              onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val) || val < 0) setFormData({ ...formData, tax_percentage: 0 });
                else if (val > 100) setFormData({ ...formData, tax_percentage: 100 });
              }}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label>Unit *</Label>
            <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={formData.stock_quantity || ''}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, stock_quantity: 0 });
                }}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input
                type="number"
                min="0"
                value={formData.reorder_level || ''}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 0) setFormData({ ...formData, reorder_level: 0 });
                }}
                placeholder="10"
              />
            </div>
          </div>

          {/* Parent Product Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <input
                type="checkbox"
                id="isParent"
                checked={formData.is_parent_product || false}
                onChange={(e) => setFormData({ ...formData, is_parent_product: e.target.checked, parent_product_id: undefined, variant_types: e.target.checked ? [] : undefined })}
                className="h-4 w-4"
              />
              <label htmlFor="isParent" className="text-sm font-medium text-slate-700 cursor-pointer">
                This is a parent product with variants
              </label>
            </div>

            {/* Variant Configuration for Parent Products */}
            {formData.is_parent_product && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <VariantConfig
                  variantTypes={formData.variant_types || []}
                  onChange={(variantTypes) => setFormData({ ...formData, variant_types: variantTypes })}
                />
              </div>
            )}

            {/* Child Product Selection */}
            {!formData.is_parent_product && parentProducts.length > 0 && (
              <div className="space-y-2">
                <Label>Parent Product (Optional)</Label>
                <Select 
                  value={formData.parent_product_id || 'none'} 
                  onValueChange={(v) => setFormData({ ...formData, parent_product_id: v === 'none' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Standalone Product</SelectItem>
                    {parentProducts.filter(p => p.is_parent_product).map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.parent_product_id && formData.parent_product_id !== 'none' && (
                  <p className="text-xs text-slate-600">
                    This product will be created as a variant of the selected parent product
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
