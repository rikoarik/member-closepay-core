# Security Module

## Overview

Core security module yang mengintegrasikan FreeRASP (Talsec) untuk threat detection dan security monitoring. Module ini mendeteksi berbagai security threats seperti root/jailbreak, debugger, tampering, dan emulator, dengan automatic threat reporting ke server.

**Key Features:**
- FreeRASP integration untuk threat detection
- Root/Jailbreak detection
- Debugger detection
- Tamper detection
- Emulator detection
- Automatic threat reporting
- Security alert UI dengan non-dismissible bottom sheet
- Configurable security settings

## Architecture

### Folder Structure

```
packages/core/security/
├── SecurityProvider.tsx           # Security context provider (event listener)
├── SecurityConfig.ts              # FreeRASP configuration
├── SecurityAlertBottomSheet.tsx   # Security alert UI
├── NativeCrypto.ts               # Native crypto utilities
└── native/
    └── SecurityEventEmitter.ts   # Native module event emitter wrapper
```

### Security Flow

```
App Launch
    ↓
Native Layer (Android/iOS)
    ↓
SecurityNativeModule registered
    ↓
React Native Bridge Ready
    ↓
SecurityNativeModule.initialize() (background thread)
    ↓
FreeRASP initialized (via bridge, background thread)
    ↓
Threat Detection (continuous, native)
    ↓
Threat Detected?
    ↓ Yes
Native Module → Event Emitter → React Native
    ↓
SecurityProvider (event listener) receives threat
    ↓
Report to Server (non-blocking)
    ↓
Show Security Alert (non-dismissible)
    ↓
User must close app
```

### Architecture Overview

Security checks now run in **native background threads** for better stealth:

- **Native Initialization**: SecurityNativeModule initializes FreeRASP in background thread
- **Event-Based Communication**: One-way communication from native → React Native via events
- **Minimal JS Exposure**: Security logic mostly hidden in native layer
- **Silent Logging**: No console.log statements in production builds

## Installation & Setup

### Dependencies

Module ini memerlukan:
- `freerasp-react-native` - FreeRASP library
- `@core/native` - Config untuk certificate hashes
- `@core/config` - Axios instance untuk threat reporting
- `@core/theme` - Theme system untuk alert UI

### Initialization

Security module memerlukan `SecurityProvider` di app root:

```typescript
import { SecurityProvider } from '@core/security';

function App() {
  return (
    <SecurityProvider>
      {/* Your app components */}
    </SecurityProvider>
  );
}
```

### Configuration

Security configuration memerlukan certificate hashes untuk production:

```typescript
// Native Config (.env files)
ANDROID_CERTIFICATE_HASH=your_certificate_hash
IOS_APP_TEAM_ID=your_team_id
TALSEC_WATCHER_MAIL=security@example.com
```

**Important:** 
- FreeRASP hanya di-initialize jika certificate hash tersedia (Android) atau di iOS
- Production builds harus set certificate hashes
- Development builds bisa skip certificate hashes
- Security initialization happens in native background thread (stealth)

## Usage Examples

### Basic Security Provider

```typescript
import { SecurityProvider } from '@core/security';

function App() {
  return (
    <SecurityProvider>
      <YourApp />
    </SecurityProvider>
  );
}
```

### Check Security Status

```typescript
import { useSecurity } from '@core/security';

function SecurityStatus() {
  const { isSecure, securityStatus } = useSecurity();

  if (!isSecure) {
    return <Text>Security threat detected: {securityStatus}</Text>;
  }

  return <Text>Device is secure</Text>;
}
```

### Handle Security Threats

SecurityProvider otomatis handle threats:
- Detect threats via FreeRASP
- Report threats ke server (non-blocking)
- Show security alert (non-dismissible)
- Force app close jika user confirm

## API Reference

### Components

#### `SecurityProvider`

Security context provider dengan event-based threat detection.

**Props:**
```typescript
{
  children: React.ReactNode;
}
```

**Features:**
- Event listener for native threat detection
- Automatic threat reporting
- Security alert display
- App close handling
- Native module coordination

**Example:**
```typescript
import { SecurityProvider } from '@core/security';

<SecurityProvider>
  <App />
</SecurityProvider>
```

