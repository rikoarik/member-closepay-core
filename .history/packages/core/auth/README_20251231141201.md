# Auth Module

## Overview

Core authentication module yang mengelola login, logout, token management, dan user session. Module ini menyediakan unified authentication service dengan support untuk mock dan real API, JWT token management, dan secure token storage.

**Key Features:**
- Unified authentication service (mock & real API)
- JWT token management dengan secure storage
- Automatic token refresh
- User session management
- Sign up & forgot password flow
- OAuth support (Google)
- Zustand state management

## Architecture

### Folder Structure

```
packages/core/auth/
├── components/          # UI components
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── hooks/               # React hooks
│   ├── useAuth.ts       # Main auth hook
│   └── useToken.ts      # Token management hook
├── services/            # Business logic
│   ├── authService.ts   # Authentication service
│   └── tokenService.ts  # Token storage service
├── stores/              # State management
│   └── authStore.ts     # Zustand store
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utilities
│   ├── authHelpers.ts   # Auth helper functions
│   └── jwtUtils.ts      # JWT utilities
└── index.ts            # Public exports
```

### Data Flow

```
User Action (Login)
    ↓
useAuth() hook
    ↓
authStore.login()
    ↓
authService.login() / loginWithNonce()
    ↓
API Call (Real) / Mock Response
    ↓
tokenService.setToken() → SecureStorage (encrypted)
    ↓
authStore.setState() → Zustand store
    ↓
Component re-render dengan new state
```

## Installation & Setup

### Dependencies

Module ini sudah terintegrasi dengan:
- `@core/native` - SecureStorage untuk encrypted token storage
- `@core/config` - Config service untuk API URLs dan feature flags
- `zustand` - State management
- `react-native` - React Native components

### Initialization

Auth module tidak memerlukan initialization khusus. Import dan gunakan langsung:

```typescript
import { useAuth, authService, tokenService } from '@core/auth';
```

## Usage Examples

### Basic Login

```typescript
import { useAuth } from '@core/auth';

function LoginComponent() {
  const { login, isLoggingIn, error, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('username', 'password');
      // User akan otomatis ter-authenticate
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (isAuthenticated) {
    return <Text>Logged in!</Text>;
  }

  return (
    <View>
      <Button 
        title="Login" 
        onPress={handleLogin} 
        disabled={isLoggingIn}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

### Login with Nonce (Recommended)

```typescript
import { useAuth } from '@core/auth';

function LoginComponent() {
  const { loginWithNonce, isLoggingIn } = useAuth();

  const handleLogin = async () => {
    try {
      // Login dengan Basic Auth + Nonce (lebih secure)
      await loginWithNonce('username', 'password');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Button 
      title="Login" 
      onPress={handleLogin} 
      disabled={isLoggingIn}
    />
  );
}
```

### Check Authentication Status

```typescript
import { useAuth } from '@core/auth';

function ProtectedComponent() {
  const { isAuthenticated, user, company } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Company: {company?.name}</Text>
    </View>
  );
}
```

### Manual Token Management

```typescript
import { tokenService } from '@core/auth';

// Get token
const token = await tokenService.getToken();

// Check if token expired
const isExpired = await tokenService.isTokenExpired();

// Get time until expiry
const timeLeft = await tokenService.getTimeUntilExpiry();

// Clear tokens (logout)
await tokenService.clearTokens();
```

### JWT Utilities

```typescript
import { 
  decodeJWT, 
  getJWTUserId, 
  getJWTExpiry, 
  isJWTExpired,
  getJWTScopes 
} from '@core/auth';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Decode JWT payload
const payload = decodeJWT(token);
console.log(payload); // { sub: 'user123', exp: 1234567890, ... }

// Get user ID
const userId = getJWTUserId(token);

// Check expiry
const expired = isJWTExpired(token);

// Get scopes
const scopes = getJWTScopes(token);
```

### Sign Up Flow

```typescript
import { authService } from '@core/auth';

// 1. Get sign up metadata
const metadata = await authService.getSignUpMetadata('company-id', 'member');

// 2. Get available tags
const tags = await authService.getSignUpTags('company-id');

// 3. Register user
const signUpData = {
  companyId: 'company-id',
  username: 'newuser',
  password: 'password123',
  email: 'user@example.com',
  tags: ['member'],
  // ... other fields from metadata
};

const response = await authService.register(signUpData);
```

### Forgot Password Flow

```typescript
import { authService } from '@core/auth';

