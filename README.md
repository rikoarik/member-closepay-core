# Closepay V2 - Member Base App

React Native application untuk Closepay Member Base dengan multi-tenant support, plugin system, dan custom UI components.

## Features

- **Authentication & Authorization** - Secure login dengan JWT token management
- **Multi-tenant Support** - Konfigurasi per tenant dengan plugin system
- **Plugin System** - Modular architecture dengan dynamic plugin loading
- **Theme System** - Dark/Light mode support dengan customizable theme
- **i18n (Internationalization)** - Multi-language support (Indonesian & English)
- **Custom UI Components** - Reusable components dengan animasi smooth
- **Pull-to-Refresh** - Custom pull-to-refresh dengan animasi di topbar (Instagram-style)
- **Navigation System** - Stack & tab navigation dengan type-safe routing
- **Notification System** - Real-time notification dengan badge counter
- **Account Management** - User profile, company, dan outlet management
- **Responsive Design** - Support untuk berbagai device size termasuk EDC devices

## Tech Stack

- **React Native** 0.82.1
- **TypeScript** 5.8.3
- **React Navigation** 7.x - Navigation library
- **Zustand** 5.x - Lightweight state management
- **Axios** 1.x - HTTP client dengan interceptors
- **NativeWind** 4.x - Tailwind CSS for React Native
- **React Native Worklets** - Smooth animations
- **FreeRASP** - Security & anti-tampering
- **React Native Safe Area Context** - Safe area handling
- **Iconsax React Native** - Icon library

## Prerequisites

- Node.js >= 20
- npm or yarn
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java JDK 17+ (for Android)

## Quick Start

### Setup

**Windows:**
```batch
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Running the App

**Start Metro Bundler:**
```bash
npm start
```

**Run on Android:**
```bash
npm run android
```

**Run on iOS:**
```bash
npm run ios
```

## Project Structure

```
member-base-app/
├── apps/
│   └── member-base/              # Main application
│       ├── config/
│       │   ├── app.config.ts     # App configuration
│       │   └── app.config.template.ts
│       ├── src/
│       │   ├── components/       # App-specific components
│       │   │   └── home/        # Home screen components
│       │   └── screens/         # App screens
│       │       ├── HomeScreen.tsx
│       │       ├── NewsDetailScreen.tsx
│       │       └── NotificationScreen.tsx
│       └── index.tsx            # App entry point
│
├── packages/
│   └── core/                     # Core modules
│       ├── account/              # Account management
│       │   ├── components/       # Profile & edit screens
│       │   ├── models/           # User, Company, Outlet models
│       │   └── services/         # Account services
│       ├── auth/                 # Authentication
│       │   ├── components/       # Login screen
│       │   ├── hooks/            # useAuth, useToken hooks
│       │   ├── services/         # Auth & token services
│       │   └── stores/           # Auth state (Zustand)
│       ├── config/               # Configuration system
│       │   ├── components/
│       │   │   ├── ui/          # Custom UI components
│       │   │   ├── icons/       # Custom icons
│       │   │   ├── onboarding/  # Onboarding screens
│       │   │   └── phone-mockup/ # Phone mockup components
│       │   ├── hooks/            # Custom hooks
│       │   ├── plugins/          # Plugin system
│       │   ├── services/         # Config services
│       │   ├── tenants.ts        # Tenant configurations
│       │   └── utils/            # Utilities (responsive, fonts)
│       ├── i18n/                 # Internationalization
│       │   ├── components/       # Language selector
│       │   ├── context/          # I18n context
│       │   ├── hooks/            # useTranslation hook
│       │   └── locales/          # Translation files (en, id)
│       ├── notification/         # Notification system
│       │   ├── components/       # Notification list
│       │   ├── hooks/            # useNotifications hook
│       │   └── services/         # Notification service
│       ├── security/             # Security features
│       │   ├── SecurityConfig.ts
│       │   └── SecurityProvider.tsx
│       └── theme/                # Theme system
│           ├── components/       # Theme settings
│           ├── context/          # Theme context
│           ├── hooks/            # useTheme hook
│           └── services/         # Theme service
│
├── android/                      # Android native code
├── ios/                          # iOS native code
├── assets/                       # Assets (fonts, images, onboarding)
│   ├── fonts/                   # MonaSans font family
│   └── onboarding/              # Onboarding assets
├── tools/
│   └── app-manager/             # App management tools
└── config files                 # babel, metro, tailwind, tsconfig
```

## Core Modules

### Auth Module (`@core/auth`)

Authentication dan authorization dengan JWT token management.

**Components:**
- `LoginScreen` - Login screen dengan form validation

**Hooks:**
- `useAuth()` - Authentication state dan methods
- `useToken()` - Token management

**Services:**
- `authService` - Authentication API calls
- `tokenService` - Token storage & retrieval

**Store:**
- `authStore` - Global auth state (Zustand)

### Account Module (`@core/account`)

Account management dengan user profile, company, dan outlet management.

**Components:**
- `ProfileScreen` - User profile screen
- `EditProfileScreen` - Edit profile screen

**Services:**
- `accountService` - Account API calls

### Theme Module (`@core/theme`)

Theme system dengan dark/light mode support.

**Hooks:**
- `useTheme()` - Access current theme dan colors

**Services:**
- `themeService` - Theme persistence & management

**Usage:**
```typescript
import { useTheme } from '@core/theme';

