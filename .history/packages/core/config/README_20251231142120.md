# Config Module

## Overview

Core configuration module yang mengelola app configuration, plugin system, responsive utilities, axios configuration, dan berbagai utility functions. Module ini adalah foundation untuk semua fitur aplikasi dengan support untuk multi-tenant, dynamic plugin loading, dan configuration-driven features.

**Key Features:**
- App configuration management dengan reactive updates
- Dynamic plugin system dengan manifest-based loading
- Responsive utilities untuk berbagai ukuran layar (termasuk EDC devices)
- Axios configuration dengan auto token attachment
- Tenant management dan multi-company support
- Feature flags dan module enable/disable
- Event emitter untuk config changes
- Logger service dengan configurable levels

## Architecture

### Folder Structure

```
packages/core/config/
├── components/          # UI components
│   ├── icons/          # Icon components
│   ├── onboarding/    # Onboarding screen
│   ├── phone-mockup/  # Phone mockup component
│   └── ui/            # Reusable UI components
├── constants/          # Constants
│   └── index.ts
├── hooks/              # React hooks
│   ├── useConfig.ts
│   ├── useConfigRefresh.ts
│   ├── useDraggableBottomSheet.ts
│   ├── useQuickMenu.ts
│   └── useRefreshWithConfig.ts
├── plugins/           # Plugin system
│   ├── contracts/     # Plugin contracts
│   ├── hooks/         # Plugin hooks
│   ├── PluginRegistry.ts
│   ├── pluginLoader.ts
│   ├── manifestValidator.ts
│   └── types.ts
├── services/          # Business logic
│   ├── configService.ts
│   ├── configRefreshService.ts
│   ├── tenantService.ts
│   ├── axiosConfig.ts
│   ├── loggerService.ts
│   ├── BaseService.ts
│   ├── permissionService.ts
│   ├── onboardingService.ts
│   └── quickMenuService.ts
├── types/             # TypeScript types
│   ├── AppConfig.ts
│   └── errors.ts
├── utils/             # Utilities
│   ├── responsive.ts
│   ├── validation.ts
│   ├── sanitization.ts
│   ├── errorHandler.ts
│   ├── fonts.ts
│   ├── appVersion.ts
│   └── configEventEmitter.ts
├── tenants.ts         # Tenant configurations
└── index.ts           # Public exports
```

### Plugin System Architecture

```
App Config (enabledModules)
    ↓
Plugin Loader (loadPluginManifest)
    ↓
Manifest Validator (validateManifest)
    ↓
Plugin Registry (registerPlugin)
    ↓
Plugin Component Loader (loadPluginComponent)
    ↓
Dynamic Component Loading (usePluginComponent)
```

## Installation & Setup

### Dependencies

Module ini sudah terintegrasi dengan:
- `@core/auth` - Token service untuk axios interceptor
- `@core/native` - Config untuk API URLs
- `axios` - HTTP client
- `react-native` - React Native components

### Initialization

Config module memerlukan initialization di app entry point:

```typescript
import { configService } from '@core/config';
import appConfig from './config/app.config';

// Set config saat app start
configService.setConfig(appConfig);
```

## Usage Examples

### Basic Config Usage

```typescript
import { useConfig, configService } from '@core/config';

function MyComponent() {
  const { config, refreshConfig } = useConfig();

  if (!config) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Company: {config.companyName}</Text>
      <Text>Features: {config.enabledFeatures.join(', ')}</Text>
      <Button title="Refresh Config" onPress={refreshConfig} />
    </View>
  );
}
```

### Check Feature Flags

```typescript
import { configService } from '@core/config';

// Check if feature is enabled
const isBalanceEnabled = configService.isFeatureEnabled('balance');
const isPaymentEnabled = configService.isFeatureEnabled('payment');

// Check if module is enabled
const isBalanceModuleEnabled = configService.isModuleEnabled('balance');
```

### Responsive Utilities

```typescript
import { 
  scale, 
  moderateScale, 
  verticalScale,
  moderateVerticalScale,
  useDimensions,
  getHorizontalPadding,
  getVerticalPadding
} from '@core/config';

function ResponsiveComponent() {
  const { width, height, isTablet, isEDC } = useDimensions();

  return (
    <View style={{
      paddingHorizontal: getHorizontalPadding(),
      paddingVertical: getVerticalPadding(),
    }}>
      <Text style={{ fontSize: moderateScale(16) }}>
        Responsive Text
      </Text>
      <View style={{
        width: scale(100),
        height: verticalScale(50),
      }}>
        {/* Responsive container */}
      </View>
    </View>
  );
}
```

