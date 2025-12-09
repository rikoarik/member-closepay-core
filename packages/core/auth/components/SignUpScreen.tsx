/**
 * SignUpScreen Component
 * Dynamic form based on metadata from backend
 * Supports BasicData and AdditionalData fields
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
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
// DateTimePicker - optional dependency
let DateTimePicker: any = null;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  console.warn('[SignUpScreen] DateTimePicker not available. Date fields will use text input.');
}
import { useAuth, authService, type MetadataItem, type SignUpData, type TagItem } from '@core/auth';
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
  configService,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Eye, EyeSlash, ArrowLeft2 } from 'iconsax-react-nativejs';
import { useNavigation } from '@react-navigation/native';

interface SignUpScreenProps {
  onSignUpSuccess?: () => void;
  onBackToLogin?: () => void;
  googleAuthData?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUpSuccess,
  onBackToLogin,
  googleAuthData,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { company } = useAuth();
  const config = configService.getConfig();
  const companyId = company?.id || config?.companyId || '';

  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [tagList, setTagList] = useState<TagItem[]>([]);
  const [dataOrder, setDataOrder] = useState<SignUpData>({
    companyId,
    additionalData: {},
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customDate, setCustomDate] = useState<Record<string, Date>>({});
  const [selectedData, setSelectedData] = useState<Record<string, any>>({});
  const [extraDatas, setExtraDatas] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const [showDatePickers, setShowDatePickers] = useState<Record<string, boolean>>({});
  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Load metadata on mount - Using dummy data instead of API
  useEffect(() => {
    loadDummyMetadata();
    loadDummyTags();
  }, [companyId]);

  // Initialize form data from metadata
  useEffect(() => {
    if (metadata.length > 0) {
      initializeFormData();
    }
  }, [metadata, googleAuthData]);

  // Dummy metadata - no API call
  const loadDummyMetadata = () => {
    setLoadingMetadata(true);
    
    // Dummy metadata structure
    const dummyMetadata: MetadataItem[] = [
      {
        data: {
          key: 'name',
          display: 'Nama Lengkap',
          typeData: 'Text',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
          extraData: [],
        },
      },
      {
        data: {
          key: 'email',
          display: 'Email',
          typeData: 'Email',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
          extraData: [],
        },
      },
      {
        data: {
          key: 'phone',
          display: 'Nomor Telepon',
          typeData: 'Phone',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
          extraData: [],
        },
      },
      {
        data: {
          key: 'password',
          display: 'Password',
          typeData: 'Text',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
          extraData: [],
        },
      },
      {
        data: {
          key: 'dateOfBirth',
          display: 'Tanggal Lahir',
          typeData: 'Date',
          tag: 'BasicData',
          isRequired: false,
          isVisible: true,
          extraData: [],
        },
      },
    ];
    
    setMetadata(dummyMetadata);
    setLoadingMetadata(false);
  };

  // Dummy tags - no API call
  const loadDummyTags = () => {
    const dummyTags: TagItem[] = [
      {
        name: 'Premium',
        isSelfRegisterSupported: true,
      },
      {
        name: 'Standard',
        isSelfRegisterSupported: true,
      },
    ];
    setTagList(dummyTags);
  };

  const initializeFormData = () => {
    const initialData: SignUpData = {
      companyId,
      additionalData: {},
    };
    const initialDates: Record<string, Date> = {};
    const initialSelected: Record<string, any> = {};
    const initialExtra: Record<string, Array<{ label: string; value: string }>> = {};

    metadata.forEach((meta) => {
      if (!meta.data.isVisible) return;

      const key = meta.data.key;

      if (meta.data.tag === 'BasicData') {
        if (key === 'tags') {
          initialData[key] = [];
        } else if (key === 'email' && googleAuthData) {
          initialData[key] = googleAuthData.email;
        } else if (key === 'name' && googleAuthData) {
          initialData[key] = googleAuthData.name;
        } else {
          initialData[key] = '';
        }

        if (key === 'dateOfBirth' || meta.data.typeData === 'Date' || meta.data.typeData === 'Datetime') {
          initialDates[key] = new Date();
          if (meta.data.typeData === 'Datetime') {
            initialData[key] = new Date().toISOString().slice(0, 19).replace('T', ' ');
          } else {
            initialData[key] = new Date().toISOString().slice(0, 10);
          }
        }
      } else {
        if (meta.data.typeData === 'Flags') {
          initialData.additionalData![key] = [];
        } else {
          initialData.additionalData![key] = '';

          if (meta.data.typeData === 'Date' || meta.data.typeData === 'Datetime') {
            initialDates[key] = new Date();
            if (meta.data.typeData === 'Datetime') {
              initialData.additionalData![key] = new Date().toISOString().slice(0, 19).replace('T', ' ');
            } else {
              initialData.additionalData![key] = new Date().toISOString().slice(0, 10);
            }
          }
        }
      }

      if (meta.data.typeData === 'Enum' && meta.data.extraData) {
        initialExtra[key] = meta.data.extraData.map((el) => ({
          label: el,
          value: el,
        }));
        initialSelected[key] = '';
      }
    });

    setDataOrder(initialData);
    setCustomDate(initialDates);
    setSelectedData(initialSelected);
    setExtraDatas(initialExtra);
  };

  const changeValue = (val: any, key: string, tag: string, type?: string) => {
    if (tag === 'BasicData') {
      if (key.toLowerCase() === 'password') {
        setDataOrder({ ...dataOrder, [key]: val, confirmPassword: val });
      } else {
        setDataOrder({ ...dataOrder, [key]: val });
      }
    } else {
      if (type === 'Flags') {
        const currentFlags = dataOrder.additionalData?.[key] || [];
        const newFlags = currentFlags.includes(val)
          ? currentFlags.filter((f: string) => f !== val)
          : [...currentFlags, val];
        setDataOrder({
          ...dataOrder,
          additionalData: {
            ...dataOrder.additionalData,
            [key]: newFlags,
          },
        });
      } else {
        setDataOrder({
          ...dataOrder,
          additionalData: {
            ...dataOrder.additionalData,
            [key]: val,
          },
        });
      }
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} ${getMonthName(date.getMonth())} ${year}`;
  };

  const formatDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day} ${getMonthName(date.getMonth())} ${year}, ${hours}:${minutes}:${seconds}`;
  };

  const getMonthName = (month: number): string => {
    try {
      const months = [
        t('common.months.january'),
        t('common.months.february'),
        t('common.months.march'),
        t('common.months.april'),
        t('common.months.may'),
        t('common.months.june'),
        t('common.months.july'),
        t('common.months.august'),
        t('common.months.september'),
        t('common.months.october'),
        t('common.months.november'),
        t('common.months.december'),
      ];
      return months[month] || '';
    } catch {
      // Fallback to English month names
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return months[month] || '';
    }
  };

  const onlyNumber = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  };

  // Check if form is valid for button enable/disable (validation from top to bottom)
  const isFormValid = (): boolean => {
    // Step 1: Check all required fields from top to bottom
    for (const meta of metadata) {
      if (!meta.data.isVisible || !meta.data.isRequired) continue;

      const key = meta.data.key;
      const value =
        meta.data.tag === 'BasicData' ? dataOrder[key] : dataOrder.additionalData?.[key];

      // Check if value is empty (from top to bottom, first empty field will disable button)
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return false; // Field not filled, button should be disabled
      }
    }

    // Step 2: Check checkboxes (terms & privacy) - only after all fields are filled
    if (!agreeToTerms || !agreeToPrivacy) {
      return false; // Checkboxes not checked, button should be disabled
    }

    return true; // All validations passed
  };

  const validateForm = (): boolean => {
    if (!agreeToTerms) {
      setError(t('auth.agreeToTermsRequired'));
      setShowErrorModal(true);
      return false;
    }

    if (!agreeToPrivacy) {
      setError(t('auth.agreeToPrivacyRequired'));
      setShowErrorModal(true);
      return false;
    }

    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~()-_+\-=[\]{};':"|,.<>/?]).{6,}$/;
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const regexPhone = /^\d{8,13}$/;

    for (const meta of metadata) {
      if (!meta.data.isRequired || !meta.data.isVisible) continue;

      const key = meta.data.key;
      let value: any;

      if (meta.data.tag === 'BasicData') {
        value = dataOrder[key];
      } else {
        value = dataOrder.additionalData?.[key];
      }

      if (key === 'password' && value) {
        if (!value.match(regexPass)) {
          setError(t('auth.passwordMin'));
          setShowErrorModal(true);
          return false;
        }
      }

      if ((key === 'email' || meta.data.typeData === 'Email') && value) {
        if (!value.match(regexEmail)) {
          setError(t('auth.emailInvalid'));
          setShowErrorModal(true);
          return false;
        }
      }

      if ((key === 'phone' || meta.data.typeData === 'Phone') && value) {
        if (!value.match(regexPhone)) {
          setError(t('auth.phoneInvalid'));
          setShowErrorModal(true);
          return false;
        }
      }

      if (key === 'tags' && (!value || value.length === 0)) {
        setError(`${meta.data.display} ${t('auth.required')}`);
        setShowErrorModal(true);
        return false;
      }

      if (!value || (Array.isArray(value) && value.length === 0)) {
        setError(`${meta.data.display} ${t('auth.required')}`);
        setShowErrorModal(true);
      return false;
    }
    }

    // Check terms and privacy after all fields are validated
    if (!agreeToTerms) {
      setError(t('auth.agreeToTermsRequired'));
      setShowErrorModal(true);
      return false;
    }

    if (!agreeToPrivacy) {
      setError(t('auth.agreeToPrivacyRequired'));
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const registerData: SignUpData = {
        ...dataOrder,
        tags: selectedTags,
        oAuth: googleAuthData
          ? {
              type: 'google',
              googleAuthId: googleAuthData.id,
            }
          : null,
      };

      // If OTP is required, show OTP modal first
      if (!googleAuthData && !otp) {
        setShowOtpModal(true);
        setLoading(false);
        return;
      }

      const response = await authService.register(registerData, otp || undefined);

      setLoading(false);

      if (response.data.responseType === 'member') {
        Alert.alert(t('auth.signUpSuccess'), t('auth.signUpSuccessMessage'), [
          {
            text: t('common.ok'),
            onPress: () => {
              onBackToLogin?.();
            },
          },
        ]);
      } else if (response.data.responseType === 'token') {
        // Auto login after registration
        onSignUpSuccess?.();
      } else if (response.data.responseType === 'paid_membership_checkout') {
        // Handle paid membership
        const finalUrl = `https://${response.data.link}`;
        Linking.openURL(finalUrl).catch((err) => {
          console.error('Error opening URL:', err);
        });
      }
    } catch (error: any) {
      setLoading(false);
      setError(error.message || t('auth.signUpFailed'));
      setShowErrorModal(true);
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      setError(t('auth.otpRequired'));
      setShowErrorModal(true);
      return;
    }

    setShowOtpModal(false);
    await handleRegister();
  };

  const renderField = (meta: MetadataItem, index: number) => {
    if (!meta.data.isVisible) return null;

    const { key, display, typeData, tag, isRequired, extraData } = meta.data;
    const value = tag === 'BasicData' ? dataOrder[key] : dataOrder.additionalData?.[key];

    // Phone field
    if (key === 'phone' || typeData === 'Phone') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            keyboardType="phone-pad"
            value={value || ''}
            onChangeText={(val) => changeValue(val, key, tag, typeData)}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      );
    }

    // Date field
    if (key === 'dateOfBirth' || typeData === 'Date') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowDatePickers({ ...showDatePickers, [key]: true })}>
            <Text style={[styles.datePickerText, { color: value ? colors.text : colors.textTertiary }]}>
              {customDate[key] ? formatDate(customDate[key]) : t('auth.selectDate')}
            </Text>
          </TouchableOpacity>
          {showDatePickers[key] && DateTimePicker && (
            <DateTimePicker
              value={customDate[key] || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              minimumDate={key === 'dateOfBirth' ? new Date(1900, 0, 1) : undefined}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePickers({ ...showDatePickers, [key]: false });
                if (selectedDate && event.type !== 'dismissed') {
                  setCustomDate({ ...customDate, [key]: selectedDate });
                  const formattedDate = selectedDate.toISOString().slice(0, 10);
                  changeValue(formattedDate, key, tag, typeData);
                }
              }}
            />
          )}
          {!DateTimePicker && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="YYYY-MM-DD"
              value={value || ''}
              onChangeText={(val) => changeValue(val, key, tag, typeData)}
              placeholderTextColor={colors.textTertiary}
            />
          )}
        </View>
      );
    }

    // Datetime field
    if (typeData === 'Datetime') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowDatePickers({ ...showDatePickers, [key]: true })}>
            <Text style={[styles.datePickerText, { color: value ? colors.text : colors.textTertiary }]}>
              {customDate[key] ? formatDateTime(customDate[key]) : t('auth.selectDateTime')}
            </Text>
          </TouchableOpacity>
          {showDatePickers[key] && DateTimePicker && (
            <DateTimePicker
              value={customDate[key] || new Date()}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePickers({ ...showDatePickers, [key]: false });
                if (selectedDate && event.type !== 'dismissed') {
                  setCustomDate({ ...customDate, [key]: selectedDate });
                  const formattedDate = selectedDate.toISOString().slice(0, 19).replace('T', ' ');
                  changeValue(formattedDate, key, tag, typeData);
                }
              }}
            />
          )}
          {!DateTimePicker && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={value || ''}
              onChangeText={(val) => changeValue(val, key, tag, typeData)}
              placeholderTextColor={colors.textTertiary}
            />
          )}
        </View>
      );
    }

    // Password field
    if (key === 'password') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              secureTextEntry={!showPassword}
              value={value || ''}
              onChangeText={(val) => changeValue(val, key, tag, typeData)}
              placeholderTextColor={colors.textTertiary}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword ? (
                <Eye size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
              ) : (
                <EyeSlash size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Email field
    if (key === 'email' || typeData === 'Email') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={value || ''}
            onChangeText={(val) => changeValue(val, key, tag, typeData)}
            placeholderTextColor={colors.textTertiary}
            editable={!(key === 'email' && googleAuthData)}
          />
        </View>
      );
    }

    // Numeric/Integer field
    if (typeData === 'Integer' || typeData === 'Numeric') {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            keyboardType="numeric"
            value={value || ''}
            onChangeText={(val) => {
              const numericValue = onlyNumber(val);
              changeValue(numericValue, key, tag, typeData);
            }}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      );
    }

    // Enum field (dropdown)
    if (typeData === 'Enum' && extraData && extraData.length > 0) {
      const options = extraDatas[key] || extraData.map((el) => ({ label: el, value: el }));
      const [showDropdown, setShowDropdown] = useState(false);

      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowDropdown(!showDropdown)}>
            <Text style={[styles.dropdownText, { color: value ? colors.text : colors.textTertiary }]}>
              {value ? options.find((opt) => opt.value === value)?.label || value : t('auth.selectOption')}
            </Text>
            <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
          {showDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {options.map((option, optIndex) => (
                <TouchableOpacity
                  key={optIndex}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor: value === option.value ? colors.primaryLight : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    changeValue(option.value, key, tag, typeData);
                    setSelectedData({ ...selectedData, [key]: option });
                    setShowDropdown(false);
                  }}>
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{option.label}</Text>
                  {value === option.value && (
                    <Text style={[styles.dropdownCheckmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    // Flags field (multiple checkboxes)
    if (typeData === 'Flags' && extraData && extraData.length > 0) {
      const selectedFlags = (value as string[]) || [];

      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <View style={styles.flagsContainer}>
            {extraData.map((flag, flagIndex) => {
              const isSelected = selectedFlags.includes(flag);
              return (
                <TouchableOpacity
                  key={flagIndex}
                  style={[
                    styles.flagItem,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.inputBackground,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => changeValue(flag, key, tag, typeData)}>
                  <View
                    style={[
                      styles.flagCheckbox,
                      {
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}>
                    {isSelected && <Text style={[styles.flagCheckmark, { color: colors.surface }]}>✓</Text>}
                  </View>
                  <Text style={[styles.flagLabel, { color: colors.text }]}>{flag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    // Tags field (multiple select)
    if (key === 'tags' && tagList.length > 0) {
      return (
        <View key={index} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
            {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
          <View style={styles.tagsContainer}>
            {selectedTags.map((tag, tagIndex) => (
              <View
                key={tagIndex}
                style={[styles.tagChip, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.tagChipText, { color: colors.primary }]}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                    changeValue(selectedTags.filter((t) => t !== tag), key, tag, typeData);
                  }}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                  <Text style={[styles.tagChipRemove, { color: colors.primary }]}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {selectedTags.length < tagList.length && (
            <TouchableOpacity
              style={[
                styles.addTagButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                // Simple implementation: show first available tag
                const availableTags = tagList.filter((t) => !selectedTags.includes(t.name));
                if (availableTags.length > 0) {
                  const newTag = availableTags[0].name;
                  const newTags = [...selectedTags, newTag];
                  setSelectedTags(newTags);
                  changeValue(newTags, key, tag, typeData);
                }
              }}>
              <Text style={[styles.addTagButtonText, { color: colors.primary }]}>
                + {t('auth.addTag')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Default text input
    return (
      <View key={index} style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{display}</Text>
          {isRequired && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={value || ''}
          onChangeText={(val) => changeValue(val, key, tag, typeData)}
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    );
  };

  if (loadingMetadata) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('auth.loadingForm')}
        </Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Absolute positioned background */}
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

          <View style={[styles.content, { backgroundColor: 'transparent' }]}>
            {/* Header with Back Button - Separated */}
            <View style={[styles.topBarContainer]}>
              <View style={[styles.header, { backgroundColor: colors.surface, paddingVertical: verticalScale(12), borderRadius: scale(12) }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (onBackToLogin) {
                    onBackToLogin();
                  } else {
                    // @ts-ignore - navigation type will be inferred
                    navigation.goBack();
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ArrowLeft2
                  size={getIconSize('medium')}
                  color={colors.text}
                  variant="Linear"
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t('auth.signUp')}
              </Text>
              <View style={{ width: getIconSize('medium') }} />
              </View>
            </View>

            {/* Sign Up Form - At bottom */}
            <View style={[styles.formContainer, { backgroundColor: 'transparent' }]}>
              <View style={[styles.formSection, { backgroundColor: 'transparent' }]}>
              
                <View style={styles.formFieldsContainer}>
                  {metadata.map((meta, index) => renderField(meta, index))}

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        backgroundColor: agreeToTerms ? colors.primary : 'transparent',
                        borderColor: agreeToTerms ? colors.primary : colors.border,
                      },
                    ]}>
                    {agreeToTerms && <Text style={[styles.checkmark, { color: colors.surface }]}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: colors.text }]}>
                  {t('auth.agreeToTerms')}{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary }]}
                    onPress={() => {
                      Linking.openURL('http://solusinegeri.com/term-condition').catch(() => {
                        setError(t('auth.cannotOpenTerms'));
                        setShowErrorModal(true);
                      });
                    }}>
                    {t('auth.termsAndConditions')}
                  </Text>
                </Text>
              </View>

              {/* Privacy Policy */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAgreeToPrivacy(!agreeToPrivacy)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        backgroundColor: agreeToPrivacy ? colors.primary : 'transparent',
                        borderColor: agreeToPrivacy ? colors.primary : colors.border,
                      },
                    ]}>
                    {agreeToPrivacy && <Text style={[styles.checkmark, { color: colors.surface }]}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: colors.text }]}>
                  {t('auth.agreeToPrivacy')}{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary }]}
                    onPress={() => {
                      Linking.openURL('http://solusinegeri.com/privacy-policy').catch(() => {
                        setError(t('auth.cannotOpenPrivacy'));
                        setShowErrorModal(true);
                      });
                    }}>
                    {t('auth.privacyPolicy')}
                  </Text>
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  {
                    backgroundColor: isFormValid() ? colors.primary : colors.textTertiary,
                    opacity: isFormValid() ? 1 : 0.6,
                  },
                ]}
                onPress={handleRegister}
                disabled={loading || !isFormValid()}
                activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <Text style={[styles.registerButtonText, { color: colors.surface }]}>
                    {t('auth.signUp')}
                  </Text>
                )}
              </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title={t('auth.error')}
        message={error || t('auth.signUpFailed')}
        onClose={() => {
          setShowErrorModal(false);
          setError(null);
        }}
        buttonText={t('common.ok')}
      />

      {/* OTP Modal - Simple implementation */}
      {showOtpModal && (
        <View style={styles.otpModal}>
          <View style={[styles.otpModalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.otpModalTitle, { color: colors.text }]}>{t('auth.enterOtp')}</Text>
            <TextInput
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              placeholder={t('auth.otpPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              maxLength={6}
            />
            <View style={styles.otpModalButtons}>
              <TouchableOpacity
                style={[styles.otpModalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtp('');
                }}>
                <Text style={[styles.otpModalButtonText, { color: colors.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.otpModalButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitOtp}>
                <Text style={[styles.otpModalButtonText, { color: colors.surface }]}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  },
  backButton: {
    padding: scale(8),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  description: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  formSection: {
    paddingHorizontal: getHorizontalPadding(),
  },
  formContainer: {

    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: verticalScale(24),
  },
  formFieldsContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: moderateVerticalScale(8),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  required: {
    marginLeft: scale(4),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: scale(12),
    minHeight: getMinTouchTarget(),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  eyeButton: {
    padding: moderateVerticalScale(8),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButton: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(8),
  },
  checkbox: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  checkboxBox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 2,
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  termsText: {
    flex: 1,
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateVerticalScale(20),
  },
  termsLink: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    textDecorationLine: 'underline',
  },
  registerButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getMinTouchTarget(),
    marginTop: moderateVerticalScale(24),
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
  registerButtonText: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    letterSpacing: 0.5,
  },
  loadingText: {
    marginTop: moderateVerticalScale(16),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  otpModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  otpModalContent: {
    width: '80%',
    borderRadius: scale(12),
    padding: scale(24),
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  otpModalTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(16),
    letterSpacing: scale(4),
  },
  otpModalButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  otpModalButton: {
    flex: 1,
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpModalButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    minHeight: getMinTouchTarget(),
  },
  dropdownText: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    marginLeft: scale(8),
  },
  dropdownList: {
    marginTop: moderateVerticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1.5,
    maxHeight: verticalScale(200),
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    minHeight: getMinTouchTarget(),
  },
  dropdownItemText: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  dropdownCheckmark: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(8),
    minHeight: getMinTouchTarget(),
  },
  flagCheckbox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 2,
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  flagCheckmark: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  flagLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: moderateVerticalScale(8),
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(6),
  },
  tagChipText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    marginRight: scale(6),
  },
  tagChipRemove: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  addTagButton: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    alignItems: 'center',
    minHeight: getMinTouchTarget(),
  },
  addTagButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});

