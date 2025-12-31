# Native Module

## Overview

Core native module yang menyediakan akses ke native modules untuk SecureStorage (encrypted storage), Clipboard, dan Config (environment variables). Module ini menggantikan library third-party dengan custom native implementations untuk better security dan control.

**Key Features:**
- SecureStorage dengan Tink AEAD encryption (AES-256-GCM)
- Clipboard operations dengan URL detection
- Config access untuk environment variables (obfuscated)
- Auto-migration dari old storage implementations
- Platform-specific implementations (Android)

## Architecture

### Folder Structure

```
packages/core/native/
├── SecureStorage.ts    # Encrypted storage module
├── Clipboard.ts        # Clipboard module
├── Config.ts          # Config/environment variables module
└── index.ts           # Public exports
```

### Module Overview

```
Native Modules
├── SecureStorage
│   ├── Encrypted storage (Tink AEAD)
│   ├── Auto-migration support
│   └── Multi-item operations
├── Clipboard
│   ├── String operations
│   ├── URL detection
│   └── Content checking
└── Config
    ├── Environment variables
    ├── Obfuscated values
    └── Runtime decryption
```

## Installation & Setup

### Dependencies

Module ini memerlukan:
- Native modules (Android)
- Tink crypto library (for SecureStorage)
- React Native native modules bridge

### Platform Support

- **Android:** Fully supported
- **iOS:** Config supported, SecureStorage/Clipboard pending

### Initialization

Native modules tidak memerlukan initialization khusus. Import dan gunakan langsung:

```typescript
import SecureStorage from '@core/native/SecureStorage';
import Clipboard from '@core/native/Clipboard';
import Config from '@core/native/Config';
```

## Usage Examples

### SecureStorage

#### Basic Operations

```typescript
import SecureStorage from '@core/native/SecureStorage';

// Set item (encrypted)
await SecureStorage.setItem('key', 'value');

// Get item (decrypted)
const value = await SecureStorage.getItem('key');

// Remove item
await SecureStorage.removeItem('key');

// Clear all
await SecureStorage.clear();
```

#### Multi-Item Operations

```typescript
import SecureStorage from '@core/native/SecureStorage';

// Set multiple items
await SecureStorage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);

// Get multiple items
const items = await SecureStorage.multiGet(['key1', 'key2']);
// Returns: [['key1', 'value1'], ['key2', 'value2']]

// Remove multiple items
await SecureStorage.multiRemove(['key1', 'key2']);
```

#### Get All Keys

```typescript
import SecureStorage from '@core/native/SecureStorage';

const keys = await SecureStorage.getAllKeys();
// Returns: ['key1', 'key2', ...]
```

### Clipboard

#### Basic Operations

```typescript
import Clipboard from '@core/native/Clipboard';

// Set string to clipboard
Clipboard.setString('Hello World');

// Get string from clipboard
const text = await Clipboard.getString();

// Check if clipboard has string
const hasText = await Clipboard.hasString();

// Check if clipboard has URL
const hasURL = await Clipboard.hasURL();
```

#### URL Detection

```typescript
import Clipboard from '@core/native/Clipboard';

const hasURL = await Clipboard.hasURL();
if (hasURL) {
  const url = await Clipboard.getString();
  // Process URL
}
```

### Config

#### Get Config Values

```typescript
import Config, { getConfig, getConfigAsync, getAllConfig } from '@core/native/Config';

// Get single value (synchronous)
const apiUrl = getConfig('API_BASE_URL');

// Get single value (async)
const apiUrl = await getConfigAsync('API_BASE_URL');

// Get all config
const allConfig = getAllConfig();

// Access via default export
const apiUrl = Config.API_BASE_URL;
```

#### Available Config Keys

```typescript
// API URLs
API_URL
API_HOSTNAME
API_STG_URL
API_STG_HOSTNAME
API_BASE_URL
API_STG_BASE_URL
API_PROD_BASE_URL

// Certificates
PIN_LEAF_CERT
PIN_INTERMEDIATE

// Environment
ENV

// Security
ANDROID_CERTIFICATE_HASH
IOS_APP_TEAM_ID
TALSEC_WATCHER_MAIL
```

## API Reference

### SecureStorage

#### Interface

```typescript
interface SecureStorageInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiSet(keyValuePairs: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}
```

