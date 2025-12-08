/**
 * Core Navigation - createAppNavigator
 * Navigation builder that creates app navigation from tenant config and plugin manifests
 */

import React, { useState, useEffect, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TenantId } from '../config/tenants';
import { getTenantConfig } from '../config/services/tenantService';
import { PluginRegistry, getPluginComponentLoader } from '../config';
import { ProfileScreen, EditProfileScreen } from '../account';
import { LanguageSelectionScreen } from '../i18n';
import { QuickMenuSettingsScreen } from '../config';
import { ThemeSettingsScreen } from '../theme';

const Stack = createNativeStackNavigator();

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0066CC" />
    <Text style={styles.loadingText}>Memuat...</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
});

/**
 * createAppNavigator Options
 */
export interface CreateAppNavigatorOptions {
  tenantId: TenantId;
  HomeScreen: React.ComponentType;
  /**
   * App-specific screens to inject into the navigation stack
   * This allows apps to extend core navigation with their own screens
   * Can be React Fragment containing Stack.Screen elements, or array of Stack.Screen elements
   */
  appScreens?: React.ReactNode | React.ReactElement[];
}

/**
 * Creates an app navigator component based on tenant configuration and plugin manifests
 * 
 * @param options - Configuration options including tenantId and HomeScreen
 * @returns React component that renders the complete navigation structure
 */
export function createAppNavigator({
  tenantId,
  HomeScreen,
  appScreens,
}: CreateAppNavigatorOptions): React.ComponentType {
  /**
   * AppNavigator Component
   * Built dynamically from tenant config and plugin manifests
   */
  const AppNavigatorComponent: React.FC = () => {
    const [pluginRoutes, setPluginRoutes] = useState<React.ReactElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Process app screens
    const validAppScreens = React.useMemo(() => {
      if (!appScreens) return [];
      
      // Handle Fragment or array
      if (React.isValidElement(appScreens) && appScreens.type === React.Fragment) {
        const fragmentProps = appScreens.props as { children?: React.ReactNode };
        return React.Children.toArray(fragmentProps.children).filter(
          (child): child is React.ReactElement => React.isValidElement(child)
        );
      }
      
      if (Array.isArray(appScreens)) {
        return appScreens.filter((screen): screen is React.ReactElement => React.isValidElement(screen));
      }
      
      if (React.isValidElement(appScreens)) {
        return [appScreens];
      }
      
      return [];
    }, [appScreens]);

    // Load tenant config and plugin routes
    useEffect(() => {
      const loadNavigation = async () => {
        try {
          // Get tenant config
          const tenantConfig = getTenantConfig(tenantId);
          
          if (!tenantConfig) {
            console.warn(`[createAppNavigator] Tenant config not found for tenantId: ${tenantId}`);
          }

          // Wait for plugin registry to be initialized
          if (!PluginRegistry.isInitialized()) {
            console.warn('[createAppNavigator] PluginRegistry not initialized yet');
            setIsLoading(false);
            return;
          }

          // Get enabled plugins from tenant config or registry
          const enabledPluginIds = tenantConfig?.enabledFeatures || 
            PluginRegistry.getEnabledPlugins().map((p: any) => p.id);

          const routes: React.ReactElement[] = [];

          // Load routes from enabled plugins
          const enabledPlugins = PluginRegistry.getEnabledPlugins();
          for (const plugin of enabledPlugins) {
            if (!plugin?.routes) continue;
            const pluginId = plugin.id;

            for (const route of plugin.routes) {
              try {
                const ComponentLoader = getPluginComponentLoader(pluginId, route.component);
                const LazyComponent = React.lazy(ComponentLoader);

                if (!LazyComponent) {
                  console.warn(`LazyComponent is undefined for route ${route.name} from plugin ${pluginId}`);
                  continue;
                }

                const screenElement = (
                  <Stack.Screen
                    key={route.name}
                    name={route.name}
                    component={LazyComponent}
                    options={{ title: route.meta?.title }}
                  />
                );

                if (React.isValidElement(screenElement)) {
                  routes.push(screenElement);
                } else {
                  console.warn(`Invalid screen element for route ${route.name} from plugin ${pluginId}`);
                }
              } catch (error) {
                console.error(`Failed to load route ${route.name} from plugin ${pluginId}:`, error);
              }
            }
          }

          setPluginRoutes(routes);
        } catch (error) {
          console.error('[createAppNavigator] Error loading navigation:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadNavigation();
    }, []);

    if (isLoading) {
      return <LoadingFallback />;
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
            initialRouteName="Home"
          >
            {/* Home Screen */}
            <Stack.Screen name="Home" component={HomeScreen} />

            {/* App-specific screens */}
            {validAppScreens.map((screen, index) =>
              React.cloneElement(screen, { key: screen.key ?? `app-screen-${index}` })
            )}

            {/* Plugin routes */}
            {pluginRoutes.map((screen, index) =>
              React.cloneElement(screen, { key: screen.key ?? `plugin-screen-${index}` })
            )}

            {/* Core screens */}
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="QuickMenuSettings" component={QuickMenuSettingsScreen} />
            <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Suspense>
    );
  };

  return AppNavigatorComponent;
}