### Plugin System Usage

```typescript
import { usePluginComponent, PluginRegistry } from '@core/config';

function PluginLoader() {
  // Load plugin component dynamically
  const { Component, isLoading, error } = usePluginComponent('balance', 'TransactionHistoryScreen');

  if (isLoading) {
    return <Text>Loading plugin...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!Component) {
    return <Text>Plugin not found</Text>;
  }

  return <Component />;
}
```

### Axios Instance Usage

```typescript
import { axiosInstance } from '@core/config';

// Axios instance sudah auto-attach JWT token
async function fetchData() {
  try {
    const response = await axiosInstance.get('/api/data');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

### Logger Service

```typescript
import { logger, LogLevel } from '@core/config';

// Configure logger
logger.setLevel(LogLevel.DEBUG);

// Use logger
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### Error Handling

```typescript
import { handleApiError, getUserFriendlyMessage } from '@core/config';

try {
  await apiCall();
} catch (error) {
  const apiError = handleApiError(error);
  const message = getUserFriendlyMessage(apiError);
  Alert.alert('Error', message);
}
```

## API Reference

### Hooks

#### `useConfig(options?: UseConfigOptions)`

Reactive config hook dengan auto-update saat config berubah.

**Returns:**
```typescript
{
  config: AppConfig | null;
  refreshConfig: () => Promise<void>;
}
```

**Example:**
```typescript
const { config, refreshConfig } = useConfig();
```

#### `useConfigRefresh()`

Hook untuk trigger config refresh dengan loading state.

**Returns:**
```typescript
{
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  error: Error | null;
}
```

#### `useDimensions()`

Reactive dimensions hook untuk responsive design.

**Returns:**
```typescript
{
  width: number;
  height: number;
  isEDC: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}
```

#### `usePluginComponent(pluginId: string, componentName: string, options?: UsePluginComponentOptions)`

Hook untuk load plugin component dynamically.

**Returns:**
```typescript
{
  Component: React.ComponentType | null;
  isLoading: boolean;
  error: Error | null;
}
```

#### `usePluginRegistry()`

Hook untuk access plugin registry.

**Returns:**
```typescript
{
  plugins: PluginManifest[];
  enabledPlugins: string[];
  isPluginEnabled: (pluginId: string) => boolean;
  getPlugin: (pluginId: string) => PluginManifest | undefined;
}
```

### Services

#### `configService`

Configuration service untuk manage app config.

**Methods:**
- `loadConfig(): Promise<AppConfig>`
- `getConfig(): AppConfig | null`
- `setConfig(config: AppConfig): void`
- `refreshConfig(force?: boolean): Promise<void>`
- `isFeatureEnabled(feature: string): boolean`
- `isModuleEnabled(module: string): boolean`
- `getMenuConfig(): MenuItemConfig[]`
- `getTenantConfig(): TenantConfig | null`

#### `axiosInstance`

Pre-configured axios instance dengan auto token attachment.

**Features:**
- Auto-attach JWT token dari `tokenService`
- Auto-refresh token on 401
- Error handling dengan user-friendly messages
- Request/response logging

**Example:**
```typescript
import { axiosInstance } from '@core/config';

const response = await axiosInstance.get('/api/data');
```

#### `logger`

Logger service dengan configurable levels.

**Methods:**
- `debug(message: string, ...args: any[]): void`
- `info(message: string, ...args: any[]): void`
- `warn(message: string, ...args: any[]): void`
- `error(message: string, error?: any): void`
- `setLevel(level: LogLevel): void`

### Responsive Utilities

#### `scale(size: number, width?: number): number`

Scale horizontal size berdasarkan lebar layar.

**Example:**
```typescript
const width = scale(100); // Responsive width
```

#### `verticalScale(size: number, height?: number): number`

Scale vertical size berdasarkan tinggi layar.

**Example:**
```typescript
const height = verticalScale(50); // Responsive height
```

#### `moderateScale(size: number, factor?: number, width?: number): number`

Scale font size dengan moderasi (tidak terlalu besar/kecil).

