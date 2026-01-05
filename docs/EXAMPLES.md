# Examples - Company Management System

Examples and reference for the Closepay Member Base App company management system.

## Company Initial Format Examples

### Valid Examples

```typescript
// Short codes
companyInitial: 'MB'           // Member Base
companyInitial: 'UB'           // Universitas Brawijaya
companyInitial: 'P2L'          // Platform 2 Layanan

// Full names (uppercase, no spaces)
companyInitial: 'TKIFTP'       // TKI FTP
companyInitial: 'MYCOMPANY'    // My Company
companyInitial: 'COMPANY123'   // Company 123

// With underscores
companyInitial: 'COMPANY_NAME' // Company Name
companyInitial: 'ABC_DEF'      // ABC DEF
```

### Invalid Examples

```typescript
// ❌ Lowercase
companyInitial: 'mb'           // Must be uppercase

// ❌ Starts with number
companyInitial: '123ABC'       // Must start with letter

// ❌ Contains spaces
companyInitial: 'MY COMPANY'   // Spaces not allowed

// ❌ Contains special characters (except underscore)
companyInitial: 'MY-COMPANY'   // Dashes not allowed
companyInitial: 'MY@COMPANY'   // Special chars not allowed
companyInitial: 'MY.COMPANY'   // Dots not allowed

// ❌ Too long
companyInitial: 'THISISAVERYLONGCOMPANYNAME'  // Max 20 characters
```

## Tenant Configuration Examples

### Minimal Configuration

```json
{
  "my-company": {
    "id": "my-company",
    "companyInitial": "MYCOMPANY",
    "name": "My Company",
    "role": "member",
    "theme": {
      "primary": "#0066CC",
      "primaryDark": "#0052A3",
      "primaryLight": "#E6F2FF"
    },
    "homeVariant": "member",
    "enabledFeatures": [],
    "homeTabs": []
  }
}
```

### Full Configuration

```json
{
  "tki-ftp": {
    "id": "tki-ftp",
    "companyInitial": "TKIFTP",
    "name": "TKI FTP",
    "role": "member",
    "theme": {
      "primary": "#0066CC",
      "primaryDark": "#0052A3",
      "primaryLight": "#E6F2FF"
    },
    "homeVariant": "member",
    "enabledFeatures": ["balance", "payment", "catalog"],
    "homeTabs": [
      {
        "id": "activity",
        "label": "Aktivitas",
        "visible": true,
        "order": 1
      },
      {
        "id": "home",
        "label": "Beranda",
        "visible": true,
        "order": 2
      },
      {
        "id": "news",
        "label": "Berita",
        "visible": true,
        "order": 3
      }
    ]
  }
}
```

## App Config Examples

### Generated Config (app.config.ts)

```typescript
export const appConfig: AppConfig = {
  companyInitial: 'TKIFTP',      // PRIMARY IDENTIFIER
  companyId: 'tki-ftp',          // Auto-generated from companyInitial
  companyName: 'TKI FTP',
  tenantId: 'tki-ftp',
  segmentId: 'balance-management',
  
  enabledFeatures: ['balance', 'payment'],
  enabledModules: ['balance', 'payment'],
  
  homeVariant: 'member',
  homeTabs: [
    { id: 'activity', label: 'Aktivitas', visible: true, order: 1 },
    { id: 'home', label: 'Beranda', visible: true, order: 2 },
  ],
  
  menuConfig: [
    { id: 'home', label: 'Home', icon: 'home', route: 'Home', visible: true, order: 1 },
    { id: 'balance', label: 'Balance', icon: 'wallet', route: 'TransactionHistory', visible: true, order: 2 },
  ],
  
  paymentMethods: ['balance', 'bank_transfer', 'virtual_account'],
  
  branding: {
    primaryColor: '#0066CC',
    logo: '',
    appName: 'TKI FTP',
  },
  
  services: {
    api: {
      baseUrl: Config.API_BASE_URL || 'https://api.solusiuntuknegeri.com',
      timeout: 30000,
    },
    auth: {
      useMock: __DEV__,
    },
    features: {
      pushNotification: true,
      analytics: true,
      crashReporting: false,
    },
  },
};
```

## CLI Usage Examples

