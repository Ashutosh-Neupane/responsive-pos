'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  Package,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onDuplicate?: (product: Product) => void;
  onCreateVariant?: (parentProduct: Product) => void;
  variants?: Product[];
  onViewVariants?: (productId: string) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateVariant,
  variants = [],
  onViewVariants,
}: ProductCardProps) {
  const [showVariants, setShowVariants] = useState(false);
  const isLowStock = product.stock_quantity !== undefined && 
    product.reorder_level !== undefined && 
    product.stock_quantity <= product.reorder_level;

  // Calculate final price after discounts
  const finalPrice = product.selling_price - 
    (product.discount_percentage ? (product.selling_price * product.discount_percentage / 100) : 0) - 
    (product.discount_amount || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col h-full">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-linear-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-300" />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <AlertCircle className="h-3 w-3" />
            Low Stock
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 min-h-12">
          {product.name}
        </h3>

        {/* SKU */}
        <p className="text-xs text-slate-500 font-mono mb-3">{product.sku}</p>

        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {product.stock_quantity !== undefined && (
            <Badge 
              variant={isLowStock ? 'destructive' : 'secondary'}
              className="text-xs font-semibold"
            >
              Stock: {product.stock_quantity} {product.unit}
            </Badge>
          )}
          {product.is_parent_product && variants.length > 0 && (
            <Badge variant="outline" className="text-xs font-semibold border-blue-300 text-blue-700">
              {variants.length} Variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-blue-600">
              Rs {finalPrice.toFixed(0)}
            </span>
            {(product.discount_percentage || product.discount_amount) && (
              <span className="line-through text-slate-400 text-sm">
                Rs {product.selling_price.toFixed(0)}
              </span>
            )}
          </div>
          {(product.discount_percentage || product.discount_amount) && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 font-semibold">
              {product.discount_percentage ? `${product.discount_percentage}% OFF` : `Rs ${product.discount_amount} OFF`}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-2 gap-1 p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(product)}
            className="h-9 text-xs font-medium hover:bg-blue-50 hover:text-blue-700"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete?.(product.id)}
            className="h-9 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {product.is_parent_product ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCreateVariant?.(product)}
              className="h-9 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Variant
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate?.(product)}
              className="h-9 text-xs font-medium hover:bg-slate-100"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Duplicate
            </Button>
          )}
          {product.is_parent_product && variants.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowVariants(!showVariants);
                onViewVariants?.(product.id);
              }}
              className="h-9 text-xs font-medium hover:bg-slate-100"
            >
              <ChevronDown className={`h-3.5 w-3.5 mr-1.5 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
              {showVariants ? 'Hide' : 'View'}
            </Button>
          )}
        </div>
      </div>

      {/* Variants List */}
      {showVariants && variants.length > 0 && (
        <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2 max-h-60 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Variants ({variants.length})</p>
          {variants.map((variant) => (
            <div key={variant.id} className="text-sm p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{variant.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{variant.sku}</p>
                  {variant.stock_quantity !== undefined && (
                    <p className="text-xs text-slate-600 mt-1">Stock: {variant.stock_quantity} {variant.unit}</p>
                  )}
                </div>
                <p className="font-bold text-blue-600 text-sm whitespace-nowrap">Rs {variant.selling_price.toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
