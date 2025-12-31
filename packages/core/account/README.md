# Account Module

## Overview

Core account module yang mengelola user profiles, company information, dan outlet management. Module ini menyediakan services untuk CRUD operations pada user, company, dan outlet data dengan validation dan error handling.

**Key Features:**
- User profile management (CRUD)
- Company information management
- Outlet management (multi-outlet support)
- Input validation dengan error handling
- Type-safe models dan services

## Architecture

### Folder Structure

```
packages/core/account/
├── components/          # UI components
│   ├── ProfileScreen.tsx
│   └── EditProfileScreen.tsx
├── models/             # Data models
│   ├── User.ts
│   ├── Company.ts
│   └── Outlet.ts
├── services/           # Business logic
│   ├── userService.ts
│   ├── companyService.ts
│   └── outletService.ts
└── index.ts           # Public exports
```

### Data Models

```
User
├── id: string
├── companyId: string
├── outletId?: string
├── username: string
├── email?: string
├── name: string
├── role?: string
├── permissions?: string[]
└── isActive: boolean

Company
├── id: string
├── name: string
├── segmentId?: string
└── config?: Record<string, any>

Outlet
├── id: string
├── companyId: string
├── name: string
├── address?: string
├── phone?: string
├── email?: string
└── isActive: boolean
```

## Installation & Setup

### Dependencies

Module ini sudah terintegrasi dengan:
- `@core/config` - Validation utilities
- `@core/auth` - User model (extends auth User)

### Initialization

Account module tidak memerlukan initialization khusus. Import dan gunakan langsung:

```typescript
import { userService, companyService, outletService } from '@core/account';
```

## Usage Examples

### User Management

```typescript
import { userService, User } from '@core/account';

// Get all users for a company
const users = await userService.getUsers('company-id');

// Get user by ID
const user = await userService.getUser('user-id');

// Create new user
const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  companyId: 'company-id',
  username: 'newuser',
  email: 'user@example.com',
  name: 'New User',
  role: 'member',
  isActive: true,
};

const createdUser = await userService.createUser(newUser);

// Update user
const updatedUser = await userService.updateUser('user-id', {
  name: 'Updated Name',
  email: 'updated@example.com',
});

// Delete user
await userService.deleteUser('user-id');
```

### Company Management

```typescript
import { companyService, Company } from '@core/account';

// Get company by ID
const company = await companyService.getCompany('company-id');

// Initialize company
const initializedCompany = await companyService.initializeCompany('company-id');

// Update company config
const updatedCompany = await companyService.updateCompanyConfig('company-id', {
  featureX: true,
  settingY: 'value',
});
```

### Outlet Management

```typescript
import { outletService, Outlet } from '@core/account';

// Get all outlets for a company
const outlets = await outletService.getOutlets('company-id');

// Get outlet by ID
const outlet = await outletService.getOutlet('outlet-id');

// Create new outlet
const newOutlet: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'> = {
  companyId: 'company-id',
  name: 'Main Outlet',
  address: '123 Main St',
  phone: '+62123456789',
  email: 'outlet@example.com',
  isActive: true,
};

const createdOutlet = await outletService.createOutlet(newOutlet);

// Update outlet
const updatedOutlet = await outletService.updateOutlet('outlet-id', {
  name: 'Updated Outlet Name',
  address: '456 New St',
});

// Delete outlet
await outletService.deleteOutlet('outlet-id');
```

### Profile Screen Component

```typescript
import { ProfileScreen, EditProfileScreen } from '@core/account';

// Use pre-built profile screen
<ProfileScreen />

// Use pre-built edit profile screen
<EditProfileScreen />
```

## API Reference

### Services

#### `userService`

User management service.

**Methods:**
- `getUsers(companyId: string): Promise<User[]>`
- `getUser(userId: string): Promise<User>`
- `createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>`
- `updateUser(userId: string, user: Partial<User>): Promise<User>`
- `deleteUser(userId: string): Promise<void>`

**Validation:**
- `userId`, `companyId`: Must be valid ID (non-empty string)
- `username`: 1-100 characters
- `name`: 1-255 characters
- `email`: Valid email format (if provided)

#### `companyService`

Company management service.

**Methods:**
- `getCompany(companyId: string): Promise<Company>`
- `initializeCompany(companyId: string): Promise<Company>`
- `updateCompanyConfig(companyId: string, config: Record<string, unknown>): Promise<Company>`

**Validation:**
- `companyId`: Must be valid ID (non-empty string)
- `config`: Must be an object

#### `outletService`

Outlet management service.

**Methods:**
- `getOutlets(companyId: string): Promise<Outlet[]>`
- `getOutlet(outletId: string): Promise<Outlet>`
- `createOutlet(outlet: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outlet>`
- `updateOutlet(outletId: string, outlet: Partial<Outlet>): Promise<Outlet>`
- `deleteOutlet(outletId: string): Promise<void>`

