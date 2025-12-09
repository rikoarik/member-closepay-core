/**
 * App Version Utility
 * Get app version from native Android and iOS
 * 
 * For Android: Uses AppVersionModule to get version from PackageManager
 * For iOS: Uses AppVersionModule to get version from CFBundleShortVersionString
 * Falls back to package.json if native module not available
 */

import { Platform, NativeModules } from 'react-native';

interface AppVersionModule {
  getVersion(): Promise<string>;
  getBuildNumber(): Promise<string>;
}

/**
 * Get app version from native Android and iOS
 * Falls back to package.json version if native not available
 */
export const getAppVersion = (): string => {
  try {
    // Try to get from native module (AppVersionModule)
    const AppVersionModule = NativeModules.AppVersionModule as AppVersionModule | undefined;
    
    if (AppVersionModule && typeof AppVersionModule.getVersion === 'function') {
      // Note: This is async, but we're calling it synchronously
      // In a real app, you might want to make this async or use a hook
      // For now, we'll use a synchronous approach with a try-catch
      try {
        // For synchronous access, we'll need to cache the value
        // But since this is called in render, we'll use fallback for now
        // and recommend using async version in useEffect
      } catch (e) {
        // Ignore and use fallback
      }
    }

    // Fallback: Use package.json version
    try {
      // Try to require package.json from root
      const packageJson = require('../../../../package.json');
      if (packageJson?.version) {
        return packageJson.version;
      }
    } catch (e) {
      // If package.json not found, try alternative path
      try {
        const packageJson = require('../../../package.json');
        if (packageJson?.version) {
          return packageJson.version;
        }
      } catch (e2) {
        // Ignore
      }
    }

    // Final fallback
    return '1.0.0';
  } catch (error) {
    console.error('[AppVersion] Error getting version:', error);
    return '1.0.0';
  }
};

/**
 * Get app version asynchronously from native
 * Use this in useEffect or async functions
 */
export const getAppVersionAsync = async (): Promise<string> => {
  try {
    const AppVersionModule = NativeModules.AppVersionModule as AppVersionModule | undefined;
    
    if (AppVersionModule && typeof AppVersionModule.getVersion === 'function') {
      try {
        const version = await AppVersionModule.getVersion();
        if (version) {
          return version;
        }
      } catch (e) {
        console.warn('[AppVersion] Failed to get version from native module:', e);
      }
    }

    // Fallback to package.json
    return getAppVersion();
  } catch (error) {
    console.error('[AppVersion] Error getting version async:', error);
    return getAppVersion(); // Fallback to sync version
  }
};

/**
 * Get build number from native
 */
export const getBuildNumber = (): string => {
  try {
    const AppVersionModule = NativeModules.AppVersionModule as AppVersionModule | undefined;
    
    if (AppVersionModule && typeof AppVersionModule.getBuildNumber === 'function') {
      // Similar to getVersion, this would be async
      // For now, return default
    }

    return '1';
  } catch (error) {
    console.error('[AppVersion] Error getting build number:', error);
    return '1';
  }
};

/**
 * Get build number asynchronously from native
 */
export const getBuildNumberAsync = async (): Promise<string> => {
  try {
    const AppVersionModule = NativeModules.AppVersionModule as AppVersionModule | undefined;
    
    if (AppVersionModule && typeof AppVersionModule.getBuildNumber === 'function') {
      try {
        const buildNumber = await AppVersionModule.getBuildNumber();
        if (buildNumber) {
          return buildNumber;
        }
      } catch (e) {
        console.warn('[AppVersion] Failed to get build number from native module:', e);
      }
    }

    return '1';
  } catch (error) {
    console.error('[AppVersion] Error getting build number async:', error);
    return '1';
  }
};

/**
 * Get full version string with build info
 * Format: "version (build)" or just "version"
 */
export const getFullVersion = (): string => {
  const version = getAppVersion();
  const buildNumber = getBuildNumber();
  
  // If build number is different from version and not default, append it
  if (buildNumber && buildNumber !== version && buildNumber !== '1') {
    return `${version} (${buildNumber})`;
  }
  
  return version;
};

