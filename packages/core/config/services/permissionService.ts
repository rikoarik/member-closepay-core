/**
 * Permission Service
 * Service untuk handle permissions (notifications, camera, location)
 */

import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionResult {
  status: PermissionStatus;
  message?: string;
}

class PermissionService {
  /**
   * Get POST_NOTIFICATIONS permission constant
   * Fallback to string literal if constant not available
   */
  private getPostNotificationsPermission(): any {
    return (
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS ||
      'android.permission.POST_NOTIFICATIONS'
    );
  }

  /**
   * Check notification permission status
   */
  async checkNotificationPermission(): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Permission check handled by native module
        return 'granted';
      }

      if (Platform.OS === 'android') {
        // Android 13+ (API 33+): Check notification permission
        if (Number(Platform.Version) >= 33) {
          try {
            const permission = this.getPostNotificationsPermission();
            const checkResult = await PermissionsAndroid.check(permission);
            return checkResult ? 'granted' : 'denied';
          } catch (error) {
            console.warn('Error checking notification permission:', error);
            return 'unavailable';
          }
        }
        // Android < 13: Notifications granted by default
        return 'granted';
      }

      return 'unavailable';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return 'unavailable';
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<PermissionResult> {
    try {
      // iOS: Request notification permission
      if (Platform.OS === 'ios') {
        // Note: Untuk iOS, biasanya menggunakan react-native-permissions atau native module
        // Di sini kita return granted untuk sementara, implementasi native bisa ditambahkan nanti
        return { status: 'granted' };
      }

      // Android: Request notification permission (Android 13+)
      if (Platform.OS === 'android') {
        const androidVersion = Number(Platform.Version);
        
        // Android 13+ (API 33+): Need to request permission
        if (androidVersion >= 33) {
          try {
            // Check current permission status first
            const currentStatus = await this.checkNotificationPermission();
            if (currentStatus === 'granted') {
              return { status: 'granted' };
            }

            // Get permission constant (with fallback)
            const permission = this.getPostNotificationsPermission();

            // Request permission
            const granted = await PermissionsAndroid.request(permission);
            
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              return { status: 'granted' };
            } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              return { status: 'blocked' };
            } else {
              return { status: 'denied' };
            }
          } catch (error: any) {
            console.error('Error requesting notification permission:', error);
            // Return denied instead of unavailable to allow retry
            return { 
              status: 'denied', 
              message: error?.message || 'Failed to request notification permission' 
            };
          }
        }

        // Android < 13: Notifications granted by default
        return { status: 'granted' };
      }

      return { status: 'unavailable', message: 'Platform not supported' };
    } catch (error: any) {
      console.error('Error requesting notification permission:', error);
      return { 
        status: 'unavailable', 
        message: error?.message || 'Failed to request notification permission' 
      };
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'android') {
        // Always request permission (will show dialog if not granted)
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return { status: 'granted' };
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return { status: 'blocked' };
        } else {
          return { status: 'denied' };
        }
      }

      // iOS: Camera permission handled by native module
      // Return granted for now, native implementation can be added later
      return { status: 'granted' };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return { status: 'unavailable', message: 'Failed to request camera permission' };
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'android') {
        // Always request permission (will show dialog if not granted)
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return { status: 'granted' };
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return { status: 'blocked' };
        } else {
          return { status: 'denied' };
        }
      }

      // iOS: Location permission handled by native module
      // Return granted for now, native implementation can be added later
      return { status: 'granted' };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { status: 'unavailable', message: 'Failed to request location permission' };
    }
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }

  /**
   * Show alert for blocked permission
   */
  showPermissionBlockedAlert(
    permissionName: string,
    onOpenSettings?: () => void,
  ): void {
    Alert.alert(
      'Izin Diperlukan',
      `Akses ${permissionName} diperlukan untuk menggunakan fitur ini. Silakan aktifkan di Pengaturan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Buka Pengaturan',
          onPress: () => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              this.openSettings();
            }
          },
        },
      ],
    );
  }
}

export const permissionService = new PermissionService();

