/**
 * Token Service
 * Mengelola storage dan retrieval token menggunakan EncryptedStorage untuk security
 * Token dan refresh token disimpan di EncryptedStorage (secure)
 * Token expiry disimpan di AsyncStorage (non-sensitive)
 */
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenService } from '../types';
import { getJWTExpiry, isJWTExpired as isJWTExpiredUtil } from '../utils/jwtUtils';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const TOKEN_EXPIRY_KEY = '@auth_token_expiry';

// Migration keys untuk backward compatibility
const OLD_TOKEN_KEY = '@auth_token';
const OLD_REFRESH_TOKEN_KEY = '@auth_refresh_token';

export const tokenService: TokenService = {
  /**
   * Get access token from storage
   * Tries EncryptedStorage first, falls back to AsyncStorage for migration
   */
  async getToken(): Promise<string | null> {
    try {
      // Try EncryptedStorage first
      const token = await EncryptedStorage.getItem(TOKEN_KEY);
      if (token) {
        return token;
      }

      // Migration: Try AsyncStorage (backward compatibility)
      const oldToken = await AsyncStorage.getItem(OLD_TOKEN_KEY);
      if (oldToken) {
        // Migrate to EncryptedStorage
        await EncryptedStorage.setItem(TOKEN_KEY, oldToken);
        await AsyncStorage.removeItem(OLD_TOKEN_KEY);
        console.log('[TokenService] Migrated token from AsyncStorage to EncryptedStorage');
        return oldToken;
      }

      return null;
    } catch (error) {
      console.error('[TokenService] Error getting token:', error);
      return null;
    }
  },

  /**
   * Get refresh token from storage
   * Tries EncryptedStorage first, falls back to AsyncStorage for migration
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      // Try EncryptedStorage first
      const refreshToken = await EncryptedStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        return refreshToken;
      }

      // Migration: Try AsyncStorage (backward compatibility)
      const oldRefreshToken = await AsyncStorage.getItem(OLD_REFRESH_TOKEN_KEY);
      if (oldRefreshToken) {
        // Migrate to EncryptedStorage
        await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, oldRefreshToken);
        await AsyncStorage.removeItem(OLD_REFRESH_TOKEN_KEY);
        console.log('[TokenService] Migrated refresh token from AsyncStorage to EncryptedStorage');
        return oldRefreshToken;
      }

      return null;
    } catch (error) {
      console.error('[TokenService] Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save access token to storage (EncryptedStorage)
   * Auto-extract expiry from JWT if available
   */
  async setToken(token: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(TOKEN_KEY, token);
      console.log('[TokenService] Token saved to EncryptedStorage');
      
      // Extract expiry from JWT if available
      const jwtExpiry = getJWTExpiry(token);
      if (jwtExpiry) {
        // JWT expiry is in milliseconds, store as timestamp
        await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, jwtExpiry.toString());
        console.log('[TokenService] Token expiry extracted from JWT:', new Date(jwtExpiry).toISOString());
      }
    } catch (error) {
      console.error('[TokenService] Error setting token:', error);
      throw error;
    }
  },

  /**
   * Save refresh token to storage (EncryptedStorage)
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('[TokenService] Refresh token saved to EncryptedStorage');
    } catch (error) {
      console.error('[TokenService] Error setting refresh token:', error);
      throw error;
    }
  },

  /**
   * Clear all tokens from storage
   */
  async clearTokens(): Promise<void> {
    try {
      // Clear from EncryptedStorage
      await EncryptedStorage.removeItem(TOKEN_KEY).catch(() => {});
      await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {});
      
      // Clear from AsyncStorage (for migration cleanup and expiry)
      await AsyncStorage.multiRemove([TOKEN_EXPIRY_KEY, OLD_TOKEN_KEY, OLD_REFRESH_TOKEN_KEY]).catch(() => {});
      
      console.log('[TokenService] All tokens cleared');
    } catch (error) {
      console.error('[TokenService] Error clearing tokens:', error);
      throw error;
    }
  },

  /**
   * Get token expiry timestamp (from AsyncStorage - non-sensitive)
   */
  async getTokenExpiry(): Promise<number | null> {
    try {
      const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('[TokenService] Error getting token expiry:', error);
      return null;
    }
  },

  /**
   * Set token expiry timestamp (to AsyncStorage - non-sensitive)
   * @param expiresIn - Expires in seconds from now
   */
  async setTokenExpiry(expiresIn: number): Promise<void> {
    try {
      const expiryTimestamp = Date.now() + expiresIn * 1000;
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
      console.log('[TokenService] Token expiry set:', new Date(expiryTimestamp).toISOString());
    } catch (error) {
      console.error('[TokenService] Error setting token expiry:', error);
      throw error;
    }
  },

  /**
   * Check if token is expired
   * Checks JWT expiry first, then falls back to stored expiry
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return true;
      
      // Try JWT expiry check first (more reliable)
      if (isJWTExpiredUtil(token)) {
        return true;
      }
      
      // Fallback to stored expiry
      const expiry = await this.getTokenExpiry();
      if (!expiry) return true;
      return Date.now() >= expiry;
    } catch (error) {
      console.error('[TokenService] Error checking token expiry:', error);
      return true;
    }
  },

  /**
   * Get time until token expires (in milliseconds)
   */
  async getTimeUntilExpiry(): Promise<number> {
    try {
      const expiry = await this.getTokenExpiry();
      if (!expiry) return 0;
      const timeLeft = expiry - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      console.error('Error getting time until expiry:', error);
      return 0;
    }
  },
};


