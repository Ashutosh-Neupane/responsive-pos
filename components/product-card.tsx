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
      {/* Product Image - Wider aspect ratio for mobile */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-300" />
          </div>
        )}
        {/* Stock Badge - Top Left */}
        {product.stock_quantity !== undefined && (
          <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-xs font-semibold shadow-lg ${
            isLowStock ? 'bg-orange-500 text-white' : 'bg-slate-800/80 text-white'
          }`}>
            Stock: {product.stock_quantity}
          </div>
        )}
        {/* Variants Badge - Top Right */}
        {product.is_parent_product && variants.length > 0 && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-xs font-semibold shadow-lg bg-blue-600 text-white">
            {variants.length} Var
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-1.5 sm:p-3 flex-1 flex flex-col gap-0">
        {/* Name + SKU - No spacing */}
        <h3 className="font-bold text-slate-900 text-[11px] leading-tight sm:text-sm line-clamp-2 mb-0">
          {product.name}
        </h3>
        <p className="text-[9px] sm:text-xs text-slate-500 font-mono mb-0">{product.sku}</p>

        {/* Spacer to push price to bottom */}
        <div className="flex-1"></div>

        {/* Cost & Selling Price */}
        <div className="space-y-0">
          {/* Mobile: Stacked layout */}
          <div className="flex sm:hidden flex-col gap-0 text-[9px]">
            {product.cost_price > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Cost:</span>
                <span className="font-semibold text-slate-700">Rs {formatPrice(product.cost_price)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Sale:</span>
              <span className="font-bold text-blue-600">Rs {formatPrice(finalPrice)}</span>
            </div>
          </div>
          
          {/* Desktop: Inline layout */}
          <div className="hidden sm:flex items-center gap-2 text-xs flex-wrap">
            {product.cost_price > 0 && (
              <>
                <span className="text-slate-500">Cost:</span>
                <span className="font-semibold text-slate-700">Rs {formatPrice(product.cost_price)}</span>
                <span className="text-slate-300">|</span>
              </>
            )}
            <span className="text-slate-500">Sale:</span>
            <span className="font-bold text-blue-600 text-sm">Rs {formatPrice(finalPrice)}</span>
          </div>
          
          {(product.discount_percentage && product.discount_percentage > 0) || (product.discount_amount && product.discount_amount > 0) ? (
            <Badge className="text-[9px] sm:text-xs bg-green-100 text-green-700 px-1 sm:px-1.5 py-0 leading-tight h-3.5 sm:h-auto mt-0.5">
              {product.discount_percentage && product.discount_percentage > 0 ? `${product.discount_percentage}%` : `Rs ${formatPrice(product.discount_amount)}`}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 border-t border-slate-200 bg-slate-50">
        <button onClick={() => onEdit?.(product)} className="flex items-center justify-center py-1.5 sm:py-2.5 hover:bg-blue-50 hover:text-blue-700 transition text-slate-600">
          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <button onClick={() => onDuplicate?.(product)} className="flex items-center justify-center py-1.5 sm:py-2.5 hover:bg-slate-100 transition text-slate-600">
          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        {product.is_parent_product && (
          <button onClick={() => onCreateVariant?.(product)} className="flex items-center justify-center py-1.5 sm:py-2.5 hover:bg-green-50 hover:text-green-700 transition text-slate-600">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
        {product.is_parent_product && variants.length > 0 && (
          <button onClick={() => { setShowVariants(!showVariants); onViewVariants?.(product.id); }} className="flex items-center justify-center py-1.5 sm:py-2.5 hover:bg-slate-100 transition text-slate-600">
            <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
          </button>
        )}
        <button onClick={() => onDelete?.(product.id)} className="flex items-center justify-center py-1.5 sm:py-2.5 text-red-600 hover:bg-red-50 transition">
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
