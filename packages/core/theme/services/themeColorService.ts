/**
 * Theme Color Service
 * Service untuk manage primary color dengan support:
 * - Development: Dummy service (file-based, realtime)
 * - Production: Backend API dengan smart caching & cooldown
 */

import { configService, axiosInstance } from '@core/config';

type PrimaryColorListener = (color: string | null) => void;

interface ThemeColorServiceOptions {
  /**
   * Mode: 'dummy' untuk development (file-based), 'backend' untuk production
   */
  mode?: 'dummy' | 'backend';
  
  /**
   * Interval untuk polling backend (dalam milliseconds)
   * Default: 5 menit (300000ms) - aman untuk backend
   */
  pollingInterval?: number;
  
  /**
   * Cooldown period untuk prevent terlalu sering request (dalam milliseconds)
   * Default: 30 detik
   */
  cooldownPeriod?: number;
  
  /**
   * Cache expiry time (dalam milliseconds)
   * Default: 5 menit
   */
  cacheExpiry?: number;
}

class ThemeColorService {
  private primaryColor: string | null = '#03AA81'; // Default color
  private listeners: Set<PrimaryColorListener> = new Set();
  private mode: 'dummy' | 'backend' = __DEV__ ? 'dummy' : 'backend';
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;
  private options: Required<ThemeColorServiceOptions> = {
    mode: __DEV__ ? 'dummy' : 'backend',
    pollingInterval: 5 * 60 * 1000, // 5 menit - aman untuk backend
    cooldownPeriod: 30 * 1000, // 30 detik cooldown
    cacheExpiry: 5 * 60 * 1000, // 5 menit cache
  };

