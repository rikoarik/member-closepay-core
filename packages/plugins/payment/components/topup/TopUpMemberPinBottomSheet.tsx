/**
 * Top Up Member PIN Bottom Sheet
 * Bottom sheet untuk input PIN dengan keypad numerik
 * Menggunakan reusable BottomSheet component dari @core/config
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { BottomSheet } from '@core/config';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';
import { PinInput } from '../shared/PinInput';

export interface TopUpMemberPinData {
  tabType: 'id-member' | 'excel' | 'top-kartu';
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  memberId?: string;
  memberName?: string;
  adminFee: number;
  totalAmount: number;
}

interface TopUpMemberPinBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  data: TopUpMemberPinData | null;
  onComplete: (pin: string) => void;
}

const PIN_LENGTH = 6;

export const TopUpMemberPinBottomSheet: React.FC<TopUpMemberPinBottomSheetProps> = ({
  visible,
  onClose,
  data,
  onComplete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handlePinComplete = (pin: string) => {
    // TODO: Validate PIN with backend
    console.log('PIN submitted:', pin);
    onComplete(pin);
  };

  const handleForgotPin = () => {
    // TODO: Implement forgot PIN flow
    console.log('Forgot PIN');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[90]}
      initialSnapPoint={0}
      enablePanDownToClose={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft2
              size={getIconSize('medium')}
              color={colors.text}
              variant="Outline"
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('topUp.enterPin')}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <PinInput
            length={PIN_LENGTH}
            onComplete={handlePinComplete}
            onForgotPin={handleForgotPin}
            autoSubmit={true}
            autoSubmitDelay={300}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
  },
  backButton: {
    padding: moderateVerticalScale(8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: scale(40),
  },
  content: {
    flex: 1,
    paddingTop: moderateVerticalScale(8),
  },
});

