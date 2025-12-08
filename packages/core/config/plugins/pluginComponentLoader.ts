/**
 * Plugin Component Loader
 * Dynamic component loading for plugin components
 * Uses static mapping for Metro bundler compatibility
 */

import { PluginRegistry } from './PluginRegistry';
import type { PluginManifest } from './types';
import React from 'react';

/**
 * Static component loader mapping
 * Metro bundler requires static import paths, so we map all possible combinations
 * This should be maintained or auto-generated from plugin manifests
 */
const COMPONENT_LOADERS: Record<string, Record<string, () => Promise<any>>> = {
  balance: {
  
  },
  payment: {
   
    // Add other payment components as needed
  },
  // Add other plugins as needed
};

/**
 * Generate component loader function from static mapping
 */
function generateComponentLoader(pluginId: string, componentName: string): () => Promise<any> {
  const pluginLoaders = COMPONENT_LOADERS[pluginId];
  if (!pluginLoaders) {
    throw new Error(`No loaders found for plugin: ${pluginId}`);
  }

  const loader = pluginLoaders[componentName];
  if (!loader) {
    throw new Error(`No loader found for component ${componentName} in plugin ${pluginId}`);
  }

  return loader;
}

/**
 * Load plugin component dynamically
 * @param pluginId - Plugin identifier
 * @param componentName - Component name to load
 * @returns Promise resolving to React component
 */
export async function loadPluginComponent(
  pluginId: string,
  componentName: string
): Promise<React.ComponentType<any>> {
  // Check if plugin is enabled
  if (!PluginRegistry.isPluginEnabled(pluginId)) {
    throw new Error(`Plugin ${pluginId} is not enabled`);
  }

  // Get plugin manifest
  const plugin = PluginRegistry.getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }

  // Check if component is exported
  const exports = plugin.exports;
  if (!exports.components?.includes(componentName)) {
    throw new Error(`Component ${componentName} not exported by plugin ${pluginId}`);
  }

  // Generate loader dynamically from manifest
  const loader = generateComponentLoader(pluginId, componentName);

  try {
    const module = await loader();
    const Component = module[componentName] || module.default;

    if (!Component) {
      throw new Error(`Component ${componentName} not found in module for plugin ${pluginId}`);
    }

    return Component;
  } catch (error) {
    console.error(`Failed to load component ${pluginId}.${componentName}:`, error);
    throw error;
  }
}

/**
 * Get lazy component loader function for React.lazy
 * @param pluginId - Plugin identifier
 * @param componentName - Component name
 * @returns Loader function compatible with React.lazy
 */
export function getPluginComponentLoader(
  pluginId: string,
  componentName: string
): () => Promise<{ default: React.ComponentType<any> }> {
  return async () => {
    const Component = await loadPluginComponent(pluginId, componentName);
    return { default: Component };
  };
}

/**
 * Get all available component loaders for a plugin
 * @param pluginId - Plugin identifier
 * @returns Record of componentName -> loader function
 */
export function getPluginComponentLoaders(
  pluginId: string
): Record<string, () => Promise<any>> {
  const plugin = PluginRegistry.getPlugin(pluginId);
  if (!plugin) {
    return {};
  }

  const loaders: Record<string, () => Promise<any>> = {};
  const componentNames = plugin.exports.components || [];

  componentNames.forEach(componentName => {
    loaders[componentName] = generateComponentLoader(pluginId, componentName);
  });

  return loaders;
}

