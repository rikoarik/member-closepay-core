/**
 * i18n Service
 * Mengelola language preference dan translations
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Language, TranslationKey, TranslationParams } from '../types';
import { id } from '../locales/id';
import { en } from '../locales/en';

const LANGUAGE_STORAGE_KEY = '@closepay_language';

/**
 * Translation resources
 */
const translations: Record<Language, Record<string, any>> = {
  id,
  en,
};

/**
 * Get nested value dari object menggunakan dot notation
 * Contoh: 'auth.login' -> translations['auth']['login']
 */
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
};

/**
 * Replace parameters dalam translation string
 * Contoh: 'Hello {name}' dengan { name: 'John' } -> 'Hello John'
 */
const replaceParams = (text: string, params?: TranslationParams): string => {
  if (!params) {
    return text;
  }
  
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  
  return result;
};

/**
 * Get translation by key
 */
export const getTranslation = (
  key: TranslationKey,
  language: Language,
  params?: TranslationParams
): string => {
  const resource = translations[language];
  if (!resource) {
    console.warn(`Translation resource not found for language: ${language}`);
    return key; // Return key as fallback
  }
  
  const translation = getNestedValue(resource, key);
  
  if (!translation) {
    console.warn(`Translation key not found: ${key} for language: ${language}`);
    return key; // Return key as fallback
  }
  
  return replaceParams(translation, params);
};

/**
 * Load language preference dari storage
 */
export const loadLanguagePreference = async (): Promise<Language> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'id' || stored === 'en')) {
      return stored as Language;
    }
  } catch (error) {
    console.error('Failed to load language preference:', error);
  }
  return 'id'; // Default: Bahasa Indonesia
};

/**
 * Save language preference ke storage
 */
export const saveLanguagePreference = async (language: Language): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language preference:', error);
    throw error;
  }
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = (): Language[] => {
  return ['id', 'en'];
};

/**
 * Get language display name
 */
export const getLanguageName = (language: Language): string => {
  const names: Record<Language, string> = {
    id: 'Bahasa Indonesia',
    en: 'English',
  };
  return names[language];
};

