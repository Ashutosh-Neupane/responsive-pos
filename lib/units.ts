import type { StoreCategory } from './types';

export interface UnitOption {
  value: string;
  label: string;
  labelNe: string;
  category: StoreCategory[];
}

// Comprehensive units for different business types
export const UNITS: UnitOption[] = [
  // Weight Units
  { value: 'kg', label: 'Kilogram (kg)', labelNe: 'किलोग्राम', category: ['grocery', 'pharmacy', 'general'] },
  { value: 'gram', label: 'Gram (g)', labelNe: 'ग्राम', category: ['grocery', 'pharmacy', 'general'] },
  { value: 'mg', label: 'Milligram (mg)', labelNe: 'मिलिग्राम', category: ['pharmacy'] },
  { value: 'quintal', label: 'Quintal', labelNe: 'क्विन्टल', category: ['grocery', 'general'] },
  { value: 'ton', label: 'Ton', labelNe: 'टन', category: ['grocery', 'general'] },

  // Volume Units
  { value: 'liter', label: 'Liter (L)', labelNe: 'लिटर', category: ['grocery', 'pharmacy', 'general'] },
  { value: 'ml', label: 'Milliliter (ml)', labelNe: 'मिलिलिटर', category: ['grocery', 'pharmacy', 'general'] },
  { value: 'gallon', label: 'Gallon', labelNe: 'ग्यालन', category: ['grocery', 'general'] },

  // Count Units
  { value: 'piece', label: 'Piece (pcs)', labelNe: 'थान', category: ['retail', 'clothing', 'electronics', 'general'] },
  { value: 'dozen', label: 'Dozen', labelNe: 'दर्जन', category: ['retail', 'clothing', 'general'] },
  { value: 'pair', label: 'Pair', labelNe: 'जोडी', category: ['clothing', 'retail'] },
  { value: 'set', label: 'Set', labelNe: 'सेट', category: ['electronics', 'retail', 'general'] },
  { value: 'unit', label: 'Unit', labelNe: 'इकाई', category: ['electronics', 'retail', 'general'] },

  // Package Units
  { value: 'box', label: 'Box', labelNe: 'बक्स', category: ['grocery', 'pharmacy', 'retail', 'general'] },
  { value: 'packet', label: 'Packet', labelNe: 'प्याकेट', category: ['grocery', 'pharmacy', 'general'] },
  { value: 'bag', label: 'Bag', labelNe: 'झोला', category: ['grocery', 'general'] },
  { value: 'bottle', label: 'Bottle', labelNe: 'बोतल', category: ['grocery', 'pharmacy', 'restaurant', 'general'] },
  { value: 'can', label: 'Can', labelNe: 'क्यान', category: ['grocery', 'restaurant', 'general'] },
  { value: 'jar', label: 'Jar', labelNe: 'जार', category: ['grocery', 'general'] },
  { value: 'carton', label: 'Carton', labelNe: 'कार्टन', category: ['grocery', 'retail', 'general'] },

  // Restaurant-Specific Units
  { value: 'plate', label: 'Plate', labelNe: 'प्लेट', category: ['restaurant'] },
  { value: 'bowl', label: 'Bowl', labelNe: 'कचौरा', category: ['restaurant'] },
  { value: 'cup', label: 'Cup', labelNe: 'कप', category: ['restaurant'] },
  { value: 'glass', label: 'Glass', labelNe: 'गिलास', category: ['restaurant'] },
  { value: 'serving', label: 'Serving', labelNe: 'सर्भिङ', category: ['restaurant'] },
  { value: 'portion', label: 'Portion', labelNe: 'भाग', category: ['restaurant'] },
  { value: 'order', label: 'Order', labelNe: 'अर्डर', category: ['restaurant'] },
  { value: 'half-plate', label: 'Half Plate', labelNe: 'आधा प्लेट', category: ['restaurant'] },
  { value: 'full-plate', label: 'Full Plate', labelNe: 'पूरा प्लेट', category: ['restaurant'] },
  { value: 'small', label: 'Small', labelNe: 'सानो', category: ['restaurant'] },
  { value: 'medium', label: 'Medium', labelNe: 'मध्यम', category: ['restaurant'] },
  { value: 'large', label: 'Large', labelNe: 'ठूलो', category: ['restaurant'] },

  // Pharmacy-Specific Units
  { value: 'tablet', label: 'Tablet', labelNe: 'ट्याब्लेट', category: ['pharmacy'] },
  { value: 'capsule', label: 'Capsule', labelNe: 'क्याप्सुल', category: ['pharmacy'] },
  { value: 'strip', label: 'Strip', labelNe: 'स्ट्रिप', category: ['pharmacy'] },
  { value: 'vial', label: 'Vial', labelNe: 'शीशी', category: ['pharmacy'] },
  { value: 'injection', label: 'Injection', labelNe: 'सुई', category: ['pharmacy'] },
  { value: 'tube', label: 'Tube', labelNe: 'ट्यूब', category: ['pharmacy'] },

  // Clothing-Specific Units
  { value: 'meter', label: 'Meter (m)', labelNe: 'मिटर', category: ['clothing', 'retail'] },
  { value: 'yard', label: 'Yard', labelNe: 'गज', category: ['clothing'] },
  { value: 'roll', label: 'Roll', labelNe: 'रोल', category: ['clothing', 'retail'] },

  // Electronics-Specific Units
  { value: 'pack', label: 'Pack', labelNe: 'प्याक', category: ['electronics', 'retail', 'general'] },
  { value: 'bundle', label: 'Bundle', labelNe: 'बन्डल', category: ['electronics', 'retail', 'general'] },
];

// Get units for specific category
export function getUnitsForCategory(category: StoreCategory): UnitOption[] {
  return UNITS.filter(unit => 
    unit.category.includes(category) || unit.category.includes('general' as StoreCategory)
  );
}

// Get all units
export function getAllUnits(): UnitOption[] {
  return UNITS;
}

// Get unit label
export function getUnitLabel(value: string, language: 'en' | 'ne' = 'en'): string {
  const unit = UNITS.find(u => u.value === value);
  return unit ? (language === 'ne' ? unit.labelNe : unit.label) : value;
}

// Common restaurant units for quick access
export const RESTAURANT_UNITS = [
  'plate', 'bowl', 'cup', 'glass', 'serving', 'portion', 
  'half-plate', 'full-plate', 'small', 'medium', 'large',
  'bottle', 'can', 'piece', 'order'
];

// Common grocery units
export const GROCERY_UNITS = [
  'kg', 'gram', 'liter', 'ml', 'piece', 'packet', 
  'bag', 'bottle', 'box', 'dozen'
];

// Common pharmacy units
export const PHARMACY_UNITS = [
  'tablet', 'capsule', 'strip', 'bottle', 'vial', 
  'injection', 'tube', 'box', 'piece'
];
