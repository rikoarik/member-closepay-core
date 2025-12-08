/**
 * Types untuk PhoneMockup
 */
export type MockupScreenType = 'notifications' | 'camera' | 'theme' | 'location' | 'language';

export interface PhoneMockupProps {
  screenType: MockupScreenType;
  colors: {
    // Background colors
    background: string;
    surface: string;
    surfaceSecondary: string;
    // Text colors
    text: string;
    textSecondary: string;
    textTertiary?: string;
    // Primary colors
    primary: string;
    // Status colors
    error?: string;
    // Border colors
    border: string;
    // Input colors
    inputBackground?: string;
  };
  isDark: boolean;
  themeMode?: 'light' | 'dark' | 'system';
  onThemeModeChange?: (mode: 'light' | 'dark' | 'system') => void;
  language?: 'id' | 'en';
  onLanguageChange?: (lang: 'id' | 'en') => void;
}

