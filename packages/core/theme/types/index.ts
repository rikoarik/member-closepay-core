/**
 * Theme Types
 * Type definitions untuk theme management
 */

/**
 * Theme mode preference
 * - 'light': Force light mode
 * - 'dark': Force dark mode
 * - 'system': Follow device system preference
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Actual color scheme yang digunakan
 * - 'light': Light mode active
 * - 'dark': Dark mode active
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Theme colors untuk light dan dark mode
 */
export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Interactive colors
  inputBackground: string;
  inputFocused: string;
  inputError: string;
  
  // Overlay colors
  overlay: string;
  backdrop: string;
}

/**
 * Complete theme object
 */
export interface Theme {
  mode: ThemeMode;
  scheme: ColorScheme;
  colors: ThemeColors;
}

