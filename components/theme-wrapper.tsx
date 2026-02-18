'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { getThemeForCategory, applyTheme, createCustomTheme } from '@/lib/themes';
import type { Shop } from '@/lib/types';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { shop } = useAuthStore();

  useEffect(() => {
    if (!shop) return;

    // Apply theme based on store category
    const theme = shop.primary_color && shop.accent_color
      ? createCustomTheme(shop.category, shop.primary_color, shop.accent_color)
      : getThemeForCategory(shop.category);

    applyTheme(theme);
  }, [shop]);

  return <>{children}</>;
}
