/**
 * Top Up Screen
 * Screen untuk input nominal dan pilih metode pembayaran
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  ArrowLeft2,
} from 'iconsax-react-nativejs';
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

interface PaymentMethod {
  id: string;
  name: string;
  bank: string;
  logo?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bsi1', name: 'Bank Syariah Indonesia', bank: 'BSI' },
  { id: 'bsi2', name: 'Bank Syariah Indonesia', bank: 'BSI' },
  { id: 'bsi3', name: 'Bank Syariah Indonesia', bank: 'BSI' },
];

export const TopUpScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('200000');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const formatCurrency = (value: string): string => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    // Format with thousand separators
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted.replace(/\./g, ''));
  };

  const handleNext = () => {
    if (!selectedMethod || !amount) return;
    
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (numericAmount <= 0) return;

    // @ts-ignore - navigation type akan di-setup nanti
    navigation.navigate('VirtualAccount', {
      amount: numericAmount,
      paymentMethod: selectedMethod,
    });
  };

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          backgroundColor: colors.background,
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.topUp')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Nominal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {t('topUp.amount')}
          </Text>
          
          <View style={[
            styles.amountContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}>
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
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {t('topUp.paymentMethod')}
          </Text>

          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSelectedMethod(method.id)}>
                <View style={styles.paymentMethodContent}>
                  {/* Bank Logo Placeholder */}
                  <View style={[
                    styles.bankLogo,
                    { backgroundColor: colors.surfaceSecondary || '#F3F4F6' }
                  ]}>
                    <Text style={[styles.bankLogoText, { color: colors.textSecondary }]}>
                      {method.bank}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodName, { color: colors.text }]}>
                      {method.name}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.radioButton,
                    {
                      borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                      backgroundColor: selectedMethod === method.id ? colors.primary : 'transparent',
                    }
                  ]}>
                    {selectedMethod === method.id && (
                      <View style={[styles.radioButtonInner, { backgroundColor: '#FFFFFF' }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + moderateVerticalScale(16),
        }
      ]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
              {t('topUp.total')}
            </Text>
            <Text style={[styles.footerAmount, { color: colors.text }]}>
              Rp {displayAmount || '0'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: numericAmount > 0 && selectedMethod ? colors.primary : colors.border,
              }
            ]}
            onPress={handleNext}
            disabled={!numericAmount || !selectedMethod}>
            <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
              {t('common.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopUpScreen;

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
    fontSize: moderateScale(18),
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
    paddingBottom: moderateVerticalScale(24),
  },
  section: {
    paddingHorizontal: horizontalPadding,
    marginTop: moderateVerticalScale(24),
  },
  sectionLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
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
    fontSize: moderateScale(24),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: moderateScale(24),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  paymentMethods: {
    gap: scale(12),
  },
  paymentMethodItem: {
    borderRadius: scale(12),
    borderWidth: 2,
    padding: scale(16),
    minHeight: minTouchTarget,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  bankLogoText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  radioButton: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  footerAmount: {
    fontSize: moderateScale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  nextButton: {
    paddingHorizontal: scale(24),
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});

