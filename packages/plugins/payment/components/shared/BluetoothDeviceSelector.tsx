/**
 * Bluetooth Device Selector Component
 * Component untuk scan dan pilih Bluetooth NFC device
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, Refresh2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';
import {
  nfcBluetoothService,
  type BluetoothDevice,
} from '@plugins/payment/services/nfcBluetoothService';

interface BluetoothDeviceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onDeviceSelected: (device: BluetoothDevice) => void;
  onDeviceConnected?: (device: BluetoothDevice) => void;
}

export const BluetoothDeviceSelector: React.FC<BluetoothDeviceSelectorProps> = ({
  visible,
  onClose,
  onDeviceSelected,
  onDeviceConnected,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);

  // Start scanning when modal opens
  useEffect(() => {
    if (visible) {
      startScan();
    } else {
      stopScan();
      setDevices([]);
      setSelectedDevice(null);
      setError(null);
    }

    return () => {
      stopScan();
    };
  }, [visible]);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setDevices([]);

      // Stop any existing scan
      nfcBluetoothService.stopBluetoothScan();

      // Start scanning for NFC Bluetooth devices
      await nfcBluetoothService.scanNFCBluetoothDevices(
        (device: BluetoothDevice) => {
          setDevices((prevDevices) => {
            // Avoid duplicates
            if (prevDevices.find((d) => d.id === device.id)) {
              return prevDevices;
            }
            return [...prevDevices, device];
          });
        },
        15000 // 15 seconds timeout
      );

      // Auto stop after 15 seconds
      const timeout = setTimeout(() => {
        stopScan();
      }, 15000);
      setScanTimeout(timeout);
    } catch (error: any) {
      console.error('Error starting scan:', error);
      setError(error.message || 'Gagal memulai scan Bluetooth');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    nfcBluetoothService.stopBluetoothScan();
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      setScanTimeout(null);
    }
    setIsScanning(false);
  };

  const handleRefresh = () => {
    stopScan();
    startScan();
  };

  const handleSelectDevice = async (device: BluetoothDevice) => {
    try {
      setSelectedDevice(device);
      setIsConnecting(true);
      setError(null);

      // Connect to device
      await nfcBluetoothService.connectBluetoothDevice(device.id);

      // Call callbacks
      onDeviceSelected(device);
      if (onDeviceConnected) {
        onDeviceConnected(device);
      }

      // Close modal after successful connection
      setTimeout(() => {
        setIsConnecting(false);
        onClose();
      }, 500);
    } catch (error: any) {
      console.error('Error connecting to device:', error);
      setError(error.message || 'Gagal terhubung ke perangkat');
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  const getSignalStrength = (rssi: number | null): string => {
    if (rssi === null) return 'Tidak diketahui';
    if (rssi >= -50) return 'Sangat Kuat';
    if (rssi >= -70) return 'Kuat';
    if (rssi >= -85) return 'Sedang';
    return 'Lemah';
  };

  const getSignalColor = (rssi: number | null): string => {
    if (rssi === null) return colors.textSecondary;
    if (rssi >= -50) return '#10B981'; // Green
    if (rssi >= -70) return '#3B82F6'; // Blue
    if (rssi >= -85) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              paddingTop: insets.top,
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Pilih Perangkat NFC Bluetooth
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isScanning || isConnecting}
          >
            <Refresh2
              size={getIconSize('medium')}
              color={isScanning || isConnecting ? colors.textSecondary : colors.primary}
              variant="Outline"
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status */}
          {isScanning && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                Mencari perangkat NFC Bluetooth...
              </Text>
            </View>
          )}

          {!isScanning && devices.length === 0 && !error && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Tidak ada perangkat ditemukan
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Pastikan perangkat NFC Bluetooth sudah dinyalakan dan dalam jangkauan
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={handleRefresh}
                disabled={isScanning || isConnecting}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Device List */}
          {devices.length > 0 && (
            <View style={styles.deviceList}>
              <Text style={[styles.deviceListTitle, { color: colors.text }]}>
                Perangkat Ditemukan ({devices.length})
              </Text>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.deviceItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor:
                        selectedDevice?.id === device.id ? colors.primary : colors.border,
                    },
                    isConnecting && selectedDevice?.id !== device.id && styles.deviceItemDisabled,
                  ]}
                  onPress={() => handleSelectDevice(device)}
                  disabled={isConnecting}
                  activeOpacity={0.7}
                >
                  <View style={styles.deviceItemContent}>
                    <View style={styles.deviceItemLeft}>
                      <Text style={[styles.deviceName, { color: colors.text }]}>
                        {device.name || 'Perangkat Tanpa Nama'}
                      </Text>
                      <Text style={[styles.deviceId, { color: colors.textSecondary }]}>
                        {device.id}
                      </Text>
                    </View>
                    <View style={styles.deviceItemRight}>
                      {device.rssi !== null && (
                        <View style={styles.signalContainer}>
                          <View
                            style={[
                              styles.signalBar,
                              {
                                backgroundColor: getSignalColor(device.rssi),
                                width: scale(Math.max(0, (device.rssi + 100) / 2)),
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.signalText,
                              { color: getSignalColor(device.rssi) },
                            ]}
                          >
                            {getSignalStrength(device.rssi)}
                          </Text>
                        </View>
                      )}
                      {isConnecting && selectedDevice?.id === device.id && (
                        <ActivityIndicator size="small" color={colors.primary} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              Petunjuk
            </Text>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>1.</Text>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Pastikan perangkat NFC Bluetooth sudah dinyalakan
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>2.</Text>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Pastikan Bluetooth pada smartphone aktif
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.primary }]}>3.</Text>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Pilih perangkat dari daftar untuk terhubung
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(24),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  statusText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginLeft: scale(8),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(32),
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  emptySubtext: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  errorContainer: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    marginBottom: moderateVerticalScale(16),
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(12),
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  retryButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  deviceList: {
    marginBottom: moderateVerticalScale(24),
  },
  deviceListTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(12),
  },
  deviceItem: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 2,
    marginBottom: moderateVerticalScale(12),
    minHeight: minTouchTarget,
  },
  deviceItemDisabled: {
    opacity: 0.5,
  },
  deviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceItemLeft: {
    flex: 1,
    marginRight: scale(16),
  },
  deviceName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  deviceId: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  deviceItemRight: {
    alignItems: 'flex-end',
  },
  signalContainer: {
    alignItems: 'flex-end',
    marginBottom: moderateVerticalScale(4),
  },
  signalBar: {
    height: scale(4),
    borderRadius: scale(2),
    marginBottom: moderateVerticalScale(4),
    minWidth: scale(20),
    maxWidth: scale(60),
  },
  signalText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  instructionsContainer: {
    marginTop: moderateVerticalScale(8),
  },
  instructionsTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(12),
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: moderateVerticalScale(8),
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  instructionText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
});

