import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  getMinTouchTarget,
  getTabletMenuMaxWidth,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';

export interface Tab {
  id: string;
  label: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /**
   * Variant tampilan tab.
   * - 'default' : pill tabs individual (seperti chip).
   * - 'segmented' : segmented control seperti pada contoh desain.
   */
  variant?: 'default' | 'segmented';
  /**
   * Max width untuk menu di tablet landscape (optional)
   * Jika tidak diatur, menu akan melebar penuh
   */
  tabletLandscapeMaxWidth?: number;
  /**
   * Max width untuk menu di tablet portrait (optional)
   * Jika tidak diatur, menu akan melebar penuh
   */
  tabletPortraitMaxWidth?: number;
  /**
   * Animated value dari pager scroll (untuk realtime indicator)
   */
  scrollX?: Animated.Value;
  /**
   * Lebar pager (screen width) untuk interpolasi
   */
  pagerWidth?: number;
}

interface TabLayout {
  x: number;
  width: number;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = React.memo(({
  tabs,
  activeTab,
  onTabChange,
  variant = 'segmented',
  tabletLandscapeMaxWidth,
  tabletPortraitMaxWidth,
  scrollX,
  pagerWidth,
}) => {
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<{ [key: string]: TabLayout }>({});
  const [containerWidth, setContainerWidth] = useState(0);

  // Initialize animated values hanya sekali
  const animatedValues = useRef<{ [key: string]: Animated.Value }>(null!);
  if (!animatedValues.current) {
    animatedValues.current = tabs.reduce((acc, tab) => {
      acc[tab.id] = new Animated.Value(activeTab === tab.id ? 1 : 0);
      return acc;
    }, {} as { [key: string]: Animated.Value });
  }

  // Animated values untuk sliding indicator
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  const isSegmented = variant === 'segmented';

  useEffect(() => {
    if (scrollViewRef.current && tabLayouts.current[activeTab]) {
      const layout = tabLayouts.current[activeTab];
      const scrollPosition = Math.max(0, layout.x - getHorizontalPadding() * 2);

      scrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    // Animate tab opacity/scale
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.id;
      const values = animatedValues.current;
      if (values && values[tab.id]) {
        Animated.timing(values[tab.id], {
          toValue: isActive ? 1 : 0,
          duration: 200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }).start();
      }
    });

    // Animate sliding indicator untuk segmented variant
    // Jika scrollX ada, kita skip animasi manual activeTab karena dikontrol scrollX
    if (isSegmented && !scrollX) {
      if (tabLayouts.current[activeTab]) {
        const layout = tabLayouts.current[activeTab];
        Animated.spring(indicatorLeft, {
          toValue: layout.x,
          useNativeDriver: true, // Enable native driver
          tension: 80,
          friction: 10,
        }).start();
        setIndicatorWidth(layout.width);
      } else {
        // Initialize indicator position saat pertama kali render
        indicatorLeft.setValue(0);
        setIndicatorWidth(0);
      }
    }
  }, [activeTab, tabs, isSegmented, scrollX, indicatorLeft]);

  // Memoized handler untuk tab press
  const handleTabPress = useCallback((tabId: string) => {
    onTabChange(tabId);
  }, [onTabChange]);

  // Memoized handler untuk tab layout
  const handleTabLayout = useCallback((tabId: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[tabId] = { x, width };

    // Initialize indicator position untuk tab pertama kali (jika tidak ada scrollX)
    if (tabId === activeTab && isSegmented && !scrollX) {
      indicatorLeft.setValue(x);
      setIndicatorWidth(width);
    }
  }, [activeTab, isSegmented, indicatorLeft, setIndicatorWidth, scrollX]);

  // Memoized max width untuk tablet menu
  const menuMaxWidth = useMemo(
    () => getTabletMenuMaxWidth(tabletLandscapeMaxWidth, tabletPortraitMaxWidth),
    [tabletLandscapeMaxWidth, tabletPortraitMaxWidth]
  );

  // Memoized segmented wrapper style
  const segmentedWrapperStyle = useMemo(
    () => [
      styles.segmentedWrapper,
      {
        backgroundColor: colors.surface,
        maxWidth: menuMaxWidth,
        alignSelf: menuMaxWidth ? 'center' : 'stretch' as 'center' | 'stretch',
      },
    ],
    [colors.surface, menuMaxWidth]
  );

  // Calculate interpolated indicator position if scrollX is present
  const interpolatedIndicatorTranslateX = useMemo(() => {
    if (scrollX && pagerWidth && containerWidth > 0 && tabs.length > 0) {
      const totalPadding = scale(4) * 2; // Padding horizontal wrapper
      const availableWidth = containerWidth - totalPadding;
      const tabWidth = availableWidth / tabs.length;

      // Input range: [0, pagerWidth, 2*pagerWidth, ...]
      const inputRange = tabs.map((_, i) => i * pagerWidth);
      // Output range: [startX, startX + tabWidth, startX + 2*tabWidth, ...]
      // startX is usually paddingLeft which is scale(4)
      const startX = scale(4);
      const outputRange = tabs.map((_, i) => startX + (i * tabWidth));

      return scrollX.interpolate({
        inputRange,
        outputRange,
        extrapolate: 'clamp',
      });
    }
    return indicatorLeft;
  }, [scrollX, pagerWidth, containerWidth, tabs, indicatorLeft]);

  // Calculate interpolated indicator width if scrollX is present (assuming equal width tabs)
  const interpolatedIndicatorWidth = useMemo(() => {
    if (scrollX && containerWidth > 0 && tabs.length > 0) {
      const totalPadding = scale(4) * 2;
      const availableWidth = containerWidth - totalPadding;
      const tabWidth = availableWidth / tabs.length;
      return tabWidth;
    }
    // For manual animation, use the state value
    if (!scrollX) {
      return indicatorWidth;
    }
    // Fallback if not ready
    if (tabLayouts.current[activeTab]) {
      return tabLayouts.current[activeTab].width;
    }
    return 0;
  }, [scrollX, containerWidth, tabs, indicatorWidth, activeTab]);

  // Memoized sliding indicator style
  const slidingIndicatorStyle = useMemo(
    () => [
      styles.slidingIndicator,
      {
        backgroundColor: colors.primary,
        transform: [{ translateX: interpolatedIndicatorTranslateX }],
        width: interpolatedIndicatorWidth,
      },
    ],
    [colors.primary, interpolatedIndicatorTranslateX, interpolatedIndicatorWidth]
  );

  // Memoized container layout handler
  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Segmented: fixed tabs, non-scrollable, dengan sliding indicator
  if (isSegmented) {
    return (
      <View style={styles.container}>
        <View style={segmentedWrapperStyle} onLayout={handleContainerLayout}>
          {/* Sliding Indicator */}
          <Animated.View style={slidingIndicatorStyle} />

          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const animatedValue = animatedValues.current[tab.id];

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.segmentedTab}
                activeOpacity={0.9}
                onPress={() => handleTabPress(tab.id)}
                onLayout={(event) => handleTabLayout(tab.id, event)}>
                <View style={styles.tab}>
                  {/* Inactive Text (Base) */}
                  <Animated.Text
                    style={[
                      styles.tabText,
                      {
                        color: colors.text,
                        fontFamily: FontFamily.monasans.medium,
                        opacity: scrollX && pagerWidth
                          ? scrollX.interpolate({
                            inputRange: [
                              (index - 1) * pagerWidth,
                              index * pagerWidth,
                              (index + 1) * pagerWidth,
                            ],
                            outputRange: [1, 0, 1],
                            extrapolate: 'clamp',
                          })
                          : animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                          }),
                      },
                    ]}>
                    {tab.label}
                  </Animated.Text>

