/**
 * Styles untuk OnboardingScreen
 */
import { StyleSheet, Platform } from 'react-native';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';

const horizontalPadding = getHorizontalPadding();

// Main Screen Styles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: moderateScale(160),
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  phoneImageScrollView: {
    width: '100%',
    height: '100%',
  },
  phoneImageScrollViewContent: {
    alignItems: 'center',
  },
  phoneImagePage: {
    alignItems: 'center',
  },
  phoneImage: {
    width: scale(248),
    height: scale(361),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  stepContentCard: {
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingTop: moderateVerticalScale(32),
    paddingBottom: moderateVerticalScale(24),
    minHeight: moderateVerticalScale(200),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  textScrollView: {
    flex: 1,
  },
  textScrollViewContent: {
    flexGrow: 1,
  },
  textPage: {
    width: '96%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPageContent: {
    width: '96%',
    alignItems: 'center',
  },
  textContentContainer: {
    width: '96%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
    marginTop: moderateVerticalScale(24),
    justifyContent: 'center',
  },
  themeButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(48),
  },
  themeButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
    marginTop: moderateVerticalScale(24),
    justifyContent: 'center',
  },
  languageButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(48),
  },
  languageButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  stepTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(12),
    marginTop: moderateVerticalScale(8),
  },
  stepDescription: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: 0,
  },
  bottomContainer: {
    paddingHorizontal: horizontalPadding,
    paddingBottom: 0,
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: moderateVerticalScale(20),
  },
  paginationDot: {
    height: scale(8),
    borderRadius: scale(4),
  },
  activateButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});

