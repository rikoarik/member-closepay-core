/**
 * i18n Module
 * Export semua public API
 */

// Types
export * from './types';

// Services
export * from './services/i18nService';

// Context
export { I18nProvider, useI18nContext } from './context/I18nContext';

// Hooks
export { useTranslation } from './hooks/useTranslation';
export type { UseTranslationReturn } from './hooks/useTranslation';

// Components
export { LanguageSelectionScreen } from './components/LanguageSelectionScreen';

// Locales (for direct access if needed)
export { id } from './locales/id';
export { en } from './locales/en';