**Example:**
```typescript
const fontSize = moderateScale(16, 0.5); // Moderate font scaling
```

#### `moderateVerticalScale(size: number, factor?: number, height?: number): number`

Scale vertical spacing dengan moderasi.

**Example:**
```typescript
const padding = moderateVerticalScale(16, 0.5);
```

#### `getHorizontalPadding(): number`

Get responsive horizontal padding.

#### `getVerticalPadding(): number`

Get responsive vertical padding.

#### `getScreenDimensions()`

Get current screen dimensions (static, tidak reactive).

#### `isTablet(): boolean`

Check if device is tablet.

#### `isLandscape(): boolean`

Check if device is in landscape mode.

#### `isPortrait(): boolean`

Check if device is in portrait mode.

### Plugin System

#### `PluginRegistry`

Plugin registry untuk manage registered plugins.

**Methods:**
- `registerPlugin(manifest: PluginManifest): void`
- `enablePlugin(pluginId: string): void`
- `disablePlugin(pluginId: string): void`
- `isPluginEnabled(pluginId: string): boolean`
- `getPlugin(pluginId: string): PluginManifest | undefined`
- `getAllPlugins(): PluginManifest[]`
- `getEnabledPlugins(): PluginManifest[]`

#### `initializePlugins()`

Initialize plugins berdasarkan config.

**Example:**
```typescript
import { initializePlugins } from '@core/config';

await initializePlugins();
```

#### `loadPluginComponent(pluginId: string, componentName: string)`

Load plugin component dynamically.

**Example:**
```typescript
import { loadPluginComponent } from '@core/config';

const Component = await loadPluginComponent('balance', 'TransactionHistoryScreen');
```

### Types

#### `AppConfig`

```typescript
interface AppConfig {
  companyId: string;
  companyName: string;
  tenantId: string;
  segmentId: string;
  enabledFeatures: string[];
  enabledModules: string[];
  menuConfig: MenuItemConfig[];
  paymentMethods: string[];
  homeVariant: 'dashboard' | 'member';
  branding: {
    logo?: string;
    appName: string;
    primaryColor?: string;
  };
  login: {
    showSignUp: boolean;
    showSocialLogin: boolean;
    socialLoginProviders: string[];
  };
  services: {
    api: {
      baseUrl: string;
      timeout: number;
    };
    auth: {
      useMock: boolean;
    };
    features: {
      pushNotification: boolean;
      analytics: boolean;
      crashReporting: boolean;
    };
  };
  showQrButton?: boolean;
}
```

#### `PluginManifest`

```typescript
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  type: 'core-plugin' | 'domain-plugin';
  description?: string;
  routes?: PluginRoute[];
  dependencies?: string[];
  exports?: {
    components?: string[];
    hooks?: string[];
    services?: string[];
  };
}
```

## Configuration

### App Config Structure

App config didefinisikan di `apps/{companyId}/config/app.config.ts`:

```typescript
import { AppConfig } from '@core/config';

const appConfig: AppConfig = {
  companyId: 'member-base',
  companyName: 'Member Base',
  tenantId: 'member-base',
  segmentId: 'balance-management',
  enabledFeatures: ['balance', 'payment'],
  enabledModules: ['balance', 'payment'],
  menuConfig: [
    {
      id: 'home',
      label: 'Beranda',
      icon: 'home',
      route: 'Home',
    },
  ],
  // ... other config
};

export default appConfig;
```

### Environment Variables

API URLs diambil dari native Config module:

```typescript
// Native Config (from .env files)
API_BASE_URL
API_STG_BASE_URL
API_PROD_BASE_URL
```

### Plugin Configuration

Plugins di-enable via `enabledModules` di AppConfig:

```typescript
{
  enabledModules: ['balance', 'payment', 'catalog'],
}
```

## Best Practices

### ✅ DO

1. **Gunakan `useConfig()` untuk reactive config access**
   ```typescript
   const { config } = useConfig();
   ```

2. **Gunakan responsive utilities untuk semua sizes**
   ```typescript
   const width = scale(100);
   const fontSize = moderateScale(16);
   ```

3. **Check feature flags sebelum menggunakan fitur**
   ```typescript
   if (configService.isFeatureEnabled('balance')) {
     // Use balance feature
   }
   ```

