/**
 * Core Config - Config Service
 * Service untuk load dan manage app configuration
 */

import { AppConfig, MenuItemConfig } from '../types/AppConfig';
import { getTenantConfig, getCurrentTenantId } from './tenantService';
import { TenantConfig } from '../tenants';

export interface ConfigService {
  loadConfig(): Promise<AppConfig>;
  getConfig(): AppConfig | null;
  isFeatureEnabled(feature: string): boolean;
  isModuleEnabled(module: string): boolean;
  getMenuConfig(): MenuItemConfig[];
  refreshConfig(): Promise<void>;
  setConfig(config: AppConfig): void; // Add method to set config directly
  getTenantConfig(): TenantConfig | null; // Get tenant config from current app config
}

/**
 * Default config untuk fallback
 * Digunakan ketika config belum di-load dari API/storage
 */
const DEFAULT_CONFIG: AppConfig = {
  companyId: 'default',
  companyName: 'Default Company',
  tenantId: 'default',
  segmentId: 'balance-management',
  enabledFeatures: ['balance', 'payment'],
  enabledModules: ['balance', 'payment'],
  menuConfig: [],
  paymentMethods: ['balance'],
  homeVariant: 'dashboard',
  branding: {
    primaryColor: '#0066CC',
    logo: '',
    appName: 'Closepay Merchant',
  },
  services: {
    api: {
      baseUrl: 'https://api.stg.solusiuntuknegeri.com',
      timeout: 30000,
    },
  },
};

class ConfigServiceImpl implements ConfigService {
  private config: AppConfig | null = null;

  async loadConfig(): Promise<AppConfig> {
    // TODO: Load config from API or local storage
    // For now, return default config as fallback
    // Apps should call setConfig() with their specific config
    if (!this.config) {
      console.warn('[ConfigService] Using default config. Apps should load and set their specific config.');
      this.config = DEFAULT_CONFIG;
    }
    return this.config;
  }

  /**
   * Set config directly (used by apps to load their specific config)
   * Merges tenant config if tenantId is present
   */
  setConfig(config: AppConfig): void {
    // Merge tenant config if tenantId is present
    if (config.tenantId || config.companyId) {
      const tenantId = config.tenantId || config.companyId;
      const tenantConfig = getTenantConfig(tenantId);
      
      if (tenantConfig) {
        // Merge tenant config into app config
        this.config = {
          ...config,
          tenantId: tenantId,
          enabledFeatures: tenantConfig.enabledFeatures,
          homeVariant: tenantConfig.homeVariant || config.homeVariant,
          branding: {
            ...config.branding,
            primaryColor: tenantConfig.theme.primaryColor || config.branding.primaryColor,
            logo: tenantConfig.theme.logo || config.branding.logo,
            appName: tenantConfig.theme.appName || config.branding.appName,
          },
        };
        return;
      }
    }
    
    this.config = config;
  }
  
  /**
   * Get tenant config from current app config
   */
  getTenantConfig(): TenantConfig | null {
    const config = this.getConfig();
    if (!config) return null;
    
    const tenantId = config.tenantId || config.companyId;
    if (!tenantId) return null;
    
    return getTenantConfig(tenantId);
  }

  getConfig(): AppConfig | null {
    return this.config || DEFAULT_CONFIG; // Return default if not set
  }

  isFeatureEnabled(feature: string): boolean {
    const config = this.getConfig();
    if (!config) return false;
    return config.enabledFeatures.includes(feature);
  }

  isModuleEnabled(module: string): boolean {
    const config = this.getConfig();
    if (!config) return false;
    return config.enabledModules.includes(module);
  }

  getMenuConfig(): MenuItemConfig[] {
    const config = this.getConfig();
    if (!config) return [];
    return config.menuConfig.filter(item => item.visible);
  }

  async refreshConfig(): Promise<void> {
    this.config = await this.loadConfig();
  }
}

export const configService: ConfigService = new ConfigServiceImpl();