#### `SecurityAlertBottomSheet`

Non-dismissible bottom sheet untuk security alerts.

**Props:**
```typescript
{
  visible: boolean;
  threatType: string;
  message: string;
  onCloseApp: () => void;
}
```

**Features:**
- Non-dismissible (user must close app)
- Back button disabled
- Clear threat information
- Close app button

### Hooks

#### `useSecurity()`

Hook untuk access security status.

**Returns:**
```typescript
{
  isSecure: boolean;
  securityStatus: string;
}
```

**Example:**
```typescript
import { useSecurity } from '@core/security';

const { isSecure, securityStatus } = useSecurity();
```

### Configuration

#### `securityConfig`

FreeRASP configuration object.

**Android Config:**
```typescript
{
  packageName: string;
  certificateHashes: string[];
  supportedAlternativeStores: string[];
  malwareConfig: {
    blacklistedPackageNames: string[];
    blacklistedHashes: string[];
    suspiciousPermissions: string[][];
    whitelistedInstallationSources: string[];
  };
}
```

**iOS Config:**
```typescript
{
  appBundleId: string;
  appTeamId: string;
}
```

**Global Config:**
```typescript
{
  watcherMail: string;
  isProd: boolean;
}
```

#### `shouldInitializeFreeRasp`

Flag untuk determine apakah FreeRASP harus di-initialize.

**Conditions:**
- Android: Certificate hash tersedia
- iOS: Always (jika team ID tersedia)

## Security Threats Detected

### Root/Jailbreak Detection

Detects jika device di-root (Android) atau jailbreak (iOS).

**Threat Type:** `root`

**Action:**
- Report ke server
- Show security alert
- Force app close

### Debugger Detection

Detects jika debugger attached ke app.

**Threat Type:** `debugger`

**Action:**
- Report ke server
- Show security alert (optional, bisa di-disable di production)

### Tamper Detection

Detects jika app di-tamper atau modified.

**Threat Type:** `tamper`

**Action:**
- Report ke server
- Show security alert
- Force app close

### Emulator Detection

Detects jika app running di emulator/simulator.

**Threat Type:** `emulator`

**Action:**
- Report ke server
- Show security alert (optional)

### Malware Detection

Detects suspicious apps atau permissions.

**Threat Type:** `malware`

**Action:**
- Report ke server
- Show security alert

## Best Practices

### ✅ DO

1. **Wrap app dengan SecurityProvider**
   ```typescript
   <SecurityProvider>
     <App />
   </SecurityProvider>
   ```

2. **Set certificate hashes untuk production**
   ```typescript
   // .env.production
   ANDROID_CERTIFICATE_HASH=your_hash
   IOS_APP_TEAM_ID=your_team_id
   ```

3. **Monitor security status**
   ```typescript
   const { isSecure } = useSecurity();
   if (!isSecure) {
     // Handle security threat
   }
   ```

4. **Handle threat reporting errors gracefully**
   - Threat reporting adalah non-blocking
   - Errors tidak prevent security alerts
   - Log errors untuk monitoring

### ❌ DON'T

1. **Jangan skip SecurityProvider**
   ```typescript
   // ❌ SALAH - no security protection
   function App() {
     return <YourApp />;
   }
   
   // ✅ BENAR
   function App() {
     return (
       <SecurityProvider>
         <YourApp />
       </SecurityProvider>
     );
   }
   ```

2. **Jangan disable security di production**
   ```typescript
   // ❌ SALAH
   if (__DEV__) {
     // Skip security
   }
   
   // ✅ BENAR - always enable security
   ```

3. **Jangan hardcode certificate hashes**
   ```typescript
   // ❌ SALAH
   const hash = 'hardcoded_hash';
   
   // ✅ BENAR - use environment variables
   const hash = Config.ANDROID_CERTIFICATE_HASH;
   ```

## Troubleshooting

### FreeRASP tidak initialize

**Problem:** SecurityProvider tidak initialize FreeRASP.

**Solution:**
- Check `shouldInitializeFreeRasp` flag
- Verify certificate hash tersedia (Android)
- Check iOS team ID tersedia (iOS)
- Check FreeRASP library ter-install