4. **Gunakan `axiosInstance` untuk semua API calls**
   ```typescript
   import { axiosInstance } from '@core/config';
   ```

5. **Handle errors dengan `handleApiError()`**
   ```typescript
   try {
     await apiCall();
   } catch (error) {
     const apiError = handleApiError(error);
   }
   ```

### ❌ DON'T

1. **Jangan hardcode sizes**
   ```typescript
   // ❌ SALAH
   const width = 100;
   
   // ✅ BENAR
   const width = scale(100);
   ```

2. **Jangan access config langsung tanpa hook**
   ```typescript
   // ❌ SALAH
   const config = configService.getConfig();
   
   // ✅ BENAR - untuk reactive updates
   const { config } = useConfig();
   ```

3. **Jangan create axios instance baru**
   ```typescript
   // ❌ SALAH
   import axios from 'axios';
   const instance = axios.create();
   
   // ✅ BENAR
   import { axiosInstance } from '@core/config';
   ```

4. **Jangan hardcode API URLs**
   ```typescript
   // ❌ SALAH
   const url = 'https://api.example.com';
   
   // ✅ BENAR - gunakan config
   const url = config.services.api.baseUrl;
   ```

## Troubleshooting

### Config tidak ter-load

**Problem:** Config selalu null atau default.

**Solution:**
- Pastikan `configService.setConfig()` dipanggil di app entry point
- Check config file path dan format
- Verify config structure sesuai dengan `AppConfig` interface

### Plugin tidak ter-load

**Problem:** Plugin component tidak ditemukan.

**Solution:**
- Check plugin ID di `enabledModules` di config
- Verify plugin manifest format
- Check plugin component name sesuai dengan manifest
- Verify plugin path di `MANIFEST_LOADERS`

### Responsive tidak bekerja

**Problem:** Sizes tidak responsive di berbagai device.

**Solution:**
- Pastikan menggunakan `scale()`, `moderateScale()`, dll
- Check base dimensions (BASE_WIDTH, BASE_HEIGHT)
- Verify device dimensions dengan `useDimensions()`

### Axios token tidak ter-attach

**Problem:** API calls return 401.

**Solution:**
- Check token tersimpan di `tokenService`
- Verify axios interceptor ter-setup
- Check token format (harus valid JWT)

### Config tidak update

**Problem:** Config changes tidak ter-reflect di components.

**Solution:**
- Pastikan menggunakan `useConfig()` hook (bukan direct access)
- Check event emitter subscription
- Verify `configService.refreshConfig()` dipanggil

## Related Modules

- **`@core/auth`** - Token service untuk axios interceptor
- **`@core/native`** - Config untuk API URLs
- **`@core/theme`** - Theme system (menggunakan config untuk primary color)
- **`@core/account`** - Account management (menggunakan config untuk company info)

## Plugin System Details

### Plugin Manifest Format

```json
{
  "id": "balance",
  "name": "Balance Plugin",
  "version": "1.0.0",
  "type": "core-plugin",
  "description": "Balance ledger management",
  "routes": [
    {
      "name": "TransactionHistory",
      "path": "TransactionHistoryScreen",
      "component": "TransactionHistoryScreen"
    }
  ],
  "dependencies": [],
  "exports": {
    "components": ["TransactionHistoryScreen"],
    "hooks": ["useBalance"],
    "services": ["balanceService"]
  }
}
```

### Plugin Loading Flow

1. App config menentukan `enabledModules`
2. Plugin loader load manifest dari `MANIFEST_LOADERS`
3. Manifest validator validate manifest format
4. Plugin registry register plugin
5. Component loader load component dynamically
6. Component digunakan via `usePluginComponent()`

### Plugin Contracts

Plugins dapat define contracts untuk inter-plugin communication:

```typescript
// Plugin contract example
export interface BalanceContract {
  getBalance(): Promise<number>;
  addMutation(amount: number): Promise<void>;
}
```

## Security Notes

1. **Config Storage:**
   - Config tidak disimpan di device (diload dari API/storage)
   - Sensitive data tidak disimpan di config

2. **API Security:**
   - Axios instance auto-attach JWT token
   - Token refresh otomatis on 401
   - Error handling untuk prevent information leakage

3. **Plugin Security:**
   - Plugin manifest validated sebelum load
   - Plugin components loaded dynamically (tidak di-bundle)
   - Plugin dependencies checked

