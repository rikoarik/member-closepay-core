/**
 * useToken Hook
 * Hook untuk mengakses token management
 */
import { useState, useEffect } from 'react';
import { tokenService } from '../services/tokenService';

export const useToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens on mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const [accessToken, refresh] = await Promise.all([
          tokenService.getToken(),
          tokenService.getRefreshToken(),
        ]);
        setToken(accessToken);
        setRefreshToken(refresh);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const updateToken = async (newToken: string) => {
    await tokenService.setToken(newToken);
    setToken(newToken);
  };

  const updateRefreshToken = async (newRefreshToken: string) => {
    await tokenService.setRefreshToken(newRefreshToken);
    setRefreshToken(newRefreshToken);
  };

  const clearTokens = async () => {
    await tokenService.clearTokens();
    setToken(null);
    setRefreshToken(null);
  };

  return {
    token,
    refreshToken,
    isLoading,
    updateToken,
    updateRefreshToken,
    clearTokens,
  };
};