  constructor(options?: ThemeColorServiceOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
      this.mode = this.options.mode;
    }
  }

  /**
   * Get current primary color
   */
  getPrimaryColor(): string | null {
    return this.primaryColor;
  }

  /**
   * Set primary color (untuk dummy mode / development)
   * @param color - Hex color string (e.g., '#03AA81', '#FF0000')
   */
  setPrimaryColor(color: string | null): void {
    if (this.mode === 'backend') {
      console.warn('[ThemeColor] setPrimaryColor hanya untuk dummy mode. Gunakan fetchFromBackend() untuk backend mode.');
      return;
    }

    if (this.primaryColor !== color) {
      this.primaryColor = color;
      console.log('[ThemeColor] Primary color updated:', color);
      
      // Notify all listeners
      this.notifyListeners(color);
    }
  }

  /**
   * Fetch primary color dari backend API
   * Dengan smart caching dan cooldown untuk prevent terlalu sering request
   */
  async fetchFromBackend(force: boolean = false): Promise<string | null> {
    if (this.mode === 'dummy') {
      console.warn('[ThemeColor] fetchFromBackend hanya untuk backend mode. Gunakan setPrimaryColor() untuk dummy mode.');
      return this.primaryColor;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - this.lastFetchTime;

    // Cooldown: skip jika baru saja fetch (kecuali force)
    if (!force && timeSinceLastFetch < this.options.cooldownPeriod) {
      const remaining = Math.round((this.options.cooldownPeriod - timeSinceLastFetch) / 1000);
      console.log(`[ThemeColor] Cooldown active (${remaining}s remaining), using cached color`);
      return this.primaryColor;
    }

    // Prevent concurrent fetch
    if (this.isFetching) {
      console.log('[ThemeColor] Fetch already in progress, using cached color');
      return this.primaryColor;
    }

    this.isFetching = true;
    this.lastFetchTime = now;

    try {
      const config = configService.getConfig();
      const companyId = config?.companyId || 'member-base';
      
      // Try primary endpoint first
      try {
        const response = await axiosInstance.get<{ primaryColor: string }>(
          `/theme/primary-color/${companyId}`
        );
        
        if (response.data?.primaryColor) {
          const newColor = response.data.primaryColor;
          if (newColor !== this.primaryColor) {
            this.primaryColor = newColor;
            this.notifyListeners(newColor);
            console.log('[ThemeColor] Primary color fetched from backend:', newColor);
          }
          return newColor;
        }
      } catch (error: any) {
        // Fallback: try config endpoint
        if (error.response?.status !== 404) {
          throw error; // Re-throw jika bukan 404
        }
      }

      // Fallback: try config endpoint
      const configResponse = await axiosInstance.get<{ theme?: { primaryColor?: string } }>(
        `/config/app/${companyId}`
      );
      
      if (configResponse.data?.theme?.primaryColor) {
        const newColor = configResponse.data.theme.primaryColor;
        if (newColor !== this.primaryColor) {
          this.primaryColor = newColor;
          this.notifyListeners(newColor);
          console.log('[ThemeColor] Primary color fetched from config endpoint:', newColor);
        }
        return newColor;
      }

      return this.primaryColor;
    } catch (error: any) {
      console.error('[ThemeColor] Failed to fetch primary color from backend:', error.message);
      // Return cached color on error (don't update)
      return this.primaryColor;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Start polling untuk backend mode
   * Hanya akan start jika mode = 'backend'
   * @param immediate - Jika true, fetch immediately saat start
   */
  startPolling(immediate: boolean = true): void {
    if (this.mode !== 'backend') {
      console.warn('[ThemeColor] startPolling hanya untuk backend mode');
      return;
    }

    if (this.pollingIntervalId) {
      console.log('[ThemeColor] Polling already started');
      return;
    }

    // Fetch immediately saat start jika immediate = true
    if (immediate) {
      this.fetchFromBackend(true);
    }

    // Set interval untuk polling (dengan interval yang aman untuk backend)
    this.pollingIntervalId = setInterval(() => {
      this.fetchFromBackend(false); // Use cache jika masih valid
    }, this.options.pollingInterval);

    console.log(`[ThemeColor] Backend polling started (interval: ${this.options.pollingInterval / 1000}s)`);
  }

  /**
   * Force refresh dari backend (bypass cache & cooldown)
   * Berguna saat admin update warna dan perlu langsung terlihat
   */
  async forceRefresh(): Promise<string | null> {
    console.log('[ThemeColor] Force refreshing from backend...');
    return await this.fetchFromBackend(true);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
      console.log('[ThemeColor] Polling stopped');
    }
  }

  /**
   * Subscribe to primary color changes
   * @param listener - Callback function yang dipanggil saat primary color berubah
   * @returns Unsubscribe function
   */
  subscribe(listener: PrimaryColorListener): () => void {
    this.listeners.add(listener);
    
    // Immediately call listener with current color
    listener(this.primaryColor);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(color: string | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(color);
      } catch (error) {
        console.error('[ThemeColor] Error in listener:', error);
      }
    });
  }

  /**
   * Get jumlah subscribers (untuk debugging)
   */
  getSubscriberCount(): number {
    return this.listeners.size;
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<ThemeColorServiceOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.mode) {
      this.mode = options.mode;
    }
    
    // Restart polling jika interval berubah
    if (options.pollingInterval && this.pollingIntervalId) {
      this.stopPolling();
      this.startPolling();
    }
  }
}

// Export singleton instance
export const themeColorService = new ThemeColorService();

// Expose ke global untuk development (hanya untuk dummy mode)
if (__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires
    const globalObj = require('react-native').NativeModules?.PlatformConstants || (globalThis as any);
    if (globalObj) {
      (globalThis as any).themeColorService = themeColorService;
      console.log('[ThemeColor] Service available at global.themeColorService');
      console.log('[ThemeColor] Usage (dummy mode): global.themeColorService.setPrimaryColor("#FF0000")');
      console.log('[ThemeColor] Usage (backend mode): global.themeColorService.forceRefresh()');
    }
  } catch (error) {
    // Ignore jika global tidak tersedia
  }
}

