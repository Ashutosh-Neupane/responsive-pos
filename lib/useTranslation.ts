import { useUIStore, useAuthStore } from './store';
import en from './locales/en.json';
import ne from './locales/ne.json';

const translations = { en, ne };

export function useTranslation() {
  const { language } = useUIStore();
  const { shop } = useAuthStore();
  
  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') return key;
    
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        value
      );
    }
    
    return value;
  };

  const getActionLabel = () => {
    const isRestaurant = shop?.category === 'restaurant';
    return isRestaurant ? t('pos.sendToKitchen') : t('pos.checkout');
  };

  const showVAT = () => {
    return shop?.ird_registered === true;
  };

  return { t, getActionLabel, showVAT, language };
}
