/**
 * Core Config - Tenant System Types
 * Multi-tenant configuration types and definitions
 */

export type TenantId = string;
export type FeatureKey = string;

export interface TenantConfig {
  id: TenantId;
  name: string;
  role: 'merchant' | 'member' | 'admin';
  enabledFeatures: FeatureKey[];
  theme: {
    primaryColor?: string;
    logo?: string;
    appName?: string;
  };
  homeVariant?: 'dashboard' | 'simple' | 'member' | 'custom';
  homeTabs?: Array<{
    id: string;
    label: string;
    component?: string;
    visible?: boolean;
    order?: number;
  }>;
}