### Security alert tidak muncul

**Problem:** Threat detected tapi alert tidak muncul.

**Solution:**
- Check SecurityProvider sudah wrap app
- Verify threat type supported
- Check console untuk errors
- Verify SecurityAlertBottomSheet component

### Threat reporting gagal

**Problem:** Threat reporting ke server gagal.

**Solution:**
- Threat reporting adalah non-blocking (tidak block app)
- Check network connection
- Verify API endpoint
- Check axios instance configuration
- Errors tidak prevent security alerts

### False positives

**Problem:** Security alert muncul untuk legitimate devices.

**Solution:**
- Check security config (whitelisted sources, etc.)
- Verify certificate hashes correct
- Check malware config (suspicious permissions)
- Review threat detection settings

## Related Modules

- **`@core/native`** - Config untuk certificate hashes
- **`@core/config`** - Axios instance untuk threat reporting
- **`@core/theme`** - Theme system untuk alert UI

## Security Notes

### Threat Reporting

Threat reporting adalah **non-blocking** dan **fire-and-forget**:
- Tidak block app execution
- Errors tidak prevent security alerts
- Reports sent ke `/security/report-threat` endpoint
- Includes threat type dan details

### Security Alert Behavior

Security alerts adalah **non-dismissible**:
- User tidak bisa dismiss alert
- Back button disabled
- Hanya bisa close app
- Alert muncul untuk critical threats

### FreeRASP Configuration

FreeRASP configuration berdasarkan environment:
- **Development:** Optional (bisa skip certificate hash)
- **Staging:** Recommended (set certificate hash)
- **Production:** Required (must set certificate hash)

### Certificate Hashes

Certificate hashes digunakan untuk:
- Verify app signature (Android)
- Prevent tampering
- Ensure app dari trusted source

**How to get certificate hash:**
```bash
# Android
keytool -list -v -keystore your-keystore.jks | grep SHA256

# iOS
# Get from Apple Developer account
```

## Implementation Notes

### Threat Detection Flow

1. **App Start (Native Layer):**
   - MainApplication.onCreate() / AppDelegate.didFinishLaunchingWithOptions()
   - SecurityNativeModule registered to React Native bridge
   - React Native bridge initializes

2. **Security Initialization:**
   - SecurityProvider mounts in React Native
   - SecurityNativeModule.initialize() called in background thread
   - FreeRASP initialized via React Native bridge (background thread)
   - Threat monitoring begins (native layer)

3. **Threat Detected:**
   - FreeRASP detects threat in native layer
   - SecurityNativeModule emits event via NativeEventEmitter
   - SecurityProvider receives event via SecurityEventEmitter
   - Threat type identified
   - Report to server (async, non-blocking)
   - Show security alert

4. **User Action:**
   - User see security alert
   - User must close app
   - App closed via BackHandler (Android) or error throw (iOS)

### Native Module Architecture

**Android:**
- `SecurityNativeModule.kt` - Native module for security initialization
- `SecurityNativePackage.kt` - React Native package registration
- Initialized in background thread via Thread { }

**iOS:**
- `SecurityNativeModule.swift` - Native module extending RCTEventEmitter
- `SecurityNativeModule.m` - Bridge file for React Native
- Initialized in background queue via DispatchQueue.global(qos: .background)

### Event-Based Communication

Threat detection uses one-way event communication:

```
Native Layer (FreeRASP) 
  → SecurityNativeModule.onThreatDetected()
  → NativeEventEmitter.emit('ThreatDetected')
  → SecurityEventEmitter (TypeScript wrapper)
  → SecurityProvider event listener
  → Threat handling (UI, app close)
```

This approach minimizes JavaScript thread visibility of security checks.

### Threat Reporting Format

```typescript
POST /security/report-threat
{
  threatType: string;        // 'root', 'debugger', 'tamper', etc.
  details: {
    platform: string;        // 'android' | 'ios'
    timestamp: number;       // Unix timestamp
    // ... other threat details
  };
}
```

### Security Alert Types

Security alerts muncul untuk:
- **Critical threats:** Root, tamper (force close)
- **Warning threats:** Debugger, emulator (optional close)
- **Info threats:** Malware detection (informational)

