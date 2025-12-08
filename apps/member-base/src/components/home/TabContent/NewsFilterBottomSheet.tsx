/**
 * NewsFilterBottomSheet Component
 * Bottom sheet untuk filter news dengan date range dan sort by
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Sort, TickCircle } from 'iconsax-react-nativejs';
import { BottomSheet, DatePicker } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';

export type SortByOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export interface NewsFilterState {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  sortBy: SortByOption | null;
}

interface NewsFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: NewsFilterState) => void;
  initialFilter?: NewsFilterState;
}

export const NewsFilterBottomSheet: React.FC<NewsFilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilter,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();

  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>(
    initialFilter?.dateRange || { startDate: null, endDate: null }
  );
  const [sortBy, setSortBy] = useState<SortByOption | null>(initialFilter?.sortBy || null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const sortOptions: { value: SortByOption; label: string }[] = [
    { value: 'newest', label: t('news.sortNewest') || 'Terbaru' },
    { value: 'oldest', label: t('news.sortOldest') || 'Terlama' },
    { value: 'title-asc', label: t('news.sortTitleAsc') || 'Judul A-Z' },
    { value: 'title-desc', label: t('news.sortTitleDesc') || 'Judul Z-A' },
  ];

  const handleApply = () => {
    onApply({
      dateRange,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setDateRange({ startDate: null, endDate: null });
    setSortBy(null);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStartDatePress = () => {
    // Open immediately without any delay
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    // Open immediately without any delay
    setShowEndDatePicker(true);
  };

  const handleStartDateConfirm = (date: Date) => {
    setDateRange({ ...dateRange, startDate: date });
  };

  const handleEndDateConfirm = (date: Date) => {
    setDateRange({ ...dateRange, endDate: date });
  };

  const isDatePickerVisible = showStartDatePicker || showEndDatePicker;

  return (
    <BottomSheet 
      visible={visible} 
      onClose={onClose} 
      snapPoints={[100]}
      disableClose={isDatePickerVisible}
    >
      <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('news.filterTitle') || 'Filter Berita'}
        </Text>

        {/* Date Range Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={scale(20)} color={colors.text} variant="Linear" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('news.dateRange') || 'Rentang Tanggal'}
            </Text>
          </View>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleStartDatePress}
            >
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                {dateRange.startDate ? formatDate(dateRange.startDate) : t('news.selectStartDate')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.dateSeparator, { color: colors.textSecondary }]}>-</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleEndDatePress}
            >
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                {dateRange.endDate ? formatDate(dateRange.endDate) : t('news.selectEndDate')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort By Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sort size={scale(20)} color={colors.text} variant="Linear" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('news.sortBy') || 'Urutkan Berdasarkan'}
            </Text>
          </View>
          <View style={styles.sortOptionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor: sortBy === option.value ? colors.primaryLight || colors.surface : colors.surface,
                    borderColor: sortBy === option.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    {
                      color: sortBy === option.value ? colors.primary : colors.text,
                      fontFamily: sortBy === option.value ? FontFamily.monasans.semiBold : FontFamily.monasans.regular,
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <TickCircle size={scale(20)} color={colors.primary} variant="Bold" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
              {t('news.reset') || 'Reset'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyButtonText, { color: colors.surface }]}>
              {t('news.apply') || 'Terapkan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Start Date Picker */}
      <DatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onConfirm={handleStartDateConfirm}
        value={dateRange.startDate}
        maximumDate={dateRange.endDate || undefined}
        title={t('news.selectStartDate')}
        yearRange={100}
      />

      {/* End Date Picker */}
      <DatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onConfirm={handleEndDateConfirm}
        value={dateRange.endDate}
        minimumDate={dateRange.startDate || undefined}
        title={t('news.selectEndDate')}
        yearRange={100}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(24),
  },
  title: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(24),
  },
  section: {
    marginBottom: moderateVerticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
    gap: scale(8),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  dateButton: {
    flex: 1,
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  dateSeparator: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.medium,
  },
  sortOptionsContainer: {
    gap: scale(8),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: getResponsiveFontSize('medium'),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: moderateVerticalScale(8),
  },
  resetButton: {
    flex: 1,
    padding: scale(14),
    borderRadius: scale(8),
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  applyButton: {
    flex: 1,
    padding: scale(14),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});

