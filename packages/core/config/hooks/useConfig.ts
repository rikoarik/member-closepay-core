/**
 * useConfig Hook
 * Reactive config hook - auto-update saat config berubah via event emitter
 */
import { useState, useEffect, useCallback } from 'react';
import { configService } from '../services/configService';
import { configEventEmitter } from '../utils/configEventEmitter';
import type { AppConfig } from '../types/AppConfig';

export interface UseConfigOptions {
  // Options untuk future use
}

export interface UseConfigReturn {
  config: AppConfig | null;
  refreshConfig: () => Promise<void>;
}

/**
 * Hook untuk mendapatkan config dengan reactive updates
 * Auto-update saat config berubah via event emitter
 */
export function useConfig(_options?: UseConfigOptions): UseConfigReturn {
  // State untuk reactive config
  const [config, setConfig] = useState<AppConfig | null>(() => configService.getConfig());

  // Subscribe ke config change events
  useEffect(() => {
    // Set initial config
    setConfig(configService.getConfig());

    // Subscribe ke event emitter
    const unsubscribe = configEventEmitter.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Manual refresh function
  const refreshConfig = useCallback(async (): Promise<void> => {
    try {
      await configService.refreshConfig();
      // Config akan auto-update via event emitter
    } catch (error) {
      console.error('[useConfig] Failed to refresh config:', error);
      // Error sudah di-handle di configService, tidak throw
    }
  }, []);

  return {
    config,
    refreshConfig,
  };
}

