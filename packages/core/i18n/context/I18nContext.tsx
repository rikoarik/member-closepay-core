/**
 * I18n Context
 * Context provider untuk i18n management
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, TranslationKey, TranslationParams } from '../types';
import {
  loadLanguagePreference,
  saveLanguagePreference,
  getTranslation,
} from '../services/i18nService';

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await loadLanguagePreference();
        setLanguageState(savedLanguage);
      } catch (error) {
        console.error('Failed to initialize language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Set language and save to storage
  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await saveLanguagePreference(lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to set language:', error);
      throw error;
    }
  }, []);

  // Translation function - memoized to prevent recreating
  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      return getTranslation(key, language, params);
    },
    [language]
  );

  // Memoize context value to prevent unnecessary re-renders of all consumers
  const value: I18nContextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  // Don't render children until language is loaded
  if (isLoading) {
    return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/**
 * Hook untuk access i18n context
 */
export const useI18nContext = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
};
