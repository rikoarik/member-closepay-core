/**
 * Virtual Account Screen
 * Menampilkan detail virtual account untuk pembayaran top up
 * dengan petunjuk pembayaran via ATM dan M-banking
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, Copy, ArrowDown2 } from 'iconsax-react-nativejs';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
  useDraggableBottomSheet,
} from '@core/config';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';

interface RouteParams {
  amount: number;
  paymentMethod: string;
}

const VIRTUAL_ACCOUNT = '600 0861 6737 8723';
const BANK_NAME = 'Bank Syariah Indonesia';

// Reusable Accordion Component using Animated API
const AccordionItem = ({
  title,
  iconText,
  isOpen,
  onToggle,
  children,
  colors,
}: {
  title: string;
  iconText: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [hasMeasured, setHasMeasured] = useState(false);
  const previousIsOpenRef = useRef(isOpen);
  const isInitialMountRef = useRef(true);
  const heightInterpolationRef = useRef<Animated.AnimatedInterpolation<number> | null>(null);

  // Measure content height on layout
  const handleContentLayout = (e: any) => {
    const { height: layoutHeight } = e.nativeEvent.layout;
    if (layoutHeight > 0) {
      const wasFirstMeasurement = !hasMeasured;
      
      if (wasFirstMeasurement) {
        // First measurement - create interpolation with known height
        setContentHeight(layoutHeight);
        setHasMeasured(true);
        
        // Create interpolation once with the measured height (immutable after creation)
        heightInterpolationRef.current = heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, layoutHeight],
        });
        
        // Set height immediately without animation for initial state
        if (isOpen) {
          heightAnim.setValue(1);
          rotateAnim.setValue(1);
        }
      } else if (contentHeight !== layoutHeight) {
        // Content height changed - we can't recreate interpolation, so we need to handle this differently
        // For now, just update the state - the interpolation will use the old range
        // This is acceptable since content height rarely changes after initial measurement
        setContentHeight(layoutHeight);
        // If currently open, maintain open state
        if (isOpen) {
          heightAnim.setValue(1);
        }
      }
    }
  };

  // Start animation only when isOpen changes (not on initial mount or measurement)
  useEffect(() => {
    // Skip on initial mount - height is set directly after measurement
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousIsOpenRef.current = isOpen;
      return;
    }

    // Don't animate if content hasn't been measured yet
    if (!hasMeasured || contentHeight === 0 || !heightInterpolationRef.current) {
      return;
    }

    // Only animate if isOpen actually changed
    if (previousIsOpenRef.current === isOpen) {
      return;
    }

    previousIsOpenRef.current = isOpen;
    
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, heightAnim, rotateAnim, hasMeasured, contentHeight]);

  // Use the interpolation ref if available, otherwise use 0
  const height = heightInterpolationRef.current || new Animated.Value(0);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.instructionCard,
        {
          borderColor: isOpen ? colors.info : colors.border,
          backgroundColor: isOpen ? colors.infoLight : colors.surface,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.instructionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.instructionHeaderLeft}>
          <View style={[styles.instructionIcon, { backgroundColor: colors.info }]}>
            <Text style={styles.instructionIconText}>{iconText}</Text>
          </View>
          <Text style={[styles.instructionHeaderText, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ArrowDown2
            size={getIconSize('medium')}
            color={colors.text}
            variant="Outline"
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, overflow: 'hidden' }}>
        <View
          style={styles.instructionContentWrapper}
          onLayout={handleContentLayout}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

export const VirtualAccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Allow multiple sections to be expanded
  const [expandedSections, setExpandedSections] = useState<string[]>(['atm']);

  const params = route.params as RouteParams | undefined;
  const amount = params?.amount || 200000;
  const paymentMethod = params?.paymentMethod || 'bsi1';

  // Calculate expiry time (24 hours from now)
  const [expiryTime] = useState(() => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  });

  const [timeRemaining, setTimeRemaining] = useState({
    hours: 23,
    minutes: 56,
    seconds: 3,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleCopyVA = async () => {
    try {
      const vaNumber = VIRTUAL_ACCOUNT.replace(/\s/g, '');
      await Clipboard.setString(vaNumber);

      Toast.show({
        type: 'success',
        text1: t('virtualAccount.copied'),
        text2: vaNumber,
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('virtualAccount.copyFailed'),
        position: 'bottom',
      });
    }
  };

  const handleCopyAmount = async () => {
    try {
      const amountString = amount.toString().replace(/\D/g, '');
      await Clipboard.setString(amountString);
      Toast.show({
        type: 'success',
        text1: t('virtualAccount.amountCopied'),
        text2: amountString,
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('virtualAccount.amountCopyFailed'),
        position: 'bottom',
      });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      if (prev.includes(section)) {
        return prev.filter((s) => s !== section);
      } else {
        return [...prev, section];
      }
    });
  };

  // Bottom sheet petunjuk pembayaran
  const snapPoints = [0.39, 0.85];
  const { height, panResponder } = useDraggableBottomSheet(snapPoints);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft2
            size={getIconSize('medium')}
            color={colors.text}
            variant="Outline"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('virtualAccount.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Up Summary Card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              {t('virtualAccount.totalTopUp')}
            </Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.summaryAmount, { color: colors.text }]}>
                Rp {amount.toLocaleString('id-ID')}
              </Text>
              <TouchableOpacity
                onPress={handleCopyAmount}
                style={styles.copyIconSmall}
                activeOpacity={0.7}
              >
                <Copy size={16} color={colors.primary} variant="Outline" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.expiryRow}>
              <Text style={[styles.expiryLabel, { color: colors.text }]}>
                {t('virtualAccount.payBefore')}
            </Text>
            <View style={styles.expiryRight}>
              <Text style={[styles.expiryTime, { color: colors.error }]}>
                {timeRemaining.hours} {t('virtualAccount.hours')}{' '}
                {timeRemaining.minutes} {t('virtualAccount.minutes')}{' '}
                {timeRemaining.seconds} {t('virtualAccount.seconds')}
              </Text>
              <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                {t('virtualAccount.dueDate')} {formatDate(expiryTime)},{' '}
              </Text>
              <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                {formatTime(expiryTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Virtual Account Details Card */}
        <View
          style={[
            styles.vaCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Bank Logo and Name */}
          <View style={styles.bankHeader}>
            <View style={[styles.bankLogoContainer, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.bankLogoText, { color: colors.success }]}>
                BSI
              </Text>
            </View>
            <Text style={[styles.bankName, { color: colors.text }]}>
              {BANK_NAME}
            </Text>
          </View>

          {/* Virtual Account Number */}
          <View style={styles.vaNumberSection}>
            <Text style={[styles.vaLabel, { color: colors.textSecondary }]}>
              {t('virtualAccount.title')}
            </Text>
            <View style={styles.vaNumberRow}>
              <Text style={[styles.vaNumber, { color: colors.info }]}>
                {VIRTUAL_ACCOUNT}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyVA}
                activeOpacity={0.7}
              >
                <Copy
                  size={getIconSize('medium')}
                  color={colors.info}
                  variant="Outline"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Note */}
          <Text style={[styles.vaNote, { color: colors.textSecondary }]}>
            *{t('virtualAccount.onlyAcceptsFrom')} {BANK_NAME}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom sheet petunjuk pembayaran */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            backgroundColor: colors.surface,
            height: height,
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
      >
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View
            style={[styles.dragHandle, { backgroundColor: colors.border }]}
          />
        </View>

        <ScrollView
          style={styles.bottomSheetScrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bottomSheetContent}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              {t('virtualAccount.instructions')}
            </Text>

            {/* ATM Instructions */}
            <AccordionItem
              title={t('virtualAccount.usingATM')}
              iconText="ATM"
              isOpen={expandedSections.includes('atm')}
              onToggle={() => toggleSection('atm')}
              colors={colors}
            >
              <View style={styles.instructionSteps}>
                {[
                  t('virtualAccount.step1'),
                  t('virtualAccount.step2'),
                  t('virtualAccount.step3'),
                  t('virtualAccount.step4'),
                  t('virtualAccount.step5'),
                  t('virtualAccount.step6'),
                ].map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepNumber,
                        { backgroundColor: colors.info },
                      ]}
                    >
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </AccordionItem>

            {/* M-Banking Instructions */}
            <AccordionItem
              title={t('virtualAccount.usingMBanking')}
              iconText="M"
              isOpen={expandedSections.includes('mbanking')}
              onToggle={() => toggleSection('mbanking')}
              colors={colors}
            >
              <View style={styles.instructionSteps}>
                {[
                  t('virtualAccount.mStep1'),
                  t('virtualAccount.mStep2'),
                  t('virtualAccount.mStep3'),
                  t('virtualAccount.mStep4'),
                  t('virtualAccount.mStep5'),
                  t('virtualAccount.mStep6'),
                ].map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepNumber,
                        { backgroundColor: colors.info },
                      ]}
                    >
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </AccordionItem>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// Default export untuk kompatibilitas
export default VirtualAccountScreen;

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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.semiBold,
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
    paddingBottom: moderateVerticalScale(200),
  },
  summaryCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  copyIconSmall: {
    padding: 4,
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  summaryAmount: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  summaryDivider: {
    height: 1,
    marginBottom: moderateVerticalScale(12),
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expiryRight: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.medium,
    marginTop: moderateVerticalScale(2),
  },
  expiryTime: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(2),
    textAlign: 'right',
  },
  dueDate: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'right',
  },
  vaCard: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(20),
    marginBottom: moderateVerticalScale(16),
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(20),
  },
  bankLogoContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  bankLogoText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  bankName: {
    fontSize: moderateScale(15),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
  },
  vaNumberSection: {
    marginBottom: moderateVerticalScale(16),
  },
  vaLabel: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  vaNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaNumber: {
    fontSize: moderateScale(22),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: scale(1),
  },
  copyButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaNote: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
    fontStyle: 'italic',
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
  },
  dragHandle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
  bottomSheetScrollView: {
    flex: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(24),
  },
  instructionsTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
  },
  instructionCard: {
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    overflow: 'hidden',
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    minHeight: minTouchTarget,
  },
  instructionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructionIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  instructionIconText: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  instructionHeaderText: {
    fontSize: moderateScale(15),
    fontFamily: FontFamily.monasans.semiBold,
  },
  instructionContentWrapper: {
    position: 'absolute',
    width: '100%',
  },
  instructionSteps: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: moderateVerticalScale(12),
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateScale(20),
  },
});
