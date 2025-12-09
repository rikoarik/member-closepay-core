/**
 * Auth Service
 * Unified AuthService dengan support untuk mock dan real API
 * Uses environment-based switch untuk determine implementation
 */
import type { AuthService, AuthResponse, User, MetadataResponse, TagItem, SignUpData, SignUpResponse } from '../types';
import { tokenService } from './tokenService';
import { configService, axiosInstance } from '@core/config';
import { encode as base64Encode } from 'base-64';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

/**
 * Interface untuk response login (real API)
 */
export interface LoginResponse {
    status_code: number;
    type: string;
    message: string;
    data: {
        token_type: string;
        access_token: string;
        expires_in: number;
    };
}

/**
 * Generate random string untuk nonce
 */
export const generateRandomString = (length: number = 20): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

/**
 * Encode credentials ke Base64 untuk Basic Auth
 */
export const encodeCredentials = (username: string, password: string): string => {
    const credentials = `${username}:${password}`;
    return base64Encode(credentials);
};

/**
 * Real API: Login dengan Basic Auth (Nonce)
 */
const loginWithNonceAPI = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        // Generate random nonce
        const randomNonce = generateRandomString(20);
        console.log('[AuthService] Generated nonce:', randomNonce);

        // Encode credentials to Base64
        const base64Credentials = encodeCredentials(username, password);

        const response = await axiosInstance.post<LoginResponse>(
            '/auth/account/login',
            {
                nonce: randomNonce,
            },
            {
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                },
            }
        );

        // Save tokens and expiry to storage
        const { access_token, expires_in } = response.data.data;
        await tokenService.setToken(access_token);
        await tokenService.setTokenExpiry(expires_in);

        console.log('[AuthService] Login successful, token saved');

        return response.data;
    } catch (error: any) {
        console.error('[AuthService] Login failed:', error);

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw new Error(`Login gagal: ${error.message || 'Unknown error'}`);
    }
};

/**
 * Real API: Logout
 */
const logoutAPI = async (): Promise<any> => {
    try {
        const response = await axiosInstance.delete('/auth/account/revoke');
        console.log('[AuthService] Logout successful');
        return response.data;
    } catch (error: any) {
        console.error('[AuthService] Logout failed:', error);
        throw error;
    }
};

// Export for use in authStore
export const loginWithNonce = loginWithNonceAPI;
export const logout = logoutAPI;

// ============================================================================
// MOCK IMPLEMENTATION (for development/testing)
// ============================================================================

// Mock user data untuk development
const MOCK_USERS = [
  {
    id: '1',
    username: 'merchant1',
    password: 'password123',
    email: 'merchant1@closepay.com',
    name: 'Merchant Test',
    role: 'merchant',
    permissions: ['read', 'write'],
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    email: 'admin@closepay.com',
    name: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'admin'],
  },
];

const MOCK_COMPANY = {
  id: 'company-1',
  name: 'Merchant Closepay',
  segmentId: 'balance-management',
  config: {},
};

/**
 * Simulate API delay
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

/**
 * Mock API service untuk login
 */
const mockLoginAPI = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  // Simulate network delay
  await delay(1000);

  // Support both username and email (extract username from email if needed)
  const loginUsername = username.includes('@') 
    ? username.split('@')[0] 
    : username;

  // Find user
  const user = MOCK_USERS.find(
    u => u.username === loginUsername && u.password === password,
  );

  if (!user) {
    throw new Error('Invalid email atau password');
  }

  // Generate mock tokens
  const token = `mock_token_${user.id}_${Date.now()}`;
  const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

  // Return auth response
  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
    company: MOCK_COMPANY,
  };
};

/**
 * Mock API service untuk get profile
 */
const mockGetProfileAPI = async (): Promise<User> => {
  await delay(500);
  const token = await tokenService.getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  // Extract user ID from token (mock)
  const userId = token.split('_')[2] || '1';
  const user = MOCK_USERS.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
};

/**
 * Mock API service untuk refresh token
 */
const mockRefreshTokenAPI = async (): Promise<string> => {
  await delay(500);
  const refreshToken = await tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Generate new token
  const newToken = `mock_token_refreshed_${Date.now()}`;
  return newToken;
};

// ============================================================================
// UNIFIED AUTH SERVICE
// ============================================================================