#### Methods

- `setItem(key: string, value: string): Promise<void>`
  - Set item dengan encryption
  - Auto-migrate dari old storage jika perlu

- `getItem(key: string): Promise<string | null>`
  - Get item dengan decryption
  - Returns null jika key tidak ada

- `removeItem(key: string): Promise<void>`
  - Remove item dari storage

- `clear(): Promise<void>`
  - Clear all items dari storage

- `getAllKeys(): Promise<string[]>`
  - Get all keys dari storage

- `multiGet(keys: string[]): Promise<[string, string | null][]>`
  - Get multiple items sekaligus
  - Returns array of [key, value] tuples

- `multiSet(keyValuePairs: [string, string][]): Promise<void>`
  - Set multiple items sekaligus
  - More efficient untuk bulk operations

- `multiRemove(keys: string[]): Promise<void>`
  - Remove multiple items sekaligus

### Clipboard

#### Interface

```typescript
interface ClipboardInterface {
  setString(text: string): void;
  getString(): Promise<string>;
  hasString(): Promise<boolean>;
  hasURL(): Promise<boolean>;
}
```

#### Methods

- `setString(text: string): void`
  - Set string ke clipboard
  - Synchronous operation

- `getString(): Promise<string>`
  - Get string dari clipboard
  - Returns empty string jika tidak ada

- `hasString(): Promise<boolean>`
  - Check jika clipboard punya string content

- `hasURL(): Promise<boolean>`
  - Check jika clipboard punya URL

### Config

#### Interface

```typescript
interface ConfigInterface {
  API_URL: string;
  API_HOSTNAME: string;
  API_STG_URL: string;
  API_STG_HOSTNAME: string;
  API_BASE_URL: string;
  API_STG_BASE_URL: string;
  API_PROD_BASE_URL: string;
  PIN_LEAF_CERT: string;
  PIN_INTERMEDIATE: string;
  ENV: string;
  ANDROID_CERTIFICATE_HASH?: string;
  IOS_APP_TEAM_ID?: string;
  TALSEC_WATCHER_MAIL?: string;
  [key: string]: string | undefined;
}
```

#### Methods

- `getConfig(key: string): string | undefined`
  - Get config value (synchronous)
  - Returns undefined jika key tidak ada

- `getConfigAsync(key: string): Promise<string | undefined>`
  - Get config value (async)
  - Returns undefined jika key tidak ada

- `getAllConfig(): ConfigInterface`
  - Get all config values
  - Returns config object

#### Default Export

```typescript
import Config from '@core/native/Config';

// Access config values
const apiUrl = Config.API_BASE_URL;
const env = Config.ENV;
```

## Configuration

### SecureStorage Encryption

SecureStorage menggunakan:
- **Algorithm:** Tink AEAD (AES-256-GCM)
- **Key Management:** Android KeyStore
- **Migration:** Auto-migrate dari AsyncStorage/EncryptedStorage

### Config Obfuscation

Config values di-obfuscate di build time:
- Values encrypted di native code
- Decrypted at runtime
- Tidak visible di APK/IPA

### Environment Variables

Config values di-set via environment variables:
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- Native module read dari build config

## Best Practices

### ✅ DO

1. **Gunakan SecureStorage untuk sensitive data**
   ```typescript
   await SecureStorage.setItem('token', token);
   ```

2. **Gunakan multi operations untuk bulk operations**
   ```typescript
   await SecureStorage.multiSet([
     ['key1', 'value1'],
     ['key2', 'value2'],
   ]);
   ```

3. **Check platform availability**
   ```typescript
   if (Platform.OS === 'android') {
     await SecureStorage.setItem('key', 'value');
   }
   ```

4. **Handle errors dengan try-catch**
   ```typescript
   try {
     await SecureStorage.setItem('key', 'value');
   } catch (error) {
     console.error('Storage error:', error);
   }
   ```

5. **Use Config untuk environment variables**
   ```typescript
   const apiUrl = Config.API_BASE_URL;
   ```

### ❌ DON'T

1. **Jangan store sensitive data di Clipboard**
   ```typescript
   // ❌ SALAH - clipboard tidak encrypted
   Clipboard.setString('sensitive_token');
   
   // ✅ BENAR - use SecureStorage
   await SecureStorage.setItem('token', 'sensitive_token');
   ```

