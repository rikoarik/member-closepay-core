/**
 * Core Config - Sanitization Utility
 * Utilities for sanitizing sensitive data before logging or storage
 */

/**
 * Sensitive fields that should be sanitized
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'api_key',
  'apiKey',
  'secret',
  'secretKey',
  'privateKey',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'socialSecurityNumber',
  'pin',
  'otp',
  'securityCode',
  'security_code',
];

/**
 * Sanitize a value by replacing it with a mask
 * @param value - Value to sanitize
 * @param mask - Mask character to use (default: '*')
 * @param visibleChars - Number of characters to keep visible at start and end (default: 0)
 * @returns Sanitized value
 */
export function sanitizeValue(value: string, mask = '*', visibleChars = 0): string {
  if (!value || value.length === 0) {
    return value;
  }

  if (value.length <= visibleChars * 2) {
    return mask.repeat(value.length);
  }

  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const middle = mask.repeat(Math.max(0, value.length - visibleChars * 2));

  return `${start}${middle}${end}`;
}

/**
 * Check if a field name is sensitive
 * @param fieldName - Field name to check
 * @returns True if field is sensitive
 */
export function isSensitiveField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some(sensitive => lowerFieldName.includes(sensitive.toLowerCase()));
}

/**
 * Sanitize an object by masking sensitive fields
 * @param obj - Object to sanitize
 * @param depth - Maximum depth to sanitize (default: 5, to prevent infinite recursion)
 * @returns Sanitized object
 */
export function sanitizeObject(obj: unknown, depth = 5): unknown {
  if (depth <= 0) {
    return '[Max depth reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth - 1));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeValue(value, '*', 0);
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth - 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize data for logging
 * Removes or masks sensitive information
 * @param data - Data to sanitize
 * @returns Sanitized data safe for logging
 */
export function sanitizeForLog(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Check if string contains sensitive patterns
    if (data.includes('password') || data.includes('token') || data.includes('secret')) {
      return '[Contains sensitive data - redacted]';
    }
    return data;
  }

  if (typeof data === 'object') {
    return sanitizeObject(data);
  }

  return data;
}

/**
 * Sanitize error for logging
 * Removes sensitive data from error objects
 * @param error - Error to sanitize
 * @returns Sanitized error object
 */
export function sanitizeError(error: unknown): Record<string, unknown> {
  const errorObj: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'Unknown',
  };

  if (error instanceof Error) {
    if (error.stack) {
      // Remove potential sensitive data from stack traces
      errorObj.stack = error.stack.split('\n').slice(0, 10).join('\n'); // Limit stack trace
    }
  }

  // Sanitize any additional error properties
  if (typeof error === 'object' && error !== null) {
    const sanitized = sanitizeObject(error);
    if (typeof sanitized === 'object' && sanitized !== null) {
      Object.assign(errorObj, sanitized);
    }
  }

  return errorObj;
}

/**
 * Remove sensitive fields from an object
 * @param obj - Object to clean
 * @returns Object with sensitive fields removed
 */
export function removeSensitiveFields<T extends Record<string, unknown>>(obj: T): Omit<T, string> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!isSensitiveField(key)) {
      cleaned[key] = value;
    }
  }

  return cleaned as Omit<T, string>;
}

