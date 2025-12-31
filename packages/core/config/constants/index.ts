/**
 * Core Config - Constants
 * Centralized constants for API, time, UI, and error messages
 */

/**
 * API Constants
 */
export const API_CONSTANTS = {
  /**
   * Default request timeout in milliseconds
   */
  DEFAULT_TIMEOUT: 30000, // 30 seconds

  /**
   * Token refresh threshold in milliseconds
   * Token will be refreshed if it expires within this time
   */
  TOKEN_REFRESH_THRESHOLD: 30 * 60 * 1000, // 30 minutes

  /**
   * Config cache expiry in milliseconds
   */
  CONFIG_CACHE_EXPIRY: 5 * 60 * 1000, // 5 minutes

  /**
   * Auth endpoints that don't require token refresh
   */
  AUTH_ENDPOINTS: [
    '/auth/account/login',
    '/auth/account/register',
    '/auth/account/forgot-password',
  ] as const,
} as const;

/**
 * Time Constants (in milliseconds)
 */
export const TIME_CONSTANTS = {
  /**
   * One second in milliseconds
   */
  SECOND: 1000,

  /**
   * One minute in milliseconds
   */
  MINUTE: 60 * 1000,

  /**
   * One hour in milliseconds
   */
  HOUR: 60 * 60 * 1000,

  /**
   * One day in milliseconds
   */
  DAY: 24 * 60 * 60 * 1000,

  /**
   * Thirty minutes in milliseconds
   */
  THIRTY_MINUTES: 30 * 60 * 1000,

  /**
   * Five minutes in milliseconds
   */
  FIVE_MINUTES: 5 * 60 * 1000,
} as const;

/**
 * UI Constants
 */
export const UI_CONSTANTS = {
  /**
   * Default page size for pagination
   */
  DEFAULT_PAGE_SIZE: 10,

  /**
   * Maximum page size
   */
  MAX_PAGE_SIZE: 100,

  /**
   * Minimum page size
   */
  MIN_PAGE_SIZE: 1,

  /**
   * Default debounce delay for search inputs (in milliseconds)
   */
  SEARCH_DEBOUNCE_DELAY: 300,

  /**
   * Default animation duration (in milliseconds)
   */
  ANIMATION_DURATION: 300,

  /**
   * Long animation duration (in milliseconds)
   */
  LONG_ANIMATION_DURATION: 500,
} as const;

/**
 * Validation Constants
 */
export const VALIDATION_CONSTANTS = {
  /**
   * Minimum password length
   */
  MIN_PASSWORD_LENGTH: 6,

  /**
   * Maximum password length
   */
  MAX_PASSWORD_LENGTH: 255,

  /**
   * Minimum username length
   */
  MIN_USERNAME_LENGTH: 1,

  /**
   * Maximum username length
   */
  MAX_USERNAME_LENGTH: 100,

  /**
   * Minimum name length
   */
  MIN_NAME_LENGTH: 1,

  /**
   * Maximum name length
   */
  MAX_NAME_LENGTH: 255,

  /**
   * Minimum phone number length
   */
  MIN_PHONE_LENGTH: 8,

  /**
   * Maximum phone number length
   */
  MAX_PHONE_LENGTH: 15,

  /**
   * Minimum OTP length
   */
  MIN_OTP_LENGTH: 1,

  /**
   * Maximum OTP length
   */
  MAX_OTP_LENGTH: 10,

  /**
   * Minimum email length
   */
  MIN_EMAIL_LENGTH: 1,

  /**
   * Maximum email length
   */
  MAX_EMAIL_LENGTH: 255,
} as const;

/**
 * Error Message Constants (Indonesian)
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  TIMEOUT_ERROR: 'Request timeout. Silakan coba lagi.',
  OFFLINE_ERROR: 'Tidak ada koneksi internet. Silakan periksa koneksi Anda.',

  // Authentication errors
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
  AUTH_FAILED: 'Terjadi kesalahan autentikasi.',

  // Validation errors
  REQUIRED_FIELD: 'Field ini wajib diisi.',
  INVALID_EMAIL: 'Email tidak valid.',
  INVALID_PHONE: 'Nomor telepon tidak valid.',
  INVALID_PASSWORD: 'Password harus minimal 6 karakter.',
  INVALID_OTP: 'OTP tidak valid.',

  // API errors
  NOT_FOUND: 'Data yang Anda cari tidak ditemukan.',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  BAD_REQUEST: 'Permintaan tidak valid. Silakan periksa data yang Anda masukkan.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.',

  // Generic errors
  OPERATION_FAILED: 'Operasi gagal. Silakan coba lagi.',
  LOADING_FAILED: 'Gagal memuat data. Silakan coba lagi.',
  SAVE_FAILED: 'Gagal menyimpan data. Silakan coba lagi.',
  DELETE_FAILED: 'Gagal menghapus data. Silakan coba lagi.',
} as const;

/**
 * Success Message Constants (Indonesian)
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Data berhasil disimpan.',
  DELETE_SUCCESS: 'Data berhasil dihapus.',
  UPDATE_SUCCESS: 'Data berhasil diperbarui.',
  OPERATION_SUCCESS: 'Operasi berhasil dilakukan.',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * String length limits
 */
export const STRING_LIMITS = {
  MIN_STRING_LENGTH: 1,
  MAX_STRING_LENGTH: 255,
  MAX_LONG_STRING_LENGTH: 1000,
  MAX_TEXT_LENGTH: 10000,
} as const;

