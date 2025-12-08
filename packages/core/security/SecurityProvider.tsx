import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { securityConfig } from './SecurityConfig';

// Import freerasp with error handling
// freerasp-react-native is a native module that needs to be properly linked
let talsec: any = null;
let freeraspAvailable = false;

try {
  const freeraspModule = require('freerasp-react-native');
  
  // Try different import patterns based on how the module exports
  // Pattern 1: default export with start method
  if (freeraspModule?.default && typeof freeraspModule.default.start === 'function') {
    talsec = freeraspModule.default;
    freeraspAvailable = true;
  }
  // Pattern 2: named export talsec
  else if (freeraspModule?.talsec && typeof freeraspModule.talsec.start === 'function') {
    talsec = freeraspModule.talsec;
    freeraspAvailable = true;
  }
  // Pattern 3: direct export with start method
  else if (typeof freeraspModule?.start === 'function') {
    talsec = freeraspModule;
    freeraspAvailable = true;
  }
  // Pattern 4: module itself has start
  else if (freeraspModule && typeof freeraspModule.start === 'function') {
    talsec = freeraspModule;
    freeraspAvailable = true;
  }
  
  if (!freeraspAvailable) {
    console.warn('[SecurityProvider] freerasp-react-native loaded but start method not found');
    console.log('[SecurityProvider] Module structure:', Object.keys(freeraspModule || {}));
  }
} catch (error) {
  console.warn('[SecurityProvider] freerasp-react-native not available (native module may not be linked):', error);
  freeraspAvailable = false;
}

interface SecurityContextType {
  isSecure: boolean;
  securityStatus: string;
}

const SecurityContext = createContext<SecurityContextType>({
  isSecure: true,
  securityStatus: 'Secure',
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [securityStatus, setSecurityStatus] = useState('Secure');

  // Memoize alert handler to prevent recreating on every render
  const handleSecurityThreat = useCallback((threatType: string, message: string) => {
    // Prevent multiple alerts using functional update
    setIsSecure(prev => {
      if (!prev) return prev; // Already insecure, don't show alert again
      
      Alert.alert(
        threatType,
        message,
        [
          {
            text: 'Close App',
            onPress: () => {
               if (Platform.OS === 'android') {
                 BackHandler.exitApp();
               }
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );
      
      return false; // Set to insecure
    });
    
    setSecurityStatus(threatType);
  }, []);

  useEffect(() => {
    const startSecurity = async () => {
      try {
        // Check if freerasp is available
        if (!freeraspAvailable || !talsec) {
          console.warn('[SecurityProvider] freerasp-react-native not available, skipping security initialization');
          console.warn('[SecurityProvider] To enable security, ensure native modules are properly linked:');
          console.warn('[SecurityProvider] - Run: cd ios && pod install (for iOS)');
          console.warn('[SecurityProvider] - Rebuild native code: npx react-native run-android/ios');
          return;
        }

        // Final check if start method exists
        if (typeof talsec.start !== 'function') {
          console.warn('[SecurityProvider] talsec.start is not a function, freerasp may not be properly linked');
          console.log('[SecurityProvider] talsec object keys:', talsec ? Object.keys(talsec) : 'null');
          return;
        }

        const config = {
          ...securityConfig,
          // Add threat callbacks directly to config
          onRootDetected: () => {
            handleSecurityThreat('Root Access Detected', 'This device appears to be rooted. The app cannot run securely.');
          },
          onDebuggerDetected: () => {
            handleSecurityThreat('Debugger Detected', 'A debugger is attached to the app.');
          },
          onEmulatorDetected: () => {
            if (securityConfig.isProd) {
              handleSecurityThreat('Emulator Detected', 'Running on an emulator is not allowed.');
            } else {
              console.log('Security Warning: Emulator Detected (Ignored in Dev)');
            }
          },
          onTamperDetected: () => {
            handleSecurityThreat('Tampering Detected', 'The app signature does not match or it has been modified.');
          },
          onHookDetected: () => {
            handleSecurityThreat('Hooking Detected', 'Frida or similar hooking framework detected.');
          },
          onDeviceBindingDetected: () => {},
          onUnofficialStoreDetected: () => {
            handleSecurityThreat('Unofficial Store', 'App was installed from unofficial store.');
          },
          onMalwareDetected: () => {
            handleSecurityThreat('Malware Detected', 'Malware detected on device.');
          },
        };

        await talsec.start(config);
        console.log('[SecurityProvider] Talsec security started successfully');
      } catch (e) {
        console.error('[SecurityProvider] Failed to start Talsec:', e);
        // Don't block app if security fails to start
        // In production, you might want to handle this differently
      }
    };

    startSecurity();
  }, [handleSecurityThreat]);

  // Memoize context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(() => ({
    isSecure,
    securityStatus,
  }), [isSecure, securityStatus]);

  if (!isSecure) {
      // Optionally render a blocking view instead of children
      // return <View style={{flex: 1, backgroundColor: 'black'}} />;
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};
