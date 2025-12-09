/**
 * Theme Service
 * Mengelola theme preference dan resolve actual theme
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import type { ThemeMode, ColorScheme, ThemeColors, Theme } from '../types';
import {
  generatePrimaryLight,
  generatePrimaryDark,
  generatePrimaryLightDark,
  generatePrimaryDarkDark,
  isValidColor,
  normalizeColor,
} from '../utils/colorUtils';

const THEME_STORAGE_KEY = '@closepay_theme_mode';

/**
 * Light theme colors
 */
const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  primary: '#f94aff',
  primaryLight: '#E6F2FF',
  primaryDark: '#0052A3',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  error: '#EF4444',
  errorLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  inputBackground: '#FFFFFF',
  inputFocused: '#F0F9FF',
  inputError: '#FEF2F2',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

/**
 * Dark theme colors
 */
const darkColors: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  primary: '#3B82F6',
  primaryLight: '#1E3A8A',
  primaryDark: '#2563EB',
  
  border: '#374151',
  borderLight: '#4B5563',
  
  error: '#F87171',
  errorLight: '#7F1D1D',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  
  inputBackground: '#1F2937',
  inputFocused: '#1E3A8A',
  inputError: '#7F1D1D',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Get system color scheme
 */
const getSystemColorScheme = (): ColorScheme => {
  // Note: useColorScheme hook hanya bisa dipakai di component
  // Untuk service, kita akan resolve di context
  return 'light'; // Default fallback
};

/**
 * Resolve actual color scheme dari theme mode
 */
export const resolveColorScheme = (
  mode: ThemeMode,
  systemScheme: ColorScheme | null | undefined
): ColorScheme => {
  if (mode === 'system') {
    return systemScheme || 'light';
  }
  return mode;
};

/**
 * Get theme colors berdasarkan color scheme
 * @param scheme - Color scheme (light/dark)
 * @param accentColor - Optional accent color dari backend untuk override primary colors
 */
export const getThemeColors = (
  scheme: ColorScheme,
  accentColor?: string | null
): ThemeColors => {
  const baseColors = scheme === 'dark' ? darkColors : lightColors;
  
  // Jika accent color tidak tersedia atau invalid, return base colors
  if (!accentColor || !isValidColor(accentColor)) {
    return baseColors;
  }
  
  const normalizedAccent = normalizeColor(accentColor);
  if (!normalizedAccent) {
    return baseColors;
  }
  
  // Generate color variants dari accent color
  if (scheme === 'dark') {
    return {
      ...baseColors,
      primary: normalizedAccent,
      primaryLight: generatePrimaryLightDark(normalizedAccent, 0.2),
      primaryDark: generatePrimaryDarkDark(normalizedAccent, 15),
      // Update inputFocused untuk consistency dengan accent color
      inputFocused: generatePrimaryLightDark(normalizedAccent, 0.15),
    };
  } else {
    return {
      ...baseColors,
      primary: normalizedAccent,
      primaryLight: generatePrimaryLight(normalizedAccent, 0.12),
      primaryDark: generatePrimaryDark(normalizedAccent, 20),
      // Update inputFocused untuk consistency dengan accent color
      inputFocused: generatePrimaryLight(normalizedAccent, 0.08),
    };
  }
};

/**
 * Load theme preference dari storage
 */
export const loadThemePreference = async (): Promise<ThemeMode> => {
  try {
    const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
  return 'system'; // Default: follow system
};

/**
 * Save theme preference ke storage
 */
export const saveThemePreference = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    throw error;
  }
};

/**
 * Get complete theme object
 * @param mode - Theme mode preference
 * @param systemScheme - System color scheme
 * @param accentColor - Optional accent color dari backend untuk override primary colors
 */
export const getTheme = (
  mode: ThemeMode,
  systemScheme: ColorScheme | null | undefined,
  accentColor?: string | null
): Theme => {
  const scheme = resolveColorScheme(mode, systemScheme);
  const colors = getThemeColors(scheme, accentColor);
  
  return {
    mode,
    scheme,
    colors,
  };
};

