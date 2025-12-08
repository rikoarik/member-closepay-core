const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

// NOTE: obfuscator-io-metro-plugin temporarily disabled due to compatibility issues with RN 0.82
// The plugin has path resolution issues on Windows and appears unmaintained.
// Alternative security measures:
// 1. Hermes bytecode compilation (enabled by default in RN 0.82)
// 2. ProGuard/R8 for Android native code obfuscation (configured in build.gradle)
// 3. Talsec freeRASP for runtime protection (already implemented)
//
// TODO: Explore modern alternatives for JS obfuscation:
// - Post-bundle obfuscation tools
// - Alternative Metro plugins compatible with RN 0.82+
//
// const jsoMetroConfig = require("obfuscator-io-metro-plugin")(
//   {
//     // Obfuscation options
//     compact: true,
//     controlFlowFlattening: true,
//     controlFlowFlatteningThreshold: 0.75,
//     deadCodeInjection: true,
//     deadCodeInjectionThreshold: 0.4,
//     debugProtection: false, // Handled by Talsec
//     debugProtectionInterval: 0,
//     disableConsoleOutput: true,
//     identifierNamesGenerator: 'hexadecimal',
//     log: false,
//     numbersToExpressions: true,
//     renameGlobals: false,
//     selfDefending: true,
//     simplify: true,
//     splitStrings: true,
//     stringArray: true,
//     stringArrayCallsTransform: true,
//     stringArrayEncoding: ['rc4'],
//     stringArrayIndexShift: true,
//     stringArrayRotate: true,
//     stringArrayShuffle: true,
//     stringArrayWrappersCount: 1,
//     stringArrayWrappersChainedCalls: true,
//     stringArrayWrappersParametersMaxCount: 2,
//     stringArrayWrappersType: 'variable',
//     stringArrayThreshold: 0.75,
//     unicodeEscapeSequence: false
//   },
//   {
//     runInDev: false, // Do not obfuscate in dev mode
//     logObfuscatedFiles: true
//   },
//   __dirname // Project root for proper path normalization
// );

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');

const config = {
  resolver: {
    // Enable JSON imports for plugin manifests
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    // Path aliases support
    alias: {
      '@core': path.resolve(__dirname, 'packages/core'),
      '@core/config': path.resolve(__dirname, 'packages/core/config'),
      '@core/theme': path.resolve(__dirname, 'packages/core/theme'),
      '@core/i18n': path.resolve(__dirname, 'packages/core/i18n'),
      '@core/navigation': path.resolve(__dirname, 'packages/core/navigation'),
      '@core/account': path.resolve(__dirname, 'packages/core/account'),
      '@core/auth': path.resolve(__dirname, 'packages/core/auth'),
      '@plugins': path.resolve(__dirname, 'packages/plugins'),
      '@app': path.resolve(__dirname, 'src'),
    },
    // Also add to extraNodeModules for compatibility
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === '@core') {
            return path.resolve(__dirname, 'packages/core');
          }
          if (name === '@plugins') {
            return path.resolve(__dirname, 'packages/plugins');
          }
          if (name === '@app') {
            return path.resolve(__dirname, 'src');
          }
          return target[name];
        },
      }
    ),
  },
};

const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config);

module.exports = withNativeWind(mergedConfig, {
  input: './global.css',
});
