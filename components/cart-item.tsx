'use client';

import { SaleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: SaleItem;
  onQuantityChange?: (quantity: number) => void;
  onDiscountChange?: (percentageDiscount?: number, amountDiscount?: number) => void;
  onRemove?: () => void;
}

export function CartItem({
  item,
  onQuantityChange,
  onDiscountChange,
  onRemove,
}: CartItemProps) {
  const discountDisplay = item.discount_percentage > 0
    ? `${item.discount_percentage}% off`
    : item.discount_amount > 0
    ? `Rs. ${item.discount_amount} off`
    : '';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
      {/* Item Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm truncate">
            {item.product_name}
          </h4>
          <p className="text-xs text-slate-600">
            Rs. {item.unit_price.toFixed(2)}/{item.quantity}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2 bg-slate-50 rounded p-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onQuantityChange?.(Math.max(1, item.quantity - 1))}
          className="h-6 w-6 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onQuantityChange?.(parseInt(e.target.value) || 1)}
          className="h-6 w-12 text-center text-xs border-0 px-1"
          min="1"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onQuantityChange?.(item.quantity + 1)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Discounts */}
      {discountDisplay && (
        <div className="text-xs text-slate-600 bg-green-50 px-2 py-1 rounded">
          Discount: {discountDisplay}
        </div>
      )}

      {/* Totals */}
      <div className="space-y-1 border-t border-slate-100 pt-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal:</span>
          <span className="font-medium">Rs. {item.subtotal.toFixed(2)}</span>
        </div>
        {item.discount_amount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-Rs. {item.discount_amount.toFixed(2)}</span>
          </div>
        )}
        {item.tax_amount > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Tax ({item.tax_percentage}%):</span>
            <span className="font-medium">Rs. {item.tax_amount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
          <span className="font-semibold text-slate-900">Total:</span>
          <span className="font-bold text-slate-900">Rs. {item.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
