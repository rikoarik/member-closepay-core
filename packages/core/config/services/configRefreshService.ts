/**
 * Config Refresh Service
 * Background service untuk auto-refresh config dari backend
 * Auto-update semua komponen saat config berubah
 */

import { configService } from './configService';
import { AppConfig } from '../types/AppConfig';

export interface ConfigRefreshOptions {
  /**
   * Interval untuk auto-refresh (dalam milliseconds)
   * Default: 5 menit (300000ms)
   */
  refreshInterval?: number;
  
  /**
   * Enable auto-refresh (default: true)
   */
  enabled?: boolean;
  
  /**
   * Callback saat config berhasil di-refresh
   */
  onConfigUpdated?: (config: AppConfig) => void;
  
  /**
   * Callback saat refresh error
   */
  onError?: (error: Error) => void;
}

class ConfigRefreshServiceImpl {
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;
  private lastRefreshTime: number = 0;
  private cooldownPeriod: number = 2000; // 2 detik cooldown
  private options: Required<ConfigRefreshOptions> = {
    refreshInterval: 5 * 60 * 1000, // 5 menit default
    enabled: true,
    onConfigUpdated: () => {},
    onError: () => {},
  };

  /**
   * Start auto-refresh config dari backend
   */
  start(options?: ConfigRefreshOptions): void {
    // Merge options
    this.options = {
      ...this.options,
      ...options,
    };

    if (!this.options.enabled) {
      return;
    }

    // Stop existing interval jika ada
    this.stop();

    // Refresh immediately saat start
    this.refresh();

    // Set interval untuk auto-refresh
    this.refreshIntervalId = setInterval(() => {
      this.refresh();
    }, this.options.refreshInterval);

    console.log(`[ConfigRefresh] Auto-refresh started (interval: ${this.options.refreshInterval}ms)`);
  }

  /**
   * Stop auto-refresh
   */
  stop(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      console.log('[ConfigRefresh] Auto-refresh stopped');
    }
  }

  /**
   * Manual refresh config dari backend
   * Bisa dipanggil dari pull-to-refresh atau button
   * @param force - Force refresh meskipun dalam cooldown atau cache masih valid
   */
  async refresh(force: boolean = false): Promise<AppConfig | null> {
    // Cooldown: skip jika baru saja refresh (kecuali force)
    const now = Date.now();
    const timeSinceLastRefresh = now - this.lastRefreshTime;
    
    if (!force && timeSinceLastRefresh < this.cooldownPeriod) {
      const remaining = Math.round((this.cooldownPeriod - timeSinceLastRefresh) / 1000);
      console.log(`[ConfigRefresh] Cooldown active (${remaining}s remaining), returning cached config`);
      return configService.getConfig();
    }

    // Prevent concurrent refresh
    if (this.isRefreshing) {
      console.log('[ConfigRefresh] Refresh already in progress, returning cached config');
      return configService.getConfig();
    }

    this.isRefreshing = true;
    this.lastRefreshTime = now;

    try {
      // Refresh dari backend (dengan force untuk bypass cache jika diperlukan)
      await configService.refreshConfig(force);

      // Get updated config
      const newConfig = configService.getConfig();

      // Check jika ada perubahan
      if (newConfig) {
        console.log('[ConfigRefresh] Config updated from backend');
      }

      // Callback
      if (newConfig) {
        this.options.onConfigUpdated(newConfig);
      }

      return newConfig;
    } catch (error) {
      const err = error as Error;
      console.error('[ConfigRefresh] Failed to refresh config:', err.message);
      this.options.onError(err);
      // Return cached config on error (jangan return null)
      return configService.getConfig();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check apakah sedang refresh
   */
  isRefreshingNow(): boolean {
    return this.isRefreshing;
  }

  /**
   * Update refresh interval
   */
  setInterval(interval: number): void {
    this.options.refreshInterval = interval;
    
    // Restart dengan interval baru
    if (this.refreshIntervalId) {
      this.stop();
      this.start(this.options);
    }
  }

  /**
   * Enable/disable auto-refresh
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    
    if (enabled && !this.refreshIntervalId) {
      this.start(this.options);
    } else if (!enabled && this.refreshIntervalId) {
      this.stop();
    }
  }
}

export const configRefreshService = new ConfigRefreshServiceImpl();

