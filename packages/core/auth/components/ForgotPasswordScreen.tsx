/**
 * ForgotPasswordScreen Component
 * Screen untuk reset password dengan email dan OTP
 */
import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, authService } from '@core/auth';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
  ErrorModal,
  configService,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';

interface ForgotPasswordScreenProps {
  onBackToLogin?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToLogin,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const config = configService.getConfig();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email'); // email -> otp -> reset
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (emailValue: string): boolean => {
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailValue.trim()) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    if (!emailValue.match(regexEmail)) {
      setEmailError(t('auth.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) return;

    try {
      setLoading(true);
      setError(null);
      
      // Call API to send OTP to email
      await authService.sendForgotPasswordOtp(email);
      
      setStep('otp');
      setSuccess(false);
    } catch (error: any) {
      setError(error.message || t('auth.sendOtpFailed'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError(t('auth.otpRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call API to verify OTP
      await authService.verifyForgotPasswordOtp(email, otp);
      
      setStep('reset');
      setOtpError('');
      setSuccess(false);
    } catch (error: any) {
      setOtpError(error.message || t('auth.otpInvalid'));
      setError(error.message || t('auth.otpInvalid'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~()-_+\-=[\]{};':"|,.<>/?]).{6,}$/;
    
    if (!newPassword.trim()) {
      setError(t('auth.passwordRequired'));
      setShowErrorModal(true);
      return;
    }
    
    if (!newPassword.match(regexPass)) {
      setError(t('auth.passwordMin'));
      setShowErrorModal(true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call API to reset password
      await authService.resetPassword(email, otp, newPassword);
      
      setSuccess(true);
      // Navigate back to login after 2 seconds
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          // @ts-ignore
          navigation.navigate('Login');
        }
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('auth.resetPasswordFailed'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      setOtpError('');
    } else if (step === 'reset') {
      setStep('otp');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      if (onBackToLogin) {
        onBackToLogin();
      } else {
        // @ts-ignore
        navigation.goBack();
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}>
            {/* Header with Back Button */}
            <View style={styles.topBarContainer}>
              <View style={[styles.header, { backgroundColor: colors.surface, paddingVertical: verticalScale(12), borderRadius: scale(12) }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <ArrowLeft2
                    size={getIconSize('medium')}
                    color={colors.text}
                    variant="Linear"
                  />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {t('auth.forgotPassword')}
                </Text>
                <View style={{ width: getIconSize('medium') }} />
              </View>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {success ? (
                <View style={styles.successContainer}>
                  <Text style={[styles.successText, { color: colors.primary }]}>
                    {t('auth.resetPasswordSuccess')}
                  </Text>
                  <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
                    {t('auth.resetPasswordSuccessMessage')}
                  </Text>
                </View>
              ) : (
                <>
                  {/* Step 1: Email Input */}
                  {step === 'email' && (
                    <View style={styles.formSection}>
                      <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {t('auth.forgotPasswordDescription')}
                      </Text>

                      <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('auth.email')}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.inputBackground,
                              borderColor: emailError ? colors.error : colors.border,
                              color: colors.text,
                            },
                            emailFocused && {
                              borderColor: colors.primary,
                              backgroundColor: colors.inputFocused,
                            },
                          ]}
                          placeholder={t('auth.enterEmail')}
                          placeholderTextColor={colors.textTertiary}
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            setEmailError('');
                          }}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => {
                            setEmailFocused(false);
                            validateEmail(email);
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loading}
                          returnKeyType="send"
                          onSubmitEditing={handleSendOtp}
                        />
                        {emailError ? (
                          <Text style={[styles.errorText, { color: colors.error }]}>
                            {emailError}
                          </Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          { backgroundColor: colors.primary },
                          loading && { backgroundColor: colors.textTertiary, opacity: 0.7 },
                        ]}
                        onPress={handleSendOtp}
                        disabled={loading}
                        activeOpacity={0.8}>
                        {loading ? (
                          <ActivityIndicator color={colors.surface} size="small" />
                        ) : (
                          <Text style={[styles.submitButtonText, { color: colors.surface }]}>
                            {t('auth.sendOtp')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Step 2: OTP Input */}
                  {step === 'otp' && (
                    <View style={styles.formSection}>
                      <Text style={[styles.title, { color: colors.text }]}>
                        {t('auth.enterOtp')}
                      </Text>
                      <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {t('auth.otpDescription', { email })}
                      </Text>

                      <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('auth.otp')}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.inputBackground,
                              borderColor: otpError ? colors.error : colors.border,
                              color: colors.text,
                            },
                            otpFocused && {
                              borderColor: colors.primary,
                              backgroundColor: colors.inputFocused,
                            },
                          ]}
                          placeholder={t('auth.otpPlaceholder')}
                          placeholderTextColor={colors.textTertiary}
                          value={otp}
                          onChangeText={(text) => {
                            setOtp(text.replace(/[^0-9]/g, ''));
                            setOtpError('');
                          }}
                          onFocus={() => setOtpFocused(true)}
                          onBlur={() => setOtpFocused(false)}
                          keyboardType="number-pad"
                          maxLength={6}
                          editable={!loading}
                          returnKeyType="done"
                          onSubmitEditing={handleVerifyOtp}
                        />
                        {otpError ? (
                          <Text style={[styles.errorText, { color: colors.error }]}>
                            {otpError}
                          </Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          { backgroundColor: colors.primary },
                          loading && { backgroundColor: colors.textTertiary, opacity: 0.7 },
                        ]}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                        activeOpacity={0.8}>
                        {loading ? (
                          <ActivityIndicator color={colors.surface} size="small" />
                        ) : (
                          <Text style={[styles.submitButtonText, { color: colors.surface }]}>
                            {t('auth.verifyOtp')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Step 3: Reset Password */}
                  {step === 'reset' && (
                    <View style={styles.formSection}>
                      <Text style={[styles.title, { color: colors.text }]}>
                        {t('auth.resetPassword')}
                      </Text>
                      <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {t('auth.resetPasswordDescription')}
                      </Text>

                      <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('auth.newPassword')}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.inputBackground,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                          placeholder={t('auth.enterNewPassword')}
                          placeholderTextColor={colors.textTertiary}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loading}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('auth.confirmPassword')}
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.inputBackground,
                              borderColor: colors.border,
                              color: colors.text,
                            },
                          ]}
                          placeholder={t('auth.enterConfirmPassword')}
                          placeholderTextColor={colors.textTertiary}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          editable={!loading}
                          returnKeyType="done"
                          onSubmitEditing={handleResetPassword}
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          { backgroundColor: colors.primary },
                          loading && { backgroundColor: colors.textTertiary, opacity: 0.7 },
                        ]}
                        onPress={handleResetPassword}
                        disabled={loading}
                        activeOpacity={0.8}>
                        {loading ? (
                          <ActivityIndicator color={colors.surface} size="small" />
                        ) : (
                          <Text style={[styles.submitButtonText, { color: colors.surface }]}>
                            {t('auth.resetPassword')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title={t('auth.error')}
        message={error || t('auth.errorOccurred')}
        onClose={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        buttonText={t('common.ok')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
    flexGrow: 1,
    
    paddingBottom: verticalScale(32),
  },
  content: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
    
  },
  topBarContainer: {
    width: '100%',
    marginBottom: verticalScale(12),
    paddingTop: verticalScale(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: scale(8),
  },
  backButton: {
    padding: scale(8),
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'left',
  },
  formContainer: {
    marginTop: verticalScale(16),
    justifyContent: 'flex-end',
    flex: 1,
    paddingHorizontal: getHorizontalPadding(),
    paddingBottom: verticalScale(24),
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  description: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'left',
    marginBottom: moderateVerticalScale(24),
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(16),
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
    paddingVertical: verticalScale(12),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    minHeight: 48,
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(4),
  },
  submitButton: {
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: moderateVerticalScale(8),
  },
  submitButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  successText: {
    fontSize: moderateScale(20),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  successMessage: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
});

