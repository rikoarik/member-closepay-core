/**
 * Config Event Emitter
 * Event emitter untuk notify komponen saat config berubah
 */

type ConfigChangeListener = (config: any) => void;

class ConfigEventEmitter {
  private listeners: Set<ConfigChangeListener> = new Set();

  /**
   * Subscribe ke config change events
   * @param listener - Callback function yang dipanggil saat config berubah
   * @returns Unsubscribe function
   */
  subscribe(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit config change event ke semua subscribers
   * @param config - Config yang baru
   */
  emit(config: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        console.error('[ConfigEventEmitter] Error in listener:', error);
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
   * Clear semua listeners (untuk cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }
}

export const configEventEmitter = new ConfigEventEmitter();

