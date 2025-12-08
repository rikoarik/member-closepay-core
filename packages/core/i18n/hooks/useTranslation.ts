/**
 * useTranslation Hook
 * Hook untuk access translation function di components
 */
import { useI18nContext } from '../context/I18nContext';
import type { TranslationKey, TranslationParams, Language } from '../types';

/**
 * Hook untuk access translations
 * @returns Translation function t() dan language info
 */
export const useTranslation = () => {
  const { language, setLanguage, t } = useI18nContext();

  return {
    // Translation function
    t,
    
    // Language info
    language,
    setLanguage,
    
    // Helper
    isIndonesian: language === 'id',
    isEnglish: language === 'en',
  };
};

/**
 * Type untuk return value dari useTranslation
 */
export type UseTranslationReturn = {
  t: (key: TranslationKey, params?: TranslationParams) => string;
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isIndonesian: boolean;
  isEnglish: boolean;
};

