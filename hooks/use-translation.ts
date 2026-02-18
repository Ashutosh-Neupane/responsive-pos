import { useUIStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

/**
 * Hook to get translations for the current language
 * Usage: const t = useTranslation(); t('dashboard')
 */
export const useTranslation = () => {
  const { language } = useUIStore();

  return (key: string): string => {
    return getTranslation(key, language);
  };
};
