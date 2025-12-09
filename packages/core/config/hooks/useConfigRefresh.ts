/**
 * useConfigRefresh Hook
 * Hook untuk manual refresh config dari backend
 */

import { useState, useCallback } from 'react';
import { configRefreshService } from '../services/configRefreshService';
import type { AppConfig } from '../types/AppConfig';

export interface UseConfigRefreshReturn {
  /**
   * Manual refresh config dari backend
   * @param force - Force refresh meskipun dalam cooldown atau cache masih valid
   */
  refresh: (force?: boolean) => Promise<AppConfig | null>;
  
  /**
   * Apakah sedang refresh
   */
  isRefreshing: boolean;
  
  /**
   * Error saat refresh (jika ada)
   */
  error: Error | null;
}

/**
 * Hook untuk manual refresh config dari backend
 * Berguna untuk pull-to-refresh atau button refresh
 */
export function useConfigRefresh(): UseConfigRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (force: boolean = false): Promise<AppConfig | null> => {
    setIsRefreshing(true);
    setError(null);

    try {
      const config = await configRefreshService.refresh(force);
      return config;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    refresh,
    isRefreshing,
    error,
  };
}

