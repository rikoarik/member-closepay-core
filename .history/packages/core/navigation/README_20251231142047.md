# Navigation Module

## Overview

Core navigation module yang menyediakan navigation setup dengan support untuk dynamic plugin loading, app-specific screen injection, dan type-safe navigation. Module ini menggunakan React Navigation dengan Native Stack Navigator dan mendukung extensible navigation structure.

**Key Features:**
- Type-safe navigation dengan TypeScript
- Dynamic plugin route loading
- App-specific screen injection
- Auth flow navigation
- Base navigator dengan extensible structure
- Automatic route registration dari plugin manifests

## Architecture

### Folder Structure

```
packages/core/navigation/
├── AuthNavigator.tsx          # Auth flow navigator
├── BaseNavigator.tsx          # Base navigator wrapper
├── createAppNavigator.tsx    # App navigator creator
├── types.ts                  # Navigation types
└── index.ts                  # Public exports
```

### Navigation Structure

```
NavigationContainer
    ↓
AuthNavigator / createAppNavigator
    ↓
Stack Navigator
    ├── Core Screens (Login, SignUp, etc.)
    ├── Plugin Screens (dynamic)
    └── App Screens (injected)
```

## Installation & Setup

### Dependencies

Module ini memerlukan:
- `@react-navigation/native` - React Navigation core
- `@react-navigation/native-stack` - Native Stack Navigator
- `@core/auth` - Auth screens
- `@core/config` - Plugin system
- `@core/account` - Profile screens
- `@core/i18n` - Language selection
- `@core/theme` - Theme settings

### Initialization

Navigation module memerlukan `NavigationContainer` di app root:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@core/navigation';

function App() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
```

## Usage Examples

### Basic Navigation Setup

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@core/navigation';

function App() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
```

### App-Specific Navigator

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createAppNavigator } from '@core/navigation';
import { HomeScreen } from './screens/HomeScreen';

function App() {
  const AppNavigator = createAppNavigator({
    tenantId: 'member-base',
    HomeScreen: HomeScreen,
  });

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
```

### Inject App-Specific Screens

```typescript
import { AuthNavigator } from '@core/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  const appScreens = (
    <>
      <Stack.Screen name="CustomScreen" component={CustomScreen} />
      <Stack.Screen name="AnotherScreen" component={AnotherScreen} />
    </>
  );

  return (
    <NavigationContainer>
      <AuthNavigator appScreens={appScreens} />
    </NavigationContainer>
  );
}
```

### Type-Safe Navigation

```typescript
import { NavigationProp } from '@core/navigation';

interface Props {
  navigation: NavigationProp<'Home'>;
}

function HomeScreen({ navigation }: Props) {
  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  return <Button onPress={navigateToProfile} title="Go to Profile" />;
}
```

### Navigation with Parameters

```typescript
import { NavigationProp } from '@core/navigation';

interface Props {
  navigation: NavigationProp<'NewsDetail'>;
}

function NewsList({ navigation }: Props) {
  const openNews = (newsId: string) => {
    navigation.navigate('NewsDetail', { newsId });
  };

  return <Button onPress={() => openNews('123')} title="Open News" />;
}
```

## API Reference

### Components

#### `AuthNavigator`

Auth flow navigator dengan support untuk app-specific screens.

**Props:**
```typescript
interface AuthNavigatorProps {
  appScreens?: ReactNode | React.ReactElement[];
}
```

**Features:**
- Core auth screens (Login, SignUp, ForgotPassword)
- Profile screens (Profile, EditProfile)
- Settings screens (Language, Theme, QuickMenu)
- Dynamic plugin routes
- App-specific screen injection
- Onboarding flow
- Auth state management

**Example:**
```typescript
import { AuthNavigator } from '@core/navigation';

<AuthNavigator appScreens={customScreens} />
```

#### `BaseNavigator`

Base navigator wrapper yang menggunakan AuthNavigator.

**Props:** None

**Example:**
```typescript
import { BaseNavigator } from '@core/navigation';

<BaseNavigator />
```

#### `createAppNavigator(options)`

Factory function untuk create app-specific navigator.

**Options:**
```typescript
interface CreateAppNavigatorOptions {
  tenantId: TenantId;
  HomeScreen: React.ComponentType;
  appScreens?: ReactNode | React.ReactElement[];
}
```

**Returns:** React component (navigator)

**Example:**
```typescript
import { createAppNavigator } from '@core/navigation';

