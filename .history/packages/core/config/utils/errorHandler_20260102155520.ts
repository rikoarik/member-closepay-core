/**
 * Core Config - Error Handler Utility
 * Standardized error handling functions for consistent error processing
 */

import { AxiosError } from 'axios';
import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthError,
  AppErrorType,
  isApiError,
  isNetworkError,
  isValidationError,
  isAuthError,
  isAxiosError,
  axiosErrorToApiError,
  isAuthenticationError,
  ApiErrorClass,
  NetworkErrorClass,
  ValidationErrorClass,
  AuthErrorClass,
} from '../types/errors';

/**
 * Handle API errors and convert to standardized format
 * @param error - Error to handle (can be AxiosError, ApiError, or unknown)
 * @returns ApiError instance
 */
export function handleApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isAxiosError(error)) {
    return axiosErrorToApiError(error);
  }

  // Fallback for unknown errors
  return {
    type: 'api',
    message: error instanceof Error ? error.message : 'Unknown API error',
    timestamp: Date.now(),
    statusCode: 500,
  };
}

/**
 * Handle network errors and convert to standardized format
 * @param error - Error to handle
 * @param isTimeout - Whether this is a timeout error
 * @param isOffline - Whether device is offline
 * @returns NetworkError instance
 */
export function handleNetworkError(
  error: unknown,
  isTimeout = false,
  isOffline = false
): NetworkError {
  if (isNetworkError(error)) {
    return error;
  }

  const originalError = error instanceof Error ? error : new Error(String(error));
  const message = isTimeout
    ? 'Request timeout. Silakan coba lagi.'
    : isOffline
    ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    : 'Network error occurred';

  return new NetworkErrorClass(message, originalError, isTimeout, isOffline);
}

/**
 * Handle validation errors
 * @param message - Error message
 * @param field - Field name that failed validation (optional)
 * @param fieldErrors - Map of field names to error messages (optional)
 * @returns ValidationError instance
 */
export function handleValidationError(
  message: string,
  field?: string,
  fieldErrors?: Record<string, string>
): ValidationError {
  return new ValidationErrorClass(message, field, fieldErrors);
}

/**
 * Handle authentication errors
 * @param error - Error to handle
 * @param shouldClearTokens - Whether to clear tokens (default: true for 401/403)
 * @returns AuthError instance
 */
export function handleAuthError(error: unknown, shouldClearTokens?: boolean): AuthError {
  if (isAuthError(error)) {
    return error;
  }

  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const isUnauthorized = statusCode === 401;
    const isForbidden = statusCode === 403;
    const shouldClear = shouldClearTokens ?? (isUnauthorized || isForbidden);

    return new AuthErrorClass(
      (error.response?.data?.message as string) || (error.message as string) || 'Authentication failed',
      statusCode,
      isUnauthorized,
      isForbidden,
      shouldClear
    );
  }

  if (isApiError(error)) {
    const isUnauthorized = error.statusCode === 401;
    const isForbidden = error.statusCode === 403;
    const shouldClear = shouldClearTokens ?? (isUnauthorized || isForbidden);

    return new AuthErrorClass(
      error.message,
      error.statusCode,
      isUnauthorized,
      isForbidden,
      shouldClear
    );
  }

  // Fallback
  return new AuthErrorClass(
    error instanceof Error ? error.message : 'Authentication failed',
    undefined,
    false,
    false,
    shouldClearTokens ?? false
  );
}

/**
 * Get user-friendly error message from any error type
 * Returns Indonesian messages for user-facing errors
 * @param error - Error to extract message from
 * @returns User-friendly error message in Indonesian
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Handle known error types
  if (isApiError(error)) {
    const apiMessage = error.response?.data?.message || error.message;
    // Map common API error codes to user-friendly messages
    if (error.statusCode === 400) {
      return apiMessage || 'Permintaan tidak valid. Silakan periksa data yang Anda masukkan.';
    }
    if (error.statusCode === 401) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (error.statusCode === 403) {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    if (error.statusCode === 404) {
      return 'Data yang Anda cari tidak ditemukan.';
    }
    if (error.statusCode === 500) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    }
    return apiMessage || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  if (isNetworkError(error)) {
    if (error.isTimeout) {
      return 'Request timeout. Silakan coba lagi.';
    }
    if (error.isOffline) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
    return error.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.';
  }

  if (isValidationError(error)) {
    return error.message || 'Data yang Anda masukkan tidak valid.';
  }

  if (isAuthError(error)) {
    if (error.isUnauthorized) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (error.isForbidden) {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    return error.message || 'Terjadi kesalahan autentikasi.';
  }

  // Handle AxiosError
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const apiMessage = error.response?.data.message;

    if (apiMessage) {
      return apiMessage;
    }

    if (statusCode === 401) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (statusCode === 403) {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    if (statusCode === 404) {
      return 'Data yang Anda cari tidak ditemukan.';
    }
    if (statusCode === 500) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    }

    if (error.message === 'Network Error') {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Silakan coba lagi.';
    }
  }

  // Handle standard Error
  if (error instanceof Error) {
    return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  // Fallback
  return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
}

/**
 * Check if error requires user action (login, retry, etc.)
 * @param error - Error to check
 * @returns Object with flags indicating required actions
 */
export function getErrorActions(error: unknown): {
  requiresLogin: boolean;
  requiresRetry: boolean;
  canRetry: boolean;
  shouldClearTokens: boolean;
} {
  const requiresLogin = isAuthenticationError(error);
  const isNetwork = isNetworkError(error);
  const isTimeout = isNetwork && isNetwork.isTimeout;
  const isOffline = isNetwork && isNetwork.isOffline;

  return {
    requiresLogin,
    requiresRetry: isNetwork || isTimeout,
    canRetry: isNetwork || isTimeout || isOffline,
    shouldClearTokens: requiresLogin,
  };
}

/**
 * Extract error details for logging (sanitized)
 * @param error - Error to extract details from
 * @returns Sanitized error details object
 */
export function getErrorDetails(error: unknown): Record<string, unknown> {
  const details: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
    timestamp: Date.now(),
  };

  if (isApiError(error)) {
    details.type = 'api';
    details.statusCode = error.statusCode;
    details.code = error.code;
    // Don't log full response data (may contain sensitive info)
    if (error.response) {
      details.status = error.response.status;
      details.statusText = error.response.statusText;
    }
  } else if (isNetworkError(error)) {
    details.type = 'network';
    details.isTimeout = error.isTimeout;
    details.isOffline = error.isOffline;
  } else if (isValidationError(error)) {
    details.type = 'validation';
    details.field = error.field;
  } else if (isAuthError(error)) {
    details.type = 'auth';
    details.isUnauthorized = error.isUnauthorized;
    details.isForbidden = error.isForbidden;
  } else if (isAxiosError(error)) {
    details.type = 'axios';
    details.status = error.response?.status;
    details.url = error.config?.url;
    details.method = error.config?.method;
  }

  return details;
}

