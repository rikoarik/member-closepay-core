/**
 * Config Event Emitter
 * Event emitter untuk notify komponen saat config berubah
 */

import { AppConfig } from '../types/AppConfig';

type ConfigChangeListener = (config: AppConfig) => void;

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
  emit(config: AppConfig): void {
    this.listeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        // Use logger if available, otherwise fallback to console
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.error('[ConfigEventEmitter] Error in listener:', error);
        }
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

