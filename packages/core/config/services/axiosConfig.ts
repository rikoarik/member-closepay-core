/**
 * Axios Configuration dengan Interceptor
 * Centralized axios instance dengan auto JWT token attachment
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenService } from '../../auth/services/tokenService';
import Config from '../../native/Config';
import {
  isAxiosError,
  isAuthenticationError,
  axiosErrorToApiError,
  AuthErrorClass,
  NetworkErrorClass,
} from '../types/errors';

// Base URL dari environment variable atau default ke staging
// Production build harus set API_BASE_URL di .env.production
const API_BASE_URL = Config.API_BASE_URL;

import { logger } from './loggerService';

// Log environment untuk debugging (hanya di development)
if (__DEV__) {
    logger.debug('Environment:', Config.ENV);
    logger.debug('API Base URL:', API_BASE_URL);
}

/**
 * Create axios instance dengan default config
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_CONSTANTS.DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Automatically attach JWT token to every request
 */
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Get token from storage
            const token = await tokenService.getToken();

            // Attach token to Authorization header if exists
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            logger.debug('Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasToken: !!token,
            });

            return config;
        } catch (error) {
            logger.error('Request interceptor error', error);
            return config;
        }
    },
    (error: AxiosError) => {
        logger.error('Request error', error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handle token refresh on 401 and other common errors
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        logger.debug('Response:', {
            status: response.status,
            url: response.config.url,
        });
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        logger.error('Response error', error, {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
        });

        // Handle 401 Unauthorized
        // Skip token refresh for login/auth endpoints that don't require authentication
        const isAuthEndpoint = API_CONSTANTS.AUTH_ENDPOINTS.some(endpoint =>
            originalRequest?.url?.includes(endpoint)
        );

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                logger.info('Attempting token refresh...');

                // Try to get refresh token
                const refreshToken = await tokenService.getRefreshToken();

                if (refreshToken) {
                    // Call refresh token endpoint
                    // TODO: Sesuaikan endpoint ini dengan API backend (current: /auth/refresh)
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const newAccessToken = response.data.data?.access_token || response.data.access_token;

                    if (newAccessToken) {
                        // Save new token
                        await tokenService.setToken(newAccessToken);

                        // Update Authorization header
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        }

                        logger.info('Token refreshed successfully, retrying request...');

                        // Retry original request with new token
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError: unknown) {
                logger.error('Token refresh failed', refreshError);

                // Only clear tokens if it's a clear auth error (401, 403)
                // Don't clear on network errors or other issues
                const isAuthErr = isAuthenticationError(refreshError);

                if (isAuthErr) {
                    logger.warn('Clear auth error detected, clearing tokens...');
                    await tokenService.clearTokens();
                } else {
                    logger.info('Non-auth error during refresh, keeping tokens...');
                }

                // Optionally: trigger logout or redirect to login
                // This should be handled by the app's auth system
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (error.message === 'Network Error') {
            const networkError = new NetworkErrorClass(
                ERROR_MESSAGES.NETWORK_ERROR,
                error,
                false,
                true
            );
            return Promise.reject(networkError);
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            const timeoutError = new NetworkErrorClass(
                ERROR_MESSAGES.TIMEOUT_ERROR,
                error,
                true,
                false
            );
            return Promise.reject(timeoutError);
        }

        // Convert AxiosError to ApiError for consistent error handling
        if (isAxiosError(error)) {
            const apiError = axiosErrorToApiError(error);
            return Promise.reject(apiError);
        }

        return Promise.reject(error);
    }
);

/**
 * Helper to check if token is about to expire
 * Returns true if token will expire in less than 30 minutes
 */
export const isTokenExpiringSoon = async (): Promise<boolean> => {
    try {
        const expiry = await tokenService.getTokenExpiry();
        if (!expiry) return false;

        const now = Date.now();
        const timeUntilExpiry = expiry - now;

        return timeUntilExpiry < API_CONSTANTS.TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0;
    } catch (error) {
        logger.error('Error checking token expiry', error);
        return false;
    }
};

/**
 * Proactively refresh token if expiring soon
 */
export const refreshTokenIfNeeded = async (): Promise<void> => {
    try {
        const expiringSoon = await isTokenExpiringSoon();

        if (expiringSoon) {
            logger.info(`Token expiring soon (< ${API_CONSTANTS.TOKEN_REFRESH_THRESHOLD / TIME_CONSTANTS.MINUTE} min), refreshing...`);
            const refreshToken = await tokenService.getRefreshToken();

            if (refreshToken) {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const newAccessToken = response.data.data?.access_token || response.data.access_token;

        }
    } catch (error) {
        logger.error('Proactive refresh failed', error);
    }
            }
        }
    } catch (error) {
        console.error('[Axios] Proactive refresh failed:', error);
    }
};

export default axiosInstance;

