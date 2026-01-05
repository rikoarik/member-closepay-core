import { TalsecConfig } from 'freerasp-react-native';
import { Platform } from 'react-native';

import Config from '../native/Config';

/**
 * Security Configuration for Talsec (FreeRASP)
 * 
 * IMPORTANT: Set ANDROID_CERTIFICATE_HASH and IOS_APP_TEAM_ID for production builds.
 */
const isProduction = Config.ENV === 'production';
const certificateHashes = Config.ANDROID_CERTIFICATE_HASH 
  ? [Config.ANDROID_CERTIFICATE_HASH] 
  : [];

const androidConfigBase = {
  packageName: Config.ENV === 'staging' ? 'com.solusinegeri.app.staging' : 'com.solusinegeri.app',
  supportedAlternativeStores: [
    'com.android.vending',
    'com.huawei.appmarket',
    'com.sec.android.app.samsungapps',
  ],
  malwareConfig: {
    blacklistedPackageNames: [] as string[],
    blacklistedHashes: [] as string[],
    suspiciousPermissions: [
      ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      ['android.permission.READ_SMS', 'android.permission.SEND_SMS'],
    ] as string[][],
    whitelistedInstallationSources: [
      'com.android.vending',
      'com.huawei.appmarket',
    ] as string[],
  },
};

export const shouldInitializeFreeRasp = certificateHashes.length > 0 || Platform.OS === 'ios';

const androidConfig = certificateHashes.length > 0
  ? { ...androidConfigBase, certificateHashes: certificateHashes }
  : undefined;

export const securityConfig: TalsecConfig = {
  ...(androidConfig ? { androidConfig } : {}),
  iosConfig: {
    appBundleId: 'com.solusinegeri.app',
    appTeamId: Config.IOS_APP_TEAM_ID || '',
  },
  watcherMail: Config.TALSEC_WATCHER_MAIL || '',
  isProd: isProduction,
};

/**
 * Helper to convert security config to native-friendly format
 * Used by native modules to build Talsec configuration
 */
export const getNativeSecurityConfig = () => {
  return {
    packageName: Config.ENV === 'staging' ? 'com.solusinegeri.app.staging' : 'com.solusinegeri.app',
    certificateHashes: certificateHashes,
    isProd: isProduction,
    watcherMail: Config.TALSEC_WATCHER_MAIL || '',
    appBundleId: 'com.solusinegeri.app',
    appTeamId: Config.IOS_APP_TEAM_ID || '',
  };
};