const AppNavigator = createAppNavigator({
  tenantId: 'member-base',
  HomeScreen: HomeScreen,
  appScreens: customScreens,
});
```

### Types

#### `RootStackParamList`

Type definition untuk semua possible routes.

```typescript
type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Onboarding: undefined;
  Profile: undefined;
  EditProfile: undefined;
  LanguageSelection: undefined;
  QuickMenuSettings: undefined;
  ThemeSettings: undefined;
  NewsDetail: { newsId?: string; news?: any };
  Notifications: undefined;
  // Plugin routes added dynamically
  [key: string]: any;
};
```

#### `NavigationProp<T>`

Type helper untuk navigation prop dengan type safety.

```typescript
type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;
```

**Example:**
```typescript
interface Props {
  navigation: NavigationProp<'Home'>;
}
```

## Configuration

### Core Routes

Core routes yang selalu tersedia:
- `Login` - Login screen
- `SignUp` - Sign up screen
- `ForgotPassword` - Forgot password screen
- `Home` - Home screen (from app)
- `Onboarding` - Onboarding screen
- `Profile` - Profile screen
- `EditProfile` - Edit profile screen
- `LanguageSelection` - Language selection screen
- `QuickMenuSettings` - Quick menu settings screen
- `ThemeSettings` - Theme settings screen
- `Notifications` - Notifications screen
- `NewsDetail` - News detail screen (with params)

### Plugin Routes

Plugin routes di-register secara dynamic dari plugin manifests:
- Routes dari `plugin.manifest.json`
- Component loaded via `usePluginComponent()`
- Routes available setelah plugin loaded

### App-Specific Routes

App-specific routes bisa di-inject via `appScreens` prop:
- Custom screens dari app
- Routes yang tidak di core atau plugins
- App-specific navigation flow

## Best Practices

### ✅ DO

1. **Gunakan type-safe navigation**
   ```typescript
   interface Props {
     navigation: NavigationProp<'Home'>;
   }
   ```

2. **Define route params di RootStackParamList**
   ```typescript
   type RootStackParamList = {
     NewsDetail: { newsId: string };
   };
   ```

3. **Use createAppNavigator untuk app-specific navigator**
   ```typescript
   const AppNavigator = createAppNavigator({
     tenantId: 'member-base',
     HomeScreen: HomeScreen,
   });
   ```

4. **Inject app screens via appScreens prop**
   ```typescript
   <AuthNavigator appScreens={appScreens} />
   ```

### ❌ DON'T

1. **Jangan hardcode route names**
   ```typescript
   // ❌ SALAH
   navigation.navigate('HardcodedRoute');
   
   // ✅ BENAR - use type-safe navigation
   navigation.navigate('Home');
   ```

2. **Jangan skip NavigationContainer**
   ```typescript
   // ❌ SALAH
   function App() {
     return <AuthNavigator />;
   }
   
   // ✅ BENAR
   function App() {
     return (
       <NavigationContainer>
         <AuthNavigator />
       </NavigationContainer>
     );
   }
   ```

3. **Jangan mix navigation patterns**
   ```typescript
   // ❌ SALAH - mixing AuthNavigator dan createAppNavigator
   const AppNavigator = createAppNavigator({ ... });
   return <AuthNavigator />;
   
   // ✅ BENAR - choose one pattern
   return <AuthNavigator appScreens={...} />;
   ```

## Troubleshooting

### Route tidak ditemukan

**Problem:** Navigation error "Route not found".

**Solution:**
- Check route name di `RootStackParamList`
- Verify route registered di navigator
- Check plugin routes loaded
- Verify app screens injected dengan benar

### Type errors di navigation

**Problem:** TypeScript errors untuk navigation prop.

**Solution:**
- Use `NavigationProp<T>` type
- Verify route name di `RootStackParamList`
- Check route params type match

### Plugin routes tidak muncul

**Problem:** Plugin routes tidak tersedia di navigator.

**Solution:**
- Check plugin manifest format
- Verify plugin loaded via `initializePlugins()`
- Check plugin routes di manifest
- Verify component loader working

### App screens tidak muncul

**Problem:** App-specific screens tidak muncul.

**Solution:**
- Check `appScreens` prop format
- Verify screens adalah valid Stack.Screen elements
- Check navigation container setup
- Verify screen components exported correctly

## Related Modules

- **`@core/auth`** - Auth screens (Login, SignUp, ForgotPassword)
- **`@core/config`** - Plugin system untuk dynamic routes
- **`@core/account`** - Profile screens
- **`@core/i18n`** - Language selection screen
- **`@core/theme`** - Theme settings screen

## Implementation Notes

### Navigation Pattern

Navigation menggunakan pattern:
1. **Core Routes:** Always available (Login, Profile, etc.)
2. **Plugin Routes:** Dynamic dari plugin manifests
3. **App Routes:** Injected via `appScreens` prop

### Route Registration

Routes di-register dengan urutan:
1. Core routes (hardcoded)
2. Plugin routes (dynamic dari manifests)
3. App routes (injected via prop)

### Type Safety

Type safety dicapai dengan:
- `RootStackParamList` untuk semua routes
- `NavigationProp<T>` untuk navigation prop type
- TypeScript compile-time checking

### Plugin Route Loading

Plugin routes loaded via:
1. Plugin manifest define routes
2. `usePluginComponent()` load component
3. Route registered di navigator
4. Route available untuk navigation

