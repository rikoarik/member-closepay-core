import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
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
  variant?: 'default' | 'segmented';
  tabletLandscapeMaxWidth?: number;
  tabletPortraitMaxWidth?: number;
  scrollX?: Animated.Value;
  pagerWidth?: number;
}

interface TabLayout {
  x: number;
  width: number;
}

const getAnimatedValue = (
  animatedValues: React.MutableRefObject<{ [key: string]: Animated.Value }>,
  tabId: string,
  isActive: boolean
): Animated.Value => {
  if (!animatedValues.current[tabId]) {
    animatedValues.current[tabId] = new Animated.Value(isActive ? 1 : 0);
  }
  return animatedValues.current[tabId];
};

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
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const layoutDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTabIndex = useMemo(() => tabs.findIndex(t => t.id === activeTab), [tabs, activeTab]);

  const isSegmented = variant === 'segmented';
  const hasInitializedScrollRef = useRef(false);

  useEffect(() => {
    if (!isSegmented && !hasInitializedScrollRef.current && tabs.length > 0) {
      const checkAndScroll = () => {
        const measuredTabs = Object.keys(tabLayouts.current).length;
        if (scrollViewRef.current && measuredTabs === tabs.length) {
          const middleIndex = Math.floor(tabs.length / 2);
          const middleTab = tabs[middleIndex];
          if (middleTab && tabLayouts.current[middleTab.id]) {
            const layout = tabLayouts.current[middleTab.id];
            const scrollPosition = Math.max(0, layout.x - getHorizontalPadding() * 2);
            scrollViewRef.current.scrollTo({
              x: scrollPosition,
              animated: false,
            });
            hasInitializedScrollRef.current = true;
          }
        } else if (measuredTabs < tabs.length) {
          setTimeout(checkAndScroll, 50);
        }
      };
      const timer = setTimeout(checkAndScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isSegmented, tabs]);

  useEffect(() => {
    if (scrollViewRef.current && tabLayouts.current[activeTab]) {
      const layout = tabLayouts.current[activeTab];
      const scrollPosition = Math.max(0, layout.x - getHorizontalPadding() * 2);
      if (hasInitializedScrollRef.current || isSegmented) {
        scrollViewRef.current.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }
    }
  }, [activeTab, isSegmented]);

  useEffect(() => {
    const tabsToAnimate = new Set<string>();
    tabsToAnimate.add(activeTab);
    
    if (activeTabIndex > 0) tabsToAnimate.add(tabs[activeTabIndex - 1].id);
    if (activeTabIndex < tabs.length - 1) tabsToAnimate.add(tabs[activeTabIndex + 1].id);

    tabsToAnimate.forEach((tabId) => {
      const isActive = activeTab === tabId;
      const animValue = getAnimatedValue(animatedValues, tabId, isActive);
      Animated.timing(animValue, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    });

    if (isSegmented && !scrollX && tabLayouts.current[activeTab]) {
      const layout = tabLayouts.current[activeTab];
      Animated.spring(indicatorLeft, {
        toValue: layout.x,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
      setIndicatorWidth(layout.width);
    }
  }, [activeTab, activeTabIndex, tabs, isSegmented, scrollX, indicatorLeft]);

  const handleTabPress = useCallback((tabId: string) => {
    onTabChange(tabId);
  }, [onTabChange]);

  const handleTabLayout = useCallback((tabId: string, event: LayoutChangeEvent) => {
    if (layoutDebounceTimer.current) {
      clearTimeout(layoutDebounceTimer.current);
    }
    
    layoutDebounceTimer.current = setTimeout(() => {
      const { x, width } = event.nativeEvent.layout;
      tabLayouts.current[tabId] = { x, width };
      
      if (tabId === activeTab && isSegmented && !scrollX) {
        indicatorLeft.setValue(x);
        setIndicatorWidth(width);
      }
    }, 50);
  }, [activeTab, isSegmented, indicatorLeft, scrollX]);

  useEffect(() => {
    return () => {
      if (layoutDebounceTimer.current) {
        clearTimeout(layoutDebounceTimer.current);
      }
    };
  }, []);

  const menuMaxWidth = useMemo(
    () => getTabletMenuMaxWidth(tabletLandscapeMaxWidth, tabletPortraitMaxWidth),
    [tabletLandscapeMaxWidth, tabletPortraitMaxWidth]
  );

  const interpolationRanges = useMemo(() => {
    if (!scrollX || !pagerWidth || containerWidth <= 0 || tabs.length === 0) {
      return null;
    }
    const totalPadding = scale(4) * 2;
    const availableWidth = containerWidth - totalPadding;
    const tabWidth = availableWidth / tabs.length;
    const startX = scale(4);
    
    return {
      inputRange: tabs.map((_, i) => i * pagerWidth),
      outputRange: tabs.map((_, i) => startX + (i * tabWidth)),
      tabWidth,
    };
  }, [scrollX, pagerWidth, containerWidth, tabs.length]);

  const interpolatedIndicatorTranslateX = useMemo(() => {
    if (interpolationRanges && scrollX) {
      return scrollX.interpolate({
        inputRange: interpolationRanges.inputRange,
        outputRange: interpolationRanges.outputRange,
        extrapolate: 'clamp',
      });
    }
    return indicatorLeft;
  }, [interpolationRanges, scrollX, indicatorLeft]);

  const interpolatedIndicatorWidth = useMemo(() => {
    if (interpolationRanges) {
      return interpolationRanges.tabWidth;
    }
    if (!scrollX) {
      return indicatorWidth;
    }
    if (tabLayouts.current[activeTab]) {
      return tabLayouts.current[activeTab].width;
    }
    return 0;
  }, [interpolationRanges, scrollX, indicatorWidth, activeTab]);

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

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const textInterpolations = useMemo(() => {
    if (!scrollX || !pagerWidth) return null;
    return tabs.map((_, index) => ({
      inactive: scrollX.interpolate({
        inputRange: [
          (index - 1) * pagerWidth,
          index * pagerWidth,
          (index + 1) * pagerWidth,
        ],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
      }),
      active: scrollX.interpolate({
        inputRange: [
          (index - 1) * pagerWidth,
          index * pagerWidth,
          (index + 1) * pagerWidth,
        ],
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
      }),
    }));
  }, [scrollX, pagerWidth, tabs.length]);

  if (isSegmented) {
    return (
      <View style={styles.container}>
        <View style={segmentedWrapperStyle} onLayout={handleContainerLayout}>
          <Animated.View style={slidingIndicatorStyle} />
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const animatedValue = getAnimatedValue(animatedValues, tab.id, isActive);
            const textInterp = textInterpolations?.[index];

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.segmentedTab}
                activeOpacity={0.9}
                onPress={() => handleTabPress(tab.id)}
                onLayout={(event) => handleTabLayout(tab.id, event)}>
                <View style={styles.tab}>
                  <Animated.Text
                    style={[
                      styles.tabText,
                      {
                        color: colors.text,
                        fontFamily: FontFamily.monasans.medium,
                        opacity: textInterp
                          ? textInterp.inactive
                          : animatedValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 0],
                            }),
                      },
                    ]}>
                    {tab.label}
                  </Animated.Text>
                  <Animated.Text
                    style={[
                      styles.tabText,
                      {
                        position: 'absolute',
                        color: colors.surface,
                        fontFamily: FontFamily.monasans.semiBold,
                        opacity: textInterp ? textInterp.active : animatedValue,
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
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const shouldAnimate = Math.abs(index - activeTabIndex) <= 1;
          const animatedValue = shouldAnimate
            ? getAnimatedValue(animatedValues, tab.id, isActive)
            : new Animated.Value(isActive ? 1 : 0);

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

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
              onLayout={(event) => handleTabLayout(tab.id, event)}>
              <Animated.View
                style={[
                  styles.tab,
                  {
                    backgroundColor,
                    transform: [{ scale }],
                    opacity,
                  },
                ]}>
                <Animated.Text
                  style={[
                    styles.tabText,
                    {
                      color: textColor,
                      fontFamily: isActive
                        ? FontFamily.monasans.semiBold
                        : FontFamily.monasans.regular,
                    },
                  ]}>
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
