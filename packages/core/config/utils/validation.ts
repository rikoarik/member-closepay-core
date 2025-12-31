/**
 * Core Config - Validation Utilities
 * Input validation functions for service layer
 */

import { ValidationErrorClass } from '../types/errors';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}

/**
 * Validate string input
 * @param value - Value to validate
 * @param fieldName - Field name for error messages (optional)
 * @param minLength - Minimum length (optional)
 * @param maxLength - Maximum length (optional)
 * @param allowEmpty - Whether empty string is allowed (default: false)
 * @returns ValidationResult
 */
export function validateString(
  value: unknown,
  fieldName = 'Field',
  minLength?: number,
  maxLength?: number,
  allowEmpty = false
): ValidationResult {
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: `${fieldName} is required`,
      field: fieldName,
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
      field: fieldName,
    };
  }

  const trimmedValue = value.trim();

  if (!allowEmpty && trimmedValue.length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`,
      field: fieldName,
    };
  }

  if (minLength !== undefined && trimmedValue.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
      field: fieldName,
    };
  }

  if (maxLength !== undefined && trimmedValue.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * Validate email address
 * @param value - Email to validate
 * @param fieldName - Field name for error messages (optional)
 * @returns ValidationResult
 */
export function validateEmail(value: unknown, fieldName = 'Email'): ValidationResult {
  const stringResult = validateString(value, fieldName, 1, 255, false);
  if (!stringResult.valid) {
    return stringResult;
  }

  const email = (value as string).trim().toLowerCase();
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid email address`,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * Validate phone number
 * @param value - Phone number to validate
 * @param fieldName - Field name for error messages (optional)
 * @param minLength - Minimum length (default: 8)
 * @param maxLength - Maximum length (default: 15)
 * @returns ValidationResult
 */
export function validatePhone(
  value: unknown,
  fieldName = 'Phone',
  minLength = 8,
  maxLength = 15
): ValidationResult {
  const stringResult = validateString(value, fieldName, minLength, maxLength, false);
  if (!stringResult.valid) {
    return stringResult;
  }

  const phone = (value as string).trim();
  // Only digits allowed
  const phoneRegex = /^\d+$/;

  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      error: `${fieldName} must contain only digits`,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * Validate ID (UUID, numeric ID, etc.)
 * @param value - ID to validate
 * @param fieldName - Field name for error messages (optional)
 * @param type - ID type: 'uuid', 'numeric', or 'any' (default: 'any')
 * @returns ValidationResult
 */
export function validateId(
  value: unknown,
  fieldName = 'ID',
  type: 'uuid' | 'numeric' | 'any' = 'any'
): ValidationResult {
  const stringResult = validateString(value, fieldName, 1, 255, false);
  if (!stringResult.valid) {
    return stringResult;
  }

  const id = (value as string).trim();

  if (type === 'uuid') {
    // UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        valid: false,
        error: `${fieldName} must be a valid UUID`,
        field: fieldName,
      };
    }
  } else if (type === 'numeric') {
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(id)) {
      return {
        valid: false,
        error: `${fieldName} must be a numeric ID`,
        field: fieldName,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Field name for error messages (optional)
 * @returns ValidationResult
 */
export function validateRequired(value: unknown, fieldName = 'Field'): ValidationResult {
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: `${fieldName} is required`,
      field: fieldName,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`,
      field: fieldName,
    };
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple fields at once
 * @param validations - Array of validation results
 * @returns Combined validation result
 */
export function validateMultiple(validations: ValidationResult[]): ValidationResult {
  const failed = validations.find(v => !v.valid);
  if (failed) {
    return failed;
  }
  return { valid: true };
}

/**
 * Throw ValidationError if validation fails
 * @param result - Validation result
 * @throws ValidationErrorClass if validation fails
 */
export function throwIfInvalid(result: ValidationResult): void {
  if (!result.valid) {
    throw new ValidationErrorClass(result.error || 'Validation failed', result.field);
  }
}

/**
 * Validate and throw if invalid (convenience function)
 * @param value - Value to validate
 * @param validator - Validation function to use
 * @param fieldName - Field name for error messages
 * @throws ValidationErrorClass if validation fails
 */
export function validateAndThrow<T>(
  value: unknown,
  validator: (value: unknown, fieldName?: string) => ValidationResult,
  fieldName?: string
): asserts value is T {
  const result = validator(value, fieldName);
  throwIfInvalid(result);
}

