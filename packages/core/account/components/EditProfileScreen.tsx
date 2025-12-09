/**
 * EditProfileScreen Component
 * Screen untuk edit profile user
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useAuth } from '@core/auth';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(user?.email || 'Zakkitampan@gmail.com');
  const [name, setName] = useState(user?.name || 'Ilham Tarore');
  const [phone, setPhone] = useState('0892132731');
  const [address, setAddress] = useState('Bener, kec tengaran, kab semarang');
  const [isSaving, setIsSaving] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const emailInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Setup input refs
  useEffect(() => {
    inputRefs.current = {
      email: emailInputRef.current,
      name: nameInputRef.current,
      phone: phoneInputRef.current,
      address: addressInputRef.current,
    };
  }, []);

  // Auto scroll to focused input when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Find which input is focused
        const focusedInput = Object.keys(inputRefs.current).find((key) => {
          const input = inputRefs.current[key];
          return input && input.isFocused();
        });

        if (focusedInput && scrollViewRef.current) {
          // Scroll to focused input with some offset
          setTimeout(() => {
            const inputIndex = ['email', 'name', 'phone', 'address'].indexOf(focusedInput);
            const scrollOffset = inputIndex * moderateVerticalScale(100); // Approximate offset per input
            scrollViewRef.current?.scrollTo({
              y: scrollOffset,
              animated: true,
            });
          }, 100);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError(t('profile.emailRequired'));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('profile.emailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate name
    if (!name.trim()) {
      setNameError(t('profile.nameRequired'));
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate phone
    if (!phone.trim()) {
      setPhoneError(t('profile.phoneRequired'));
      isValid = false;
    } else if (!/^[0-9+\-\s()]+$/.test(phone.trim())) {
      setPhoneError(t('profile.phoneInvalid'));
      isValid = false;
    } else {
      setPhoneError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement API call to update profile
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      // @ts-ignore - navigation type akan di-setup nanti
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top: 0}
        >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              paddingHorizontal: getHorizontalPadding(),
              paddingBottom: moderateVerticalScale(16),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: moderateScale(20),
              },
            ]}
          >
            {t('profile.editProfile')}
          </Text>
          <View style={{ width: getIconSize('medium') }} />
        </View>

        {/* Form */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: getHorizontalPadding() },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('auth.email')}
            </Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: emailError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => nameInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }, 100);
              }}
            />
            {emailError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text>
            ) : null}
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.name')}
            </Text>
            <TextInput
              ref={nameInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: nameError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterName')}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              autoCapitalize="words"
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: moderateVerticalScale(100), animated: true });
                }, 100);
              }}
            />
            {nameError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{nameError}</Text>
            ) : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.phoneNumber')}
            </Text>
            <TextInput
              ref={phoneInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: phoneError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterPhoneNumber')}
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => addressInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: moderateVerticalScale(200), animated: true });
                }, 100);
              }}
            />
            {phoneError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text>
            ) : null}
          </View>

          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.address')}
            </Text>
            <TextInput
              ref={addressInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterAddress')}
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSaving}
              returnKeyType="done"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: moderateVerticalScale(300), animated: true });
                }, 100);
              }}
            />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Save Button - Footer (absolute positioning agar tidak ikut keyboard) */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: getHorizontalPadding(),
            paddingTop: moderateVerticalScale(16),
            paddingBottom: insets.bottom + moderateVerticalScale(16),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saveButtonText,
              {
                color: colors.surface,
                fontSize: getResponsiveFontSize('large'),
              },
            ]}
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: moderateVerticalScale(4),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(100), // Space untuk footer
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    fontFamily: FontFamily.monasans.regular,
    minHeight: getMinTouchTarget(),
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(6),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
});

