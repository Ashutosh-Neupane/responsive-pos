import type { StoreCategory } from './types';

// Default variant templates for each store category
export const defaultVariantTemplates: Record<StoreCategory, Record<string, string[]>> = {
  grocery: {
    Size: ['Small', 'Medium', 'Large', 'Extra Large'],
    Quantity: ['500g', '1kg', '2kg', '5kg', '10kg'],
    Pack: ['Single', 'Duo', 'Pack of 6', 'Pack of 12'],
  },
  pharmacy: {
    Strength: ['5mg', '10mg', '20mg', '50mg', '100mg'],
    PackageType: ['Bottle', 'Blister', 'Tube', 'Box'],
    Quantity: ['10 tablets', '20 tablets', '30 tablets', '60 tablets'],
  },
  restaurant: {
    TableSize: ['Table for 2', 'Table for 4', 'Table for 6', 'Table for 8+'],
    PortionSize: ['Single', 'Double', 'Family Size', 'Party Size'],
    SpicyLevel: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
    MealType: ['Breakfast', 'Lunch', 'Dinner', 'Dessert'],
  },
  retail: {
    Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    Color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Gray'],
    Material: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Blend'],
  },
  clothing: {
    Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    Color: ['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Pink', 'Gray', 'Brown', 'Beige'],
    Material: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Blend'],
    Fit: ['Slim', 'Regular', 'Relaxed', 'Oversized'],
  },
  electronics: {
    Color: ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Gold'],
    Storage: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
    Condition: ['New', 'Refurbished', 'Open Box'],
    Warranty: ['1 Year', '2 Years', '3 Years', 'Extended'],
  },
  general: {
    Size: ['Small', 'Medium', 'Large'],
    Color: ['Black', 'White', 'Red', 'Blue'],
  },
};

// Helper function to get templates for a category
export const getVariantTemplatesForCategory = (category: StoreCategory) => {
  return defaultVariantTemplates[category] || defaultVariantTemplates.general;
};

// Helper to create variant combinations for display
export const generateVariantCombinations = (
  templateNames: string[],
  templates: Record<string, string[]>
): string[] => {
  if (templateNames.length === 0) return [];

  const selected = templateNames.filter((name) => templates[name]);
  if (selected.length === 0) return [];

  // For first template, return all options
  if (selected.length === 1) {
    return templates[selected[0]];
  }

  // Generate combinations
  const combinations: string[] = [];
  const cartesian = (arrays: string[][], index: number = 0, current: string[] = []): void => {
    if (index === arrays.length) {
      combinations.push(current.join(' - '));
      return;
    }
    arrays[index].forEach((value) => {
      cartesian(arrays, index + 1, [...current, value]);
    });
  };

  const selectedArrays = selected.map((name) => templates[name]);
  cartesian(selectedArrays);
  return combinations;
};

// Validate variant option exists in template
export const isValidVariantOption = (
  templateName: string,
  option: string,
  templates: Record<string, string[]>
): boolean => {
  return templates[templateName]?.includes(option) || false;
};

// Get all available template names for quick selection
export const getQuickVariantNames = (category: StoreCategory): string[] => {
  const templates = getVariantTemplatesForCategory(category);
  return Object.keys(templates);
};
