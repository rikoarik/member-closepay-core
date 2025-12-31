/**
 * Core Config - Error Types
 * Standardized error types and interfaces for error handling
 */

import { AxiosError } from 'axios';

/**
 * Base error interface for all application errors
 */
export interface BaseError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * API Error - Errors from backend API responses
 */
export interface ApiError extends BaseError {
  type: 'api';
  response?: {
    status: number;
    statusText: string;
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
}

/**
 * Network Error - Network-related errors (no connection, timeout, etc.)
 */
export interface NetworkError extends BaseError {
  type: 'network';
  originalError?: Error;
  isTimeout?: boolean;
  isOffline?: boolean;
}

/**
 * Validation Error - Input validation errors
 */
export interface ValidationError extends BaseError {
  type: 'validation';
  field?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Authentication Error - Auth-related errors (401, 403, etc.)
 */
export interface AuthError extends BaseError {
  type: 'auth';
  isUnauthorized?: boolean;
  isForbidden?: boolean;
  shouldClearTokens?: boolean;
}

/**
 * Custom error classes
 */
export class AppError extends Error implements BaseError {
  code?: string;
  statusCode?: number;
  timestamp: number;
  context?: Record<string, unknown>;

  constructor(message: string, code?: string, statusCode?: number, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = Date.now();
    this.context = context;
  }
}

export class ApiErrorClass extends AppError implements ApiError {
  type: 'api' = 'api';
  response?: ApiError['response'];

  constructor(message: string, response?: ApiError['response'], code?: string, context?: Record<string, unknown>) {
    super(message, code, response?.status, context);
    this.name = 'ApiError';
    this.response = response;
  }
}

export class NetworkErrorClass extends AppError implements NetworkError {
  type: 'network' = 'network';
  originalError?: Error;
  isTimeout?: boolean;
  isOffline?: boolean;

  constructor(
    message: string,
    originalError?: Error,
    isTimeout?: boolean,
    isOffline?: boolean,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', undefined, context);
    this.name = 'NetworkError';
    this.originalError = originalError;
    this.isTimeout = isTimeout;
    this.isOffline = isOffline;
  }
}

export class ValidationErrorClass extends AppError implements ValidationError {
  type: 'validation' = 'validation';
  field?: string;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    field?: string,
    fieldErrors?: Record<string, string>,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
    this.field = field;
    this.fieldErrors = fieldErrors;
  }
}

export class AuthErrorClass extends AppError implements AuthError {
  type: 'auth' = 'auth';
  isUnauthorized?: boolean;
  isForbidden?: boolean;
  shouldClearTokens?: boolean;

  constructor(
    message: string,
    statusCode?: number,
    isUnauthorized?: boolean,
    isForbidden?: boolean,
    shouldClearTokens?: boolean,
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTH_ERROR', statusCode, context);
    this.name = 'AuthError';
    this.isUnauthorized = isUnauthorized ?? statusCode === 401;
    this.isForbidden = isForbidden ?? statusCode === 403;
    this.shouldClearTokens = shouldClearTokens ?? (this.isUnauthorized || this.isForbidden);
  }
}

/**
 * Union type for all error types
 */
export type AppErrorType = ApiError | NetworkError | ValidationError | AuthError;

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type: string }).type === 'api'
  );
}

/**
 * Type guard to check if error is NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type: string }).type === 'network'
  );
}

/**
 * Type guard to check if error is ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type: string }).type === 'validation'
  );
}

/**
 * Type guard to check if error is AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type: string }).type === 'auth'
  );
}

/**
 * Type guard to check if error is AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  );
}

/**
 * Convert AxiosError to ApiError
 */
export function axiosErrorToApiError(error: AxiosError): ApiError {
  return {
    type: 'api',
    message: error.response?.data?.message || error.message || 'API request failed',
    code: error.code,
    statusCode: error.response?.status,
    timestamp: Date.now(),
    response: {
      status: error.response?.status || 0,
      statusText: error.response?.statusText || '',
      data: error.response?.data as ApiError['response']['data'],
    },
    context: {
      url: error.config?.url,
      method: error.config?.method,
    },
  };
}

/**
 * Check if error is an authentication error (401 or 403)
 */
export function isAuthenticationError(error: unknown): boolean {
  if (isAuthError(error)) {
    return error.isUnauthorized || error.isForbidden;
  }
  if (isApiError(error)) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  if (isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