### Create Tenant

```bash
# Basic
python app_manager.py create-tenant my-company "My Company"

# With options
python app_manager.py create-tenant my-company "My Company" \
  --role member \
  --features balance payment \
  --home-variant member
```

### Update Tenant

```bash
# Update name
python app_manager.py update-tenant my-company --name "New Name"

# Update features
python app_manager.py update-tenant my-company --features balance payment catalog

# Update theme color
python app_manager.py update-tenant my-company --primary-color "#FF0000"
```

### Generate App

```bash
# Generate in main repo
python app_manager.py generate my-company

# Generate standalone repo
python app_manager.py generate my-company \
  --output "D:\Projects\my-company-app"
```

### Sync Config

```bash
# Sync specific tenant
python app_manager.py sync my-company

# Sync all tenants
python app_manager.py sync
```

### List & Status

```bash
# List tenants
python app_manager.py list tenants

# List apps
python app_manager.py list apps

# Show status
python app_manager.py status

# Validate
python app_manager.py validate
```

## Workflow Examples

### Adding a New Company (Complete Workflow)

```bash
# 1. Create tenant
python app_manager.py create-tenant my-company "My Company" --role member

# 2. Edit tenants.json to customize (optional)
# - Add features
# - Customize theme
# - Configure home tabs

# 3. Validate
python app_manager.py validate

# 4. Generate app repository
python app_manager.py generate my-company

# 5. Sync config (if you made changes)
python app_manager.py sync my-company

# 6. Verify
python app_manager.py status
```

### Updating Existing Company

```bash
# 1. Update tenant config (edit tenants.json or use GUI)

# 2. Validate
python app_manager.py validate

# 3. Sync config to app
python app_manager.py sync my-company

# 4. Regenerate app (if structure changed)
python app_manager.py generate my-company --overwrite
```

### Creating Standalone Repository

```bash
# Generate standalone repo
python app_manager.py generate my-company \
  --output "D:\Projects\my-company-app" \
  --overwrite

# Result: Standalone repository at D:\Projects\my-company-app
# Structure:
#   my-company-app/
#   ├── apps/my-company/
#   ├── packages/core/
#   ├── packages/plugins/
#   ├── android/
#   ├── ios/
#   └── tools/app-manager/
```

## Migration Examples

### Converting from companyId to companyInitial

**Before:**
```typescript
export const appConfig: AppConfig = {
  companyId: 'my-company',
  companyName: 'My Company',
  // ...
};
```

**After:**
```typescript
export const appConfig: AppConfig = {
  companyInitial: 'MYCOMPANY',  // PRIMARY IDENTIFIER
  companyId: 'my-company',       // Optional, auto-generated
  companyName: 'My Company',
  // ...
};
```

### Auto-Generation Example

If you provide only `tenant_id`, `companyInitial` is auto-generated:

```json
{
  "my-company": {
    "id": "my-company",
    // companyInitial auto-generated as "MYCOMPANY"
    "name": "My Company",
    // ...
  }
}
```

## Validation Examples

### Validation Error Messages

```
❌ Company initial is required. Expected: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L')

❌ Company initial contains invalid characters. Only uppercase letters, numbers, and underscores are allowed. Expected format: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L'). Got: 'my-company'

❌ Company initial must start with a letter. Expected format: Uppercase alphanumeric string starting with a letter (e.g., 'TKIFTP', 'MB', 'P2L'). Got: '123ABC'

❌ Company initial is too long (25 characters). Maximum length is 20 characters. Expected format: Uppercase alphanumeric string (e.g., 'TKIFTP', 'MB', 'P2L'). Got: 'THISISAVERYLONGCOMPANYNAME'
```

## Best Practices

1. **Use Short, Memorable Codes**: Prefer `MB` over `MEMBERBASEAPP`
2. **Be Consistent**: Use same format across all companies (e.g., all uppercase)
3. **Avoid Special Characters**: Only use letters, numbers, and underscores
4. **Start with Letter**: Always start with a letter (not a number)
5. **Auto-Generate When Possible**: Let the system auto-generate from `tenant_id` if possible
6. **Validate Early**: Run `validate` command before generating apps
7. **Sync After Changes**: Always sync config after updating tenant configuration

