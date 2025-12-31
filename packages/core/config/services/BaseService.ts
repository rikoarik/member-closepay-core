/**
 * Core Config - Base Service
 * Base class untuk services dengan common patterns (error handling, validation, logging)
 */

import { handleApiError, getUserFriendlyMessage, getErrorDetails } from '../utils/errorHandler';
import { validateId, validateString, validateEmail, validatePhone, ValidationResult, throwIfInvalid } from '../utils/validation';
import { logger } from './loggerService';
import { ApiError, NetworkError, ValidationError, AuthError } from '../types/errors';

/**
 * Base Service class
 * Provides common functionality for all services:
 * - Standardized error handling
 * - Input validation helpers
 * - Logging
 */
export abstract class BaseService {
  /**
   * Service context name for logging
   */
  protected abstract readonly serviceName: string;

  /**
   * Logger instance for this service
   */
  protected readonly log = logger.child(this.serviceName);

  /**
   * Handle and log errors consistently
   * @param error - Error to handle
   * @param context - Additional context for the error
   * @returns User-friendly error message
   */
  protected handleError(error: unknown, context?: string): string {
    const errorDetails = getErrorDetails(error);
    this.log.error(`Error${context ? ` in ${context}` : ''}`, error, errorDetails);

    const apiError = handleApiError(error);
    return getUserFriendlyMessage(apiError);
  }

  /**
   * Validate ID and throw if invalid
   * @param id - ID to validate
   * @param fieldName - Field name for error messages
   * @param type - ID type ('uuid', 'numeric', or 'any')
   */
  protected validateId(id: unknown, fieldName = 'id', type: 'uuid' | 'numeric' | 'any' = 'any'): void {
    throwIfInvalid(validateId(id, fieldName, type));
  }

  /**
   * Validate string and throw if invalid
   * @param value - String to validate
   * @param fieldName - Field name for error messages
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @param allowEmpty - Whether empty string is allowed
   */
  protected validateString(
    value: unknown,
    fieldName = 'field',
    minLength?: number,
    maxLength?: number,
    allowEmpty = false
  ): void {
    throwIfInvalid(validateString(value, fieldName, minLength, maxLength, allowEmpty));
  }

  /**
   * Validate email and throw if invalid
   * @param email - Email to validate
   * @param fieldName - Field name for error messages
   */
  protected validateEmail(email: unknown, fieldName = 'email'): void {
    throwIfInvalid(validateEmail(email, fieldName));
  }

  /**
   * Validate phone and throw if invalid
   * @param phone - Phone to validate
   * @param fieldName - Field name for error messages
   */
  protected validatePhone(phone: unknown, fieldName = 'phone'): void {
    throwIfInvalid(validatePhone(phone, fieldName));
  }

  /**
   * Execute async operation with error handling
   * @param operation - Async operation to execute
   * @param context - Context for error messages
   * @returns Result of the operation
   * @throws Error with user-friendly message
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = this.handleError(error, context);
      throw new Error(errorMessage);
    }
  }

  /**
   * Execute async operation with retry logic
   * @param operation - Async operation to execute
   * @param maxRetries - Maximum number of retries (default: 3)
   * @param retryDelay - Delay between retries in milliseconds (default: 1000)
   * @returns Result of the operation
   * @throws Error if all retries fail
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.log.warn(`Operation failed (attempt ${attempt}/${maxRetries})`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    const errorMessage = this.handleError(lastError);
    throw new Error(errorMessage);
  }

  /**
   * Validate multiple fields at once
   * @param validations - Array of validation results
   * @throws ValidationError if any validation fails
   */
  protected validateMultiple(validations: ValidationResult[]): void {
    const failed = validations.find(v => !v.valid);
    if (failed) {
      throwIfInvalid(failed);
    }
  }
}

