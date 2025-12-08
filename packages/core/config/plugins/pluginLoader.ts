/**
 * Plugin Loader
 * Dynamic plugin manifest loading based on configuration
 * No hardcode - uses plugin registry for discovery
 */

import { PluginRegistry } from './PluginRegistry';
import { validateManifestOrThrow } from './manifestValidator';
import { configService } from '../services/configService';
import type { PluginRegistryEntry } from './PluginRegistry';

/**
 * Static manifest loaders - Metro requires static import paths
 * This maps plugin IDs to their manifest loaders
 * 
 * NOTE: Metro bundler requires static imports, so this must be maintained manually
 * or generated at build time. In the future, this could be auto-generated from
 * filesystem scan during build.
 */
export const MANIFEST_LOADERS: Record<string, () => Promise<any>> = {
  
};

/**
 * Dynamic plugin registry
 * Automatically derived from MANIFEST_LOADERS to avoid duplication
 * All plugins with manifest loaders are automatically in the registry
 */
export const PLUGIN_REGISTRY: PluginRegistryEntry[] = Object.keys(MANIFEST_LOADERS).map(id => ({
  id,
  manifestPath: `../../../plugins/${id}/plugin.manifest.json`,
}));

/**
 * Load plugin manifest from static loader map
 */
async function loadPluginManifest(pluginId: string): Promise<any> {
  const loader = MANIFEST_LOADERS[pluginId];
  if (!loader) {
    throw new Error(`Plugin ${pluginId} not found in manifest loaders`);
  }

  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load manifest for plugin ${pluginId}:`, error);
    throw error;
  }
}

/**
 * Initialize and register plugins dynamically based on configuration
 * Only loads plugins that are enabled in AppConfig
 */
export async function initializePlugins(): Promise<void> {
  if (PluginRegistry.isInitialized()) {
    console.log('PluginRegistry already initialized');
    return;
  }

  console.log('Initializing PluginRegistry...');

  try {
    // Get enabled plugins from config
    const config = configService.getConfig();

    // Discover all plugins from registry
    const allManifests = await Promise.all(
      PLUGIN_REGISTRY.map(async (entry) => {
        try {
          const manifest = await loadPluginManifest(entry.id);
          validateManifestOrThrow(manifest);
          return manifest;
        } catch (error) {
          console.error(`Failed to load plugin ${entry.id}:`, error);
          return null;
        }
      })
    );

    // Type guard filter to properly remove null values
    const validManifests = allManifests.filter((m): m is NonNullable<typeof m> => m !== null);

    // Core plugins are determined from manifest.type === 'core-plugin'
    const corePlugins = validManifests
      .filter(m => m.type === 'core-plugin')
      .map(m => m.id);

    // Get enabled plugins from config (fallback to all if config not loaded)
    const enabledPlugins = config?.enabledModules || [];

    // Combine core plugins with enabled plugins (remove duplicates)
    const pluginsToLoad = new Set([...corePlugins, ...enabledPlugins]);

    console.log(`Loading ${pluginsToLoad.size} plugins:`, Array.from(pluginsToLoad));

    // Register only enabled plugins
    const manifestsToRegister = validManifests.filter(m =>
      pluginsToLoad.has(m.id)
    );

    // Register all enabled plugins
    manifestsToRegister.forEach(manifest => {
      PluginRegistry.registerPlugin(manifest);
    });

    // Enable plugins based on config
    // Core plugins are already enabled by default in PluginRegistry.registerPlugin
    // Enable additional plugins from config
    for (const pluginId of enabledPlugins) {
      if (pluginsToLoad.has(pluginId)) {
        PluginRegistry.enablePlugin(pluginId);
      }
    }

    PluginRegistry.markInitialized();
    console.log(`PluginRegistry initialized with ${manifestsToRegister.length} plugins`);
  } catch (error) {
    console.error('Failed to initialize plugins:', error);
    // Don't throw - allow app to continue with no plugins
    PluginRegistry.markInitialized();
  }
}

/**
 * Get initialization status
 */
export function isPluginSystemInitialized(): boolean {
  return PluginRegistry.isInitialized();
}
