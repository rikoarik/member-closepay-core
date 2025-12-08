/**
 * Styles untuk PhoneMockup
 */
import { StyleSheet, Platform } from 'react-native';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getResponsiveFontSize,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';

// Phone Body Styles
// Note: backgroundColor, borderColor, dan shadowColor akan di-override secara dynamic di component
export const phoneStyles = StyleSheet.create({
  phoneBody: {
    width: scale(260),
    height: scale(400),
    backgroundColor: '#000', // Will be overridden dynamically
    borderRadius: scale(40),
    position: 'relative',
    borderWidth: 2,
    borderColor: '#222', // Will be overridden dynamically
    ...Platform.select({
      ios: {
        shadowColor: '#000', // Will be overridden dynamically
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  screenContent: {
    flex: 1,
    borderRadius: scale(30),
    marginHorizontal: scale(8), // Kurangi margin agar lebih dekat ke border
    marginTop: scale(8),
    marginBottom: scale(12),
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  muteSwitch: {
    width: scale(6),
    height: scale(25),
    left: scale(-4),
    top: scale(130),
    backgroundColor: '#555', // Will be overridden dynamically
    borderRadius: scale(4),
    position: 'absolute',
    zIndex: 3,
  },
  volumeUpButton: {
    width: scale(6),
    height: scale(50),
    left: scale(-4),
    top: scale(180),
    backgroundColor: '#555', // Will be overridden dynamically
    borderRadius: scale(4),
    position: 'absolute',
    zIndex: 3,
  },
  volumeDownButton: {
    width: scale(6),
    height: scale(50),
    left: scale(-4),
    top: scale(250),
    backgroundColor: '#555', // Will be overridden dynamically
    borderRadius: scale(4),
    position: 'absolute',
    zIndex: 3,
  },
  powerButton: {
    width: scale(6),
    height: scale(80),
    right: scale(-4),
    top: scale(170),
    backgroundColor: '#555', // Will be overridden dynamically
    borderRadius: scale(4),
    position: 'absolute',
    zIndex: 3,
  },
});

// Screen Content Styles
export type ScreenContentStyles = typeof screenContentStyles;

export const screenContentStyles = StyleSheet.create({
  // Notification Screen
  notificationScreen: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingTop: scale(8),
    paddingBottom: scale(12),
    gap: scale(8),
  },
  notificationCard: {
    width: '100%',
    padding: scale(12),
    borderRadius: scale(10),
    gap: scale(6),
    marginBottom: scale(8),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationCardExpanded: {
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(4),
  },
  notificationHeaderRounded: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(6),
    borderRadius: scale(8),
    marginHorizontal: scale(-4),
    marginTop: scale(-4),
    backgroundColor: '#F5F5F5',
  },
  notificationAppNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationAppName: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  notificationTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
    marginTop: scale(2),
  },
  notificationText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateScale(18),
    marginTop: scale(4),
  },
  // Camera Screen
  cameraScreen: {
    flex: 1,
    backgroundColor: '#7f7f7f',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraHint: {
    position: 'absolute',
    top: scale(60),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  qrFrame: {
    width: scale(180),
    height: scale(180),
    borderWidth: scale(3),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(12),
  },
  qrCodeContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: scale(2),
    opacity: 0.8,
  },
  // Theme Screen
  themeScreen: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingTop: scale(8),
    paddingBottom: scale(12),
  },
  themeHeaderBar: {
    width: '100%',
    height: scale(40),
    borderRadius: scale(8),
    marginBottom: scale(16),
  },
  themeInputFields: {
    width: '100%',
    gap: scale(12),
    marginBottom: scale(16),
  },
  themeInput: {
    width: '100%',
    height: scale(40),
    borderRadius: scale(8),
  },
  themeInputLong: {
    width: '100%',
    height: scale(60),
    borderRadius: scale(8),
  },
  themeToggleContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: scale(8),
    padding: scale(4),
    gap: scale(4),
  },
  themeOption: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  // Map Screen
  mapScreen: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapContent: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  mapPinContainer: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transform: [{ translateX: scale(-24) }, { translateY: scale(-30) }],
  },
  mapPinSvg: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Language Screen
  languageScreen: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingTop: scale(8),
    paddingBottom: scale(12),
  },
  languageHeaderBar: {
    width: '100%',
    height: scale(40),
    borderRadius: scale(8),
    marginBottom: scale(16),
  },
  languageInputFields: {
    width: '100%',
    gap: scale(12),
    marginBottom: scale(16),
  },
  languageInput: {
    width: '100%',
    height: scale(40),
    borderRadius: scale(8),
  },
  languageInputLong: {
    width: '100%',
    height: scale(60),
    borderRadius: scale(8),
  },
  languageToggleContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: scale(8),
    padding: scale(4),
    gap: scale(4),
  },
  languageOption: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});

