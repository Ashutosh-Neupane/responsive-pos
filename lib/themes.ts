import type { StoreCategory, Theme } from './types';

// Professional color palettes for each store category
export const categoryThemes: Record<StoreCategory, Theme> = {
  grocery: {
    id: 'theme-grocery',
    category: 'grocery',
    primaryColor: '#22c55e', // Green - Fresh, natural
    accentColor: '#f97316', // Orange - Warmth, energy
    secondaryColor: '#eab308', // Yellow - Brightness
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    borderColor: '#e2e8f0',
  },
  pharmacy: {
    id: 'theme-pharmacy',
    category: 'pharmacy',
    primaryColor: '#0ea5e9', // Blue - Trust, medicine
    accentColor: '#06b6d4', // Cyan - Health, clarity
    secondaryColor: '#3b82f6', // Light blue - Professionalism
    backgroundColor: '#f0f9ff',
    textColor: '#0c2340',
    borderColor: '#cffafe',
  },
  restaurant: {
    id: 'theme-restaurant',
    category: 'restaurant',
    primaryColor: '#f97316', // Orange - Appetite, warmth
    accentColor: '#ef4444', // Red - Energy, urgency
    secondaryColor: '#fb923c', // Light orange - Vibrancy
    backgroundColor: '#fff7ed',
    textColor: '#431407',
    borderColor: '#fed7aa',
  },
  retail: {
    id: 'theme-retail',
    category: 'retail',
    primaryColor: '#a855f7', // Purple - Luxury, creativity
    accentColor: '#ec4899', // Pink - Modern, trendy
    secondaryColor: '#d946ef', // Magenta - Attractiveness
    backgroundColor: '#faf5ff',
    textColor: '#2e1065',
    borderColor: '#e9d5ff',
  },
  clothing: {
    id: 'theme-clothing',
    category: 'clothing',
    primaryColor: '#06b6d4', // Cyan - Fashion, style
    accentColor: '#8b5cf6', // Violet - Elegance
    secondaryColor: '#0ea5e9', // Blue - Trust
    backgroundColor: '#f0fdfa',
    textColor: '#0d3b3c',
    borderColor: '#ccfbf1',
  },
  electronics: {
    id: 'theme-electronics',
    category: 'electronics',
    primaryColor: '#1e40af', // Dark blue - Technology, stability
    accentColor: '#7c3aed', // Purple - Innovation
    secondaryColor: '#64748b', // Gray - Neutral, tech
    backgroundColor: '#f1f5f9',
    textColor: '#0f172a',
    borderColor: '#cbd5e1',
  },
  general: {
    id: 'theme-general',
    category: 'general',
    primaryColor: '#3b82f6', // Blue - Default, trustworthy
    accentColor: '#10b981', // Green - Positive
    secondaryColor: '#8b5cf6', // Purple - Balance
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    borderColor: '#e5e7eb',
  },
};

// Get theme for a category
export const getThemeForCategory = (category: StoreCategory): Theme => {
  return categoryThemes[category] || categoryThemes.general;
};

// Apply theme to CSS variables
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-border', theme.borderColor);
};

// Generate gradient from primary and accent colors
export const getGradient = (theme: Theme): string => {
  return `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)`;
};

// Get contrast-safe text color based on background
export const getContrastTextColor = (backgroundColor: string): string => {
  // Simple luminance calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Custom color override for stores with custom branding
export const createCustomTheme = (
  category: StoreCategory,
  primaryColor?: string,
  accentColor?: string
): Theme => {
  const baseTheme = categoryThemes[category];
  return {
    ...baseTheme,
    primaryColor: primaryColor || baseTheme.primaryColor,
    accentColor: accentColor || baseTheme.accentColor,
  };
};
