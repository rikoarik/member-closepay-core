import { TalsecConfig } from 'freerasp-react-native';

import Config from 'react-native-config';

/**
 * Security Configuration for Talsec (FreeRASP)
 * 
 * IMPORTANT: You must update the 'certificateHashes' and 'appTeamId' 
 * with your actual production keys for this to work correctly in Release mode.
 */
export const securityConfig: TalsecConfig = {
  androidConfig: {
    packageName: Config.ENV === 'staging' ? 'com.merchantclosepayv2.staging' : 'com.merchantclosepayv2',
    // Run `keytool -list -v -keystore your_keystore.keystore` to get the SHA-256 hash
    certificateHashes: ['YOUR_RELEASE_KEY_HASH_HERE'], 
    supportedAlternativeStores: ['com.android.vending'],
  },
  iosConfig: {
    appBundleId: 'com.merchantclosepayv2', 
    appTeamId: 'YOUR_TEAM_ID', 
  },
  watcherMail: 'security@closepay.id', // Update with your security email
  isProd: Config.ENV === 'production', // Set to true for production builds to enable strict checking
};
