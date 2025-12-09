/**
 * Theme Context
 * Context provider untuk theme management
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeMode, Theme, ColorScheme } from '../types';
import {
  loadThemePreference,
  saveThemePreference,
  getTheme,
} from '../services/themeService';
import { themeColorService } from '../services/themeColorService';
import { configService } from '@core/config';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [accentColor, setAccentColor] = useState<string | null>(null);

  // Load theme preference and accent color on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedMode = await loadThemePreference();
        setThemeModeState(savedMode);
        
        // Load accent color dari theme color service
        // Development: akan load dari dummy service (file-based)
        // Production: akan fetch dari backend dengan smart caching
        if (__DEV__) {
          // Development: load dari dummy service
          const initialColor = themeColorService.getPrimaryColor();
          if (initialColor) {
            setAccentColor(initialColor);
          }
        } else {
          // Production: fetch dari backend (dengan caching & cooldown)
          await themeColorService.fetchFromBackend(true);
          const initialColor = themeColorService.getPrimaryColor();
          if (initialColor) {
            setAccentColor(initialColor);
          }
          // Start polling untuk backend (dengan interval yang aman: 5 menit)
          themeColorService.startPolling();
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Subscribe ke theme color service untuk realtime updates
  useEffect(() => {
    // Subscribe ke theme color service
    const unsubscribe = themeColorService.subscribe((color) => {
      setAccentColor(color);
      console.log('[Theme] Primary color updated:', color);
    });

    // Cleanup: stop polling jika ada
    return () => {
      unsubscribe();
      if (!__DEV__) {
        themeColorService.stopPolling();
      }
    };
  }, []);

  // Set theme mode and save to storage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await saveThemePreference(mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to set theme mode:', error);
      throw error;
    }
  }, []);

  // Memoize theme calculation to avoid recalculating on every render
  const theme = useMemo(() => {
    // Convert ColorSchemeName to ColorScheme (handle "unspecified" case)
    const resolvedSystemScheme: ColorScheme | null =
      systemColorScheme === 'light' || systemColorScheme === 'dark'
        ? systemColorScheme
        : null;

    // Pass accent color ke getTheme untuk dynamic primary colors
    return getTheme(themeMode, resolvedSystemScheme, accentColor);
  }, [themeMode, systemColorScheme, accentColor]);

  // Toggle between light and dark (skip system)
  const toggleTheme = useCallback(async () => {
    const currentScheme = theme.scheme;
    const newMode: ThemeMode = currentScheme === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  }, [theme.scheme, setThemeMode]);

  // Memoize context value to prevent unnecessary re-renders of all theme consumers
  const value: ThemeContextValue = useMemo(() => ({
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  }), [theme, themeMode, setThemeMode, toggleTheme]);

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook untuk access theme context
 */
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
