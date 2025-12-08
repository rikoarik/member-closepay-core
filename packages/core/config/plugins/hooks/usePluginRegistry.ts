/**
 * usePluginRegistry Hook
 * React hook for accessing PluginRegistry in components
 */

import { useMemo } from 'react';
import { PluginRegistry } from '../PluginRegistry';
import { PluginRoute, PluginManifest } from '../types';

export interface UsePluginRegistryReturn {
  isPluginEnabled: (id: string) => boolean;
  getEnabledPlugins: () => PluginManifest[];
  isRouteAvailable: (name: string) => boolean;
  getEnabledRoutes: () => PluginRoute[];
  getRouteByName: (name: string) => PluginRoute | undefined;
}

/**
 * Hook to access plugin registry functionality in React components
 */
export function usePluginRegistry(): UsePluginRegistryReturn {
  return useMemo(
    () => ({
      isPluginEnabled: (id: string) => PluginRegistry.isPluginEnabled(id),
      getEnabledPlugins: () => PluginRegistry.getEnabledPlugins(),
      isRouteAvailable: (name: string) => PluginRegistry.isRouteAvailable(name),
      getEnabledRoutes: () => PluginRegistry.getEnabledRoutes(),
      getRouteByName: (name: string) => PluginRegistry.getRouteByName(name),
    }),
    []
  );
}
