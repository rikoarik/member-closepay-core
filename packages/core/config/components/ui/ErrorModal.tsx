/**
 * ErrorModal Component
 * Reusable modal component untuk menampilkan error messages
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
} from '../../utils/responsive';
import { getFontFamily } from '../../utils/fonts';
import { useTheme } from '../../../theme';
import { useTranslation } from '../../../i18n';
import { ErrorIcon } from '../icons/ErrorIcon';

// Helper untuk mendapatkan font family dengan fallback yang aman
const getFont = (variant: 'regular' | 'medium' | 'semiBold' | 'bold'): string => {
  try {
    return getFontFamily(variant, false);
  } catch (error) {
    // Jika terjadi error, gunakan fallback
    return getFontFamily(variant, true);
  }
};

export interface ErrorModalProps {
  /**
   * Apakah modal terlihat
   */
  visible: boolean;
  /**
   * Title modal
   */
  title?: string;
  /**
   * Pesan error
   */
  message: string;
  /**
   * Callback ketika modal ditutup
   */
  onClose: () => void;
  /**
   * Text untuk button OK (default: "OK")
   */
  buttonText?: string;
  /**
   * Apakah menutup modal saat backdrop ditekan (default: true)
   */
  dismissible?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title,
  message,
  onClose,
  buttonText,
  dismissible = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();
  
  // Use translation if title/buttonText not provided
  const modalTitle = title || t('error.title');
  const modalButtonText = buttonText || t('common.ok');

  const handleBackdropPress = () => {
    if (dismissible) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[
              styles.modalContainer,
              { 
                paddingHorizontal: horizontalPadding,
                backgroundColor: colors.surface,
              }
            ]}>
              {/* Icon Section */}
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
                  <ErrorIcon size="large" color={colors.error} />
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{modalTitle}</Text>
                <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
              </View>

              {/* Button Section */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.error }]}
                onPress={onClose}
                activeOpacity={0.8}>
                <Text style={[styles.buttonText, { color: colors.surface }]}>
                  {modalButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContainer: {
    borderRadius: scale(16),
    width: '100%',
    maxWidth: scale(400),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  iconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: scale(24),
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: getFont('bold'),
    textAlign: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  message: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: getFont('regular'),
    textAlign: 'center',
    lineHeight: moderateVerticalScale(22),
  },
  button: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(14),
    marginHorizontal: scale(24),
    marginBottom: verticalScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getMinTouchTarget(),
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: getFont('semiBold'),
    letterSpacing: 0.5,
  },
});