                  {/* Active Text (Overlay) */}
                  <Animated.Text
                    style={[
                      styles.tabText,
                      {
                        position: 'absolute',
                        // Use surface color untuk kontras dengan primary background (accent color)
                        color: colors.surface,
                        fontFamily: FontFamily.monasans.semiBold,
                        opacity: scrollX && pagerWidth
                          ? scrollX.interpolate({
                              inputRange: [
                                (index - 1) * pagerWidth,
                                index * pagerWidth,
                                (index + 1) * pagerWidth,
                              ],
                              outputRange: [0, 1, 0],
                              extrapolate: 'clamp',
                            })
                          : animatedValue,
                      },
                    ]}>
                    {tab.label}
                  </Animated.Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // Default variant: scrollable pill tabs
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isSegmented && styles.segmentedScrollContent,
        ]}
        style={styles.scrollView}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const animatedValue = animatedValues.current[tab.id];

          const backgroundColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [
              isDark ? colors.surfaceSecondary : colors.background,
              colors.primary,
            ],
          });

          const textColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.text, colors.surface],
          });

          const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          });

          const opacity = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
          });

          const tabDynamicStyle = [
            styles.tab,
            {
              backgroundColor,
              transform: [{ scale }],
              opacity,
            },
          ];

          const textStyle = [
            styles.tabText,
            {
              color: textColor,
              fontFamily: isActive
                ? FontFamily.monasans.semiBold
                : FontFamily.monasans.regular,
            },
          ];

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
              onLayout={(event) => handleTabLayout(tab.id, event)}>
              <Animated.View style={tabDynamicStyle}>
                <Animated.Text style={textStyle}>
                  {tab.label}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

TabSwitcher.displayName = 'TabSwitcher';

const horizontalPadding = getHorizontalPadding();
const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalPadding,
  },
  segmentedWrapper: {
    flexDirection: 'row',
    borderRadius: scale(999),
    paddingHorizontal: scale(4),
    paddingVertical: moderateVerticalScale(4),
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: moderateVerticalScale(4),
    bottom: moderateVerticalScale(4),
    borderRadius: scale(999),
    zIndex: 0,
    left: 0, // Ensure left is 0 so translateX works from origin
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: scale(12),
    paddingRight: horizontalPadding,
  },
  segmentedScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 0,
  },
  tab: {
    paddingHorizontal: scale(8),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    minHeight: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedContainer: {
    borderRadius: scale(999),
    paddingVertical: moderateVerticalScale(6),
    paddingHorizontal: scale(4),
    alignSelf: 'center',
  },
  segmentedTab: {
    flex: 1,
    minWidth: 0,
    borderRadius: scale(999),
    zIndex: 1,
  },
  tabText: {
    fontSize: getResponsiveFontSize('small'),
    textAlign: 'center',
  },
});
