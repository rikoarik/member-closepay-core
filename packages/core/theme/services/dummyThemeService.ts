/**
 * Dummy Theme Service
 * Service untuk manage primary color secara dummy (untuk development)
 * Bisa di-update secara realtime tanpa perlu fetch dari backend
 */

type PrimaryColorListener = (color: string | null) => void;

class DummyThemeService {
  private primaryColor: string | null = '#03AA81'; // Default color
  private listeners: Set<PrimaryColorListener> = new Set();

  /**
   * Get current primary color
   */
  getPrimaryColor(): string | null {
    return this.primaryColor;
  }

  /**
   * Set primary color (untuk development/testing)
   * @param color - Hex color string (e.g., '#03AA81', '#FF0000')
   */
  setPrimaryColor(color: string | null): void {
    if (this.primaryColor !== color) {
      this.primaryColor = color;
      console.log('[DummyTheme] Primary color updated:', color);
      
      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(color);
        } catch (error) {
          console.error('[DummyTheme] Error in listener:', error);
        }
      });
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
   * Get jumlah subscribers (untuk debugging)
   */
  getSubscriberCount(): number {
    return this.listeners.size;
  }
}

export const dummyThemeService = new DummyThemeService();

// Expose ke global untuk bisa di-update dari console atau dev tools
if (__DEV__ && typeof global !== 'undefined') {
  (global as any).dummyThemeService = dummyThemeService;
  console.log('[DummyTheme] Service available at global.dummyThemeService');
  console.log('[DummyTheme] Usage: global.dummyThemeService.setPrimaryColor("#FF0000")');
}

