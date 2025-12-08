/**
 * Jest Setup
 * Global test setup and mocks
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn((keys: string[]) =>
      Promise.resolve(keys.map(key => [key, store[key] || null]))
    ),
    multiSet: jest.fn((pairs: [string, string][]) => {
      pairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    }),
  };
});

// Mock react-native-config
jest.mock('react-native-config', () => {
  const config: Record<string, string> = {
    ENV: 'test',
    API_URL: 'https://api.test.com',
  };
  
  return {
    __esModule: true,
    default: {
      get: jest.fn((key: string) => config[key] || ''),
      getConfig: jest.fn(() => config),
    },
    // Also export as named export
    get: jest.fn((key: string) => config[key] || ''),
  };
});

// Mock freerasp-react-native
jest.mock('freerasp-react-native', () => {
  const mockStart = jest.fn(() => Promise.resolve());
  const mockStop = jest.fn(() => Promise.resolve());
  const mockGetThreats = jest.fn(() => Promise.resolve([]));
  
  const mockNativeEventEmitter = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      start: mockStart,
      stop: mockStop,
      getThreats: mockGetThreats,
    },
    // Named exports if needed
    start: mockStart,
    stop: mockStop,
    getThreats: mockGetThreats,
    // Mock NativeEventEmitter
    NativeEventEmitter: jest.fn(() => mockNativeEventEmitter),
  };
});

// Suppress console warnings and errors in tests (for known issues)
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

console.warn = (...args: any[]) => {
  // Suppress specific warnings we expect in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Cannot enable plugin') ||
      args[0].includes('Cannot disable') ||
      args[0].includes('depends on it') ||
      args[0].includes('Failed to load plugin') ||
      args[0].includes('Using default config'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Suppress dynamic import errors in test environment (we mock these)
console.error = (...args: any[]) => {
  // Suppress known errors that are handled by mocks or are expected in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Failed to load manifest for plugin') ||
      args[0].includes('Failed to load component') ||
      args[0].includes('A dynamic import callback was invoked without --experimental-vm-modules') ||
      args[0].includes('Failed to load plugin') ||
      args[0].includes('[AuthStore] Logout error')) // Suppress expected logout errors in tests
  ) {
    return;
  }
  originalError(...args);
};

// Suppress expected console.log messages in tests
console.log = (...args: any[]) => {
  // Suppress specific log messages we expect in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('[AuthStore] Token expired, clearing...') ||
      args[0].includes('[AuthHelper]') ||
      args[0].includes('Registered plugin:') ||
      args[0].includes('Enabled plugin:') ||
      args[0].includes('Disabled plugin:') ||
      args[0].includes('Initializing PluginRegistry') ||
      args[0].includes('PluginRegistry already initialized') ||
      args[0].includes('PluginRegistry initialized') ||
      args[0].includes('Loading') && args[0].includes('plugins:'))
  ) {
    return;
  }
  originalLog(...args);
};

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: jest.fn(() => true),
      getParent: jest.fn(),
      getState: jest.fn(),
      isFocused: jest.fn(() => true),
      reset: jest.fn(),
      replace: jest.fn(),
    }),
    useRoute: () => ({
      key: 'test-route-key',
      name: 'TestRoute',
      params: {},
    }),
    useFocusEffect: jest.fn((callback) => callback()),
    NavigationContainer: ({ children }: any) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  };
});

// Mock react-native-nfc-manager
jest.mock('react-native-nfc-manager', () => {
  const mockNfcManager = {
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    isSupported: jest.fn(() => Promise.resolve(true)),
    isEnabled: jest.fn(() => Promise.resolve(true)),
    requestTechnology: jest.fn(() => Promise.resolve()),
    cancelTechnologyRequest: jest.fn(() => Promise.resolve()),
    getNdefMessage: jest.fn(() => Promise.resolve(null)),
    setNdefMessage: jest.fn(() => Promise.resolve()),
    sendMifareCommandIOS: jest.fn(() => Promise.resolve([0x90, 0x00])),
    getTag: jest.fn(() => Promise.resolve({ id: 'test-tag-id' })),
    setEventListener: jest.fn((callback) => {
      // Return cleanup function
      return () => {};
    }),
    registerTagEvent: jest.fn((callback) => {
      // Return cleanup function
      return () => {};
    }),
    unregisterTagEvent: jest.fn(() => Promise.resolve()),
  };

  return {
    __esModule: true,
    default: mockNfcManager,
    NfcManager: mockNfcManager,
    NfcTech: {
      Ndef: 'ndef',
      NfcA: 'nfcA',
      NfcB: 'nfcB',
      IsoDep: 'isoDep',
    },
    NfcEvents: {
      DiscoverTag: 'NfcManagerDiscoverTag',
      StateChanged: 'NfcManagerStateChanged',
    },
  };
});

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => {
  const mockBleManager = {
    startDeviceScan: jest.fn((filterUUIDs, options, listener) => {
      // Simulate device discovery
      setTimeout(() => {
        if (listener) {
          listener({
            id: 'device-1',
            name: 'Test NFC Device',
            rssi: -50,
            isConnectable: true,
            serviceUUIDs: ['test-uuid'],
            solicitedServiceUUIDs: [],
            overflowServiceUUIDs: [],
            txPowerLevel: null,
            serviceData: null,
            manufacturerData: null,
          });
        }
      }, 100);
    }),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn((deviceId) => {
      return Promise.resolve({
        id: deviceId,
        name: 'Test NFC Device',
        isConnected: jest.fn(() => true),
        discoverAllServicesAndCharacteristics: jest.fn(() => Promise.resolve([])),
      });
    }),
    cancelDeviceConnection: jest.fn(() => Promise.resolve()),
    state: jest.fn(() => Promise.resolve('PoweredOn')),
    onStateChange: jest.fn((listener) => {
      // Return subscription with remove method
      return { remove: jest.fn() };
    }),
  };

  return {
    __esModule: true,
    BleManager: jest.fn(() => mockBleManager),
    State: {
      Unknown: 'Unknown',
      Resetting: 'Resetting',
      Unsupported: 'Unsupported',
      Unauthorized: 'Unauthorized',
      PoweredOff: 'PoweredOff',
      PoweredOn: 'PoweredOn',
    },
  };
});

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
    hide: jest.fn(),
  },
  BaseToast: jest.fn(),
  ErrorToast: jest.fn(),
  InfoToast: jest.fn(),
  SuccessToast: jest.fn(),
}));

// Mock iconsax-react-nativejs
jest.mock('iconsax-react-nativejs', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ArrowLeft2: (props: any) => <View testID="icon-arrow-left" {...props} />,
    ArrowDown2: (props: any) => <View testID="icon-arrow-down" {...props} />,
    Refresh2: (props: any) => <View testID="icon-refresh" {...props} />,
  };
});

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
        return Promise.resolve();
      }),
    },
  };
});

