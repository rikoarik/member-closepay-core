/**
 * OnboardingScreen Component
 * Screen untuk first-time user experience dengan permission requests
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useTranslation } from '../../../i18n';
import { moderateVerticalScale, moderateScale } from '../../utils/responsive';
import {
  permissionService,
  type PermissionResult,
} from '../../services/permissionService';
import { PhoneMockup } from '../phone-mockup';
import { styles } from './styles';
import type { OnboardingStep } from './types';
import { ONBOARDING_STEPS } from './constants';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { colors, isDark, setThemeMode, mode: themeMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    ONBOARDING_STEPS[0]
  );
  const [permissionStatus, setPermissionStatus] = useState<{
    notifications?: PermissionResult;
    camera?: PermissionResult;
    location?: PermissionResult;
  }>({});

  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef<ScrollView>(null);
  const phoneImageScrollRef = useRef<ScrollView>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const getStepIndex = (step: OnboardingStep): number => {
    return ONBOARDING_STEPS.indexOf(step);
  };

  const getStepFromIndex = (index: number): OnboardingStep => {
    return ONBOARDING_STEPS[index] || ONBOARDING_STEPS[0];
  };

  // Request permission when user clicks "Aktifkan" button
  const handleActivatePermission = async () => {
    try {
      let result: PermissionResult | null = null;

      if (currentStep === 'notifications') {
        result = await permissionService.requestNotificationPermission();
        setPermissionStatus(prev => ({ ...prev, notifications: result! }));
        console.log('Notification permission result:', result);
      } else if (currentStep === 'camera') {
        result = await permissionService.requestCameraPermission();
        setPermissionStatus(prev => ({ ...prev, camera: result! }));
        console.log('Camera permission result:', result);
      } else if (currentStep === 'location') {
        result = await permissionService.requestLocationPermission();
        setPermissionStatus(prev => ({ ...prev, location: result! }));
        console.log('Location permission result:', result);
      } else if (currentStep === 'language') {
        // Language step doesn't need permission, just proceed
        // Language is already set via onLanguageChange in PhoneMockup
        console.log('Language step - no permission needed');
      }

      // Permission dialog will appear automatically via permissionService
      // State will update after user responds to permission dialog
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  // Check if permission is granted for current step
  const isPermissionGranted = (step: OnboardingStep): boolean => {
    // Theme and language steps don't need permission
    if (step === 'theme' || step === 'language') return true;

    if (step === 'notifications') {
      return permissionStatus.notifications?.status === 'granted';
    }
    if (step === 'camera') {
      return permissionStatus.camera?.status === 'granted';
    }
    if (step === 'location') {
      return permissionStatus.location?.status === 'granted';
    }
    return false;
  };

  const handleNext = async () => {
    const currentIndex = getStepIndex(currentStep);

    // Check if permission is granted (or step doesn't need permission)
    const canProceed = isPermissionGranted(currentStep);

    if (!canProceed) {
      // Permission not granted, don't proceed
      return;
    }

    // Move to next step or complete
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStep = ONBOARDING_STEPS[nextIndex];
      setCurrentStep(nextStep);
      setCurrentPageIndex(nextIndex);
      const scrollX = nextIndex * screenWidth;
      // Smooth scroll animation - sync both scroll views
      scrollViewRef.current?.scrollTo({
        x: scrollX,
        animated: true,
      });
      phoneImageScrollRef.current?.scrollTo({
        x: scrollX,
        animated: true,
      });
    } else {
      // Complete onboarding
      onComplete();
    }
  };

  const handleScrollEnd = async (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);

    if (index !== currentPageIndex) {
      // Check if user can swipe to next step
      // Can only swipe forward if current step permission is granted (or doesn't need permission)
      const isSwipeForward = index > currentPageIndex;

      if (isSwipeForward && !isPermissionGranted(currentStep)) {
        // Prevent swipe forward - scroll back to current position
        const scrollX = currentPageIndex * screenWidth;
        scrollViewRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        phoneImageScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        return;
      }

      // Allow swipe backward or forward (if permission granted)
      setCurrentPageIndex(index);
      const newStep = getStepFromIndex(index);
      setCurrentStep(newStep);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        // Sync phone image scroll with text scroll
        phoneImageScrollRef.current?.scrollTo({
          x: offsetX,
          animated: false,
        });
      },
    }
  );

  const handleSkip = () => {
    // Skip current step and move to next
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStep = ONBOARDING_STEPS[nextIndex];
      setCurrentStep(nextStep);
      const scrollX = nextIndex * screenWidth;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        phoneImageScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
      }, 100);
    } else {
      onComplete();
    }
  };

  const renderStepContent = (step: OnboardingStep = currentStep) => {
    return (
      <View style={styles.textContentContainer}>
        {/* Title and Description */}
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t(`onboarding.${step}.title`)}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            { color: colors.textSecondary },
          ]}
        >
          {t(`onboarding.${step}.description`)}
        </Text>

        {/* Theme Selection Buttons - Only for theme step */}
        {step === 'theme' && (
          <View style={styles.themeButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'system' && {
                  backgroundColor: colors.primary,
                },
                themeMode !== 'system' && {
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              onPress={() => setThemeMode('system')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      themeMode === 'system' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {t('onboarding.themeOptions.system')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'light' && {
                  backgroundColor: colors.primary,
                },
                themeMode !== 'light' && {
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              onPress={() => setThemeMode('light')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      themeMode === 'light' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {t('onboarding.themeOptions.light')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'dark' && {
                  backgroundColor: colors.primary,
                },
                themeMode !== 'dark' && {
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              onPress={() => setThemeMode('dark')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {t('onboarding.themeOptions.dark')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Language Selection Buttons - Only for language step */}
        {step === 'language' && (
          <View style={styles.languageButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'id' && {
                  backgroundColor: colors.primary,
                },
                language !== 'id' && {
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              onPress={() => setLanguage('id')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  {
                    color:
                      language === 'id' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {t('onboarding.languageOptions.indonesian')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && {
                  backgroundColor: colors.primary,
                },
                language !== 'en' && {
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
              onPress={() => setLanguage('en')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  {
                    color:
                      language === 'en' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {t('onboarding.languageOptions.english')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Initialize scroll position on mount
  React.useEffect(() => {
    const initialIndex = getStepIndex(currentStep);
    setCurrentPageIndex(initialIndex);
    const scrollX = initialIndex * screenWidth;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: scrollX,
        animated: false,
      });
      phoneImageScrollRef.current?.scrollTo({
        x: scrollX,
        animated: false,
      });
    }, 100);
  }, [currentStep, screenWidth]);

  // Don't auto-request permission on step change
  // Permission will be requested when user clicks "Aktifkan" button

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Phone Image - Scrollable with Text */}
      <View style={styles.phoneImageContainer}>
        <ScrollView
          ref={phoneImageScrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.phoneImageScrollView}
          contentContainerStyle={styles.phoneImageScrollViewContent}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={false}
        >
          {ONBOARDING_STEPS.map((step, index) => (
            <View key={step} style={[styles.phoneImagePage, { width: screenWidth }]}>
              <PhoneMockup
                screenType={step}
                colors={colors}
                isDark={isDark}
                themeMode={themeMode}
                onThemeModeChange={setThemeMode}
                language={language}
                onLanguageChange={setLanguage}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Card Container with Button Below */}
      <View
        style={[
          styles.cardContainer,
          {
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
      >
        {/* Card Base */}
        <View style={[styles.stepContentCard, { backgroundColor: colors.surface }]}>
          {/* Pagination Indicator - Fixed Position Above Title */}
          <View style={styles.paginationContainer}>
            {ONBOARDING_STEPS.map((_, index) => {
              const isCompleted = index < getStepIndex(currentStep);
              const isActive = index === getStepIndex(currentStep);
              const isActiveOrCompleted = isActive || isCompleted;

              return (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor: isActiveOrCompleted
                        ? colors.primary
                        : colors.border,
                      width: isActiveOrCompleted ? moderateScale(24) : moderateScale(8),
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Text Content - Scrollable */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={styles.textScrollView}
            contentContainerStyle={styles.textScrollViewContent}
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={false}
          >
            {ONBOARDING_STEPS.map((step, index) => {
              const stepToRender = index === currentPageIndex ? currentStep : step;
              return (
                <View key={step} style={[styles.textPage, { width: screenWidth }]}>
                  <View style={styles.textPageContent}>
                    {renderStepContent(stepToRender)}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Bottom button - Below Card */}
        <View
          style={[
            styles.bottomContainer,
            {
              backgroundColor: colors.background,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
        >
          {isPermissionGranted(currentStep) ? (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, { color: colors.surface }]}>{t('common.next')}</Text>
            </TouchableOpacity>
          ) : currentStep !== 'theme' && currentStep !== 'language' ? (
            <TouchableOpacity
              style={[styles.activateButton, { backgroundColor: colors.primary }]}
              onPress={handleActivatePermission}
              activeOpacity={0.8}
            >
              <Text style={[styles.activateButtonText, { color: colors.surface }]}>
                {t('onboarding.activate')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, { color: colors.surface }]}>{t('common.next')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

