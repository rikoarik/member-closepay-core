/**
 * Responsive Dimensions Utility
 * Mendukung berbagai ukuran layar termasuk EDC (Electronic Data Capture) devices
 * 
 * EDC devices biasanya memiliki layar kecil (320x240, 480x320, 640x480)
 * Utility ini memastikan UI tetap readable dan usable di semua device
 * Mendukung orientation changes untuk tablet
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useState, useEffect } from 'react';

// Base dimensions untuk scaling (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Get initial dimensions
const getInitialDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Helper functions untuk calculate screen properties
const calculateScreenProperties = (width: number, height: number) => {
  const isEDC = width < 480 || height < 640;
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 768;
  const isLargeScreen = width >= 768;
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isPortrait = height > width;
  
  return {
    isEDC,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTablet,
    isLandscape,
    isPortrait,
  };
};

/**
 * Hook untuk mendapatkan dimensions yang reactive terhadap orientation changes
 * @returns Object dengan width, height, dan screen properties
 */
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState(getInitialDimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const screenProps = calculateScreenProperties(dimensions.width, dimensions.height);

  return {
    ...dimensions,
    ...screenProps,
  };
};

/**
 * Scale horizontal size berdasarkan lebar layar
 * Tablet: menggunakan base size (tidak diperbesar)
 * Device kecil: bisa diperkecil dengan scale
 * @param size - Ukuran base (dalam pixel)
 * @param width - Optional width untuk custom scaling (default: current screen width)
 * @returns Ukuran yang di-scale
 */
