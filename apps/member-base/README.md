# Member Base App App Template

Template untuk company-specific merchant app. Gunakan sebagai starting point untuk membuat app baru.

## Struktur

```
apps/member-base/
├── config/
│   └── app.config.template.ts  # Template config
├── assets/                      # Company branding assets (optional)
│   ├── logo.png
│   └── splash.png
├── index.tsx                    # App entry point
└── README.md                    # This file
```

## Cara Menggunakan Template

### 1. Copy Template

Buat folder baru untuk company Anda:

```bash
cp -r apps/member-base apps/{your-company-id}
```

### 2. Update App Entry Point

Edit `apps/{your-company-id}/index.tsx`:

```typescript
import { AppNavigator } from '../../../src/navigation/AppNavigator';
// atau buat custom navigator di apps/{your-company-id}/navigation/

// Load your config
import { appConfig } from './config/app.config';
configService.setConfig(appConfig);
```

### 3. Buat App Configuration

Copy dan edit `config/app.config.template.ts`:

```typescript
export const appConfig: AppConfig = {
  companyId: 'your-company-id',
  companyName: 'Your Company Name',
  segmentId: 'balance-management',
  enabledFeatures: ['balance', 'payment'],
  enabledModules: ['balance', 'payment'],
  // ... customize sesuai kebutuhan
};
```

### 4. Customize Branding

Update `branding` di config:

```typescript
branding: {
  primaryColor: '#YOUR_COLOR',
  logo: './assets/logo.png',
  appName: 'Your App Name',
},
```

### 5. Configure Plugins

Enable/disable plugins sesuai kebutuhan:

```typescript
enabledModules: [
  'balance',      // Core: Balance management
  'payment',      // Core: Payment gateway
  'catalog',      // Optional: Product catalog
  'order',        // Optional: Order management
  'reporting',    // Optional: Reports & analytics
],
```

## Config Loading Patterns

### Pattern 1: Static Config (Development/Template)

```typescript
import { appConfig } from './config/app.config';
configService.setConfig(appConfig);
```

### Pattern 2: Load from API (Production)

```typescript
async function loadConfigFromAPI() {
  const response = await fetch(`https://api.example.com/config/${companyId}`);
  const config = await response.json();
  configService.setConfig(config);
  return config;
}
```

### Pattern 3: Load from Storage with API Fallback

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function loadConfig() {
  // Try storage first
  const cached = await AsyncStorage.getItem('app_config');
  if (cached) {
    const config = JSON.parse(cached);
    const isExpired = Date.now() - config._timestamp > 3600000; // 1 hour
    
    if (!isExpired) {
      configService.setConfig(config);
      return config;
    }
  }
  
  // Fallback to API
  const config = await loadConfigFromAPI();
  await AsyncStorage.setItem('app_config', JSON.stringify({
    ...config,
    _timestamp: Date.now(),
  }));
  
  configService.setConfig(config);
  return config;
}
```

## Custom Navigation

Jika perlu custom navigation selain AppNavigator default:

### Option 1: Extend AppNavigator

```typescript
// apps/{your-company-id}/navigation/CustomNavigator.tsx
import { AuthNavigator } from '@core/navigation';
import { YourCustomScreen } from '../screens/YourCustomScreen';

export const CustomNavigator = () => {
  const customScreens = (
    <>
      <Stack.Screen name="YourCustomScreen" component={YourCustomScreen} />
    </>
  );
  
  return <AuthNavigator appScreens={customScreens} />;
};
```

### Option 2: Create Full Custom Navigator

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from '@core/navigation';

const Stack = createNativeStackNavigator();

export const CustomNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Your custom screens */}
        {/* Then use AuthNavigator or compose differently */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Best Practices

1. **Config First**: Load config sebelum initialize plugins
2. **Error Handling**: Selalu handle errors dengan graceful fallback
3. **Loading States**: Tampilkan loading screen saat initialize
4. **Plugin Management**: Hanya enable plugins yang diperlukan
5. **Branding**: Gunakan config untuk branding, bukan hardcode

## Environment-Specific Configs

### Development
```typescript
services: {
  api: {
    baseUrl: 'https://api.dev.example.com',
  },
  auth: {
    useMock: true, // Use mock auth for development
  },
},
```

### Staging
```typescript
services: {
  api: {
    baseUrl: 'https://api.stg.example.com',
  },
  auth: {
    useMock: false,
  },
},
```

### Production
```typescript
services: {
  api: {
    baseUrl: 'https://api.example.com',
  },
  auth: {
    useMock: false,
  },
},
```

## Example: Complete App Setup

```typescript
import React, { useEffect, useState } from 'react';
import { configService, initializePlugins } from '@core/config';
import { AppNavigator } from '../../../src/navigation/AppNavigator';
import { appConfig } from './config/app.config';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Load config
      configService.setConfig(appConfig);
      
      // 2. Initialize plugins (uses config to determine which plugins to load)
      await initializePlugins();
      
      // 3. App is ready
      setReady(true);
    };
    
    init();
  }, []);

  if (!ready) return <LoadingScreen />;
  
  return <AppNavigator />;
}
```

## Troubleshooting

### Plugin tidak ter-load
- Pastikan plugin ada di `enabledModules` di config
- Pastikan plugin manifest ada di `packages/plugins/{plugin-id}/plugin.manifest.json`
- Check console untuk error messages

### Config tidak ter-load
- Pastikan `configService.setConfig()` dipanggil sebelum `initializePlugins()`
- Check apakah config format sesuai dengan `AppConfig` type

### Navigation error
- Pastikan semua screen sudah didaftarkan di `AppNavigator`
- Check apakah route names match dengan yang digunakan di code