/**
 * Determine if should use mock based on config or environment
 */
const shouldUseMock = (): boolean => {
  const config = configService.getConfig();
  const useMock = config?.services?.auth?.useMock ?? false;
  return useMock || (__DEV__ && false); // Default to real API even in dev
};

export const authService: AuthService = {
  /**
   * Login dengan username dan password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      if (shouldUseMock()) {
        const response = await mockLoginAPI(username, password);
        // Save tokens to storage
        await tokenService.setToken(response.token);
        await tokenService.setRefreshToken(response.refreshToken);
        return response;
      } else {
        // Use real API (nonce-based login)
        const response = await loginWithNonceAPI(username, password);
        // Token already saved in loginWithNonceAPI
        // Convert to AuthResponse format
        return {
          token: response.data.access_token,
          refreshToken: '', // TODO: Get from response if available
          user: {
            id: 'user-1', // TODO: Get from API response
            username,
            name: 'User', // TODO: Get from API response
          },
          company: {
            id: 'company-1', // TODO: Get from API response
            name: 'Merchant Closepay',
            segmentId: 'balance-management',
          },
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout - clear tokens
   */
  async logout(): Promise<void> {
    try {
      if (!shouldUseMock()) {
        // Call real API logout
        await logoutAPI();
      }
      // Always clear tokens
      await tokenService.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear tokens
      await tokenService.clearTokens();
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    try {
      if (shouldUseMock()) {
        return await mockGetProfileAPI();
      } else {
        // TODO: Implement real API call to get profile
        // For now, return basic user info
        const token = await tokenService.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        return {
          id: 'user-1',
          username: 'user',
          name: 'User',
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      if (shouldUseMock()) {
        const newToken = await mockRefreshTokenAPI();
        await tokenService.setToken(newToken);
        return newToken;
      } else {
        // TODO: Implement real API refresh token call
        // For now, throw error
        throw new Error('Token refresh not implemented for real API');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear tokens if refresh fails
      await tokenService.clearTokens();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // This is a synchronous check, so we'll use a simple approach
    // In a real app, you might want to check token expiry
    // For now, we'll check if token exists in storage synchronously
    // Note: AsyncStorage.getItem is async, so this is a simplified check
    // In production, you'd want to check token validity and expiry
    return true; // Will be properly implemented with token check
  },

  /**
   * Get metadata for sign up form
   */
  async getSignUpMetadata(companyId: string, userType: string = 'MEMBER'): Promise<MetadataResponse> {
    try {
      const response = await axiosInstance.get<MetadataResponse>(
        `user/info/company/metadata/get?companyId=${companyId}&userType=${userType}`
      );
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Get metadata error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get metadata');
    }
  },

  /**
   * Get tags for sign up
   */
  async getSignUpTags(companyId: string): Promise<TagItem[]> {
    try {
      const response = await axiosInstance.get<{ data: TagItem[] }>(
        `user/info/company/tags/register/${companyId}`
      );
      return response.data.data.filter((tag) => tag.isSelfRegisterSupported);
    } catch (error: any) {
      console.error('[AuthService] Get tags error:', error);
      return [];
    }
  },

  /**
   * Register new user
   */
  async register(data: SignUpData, otp?: string): Promise<SignUpResponse> {
    try {
      const headers: Record<string, string> = {};
      if (otp) {
        headers['Otp-Security-Code'] = otp;
      }

      const response = await axiosInstance.post<SignUpResponse>(
        'user/account/member/register',
        {
          ...data,
          otp: otp || null,
        },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Send OTP for forgot password
   */
  async sendForgotPasswordOtp(email: string): Promise<void> {
    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/send-otp',
        { email }
      );
      console.log('[AuthService] Send forgot password OTP successful');
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Send forgot password OTP error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  /**
   * Verify OTP for forgot password
   */
  async verifyForgotPasswordOtp(email: string, otp: string): Promise<void> {
    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/verify-otp',
        { email, otp }
      );
      console.log('[AuthService] Verify forgot password OTP successful');
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Verify forgot password OTP error:', error);
      throw new Error(error.response?.data?.message || 'Invalid OTP');
    }
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/reset',
        { email, otp, newPassword }
      );
      console.log('[AuthService] Reset password successful');
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Reset password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },
};
