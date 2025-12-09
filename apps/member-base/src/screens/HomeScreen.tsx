/**
 * HomeScreen Component
 * Dashboard screen sesuai design
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Animated, Text, RefreshControl, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  TabSwitcher,
  useDimensions,
  type Tab,
  useConfig,
  useRefreshWithConfig,
} from '@core/config';
import {
  TopBar,
  TransactionsTab,
  AnalyticsTab,
  NewsTab,
  BerandaTab,
  AktivitasTab,
} from '../components/home';
import { useNotifications } from '@core/notification';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions(); // Reactive terhadap orientation changes
  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Get config (reactive via useConfig hook)
  const { config } = useConfig();
  const homeVariant = config?.homeVariant || 'dashboard';
  
  // Memoize homeTabs to prevent unnecessary re-renders
  const homeTabs = React.useMemo(() => {
    return config?.homeTabs || [];
  }, [config?.homeTabs]);

  // Determine tabs based on variant
  const tabs: Tab[] = React.useMemo(() => {
    if (homeVariant === 'member' && homeTabs.length > 0) {
      // Use custom tabs from config with i18n translation
      return homeTabs
        .filter(tab => tab.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(tab => {
          // Map tab id to i18n key, fallback to label from config if no i18n key found
          const i18nKey = `home.${tab.id}`;
          const translatedLabel = t(i18nKey);
          // If translation exists and is different from key, use it; otherwise use config label
          const label = translatedLabel && translatedLabel !== i18nKey ? translatedLabel : tab.label;
          return { id: tab.id, label };
        });
    }
    // Default tabs for dashboard variant
    return [
      { id: 'beranda', label: t('home.home') || 'Beranda' },
      { id: 'transactions', label: t('home.transactions') },
      { id: 'analytics', label: t('home.analytics') },
      { id: 'news', label: t('home.news') },
    ];
  }, [homeVariant, homeTabs, t]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || 'beranda');
  const tabRefreshFunctionsRef = useRef<{ [key: string]: () => void }>({});

  const registerTabRefresh = useCallback((tabId: string, refreshFn: () => void) => {
    tabRefreshFunctionsRef.current[tabId] = refreshFn;
  }, []);

  // Use useRefreshWithConfig untuk auto-refresh config + data tab
  const { refresh: handleRefresh, isRefreshing: refreshing } = useRefreshWithConfig({
    onRefresh: async () => {
      // Call refresh function of active tab
      const refreshFn = tabRefreshFunctionsRef.current[activeTab];
      if (refreshFn) {
        refreshFn();
      }
    },
    enableConfigRefresh: true, // Auto-refresh config setiap pull-to-refresh
  });
  
  // Memoized tab content renderer untuk prevent unnecessary re-renders
  const renderTabContent = useCallback((tabId: string, index: number) => {
    if (homeVariant === 'member') {
      // For member variant, render simple content or custom component
      const tabConfig = homeTabs.find(tab => tab.id === tabId);
      
      // Render BerandaTab for beranda/home tab (handle both 'beranda' and 'home' id)
      if (tabId === 'beranda' || tabId === 'home') {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <BerandaTab isActive={activeTab === tabId} />
          </View>
        );
      }
      
      // Render AktivitasTab for activity/aktivitas tab
      if (tabId === 'activity' || tabId === 'aktivitas') {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <AktivitasTab 
              isActive={activeTab === tabId}
              isVisible={activeTab === tabId}
            />
          </View>
        );
      }
      
      // Render NewsTab for news tab
      if (tabId === 'news') {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <NewsTab 
              isActive={activeTab === 'news'}
              isVisible={activeTab === 'news'}
              onRefreshRequested={(refreshFn) => {
                registerTabRefresh('news', refreshFn);
              }}
            />
          </View>
        );
      }
      
      if (tabConfig?.component) {
        // TODO: Load custom component dynamically
        // For now, render placeholder
        return (
          <View style={{ width: screenWidth, padding: getHorizontalPadding() }}>
            <Text style={{ color: colors.text }}>{tabConfig.label}</Text>
          </View>
        );
      }
      // Default: simple text content
      return (
        <View style={{ width: screenWidth, padding: getHorizontalPadding(), justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>{tabConfig?.label || tabId}</Text>
        </View>
      );
    }
    
    // Default dashboard variant content
    return null; // Will be handled below
  }, [homeVariant, homeTabs, screenWidth, activeTab, colors, getHorizontalPadding, registerTabRefresh]);

  const handleMenuPress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex(tab => tab.id === tabId);
  };

  // Helper untuk menentukan tab mana yang harus dirender (lazy loading)
  // Hanya render tab aktif, tab sebelumnya, dan tab berikutnya untuk performa
  const shouldRenderTab = useCallback((tabId: string, index: number) => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    // Render tab aktif, tab sebelumnya, dan tab berikutnya
    return Math.abs(index - activeIndex) <= 1;
  }, [tabs, activeTab]);

  const handlePagerMomentumEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);

    if (tabs[index] && tabs[index].id !== activeTab) {
      setActiveTab(tabs[index].id);
    }
  }, [screenWidth, tabs, activeTab]);

  // Debounced tab change untuk prevent lag
  const tabChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTabChange = useCallback((tabId: string) => {
    // Clear previous timeout
    if (tabChangeTimeoutRef.current) {
      clearTimeout(tabChangeTimeoutRef.current);
    }
    
    // Update state immediately untuk UI feedback
    setActiveTab(tabId);
    
    // Defer heavy scroll operation
    tabChangeTimeoutRef.current = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        if (pagerRef.current) {
          const index = getTabIndex(tabId);
          if (index >= 0) {
            pagerRef.current.scrollTo({
              x: index * screenWidth,
              animated: true,
            });
          }
        }
      });
    }, 50);
  }, [screenWidth, tabs, getTabIndex]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
    };
  }, []);

  // Set posisi awal pager ke tab pertama
  useEffect(() => {
    if (pagerRef.current && tabs.length > 0) {
      pagerRef.current.scrollTo({
        x: 0,
        animated: false,
      });
      setActiveTab(tabs[0].id);
    }
  }, [screenWidth, tabs]);

  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Spacer for native indicator */}
        <View style={styles.refreshIndicatorContainer} />

        {/* TopBar - Not sticky */}
        <View
          style={[
            styles.topBarContainer,
            {
              paddingHorizontal: getHorizontalPadding(),
              backgroundColor: colors.background,
            },
          ]}
        >
          <TopBar
            notificationCount={unreadCount}
            onNotificationPress={handleNotificationPress}
            onMenuPress={handleMenuPress}
          />
        </View>

        {/* Tab Switcher - Sticky */}
        {tabs.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.background },
              { paddingHorizontal: getHorizontalPadding() },
            ]}
          >
            <TabSwitcher
              variant="segmented"
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              scrollX={scrollX}
              pagerWidth={screenWidth}
            />
          </View>
        )}

        {/* Pager horizontal dengan scroll vertikal per tab */}
        <View>
          {homeVariant === 'member' ? (
            // Member variant: simple tabs without balance card, menu, transaction history
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={8}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              removeClippedSubviews={true}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
              )}
              onMomentumScrollEnd={handlePagerMomentumEnd}
              onScrollBeginDrag={() => {
                // Prevent tab change during drag untuk smoother experience
              }}
            >
              {tabs.map((tab, index) => {
                // Lazy loading: hanya render tab aktif dan tab adjacent
                if (!shouldRenderTab(tab.id, index)) {
                  return (
                    <View
                      key={tab.id}
                      style={{ width: screenWidth, flex: 1 }}
                      pointerEvents="none"
                    />
                  );
                }
                
                return (
                  <View
                    key={tab.id}
                    style={{ width: screenWidth, flex: 1 }}
                    pointerEvents={activeTab === tab.id ? 'auto' : 'none'}
                  >
                    {renderTabContent(tab.id, index)}
                  </View>
                );
              })}
            </Animated.ScrollView>
          ) : (
            // Dashboard variant: default with balance card, transactions, etc.
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              removeClippedSubviews={true}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true },
              )}
              onMomentumScrollEnd={handlePagerMomentumEnd}
              onScrollBeginDrag={() => {
                // Prevent tab change during drag untuk smoother experience
              }}
            >
              {/* Beranda Page */}
              {shouldRenderTab('beranda', getTabIndex('beranda')) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === 'beranda' ? 'auto' : 'none'}
                >
                  <BerandaTab
                    isActive={activeTab === 'beranda'}
                    isVisible={activeTab === 'beranda'}
                  />
                </View>
              ) : (
                <View style={{ width: screenWidth, flex: 1 }} pointerEvents="none" />
              )}

              {/* Transactions Page */}
              {shouldRenderTab('transactions', getTabIndex('transactions')) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === 'transactions' ? 'auto' : 'none'}
                >
                  <TransactionsTab
                    title="Kantin FKI UPI"
                    balance={2000000000}
                    showBalance={false}
                    onToggleBalance={() => {}}
                    onBalanceDetailPress={() => {}}
                    isActive={activeTab === 'transactions'}
                    isVisible={activeTab === 'transactions'}
                    onRefreshRequested={(refreshFn) => {
                      registerTabRefresh('transactions', refreshFn);
                    }}
                  />
                </View>
              ) : (
                <View style={{ width: screenWidth, flex: 1 }} pointerEvents="none" />
              )}

              {/* Analytics Page */}
              {shouldRenderTab('analytics', getTabIndex('analytics')) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === 'analytics' ? 'auto' : 'none'}
                >
                  <AnalyticsTab
                    isActive={activeTab === 'analytics'}
                    isVisible={activeTab === 'analytics'}
                  />
                </View>
              ) : (
                <View style={{ width: screenWidth, flex: 1 }} pointerEvents="none" />
              )}

              {/* News Page */}
              {shouldRenderTab('news', getTabIndex('news')) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === 'news' ? 'auto' : 'none'}
                >
                  <NewsTab
                    isActive={activeTab === 'news'}
                    isVisible={activeTab === 'news'}
                    onRefreshRequested={(refreshFn) => {
                      registerTabRefresh('news', refreshFn);
                    }}
                  />
                </View>
              ) : (
                <View style={{ width: screenWidth, flex: 1 }} pointerEvents="none" />
              )}
            </Animated.ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContent: {
    width: '100%',
  },
  refreshIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(8),
  },
  topBarContainer: {
    paddingBottom: moderateVerticalScale(8),
    paddingTop: 0,
    marginTop: -moderateVerticalScale(6),
  },
  section: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
});
