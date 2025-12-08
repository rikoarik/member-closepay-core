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
import { configService } from '../../config/services/configService';

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
        
        // Load accent color dari config
        const config = configService.getConfig();
        if (config?.branding?.primaryColor) {
          setAccentColor(config.branding.primaryColor);
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Watch untuk perubahan config (accent color)
  useEffect(() => {
    const checkConfig = () => {
      const config = configService.getConfig();
      const newAccentColor = config?.branding?.primaryColor || null;
      
      // Only update jika berbeda untuk avoid unnecessary re-renders
      if (newAccentColor !== accentColor) {
        setAccentColor(newAccentColor);
      }
    };

    // Check immediately
    checkConfig();

    // Check periodically untuk catch config updates (config bisa di-update dari luar)
    // Note: Idealnya configService punya event emitter, tapi untuk sekarang kita check periodically
    // Polling interval: 2 detik untuk balance antara responsiveness dan performance
    const interval = setInterval(checkConfig, 2000);

    return () => clearInterval(interval);
  }, [accentColor]);

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
