/**
 * Auth Navigator
 * Navigation setup untuk auth flow dengan dynamic plugin loading
 * Core navigation that can be extended with app-specific screens
 */
import React, { useState, useEffect, Suspense, ReactNode, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, AppStateStatus, View, Text, ActivityIndicator } from 'react-native';
import { LoginScreen, SignUpScreen, ForgotPasswordScreen, useAuth } from '@core/auth';
import { OnboardingScreen, onboardingService, PluginRegistry, getPluginComponentLoader, QuickMenuSettingsScreen } from '@core/config';
import { ProfileScreen, EditProfileScreen } from '@core/account';
import { LanguageSelectionScreen } from '@core/i18n';
import { ThemeSettingsScreen, useTheme } from '@core/theme';

const Stack = createNativeStackNavigator();

/**
 * AuthNavigator Props
 */
export interface AuthNavigatorProps {
  /**
   * App-specific screens to inject into the navigation stack
   * This allows apps to extend core navigation with their own screens
   * without violating dependency rules (core doesn't depend on src/)
   * Can be React Fragment containing Stack.Screen elements, or array of Stack.Screen elements
   */
  appScreens?: ReactNode | React.ReactElement[];
}

// Loading fallback component
const LoadingFallback = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat...</Text>
    </View>
  );
};

// Helper function to extract and filter valid children
// Returns array of valid React elements only
const extractValidScreens = (appScreens: ReactNode | React.ReactElement[]): React.ReactElement[] => {
  if (!appScreens) return [];
  
  let children: ReactNode[] = [];
  
  // If it's already an array, use it directly
  if (Array.isArray(appScreens)) {
    children = appScreens;
  }
  // If it's a Fragment, extract children
  else if (React.isValidElement(appScreens) && appScreens.type === React.Fragment) {
    const fragmentElement = appScreens as React.ReactElement<{ children: ReactNode }>;
    const fragmentChildren = fragmentElement.props.children;
    children = React.Children.toArray(fragmentChildren);
  }
  // Otherwise, treat as single child
  else {
    children = [appScreens];
  }
  
  // Filter to only valid React elements
  return children.filter(
    (child): child is React.ReactElement => 
      child != null && React.isValidElement(child)
  );
};


export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ appScreens }) => {
  const { isAuthenticated, isLoading, isLoggingIn, initializeAuth } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [pluginRoutes, setPluginRoutes] = useState<React.ReactElement[]>([]);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isInitializing = useRef(false);

  // Initialize auth on mount
  React.useEffect(() => {
    const initAuth = async () => {
      if (!isInitializing.current) {
        isInitializing.current = true;
        try {
          await initializeAuth();
        } catch (error) {
          console.error('[AuthNavigator] Error initializing auth:', error);
        } finally {
          isInitializing.current = false;
        }
      }
    };
    initAuth();
  }, [initializeAuth]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // When app comes to foreground from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[AuthNavigator] App has come to the foreground, checking auth...');
        
        // Only re-initialize if user is not authenticated
        // This prevents unnecessary re-initialization that could cause logout
        if (!isInitializing.current && !isAuthenticated) {
          isInitializing.current = true;
          try {
            await initializeAuth();
          } catch (error) {
            console.error('[AuthNavigator] Error re-initializing auth on foreground:', error);
          } finally {
            isInitializing.current = false;
          }
        } else if (isAuthenticated) {
          console.log('[AuthNavigator] User already authenticated, skipping re-initialization');
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [initializeAuth, isAuthenticated]);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await onboardingService.isOnboardingCompleted();
        setIsOnboardingCompleted(completed);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // Load plugin routes dynamically
  useEffect(() => {
    const loadPluginRoutes = async () => {
      if (!PluginRegistry.isInitialized()) {
        return;
      }

      const enabledPlugins = PluginRegistry.getEnabledPlugins();
      const routes: React.ReactElement[] = [];

      for (const pluginId of enabledPlugins) {
        const plugin = PluginRegistry.getPlugin(pluginId.id);
        if (!plugin?.routes) continue;

        for (const route of plugin.routes) {
          try {
            const ComponentLoader = getPluginComponentLoader(pluginId.id, route.component);
            const LazyComponent = React.lazy(ComponentLoader);
            
            // Validate that LazyComponent is valid before creating Stack.Screen
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
            
            // Only push if it's a valid React element
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
    };

    loadPluginRoutes();
  }, [isAuthenticated]);

  const handleOnboardingComplete = async () => {
    await onboardingService.completeOnboarding();
    setIsOnboardingCompleted(true);
  };

  // Show loading screen while checking auth and onboarding
  if (isLoading && !isLoggingIn) {
    return <LoadingFallback />;
  }

  // Show loading while checking onboarding
  if (isCheckingOnboarding) {
    return <LoadingFallback />;
  }

  // Show onboarding if not completed
  if (!isOnboardingCompleted) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}>
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Extract and validate app screens once
  const validAppScreens = extractValidScreens(appScreens);

  return (
    // Suspense sekarang DI LUAR navigator, bukan jadi child Stack.Navigator
    <Suspense fallback={<LoadingFallback />}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // Hide default iOS header for all screens
            headerLeft: () => null, // Remove default back button for all screens
            animation: 'slide_from_right',
          }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen 
                name="SignUp" 
                component={SignUpScreen}
                options={{
                  headerShown: false, // Hide default iOS header, use custom header
                  headerLeft: () => null, // Remove default back button
                  gestureEnabled: false, // Disable iOS swipe back gesture
                }}
              />
              <Stack.Screen 
                name="ForgotPassword" 
                component={ForgotPasswordScreen}
                options={{
                  headerShown: false, // Hide default iOS header, use custom header
                  headerLeft: () => null, // Remove default back button
                  gestureEnabled: true, // Enable iOS swipe back gesture
                }}
              />
            </>
          ) : (
            <>
              {/* App-specific screens */}
              {validAppScreens.map((screen, index) =>
                // screen sudah <Stack.Screen>, jadi boleh langsung
                React.cloneElement(screen, { key: screen.key ?? `app-screen-${index}` })
              )}

              {/* Plugin routes (sudah berupa <Stack.Screen> juga) */}
              {pluginRoutes.map((screen, index) =>
                React.cloneElement(screen, { key: screen.key ?? `plugin-screen-${index}` })
              )}

              {/* Core screens */}
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
              <Stack.Screen name="QuickMenuSettings" component={QuickMenuSettingsScreen} />
              <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Suspense>
  );
};

