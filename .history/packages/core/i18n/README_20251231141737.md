# i18n Module

## Overview

Core internationalization module yang mengelola translations dan language preferences. Module ini menyediakan support untuk multiple languages (Indonesian & English) dengan dot notation keys, parameter substitution, dan persistent language preference storage.

**Key Features:**
- Multi-language support (Indonesian & English)
- Dot notation translation keys
- Parameter substitution dalam translations
- Persistent language preference storage
- Reactive language changes
- Type-safe translation keys

## Architecture

### Folder Structure

```
packages/core/i18n/
├── components/          # UI components
│   └── LanguageSelectionScreen.tsx
├── context/            # React context
│   └── I18nContext.tsx
├── hooks/              # React hooks
│   └── useTranslation.ts
├── locales/            # Translation files
│   ├── id.ts           # Indonesian translations
│   └── en.ts           # English translations
├── services/           # Business logic
│   └── i18nService.ts
├── types/              # TypeScript types
│   └── index.ts
└── index.ts           # Public exports
```

### Translation Structure

Translations menggunakan nested object structure dengan dot notation keys:

```typescript
// locales/id.ts
export default {
  home: {
    title: 'Beranda',
    welcome: 'Selamat Datang, {name}',
  },
  auth: {
    login: 'Masuk',
    logout: 'Keluar',
  },
};
```

## Installation & Setup

### Dependencies

Module ini sudah terintegrasi dengan:
- `@core/native` - SecureStorage untuk language preference storage
- `react` - React context dan hooks

### Initialization

i18n module memerlukan `I18nProvider` di app root:

```typescript
import { I18nProvider } from '@core/i18n';

function App() {
  return (
    <I18nProvider>
      {/* Your app components */}
    </I18nProvider>
  );
}
```

## Usage Examples

### Basic Translation

```typescript
import { useTranslation } from '@core/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('home.title')}</Text>
      <Text>{t('auth.login')}</Text>
    </View>
  );
}
```

### Translation with Parameters

```typescript
import { useTranslation } from '@core/i18n';

function WelcomeComponent() {
  const { t } = useTranslation();
  const userName = 'John';

  return (
    <Text>{t('home.welcome', { name: userName })}</Text>
    // Output: "Selamat Datang, John" (ID) or "Welcome, John" (EN)
  );
}
```

### Change Language

```typescript
import { useTranslation } from '@core/i18n';

function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const switchLanguage = async () => {
    const newLanguage = language === 'id' ? 'en' : 'id';
    await setLanguage(newLanguage);
    // All components akan otomatis update
  };

  return (
    <Button 
      title={language === 'id' ? 'English' : 'Bahasa Indonesia'}
      onPress={switchLanguage}
    />
  );
}
```

### Check Current Language

```typescript
import { useTranslation } from '@core/i18n';

function MyComponent() {
  const { language, isIndonesian, isEnglish } = useTranslation();

  if (isIndonesian) {
    // Show Indonesian-specific content
  }

  return <Text>Current language: {language}</Text>;
}
```

### Language Selection Screen

```typescript
import { LanguageSelectionScreen } from '@core/i18n';

// Use pre-built language selection screen
<LanguageSelectionScreen />
```

### Direct Translation (Outside Component)

```typescript
import { getTranslation } from '@core/i18n';

// Get translation directly (requires language parameter)
const text = getTranslation('home.title', 'id');
```

## API Reference

### Hooks

#### `useTranslation()`

Main hook untuk access translations dan language management.

**Returns:**
```typescript
{
  t: (key: TranslationKey, params?: TranslationParams) => string;
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isIndonesian: boolean;
  isEnglish: boolean;
}
```

**Example:**
```typescript
const { t, language, setLanguage } = useTranslation();
```

### Services

#### `getTranslation(key: TranslationKey, language: Language, params?: TranslationParams): string`

Get translation by key dan language.

**Parameters:**
- `key`: Translation key (dot notation, e.g., 'home.title')
- `language`: Language code ('id' | 'en')
- `params`: Optional parameters untuk substitution

**Returns:** Translated string atau key jika tidak ditemukan

**Example:**
```typescript
const text = getTranslation('home.welcome', 'id', { name: 'John' });
```

#### `loadLanguagePreference(): Promise<Language>`

Load language preference dari storage.

**Returns:** Saved language atau 'id' sebagai default

#### `saveLanguagePreference(language: Language): Promise<void>`

Save language preference ke storage.

**Parameters:**
- `language`: Language code ('id' | 'en')

#### `getAvailableLanguages(): Language[]`

Get all available languages.

**Returns:** Array of language codes

#### `getLanguageName(language: Language): string`

Get language display name.

**Returns:** Language name (e.g., 'Bahasa Indonesia', 'English')

### Components

#### `LanguageSelectionScreen`

Pre-built language selection screen component.

**Props:** None

**Example:**
```typescript
import { LanguageSelectionScreen } from '@core/i18n';

<LanguageSelectionScreen />
```

### Context

#### `I18nProvider`

Context provider untuk i18n management.

**Props:**
```typescript
{
  children: React.ReactNode;
}
```

**Usage:**
```typescript
import { I18nProvider } from '@core/i18n';

<I18nProvider>
  <App />
</I18nProvider>
```

#### `useI18nContext()`

Hook untuk access i18n context directly (internal use, prefer `useTranslation()`).

### Types

#### `Language`

```typescript
type Language = 'id' | 'en';
```

#### `TranslationKey`

```typescript
type TranslationKey = string; // Dot notation: 'namespace.key'
```

