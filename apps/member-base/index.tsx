/**
 * Member Base App App Entry Point
 * Template untuk company-specific app
 * 
 * Usage:
 * 1. Copy this template to apps/{your-company-id}/index.tsx
 * 2. Update imports for your app-specific navigator
 * 3. Load your company-specific config
 * 4. Customize branding, plugins, and features
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar, View, Text, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@core/theme';
import { I18nProvider } from '@core/i18n';
import { SecurityProvider } from '@core/security/SecurityProvider';
import { configService, configRefreshService, logger } from '@core/config';
import { initializePlugins } from '@core/config';
import { createAppNavigator } from '@core/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { NewsDetailScreen } from './src/screens/NewsDetailScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

// Option 1: Static config import (for template/demo)
// import { appConfig } from './config/app.config';

// Option 2: Load config from API (for production)
// async function loadConfigFromAPI() {
//   const response = await fetch('https://api.example.com/config/member-base');
//   return await response.json();
// }

// Option 3: Load config from local storage (for caching)
// async function loadConfigFromStorage() {
//   // Use AsyncStorage or similar
// }

/**
 * Load config dengan support hot reload di development
 * Metro bundler akan auto-reload file saat berubah, tapi kita perlu clear cache
 */
const loadAppConfig = (): typeof import('./config/app.config').appConfig => {
  // Dynamic require untuk support hot reload
  // Metro akan auto-reload file saat berubah
  const configModule = require('./config/app.config');
  return configModule.appConfig;
};

function MemberBaseAppContent(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const [pluginsInitialized, setPluginsInitialized] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Create navigator (must be called before any conditional returns)
  const AppNavigator = useMemo(() => {
    const appScreens = (
      <>
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      </>
    );
    
    const Navigator = createAppNavigator({
      tenantId: 'member-base',
      HomeScreen: HomeScreen,
      appScreens: appScreens,
    });
    return Navigator;
  }, []);

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load app-specific config dengan support hot reload
        const appConfig = loadAppConfig();
        configService.setConfig(appConfig);
        
        // Option 2: Load from API
        // const config = await loadConfigFromAPI();
        // configService.setConfig(config);
        
        // Option 3: Load from storage (with API fallback)
        // let config = await loadConfigFromStorage();
        // if (!config) {
        //   config = await loadConfigFromAPI();
        //   await saveConfigToStorage(config);
        // }
        // configService.setConfig(config);
        
        setConfigLoaded(true);

        // Initialize plugins based on config
        await initializePlugins();
        setPluginsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize app', error);
        // Continue with default config
        setConfigLoaded(true);
        setPluginsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Handle app state changes - refresh config saat app menjadi active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App menjadi active, refresh config dari backend
        configRefreshService.refresh().catch((error) => {
          logger.error('Failed to refresh config on app active', error);
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Watch config file changes untuk development (polling approach)
  // Metro HMR akan reload file, tapi kita perlu re-set config
  useEffect(() => {
    if (!__DEV__) return;

    let lastConfig: typeof import('./config/app.config').appConfig | null = null;
    
    const checkConfigUpdate = () => {
      try {
        const appConfig = loadAppConfig();
        
        // Deep comparison untuk detect perubahan (tidak termasuk primaryColor karena sekarang dari backend)
        const hasChanged = !lastConfig || 
          lastConfig.branding.logo !== appConfig.branding.logo ||
          lastConfig.branding.appName !== appConfig.branding.appName ||
          lastConfig.companyId !== appConfig.companyId ||
          lastConfig.companyName !== appConfig.companyName;
        
        if (hasChanged) {
          logger.debug('Config file changed, updating...');
          configService.setConfig(appConfig);
          lastConfig = appConfig;
        }
      } catch (error) {
        // Ignore errors saat file sedang di-edit
      }
    };

    // Initial check
    checkConfigUpdate();

    // Check setiap 1 detik untuk catch file changes (balance antara responsiveness dan performance)
    const interval = setInterval(checkConfigUpdate, 1000);

    return () => clearInterval(interval);
  }, []);

  // Watch theme color file changes untuk realtime color updates
  useEffect(() => {
    if (!__DEV__) return;

    const loadThemeColor = (): string | null => {
      try {
        // Dynamic require untuk support hot reload
        const themeColorModule = require('./config/theme.color');
        return themeColorModule.themeColor || null;
      } catch (error) {
        // Ignore errors saat file sedang di-edit
        return null;
      }
    };

    let lastThemeColor: string | null = null;
    
    const checkThemeColorUpdate = () => {
      try {
        const currentColor = loadThemeColor();
        
        if (currentColor && currentColor !== lastThemeColor) {
          logger.debug('Theme color file changed:', lastThemeColor, '→', currentColor);
          lastThemeColor = currentColor;
        }
      } catch (error) {
        // Ignore errors saat file sedang di-edit
      }
    };

    // Initial check
    checkThemeColorUpdate();

    // Check setiap 500ms untuk catch file changes lebih cepat (warna penting untuk UX)
    const interval = setInterval(checkThemeColorUpdate, 500);

    return () => clearInterval(interval);
  }, []);

  // Show loading while initializing
  if (!configLoaded || !pluginsInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat aplikasi...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

function MemberBaseApp(): React.JSX.Element {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SecurityProvider>
          <MemberBaseAppContent />
        </SecurityProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default MemberBaseApp;

