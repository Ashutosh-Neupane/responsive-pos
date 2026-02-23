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

  const finalPrice = product.selling_price - 
    (product.discount_percentage ? (product.selling_price * product.discount_percentage / 100) : 0) - 
    (product.discount_amount || 0);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price === 0) return '';
    const formatted = price.toFixed(2);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col">
      {/* Product Image - Full Width */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-300" />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-lg">
            <AlertCircle className="h-3 w-3" />
            Low
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Name */}
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {/* SKU */}
        <p className="text-xs text-slate-500 font-mono mb-2">{product.sku}</p>
        
        {/* Stock & Variants */}
        <div className="flex gap-1.5 items-center flex-wrap mb-2">
          {product.stock_quantity !== undefined && (
            <Badge variant={isLowStock ? 'destructive' : 'secondary'} className="text-xs px-1.5 py-0">
              Stock: {product.stock_quantity}
            </Badge>
          )}
          {product.is_parent_product && variants.length > 0 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-300 text-blue-700">
              {variants.length} Variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Cost & Selling Price */}
        <div className="flex items-center gap-2 text-xs flex-wrap mt-auto">
          {product.cost_price > 0 && (
            <>
              <span className="text-slate-500">Cost:</span>
              <span className="font-semibold text-slate-700">Rs {formatPrice(product.cost_price)}</span>
              <span className="text-slate-300">|</span>
            </>
          )}
          <span className="text-slate-500">Sale:</span>
          <span className="font-bold text-blue-600 text-sm">Rs {formatPrice(finalPrice)}</span>
          {(product.discount_percentage || product.discount_amount) && (
            <Badge className="text-xs bg-green-100 text-green-700 px-1.5 py-0">
              {product.discount_percentage ? `${product.discount_percentage}% OFF` : `Rs ${formatPrice(product.discount_amount)} OFF`}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 border-t border-slate-200 bg-slate-50">
        <button onClick={() => onEdit?.(product)} className="flex items-center justify-center py-2.5 hover:bg-blue-50 hover:text-blue-700 transition text-slate-600">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => onDuplicate?.(product)} className="flex items-center justify-center py-2.5 hover:bg-slate-100 transition text-slate-600">
          <Copy className="h-4 w-4" />
        </button>
        {product.is_parent_product && (
          <button onClick={() => onCreateVariant?.(product)} className="flex items-center justify-center py-2.5 hover:bg-green-50 hover:text-green-700 transition text-slate-600">
            <Plus className="h-4 w-4" />
          </button>
        )}
        {product.is_parent_product && variants.length > 0 && (
          <button onClick={() => { setShowVariants(!showVariants); onViewVariants?.(product.id); }} className="flex items-center justify-center py-2.5 hover:bg-slate-100 transition text-slate-600">
            <ChevronDown className={`h-4 w-4 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
          </button>
        )}
        <button onClick={() => onDelete?.(product.id)} className="flex items-center justify-center py-2.5 text-red-600 hover:bg-red-50 transition">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Variants */}
      {showVariants && variants.length > 0 && (
        <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2 max-h-48 overflow-y-auto">
          {variants.map((variant) => (
            <div key={variant.id} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-xs truncate">{variant.name}</p>
                <p className="text-xs text-slate-500 font-mono">{variant.sku}</p>
              </div>
              <span className="font-bold text-blue-600 text-sm ml-2">Rs {formatPrice(variant.selling_price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
