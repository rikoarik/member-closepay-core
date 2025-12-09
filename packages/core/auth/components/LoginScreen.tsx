/**
 * LoginScreen Component
 * Login form dengan validation dan styling menggunakan NativeWind
 * Design sesuai dengan Figma
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Keyboard,
  Image,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@core/auth';
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
  ErrorModal,
  getAppVersion,
  useConfig,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Eye, EyeSlash } from 'iconsax-react-nativejs';
import Svg, { Path } from 'react-native-svg';
import { LogoClosepay } from '@core/config';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onSignUpPress?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSignUpPress,
}) => {
  const navigation = useNavigation();
  const { login, loginWithNonce, isLoggingIn, error, clearError, user, company } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState(''); // username, email, or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const identifierInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get config dari service (simple, tidak reactive untuk prevent loop)
  const { config } = useConfig();

  const loginConfig = config?.login || {};
  const showSignUp = loginConfig.showSignUp !== false; // Default true
  const showSocialLogin = loginConfig.showSocialLogin === true; // Default false
  const socialProviders = loginConfig.socialLoginProviders || ['google']; // Default only Google, no Facebook
  const logoUri = config?.branding?.logo || '';
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const decoAnim = useRef(new Animated.Value(0)).current;

  // Soft floating animation for decorations
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(decoAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(decoAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [decoAnim]);

  // Get app version on mount (async)
  useEffect(() => {
    const loadVersion = async () => {
      try {
        // Try to get from native module async
        const AppVersionModule = require('react-native').NativeModules.AppVersionModule;
        if (AppVersionModule && typeof AppVersionModule.getVersion === 'function') {
          const version = await AppVersionModule.getVersion();
          if (version) {
            setAppVersion(version);
            return;
          }
        }
      } catch (error) {
        // Ignore and use fallback
      }
      
      // Fallback to sync version from package.json
      setAppVersion(getAppVersion());
    };
    loadVersion();
  }, []);

  // Show error modal only for API response errors
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Clear validation errors when user types
  useEffect(() => {
    if (identifier) setIdentifierError('');
    if (password) setPasswordError('');
  }, [identifier, password]);


  const validateForm = (): boolean => {
    let isValid = true;

    // identifier can be username, email, or phone - just check if not empty
    if (!identifier.trim()) {
      setIdentifierError(t('auth.identifierRequired'));
      isValid = false;
    } else {
      setIdentifierError('');
    }

    if (!password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('auth.passwordMinLength'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Use loginWithNonce with Basic Auth - pass username and password
      await loginWithNonce(identifier.trim(), password);
      // Navigation otomatis via AuthNavigator
      console.log('[LoginScreen] Login successful');
    } catch (err) {
      // Error sudah di-handle di store dan ditampilkan via modal
      console.error('[LoginScreen] Login error:', err);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    if (error) {
      clearError();
    }
  };

  // Handle customer service WhatsApp
  const handleCustomerService = async () => {
    try {
      // WhatsApp number - bisa di-config atau hardcode
      const phone = '6289526643223'; // Format internasional tanpa +
      
      // Get user info (jika sudah login, kalau belum kosong)
      const userName = user?.name || '';
      const userEmail = user?.email || '';
      const companyName = company?.name || config?.companyName || '';
      const birthDate = ''; // Bisa diambil dari user profile jika ada
      
      // Template message
      const message = `Permisi kak, Aku ada kendala nih, bisa bantu? \n\n` +
        `Nama : ${userName}\n` +
        `Email : ${userEmail}\n` +
        `Company : ${companyName}\n` +
        `Tanggal Lahir : ${birthDate}\n` +
        `Perihal : `;
      
      // Encode message untuk URL
      const encodedMessage = encodeURIComponent(message);
      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
      
      // Check if WhatsApp can be opened
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback: open in browser
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback: try to open anyway
      try {
        const phone = '6289526643223';
        const message = 'Permisi kak, Aku ada kendala nih, bisa bantu?';
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
        await Linking.openURL(url);
      } catch (fallbackError) {
        console.error('Error opening WhatsApp fallback:', fallbackError);
      }
    }
  };

  const minTouchTarget = getMinTouchTarget();
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();
  const screenHeight = Dimensions.get('window').height;

  return (
    
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Absolute positioned background to ensure full coverage */}
      <View
        style={[
          styles.absoluteBackground,
          { backgroundColor: colors.background }
        ]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -verticalScale(300)}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              backgroundColor: 'transparent',
              flexGrow: 1,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentInsetAdjustmentBehavior="automatic">
          <View style={[styles.content, {  backgroundColor: 'transparent' }]}>
          
            <View style={styles.pageContainer}>
              {/* Top decoration */}
              <Animated.View
                style={[
                  styles.decorationBubble,
                  {
                    backgroundColor: colors.primary,
                    opacity: 0.12,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, -18],
                        }),
                      },
                      {
                        translateX: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 10],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.decorationBubbleSmall,
                  {
                    backgroundColor: colors.primary,
                    opacity: 0.1,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-18, 8],
                        }),
                      },
                      {
                        translateX: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                      {
                        scale: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1.02, 1.08],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.decorationBubbleTiny,
                  {
                    backgroundColor: colors.primary,
                    opacity: 0.08,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, -10],
                        }),
                      },
                      {
                        translateX: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [3, -2],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.decorationBubbleMini,
                  {
                    backgroundColor: colors.primary,
                    opacity: 0.05,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -4],
                        }),
                      },
                      {
                        translateX: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-2, 4],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.decorationBubbleExtra,
                  {
                    backgroundColor: colors.primary,
                    opacity: 0.07,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-6, 6],
                        }),
                      },
                      {
                        translateX: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-6, 4],
                        }),
                      },
                      {
                        scale: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.05],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.decorationRing,
                  {
                    borderColor: colors.primary,
                    transform: [
                      {
                        translateY: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 8],
                        }),
                      },
                      {
                        scale: decoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.98, 1.04],
                        }),
                      },
                    ],
                    opacity: decoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.05, 0.08],
                    }),
                  },
                ]}
              />

              <View style={styles.logoWrapper}>
                <View style={[styles.logoContainer, { backgroundColor: colors.background, opacity: 0.8 }]}>
                  {logoUri ? (
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.logoImage}
                      resizeMode="cover"
                    />
                  ) : (
                      <View style={styles.logoPlaceholder}>
                        <LogoClosepay
                          width={scale(60)}
                          height={scale(60)}
                        />
                      </View>
                  )}
                </View>
              </View>
              <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
                {/* Logo & version */}
                <View style={[styles.topBar, { backgroundColor: 'transparent', paddingVertical: verticalScale(10) }]}>
                  
                  <Text style={[styles.versionText, { color: colors.textSecondary, backgroundColor: colors.surfaceSecondary || '#F1F5F9' }]}>
                    version {appVersion} - {config?.companyName}
                  </Text>
                </View>

                {/* Login Form */}
                <View style={[styles.formContainer, { backgroundColor: 'transparent' }]}>
                <View style={[styles.formSection, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.title, { color: colors.text }]}>{t('auth.login')}</Text>
                {/* Identifier Input - Username, Email, or Phone */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>{t('auth.identifierLabel')}</Text>
                  <TextInput
                    ref={identifierInputRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: identifierError ? colors.error : colors.border,
                        color: colors.text,
                      },
                      identifierFocused && {
                        borderColor: colors.primary,
                        backgroundColor: colors.inputFocused,
                      },
                      identifierError && {
                        borderColor: colors.error,
                        backgroundColor: colors.inputError,
                      },
                    ]}
                    placeholder={t('auth.enterIdentifier')}
                    placeholderTextColor={colors.textTertiary}
                    value={identifier}
                    onChangeText={setIdentifier}
                    onFocus={() => setIdentifierFocused(true)}
                    onBlur={() => setIdentifierFocused(false)}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoggingIn}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                  {identifierError ? (
                    <Text style={[styles.errorText, { color: colors.error }]}>{identifierError}</Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>{t('auth.password')}</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={passwordInputRef}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: passwordError ? colors.error : colors.border,
                          color: colors.text,
                        },
                        passwordFocused && {
                          borderColor: colors.primary,
                          backgroundColor: colors.inputFocused,
                        },
                        passwordError && {
                          borderColor: colors.error,
                          backgroundColor: colors.inputError,
                        },
                      ]}
                      placeholder={t('auth.enterPassword')}
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoggingIn}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      disabled={isLoggingIn}>
                      {showPassword ? (
                        <Eye size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
                      ) : (
                        <EyeSlash size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
                  ) : null}

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => {
                      // @ts-ignore - navigation type will be inferred
                      navigation.navigate('ForgotPassword');
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={isLoggingIn}>
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                      {t('auth.forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: colors.primary },
                    isLoggingIn && { backgroundColor: colors.textTertiary, opacity: 0.7 },
                  ]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                  activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    {isLoggingIn ? (
                      <ActivityIndicator
                        color={colors.surface}
                        size="small"
                      />
                    ) : (
                      <Text style={[styles.loginButtonText, { color: colors.surface }]}>
                        {t('auth.loginButton')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Need Help Section */}
                <View style={styles.needHelpContainer}>
                  <Text style={[styles.needHelpText, { color: colors.textSecondary }]}>
                    {t('auth.needHelp')}{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCustomerService}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={isLoggingIn}>
                    <Text style={[styles.customerServiceText, { color: colors.primary }]}>
                      {t('auth.customerService')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Social Login Section */}
                {showSocialLogin && (
                  <>
                    {/* Separator */}
                    <View style={styles.separatorContainer}>
                      <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                      <Text style={[styles.separatorText, { color: colors.textSecondary }]}>
                        {t('auth.or')}
                      </Text>
                      <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Social Login Buttons */}
                    {socialProviders.includes('google') && (
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => {
                          // TODO: Implement Google login
                          console.log('Google login clicked');
                        }}
                        disabled={isLoggingIn}
                        activeOpacity={0.8}>
                        <View style={styles.socialButtonContent}>
                          {/* Google Logo SVG */}
                          <Svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24">
                            <Path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <Path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <Path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <Path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </Svg>
                          <Text style={[styles.socialButtonText, { color: colors.text }]}>
                            {t('auth.continueWithGoogle')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Sign Up Link */}
                {showSignUp && (
                  <View style={styles.signUpContainer}>
                    <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
                      {t('auth.dontHaveAccount')}{' '}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (onSignUpPress) {
                          onSignUpPress();
                        } else {
                          // @ts-ignore - navigation type will be inferred
                          navigation.navigate('SignUp');
                        }
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      disabled={isLoggingIn}>
                      <Text style={[styles.signUpLink, { color: colors.primary }]}>
                        {t('auth.signUp')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
        </ScrollView>

        {/* Error Modal - Only for API response errors */}
        <ErrorModal
          visible={showErrorModal}
          title={t('auth.loginFailed')}
          message={error || t('auth.loginError')}
          onClose={handleCloseErrorModal}
          buttonText={t('common.ok')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(32),
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pageContainer: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    position: 'relative',
    paddingTop: verticalScale(56),
  },
  decorationBubble: {
    position: 'absolute',
    top: verticalScale(-82),
    left: scale(-36),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    zIndex: 0,
  },
  decorationBubbleSmall: {
    position: 'absolute',
    top: verticalScale(-36),
    right: scale(-20),
    width: scale(170),
    height: scale(170),
    borderRadius: scale(85),
    zIndex: 0,
  },
  decorationBubbleTiny: {
    position: 'absolute',
    top: verticalScale(-6),
    left: scale(168),
    width: scale(62),
    height: scale(62),
    borderRadius: scale(31),
    zIndex: 0,
  },
  decorationBubbleMini: {
    position: 'absolute',
    top: verticalScale(40),
    left: scale(96),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    zIndex: 0,
  },
  decorationBubbleExtra: {
    position: 'absolute',
    top: verticalScale(-12),
    right: scale(92),
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    zIndex: 0,
  },
  decorationRing: {
    position: 'absolute',
    top: verticalScale(-32),
    left: scale(104),
    width: scale(138),
    height: scale(138),
    borderRadius: scale(69),
    borderWidth: 1.2,
    opacity: 0.09,
    zIndex: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(16),
    position: 'relative',
  },
  formContainer: {
    marginTop: verticalScale(10),
    paddingHorizontal: 0,
  },
  logoContainer: {
    width: scale(80), // Increased for larger logo
    height: scale(80), // Increased for larger logo
    borderRadius: scale(60), // Fully rounded (half of width/height) - perfect circle
    overflow: 'hidden', // Ensure content is clipped to circle
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 20px 6px rgba(0, 0, 0, 0.2)',
    
  },
  logoImage: {
    width: '110%',
    height: '110%',
    // Image will be clipped by parent's overflow: 'hidden' and borderRadius
  },
  logoPlaceholder: {
    width: '110%',
    height: '110%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  versionText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    position: 'absolute',
    right: scale(8),
    top: verticalScale(8),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(30),
  },
  formSection: {
    paddingHorizontal: getHorizontalPadding(),
  },
  mainCard: {
    width: '100%',
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    paddingTop: verticalScale(16),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
    // Glassmorphism: semi-transparent surface + soft stroke + deep shadow
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.22,
        shadowRadius: 32,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  formCard: {
    borderRadius: 0,
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  logoWrapper: {
    position: 'absolute',
    top: verticalScale(20),
    left: 0,
    right: 0,
    marginLeft: scale(28),
    alignItems: 'flex-start',
    zIndex: 2,
    
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'left',
    marginTop: moderateVerticalScale(34),
    marginBottom: moderateVerticalScale(16),
  },
  subtitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'left',
    marginBottom: moderateVerticalScale(14),
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(18),
    paddingVertical: moderateVerticalScale(16),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    minHeight: getMinTouchTarget(),
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(6),
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: scale(50),
  },
  eyeButton: {
    position: 'absolute',
    right: scale(2),
    top: '30%',
    transform: [{ translateY: -scale(12) }],
    padding: moderateVerticalScale(8),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: moderateVerticalScale(6),
    paddingHorizontal: moderateVerticalScale(6),
  },
  forgotPasswordText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    textDecorationLine: 'underline',
  },
  loginButton: {
    borderRadius: scale(24),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getMinTouchTarget(),
    marginTop: moderateVerticalScale(8),
    marginBottom: moderateVerticalScale(12),
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  loginButtonText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    letterSpacing: 0.5,
  },
  needHelpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  needHelpText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    fontStyle: 'italic',
  },
  customerServiceText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: moderateVerticalScale(16),
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginHorizontal: scale(12),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(24),
    borderWidth: 1,
    paddingVertical: moderateVerticalScale(12),
    paddingHorizontal: scale(16),
    marginBottom: moderateVerticalScale(10),
    minHeight: getMinTouchTarget(),
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  socialButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(8),
  },
  signUpText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  signUpLink: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});



