/**
 * Member Base App App Configuration
 * Auto-generated from tenant configuration
 */

import type { AppConfig } from '../../../packages/core/config/types/AppConfig';

export const appConfig: AppConfig = {
  companyId: 'member-base',
  companyName: 'Member Base App',
  tenantId: 'member-base',
  segmentId: 'balance-management',
  
  // Enabled features (feature flags)
  enabledFeatures: [],
  
  // Enabled modules/plugins
  enabledModules: [],
  
  // Home variant from tenant config
  homeVariant: 'member',
  
  // Home tabs configuration (for member variant)
  homeTabs: [
    {
      id: 'home',
      label: 'Beranda',
      visible: true,
      order: 1,
    },
    {
      id: 'activity',
      label: 'Aktivitas',
      visible: true,
      order: 2,
    },
    {
      id: 'news',
      label: 'Berita',
      visible: true,
      order: 2,
    }
  ],
  
  // Menu configuration
  menuConfig: [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      route: 'Home',
      visible: true,
      order: 1,
    }
  ],
  
  // Payment methods
  paymentMethods: ['balance', 'bank_transfer', 'virtual_account'],
  
  // Branding
  branding: {
    primaryColor: '#0066CC',
    primaryDark: '#0052A3',
    primaryLight: '#E6F2FF',
    logo: '',
    appName: 'Member Base App',
  },
  
  // Service configuration
  services: {
    api: {
      baseUrl: 'https://api.stg.solusiuntuknegeri.com',
      timeout: 30000,
    },
    auth: {
      useMock: __DEV__, // Use mock in development, real API in production
    },
    features: {
      pushNotification: true,
      analytics: true,
      crashReporting: false,
    },
  },
};
