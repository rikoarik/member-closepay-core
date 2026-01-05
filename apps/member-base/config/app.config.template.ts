/**
 * Merchant Base App Configuration Template
 * Copy this file and customize for your specific company/segment
 */

import type { AppConfig } from '../../../packages/core/config/types/AppConfig';
import Config from '../../../packages/core/native/Config';

/**
 * Example app configuration
 * Replace with your company-specific config
 */
export const appConfig: AppConfig = {
  companyInitial: 'MB', // Company initial (uppercase) - PRIMARY IDENTIFIER
  companyId: 'merchant-base', // Company ID (kebab-case) - Auto-generated from companyInitial if not provided
  companyName: 'Merchant Base',
  segmentId: 'balance-management',

  // Enabled features (feature flags)
  enabledFeatures: [
    'balance',
    'payment'
  ],

  // Enabled modules/plugins
  enabledModules: [
    'balance',
    'payment'
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
    },
    {
      id: 'balance',
      label: 'Balance',
      icon: 'wallet',
      route: 'TransactionHistory',
      visible: true,
      order: 2,
    },
    {
      id: 'payment',
      label: 'Payment',
      icon: 'creditcard',
      route: 'TopUp',
      visible: true,
      order: 3,
    },
  ],

  // Payment methods
  paymentMethods: ['balance', 'bank_transfer', 'virtual_account'],

  // Branding
  branding: {
    logo: 'assets/logo.png', // Logo path (relative path or URL) - Colors come from backend
    appName: 'Merchant Closepay',
  },

  // Service configuration
  services: {
    api: {
      // Use environment variable from .env.staging or .env.production
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
};