// 1. Send OTP
await authService.sendForgotPasswordOtp('user@example.com');

// 2. Verify OTP
await authService.verifyForgotPasswordOtp('user@example.com', '123456');

// 3. Reset password
await authService.resetPassword(
  'user@example.com',
  '123456',
  'newPassword123'
);
```

### Logout

```typescript
import { useAuth } from '@core/auth';

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // User akan otomatis ter-logout
      // Token akan di-clear dari storage
      // State akan di-reset
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
```

## API Reference

### Hooks

#### `useAuth()`

Main hook untuk access auth state dan actions.

**Returns:**
```typescript
{
  // State
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  loginWithNonce: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setToken: (token: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}
```

#### `useToken()`

Hook untuk token management.

**Returns:**
```typescript
{
  token: string | null;
  isExpired: boolean;
  timeUntilExpiry: number;
  refresh: () => Promise<void>;
}
```

### Services

#### `authService`

Authentication service dengan unified interface untuk mock dan real API.

**Methods:**
- `login(username: string, password: string): Promise<AuthResponse>`
- `logout(): Promise<void>`
- `getProfile(): Promise<User>`
- `refreshToken(): Promise<string>`
- `isAuthenticated(): boolean`
- `getSignUpMetadata(companyId: string, userType?: string): Promise<MetadataResponse>`
- `getSignUpTags(companyId: string): Promise<TagItem[]>`
- `register(data: SignUpData, otp?: string): Promise<SignUpResponse>`
- `sendForgotPasswordOtp(email: string): Promise<void>`
- `verifyForgotPasswordOtp(email: string, otp: string): Promise<void>`
- `resetPassword(email: string, otp: string, newPassword: string): Promise<void>`

**Mock vs Real API:**
- Mock mode: Diaktifkan via `configService.services.auth.useMock`
- Real API: Menggunakan axios instance dari `@core/config`

#### `tokenService`

Token storage service dengan encrypted storage.

**Methods:**
- `getToken(): Promise<string | null>`
- `getRefreshToken(): Promise<string | null>`
- `setToken(token: string): Promise<void>`
- `setRefreshToken(refreshToken: string): Promise<void>`
- `clearTokens(): Promise<void>`
- `getTokenExpiry(): Promise<number | null>`
- `setTokenExpiry(expiresIn: number): Promise<void>`
- `isTokenExpired(): Promise<boolean>`
- `getTimeUntilExpiry(): Promise<number>`

**Storage:**
- Menggunakan `SecureStorage` dari `@core/native`
- Data dienkripsi dengan Tink AEAD (AES-256-GCM)
- Auto-migrate dari AsyncStorage/EncryptedStorage

### Components

#### `LoginScreen`

Pre-built login screen component.

```typescript
import { LoginScreen } from '@core/auth';

<LoginScreen />
```

#### `SignUpScreen`

Pre-built sign up screen component.

```typescript
import { SignUpScreen } from '@core/auth';

<SignUpScreen />
```

#### `ForgotPasswordScreen`

Pre-built forgot password screen component.

```typescript
import { ForgotPasswordScreen } from '@core/auth';

<ForgotPasswordScreen />
```

### JWT Utilities

#### `decodeJWT(token: string): JWTPayload | null`

Decode JWT token tanpa verify signature.

#### `getJWTExpiry(token: string): number | null`

Extract expiry timestamp dari JWT (in milliseconds).

#### `isJWTExpired(token: string): boolean`

Check if JWT is expired (with 1 minute buffer for clock skew).

#### `getJWTUserId(token: string): string | null`

Extract user ID dari JWT (sub claim).

#### `getJWTScopes(token: string): string[]`

Extract scopes dari JWT.

#### `getJWTType(token: string): string | null`

Extract token type dari JWT.

#### `getTimeUntilJWTExpiry(token: string): number`

Get time until JWT expires (in milliseconds).

#### `getJWTClaims(token: string): JWTPayload | null`

Get all JWT claims.

### Types

```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role?: string;
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Company {
  id: string;
  name: string;
  segmentId?: string;
  config?: Record<string, any>;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  company: Company;
}

interface JWTPayload {
  iss?: string;        // Issuer
  sub?: string;        // Subject (user ID)
  iat?: number;        // Issued at (seconds)
  exp?: number;        // Expiry (seconds)
  ser?: number;        // Serial
  jti?: string;        // JWT ID
  nonce?: string;      // Nonce
  aud?: string | null; // Audience
  scope?: string[];    // Scopes/permissions
  type?: string;       // Token type
  [key: string]: any;  // Additional claims
}
```

## Configuration

### Mock vs Real API

Auth service otomatis switch antara mock dan real API berdasarkan config:

```typescript
// apps/{companyId}/config/app.config.ts
{
  services: {
    auth: {
      useMock: true,  // true = mock, false = real API
    },
  },
}
```

### Mock Users (Development Only)

Mock users hanya tersedia di development mode (`__DEV__`). Untuk testing, gunakan:

```typescript
// Default mock users (hanya di development)
const mockUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' },
];
```

**Security:** Mock users otomatis disabled di production.

### Token Refresh

Automatic token refresh di-setup saat login. Interval refresh dapat diatur via `authHelpers.ts`.

## Best Practices

### ✅ DO

1. **Gunakan `loginWithNonce()` untuk production**
   - Lebih secure dengan Basic Auth + Nonce
   - Recommended untuk real API

2. **Check `isAuthenticated` sebelum protected routes**
   ```typescript
   const { isAuthenticated } = useAuth();
   if (!isAuthenticated) {
     return <LoginScreen />;
   }
   ```

3. **Handle errors dengan user-friendly messages**
   ```typescript
   try {
     await login(username, password);
   } catch (error) {
     // Error sudah di-format oleh authService
     Alert.alert('Login Failed', error.message);
   }
   ```

4. **Gunakan `tokenService` untuk manual token operations**
   ```typescript
   const isExpired = await tokenService.isTokenExpired();
   if (isExpired) {
     await logout();
   }
   ```

5. **Initialize auth saat app start**
   ```typescript
   useEffect(() => {
     initializeAuth();
   }, []);
   ```

### ❌ DON'T

1. **Jangan hardcode credentials**
   ```typescript
   // ❌ SALAH
   await login('admin', 'password123');
   
   // ✅ BENAR - ambil dari user input
   await login(username, password);
   ```

2. **Jangan store token di plain text**
   ```typescript
   // ❌ SALAH
   AsyncStorage.setItem('token', token);
   
   // ✅ BENAR - gunakan tokenService
   await tokenService.setToken(token);
   ```

3. **Jangan verify JWT signature di client**
   - JWT utilities hanya decode, tidak verify
   - Signature verification harus di backend

4. **Jangan expose mock users di production**
   - Mock users otomatis disabled di production
   - Jangan hardcode credentials di code

## Troubleshooting

### Token tidak tersimpan

**Problem:** Token tidak tersimpan setelah login.

**Solution:**
- Pastikan `SecureStorage` sudah ter-setup dengan benar
- Check console untuk error messages
- Verify token format (harus valid JWT)

### Token expired tapi tidak auto-refresh

**Problem:** Token expired tapi tidak otomatis refresh.

**Solution:**
- Check `refreshIntervalId` di authStore
- Verify token refresh interval sudah di-setup
- Check network connection untuk refresh API call

### Login selalu gagal

**Problem:** Login selalu return error.

**Solution:**
- Check API URL di config
- Verify credentials benar
- Check network connection
- Untuk mock mode, pastikan `useMock: true` di config

### JWT decode error

**Problem:** `decodeJWT()` return null.

**Solution:**
- Verify token format (harus 3 parts: header.payload.signature)
- Check token tidak corrupted
- Pastikan token adalah valid JWT string

### State tidak update setelah login

**Problem:** Component tidak re-render setelah login.

**Solution:**
- Pastikan component menggunakan `useAuth()` hook
- Check Zustand store sudah ter-setup
- Verify state update di authStore

## Related Modules

- **`@core/native`** - SecureStorage untuk encrypted token storage
- **`@core/config`** - Config service untuk API URLs dan feature flags
- **`@core/account`** - User profile management (extends auth User)
- **`@core/navigation`** - Navigation dengan auth protection

## Security Notes

1. **Token Storage:**
   - Semua token dienkripsi dengan Tink AEAD (AES-256-GCM)
   - Stored di native SecureStorage (Android KeyStore)

2. **JWT Handling:**
   - JWT utilities hanya decode, tidak verify signature
   - Signature verification harus di backend/API level

3. **Mock Mode:**
   - Mock users hanya tersedia di development mode
   - Otomatis disabled di production

4. **Token Refresh:**
   - Automatic token refresh dengan interval
   - Background refresh untuk prevent expiration

5. **Nonce Security:**
   - Login dengan nonce untuk prevent replay attacks
   - Random nonce generated per request