const { colors, isDarkMode, toggleTheme } = useTheme();
```

### i18n Module (`@core/i18n`)

Internationalization dengan multi-language support.

**Hooks:**
- `useTranslation()` - Translation hook

**Locales:**
- `en.ts` - English translations
- `id.ts` - Indonesian translations

**Usage:**
```typescript
import { useTranslation } from '@core/i18n';

const { t, changeLanguage, currentLanguage } = useTranslation();
const text = t('home.title');
```

### Config Module (`@core/config`)

Configuration system dengan plugin support dan tenant management.

**Services:**
- `configService` - Config management
- `tenantService` - Tenant configuration
- `pluginLoader` - Dynamic plugin loading
- `pluginRegistry` - Plugin registry

**Features:**
- Multi-tenant configuration
- Plugin system dengan dynamic loading
- Responsive utilities (scale, fonts, padding)
- Custom UI components

### Security Module (`@core/security`)

Security features dengan FreeRASP integration.

**Components:**
- `SecurityProvider` - Security context provider

**Config:**
- `SecurityConfig` - Security configuration

### Notification Module (`@core/notification`)

Notification system dengan real-time updates.

**Components:**
- `NotificationList` - Notification list component

**Hooks:**
- `useNotifications()` - Notification state dan methods

**Services:**
- `notificationService` - Notification API calls

## Custom UI Components

Semua custom UI components tersedia di `@core/config`.

### TopBarRefreshControl & TopBarRefreshIndicator

Custom pull-to-refresh dengan animasi smooth di topbar (Instagram-style).

**Features:**
- Layout ikut turun saat pull down
- Custom indicator dengan animasi (scale, opacity, rotation)
- Smooth animations dengan spring physics
- Automatic refresh trigger saat threshold tercapai

**Usage:**
```typescript
import { useTopBarRefresh, TopBarRefreshIndicator } from '@core/config';

const { pullDistance, spacingHeight, handleScroll, handleScrollBeginDrag, handleScrollEndDrag } = 
  useTopBarRefresh(refreshing, handleRefresh);

<ScrollView
  onScroll={handleScroll}
  onScrollBeginDrag={handleScrollBeginDrag}
  onScrollEndDrag={handleScrollEndDrag}
>
  <Animated.View style={{ height: spacingHeight }}>
    <TopBarRefreshIndicator
      pullDistance={pullDistance}
      refreshing={refreshing}
    />
  </Animated.View>
  {/* Content */}
</ScrollView>
```

### TabSwitcher

Segmented control atau pill tabs dengan smooth animations.

**Variants:**
- `segmented` - Segmented control style
- `pill` - Pill tabs style

**Usage:**
```typescript
import { TabSwitcher } from '@core/config';

<TabSwitcher
  variant="segmented"
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={handleTabChange}
/>
```

### BottomSheet

Draggable bottom sheet dengan gesture support.

**Usage:**
```typescript
import { BottomSheet } from '@core/config';

<BottomSheet
  visible={visible}
  onClose={handleClose}
  snapPoints={['50%', '90%']}
>
  {/* Content */}
</BottomSheet>
```

### ScreenHeader

Reusable header dengan back button dan title.

**Usage:**
```typescript
import { ScreenHeader } from '@core/config';

<ScreenHeader
  title="Settings"
  onBackPress={handleBack}
  rightComponent={<Button />}
/>
```

### SkeletonLoader

Skeleton loading components untuk berbagai use cases.

**Components:**
- `BalanceCardSkeleton`
- `TransactionItemSkeleton`
- `NewsItemSkeleton`
- `QuickAccessButtonSkeleton`
- `NotificationItemSkeleton`

**Usage:**
```typescript
import { BalanceCardSkeleton } from '@core/config';

