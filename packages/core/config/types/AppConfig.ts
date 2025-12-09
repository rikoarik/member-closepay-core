/**
 * Core Config - AppConfig Types
 * Types untuk aplikasi configuration
 */

import { TenantId } from '../tenants';

export interface AppConfig {
  companyId: string;
  companyName: string;
  tenantId?: TenantId; // Tenant ID for multi-tenant support
  segmentId: 'balance-management' | 'campus' | 'fnb' | 'umroh' | 'community' | 'retribution' | 'koperasi' | 'tourism' | 'sport-center' | 'retail';
  
  // Feature flags
  enabledFeatures: string[];
  enabledModules: string[];
  
  // Home variant from tenant config
  homeVariant?: 'dashboard' | 'simple' | 'member' | 'custom';
  
  // Home tabs configuration (for member variant)
  homeTabs?: HomeTabConfig[];
  
  // Menu configuration
  menuConfig: MenuItemConfig[];
  
  // Payment methods
  paymentMethods: string[];
  
  // Branding
  branding: BrandingConfig;
  
  // Login configuration
  login?: LoginConfig;
  
  // API services
  services: ServiceConfig;
  
  // Plugin-specific configs
  plugins?: Record<string, PluginConfig>;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  route?: string;
  order?: number;
  module?: string;
  feature?: string;
  screen?: string;
}

export interface BrandingConfig {
  logo: string;
  appName: string;
  splashImage?: string;
  // Note: primaryColor sekarang di-handle oleh Theme Service, tidak lagi di config
}

export interface LoginConfig {
  showSignUp?: boolean; // Show/hide sign up link
  showSocialLogin?: boolean; // Show/hide social login buttons
  socialLoginProviders?: string[]; // List of social login providers (e.g., ['google', 'facebook'])
}

export interface ServiceConfig {
  api: {
    baseUrl: string;
    companyEndpoint?: string;
    timeout?: number;
  };
  auth?: {
    useMock?: boolean;
  };
  features?: {
    pushNotification?: boolean;
    analytics?: boolean;
    crashReporting?: boolean;
  };
}

export interface PluginConfig {
  [key: string]: any;
}

export interface HomeTabConfig {
  id: string;
  label: string;
  component?: string; // Component name to render (optional, defaults to id)
  visible?: boolean; // Default: true
  order?: number; // Order in tabs
}

