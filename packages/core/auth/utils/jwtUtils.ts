/**
 * JWT Utility
 * Utility functions untuk decode dan extract data dari JWT token
 * JWT format: header.payload.signature
 * 
 * Note: Functions ini hanya decode JWT tanpa verify signature
 * Signature verification harus dilakukan di backend/API level
 */
import { decode as base64Decode } from 'base-64';

/**
 * JWT Payload Interface
 * Sesuai dengan JWT claims standard dan custom claims
 */
export interface JWTPayload {
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
  [key: string]: any;  // Allow additional claims
}

/**
 * Decode JWT token tanpa verify signature
 * Hanya untuk extract payload data
 * 
 * @param token - JWT token string (format: header.payload.signature)
 * @returns Decoded JWT payload atau null jika invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWTUtils] Invalid JWT format: expected 3 parts, got', parts.length);
      return null;
    }

    // Decode payload (part 2, index 1)
    const payload = parts[1];
    
    // Base64URL decode (handle padding)
    // Base64URL uses - and _ instead of + and /
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed (Base64 requires length to be multiple of 4)
    const pad = base64.length % 4;
    if (pad) {
      base64 += new Array(5 - pad).join('=');
    }

    // Decode base64
    const decoded = base64Decode(base64);
    
    // Parse JSON
    const parsed = JSON.parse(decoded);
    
    return parsed as JWTPayload;
  } catch (error) {
    console.error('[JWTUtils] Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract expiry timestamp from JWT
 * Returns expiry in milliseconds (for compatibility with Date.now())
 * 
 * @param token - JWT token string
 * @returns Expiry timestamp in milliseconds atau null jika tidak ada
 */
export const getJWTExpiry = (token: string): number | null => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }
  
  // Convert from seconds to milliseconds
  return payload.exp * 1000;
};

/**
 * Check if JWT is expired
 * Adds 1 minute buffer untuk clock skew tolerance (reduced from 5 minutes)
 * 
 * @param token - JWT token string
 * @returns true jika expired, false jika masih valid
 */
export const isJWTExpired = (token: string): boolean => {
  const expiry = getJWTExpiry(token);
  if (!expiry) {
    // If no expiry claim, consider it expired for safety
    return true;
  }
  
  // Add 1 minute buffer for clock skew (reduced to prevent premature expiration)
  const buffer = 1 * 60 * 1000; // 1 minute in milliseconds
  return Date.now() >= (expiry - buffer);
};

/**
 * Extract user ID from JWT (sub claim)
 * 
 * @param token - JWT token string
 * @returns User ID dari sub claim atau null jika tidak ada
 */
export const getJWTUserId = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.sub || null;
};

/**
 * Extract scopes from JWT
 * 
 * @param token - JWT token string
 * @returns Array of scopes atau empty array jika tidak ada
 */
export const getJWTScopes = (token: string): string[] => {
  const payload = decodeJWT(token);
  return payload?.scope || [];
};

/**
 * Extract token type from JWT
 * 
 * @param token - JWT token string
 * @returns Token type atau null jika tidak ada
 */
export const getJWTType = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.type || null;
};

/**
 * Get time until JWT expires (in milliseconds)
 * 
 * @param token - JWT token string
 * @returns Time until expiry in milliseconds, atau 0 jika expired atau tidak ada expiry
 */
export const getTimeUntilJWTExpiry = (token: string): number => {
  const expiry = getJWTExpiry(token);
  if (!expiry) {
    return 0;
  }
  
  const timeLeft = expiry - Date.now();
  return timeLeft > 0 ? timeLeft : 0;
};

/**
 * Get all JWT claims
 * 
 * @param token - JWT token string
 * @returns Full JWT payload atau null jika invalid
 */
export const getJWTClaims = (token: string): JWTPayload | null => {
  return decodeJWT(token);
};

