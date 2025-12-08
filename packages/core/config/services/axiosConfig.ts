/**
 * Axios Configuration dengan Interceptor
 * Centralized axios instance dengan auto JWT token attachment
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenService } from '../../auth/services/tokenService';

// Base URL dari environment atau default
// TODO: Get from AppConfig when available
const API_BASE_URL = 'https://api.stg.solusiuntuknegeri.com';

/**
 * Create axios instance dengan default config
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
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

            console.log('[Axios] Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                hasToken: !!token,
            });

            return config;
        } catch (error) {
            console.error('[Axios] Request interceptor error:', error);
            return config;
        }
    },
    (error: AxiosError) => {
        console.error('[Axios] Request error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handle token refresh on 401 and other common errors
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('[Axios] Response:', {
            status: response.status,
            url: response.config.url,
        });
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        console.error('[Axios] Response error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
        });

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('[Axios] Attempting token refresh...');

                // Try to get refresh token
                const refreshToken = await tokenService.getRefreshToken();

                if (refreshToken) {
                    // Call refresh token endpoint
                    // NOTE: Sesuaikan endpoint ini dengan API backend
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

                        console.log('[Axios] Token refreshed successfully, retrying request...');

                        // Retry original request with new token
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('[Axios] Token refresh failed:', refreshError);

                // Only clear tokens if it's a clear auth error (401, 403)
                // Don't clear on network errors or other issues
                const isAuthError = 
                    (refreshError as any)?.response?.status === 401 ||
                    (refreshError as any)?.response?.status === 403 ||
                    (refreshError as any)?.message?.includes('Unauthorized') ||
                    (refreshError as any)?.message?.includes('Not authenticated');

                if (isAuthError) {
                    console.log('[Axios] Clear auth error detected, clearing tokens...');
                    await tokenService.clearTokens();
                } else {
                    console.log('[Axios] Non-auth error during refresh, keeping tokens...');
                }

                // Optionally: trigger logout or redirect to login
                // This should be handled by the app's auth system
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (error.message === 'Network Error') {
            return Promise.reject(new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'));
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Request timeout. Silakan coba lagi.'));
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
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

        return timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0;
    } catch (error) {
        console.error('[Axios] Error checking token expiry:', error);
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
            console.log('[Axios] Token expiring soon (< 30 min), refreshing...');
            const refreshToken = await tokenService.getRefreshToken();

            if (refreshToken) {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const newAccessToken = response.data.data?.access_token || response.data.access_token;

                if (newAccessToken) {
                    await tokenService.setToken(newAccessToken);
                    console.log('[Axios] Token refreshed proactively');
                }
            }
        }
    } catch (error) {
        console.error('[Axios] Proactive refresh failed:', error);
    }
};

export default axiosInstance;

