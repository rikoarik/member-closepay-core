/**
 * Plugin System Exports
 * Central export point for the plugin system
 */

// Types
export * from './types';

// Registry
export { PluginRegistry } from './PluginRegistry';

// Validation
export * from './manifestValidator';

// Plugin Loader
export { initializePlugins, isPluginSystemInitialized } from './pluginLoader';

// Component Loader
export {
  loadPluginComponent,
  getPluginComponentLoader,
  getPluginComponentLoaders,
} from './pluginComponentLoader';

// Hooks
export { usePluginRegistry } from './hooks/usePluginRegistry';
export type { UsePluginRegistryReturn } from './hooks/usePluginRegistry';
export { usePluginComponent } from './hooks/usePluginComponent';
export type { UsePluginComponentOptions, UsePluginComponentReturn } from './hooks/usePluginComponent';
