/**
 * NFC & Bluetooth Service
 * Service untuk handle NFC card reading dan Bluetooth communication
 */
import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Linking } from 'react-native';

// Initialize BLE Manager
const bleManager = new BleManager();

export interface NFCCardData {
  cardName: string;
  memberName: string;
  memberId: string; // DEC (card identifier) - primary identifier
  balance: number;
  email: string;
  phone: string;
  address: string;
  // Additional fields from Kotlin implementation
  tagId?: string; // Raw tag ID in hex format
  dec?: string; // DEC code extracted from tag
  technologies?: string[]; // Supported NFC technologies
  ndefMessage?: string; // Parsed NDEF message
  payloadType?: string; // Type of payload (Text, URI, etc.)
  isNdefFormatted?: boolean;
}

export interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

// Configuration for NFC Bluetooth devices
const NFC_BLUETOOTH_CONFIG = {
  // Service UUID for NFC Bluetooth devices (placeholder - can be customized)
  SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  // Characteristic UUID for reading card data (placeholder - can be customized)
  READ_CHARACTERISTIC_UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
  // Characteristic UUID for writing commands (placeholder - can be customized)
  WRITE_CHARACTERISTIC_UUID: '0000fff2-0000-1000-8000-00805f9b34fb',
  // Device name patterns to filter NFC Bluetooth devices
  DEVICE_NAME_PATTERNS: ['NFC', 'nfc', 'Nfc', 'Card Reader', 'CardReader'],
  // Connection timeout in milliseconds
  CONNECTION_TIMEOUT: 10000,
  // Read timeout in milliseconds
  READ_TIMEOUT: 5000,
};

class NFCBluetoothService {
  private isNfcEnabled: boolean = false;
  private isBluetoothEnabled: boolean = false;
  private scanningTimeout: NodeJS.Timeout | null = null;
  private nfcListenerActive: boolean = false;
  private nfcTagHandler: ((tag: any) => void) | null = null;
  private connectedBluetoothDevice: Device | null = null;
  private bluetoothDeviceListener: any = null;
  private nfcInitialized: boolean = false;

