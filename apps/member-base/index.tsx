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
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@core/theme';
import { I18nProvider } from '@core/i18n';
import { SecurityProvider } from '@core/security/SecurityProvider';
import { configService } from '@core/config';
import { initializePlugins } from '@core/config';
import { createAppNavigator } from '@core/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { NewsDetailScreen } from './src/screens/NewsDetailScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

// Option 1: Static config import (for template/demo)
import { appConfig } from './config/app.config';

// Option 2: Load config from API (for production)
// async function loadConfigFromAPI() {
//   const response = await fetch('https://api.example.com/config/member-base');
//   return await response.json();
// }

// Option 3: Load config from local storage (for caching)
// async function loadConfigFromStorage() {
//   // Use AsyncStorage or similar
// }

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
        // Load app-specific config
        // Option 1: Static import (already imported above)
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
        
        // For template: Use default config if no custom config loaded
        configService.setConfig(appConfig);
        setConfigLoaded(true);

        // Initialize plugins based on config
        await initializePlugins();
        setPluginsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Continue with default config
        setConfigLoaded(true);
        setPluginsInitialized(true);
      }
    };

    initializeApp();
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