export const scale = (size: number, width?: number): number => {
  const screenWidth = width ?? Dimensions.get('window').width;
  const scaleFactor = screenWidth / BASE_WIDTH;
  const screenProps = calculateScreenProperties(screenWidth, Dimensions.get('window').height);
  
  // Untuk EDC, gunakan scaling yang lebih konservatif
  if (screenProps.isEDC) {
    // Minimum scale factor untuk EDC agar tetap readable
    const minScale = 0.7;
    const maxScale = 1.4;
    const scaled = size * Math.max(minScale, Math.min(scaleFactor, maxScale));
    return Math.round(PixelRatio.roundToNearestPixel(scaled));
  }
  
  // Untuk tablet, gunakan base size langsung (tidak diperbesar)
  if (screenProps.isTablet) {
    return size;
  }
  
  // Untuk device kecil, bisa diperkecil dengan scale
  const scaled = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Scale vertical size berdasarkan tinggi layar
 * Tablet: menggunakan base size (tidak diperbesar)
 * Device kecil: bisa diperkecil dengan scale
 * @param size - Ukuran base (dalam pixel)
 * @param height - Optional height untuk custom scaling (default: current screen height)
 * @returns Ukuran yang di-scale
 */
export const verticalScale = (size: number, height?: number): number => {
  const screenHeight = height ?? Dimensions.get('window').height;
  const scaleFactor = screenHeight / BASE_HEIGHT;
  const screenProps = calculateScreenProperties(Dimensions.get('window').width, screenHeight);
  
  // Untuk EDC, gunakan scaling yang lebih konservatif
  if (screenProps.isEDC) {
    const minScale = 0.7;
    const maxScale = 1.0;
    const scaled = size * Math.max(minScale, Math.min(scaleFactor, maxScale));
    return Math.round(PixelRatio.roundToNearestPixel(scaled));
  }
  
  // Untuk tablet, gunakan base size langsung (tidak diperbesar)
  if (screenProps.isTablet) {
    return size;
  }
  
  // Untuk device kecil, bisa diperkecil dengan scale
  const scaled = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Scale font size dengan moderasi
 * Tablet: menggunakan base size (tidak diperbesar)
 * Device kecil: bisa diperkecil dengan moderateScale
 * Font size tidak boleh terlalu kecil atau terlalu besar
 * @param size - Ukuran font base (dalam pixel)
 * @param factor - Faktor moderasi (0-1)
 * @param width - Optional width untuk custom scaling (default: current screen width)
 * @returns Ukuran font yang di-scale
 */
export const moderateScale = (size: number, factor: number = 0.5, width?: number): number => {
  const screenWidth = width ?? Dimensions.get('window').width;
  const scaleFactor = screenWidth / BASE_WIDTH;
  const screenProps = calculateScreenProperties(screenWidth, Dimensions.get('window').height);
  
  // Untuk EDC, pastikan font size minimum 12px untuk readability
  if (screenProps.isEDC) {
    const minFontSize = 12;
    const scaled = size + (scaleFactor - 1) * factor * size;
    return Math.max(minFontSize, Math.round(PixelRatio.roundToNearestPixel(scaled)));
  }
  
  // Untuk tablet, gunakan base size langsung (tidak diperbesar)
  if (screenProps.isTablet) {
    
    return size;
  }
  
  // Untuk device kecil, bisa diperkecil dengan moderateScale
  const scaled = size + (scaleFactor - 1) * factor * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Scale dengan faktor moderasi untuk spacing
 * Tablet: menggunakan base size (tidak diperbesar)
 * Device kecil: bisa diperkecil dengan moderateVerticalScale
 * @param size - Ukuran base
 * @param factor - Faktor moderasi (0-1)
 * @param height - Optional height untuk custom scaling (default: current screen height)
 * @returns Ukuran yang di-scale
 */
export const moderateVerticalScale = (size: number, factor: number = 0.5, height?: number): number => {
  const screenHeight = height ?? Dimensions.get('window').height;
  const scaleFactor = screenHeight / BASE_HEIGHT;
  const screenProps = calculateScreenProperties(Dimensions.get('window').width, screenHeight);
  
  if (screenProps.isEDC) {
    const minSize = 4;
    const scaled = size + (scaleFactor - 1) * factor * size;
    return Math.max(minSize, Math.round(PixelRatio.roundToNearestPixel(scaled)));
  }
  
  // Untuk tablet, gunakan base size langsung (tidak diperbesar)
  if (screenProps.isTablet) {
    return size;
  }
  
  // Untuk device kecil, bisa diperkecil dengan moderateVerticalScale
  const scaled = size + (scaleFactor - 1) * factor * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Mendapatkan ukuran layar saat ini (static, tidak reactive)
 * Untuk reactive dimensions, gunakan useDimensions() hook
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const screenProps = calculateScreenProperties(width, height);
  return {
    width,
    height,
    ...screenProps,
  };
};

/**
 * Helper untuk detect apakah device adalah tablet
 */
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return width >= 768;
};

/**
 * Helper untuk detect apakah device dalam landscape mode
 */
export const isLandscape = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

/**
 * Helper untuk detect apakah device dalam portrait mode
 */
export const isPortrait = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return height > width;
};

/**
 * Mendapatkan ukuran touch target minimum
 * Untuk aksesibilitas, touch target minimum 44x44 (iOS) atau 48x48 (Android)
 */
export const getMinTouchTarget = (): number => {
  const screenProps = getScreenDimensions();
  const platformOS = Platform?.OS || 'ios'; // Fallback untuk test environment
  if (screenProps.isEDC) {
    // Untuk EDC, gunakan touch target yang lebih besar untuk kemudahan penggunaan
    return platformOS === 'ios' ? 48 : 52;
  }
  return platformOS === 'ios' ? 44 : 48;
};

/**
 * Mendapatkan padding horizontal yang responsive
 */
export const getHorizontalPadding = (): number => {
  const screenProps = getScreenDimensions();
  if (screenProps.isEDC) {
    return scale(12); // Padding lebih kecil untuk EDC
  }
  if (screenProps.isSmallScreen) {
    return scale(16);
  }
  // Untuk tablet, padding lebih besar
  if (screenProps.isTablet) {
    return scale(32);
  }
  return scale(24);
};

/**
 * Mendapatkan padding vertical yang responsive
 */
export const getVerticalPadding = (): number => {
  const screenProps = getScreenDimensions();
  if (screenProps.isEDC) {
    return verticalScale(8);
  }
  if (screenProps.isSmallScreen) {
    return verticalScale(12);
  }
  // Untuk tablet, padding lebih besar
  if (screenProps.isTablet) {
    return verticalScale(20);
  }
  return verticalScale(16);
};

/**
 * Mendapatkan max width untuk menu di tablet
 * Bisa diatur untuk landscape atau portrait
 * @param landscapeMaxWidth - Max width untuk landscape (default: undefined = tidak dibatasi)
 * @param portraitMaxWidth - Max width untuk portrait (default: undefined = tidak dibatasi)
 * @returns Max width atau undefined jika tidak dibatasi
 */
export const getTabletMenuMaxWidth = (
  landscapeMaxWidth?: number,
  portraitMaxWidth?: number,
): number | undefined => {
  const screenProps = getScreenDimensions();
  
  if (!screenProps.isTablet) {
    return undefined; // Bukan tablet, tidak perlu max width
  }
  
  if (screenProps.isLandscape && landscapeMaxWidth !== undefined) {
    return landscapeMaxWidth;
  }
  
  if (screenProps.isPortrait && portraitMaxWidth !== undefined) {
    return portraitMaxWidth;
  }
  
  return undefined; // Tidak ada batasan
};

/**
 * Mendapatkan gap/spacing untuk layout di tablet
 * Bisa diatur untuk landscape atau portrait
 * @param defaultGap - Gap default untuk device non-tablet
 * @param landscapeGap - Gap untuk tablet landscape (optional)
 * @param portraitGap - Gap untuk tablet portrait (optional)
 * @returns Gap yang sesuai dengan device dan orientation
 */
export const getTabletGap = (
  defaultGap: number,
  landscapeGap?: number,
  portraitGap?: number,
): number => {
  const screenProps = getScreenDimensions();
  
  if (!screenProps.isTablet) {
    return defaultGap; // Bukan tablet, gunakan default
  }
  
  if (screenProps.isLandscape && landscapeGap !== undefined) {
    return landscapeGap;
  }
  
  if (screenProps.isPortrait && portraitGap !== undefined) {
    return portraitGap;
  }
  
  return defaultGap; // Tidak ada custom gap, gunakan default
};

/**
 * Mendapatkan ukuran font yang responsive berdasarkan kategori
 * Tablet: menggunakan moderateScale (bisa diatur manual nanti)
 * Device kecil: bisa diperkecil sedikit dengan moderateScale
 */
export const getResponsiveFontSize = (type: 'small' | 'medium' | 'large' | 'xlarge'): number => {
  const screenProps = getScreenDimensions();
  const fontSizes = {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
  };
  
  const baseSize = fontSizes[type];
  
  if (screenProps.isEDC) {
    // Untuk EDC, pastikan font size minimum
    return Math.max(12, moderateScale(baseSize, 0.3));
  }
  
  // Untuk tablet dan device kecil, gunakan moderateScale (bisa diatur manual nanti)
  return moderateScale(baseSize, 0.3);
};

/**
 * Mendapatkan ukuran icon yang responsive
 * Tablet: menggunakan base size (tidak diperbesar)
 * Device kecil: bisa diperkecil sedikit dengan scale
 */
export const getIconSize = (size: 'small' | 'medium' | 'large'): number => {
  const screenProps = getScreenDimensions();
  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32,
  };
  
  const baseSize = iconSizes[size];
  
  if (screenProps.isEDC) {
    // Untuk EDC, icon sedikit lebih besar untuk visibility
    return Math.max(baseSize, scale(baseSize * 0.9));
  }
  
  // Untuk tablet, gunakan base size langsung (tidak diperbesar)
  if (screenProps.isTablet) {
    return baseSize;
  }
  
  // Untuk device kecil, bisa diperkecil sedikit dengan scale
  return scale(baseSize);
};

