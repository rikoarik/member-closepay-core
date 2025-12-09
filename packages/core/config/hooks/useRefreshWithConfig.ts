/**
 * useRefreshWithConfig Hook
 * Hook untuk wrap refresh function dengan auto-refresh config
 * Setiap pull-to-refresh akan otomatis refresh config juga
 */

import { useState, useCallback } from 'react';
import { configService } from '../services/configService';
import { configRefreshService } from '../services/configRefreshService';

export interface UseRefreshWithConfigOptions {
  /**
   * Custom refresh function yang akan dipanggil setelah config refresh
   */
  onRefresh?: () => void | Promise<void>;
  
  /**
   * Enable auto-refresh config (default: true)
   */
  enableConfigRefresh?: boolean;
  
  /**
   * Force refresh config (bypass cache dan cooldown)
   */
  forceConfigRefresh?: boolean;
}

export interface UseRefreshWithConfigReturn {
  /**
   * Wrapped refresh function yang otomatis refresh config
   */
  refresh: () => Promise<void>;
  
  /**
   * Apakah sedang refresh
   */
  isRefreshing: boolean;
}

/**
 * Hook untuk wrap refresh function dengan auto-refresh config
 * Setiap pull-to-refresh akan otomatis refresh config juga
 */
export function useRefreshWithConfig(
  options: UseRefreshWithConfigOptions = {}
): UseRefreshWithConfigReturn {
  const { onRefresh, enableConfigRefresh = true, forceConfigRefresh = false } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);

    try {
      // 1. Refresh config dulu (dari backend dengan cache & cooldown)
      if (enableConfigRefresh) {
        // Refresh dari backend (dengan cache & cooldown untuk efisiensi)
        // Di development, jika file config berubah, akan terdeteksi oleh polling di index.tsx
        await configRefreshService.refresh(forceConfigRefresh);
      }

      // 2. Lalu panggil custom refresh function (jika ada)
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('[useRefreshWithConfig] Refresh error:', error);
      // Tetap panggil onRefresh meskipun config refresh error
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, enableConfigRefresh, forceConfigRefresh]);

  return {
    refresh,
    isRefreshing,
  };
}