**Validation:**
- `outletId`, `companyId`: Must be valid ID (non-empty string)
- `name`: 1-255 characters

### Components

#### `ProfileScreen`

Pre-built profile screen component untuk display user profile.

**Props:** None (uses auth context)

**Example:**
```typescript
import { ProfileScreen } from '@core/account';

<ProfileScreen />
```

#### `EditProfileScreen`

Pre-built edit profile screen component untuk edit user profile.

**Props:** None (uses auth context)

**Example:**
```typescript
import { EditProfileScreen } from '@core/account';

<EditProfileScreen />
```

### Types

#### `User`

```typescript
interface User {
  id: string;
  companyId: string;
  outletId?: string;
  username: string;
  email?: string;
  name: string;
  role?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### `Company`

```typescript
interface Company {
  id: string;
  name: string;
  segmentId?: string;
  config?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### `Outlet`

```typescript
interface Outlet {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Configuration

### Service Implementation Status

**Note:** Services saat ini masih dalam tahap development. Methods akan throw error dengan message "not implemented yet" sampai API integration selesai.

**Current Status:**
- ✅ Models: Fully defined
- ✅ Services: Interfaces defined, validation implemented
- ⚠️ API Integration: Pending implementation
- ✅ Components: ProfileScreen dan EditProfileScreen available

### Future Implementation

Services akan di-implement dengan:
- API calls menggunakan `axiosInstance` dari `@core/config`
- Error handling dengan `handleApiError()`
- Response mapping ke models
- Caching (jika diperlukan)

## Best Practices

### ✅ DO

1. **Validate input sebelum call service**
   ```typescript
   if (!companyId) {
     throw new Error('Company ID is required');
   }
   const users = await userService.getUsers(companyId);
   ```

2. **Handle errors dengan user-friendly messages**
   ```typescript
   try {
     const user = await userService.getUser(userId);
   } catch (error) {
     Alert.alert('Error', 'Failed to load user');
   }
   ```

3. **Use TypeScript types untuk type safety**
   ```typescript
   const user: User = await userService.getUser(userId);
   ```

4. **Check service implementation status**
   ```typescript
   // Services akan throw error jika belum implemented
   try {
     await userService.getUser(userId);
   } catch (error) {
     if (error.message.includes('not implemented yet')) {
       // Handle not implemented case
     }
   }
   ```

### ❌ DON'T

1. **Jangan skip validation**
   ```typescript
   // ❌ SALAH - validation akan throw error
   await userService.getUser(''); // Empty ID
   
   // ✅ BENAR
   if (!userId) {
     return; // Early return
   }
   await userService.getUser(userId);
   ```

2. **Jangan assume service sudah implemented**
   ```typescript
   // ❌ SALAH
   const user = await userService.getUser(userId); // Might throw
   
   // ✅ BENAR - handle error
   try {
     const user = await userService.getUser(userId);
   } catch (error) {
     // Handle error
   }
   ```

3. **Jangan hardcode IDs**
   ```typescript
   // ❌ SALAH
   const users = await userService.getUsers('hardcoded-id');
   
   // ✅ BENAR - ambil dari config/auth
   const { company } = useAuth();
   const users = await userService.getUsers(company.id);
   ```

## Troubleshooting

### Service throws "not implemented yet"

**Problem:** Service method throws error "not implemented yet".

**Solution:**
- Ini expected behavior sampai API integration selesai
- Gunakan try-catch untuk handle error
- Check implementation status di service file

### Validation error

**Problem:** Service throws validation error.

**Solution:**
- Check input format (ID harus non-empty string)
- Verify email format (jika provided)
- Check string length constraints (username, name)

### Component tidak render

**Problem:** ProfileScreen atau EditProfileScreen tidak render.

**Solution:**
- Pastikan user sudah login (component menggunakan auth context)
- Check navigation setup
- Verify component import path

## Related Modules

- **`@core/auth`** - User authentication (User model extends auth User)
- **`@core/config`** - Validation utilities dan config service
- **`@core/theme`** - Theme system untuk component styling

## Implementation Notes

### Service Pattern

Services mengikuti pattern:
1. Input validation menggunakan `validateId()`, `validateString()`, dll
2. Throw error jika validation fails
3. API call (akan di-implement)
4. Response mapping ke model
5. Return model atau throw error

### Error Handling

Services menggunakan validation utilities dari `@core/config`:
- `validateId()`: Validates ID format
- `validateString()`: Validates string length
- `validateEmail()`: Validates email format
- `throwIfInvalid()`: Throws error jika validation fails

### Future Enhancements

1. **API Integration:**
   - Implement API calls menggunakan `axiosInstance`
   - Add response caching
   - Add retry logic

2. **Additional Features:**
   - User search/filter
   - Pagination support
   - Bulk operations
   - Audit logging

3. **Performance:**
   - Response caching
   - Optimistic updates
   - Background sync

