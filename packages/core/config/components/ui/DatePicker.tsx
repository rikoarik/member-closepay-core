/**
 * DatePicker Component
 * Reusable date picker dengan scrollable picker untuk tahun, bulan, dan hari
 * Tidak menggunakan library eksternal
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';

const PICKER_ITEM_HEIGHT = scale(40);
const VISIBLE_ITEMS = 5;

export interface DatePickerProps {
  /**
   * Modal visible state
   */
  visible: boolean;
  
  /**
   * Callback ketika modal ditutup
   */
  onClose: () => void;
  
  /**
   * Callback ketika date dipilih (dipanggil saat OK ditekan)
   */
  onConfirm: (date: Date) => void;
  
  /**
   * Initial date value
   */
  value?: Date | null;
  
  /**
   * Minimum date yang bisa dipilih
   */
  minimumDate?: Date | null;
  
  /**
   * Maximum date yang bisa dipilih
   */
  maximumDate?: Date | null;
  
  /**
   * Title untuk picker
   */
  title?: string;
  
  /**
   * Range tahun (dari tahun sekarang mundur)
   * Default: 100 tahun
   */
  yearRange?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  value,
  minimumDate,
  maximumDate,
  title,
  yearRange = 100,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();

  // Generate date options
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - yearRange; i--) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames.map((name, index) => ({ name, value: index + 1 }));
  };

  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const years = useMemo(() => generateYears(), [yearRange]);
  const months = useMemo(() => generateMonths(), []);

  // Initialize selected date
  const getInitialDate = (date: Date | null) => {
    const d = date || new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  };

  // Initialize state immediately when value changes, not just on mount
  const [dateState, setDateState] = useState(() => getInitialDate(value || null));

  // Update state immediately when value changes (before modal opens)
  useEffect(() => {
    const initialDate = value || new Date();
    setDateState({
      year: initialDate.getFullYear(),
      month: initialDate.getMonth() + 1,
      day: initialDate.getDate(),
    });
  }, [value]);

  const days = useMemo(
    () => generateDays(dateState.year, dateState.month),
    [dateState.year, dateState.month]
  );

  // Filter years based on min/max dates
  const filteredYears = useMemo(() => {
    let filtered = years;
    if (minimumDate) {
      const minYear = minimumDate.getFullYear();
      filtered = filtered.filter((y) => y >= minYear);
    }
    if (maximumDate) {
      const maxYear = maximumDate.getFullYear();
      filtered = filtered.filter((y) => y <= maxYear);
    }
    return filtered;
  }, [years, minimumDate, maximumDate]);

  // Refs for scroll views
  const yearRef = useRef<ScrollView>(null);
  const monthRef = useRef<ScrollView>(null);
  const dayRef = useRef<ScrollView>(null);

  // Pre-calculate scroll positions to avoid delay during modal open
  const scrollPositions = useMemo(() => {
    if (!visible) return null;
    const yearIndex = filteredYears.findIndex((y) => y === dateState.year);
    const monthIndex = dateState.month - 1;
    const dayIndex = dateState.day - 1;
    return { yearIndex, monthIndex, dayIndex };
  }, [visible, dateState.year, dateState.month, dateState.day, filteredYears]);

  // Scroll to selected values when modal opens - optimized
  useEffect(() => {
    if (visible && scrollPositions) {
      // Use requestAnimationFrame for smooth scroll after layout
      requestAnimationFrame(() => {
        const { yearIndex, monthIndex, dayIndex } = scrollPositions;
        
        if (yearIndex >= 0 && yearRef.current) {
          yearRef.current.scrollTo({
            y: yearIndex * PICKER_ITEM_HEIGHT,
            animated: false,
          });
        }
        if (monthRef.current) {
          monthRef.current.scrollTo({
            y: monthIndex * PICKER_ITEM_HEIGHT,
            animated: false,
          });
        }
        if (dayIndex >= 0 && dayRef.current) {
          dayRef.current.scrollTo({
            y: dayIndex * PICKER_ITEM_HEIGHT,
            animated: false,
          });
        }
      });
    }
  }, [visible, scrollPositions]);

  const handleConfirm = () => {
    const newDate = new Date(dateState.year, dateState.month - 1, dateState.day);
    
    // Validate against min/max dates
    if (minimumDate && newDate < minimumDate) {
      return; // Don't confirm if before minimum
    }
    if (maximumDate && newDate > maximumDate) {
      return; // Don't confirm if after maximum
    }

    onConfirm(newDate);
    onClose();
  };

  const handleYearChange = (year: number) => {
    const maxDay = generateDays(year, dateState.month).length;
    const newDay = Math.min(dateState.day, maxDay);
    setDateState({ ...dateState, year, day: newDay });
    
    // Scroll immediately without delay
    requestAnimationFrame(() => {
      const yearIndex = years.findIndex((y) => y === year);
      if (yearIndex >= 0) {
        yearRef.current?.scrollTo({
          y: yearIndex * PICKER_ITEM_HEIGHT,
          animated: true,
        });
      }
    });
  };

  const handleMonthChange = (month: number) => {
    const maxDay = generateDays(dateState.year, month).length;
    const newDay = Math.min(dateState.day, maxDay);
    setDateState({ ...dateState, month, day: newDay });
    
    // Scroll immediately without delay
    requestAnimationFrame(() => {
      monthRef.current?.scrollTo({
        y: (month - 1) * PICKER_ITEM_HEIGHT,
        animated: true,
      });
    });
  };

  const handleDayChange = (day: number) => {
    setDateState({ ...dateState, day });
    
    // Scroll immediately without delay
    requestAnimationFrame(() => {
      dayRef.current?.scrollTo({
        y: (day - 1) * PICKER_ITEM_HEIGHT,
        animated: true,
      });
    });
  };

  // Check if date is valid
  const isDateValid = () => {
    const newDate = new Date(dateState.year, dateState.month - 1, dateState.day);
    if (minimumDate && newDate < minimumDate) return false;
    if (maximumDate && newDate > maximumDate) return false;
    return true;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      hardwareAccelerated
    >
      <View style={styles.modal}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.button, { color: colors.textSecondary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {title || t('common.selectDate') || 'Pilih Tanggal'}
            </Text>
            <TouchableOpacity onPress={handleConfirm} disabled={!isDateValid()}>
              <Text
                style={[
                  styles.button,
                  {
                    color: isDateValid() ? colors.primary : colors.textTertiary || colors.textSecondary,
                  },
                ]}
              >
                {t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <ScrollView
                  ref={yearRef}
                  style={styles.pickerScrollView}
                  contentContainerStyle={styles.pickerContent}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={PICKER_ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  {filteredYears.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            dateState.year === year ? colors.primaryLight || colors.surface : 'transparent',
                        },
                      ]}
                      onPress={() => handleYearChange(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            color: dateState.year === year ? colors.primary : colors.text,
                            fontFamily:
                              dateState.year === year
                                ? FontFamily.monasans.semiBold
                                : FontFamily.monasans.regular,
                          },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <ScrollView
                  ref={monthRef}
                  style={styles.pickerScrollView}
                  contentContainerStyle={styles.pickerContent}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={PICKER_ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            dateState.month === month.value
                              ? colors.primaryLight || colors.surface
                              : 'transparent',
                        },
                      ]}
                      onPress={() => handleMonthChange(month.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            color: dateState.month === month.value ? colors.primary : colors.text,
                            fontFamily:
                              dateState.month === month.value
                                ? FontFamily.monasans.semiBold
                                : FontFamily.monasans.regular,
                          },
                        ]}
                      >
                        {month.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <ScrollView
                  ref={dayRef}
                  style={styles.pickerScrollView}
                  contentContainerStyle={styles.pickerContent}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={PICKER_ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor:
                            dateState.day === day ? colors.primaryLight || colors.surface : 'transparent',
                        },
                      ]}
                      onPress={() => handleDayChange(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            color: dateState.day === day ? colors.primary : colors.text,
                            fontFamily:
                              dateState.day === day
                                ? FontFamily.monasans.semiBold
                                : FontFamily.monasans.regular,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingBottom: moderateVerticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  button: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  pickerContainer: {
    paddingVertical: moderateVerticalScale(16),
  },
  pickerRow: {
    flexDirection: 'row',
    height: PICKER_ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerColumn: {
    flex: 1,
    position: 'relative',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: PICKER_ITEM_HEIGHT * 2, // Padding untuk center alignment
  },
  pickerItem: {
    height: PICKER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(8),
    marginHorizontal: scale(4),
  },
  pickerItemText: {
    fontSize: getResponsiveFontSize('medium'),
  },
});

