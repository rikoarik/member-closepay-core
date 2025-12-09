/**
 * Core Config - Tenant Service
 * Service for loading and managing tenant configurations
 */

import { TenantId, TenantConfig } from '../tenants';
import { configService } from './configService';
import { AppConfig } from '../types/AppConfig';

/**
 * Get tenant configuration by tenant ID
 * Loads from AppConfig if tenantId matches, or returns null
 */
export function getTenantConfig(tenantId: TenantId): TenantConfig | null {
  const config = configService.getConfig();
  
  if (!config) {
    return null;
  }

  // If config has tenantId that matches, extract tenant config
  if (config.companyId === tenantId || (config as any).tenantId === tenantId) {
    return {
      id: tenantId,
      name: config.companyName,
      role: 'merchant', // Default role, can be extended
      enabledFeatures: config.enabledModules || config.enabledFeatures || [],
      theme: {
        logo: config.branding?.logo,
        appName: config.branding?.appName,
      },
      homeVariant: (config as any).homeVariant || 'dashboard',
    };
  }

  return null;
}

/**
 * Get tenant ID from current config
 */
export function getCurrentTenantId(): TenantId | null {
  const config = configService.getConfig();
  return config?.companyId || (config as any)?.tenantId || null;
}

