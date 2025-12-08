/**
 * useTheme Hook
 * Hook untuk access theme dan colors di components
 */
import { useThemeContext } from '../context/ThemeContext';
import type { ThemeColors, ThemeMode } from '../types';

/**
 * Hook untuk access theme
 * @returns Theme object dengan colors, mode, dan helper functions
 */
export const useTheme = () => {
  const { theme, themeMode, setThemeMode, toggleTheme } = useThemeContext();

  return {
    // Theme data
    colors: theme.colors,
    scheme: theme.scheme,
    mode: themeMode,
    
    // Helper functions
    isDark: theme.scheme === 'dark',
    isLight: theme.scheme === 'light',
    
    // Actions
    setThemeMode,
    toggleTheme,
  };
};

/**
 * Type untuk return value dari useTheme
 */
export type UseThemeReturn = {
  colors: ThemeColors;
  scheme: 'light' | 'dark';
  mode: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

