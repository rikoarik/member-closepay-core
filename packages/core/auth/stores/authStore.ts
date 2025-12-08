/**
 * Auth Store menggunakan Zustand
 * State management untuk authentication
 */
import { create } from 'zustand';
import type { User, Company, AuthResponse } from '../types';
import { authService, loginWithNonce as apiLoginWithNonce, logout as apiLogout } from '../services/authService';
import { tokenService } from '../services/tokenService';
import { setupTokenRefreshInterval, clearTokenRefreshInterval } from '../utils/authHelpers';
import { decodeJWT, getJWTUserId, getJWTExpiry, getJWTScopes } from '../utils/jwtUtils';

interface AuthState {
  // State
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  error: string | null;
  refreshIntervalId: number | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  loginWithNonce: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setToken: (token: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  company: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingIn: false,
  error: null,
  refreshIntervalId: null,

  // Login action (mock/old)
  login: async (username: string, password: string) => {
    try {
      set({ isLoggingIn: true, error: null });

      const response: AuthResponse = await authService.login(username, password);

      // Ensure token is saved to storage (should already be saved in authService, but double-check)
      if (response.token) {
        await tokenService.setToken(response.token);
        console.log('[AuthStore] Token saved to storage after login');
      }
      if (response.refreshToken) {
        await tokenService.setRefreshToken(response.refreshToken);
        console.log('[AuthStore] Refresh token saved to storage after login');
      }

      // Setup background token refresh
      const intervalId = setupTokenRefreshInterval();

      set({
        user: response.user,
        company: response.company,
        token: response.token,
        isAuthenticated: true,
        isLoggingIn: false,
        error: null,
        refreshIntervalId: intervalId,
      });
    } catch (error: any) {
      set({
        isLoggingIn: false,
        error: error.message || 'Login failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Login with Basic Auth (Nonce)
  loginWithNonce: async (username: string, password: string) => {
    try {
      set({ isLoggingIn: true, error: null });

      const response = await apiLoginWithNonce(username, password);
      const { access_token, expires_in } = response.data;

      // Ensure token is saved to storage (should already be saved in loginWithNonceAPI, but double-check)
      if (access_token) {
        await tokenService.setToken(access_token);
        console.log('[AuthStore] Token saved to EncryptedStorage after loginWithNonce');
        
        // Extract user info from JWT
        const jwtPayload = decodeJWT(access_token);
        const userId = getJWTUserId(access_token);
        const userScopes = getJWTScopes(access_token);
        
        console.log('[AuthStore] JWT decoded - User ID:', userId, 'Scopes:', userScopes);
        
        // Extract expiry from JWT if expires_in not provided
        if (!expires_in && jwtPayload?.exp) {
          // Calculate expires_in from JWT exp
          const now = Math.floor(Date.now() / 1000); // current time in seconds
          const expiresIn = jwtPayload.exp - now;
          if (expiresIn > 0) {
            await tokenService.setTokenExpiry(expiresIn);
            console.log('[AuthStore] Token expiry extracted from JWT:', expiresIn, 'seconds');
          }
        } else if (expires_in) {
          await tokenService.setTokenExpiry(expires_in);
          console.log('[AuthStore] Token expiry saved after loginWithNonce');
        }
        
        // Use user ID from JWT (sub claim) if available
        const user: User = {
          id: userId || 'user-1',
          username,
          name: 'User', // TODO: Get from API or JWT if available
        };

        const company: Company = {
          id: 'company-1',
          name: 'Merchant Closepay',
          segmentId: 'balance-management',
        };

        // Setup background token refresh
        const intervalId = setupTokenRefreshInterval();

        set({
          user,
          company,
          token: access_token,
          isAuthenticated: true,
          isLoggingIn: false,
          error: null,
          refreshIntervalId: intervalId,
        });
        
        console.log('[AuthStore] Login successful, user authenticated');
      } else {
        throw new Error('No access token received from login');
      }
    } catch (error: any) {
      console.error('[AuthStore] Login failed:', error);
      set({
        isLoggingIn: false,
        error: error.message || 'Login failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    try {
      set({ isLoading: true });

      // Clear refresh interval
      const { refreshIntervalId } = get();
      if (refreshIntervalId) {
        clearTokenRefreshInterval(refreshIntervalId);
      }

      // Call API logout
      await apiLogout();

      // Clear local storage and state
      await tokenService.clearTokens();

      set({
        user: null,
        company: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        refreshIntervalId: null,
      });
    } catch (error: any) {
      console.error('[AuthStore] Logout error:', error);

      // Even if API fails, we should clear local state
      await tokenService.clearTokens();

      set({
        user: null,
        company: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Logout failed',
        refreshIntervalId: null,
      });
    }
  },

  // Set user
  setUser: (user: User) => {
    set({ user });
  },

  // Set company
  setCompany: (company: Company) => {
    set({ company });
  },

  // Set token
  setToken: async (token: string) => {
    try {
      // Save token to storage
      await tokenService.setToken(token);
      set({ token, isAuthenticated: true });
      console.log('[AuthStore] Token set and saved to storage');
    } catch (error) {
      console.error('[AuthStore] Error setting token:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Initialize auth - check if user is already logged in
  initializeAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('[AuthStore] Initializing auth...');

      const token = await tokenService.getToken();
      console.log('[AuthStore] Token retrieved from storage:', token ? 'exists' : 'not found');

      if (token) {
        // Check if token is expired
        const isExpired = await tokenService.isTokenExpired();

        if (isExpired) {
          console.log('[AuthStore] Token expired, trying to refresh...');
          
          // Try to refresh token using refresh token
          const refreshToken = await tokenService.getRefreshToken();
          if (refreshToken) {
            try {
              console.log('[AuthStore] Attempting to refresh token...');
              const newToken = await authService.refreshToken();
              if (newToken) {
                console.log('[AuthStore] Token refreshed successfully');
                // Retry initialization with new token (with guard to prevent infinite loop)
                const currentState = get();
                if (!currentState.isAuthenticated) {
                  return get().initializeAuth();
                }
                return; // Already authenticated, don't retry
              }
            } catch (refreshError: any) {
              console.error('[AuthStore] Token refresh failed:', refreshError);
              // If refresh fails, don't immediately clear tokens
              // Extract user info from JWT and keep authenticated
              // Let axios interceptor handle 401 errors when making actual API calls
              if (
                refreshError?.response?.status === 401 ||
                refreshError?.response?.status === 403
              ) {
                // API explicitly says token invalid - clear tokens
                await tokenService.clearTokens();
                set({
                  isAuthenticated: false,
                  isLoading: false,
                });
                return;
              } else {
                // Network error or refresh not implemented - keep token, extract from JWT
                console.log('[AuthStore] Refresh failed (network/not implemented), using JWT data');
                const userId = getJWTUserId(token);
                const user: User = {
                  id: userId || 'user-1',
                  username: 'user',
                  name: 'User',
                };
                const company: Company = {
                  id: 'company-1',
                  name: 'Merchant Closepay',
                  segmentId: 'balance-management',
                };
                const { refreshIntervalId } = get();
                if (refreshIntervalId) {
                  clearTokenRefreshInterval(refreshIntervalId);
                }
                const intervalId = setupTokenRefreshInterval();
                set({
                  user,
                  company,
                  token,
                  isAuthenticated: true,
                  isLoading: false,
                  refreshIntervalId: intervalId,
                  error: null,
                });
                return;
              }
            }
          } else {
            // No refresh token available - but don't clear token immediately
            // Extract user info from JWT and keep authenticated
            // Let axios interceptor handle 401 when making actual API calls
            console.log('[AuthStore] No refresh token available, using JWT data instead');
            const userId = getJWTUserId(token);
            const user: User = {
              id: userId || 'user-1',
              username: 'user',
              name: 'User',
            };
            const company: Company = {
              id: 'company-1',
              name: 'Merchant Closepay',
              segmentId: 'balance-management',
            };
            const { refreshIntervalId } = get();
            if (refreshIntervalId) {
              clearTokenRefreshInterval(refreshIntervalId);
            }
            const intervalId = setupTokenRefreshInterval();
            set({
              user,
              company,
              token,
              isAuthenticated: true,
              isLoading: false,
              refreshIntervalId: intervalId,
              error: null,
            });
            return;
          }
        }

        // Token is valid, try to get profile to validate token
        try {
          const user = await authService.getProfile();
          console.log('[AuthStore] Profile retrieved successfully');

          // Get company info from storage or API
          // For now, we'll use mock company
          const company = {
            id: 'company-1',
            name: 'Merchant Closepay',
            segmentId: 'balance-management',
          };

          // Clear any existing refresh interval before setting up new one
          const { refreshIntervalId } = get();
          if (refreshIntervalId) {
            clearTokenRefreshInterval(refreshIntervalId);
          }

          // Setup background token refresh for auto-login
          const intervalId = setupTokenRefreshInterval();

          set({
            user,
            company,
            token,
            isAuthenticated: true,
            isLoading: false,
            refreshIntervalId: intervalId,
            error: null,
          });
          
          console.log('[AuthStore] Auth initialized successfully, user authenticated');
        } catch (profileError: any) {
          // Profile fetch failed - token might be invalid
          console.error('[AuthStore] Failed to get profile:', profileError);
          
          // If it's an auth error (401, 403), token is invalid
          if (
            profileError?.response?.status === 401 ||
            profileError?.response?.status === 403 ||
            profileError?.message?.includes('Not authenticated') ||
            profileError?.message?.includes('Unauthorized')
          ) {
            console.log('[AuthStore] Token invalid, trying refresh token...');
            
            // Try refresh token
            const refreshToken = await tokenService.getRefreshToken();
            if (refreshToken) {
              try {
                const newToken = await authService.refreshToken();
                if (newToken) {
                  // Retry initialization with new token (with guard to prevent infinite loop)
                  const currentState = get();
                  if (!currentState.isAuthenticated) {
                    return get().initializeAuth();
                  }
                  return; // Already authenticated, don't retry
                }
              } catch (refreshError) {
                console.error('[AuthStore] Token refresh failed:', refreshError);
              }
            }
            
            // Clear invalid tokens only if refresh also failed
            await tokenService.clearTokens();
            set({
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } else {
            // Network error, getProfile not implemented, or other non-auth error
            // Extract user info from JWT and keep authenticated
            console.log('[AuthStore] Profile fetch failed (non-auth error), using JWT data instead');
            const userId = getJWTUserId(token);
            const user: User = {
              id: userId || 'user-1',
              username: 'user',
              name: 'User',
            };
            const company: Company = {
              id: 'company-1',
              name: 'Merchant Closepay',
              segmentId: 'balance-management',
            };
            const { refreshIntervalId } = get();
            if (refreshIntervalId) {
              clearTokenRefreshInterval(refreshIntervalId);
            }
            const intervalId = setupTokenRefreshInterval();
            set({
              user,
              company,
              token,
              isAuthenticated: true,
              isLoading: false,
              refreshIntervalId: intervalId,
              error: null,
            });
            console.log('[AuthStore] Auth initialized from JWT, user authenticated');
          }
        }
      } else {
        // No token found
        console.log('[AuthStore] No token found, user not authenticated');
        set({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error('[AuthStore] Error initializing auth:', error);
      
      // If initialization fails, don't clear tokens immediately
      // It might be a temporary network issue
      // Only clear if it's a clear auth error
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.includes('Not authenticated')
      ) {
        await tokenService.clearTokens();
      }
      
      set({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));

