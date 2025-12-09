/**
 * Core Config - Config Service
 * Service untuk load dan manage app configuration
 */

import { AppConfig, MenuItemConfig } from '../types/AppConfig';
import { getTenantConfig, getCurrentTenantId } from './tenantService';
import { TenantConfig } from '../tenants';
import axiosInstance from './axiosConfig';
import { configEventEmitter } from '../utils/configEventEmitter';

export interface ConfigService {
  loadConfig(): Promise<AppConfig>;
  getConfig(): AppConfig | null;
  isFeatureEnabled(feature: string): boolean;
  isModuleEnabled(module: string): boolean;
  getMenuConfig(): MenuItemConfig[];
  refreshConfig(force?: boolean): Promise<void>; // Add force parameter untuk bypass cache
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
    logo: '',
    appName: 'Closepay Merchant',
  },
  login: {
    showSignUp: true,
    showSocialLogin: false,
    socialLoginProviders: ['google'], // Default only Google, no Facebook
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
  private lastRefreshTime: number = 0; // Timestamp terakhir refresh
  private cacheExpiry: number = 5 * 60 * 1000; // 5 menit cache expiry
  private pendingRefresh: Promise<AppConfig> | null = null; // Debouncing

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
            logo: tenantConfig.theme.logo || config.branding.logo,
            appName: tenantConfig.theme.appName || config.branding.appName,
          },
        };
        // Emit event untuk notify subscribers
        configEventEmitter.emit(this.config);
        return;
      }
    }
    
    this.config = config;
    // Emit event untuk notify subscribers
    configEventEmitter.emit(this.config);
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

  async refreshConfig(force: boolean = false): Promise<void> {
    // Debouncing: jika ada pending refresh, return yang sama
    if (this.pendingRefresh && !force) {
      console.log('[ConfigService] Refresh already in progress, reusing pending request');
      return this.pendingRefresh.then(() => {});
    }

    // Caching: skip jika masih dalam cache expiry dan tidak force
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    
    if (!force && timeSinceLastRefresh < this.cacheExpiry) {
      console.log(`[ConfigService] Using cached config (${Math.round(timeSinceLastRefresh / 1000)}s ago, ${Math.round((this.cacheExpiry - timeSinceLastRefresh) / 1000)}s remaining)`);
      return Promise.resolve();
    }

    // Create pending refresh promise untuk debouncing
    this.pendingRefresh = (async () => {
      try {
        // Load dari backend API
        const companyId = this.config?.companyId || 'member-base';
        
        // TODO: Sesuaikan endpoint dengan backend API
        // Expected endpoint: GET /config/app/{companyId}
        const response = await axiosInstance.get<AppConfig>(
          `/config/app/${companyId}`
        );
        
        // Update config dengan data dari backend
        const newConfig = response.data;
        
        // Merge dengan tenant config jika ada
        if (newConfig.tenantId || newConfig.companyId) {
          const tenantId = newConfig.tenantId || newConfig.companyId;
          const tenantConfig = getTenantConfig(tenantId);
          
          if (tenantConfig) {
            this.config = {
              ...newConfig,
              tenantId: tenantId,
              enabledFeatures: tenantConfig.enabledFeatures,
              homeVariant: tenantConfig.homeVariant || newConfig.homeVariant,
              branding: {
                ...newConfig.branding,
                logo: tenantConfig.theme.logo || newConfig.branding.logo,
                appName: tenantConfig.theme.appName || newConfig.branding.appName,
              },
            };
            this.lastRefreshTime = Date.now();
            // Emit event untuk notify subscribers
            configEventEmitter.emit(this.config);
            return this.config;
          }
        }
        
        this.config = newConfig;
        this.lastRefreshTime = Date.now();
        // Emit event untuk notify subscribers
        configEventEmitter.emit(this.config);
        return this.config;
      } catch (error: any) {
        console.error('[ConfigService] Failed to refresh config from API:', error);
        // JANGAN throw error - keep existing config
        // Fallback ke existing config, tidak overwrite dengan default
        if (!this.config) {
          this.config = DEFAULT_CONFIG;
          this.lastRefreshTime = Date.now();
          // Emit event untuk default config
          configEventEmitter.emit(this.config);
        }
        // Re-throw untuk hook bisa handle cooldown
        throw error;
      } finally {
        // Clear pending setelah selesai
        this.pendingRefresh = null;
      }
    })();

    return this.pendingRefresh.then(() => {});
  }
}

export const configService: ConfigService = new ConfigServiceImpl();
