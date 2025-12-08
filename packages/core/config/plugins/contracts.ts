/**
 * Core Config - Plugin Contracts
 * CorePlugin interface that all plugins must implement
 */

import { PluginRoute } from './types';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  permissions?: string[];
}

/**
 * CorePlugin interface
 * All plugins must export a CorePlugin instance from their manifest.ts
 */
export interface CorePlugin {
  id: string;
  routes?: PluginRoute[];
  menuItems?: MenuItem[];
}

// Re-export PluginRoute for convenience
export type { PluginRoute } from './types';

// Export balance operations
export * from './contracts/balance';
export * from './contracts/useBalance';