#### `TranslationParams`

```typescript
interface TranslationParams {
  [key: string]: string | number;
}
```

## Configuration

### Adding Translations

#### Indonesian (id.ts)

```typescript
// packages/core/i18n/locales/id.ts
export default {
  home: {
    title: 'Beranda',
    welcome: 'Selamat Datang, {name}',
  },
  auth: {
    login: 'Masuk',
    logout: 'Keluar',
  },
};
```

#### English (en.ts)

```typescript
// packages/core/i18n/locales/en.ts
export default {
  home: {
    title: 'Home',
    welcome: 'Welcome, {name}',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
  },
};
```

### Translation Key Format

Translation keys menggunakan dot notation untuk nested structure:

```typescript
// Translation structure
{
  namespace: {
    key: 'value',
    nested: {
      key: 'value',
    },
  },
}

// Usage
t('namespace.key')           // 'value'
t('namespace.nested.key')   // 'value'
```

### Parameter Substitution

Parameters di-substitute menggunakan `{key}` format:

```typescript
// Translation
{
  welcome: 'Welcome, {name}! You have {count} messages.',
}

// Usage
t('welcome', { name: 'John', count: 5 })
// Output: "Welcome, John! You have 5 messages."
```

## Best Practices

### ✅ DO

1. **Gunakan `useTranslation()` hook di components**
   ```typescript
   const { t } = useTranslation();
   ```

2. **Gunakan dot notation untuk nested keys**
   ```typescript
   t('home.welcome') // ✅ BENAR
   t('home_welcome') // ❌ SALAH
   ```

3. **Gunakan parameter untuk dynamic content**
   ```typescript
   t('welcome', { name: userName }) // ✅ BENAR
   `Welcome, ${userName}` // ❌ SALAH - tidak translatable
   ```

4. **Keep translation keys consistent**
   ```typescript
   // ✅ BENAR - consistent naming
   t('auth.login')
   t('auth.logout')
   
   // ❌ SALAH - inconsistent
   t('auth.login')
   t('auth.signOut')
   ```

5. **Provide fallback untuk missing translations**
   ```typescript
   // Service otomatis return key jika translation tidak ditemukan
   t('missing.key') // Returns 'missing.key' as fallback
   ```

### ❌ DON'T

1. **Jangan hardcode strings**
   ```typescript
   // ❌ SALAH
   <Text>Welcome</Text>
   
   // ✅ BENAR
   <Text>{t('home.welcome')}</Text>
   ```

2. **Jangan mix languages**
   ```typescript
   // ❌ SALAH
   const text = language === 'id' ? 'Selamat Datang' : 'Welcome';
   
   // ✅ BENAR
   const text = t('home.welcome');
   ```

3. **Jangan skip I18nProvider**
   ```typescript
   // ❌ SALAH - hook akan error
   function App() {
     return <MyComponent />; // useTranslation() akan error
   }
   
   // ✅ BENAR
   function App() {
     return (
       <I18nProvider>
         <MyComponent />
       </I18nProvider>
     );
   }
   ```

4. **Jangan use direct string interpolation**
   ```typescript
   // ❌ SALAH
   const text = `Welcome, ${name}`;
   
   // ✅ BENAR
   const text = t('welcome', { name });
   ```

## Troubleshooting

### Translation key not found

**Problem:** Translation return key instead of translated text.

**Solution:**
- Check translation key exists di locale files
- Verify dot notation format (e.g., 'home.title')
- Check language preference (might be wrong language)
- Verify translation structure matches key path

### Language not persisting

**Problem:** Language preference tidak tersimpan.

**Solution:**
- Check SecureStorage setup
- Verify `saveLanguagePreference()` tidak throw error
- Check storage permissions

### Component tidak update setelah change language

**Problem:** Component tidak re-render setelah change language.

**Solution:**
- Pastikan menggunakan `useTranslation()` hook
- Verify `I18nProvider` wrap component
- Check language state update di context

### Parameter tidak di-substitute

**Problem:** Parameters tidak di-replace dalam translation.

**Solution:**
- Check parameter format di translation (`{key}`)
- Verify parameter key matches translation placeholder
- Check parameter value type (string atau number)

## Related Modules

- **`@core/native`** - SecureStorage untuk language preference storage
- **`@core/theme`** - Theme system (tidak related, tapi sering digunakan bersama)

## Translation Management

### Adding New Languages

Untuk menambahkan language baru:

1. **Create locale file:**
   ```typescript
   // packages/core/i18n/locales/fr.ts
   export default {
     home: {
       title: 'Accueil',
     },
   };
   ```

2. **Update Language type:**
   ```typescript
   // packages/core/i18n/types/index.ts
   export type Language = 'id' | 'en' | 'fr';
   ```

3. **Update service:**
   ```typescript
   // packages/core/i18n/services/i18nService.ts
   import fr from '../locales/fr';
   
   const translations: Record<Language, Record<string, any>> = {
     id,
     en,
     fr, // Add new language
   };
   ```

4. **Update language name:**
   ```typescript
   export const getLanguageName = (language: Language): string => {
     const names: Record<Language, string> = {
       id: 'Bahasa Indonesia',
       en: 'English',
       fr: 'Français', // Add new language name
     };
     return names[language];
   };
   ```

### Translation Key Organization

Organize translation keys by feature/module:

```typescript
{
  // Home module
  home: {
    title: 'Home',
    welcome: 'Welcome',
  },
  
  // Auth module
  auth: {
    login: 'Login',
    logout: 'Logout',
  },
  
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
  },
}
```

