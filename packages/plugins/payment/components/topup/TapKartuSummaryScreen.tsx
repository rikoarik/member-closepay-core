/**
 * Tap Kartu Summary Screen
 * Screen untuk menampilkan informasi kartu setelah tap NFC
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
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

interface CardData {
  cardName: string;
  memberName: string;
  memberId: string;
  balance: number;
  email: string;
  phone: string;
  address: string;
}

interface RouteParams {
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  cardData: CardData;
}

const QUICK_AMOUNTS = [10000, 20000, 50000];

export const TapKartuSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;

  const { balanceTarget, balanceTargetName, amount: initialAmount, cardData } = params || {
    balanceTarget: '',
    balanceTargetName: t('topUp.balanceTargetDefault'),
    amount: 0,
    cardData: {
      cardName: 'KARTU GADAI',
      memberName: 'ILHAM KASU',
      memberId: '1123123',
      balance: 120000,
      email: 'demo@gmail.com',
      phone: '123456789',
      address: 'Sukamulya',
    },
  };

  const [amount, setAmount] = useState(initialAmount.toString() || '50000');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
    setSelectedQuickAmount(null);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  };

  const handleNext = () => {
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (numericAmount <= 0) return;

    // Navigate to summary
    // @ts-ignore - navigation type akan di-setup nanti
    navigation.navigate('TopUpMemberSummary', {
      tabType: 'top-kartu',
      balanceTarget: balanceTarget,
      balanceTargetName: balanceTargetName,
      amount: numericAmount,
      memberId: cardData.memberId,
      memberName: cardData.memberName,
    });
  };

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('topUp.tapCard')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card Info */}
        <View
          style={[
            styles.cardInfo,
            {
              backgroundColor: '#10B981',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLogo}>V</Text>
            <Text style={styles.cardName}>{cardData.cardName}</Text>
          </View>
          <Text style={styles.cardEmail}>{cardData.email}</Text>
          <Text style={styles.cardPhone}>
            {t('topUp.phoneNumberLabel')}: {cardData.phone}
          </Text>
          <Text style={styles.cardAddress}>
            {t('topUp.addressLabel')}: {cardData.address}
          </Text>
          <View style={styles.cardProfile}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                {cardData.memberName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Saldo Tujuan */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('topUp.balanceTarget')}</Text>
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {balanceTargetName}
            </Text>
          </View>
        </View>

        {/* Nominal */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('topUp.amount')}</Text>
          <View
            style={[
              styles.amountContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={displayAmount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          {/* Quick Access */}
          <Text style={[styles.quickAccessLabel, { color: colors.textSecondary }]}>
            {t('topUp.quickAccess')}
          </Text>
          <View style={styles.quickAccessContainer}>
            {QUICK_AMOUNTS.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAccessButton,
                  {
                    backgroundColor:
                      selectedQuickAmount === quickAmount ? colors.primary : colors.surface,
                    borderColor:
                      selectedQuickAmount === quickAmount ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.quickAccessButtonText,
                    {
                      color:
                        selectedQuickAmount === quickAmount ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  Rp {formatCurrency(quickAmount.toString())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('topUp.information')}</Text>
          <View
            style={[
              styles.infoContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('topUp.cardName')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{cardData.cardName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('topUp.memberName')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{cardData.memberName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('topUp.memberId')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{cardData.memberId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('home.balance')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Rp {formatCurrency(cardData.balance.toString())}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: numericAmount > 0 ? colors.primary : colors.border,
              opacity: numericAmount > 0 ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={numericAmount <= 0}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(24),
    paddingBottom: moderateVerticalScale(24),
  },
  cardInfo: {
    padding: moderateScale(20),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  cardLogo: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
    marginRight: scale(8),
  },
  cardName: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  cardEmail: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    color: '#FFFFFF',
    marginBottom: moderateVerticalScale(4),
  },
  cardPhone: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    color: '#FFFFFF',
    marginBottom: moderateVerticalScale(4),
  },
  cardAddress: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    color: '#FFFFFF',
  },
  cardProfile: {
    position: 'absolute',
    right: moderateScale(20),
    top: moderateScale(20),
  },
  profileIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    color: '#10B981',
  },
  section: {
    marginBottom: moderateVerticalScale(24),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  dropdown: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  quickAccessLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(8),
  },
  quickAccessContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  quickAccessButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  quickAccessButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  infoContainer: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(12),
  },
  infoLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  infoValue: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});

