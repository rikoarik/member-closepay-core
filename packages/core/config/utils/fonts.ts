/**
 * Font Configuration
 * Konfigurasi font family untuk aplikasi
 * Menggunakan Monasans sebagai font utama
 */

/**
 * Font Family Constants
 * Nama font family yang akan digunakan di StyleSheet
 * 
 * Catatan: Nama font family di React Native harus sesuai dengan nama font internal,
 * bukan nama file. Biasanya nama font internal adalah nama tanpa ekstensi dan tanpa weight.
 * Untuk Monasans, nama font internal adalah "MonaSans" (case-sensitive).
 */
/**
 * Font Family Constants
 * Nama font family yang akan digunakan di StyleSheet
 */
export const FontFamily = {
  /**
   * MonaSans - Font utama aplikasi
   * Variants:
   * - Regular
   * - Medium
   * - SemiBold
   * - Bold
   * 
   * File font yang digunakan:
   * - MonaSans-Regular.ttf
   * - MonaSans-Medium.ttf
   * - MonaSans-SemiBold.ttf
   * - MonaSans-Bold.ttf
   */
  monasans: {
    regular: 'MonaSans-Regular',
    medium: 'MonaSans-Medium',
    semiBold: 'MonaSans-SemiBold',
    bold: 'MonaSans-Bold',
  },
  
  /**
   * Fallback font jika Monasans tidak tersedia
   */
  fallback: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
} as const;

/**
 * Helper function untuk mendapatkan font family dengan fallback
 * @param variant - Variant font (regular, medium, semiBold, bold)
 * @param useFallback - Gunakan fallback jika font tidak tersedia (default: false)
 * @returns Font family name
 */
export const getFontFamily = (
  variant: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular',
  useFallback: boolean = false
): string => {
  if (useFallback) {
    return FontFamily.fallback[variant];
  }
  return FontFamily.monasans[variant];
};

/**
 * Font weight mapping untuk kompatibilitas
 */
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

/**
 * Type untuk font variant
 */
export type FontVariant = 'regular' | 'medium' | 'semiBold' | 'bold';

