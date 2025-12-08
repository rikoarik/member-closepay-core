/**
 * Plugin Registry
 * Dynamic registry derived from MANIFEST_LOADERS
 * This eliminates duplication - plugins are discovered from the manifest loaders
 */

import { PluginManifest, PluginRoute } from './types';
import { PLUGIN_REGISTRY } from './pluginLoader';

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  id: string;
  manifestPath: string;
}

/**
 * Get plugin registry entry by ID
 */
export function getPluginRegistryEntry(pluginId: string): PluginRegistryEntry | undefined {
  return PLUGIN_REGISTRY.find(entry => entry.id === pluginId);
}

/**
 * Get all plugin IDs from registry
 */
export function getAllPluginIds(): string[] {
  return PLUGIN_REGISTRY.map(entry => entry.id);
}

// Re-export PluginManifest for backward compatibility
export type { PluginManifest };

/**
 * PluginRegistry class
 * Manages registered plugins and their state
 */
class PluginRegistryClass {
  private initialized: boolean = false;
  private plugins: Map<string, PluginManifest> = new Map();
  private enabledPlugins: Set<string> = new Set();

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Mark registry as initialized
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Register a plugin manifest
   */
  registerPlugin(manifest: PluginManifest): void {
    this.plugins.set(manifest.id, manifest);
    // Core plugins are enabled by default
    if (manifest.type === 'core-plugin') {
      this.enabledPlugins.add(manifest.id);
    }
  }

  /**
   * Enable a plugin
   */
  enablePlugin(pluginId: string): void {
    if (this.plugins.has(pluginId)) {
      this.enabledPlugins.add(pluginId);
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(pluginId: string): void {
    this.enabledPlugins.delete(pluginId);
  }

  /**
   * Check if a plugin is enabled
   */
  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  /**
   * Get a registered plugin manifest
   */
  getPlugin(pluginId: string): PluginManifest | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all enabled plugins
   */
  getEnabledPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).filter(p => this.enabledPlugins.has(p.id));
  }

  /**
   * Get all routes from enabled plugins
   */
  getEnabledRoutes(): PluginRoute[] {
    const routes: PluginRoute[] = [];
    for (const plugin of this.getEnabledPlugins()) {
      if (plugin.routes) {
        routes.push(...plugin.routes);
      }
    }
    return routes;
  }

  /**
   * Check if a route is available (exists in any enabled plugin)
   */
  isRouteAvailable(routeName: string): boolean {
    return this.getEnabledRoutes().some(route => route.name === routeName);
  }

  /**
   * Get a route by name from enabled plugins
   */
  getRouteByName(routeName: string): PluginRoute | undefined {
    return this.getEnabledRoutes().find(route => route.name === routeName);
  }
}

// Export singleton instance
export const PluginRegistry = new PluginRegistryClass();