<BalanceCardSkeleton />
```

### ErrorModal

Modal untuk menampilkan error messages.

**Usage:**
```typescript
import { ErrorModal } from '@core/config';

<ErrorModal
  visible={showError}
  title="Error"
  message="Something went wrong"
  onClose={handleClose}
/>
```

### DatePicker

Date picker component.

**Usage:**
```typescript
import { DatePicker } from '@core/config';

<DatePicker
  value={selectedDate}
  onChange={handleDateChange}
  mode="date"
/>
```

## Configuration

App configuration berada di `apps/member-base/config/app.config.ts`.

### Update Configuration

Gunakan app manager untuk sync configuration:

```bash
# Windows
tools/app-manager/manage.bat sync member-base

# Linux/Mac
tools/app-manager/manage.sh sync member-base
```

### Configuration Structure

```typescript
{
  companyId: string;
  companyName: string;
  homeVariant: 'dashboard' | 'member';
  homeTabs: TabConfig[];
  branding: {
    primaryColor: string;
    logo?: string;
    appName: string;
  };
  services: {
    api: {
      baseUrl: string;
    };
  };
}
```

## Available Scripts

### Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on Android (staging)
npm run android:staging

# Run on Android (production)
npm run android:prod

# Run on iOS
npm run ios
```

### Building

```bash
# Build Android APK (debug)
npm run build:apk:debug

# Build Android APK (release)
npm run build:apk

# Build Android APK (staging)
npm run build:apk:staging

# Build Android APK (production)
npm run build:apk:prod

# Build Android (debug)
npm run build:android:debug

# Build Android (release)
npm run build:android:release
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Android)
npm run test:e2e:android

# Run E2E tests (iOS)
npm run test:e2e:ios
```

### Linting

```bash
# Run linter
npm run lint
```

## Development Guidelines

### Code Structure

1. **Components** - Reusable UI components di `packages/core/config/components/ui/`
2. **Screens** - App screens di `apps/member-base/src/screens/`
3. **Services** - Business logic di `packages/core/*/services/`
4. **Hooks** - Custom hooks di `packages/core/*/hooks/`
5. **Stores** - State management di `packages/core/*/stores/`

### Adding New Features

1. Buat module baru di `packages/core/{module-name}/`
2. Export dari `packages/core/{module-name}/index.ts`
3. Gunakan alias `@core/{module-name}` untuk import
4. Update configuration jika diperlukan

### Working with Plugins

1. Buat plugin manifest di `packages/plugins/{plugin-id}/plugin.manifest.json`
2. Register plugin di config (`enabledModules`)
3. Plugin akan di-load secara dynamic saat runtime

### Theme Customization

Theme colors dapat di-customize melalui config:

```typescript
branding: {
  primaryColor: '#3B82F6',
  // ...
}
```

Atau extend theme di `packages/core/theme/services/themeService.ts`.

### Adding Translations

1. Update translation files di `packages/core/i18n/locales/`
2. Tambahkan key baru dengan nested structure
3. Gunakan `useTranslation()` hook untuk access translations

**Example:**
```typescript
// locales/id.ts
export default {
  home: {
    title: 'Beranda',
    welcome: 'Selamat Datang',
  },
};
```

```typescript
// Usage
const { t } = useTranslation();
const title = t('home.title');
```

### Responsive Design

Gunakan utilities dari `@core/config` untuk responsive design:

```typescript
import { scale, moderateScale, getHorizontalPadding, useDimensions } from '@core/config';

// Scale based on screen width
const size = scale(24);

// Moderate scale for fonts
const fontSize = moderateScale(16);

// Responsive padding
const padding = getHorizontalPadding();

// Reactive dimensions
const { width, height, isTablet } = useDimensions();
```

## Troubleshooting

### Metro Bundler Issues

Jika ada masalah dengan Metro bundler:

```bash
# Clear cache dan restart
npm start -- --reset-cache
```

### Android Build Issues

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### iOS Build Issues

```bash
# Clean pods
cd ios
rm -rf Pods
pod install
cd ..
```

### Plugin tidak ter-load

- Pastikan plugin ada di `enabledModules` di config
- Check plugin manifest format
- Check console untuk error messages

### Config tidak ter-load

- Pastikan `configService.setConfig()` dipanggil sebelum initialize plugins
- Check config format sesuai `AppConfig` type
- Verify config file path

## License

Private - Merchant Closepay V2 - Member Base App
