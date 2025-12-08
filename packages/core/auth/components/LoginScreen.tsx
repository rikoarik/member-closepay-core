/**
 * LoginScreen Component
 * Login form dengan validation dan styling menggunakan NativeWind
 * Design sesuai dengan Figma
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
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
} from '../../config';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { Eye, EyeSlash } from 'iconsax-react-nativejs';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const { login, loginWithNonce, isLoggingIn, error, clearError } = useAuth();
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
      setIdentifierError('Username, Email, atau Nomor HP tidak boleh kosong');
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

  const minTouchTarget = getMinTouchTarget();
  const horizontalPadding = getHorizontalPadding();
  const verticalPadding = getVerticalPadding();
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
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
          <View style={[styles.content, { paddingHorizontal: horizontalPadding, backgroundColor: 'transparent' }]}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoInner}>
                  <Text style={styles.logoText}>GWA</Text>
                </View>
              </View>
            </View>

            {/* Login Form */}
            <View style={[styles.formSection, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.title, { color: colors.text }]}>{t('auth.login')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('auth.loginSubtitle')}
              </Text>

              {/* Identifier Input - Username, Email, or Phone */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Username / Email / No HP</Text>
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
                  placeholder="Masukkan username, email, atau nomor HP"
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
                    // Info message - bisa diganti dengan navigasi ke forgot password screen
                    console.log('Forgot password clicked');
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
                  onPress={() => {
                    // TODO: Navigate to customer service or open contact
                    console.log('Customer service clicked');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isLoggingIn}>
                  <Text style={[styles.customerServiceText, { color: colors.primary }]}>
                    {t('auth.customerService')}
                  </Text>
                </TouchableOpacity>
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
    </View>
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
    flex: 1,
    justifyContent: 'center',
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(24),
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoContainer: {
    width: scale(100),
    height: scale(100),
    backgroundColor: '#FFD700',
    borderRadius: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(3),
    borderColor: '#DC2626',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoInner: {
    width: scale(88),
    height: scale(88),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.bold,
    color: '#DC2626',
    letterSpacing: 1,
  },
  formSection: {

    paddingHorizontal: getHorizontalPadding(),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  subtitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(32),
    lineHeight: moderateVerticalScale(20),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
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
    marginTop: moderateVerticalScale(8),
    paddingVertical: moderateVerticalScale(4),
    paddingHorizontal: moderateVerticalScale(4),
  },
  forgotPasswordText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  loginButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
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
    marginTop: moderateVerticalScale(12),
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
});


