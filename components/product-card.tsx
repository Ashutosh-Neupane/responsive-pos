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
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image & Header */}
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Image */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                {product.name}
              </h3>
            </div>
            {isLowStock && (
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
          </div>

          {/* Stock Badge */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {product.stock_quantity !== undefined && (
              <Badge 
                variant={isLowStock ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {product.stock_quantity} {product.unit}
              </Badge>
            )}
            {product.is_parent_product && (
              <Badge variant="outline" className="text-xs">
                {variants.length} Variants
              </Badge>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-semibold text-slate-900">
              Rs. {finalPrice.toFixed(2)}
            </span>
            {(product.discount_percentage || product.discount_amount) ? (
              <>
                <span className="line-through text-slate-500 text-xs">
                  Rs. {product.selling_price.toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {product.discount_percentage ? `${product.discount_percentage}% off` : `Rs. ${product.discount_amount} off`}
                </Badge>
              </>
            ) : null}
          </div>

          {/* SKU */}
          <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex gap-1 p-2 sm:p-3 border-t border-slate-100 bg-slate-50 flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit?.(product)}
          className="flex-1 min-w-[60px] h-8"
        >
          <Edit className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline text-xs">Edit</span>
        </Button>
        {product.is_parent_product && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCreateVariant?.(product)}
            className="flex-1 min-w-[60px] h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Plus className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline text-xs">Variant</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDuplicate?.(product)}
          className="flex-1 min-w-[60px] h-8"
        >
          <Copy className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline text-xs">Copy</span>
        </Button>
        {product.is_parent_product && variants.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowVariants(!showVariants);
              onViewVariants?.(product.id);
            }}
            className="flex-1 min-w-[60px] h-8"
          >
            <ChevronDown className={`h-3 w-3 sm:mr-1 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline text-xs">View</span>
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete?.(product.id)}
          className="flex-1 min-w-[60px] h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline text-xs">Delete</span>
        </Button>
      </div>

      {/* Variants List */}
      {showVariants && variants.length > 0 && (
        <div className="border-t border-slate-100 p-3 sm:p-4 bg-slate-50 space-y-2">
          {variants.map((variant) => (
            <div key={variant.id} className="text-sm p-2 bg-white rounded border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{variant.name}</p>
                  <p className="text-xs text-slate-600">SKU: {variant.sku}</p>
                </div>
                <p className="font-semibold text-slate-900">Rs. {variant.selling_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
