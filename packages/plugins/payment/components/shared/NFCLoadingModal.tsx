/**
 * NFC Loading Modal Component
 * Full screen loading modal dengan background transparan untuk deteksi NFC
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';

export interface NFCLoadingModalProps {
  /**
   * Apakah modal terlihat
   */
  visible: boolean;
  /**
   * Pesan status yang ditampilkan (default: "Mendeteksi kartu NFC...")
   */
  message?: string;
}

export const NFCLoadingModal: React.FC<NFCLoadingModalProps> = ({
  visible,
  message = 'Mendeteksi kartu NFC...',
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Non-dismissible - do nothing
      }}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
          },
        ]}>
        <View style={styles.contentContainer}>
          {/* Activity Indicator */}
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.indicator}
          />

          {/* Message Text */}
          <Text style={[styles.message, { color: colors.surface }]}>
            {message}
          </Text>

          {/* Instruction Text */}
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            Tempelkan kartu pada bagian belakang smartphone
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        // iOS specific styles if needed
      },
      android: {
        // Android specific styles if needed
      },
    }),
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(32),
  },
  indicator: {
    marginBottom: moderateVerticalScale(24),
  },
  message: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  instruction: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginTop: moderateVerticalScale(8),
  },
});

