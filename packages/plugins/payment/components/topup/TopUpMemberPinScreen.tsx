/**
 * Top Up Member PIN Screen
 * Screen untuk input PIN dengan keypad numerik
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';
import { PinInput } from '../shared/PinInput';

interface RouteParams {
  tabType: 'id-member' | 'excel' | 'top-kartu';
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  memberId?: string;
  memberName: string;
  adminFee: number;
  totalAmount: number;
}

const PIN_LENGTH = 6;

export const TopUpMemberPinScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;

  const handlePinComplete = (pin: string) => {
    // TODO: Validate PIN with backend
    console.log('PIN submitted:', pin);

    // Navigate to success screen
    // @ts-ignore - navigation type akan di-setup nanti
    navigation.navigate('TopUpMemberSuccess', {
      ...params,
      pin: pin,
    });
  };

  const handleForgotPin = () => {
    // TODO: Implement forgot PIN flow
    console.log('Forgot PIN');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
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
    </SafeAreaView>
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
  headerRight: {
    width: minTouchTarget,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(40),
  },
});

