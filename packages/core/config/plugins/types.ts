/**
 * Plugin System Types
 * Type definitions for the plugin manifest and registry system
 */

export type PluginType = 'core-plugin' | 'segment-plugin' | 'company-plugin';

export interface PluginRoute {
  name: string;
  path: string;
  component: string;
  permissions: string[];
  meta?: {
    title?: string;
    showInMenu?: boolean;
    icon?: string;
    [key: string]: any;
  };
}

export interface PluginExports {
  components?: string[];
  hooks?: string[];
  services?: string[];
  models?: string[];
  screens?: Record<string, string>;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  type: PluginType;
  author?: string;
  dependencies: string[];
  exports: PluginExports;
  routes?: PluginRoute[];
  permissions: string[];
  config?: Record<string, any>;
}

export interface PluginConfig {
  enabled: boolean;
  config?: Record<string, any>;
  routeOverrides?: Record<string, Partial<PluginRoute>>;
}

export interface SegmentConfiguration {
  segment: string;
  plugins: Record<string, PluginConfig>;
}

export interface CompanyConfiguration extends SegmentConfiguration {
  companyId: string;
}
