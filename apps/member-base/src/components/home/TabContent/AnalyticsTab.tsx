import React from 'react';
import { View, ScrollView, Text, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chart, ArrowDown2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

interface AnalyticsTabProps {
  isActive?: boolean; // Add prop to know if tab is active
  isVisible?: boolean; // Add prop to know if tab is visible (for lifecycle)
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = React.memo(({
  isActive = true,
  isVisible = true,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  // Chart colors derived from theme
  const chartPrimaryColor = colors.info || colors.primary;
  const chartSecondaryColor = colors.border;
  const chartWarningColor = colors.warning;
  const iconBgColor = colors.warningLight;
  const iconColor = colors.warning;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + moderateVerticalScale(24),
          paddingHorizontal: horizontalPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      scrollEnabled={isActive} // Only enable scroll when tab is active
      bounces={false} // Disable bounce untuk mencegah scroll interference
      directionalLockEnabled={true} // Lock scroll direction
      onScrollBeginDrag={(e) => {
        // Prevent parent scroll when dragging in this list
        e.stopPropagation();
      }}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Chart size={scale(20)} color={iconColor} variant="Bold" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('analytics.summary')}
          </Text>
        </View>

        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <Text style={[styles.filterText, { color: colors.textSecondary }]}>
            {t('analytics.today')}
          </Text>
          <ArrowDown2 size={scale(14)} color={colors.textSecondary} variant="Linear" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('analytics.revenue')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            Rp 700.000
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('analytics.transactions')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            20
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.chartHeader}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: chartPrimaryColor }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t('analytics.revenue')}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: chartSecondaryColor }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t('analytics.transactions')}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <Svg height={scale(200)} width="100%" style={styles.svg}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={chartPrimaryColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={chartPrimaryColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <Line
                key={i}
                x1="0"
                y1={scale(40 * i)}
                x2="100%"
                y2={scale(40 * i)}
                stroke={chartSecondaryColor}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Revenue Line (Blue) */}
            <Path
              d={`M0 ${scale(150)} C${scale(50)} ${scale(100)}, ${scale(100)} ${scale(100)}, ${scale(150)} ${scale(50)} S${scale(250)} ${scale(150)}, ${scale(300)} ${scale(150)}`}
              fill="none"
              stroke={chartPrimaryColor}
              strokeWidth="3"
            />
            {/* Revenue Area */}
            <Path
              d={`M0 ${scale(150)} C${scale(50)} ${scale(100)}, ${scale(100)} ${scale(100)}, ${scale(150)} ${scale(50)} S${scale(250)} ${scale(150)}, ${scale(300)} ${scale(150)} V${scale(200)} H0 Z`}
              fill="url(#grad)"
            />

            {/* Transactions Line (Gray) */}
            <Path
              d={`M0 ${scale(180)} C${scale(50)} ${scale(180)}, ${scale(100)} ${scale(150)}, ${scale(150)} ${scale(180)} S${scale(250)} ${scale(120)}, ${scale(300)} ${scale(140)}`}
              fill="none"
              stroke={chartSecondaryColor}
              strokeWidth="3"
            />

            {/* Tooltip Point */}
            <Circle cx={scale(150)} cy={scale(50)} r={scale(6)} fill={colors.surface} stroke={chartWarningColor} strokeWidth={2} />
          </Svg>

          {/* Tooltip Label */}
          <View style={[styles.tooltip, { left: scale(110), top: scale(10), backgroundColor: colors.surface }]}>
            <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>Rp</Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>700.000</Text>
          </View>

          {/* Y Axis Labels */}
          <View style={styles.yAxis}>
            {['1000k+', '500 K', '150 k', '100 K', '50 K', '10 K'].map((label, i) => (
              <Text key={i} style={[styles.axisLabel, { color: colors.textSecondary }]}>{label}</Text>
            ))}
          </View>

          {/* X Axis Labels */}
          <View style={styles.xAxis}>
            {['1/08', '2/08', '3/08', '4/08', '5/08', '6/08', '7/08'].map((label, i) => (
              <Text key={i} style={[styles.axisLabel, { color: colors.textSecondary }]}>{label}</Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: moderateVerticalScale(16),
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(16),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(6),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  filterText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    marginRight: scale(4),
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: moderateVerticalScale(16),
  },
  card: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(12),
  },
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(8),
  },
  cardValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  chartContainer: {
    padding: scale(16),
    borderRadius: scale(12),
    minHeight: scale(300),
  },
  chartHeader: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: moderateVerticalScale(24),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: scale(8),
    height: scale(2),
    borderRadius: scale(1),
    marginRight: scale(6),
  },
  legendText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: scale(8),
  },
  chartWrapper: {
    height: scale(250),
    position: 'relative',
    marginLeft: scale(30), // Space for Y axis
    marginBottom: scale(20), // Space for X axis
  },
  svg: {
    overflow: 'visible',
  },
  yAxis: {
    position: 'absolute',
    left: -scale(35),
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    height: scale(200),
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(8),
    width: '100%',
  },
  axisLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  tooltip: {
    position: 'absolute',
    padding: scale(8),
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  tooltipValue: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
});