2. **Jangan hardcode config values**
   ```typescript
   // ❌ SALAH
   const apiUrl = 'https://api.example.com';
   
   // ✅ BENAR
   const apiUrl = Config.API_BASE_URL;
   ```

3. **Jangan assume module available**
   ```typescript
   // ❌ SALAH - might fail on iOS
   await SecureStorage.setItem('key', 'value');
   
   // ✅ BENAR - check platform
   if (Platform.OS === 'android') {
     await SecureStorage.setItem('key', 'value');
   }
   ```

4. **Jangan store large data di SecureStorage**
   ```typescript
   // ❌ SALAH - SecureStorage untuk small data
   await SecureStorage.setItem('largeData', largeJsonString);
   
   // ✅ BENAR - use file storage untuk large data
   ```

## Troubleshooting

### SecureStorage tidak available

**Problem:** SecureStorage operations fail dengan "not available" error.

**Solution:**
- Check platform (hanya Android supported saat ini)
- Verify native module ter-link dengan benar
- Check Tink library ter-install
- Verify Android KeyStore available

### Config values undefined

**Problem:** Config values return undefined.

**Solution:**
- Check environment variables ter-set di build config
- Verify native module ter-link dengan benar
- Check config keys match dengan expected keys
- Verify build menggunakan correct environment

### Clipboard operations fail

**Problem:** Clipboard operations tidak bekerja.

**Solution:**
- Check platform (hanya Android supported saat ini)
- Verify native module ter-link dengan benar
- Check clipboard permissions (jika diperlukan)
- Verify clipboard content format

### Migration issues

**Problem:** Data tidak ter-migrate dari old storage.

**Solution:**
- Check old storage format compatible
- Verify migration logic di native module
- Check storage permissions
- Verify migration tidak corrupt data

## Related Modules

- **`@core/auth`** - Menggunakan SecureStorage untuk token storage
- **`@core/i18n`** - Menggunakan SecureStorage untuk language preference
- **`@core/config`** - Menggunakan Config untuk API URLs
- **`@core/security`** - Menggunakan Config untuk certificate hashes

## Security Notes

### SecureStorage Security

1. **Encryption:**
   - All data encrypted dengan Tink AEAD (AES-256-GCM)
   - Keys stored di Android KeyStore (hardware-backed)
   - No plaintext storage

2. **Migration:**
   - Auto-migrate dari AsyncStorage/EncryptedStorage
   - Migration encrypted during transfer
   - Old data cleared setelah migration

3. **Key Management:**
   - Keys generated per app install
   - Keys tidak bisa di-export
   - Keys cleared jika app uninstalled

### Config Security

1. **Obfuscation:**
   - Values obfuscated di build time
   - Decrypted at runtime only
   - Tidak visible di APK/IPA

2. **Access Control:**
   - Config hanya accessible dari native module
   - No JavaScript access ke raw values
   - Runtime decryption only

### Clipboard Security

1. **Limitations:**
   - Clipboard tidak encrypted (interop dengan other apps)
   - Jangan store sensitive data di clipboard
   - Clear clipboard setelah use (jika sensitive)

2. **Best Practices:**
   - Use SecureStorage untuk sensitive data
   - Clear clipboard setelah copy sensitive data
   - Validate clipboard content sebelum use

## Implementation Notes

### Platform Support

**Current Status:**
- **Android:** Fully supported (SecureStorage, Clipboard, Config)
- **iOS:** Config supported, SecureStorage/Clipboard pending

**Future:**
- iOS SecureStorage implementation
- iOS Clipboard implementation
- Cross-platform consistency

### Migration Strategy

SecureStorage auto-migrate dari:
1. `@react-native-async-storage/async-storage`
2. `react-native-encrypted-storage`

Migration flow:
1. Check old storage untuk data
2. Decrypt old data (jika encrypted)
3. Encrypt dengan Tink AEAD
4. Store di SecureStorage
5. Clear old storage

### Performance Considerations

1. **SecureStorage:**
   - Encryption/decryption overhead minimal
   - Use multi operations untuk bulk operations
   - Cache frequently accessed values

2. **Config:**
   - Values cached setelah first access
   - No performance impact untuk repeated access
   - Async methods untuk non-blocking access

3. **Clipboard:**
   - Operations synchronous (fast)
   - No performance concerns

