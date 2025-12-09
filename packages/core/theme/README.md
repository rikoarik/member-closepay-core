# Theme Color Service - Realtime Color Updates

## Overview

Theme Color Service memungkinkan admin untuk mengubah warna aplikasi secara realtime, dan semua screen (Home, Notification, dll) akan otomatis update tanpa perlu restart app.

## Cara Kerja

### 1. **Development Mode** (File-based)
- Warna di-load dari `apps/member-base/config/theme.color.ts`
- Polling setiap 500ms untuk watch file changes
- Update langsung tanpa backend

### 2. **Production Mode** (Backend-based)
- Warna di-fetch dari backend API
- Polling setiap 5 menit (dengan smart caching & cooldown)
- Support force refresh untuk update realtime

## Flow Update Warna

```
Admin Update Warna (Backend/Admin Panel)
    ↓
Backend API Update Primary Color
    ↓
App Polling / Force Refresh
    ↓
themeColorService.fetchFromBackend()
    ↓
themeColorService.notifyListeners()
    ↓
ThemeContext.setAccentColor()
    ↓
Theme Recalculate (getTheme dengan accentColor baru)
    ↓
All Screens Re-render dengan warna baru
```

## Cara Admin Update Warna

### **Via Backend API**

Admin bisa update warna via backend API:

```typescript
// Backend endpoint: PUT /theme/primary-color/{companyId}
PUT /theme/primary-color/member-base
{
  "primaryColor": "#FF0000" // Merah
}
```

### **Force Refresh di App** (Untuk Update Realtime)

Setelah admin update warna di backend, app bisa force refresh:

```typescript
import { themeColorService } from '@core/theme';

// Force refresh (bypass cache & cooldown)
await themeColorService.forceRefresh();
```

### **Via Console** (Development)

```javascript
// Development mode
global.themeColorService.setPrimaryColor('#FF0000'); // Merah
global.themeColorService.setPrimaryColor('#00FF00'); // Hijau
global.themeColorService.setPrimaryColor('#0000FF'); // Biru

// Production mode (force refresh)
global.themeColorService.forceRefresh();
```

## Auto-Update di Semua Screen

Semua screen yang menggunakan `useTheme()` hook akan **otomatis re-render** saat warna berubah:

```typescript
// Contoh: HomeScreen.tsx
import { useTheme } from '@core/theme';

export const HomeScreen = () => {
  const { colors } = useTheme(); // ✅ Auto-update saat warna berubah
  
  return (
    <View style={{ backgroundColor: colors.primary }}>
      {/* Warna akan otomatis update */}
    </View>
  );
};
```

## Konfigurasi Polling Interval

Untuk production, polling interval bisa diatur:

```typescript
import { themeColorService } from '@core/theme';

// Update polling interval (misal: 1 menit untuk lebih cepat)
themeColorService.updateOptions({
  pollingInterval: 60 * 1000, // 1 menit
  cooldownPeriod: 10 * 1000,  // 10 detik cooldown
});
```

## Backend API Endpoints

### **Get Primary Color**
```
GET /theme/primary-color/{companyId}
Response: { "primaryColor": "#03AA81" }
```

### **Update Primary Color** (Admin)
```
PUT /theme/primary-color/{companyId}
Body: { "primaryColor": "#FF0000" }
Response: { "primaryColor": "#FF0000" }
```

### **Fallback: Config Endpoint**
```
GET /config/app/{companyId}
Response: { 
  "theme": { 
    "primaryColor": "#03AA81" 
  } 
}
```

## Keamanan Backend

✅ **Smart Caching**: Cache warna selama 5 menit  
✅ **Cooldown Period**: 30 detik untuk prevent spam request  
✅ **Polling Interval**: 5 menit (bisa diatur)  
✅ **Concurrent Prevention**: Hanya 1 request aktif  
✅ **Error Handling**: Pakai cached color jika backend error  

## Contoh Implementasi

### **1. Screen dengan Auto-Update**

```typescript
// HomeScreen.tsx
import { useTheme } from '@core/theme';

export const HomeScreen = () => {
  const { colors } = useTheme(); // ✅ Auto-update
  
  return (
    <View>
      <Button style={{ backgroundColor: colors.primary }}>
        {/* Warna akan otomatis update saat admin ganti */}
      </Button>
    </View>
  );
};
```

### **2. Force Refresh Setelah Admin Update**

```typescript
// Di admin panel atau setelah update warna
import { themeColorService } from '@core/theme';

// Force refresh untuk update realtime
await themeColorService.forceRefresh();
```

### **3. Listen to Color Changes**

```typescript
import { themeColorService } from '@core/theme';

const unsubscribe = themeColorService.subscribe((color) => {
  console.log('Warna berubah:', color);
  // Lakukan sesuatu saat warna berubah
});

// Cleanup
unsubscribe();
```

## Testing

### **Development**
1. Edit `apps/member-base/config/theme.color.ts`
2. Ubah `themeColor` ke warna baru
3. Simpan file
4. Dalam 500ms, semua screen akan update

### **Production**
1. Admin update warna via backend API
2. App akan auto-update dalam 5 menit (polling)
3. Atau force refresh untuk update realtime

## Troubleshooting

### **Warna tidak update?**
- Pastikan screen menggunakan `useTheme()` hook
- Check console untuk error
- Pastikan `ThemeProvider` sudah wrap app

### **Polling terlalu lambat?**
- Kurangi `pollingInterval` di options
- Atau gunakan `forceRefresh()` untuk update realtime

### **Backend error?**
- App akan pakai cached color
- Check network connection
- Verify backend endpoint

