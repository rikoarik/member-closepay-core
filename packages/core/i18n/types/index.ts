/**
 * i18n Types
 * Type definitions untuk internationalization
 */

/**
 * Supported languages
 */
export type Language = 'id' | 'en';

/**
 * Translation key structure
 * Format: 'namespace.key' atau 'namespace.nested.key'
 */
export type TranslationKey = string;

/**
 * Translation function parameters
 */
export interface TranslationParams {
  [key: string]: string | number;
}

/**
 * Translation function type
 */
export type TranslationFunction = (
  key: TranslationKey,
  params?: TranslationParams
) => string;

