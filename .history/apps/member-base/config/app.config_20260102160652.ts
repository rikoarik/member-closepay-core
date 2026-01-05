/**
 * Member Base App App Configuration
 * Auto-generated from tenant configuration
 */

import type { AppConfig } from '../../../packages/core/config/types/AppConfig';
import Config from '../../../packages/core/native/Config';

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
      id: 'activity',
      label: 'Aktivitas',
      visible: true,
      order: 1,
    },
    {
      id: 'home',
      label: 'Beranda',
      visible: true,
      order: 1,
    },
    {
      id: 'news',
      label: 'Berita',
      visible: true,
      order: 3,
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
      order: 2,
    }
  ],

  // Payment methods
  paymentMethods: ['balance', 'bank_transfer', 'virtual_account'],

  // Branding
  branding: {
    logo: '', // Set logo URL here (e.g., 'https://example.com/logo.png')
    appName: 'Member Base App',
  },

  // Login configuration
  login: {
    showSignUp: true, // Show/hide sign up link
    showSocialLogin: true, // Show/hide social login buttons
    socialLoginProviders: ['google'], // Available social login providers (only Google, no Facebook)
  },

  // Service configuration
  services: {
    api: {
      // Use environment variable from .env.staging or .env.production
      // Fallback to production URL for safety
      baseUrl: Config.API_BASE_URL || 'https://api.solusiuntuknegeri.com',
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

  // QR Button configuration
  showQrButton: true,

  // Support configuration
  support: {
    whatsappNumber: Config.SUPPORT_WHATSAPP_NUMBER || '6289526643223', // Format: country code + number without +
    email: Config.SUPPORT_EMAIL || 'support@closepay.com',
  },
};
