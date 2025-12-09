/**
 * Auth Helpers
 * Helper functions untuk auto-refresh token dan background tasks
 */
import { tokenService } from '../services/tokenService';
import { refreshTokenIfNeeded } from '@core/config';

/**
 * Setup background token refresh
 * Check token expiry setiap 15 menit dan refresh jika perlu
 */
export const setupTokenRefreshInterval = (): number => {
    const intervalId = setInterval(async () => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                return; // No token, skip refresh check
            }

            const isExpired = await tokenService.isTokenExpired();
            if (isExpired) {
                console.log('[AuthHelper] Token expired, skipping refresh');
                return;
            }

            // Check if expiring soon and refresh
            await refreshTokenIfNeeded();
        } catch (error) {
            console.error('[AuthHelper] Token refresh check failed:', error);
        }
    }, 900000); // Check every 15 minutes (900000 ms)

    console.log('[AuthHelper] Token refresh interval started (every 15 minutes)');
    return intervalId as unknown as number;
};

/**
 * Clear background token refresh interval
 */
export const clearTokenRefreshInterval = (intervalId: number): void => {
    clearInterval(intervalId);
    console.log('[AuthHelper] Token refresh interval cleared');
};

/**
 * Check if user has valid session
 */
export const hasValidSession = async (): Promise<boolean> => {
    try {
        const token = await tokenService.getToken();
        if (!token) return false;

        const isExpired = await tokenService.isTokenExpired();
        return !isExpired;
    } catch (error) {
        console.error('[AuthHelper] Session check failed:', error);
        return false;
    }
};

