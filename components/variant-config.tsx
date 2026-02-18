'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Trash2 } from 'lucide-react';
import type { VariantType, VariantOption } from '@/lib/types';

interface VariantConfigProps {
  variantTypes: VariantType[];
  onChange: (variantTypes: VariantType[]) => void;
}

export function VariantConfig({ variantTypes, onChange }: VariantConfigProps) {
  const [newTypeName, setNewTypeName] = useState('');

  const addVariantType = () => {
    if (!newTypeName.trim()) return;
    onChange([...variantTypes, { name: newTypeName, options: [] }]);
    setNewTypeName('');
  };

  const removeVariantType = (index: number) => {
    onChange(variantTypes.filter((_, i) => i !== index));
  };

  const addOption = (typeIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options.push({ name: '', cost_price: 0, selling_price: 0 });
    onChange(updated);
  };

  const updateOption = (typeIndex: number, optionIndex: number, field: keyof VariantOption, value: string | number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options[optionIndex] = {
      ...updated[typeIndex].options[optionIndex],
      [field]: value,
    };
    onChange(updated);
  };

  const removeOption = (typeIndex: number, optionIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options = updated[typeIndex].options.filter((_, i) => i !== optionIndex);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Variant Configuration</Label>
      </div>

      {/* Add Variant Type */}
      <div className="flex gap-2">
        <Input
          placeholder="Variant type name (e.g., Type, Size, Color)"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addVariantType()}
        />
        <Button type="button" onClick={addVariantType} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Type
        </Button>
      </div>

      {/* Variant Types */}
      {variantTypes.map((variantType, typeIndex) => (
        <div key={typeIndex} className="border border-slate-300 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">{variantType.name}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariantType(typeIndex)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {variantType.options.map((option, optionIndex) => (
              <div key={optionIndex} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Option Name</Label>
                  <Input
                    placeholder="e.g., Chicken"
                    value={option.name}
                    onChange={(e) => updateOption(typeIndex, optionIndex, 'name', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Cost Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={option.cost_price}
                    onChange={(e) => updateOption(typeIndex, optionIndex, 'cost_price', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Selling Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={option.selling_price}
                    onChange={(e) => updateOption(typeIndex, optionIndex, 'selling_price', parseFloat(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(typeIndex, optionIndex)}
                    className="h-9 w-9 p-0 text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addOption(typeIndex)}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add {variantType.name} Option
          </Button>
        </div>
      ))}

      {variantTypes.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">
          Add variant types to create product variations with different prices
        </p>
      )}
    </div>
  );
}
