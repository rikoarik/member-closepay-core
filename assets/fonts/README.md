# Font Assets

Folder ini digunakan untuk menyimpan file font custom aplikasi.

## Font Monasans

Aplikasi menggunakan **Monasans** sebagai font utama. File font yang diperlukan:

### File Font yang Diperlukan

1. **MonaSans-Regular.ttf** - Font regular (weight: 400) ✅
2. **MonaSans-Medium.ttf** - Font medium (weight: 500) ✅
3. **MonaSans-SemiBold.ttf** - Font semi bold (weight: 600) ✅
4. **MonaSans-Bold.ttf** - Font bold (weight: 700) ✅

**Status**: Semua file font sudah tersedia di folder ini! 🎉

### Cara Menambahkan Font

1. **Copy file font** ke folder ini (`assets/fonts/`)
   - Pastikan nama file sesuai dengan yang tercantum di atas
   - Format file harus `.ttf` atau `.otf`

2. **Link font ke project** (otomatis dengan autolinking)
   ```bash
   # Untuk iOS
   cd ios && pod install && cd ..
   
   # Untuk Android, font akan otomatis ter-link
   ```

3. **Restart Metro bundler**
   ```bash
   npm start -- --reset-cache
   ```

4. **Rebuild aplikasi**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

### Verifikasi Font

Setelah menambahkan font, verifikasi dengan:
- Cek di `react-native.config.js` bahwa path `./assets/fonts/` sudah terdaftar
- Pastikan file font ada di folder ini
- Rebuild aplikasi dan test di device/emulator

### Penggunaan Font

```typescript
import { FontFamily } from '../../packages/core/config';

const styles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.monasans.regular,
  },
  title: {
    fontFamily: FontFamily.monasans.bold,
  },
});
```

### Catatan

- Nama file font HARUS sesuai dengan nama yang digunakan di kode
- Font akan otomatis ter-link dengan autolinking React Native
- Jika font tidak muncul, pastikan:
  1. File font sudah di-copy ke folder ini
  2. Sudah menjalankan `pod install` (iOS)
  3. Sudah rebuild aplikasi
  4. Nama file font sesuai dengan konfigurasi

