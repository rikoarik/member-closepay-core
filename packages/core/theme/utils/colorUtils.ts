/**
 * Color Utility Functions
 * Utilities untuk manipulate colors, terutama untuk generate variants dari accent color
 */

/**
 * Parse hex color ke RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
};

/**
 * RGB ke hex
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Validate color format (hex, rgb, rgba)
 */
export const isValidColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') return false;
  
  // Check hex format
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexPattern.test(color)) return true;
  
  // Check rgb/rgba format
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
  if (rgbPattern.test(color)) return true;
  
  return false;
};

/**
 * Normalize color ke hex format
 */
export const normalizeColor = (color: string): string | null => {
  if (!color) return null;
  
  // Already hex format
  if (color.startsWith('#')) {
    return color;
  }
  
  // RGB/RGBA format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return rgbToHex(r, g, b);
  }
  
  return null;
};

/**
 * Generate primary light variant dari accent color
 * Creates a light background color dengan opacity
 */
export const generatePrimaryLight = (
  accentColor: string,
  opacity: number = 0.12
): string => {
  const normalized = normalizeColor(accentColor);
  if (!normalized) return '#E6F2FF'; // Default fallback
  
  const rgb = hexToRgb(normalized);
  if (!rgb) return '#E6F2FF';
  
  // Generate rgba dengan opacity
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Generate primary dark variant dari accent color
 * Creates a darker version untuk hover/pressed states
 */
export const generatePrimaryDark = (
  accentColor: string,
  darkenPercent: number = 20
): string => {
  const normalized = normalizeColor(accentColor);
  if (!normalized) return '#0052A3'; // Default fallback
  
  const rgb = hexToRgb(normalized);
  if (!rgb) return '#0052A3';
  
  // Darken by reducing RGB values
  const factor = 1 - darkenPercent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return rgbToHex(r, g, b);
};

/**
 * Generate primary light variant untuk dark mode
 * Creates a darker background dengan accent color tint
 */
export const generatePrimaryLightDark = (
  accentColor: string,
  opacity: number = 0.2
): string => {
  const normalized = normalizeColor(accentColor);
  if (!normalized) return '#1E3A8A'; // Default fallback
  
  const rgb = hexToRgb(normalized);
  if (!rgb) return '#1E3A8A';
  
  // For dark mode, we want a darker tint
  // Reduce brightness and apply opacity
  const factor = 0.3; // Make it darker
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generate primary dark variant untuk dark mode
 * Creates a lighter version untuk dark mode (inverse logic)
 */
export const generatePrimaryDarkDark = (
  accentColor: string,
  lightenPercent: number = 15
): string => {
  const normalized = normalizeColor(accentColor);
  if (!normalized) return '#2563EB'; // Default fallback
  
  const rgb = hexToRgb(normalized);
  if (!rgb) return '#2563EB';
  
  // Lighten by increasing RGB values (but not too much for dark mode)
  const factor = 1 + lightenPercent / 100;
  const r = Math.round(Math.min(255, rgb.r * factor));
  const g = Math.round(Math.min(255, rgb.g * factor));
  const b = Math.round(Math.min(255, rgb.b * factor));
  
  return rgbToHex(r, g, b);
};

