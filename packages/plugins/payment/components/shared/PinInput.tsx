/**
 * Reusable PIN Input Component
 * Component untuk input PIN yang bisa digunakan di berbagai transaksi
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';

export interface PinInputProps {
  /** Length of PIN (default: 6) */
  length?: number;
  /** Callback when PIN is complete */
  onComplete?: (pin: string) => void;
  /** Callback when PIN changes */
  onChange?: (pin: string) => void;
  /** Show forgot PIN link */
  showForgotPin?: boolean;
  /** Callback when forgot PIN is pressed */
  onForgotPin?: () => void;
  /** Auto submit when complete */
  autoSubmit?: boolean;
  /** Delay before auto submit (ms) */
  autoSubmitDelay?: number;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  showForgotPin = true,
  onForgotPin,
  autoSubmit = true,
  autoSubmitDelay = 300,
}) => {
  const { colors } = useTheme();
  const [pin, setPin] = useState<string[]>([]);

  const handleNumberPress = useCallback(
    (number: string) => {
      if (pin.length < length) {
        const newPin = [...pin, number];
        setPin(newPin);
        const pinString = newPin.join('');
        onChange?.(pinString);

        if (newPin.length === length && autoSubmit) {
          setTimeout(() => {
            onComplete?.(pinString);
          }, autoSubmitDelay);
        }
      }
    },
    [pin, length, onChange, onComplete, autoSubmit, autoSubmitDelay]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      onChange?.(newPin.join(''));
    }
  }, [pin, onChange]);

  const handleForgotPin = useCallback(() => {
    onForgotPin?.();
  }, [onForgotPin]);

  // Manual submit when PIN is complete (if autoSubmit is false)
  useEffect(() => {
    if (pin.length === length && !autoSubmit) {
      const pinString = pin.join('');
      onComplete?.(pinString);
    }
  }, [pin.length, length, autoSubmit, onComplete]);

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: pin[index] ? colors.primary : colors.surface,
                borderColor: pin[index] ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['*', '0', '#'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '*' || key === '#') {
                return <View key={key} style={styles.keypadKey} />;
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.keypadKey,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.keypadKeyText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {/* Delete Button Row */}
        <View style={styles.keypadRow}>
          <View style={styles.keypadKey} />
          <TouchableOpacity
            style={[
              styles.keypadKey,
              styles.deleteButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handleDelete}
            activeOpacity={0.7}
            disabled={pin.length === 0}
          >
            <Text
              style={[
                styles.deleteButtonText,
                {
                  color: pin.length > 0 ? colors.text : colors.textSecondary,
                },
              ]}
            >
              ⌫
            </Text>
          </TouchableOpacity>
          <View style={styles.keypadKey} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* PIN Input Display */}
      {renderPinDots()}

      {/* Forgot PIN Link */}
      {showForgotPin && (
        <TouchableOpacity
          style={styles.forgotPinContainer}
          onPress={handleForgotPin}
          activeOpacity={0.7}
        >
          <Text style={[styles.forgotPinText, { color: colors.primary }]}>Lupa PIN?</Text>
        </TouchableOpacity>
      )}

      {/* Keypad */}
      {renderKeypad()}
    </View>
  );
};

const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: moderateVerticalScale(24),
  },
  pinDot: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    borderWidth: 2,
  },
  forgotPinContainer: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(32),
  },
  forgotPinText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: scale(400),
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(12),
    marginBottom: moderateVerticalScale(12),
  },
  keypadKey: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
  },
  keypadKeyText: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
  deleteButton: {
    // Delete button styling
  },
  deleteButtonText: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});