  /**
   * Initialize NFC Manager (must be called before using NFC)
   */
  async initializeNFC(): Promise<void> {
    if (this.nfcInitialized) {
      return;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.warn('NFC is not supported on this device');
        return;
      }

      await NfcManager.start();
      this.nfcInitialized = true;
      console.log('NFC Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing NFC Manager:', error);
      this.nfcInitialized = false;
      throw error;
    }
  }

  /**
   * Check if NFC is supported
   */
  async isNFCSupported(): Promise<boolean> {
    try {
      // Ensure NFC is initialized first
      if (!this.nfcInitialized) {
        await this.initializeNFC();
      }
      return await NfcManager.isSupported();
    } catch (error) {
      console.error('Error checking NFC support:', error);
      return false;
    }
  }

  /**
   * Check if NFC is enabled
   */
  async isNFCEnabled(): Promise<boolean> {
    try {
      // Ensure NFC is initialized first
      if (!this.nfcInitialized) {
        await this.initializeNFC();
      }
      this.isNfcEnabled = await NfcManager.isEnabled();
      return this.isNfcEnabled;
    } catch (error) {
      console.error('Error checking NFC enabled:', error);
      return false;
    }
  }

  /**
   * Request NFC permission (Android)
   * Note: NFC doesn't require runtime permission in Android.
   * It only needs to be declared in AndroidManifest.xml.
   */
  async requestNFCPermission(): Promise<boolean> {
    // NFC doesn't require runtime permission in Android
    // It's handled automatically by the system when declared in manifest
    return true;
  }

  /**
   * Check NFC health and availability
   * Returns 'available' if NFC is working, 'unavailable' if not supported/disabled, 'broken' if hardware issue
   */
  async checkNFCHealth(): Promise<'available' | 'unavailable' | 'broken'> {
    try {
      // Initialize NFC first
      await this.initializeNFC();

      // Check if NFC is supported
      const supported = await this.isNFCSupported();
      if (!supported) {
        return 'unavailable';
      }

      // Check if NFC is enabled
      const enabled = await this.isNFCEnabled();
      if (!enabled) {
        return 'unavailable';
      }

      // Try to request technology with timeout to check if NFC hardware is working
      // Don't actually test with requestTechnology as it requires user interaction
      // Just check if NFC is ready
      return 'available';
    } catch (error) {
      console.error('Error checking NFC health:', error);
      return 'unavailable';
    }
  }

  /**
   * Read NFC Card (one-time read)
   */
  async readNFCCard(): Promise<NFCCardData | null> {
    try {
      // Initialize NFC first
      await this.initializeNFC();

      // Stop any active listener first
      if (this.nfcListenerActive) {
        await this.stopNFCListener();
      }

      // Check if NFC is supported
      const supported = await this.isNFCSupported();
      if (!supported) {
        throw new Error('NFC tidak didukung pada perangkat ini');
      }

      // Check if NFC is enabled
      const enabled = await this.isNFCEnabled();
      if (!enabled) {
        throw new Error('NFC tidak aktif. Silakan aktifkan NFC di pengaturan perangkat.');
      }

      // Request permission
      const hasPermission = await this.requestNFCPermission();
      if (!hasPermission) {
        throw new Error('NFC permission denied');
      }

      // Try different NFC technologies in order of preference
      const technologies = [NfcTech.Ndef, NfcTech.NfcA, NfcTech.NfcB, NfcTech.NfcF];
      let tag: any = null;
      let usedTech: NfcTech | null = null;

      for (const tech of technologies) {
        try {
          console.log(`Trying NFC technology: ${tech}`);
          await NfcManager.requestTechnology(tech, {
            alertMessage: 'Tempelkan kartu pada bagian belakang smartphone',
            invalidateAfterFirstRead: false,
          });
          usedTech = tech;
          tag = await NfcManager.getTag();
          if (tag) {
            console.log(`Successfully read tag with ${tech}`);
            break;
          }
        } catch (techError: any) {
          console.log(`Failed to read with ${tech}:`, techError?.message);
          // Try next technology
          await NfcManager.cancelTechnologyRequest().catch(() => {});
          continue;
        }
      }

      // Cancel technology request
      await NfcManager.cancelTechnologyRequest().catch(() => {});

      if (!tag) {
        throw new Error('Tidak ada kartu terdeteksi. Pastikan kartu ditempelkan dengan benar.');
      }

      // Process tag using improved parsing (based on Kotlin implementation)
      const tagInfo = this.processTag(tag);
      
      // Extract DEC (card identifier) - primary identifier for API calls
      const dec = this.extractDec(tag, tagInfo.ndefMessage, tagInfo.tagId);
      
      // Build card data
      let cardData: NFCCardData | null = null;

      if (dec) {
        cardData = {
          cardName: 'KARTU GADAI',
          memberName: 'MEMBER',
          memberId: dec, // Use DEC as primary member ID
          balance: 0,
          email: '',
          phone: '',
          address: '',
          tagId: tagInfo.tagId,
          dec: dec || undefined,
          technologies: tagInfo.technologies,
          ndefMessage: tagInfo.ndefMessage || undefined,
          payloadType: tagInfo.payloadType || undefined,
          isNdefFormatted: tagInfo.isNdefFormatted,
        };
      } else if (tagInfo.tagId) {
        // Fallback: use formatted tag ID
        cardData = {
          cardName: 'KARTU GADAI',
          memberName: 'MEMBER',
          memberId: this.formatTagIdAsDec(tagInfo.tagId),
          balance: 0,
          email: '',
          phone: '',
          address: '',
          tagId: tagInfo.tagId,
          technologies: tagInfo.technologies,
        };
      }

      return cardData || null;
    } catch (error: any) {
      console.error('Error reading NFC card:', error);
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      
      // Provide user-friendly error messages
      if (error?.name === 'UserCancel' || error?.message?.includes('UserCancel')) {
        throw new Error('Operasi NFC dibatalkan');
      }
      if (error?.message?.includes('tidak didukung')) {
        throw error;
      }
      if (error?.message?.includes('tidak aktif')) {
        throw error;
      }
      
      throw error;
    }
  }

  /**
   * Start listening for NFC tags (continuous listening)
   * Uses event-based listening with registerTagEvent for better reliability
   */
  async startNFCListener(
    onCardDetected: (cardData: NFCCardData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Initialize NFC first
      await this.initializeNFC();

      // Stop any existing listener first
      if (this.nfcListenerActive) {
        await this.stopNFCListener();
      }

      const supported = await this.isNFCSupported();
      if (!supported) {
        throw new Error('NFC tidak didukung pada perangkat ini');
      }

      const enabled = await this.isNFCEnabled();
      if (!enabled) {
        const error = new Error('NFC tidak aktif. Silakan aktifkan NFC di pengaturan perangkat.');
        (error as any).code = 'NFC_NOT_ENABLED';
        throw error;
      }

      // Mark listener as active
      this.nfcListenerActive = true;

      console.log('Starting NFC listener...');

      // Use event-based listening with registerTagEvent
      // This is more reliable than polling with requestTechnology
      // First, set up event listeners
      NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: any) => {
        console.log('NFC tag discovered:', tag ? 'tag found' : 'null tag');
        // Check if listener is still active
        if (!this.nfcListenerActive) {
          return;
        }

        // Check if tag is null or undefined (error case)
        if (!tag) {
          // Tag is null/undefined, but continue listening
          return;
        }

        try {
          // Process tag using improved parsing (based on Kotlin implementation)
          const tagInfo = this.processTag(tag);
          
          // Extract DEC (card identifier) - primary identifier for API calls
          const dec = this.extractDec(tag, tagInfo.ndefMessage, tagInfo.tagId);
          
          // Build card data
          let cardData: NFCCardData | null = null;

          if (dec) {
            cardData = {
              cardName: 'KARTU GADAI',
              memberName: 'MEMBER',
              memberId: dec, // Use DEC as primary member ID
              balance: 0,
              email: '',
              phone: '',
              address: '',
              tagId: tagInfo.tagId,
              dec: dec || undefined,
              technologies: tagInfo.technologies,
              ndefMessage: tagInfo.ndefMessage || undefined,
              payloadType: tagInfo.payloadType || undefined,
              isNdefFormatted: tagInfo.isNdefFormatted,
            };
          } else if (tagInfo.tagId) {
            // Fallback: use formatted tag ID
            cardData = {
              cardName: 'KARTU GADAI',
              memberName: 'MEMBER',
              memberId: this.formatTagIdAsDec(tagInfo.tagId),
              balance: 0,
              email: '',
              phone: '',
              address: '',
              tagId: tagInfo.tagId,
              technologies: tagInfo.technologies,
            };
          }

          if (cardData && this.nfcListenerActive) {
            // Stop listener after successful read
            this.nfcListenerActive = false;
            await NfcManager.unregisterTagEvent().catch(() => {});
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.setEventListener(NfcEvents.SessionClosed, null);
            onCardDetected(cardData);
          }
        } catch (parseError: any) {
          console.error('Error parsing NFC tag:', parseError);
          // Don't stop listener on parse errors, continue listening
          // Only stop if it's a critical error
          if (parseError?.message?.includes('critical') || parseError?.code === 'CRITICAL_ERROR') {
            this.nfcListenerActive = false;
            await NfcManager.unregisterTagEvent().catch(() => {});
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.setEventListener(NfcEvents.SessionClosed, null);
            if (onError) {
              onError(new Error('Gagal memproses data kartu NFC'));
            }
          }
        }
      });

      // Handle session closed events (errors)
      NfcManager.setEventListener(NfcEvents.SessionClosed, (error?: any) => {
        if (!this.nfcListenerActive) {
          return;
        }

        // Log error for debugging
        if (error) {
          console.log('NFC session closed with error:', error?.message || error);
        }

        // Don't stop listener on minor errors (like timeout waiting for tag)
        // Only stop on critical errors
        if (
          error &&
          (error?.message?.includes('NFC tidak aktif') ||
            error?.message?.includes('not enabled') ||
            error?.code === 'NFC_NOT_ENABLED' ||
            error?.code === 'NFC_HARDWARE_ERROR')
        ) {
          this.nfcListenerActive = false;
          NfcManager.unregisterTagEvent().catch(() => {});
          NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
          NfcManager.setEventListener(NfcEvents.SessionClosed, null);
          if (onError) {
            onError(new Error('NFC tidak aktif atau terjadi masalah pada hardware NFC'));
          }
        }
        // For other errors (like timeout), continue listening silently
      });

      // Register tag event (starts listening)
      console.log('Registering NFC tag event...');
      await NfcManager.registerTagEvent({
        alertMessage: 'Tempelkan kartu pada bagian belakang smartphone',
        invalidateAfterFirstRead: false,
      });
      console.log('NFC listener started successfully');
    } catch (error: any) {
      // Clean up on any error
      console.error('Error starting NFC listener:', error);
      this.nfcListenerActive = false;
      await NfcManager.unregisterTagEvent().catch(() => {});
      
      // Check if it's a user cancellation
      if (error?.name === 'UserCancel' || error?.message?.includes('UserCancel')) {
        // User cancelled - silently return, don't call onError
        console.log('NFC operation cancelled by user');
        return;
      }
      
      // For other errors, call onError callback
      if (onError) {
        // Create a user-friendly error message
        const friendlyError = new Error(
          error?.message || 'Gagal memulai NFC. Pastikan NFC aktif dan coba lagi.'
        );
        (friendlyError as any).code = error?.code || 'NFC_ERROR';
        onError(friendlyError);
      }
    }
  }

  /**
   * Stop NFC listener
   */
  async stopNFCListener(): Promise<void> {
    try {
      console.log('Stopping NFC listener...');
      this.nfcListenerActive = false;
      this.nfcTagHandler = null;
      // Remove event listeners
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.setEventListener(NfcEvents.SessionClosed, null);
      // Unregister tag event for event-based listening
      await NfcManager.unregisterTagEvent().catch(() => {});
      // Also cancel any pending technology request (for readNFCCard fallback)
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      console.log('NFC listener stopped');
    } catch (error) {
      console.error('Error stopping NFC listener:', error);
      // Ensure state is reset even if unregister fails
      this.nfcListenerActive = false;
      this.nfcTagHandler = null;
    }
  }

  /**
   * Check Bluetooth state
   */
  async checkBluetoothState(): Promise<State> {
    return new Promise((resolve) => {
      bleManager.state().then((state) => {
        resolve(state);
      });
    });
  }

  /**
   * Request Bluetooth permission (Android)
   */
  async requestBluetoothPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions differently
    }

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 31) {
        // Android 12+ (API 31+)
        const scanGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Bluetooth Scan Permission',
            message: 'App needs access to scan for Bluetooth devices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const connectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Bluetooth Connect Permission',
            message: 'App needs access to connect to Bluetooth devices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return (
          scanGranted === PermissionsAndroid.RESULTS.GRANTED &&
          connectGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs location permission for Bluetooth scanning',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Error requesting Bluetooth permission:', error);
      return false;
    }
  }

  /**
   * Check if device is an NFC Bluetooth device based on name or UUID
   */
  private isNFCBluetoothDevice(device: any): boolean {
    // Check by device name
    if (device.name) {
      const deviceName = device.name.toUpperCase();
      for (const pattern of NFC_BLUETOOTH_CONFIG.DEVICE_NAME_PATTERNS) {
        if (deviceName.includes(pattern.toUpperCase())) {
          return true;
        }
      }
    }

    // Check by service UUIDs (if device has advertised services)
    if (device.serviceUUIDs && Array.isArray(device.serviceUUIDs)) {
      for (const uuid of device.serviceUUIDs) {
        if (uuid.toLowerCase() === NFC_BLUETOOTH_CONFIG.SERVICE_UUID.toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Scan for NFC Bluetooth devices (filtered)
   */
  async scanNFCBluetoothDevices(
    onDeviceFound: (device: BluetoothDevice) => void,
    timeout: number = 10000
  ): Promise<void> {
    try {
      const state = await this.checkBluetoothState();
      if (state === State.Unauthorized) {
        throw new Error('Aplikasi tidak memiliki izin untuk menggunakan Bluetooth');
      }
      if (state === State.Unsupported) {
        throw new Error('Bluetooth tidak didukung pada perangkat ini');
      }
      if (state === State.PoweredOff) {
        throw new Error('Bluetooth tidak aktif. Silakan aktifkan Bluetooth di pengaturan.');
      }
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth tidak siap. Status: ' + state);
      }

      const hasPermission = await this.requestBluetoothPermission();
      if (!hasPermission) {
        throw new Error('Izin Bluetooth ditolak. Silakan berikan izin di pengaturan aplikasi.');
      }

      const foundDeviceIds = new Set<string>();

      // Start scanning
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          return;
        }

        if (device && this.isNFCBluetoothDevice(device)) {
          // Avoid duplicate devices
          if (!foundDeviceIds.has(device.id)) {
            foundDeviceIds.add(device.id);
            onDeviceFound({
              id: device.id,
              name: device.name,
              rssi: device.rssi,
            });
          }
        }
      });

      // Stop scanning after timeout
      this.scanningTimeout = setTimeout(() => {
        this.stopBluetoothScan();
      }, timeout);
    } catch (error) {
      console.error('Error scanning NFC Bluetooth devices:', error);
      throw error;
    }
  }

  /**
   * Scan for Bluetooth devices (all devices, not filtered)
   */
  async scanBluetoothDevices(
    onDeviceFound: (device: BluetoothDevice) => void,
    timeout: number = 10000
  ): Promise<void> {
    try {
      const state = await this.checkBluetoothState();
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not enabled');
      }

      const hasPermission = await this.requestBluetoothPermission();
      if (!hasPermission) {
        throw new Error('Bluetooth permission denied');
      }

      // Start scanning
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          return;
        }

        if (device) {
          onDeviceFound({
            id: device.id,
            name: device.name,
            rssi: device.rssi,
          });
        }
      });

      // Stop scanning after timeout
      this.scanningTimeout = setTimeout(() => {
        this.stopBluetoothScan();
      }, timeout);
    } catch (error) {
      console.error('Error scanning Bluetooth devices:', error);
      throw error;
    }
  }

  /**
   * Stop Bluetooth scan
   */
  stopBluetoothScan(): void {
    try {
      bleManager.stopDeviceScan();
      if (this.scanningTimeout) {
        clearTimeout(this.scanningTimeout);
        this.scanningTimeout = null;
      }
    } catch (error) {
      console.error('Error stopping Bluetooth scan:', error);
    }
  }

  /**
   * Connect to Bluetooth device
   */
  async connectBluetoothDevice(deviceId: string): Promise<Device> {
    try {
      // Disconnect existing device if any
      if (this.connectedBluetoothDevice) {
        try {
          await this.disconnectBluetoothDevice(this.connectedBluetoothDevice);
        } catch (e) {
          // Ignore disconnect errors
        }
      }

      // Connect with timeout
      let connectionTimeout: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Device>((_, reject) => {
        connectionTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, NFC_BLUETOOTH_CONFIG.CONNECTION_TIMEOUT);
      });

      const device = await Promise.race([
        bleManager.connectToDevice(deviceId).catch((error) => {
          // Clear timeout if connection fails
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          throw error;
        }),
        timeoutPromise,
      ]);
      
      // Clear timeout if connection succeeds
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();

      // Set up device listener for disconnection
      this.bluetoothDeviceListener = device.onDisconnected((error, device) => {
        console.log('Bluetooth device disconnected:', device.id);
        if (this.connectedBluetoothDevice?.id === device.id) {
          this.connectedBluetoothDevice = null;
        }
      });

      this.connectedBluetoothDevice = device;
      return device;
    } catch (error: any) {
      console.error('Error connecting to Bluetooth device:', error);
      
      // Provide user-friendly error messages
      if (error?.message === 'Connection timeout') {
        throw new Error('Koneksi ke perangkat Bluetooth timeout. Pastikan perangkat dalam jangkauan dan coba lagi.');
      }
      if (error?.message?.includes('Device not found') || error?.message?.includes('not found')) {
        throw new Error('Perangkat tidak ditemukan. Pastikan perangkat masih dalam jangkauan.');
      }
      if (error?.message?.includes('Connection failed') || error?.message?.includes('failed to connect')) {
        throw new Error('Gagal terhubung ke perangkat. Pastikan perangkat tidak terhubung ke perangkat lain.');
      }
      if (error?.message?.includes('permission') || error?.message?.includes('Permission')) {
        throw new Error('Izin Bluetooth diperlukan. Silakan berikan izin di pengaturan aplikasi.');
      }
      
      throw new Error(error?.message || 'Gagal terhubung ke perangkat Bluetooth');
    }
  }

  /**
   * Get currently connected Bluetooth device
   */
  getConnectedBluetoothDevice(): Device | null {
    return this.connectedBluetoothDevice;
  }

  /**
   * Check if Bluetooth device is connected
   */
  async isBluetoothDeviceConnected(): Promise<boolean> {
    if (!this.connectedBluetoothDevice) {
      return false;
    }

    try {
      // Check connection by trying to read device info
      // If device is disconnected, this will throw an error
      await this.connectedBluetoothDevice.isConnected();
      return true;
    } catch (error) {
      // Device is disconnected
      this.connectedBluetoothDevice = null;
      return false;
    }
  }

  /**
   * Read data from Bluetooth device
   */
  async readBluetoothData(device: Device, serviceUUID: string, characteristicUUID: string): Promise<string | null> {
    try {
      const characteristic = await device.readCharacteristicForService(serviceUUID, characteristicUUID);
      return characteristic.value || null;
    } catch (error) {
      console.error('Error reading Bluetooth data:', error);
      throw error;
    }
  }

  /**
   * Read NFC card via Bluetooth NFC device
   * This method reads card data from a connected Bluetooth NFC device
   */
  async readNFCCardViaBluetooth(): Promise<NFCCardData | null> {
    try {
      // Check if device is connected
      if (!this.connectedBluetoothDevice) {
        throw new Error('Tidak ada perangkat Bluetooth NFC yang terhubung');
      }

      const isConnected = await this.isBluetoothDeviceConnected();
      if (!isConnected) {
        throw new Error('Perangkat Bluetooth NFC tidak terhubung. Silakan sambungkan kembali.');
      }

      const device = this.connectedBluetoothDevice;

      // Try to find the NFC service and characteristics
      // First, try with configured UUIDs
      let serviceUUID = NFC_BLUETOOTH_CONFIG.SERVICE_UUID;
      let readCharUUID = NFC_BLUETOOTH_CONFIG.READ_CHARACTERISTIC_UUID;
      let writeCharUUID = NFC_BLUETOOTH_CONFIG.WRITE_CHARACTERISTIC_UUID;

      // Discover services if not already discovered
      try {
        await device.discoverAllServicesAndCharacteristics();
      } catch (e) {
        // Services might already be discovered
      }

      // Try to find NFC service by scanning available services
      const services = await device.services();
      let nfcService = services.find((s) => 
        s.uuid.toLowerCase() === serviceUUID.toLowerCase()
      );

      // If not found, try to find any service that might be NFC-related
      if (!nfcService && services.length > 0) {
        // Use first available service as fallback
        nfcService = services[0];
        serviceUUID = nfcService.uuid;
      }

      if (!nfcService) {
        throw new Error('Service NFC tidak ditemukan pada perangkat Bluetooth');
      }

      // Get characteristics
      const characteristics = await nfcService.characteristics();
      
      // Find read and write characteristics
      let readCharacteristic = characteristics.find((c) =>
        c.uuid.toLowerCase() === readCharUUID.toLowerCase()
      );
      let writeCharacteristic = characteristics.find((c) =>
        c.uuid.toLowerCase() === writeCharUUID.toLowerCase()
      );

      // If not found, use first available characteristics as fallback
      if (!readCharacteristic && characteristics.length > 0) {
        readCharacteristic = characteristics[0];
        readCharUUID = readCharacteristic.uuid;
      }
      if (!writeCharacteristic && characteristics.length > 1) {
        writeCharacteristic = characteristics[1];
        writeCharUUID = writeCharacteristic.uuid;
      } else if (!writeCharacteristic && characteristics.length > 0) {
        writeCharacteristic = characteristics[0];
        writeCharUUID = writeCharacteristic.uuid;
      }

      if (!readCharacteristic) {
        throw new Error('Characteristic untuk membaca data tidak ditemukan');
      }

      // Send command to read card (generic command - can be customized)
      // Most NFC readers use a simple command like "READ" or byte array
      if (writeCharacteristic) {
        try {
          // Send read command (format depends on device - using generic approach)
          const readCommand = 'READ'; // This can be customized based on device protocol
          await this.writeBluetoothData(device, serviceUUID, writeCharUUID, readCommand);
        } catch (writeError) {
          // Some devices don't need write command, just read
          console.log('Write command not needed or failed, trying direct read:', writeError);
        }
      }

      // Wait a bit for device to process (if needed)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Read card data with timeout
      const cardDataRaw = await Promise.race([
        this.readBluetoothData(device, serviceUUID, readCharUUID),
        new Promise<string | null>((_, reject) =>
          setTimeout(() => reject(new Error('Read timeout')), NFC_BLUETOOTH_CONFIG.READ_TIMEOUT)
        ),
      ]);

      if (!cardDataRaw) {
        throw new Error('Tidak ada data kartu yang diterima dari perangkat');
      }

      // Parse card data
      // The format depends on the device - for now, using generic parsing
      let cardData: NFCCardData | null = null;

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(cardDataRaw);
        if (parsed && typeof parsed === 'object') {
          cardData = {
            cardName: parsed.cardName || 'KARTU GADAI',
            memberName: parsed.memberName || parsed.name || 'MEMBER',
            memberId: parsed.memberId || parsed.id || 'UNKNOWN',
            balance: parsed.balance || 0,
            email: parsed.email || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
          };
        }
      } catch (jsonError) {
        // If not JSON, try to parse as text/string
        // For now, using mock data - this should be replaced with actual parsing logic
        // based on the device's data format
        const textData = cardDataRaw.toString();
        
        // Mock parsing - replace with actual device-specific parsing
        // Example: if device sends "ID:12345|NAME:John Doe|BALANCE:100000"
        if (textData.includes('|') || textData.includes(':')) {
          // Simple parsing for pipe or colon separated values
          const parts = textData.split(/[|:]/);
          cardData = {
            cardName: 'KARTU GADAI',
            memberName: parts.find(p => p.includes('NAME'))?.split(':')[1]?.trim() || 'MEMBER',
            memberId: parts.find(p => p.includes('ID'))?.split(':')[1]?.trim() || textData.substring(0, 10),
            balance: parseInt(parts.find(p => p.includes('BALANCE'))?.split(':')[1]?.trim() || '0', 10),
            email: '',
            phone: '',
            address: '',
          };
        } else {
          // Fallback: use raw data as member ID
          cardData = {
            cardName: 'KARTU GADAI',
            memberName: 'MEMBER',
            memberId: textData.substring(0, 20) || 'UNKNOWN',
            balance: 0,
            email: '',
            phone: '',
            address: '',
          };
        }
      }

      return cardData;
    } catch (error: any) {
      console.error('Error reading NFC card via Bluetooth:', error);
      
      // Provide user-friendly error messages
      if (error?.message?.includes('timeout')) {
        throw new Error('Waktu membaca kartu habis. Pastikan kartu ditempelkan dengan benar.');
      }
      if (error?.message?.includes('tidak terhubung')) {
        throw new Error('Perangkat Bluetooth NFC terputus. Silakan sambungkan kembali.');
      }
      
      throw error;
    }
  }

  /**
   * Write data to Bluetooth device
   */
  async writeBluetoothData(
    device: Device,
    serviceUUID: string,
    characteristicUUID: string,
    data: string
  ): Promise<void> {
    try {
      await device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        data
      );
    } catch (error) {
      console.error('Error writing Bluetooth data:', error);
      throw error;
    }
  }

  /**
   * Disconnect Bluetooth device
   */
  async disconnectBluetoothDevice(device: Device): Promise<void> {
    try {
      await device.cancelConnection();
      if (this.connectedBluetoothDevice?.id === device.id) {
        this.connectedBluetoothDevice = null;
      }
      if (this.bluetoothDeviceListener) {
        this.bluetoothDeviceListener.remove();
        this.bluetoothDeviceListener = null;
      }
    } catch (error) {
      console.error('Error disconnecting Bluetooth device:', error);
      throw error;
    }
  }

  /**
   * Disconnect current Bluetooth device
   */
  async disconnectCurrentBluetoothDevice(): Promise<void> {
    if (this.connectedBluetoothDevice) {
      await this.disconnectBluetoothDevice(this.connectedBluetoothDevice);
    }
  }

  /**
   * Open NFC settings (Android)
   */
  async openNFCSettings(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        // Try to open NFC settings directly
        await Linking.openURL('android.settings.NFC_SETTINGS');
      } else {
        // iOS: Open general settings
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening NFC settings:', error);
      // Fallback to general settings
      try {
        await Linking.openSettings();
      } catch (fallbackError) {
        console.error('Error opening settings:', fallbackError);
      }
    }
  }

  /**
   * Process NFC tag and extract information (based on Kotlin NfcHandler)
   */
  private processTag(tag: any): {
    tagId: string;
    technologies: string[];
    ndefMessage: string | null;
    payloadType: string | null;
    isNdefFormatted: boolean;
  } {
    try {
      // Format tag ID as hex string (e.g., "04:12:34:56")
      const tagId = tag.id 
        ? tag.id.split(':').map((byte: string) => byte.padStart(2, '0')).join(':').toUpperCase()
        : 'Unknown';

      // Get supported technologies
      const technologies = this.getSupportedTechnologies(tag);

      // Check for NDEF support and parse message
      let ndefMessage: string | null = null;
      let isNdefFormatted = false;
      let payloadType: string | null = null;

      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        isNdefFormatted = true;
        ndefMessage = this.parseNdefMessage(tag.ndefMessage);
        payloadType = this.detectPayloadType(ndefMessage);
      }

      return {
        tagId,
        technologies,
        ndefMessage,
        payloadType,
        isNdefFormatted,
      };
    } catch (error: any) {
      console.error('Error processing NFC tag:', error);
      return {
        tagId: tag.id || 'Unknown',
        technologies: [],
        ndefMessage: null,
        payloadType: null,
        isNdefFormatted: false,
      };
    }
  }

  /**
   * Get human-readable technology names (based on Kotlin implementation)
   */
  private getSupportedTechnologies(tag: any): string[] {
    const techList: string[] = [];
    const techListArray = tag.techList || [];

    if (techListArray.includes('android.nfc.tech.NfcA')) {
      techList.push('NFC-A (ISO 14443-3A)');
    }
    if (techListArray.includes('android.nfc.tech.NfcB')) {
      techList.push('NFC-B (ISO 14443-3B)');
    }
    if (techListArray.includes('android.nfc.tech.NfcF')) {
      techList.push('NFC-F (FeliCa)');
    }
    if (techListArray.includes('android.nfc.tech.NfcV')) {
      techList.push('NFC-V (ISO 15693)');
    }
    if (techListArray.includes('android.nfc.tech.Ndef')) {
      techList.push('NDEF');
    }
    if (techListArray.includes('android.nfc.tech.MifareClassic')) {
      techList.push('Mifare Classic');
    }

    return techList;
  }

  /**
   * Parse NDEF message to human-readable text (based on Kotlin implementation)
   */
  private parseNdefMessage(ndefMessage: any[]): string | null {
    if (!ndefMessage || ndefMessage.length === 0) return null;

    try {
      const recordsText = ndefMessage
        .map((record: any) => this.parseNdefRecord(record))
        .filter((text: string | null) => text !== null)
        .join('\n---\n');

      return recordsText || null;
    } catch (error) {
      console.error('Error parsing NDEF message:', error);
      return null;
    }
  }

  /**
   * Parse individual NDEF record (based on Kotlin implementation)
   */
  private parseNdefRecord(record: any): string | null {
    try {
      if (record.tnf === Ndef.TNF_WELL_KNOWN) {
        const recordType = record.type ? String.fromCharCode(...record.type) : '';
        
        if (recordType === 'T') {
          // Text record
          try {
            const text = Ndef.text.decodePayload(record.payload);
            return `Text: ${text}`;
          } catch (e) {
            return null;
          }
        } else if (recordType === 'U') {
          // URI record
          try {
            const uri = Ndef.uri.decodePayload(record.payload);
            return `URI: ${uri}`;
          } catch (e) {
            return null;
          }
        } else {
          return `Well Known: ${recordType}`;
        }
      } else if (record.tnf === Ndef.TNF_ABSOLUTE_URI) {
        const uri = record.type ? String.fromCharCode(...record.type) : '';
        return `URI: ${uri}`;
      } else if (record.tnf === Ndef.TNF_MIME_MEDIA) {
        const mime = record.type ? String.fromCharCode(...record.type) : '';
        return `MIME: ${mime}`;
      } else if (record.tnf === Ndef.TNF_EXTERNAL_TYPE) {
        const external = record.type ? String.fromCharCode(...record.type) : '';
        return `External: ${external}`;
      }

      return 'Raw data';
    } catch (error) {
      console.error('Error parsing NDEF record:', error);
      return null;
    }
  }

  /**
   * Detect payload type from NDEF message (based on Kotlin implementation)
   */
  private detectPayloadType(ndefMessage: string | null): string | null {
    if (!ndefMessage || ndefMessage.length === 0) return null;

    const lowerMessage = ndefMessage.toLowerCase();
    
    if (lowerMessage.includes('bluetooth')) return 'Bluetooth Pairing';
    if (lowerMessage.includes('http')) return 'URL';
    if (lowerMessage.includes('tel:')) return 'Phone Number';
    if (lowerMessage.includes('mailto:')) return 'Email';
    if (lowerMessage.includes('geo:')) return 'Location';
    
    return 'Text/Unknown';
  }

  /**
   * Extract DEC (card identifier) from NFC tag (based on Kotlin implementation)
   * DEC is the card identifier used for API calls
   */
  private extractDec(tag: any, ndefMessage: string | null, tagId: string): string | null {
    try {
      // Primary: Try to get card identifier from tag directly
      const decFromTag = this.getCardIdentifierFromTag(tag, tagId);
      if (decFromTag) return decFromTag;

      // Secondary: Extract from NDEF message if available
      if (ndefMessage && ndefMessage.length > 0) {
        const decFromNdef = this.extractDecFromNdef(ndefMessage);
        if (decFromNdef) return decFromNdef;
      }

      // Tertiary: Use formatted tag ID as fallback DEC
      return this.formatTagIdAsDec(tagId);
    } catch (error) {
      console.error('Error extracting DEC:', error);
      // Last resort: formatted tag ID
      return this.formatTagIdAsDec(tagId);
    }
  }

  /**
   * Get card identifier directly from tag (based on Kotlin implementation)
   * This is the most reliable way to get DEC for different card types
   */
  private getCardIdentifierFromTag(tag: any, tagId: string): string | null {
    try {
      // Tag ID might be in different formats:
      // 1. Hex string with colons: "04:12:34:56"
      // 2. Hex string without colons: "04123456"
      // 3. Already formatted string
      
      let rawIdBytes: number[] = [];
      
      if (tagId.includes(':')) {
        // Format with colons
        rawIdBytes = tagId.split(':').map((hex: string) => parseInt(hex, 16));
      } else {
        // Format without colons - parse as hex pairs
        const hexPairs = tagId.match(/.{1,2}/g) || [];
        rawIdBytes = hexPairs.map((hex: string) => parseInt(hex, 16));
      }
      
      if (!rawIdBytes || rawIdBytes.length === 0) return null;

      // Check if this is a Mifare Classic card
      const techList = tag.techList || [];
      const isMifareClassic = techList.includes('android.nfc.tech.MifareClassic') || 
                              techList.some((tech: string) => tech.includes('MifareClassic'));

      if (isMifareClassic && rawIdBytes.length === 4) {
        // For Mifare Classic 4-byte UID, convert reversed hex to decimal
        const reversedId = [...rawIdBytes].reverse();
        const reversedHexId = reversedId.map((byte: number) => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
        const decValue = parseInt(reversedHexId, 16).toString();
        console.log(`Mifare Classic tag ID (reversed hex): ${reversedHexId}, DEC: ${decValue}`);
        return decValue || reversedHexId;
      } else {
        // For other cards, use normal hex format
        const hexId = rawIdBytes.map((byte: number) => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
        console.log(`Standard tag ID as DEC: ${hexId}`);
        return hexId;
      }
    } catch (error) {
      console.error('Error getting card identifier from tag:', error);
      return null;
    }
  }

  /**
   * Extract DEC from NDEF message content (fallback) (based on Kotlin implementation)
   */
  private extractDecFromNdef(ndefMessage: string | null): string | null {
    if (!ndefMessage || ndefMessage.length === 0) return null;

    // Look for explicit DEC/card ID patterns
    const patterns = [
      /dec:([A-Fa-f0-9]+)/i,
      /cardid:([A-Fa-f0-9]+)/i,
      /identifier:([A-Fa-f0-9]+)/i,
    ];

    for (const pattern of patterns) {
      const match = ndefMessage.match(pattern);
      if (match && match[1]) {
        console.log(`DEC found in NDEF: ${match[1]}`);
        return match[1].toUpperCase();
      }
    }

    // If NDEF contains only hex-like string, use it as DEC
    const cleanMessage = ndefMessage.replace(/\n/g, '').trim();
    if (cleanMessage.length >= 8 && cleanMessage.length <= 16 && /^[A-Fa-f0-9]+$/.test(cleanMessage)) {
      console.log(`NDEF message used as DEC: ${cleanMessage}`);
      return cleanMessage.toUpperCase();
    }

    return null;
  }

  /**
   * Format tag ID as final fallback DEC (based on Kotlin implementation)
   */
  private formatTagIdAsDec(tagId: string): string {
    // Remove colons and ensure uppercase
    return tagId.replace(/[:-\s]/g, '').toUpperCase();
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    await this.stopNFCListener();
    this.stopBluetoothScan();
    bleManager.destroy();
  }
}

export const nfcBluetoothService = new NFCBluetoothService();

