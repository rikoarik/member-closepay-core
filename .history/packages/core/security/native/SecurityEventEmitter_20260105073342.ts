import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface SecurityNativeModuleInterface {
  initialize(): Promise<boolean>;
  isInitialized(): Promise<boolean>;
}

const { SecurityNativeModule } = NativeModules;

/**
 * Security Event Emitter
 * 
 * Wrapper for native security module event communication.
 * Handles threat detection events from native layer.
 */
class SecurityEventEmitter extends NativeEventEmitter {
  private static instance: SecurityEventEmitter | null = null;

  constructor() {
    super(SecurityNativeModule || undefined);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SecurityEventEmitter {
    if (!SecurityEventEmitter.instance) {
      SecurityEventEmitter.instance = new SecurityEventEmitter();
    }
    return SecurityEventEmitter.instance;
  }

  /**
   * Initialize security module
   */
  async initialize(): Promise<boolean> {
    if (!SecurityNativeModule) {
      if (__DEV__) {
        console.warn('[SecurityEventEmitter] Native module not available');
      }
      return false;
    }

    try {
      return await SecurityNativeModule.initialize();
    } catch (error) {
      if (__DEV__) {
        console.warn('[SecurityEventEmitter] Failed to initialize:', error);
      }
      return false;
    }
  }

  /**
   * Check if security is initialized
   */
  async isInitialized(): Promise<boolean> {
    if (!SecurityNativeModule) {
      return false;
    }

    try {
      return await SecurityNativeModule.isInitialized();
    } catch (error) {
      return false;
    }
  }
}

/**
 * Threat detection event type
 */
export interface ThreatDetectedEvent {
  threatType: string;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Get security event emitter instance
 */
export const securityEmitter = SecurityEventEmitter.getInstance();

/**
 * Event names
 */
export const SECURITY_EVENTS = {
  THREAT_DETECTED: 'ThreatDetected',
} as const;
