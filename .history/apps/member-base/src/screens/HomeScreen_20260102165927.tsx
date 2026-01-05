/**
 * HomeScreen Component
 * Dashboard screen sesuai design
 * Responsive untuk semua device termasuk EDC
 */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  Text,
  InteractionManager,
  BackHandler,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@core/theme";
import { useTranslation } from "@core/i18n";
import {
  moderateVerticalScale,
  getHorizontalPadding,
  TabSwitcher,
  useDimensions,
  type Tab,
  useConfig,
  useRefreshWithConfig,
  AnimatedRefreshWrapper,
} from "@core/config";
import {
  TopBar,
  TransactionsTab,
  AnalyticsTab,
  NewsTab,
  BerandaTab,
  AktivitasTab,
} from "../components/home";
import { useNotifications } from "@core/notification";
import Toast from 'react-native-toast-message';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions();
  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const { config } = useConfig();
  const homeVariant = config?.homeVariant || "dashboard";

  const homeTabs = React.useMemo(() => {
    return config?.homeTabs || [];
  }, [config?.homeTabs]);

  const tabs: Tab[] = React.useMemo(() => {
    if (homeVariant === "member" && homeTabs.length > 0) {
      return homeTabs
        .filter((tab) => tab.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((tab) => {
          const i18nKey = `home.${tab.id}`;
          const translatedLabel = t(i18nKey);
          const label =
            translatedLabel && translatedLabel !== i18nKey
              ? translatedLabel
              : tab.label;
          return { id: tab.id, label };
        });
    }
    // Default tabs for dashboard variant
    return [
      { id: "beranda", label: t("home.home") || "Beranda" },
      { id: "transactions", label: t("home.transactions") },
      { id: "analytics", label: t("home.analytics") },
      { id: "news", label: t("home.news") },
    ];
  }, [homeVariant, homeTabs, t]);

  const [activeTab, setActiveTab] = useState<string>("home");
  const tabRefreshFunctionsRef = useRef<{ [key: string]: () => void }>({});
  const hasSetOrder2TabRef = useRef(false);
  const backPressTimeRef = useRef<number>(0);
  const DOUBLE_BACK_PRESS_DELAY = 2000;
  
  useEffect(() => {
    if (tabs.length >= 2) {
      const order2TabId = tabs[1].id;
      setActiveTab(order2TabId);
      hasSetOrder2TabRef.current = true;
    } else if (tabs.length > 0 && !hasSetOrder2TabRef.current) {
      setActiveTab(tabs[0].id);
      hasSetOrder2TabRef.current = true;
    }
  }, [tabs]);

  const registerTabRefresh = useCallback(
    (tabId: string, refreshFn: () => void) => {
      tabRefreshFunctionsRef.current[tabId] = refreshFn;
    },
    []
  );

  const { refresh: handleRefresh, isRefreshing: refreshing } =
    useRefreshWithConfig({
      onRefresh: async () => {
        // Call refresh function of active tab
        const refreshFn = tabRefreshFunctionsRef.current[activeTab];
        if (refreshFn) {
          refreshFn();
        }
      },
      enableConfigRefresh: true,
    });

  const renderTabContent = useCallback(
    (tabId: string, index: number) => {
      if (homeVariant === "member") {
        const tabConfig = homeTabs.find((tab) => tab.id === tabId);

        if (tabId === "beranda" || tabId === "home") {
          return (
            <View style={{ width: screenWidth, flex: 1 }}>
              <BerandaTab isActive={activeTab === tabId} />
            </View>
          );
        }

        if (tabId === "activity" || tabId === "aktivitas") {
          return (
            <View style={{ width: screenWidth, flex: 1 }}>
              <AktivitasTab
                isActive={activeTab === tabId}
                isVisible={activeTab === tabId}
              />
            </View>
          );
        }

        if (tabId === "news") {
          return (
            <View style={{ width: screenWidth, flex: 1 }}>
              <NewsTab
                isActive={activeTab === "news"}
                isVisible={activeTab === "news"}
                onRefreshRequested={(refreshFn) => {
                  registerTabRefresh("news", refreshFn);
                }}
              />
            </View>
          );
        }

        if (tabConfig?.component) {
          return (
            <View
              style={{ width: screenWidth, padding: getHorizontalPadding() }}
            >
              <Text style={{ color: colors.text }}>{tabConfig.label}</Text>
            </View>
          );
        }
        // Default: simple text content
        return (
          <View
            style={{
              width: screenWidth,
              padding: getHorizontalPadding(),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {tabConfig?.label || tabId}
            </Text>
          </View>
        );
      }

      // Default dashboard variant content
      return null; // Will be handled below
    },
    [
      homeVariant,
      homeTabs,
      screenWidth,
      activeTab,
      colors,
      registerTabRefresh,
    ]
  );

  const handleMenuPress = () => {
    navigation.navigate("Profile" as never);
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications" as never);
  };

  const getTabIndex = useCallback(
    (tabId: string) => {
      return tabs.findIndex((tab) => tab.id === tabId);
    },
    [tabs]
  );

  const activeTabIndex = useMemo(
    () => tabs.findIndex((t) => t.id === activeTab),
    [tabs, activeTab]
  );

  const shouldRenderTab = useCallback(
    (tabId: string, index: number) => {
      return Math.abs(index - activeTabIndex) <= 1;
    },
    [activeTabIndex]
  );

  const handlePagerMomentumEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (tabs[index] && tabs[index].id !== activeTab) {
        setActiveTab(tabs[index].id);
      }
    },
    [screenWidth, tabs, activeTab]
  );

  const tabChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const handleTabChange = useCallback(
    (tabId: string) => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }

      setActiveTab(tabId);
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
    },
    [screenWidth, getTabIndex]
  );

  useEffect(() => {
    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
    };
  }, []);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (pagerRef.current && tabs.length >= 2 && hasSetOrder2TabRef.current && !hasInitializedRef.current) {
      const middleTabIndex = 1;
      setTimeout(() => {
        if (pagerRef.current) {
          pagerRef.current.scrollTo({
            x: middleTabIndex * screenWidth,
            animated: false,
          });
        }
      }, 0);
      hasInitializedRef.current = true;
    }
  }, [screenWidth, tabs, activeTab]);

  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const homeTabId = tabs.find(tab => tab.id === 'home' || tab.id === 'beranda')?.id;
        const isHomeTab = homeTabId && activeTab === homeTabId;

        if (!isHomeTab && homeTabId) {
          setActiveTab(homeTabId);
          const homeIndex = tabs.findIndex(tab => tab.id === homeTabId);
          if (homeIndex >= 0 && pagerRef.current) {
            pagerRef.current.scrollTo({
              x: homeIndex * screenWidth,
              animated: true,
            });
          }
          return true;
        }

        const now = Date.now();
        if (backPressTimeRef.current && (now - backPressTimeRef.current) < DOUBLE_BACK_PRESS_DELAY) {
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          }
          return true;
        } else {
          backPressTimeRef.current = now;
          Toast.show({
            type: 'info',
            text1: t('common.pressAgainToExit') || 'Tekan sekali lagi untuk keluar',
            position: 'bottom',
            visibilityTime: 2000,
          });
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
        backPressTimeRef.current = 0;
      };
    }, [activeTab, tabs, screenWidth])
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
      <AnimatedRefreshWrapper
        refreshing={refreshing}
        onRefresh={handleRefresh}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
      >
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
          {homeVariant === "member" ? (
            // Member variant: simple tabs without balance card, menu, transaction history
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={8}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              removeClippedSubviews={true}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={handlePagerMomentumEnd}
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
                    pointerEvents={activeTab === tab.id ? "auto" : "none"}
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
              directionalLockEnabled={true}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              removeClippedSubviews={true}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={handlePagerMomentumEnd}
            >
              {/* Beranda Page */}
              {shouldRenderTab("beranda", getTabIndex("beranda")) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === "beranda" ? "auto" : "none"}
                >
                  <BerandaTab
                    isActive={activeTab === "beranda"}
                    isVisible={activeTab === "beranda"}
                  />
                </View>
              ) : (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents="none"
                />
              )}

              {/* Transactions Page */}
              {shouldRenderTab("transactions", getTabIndex("transactions")) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === "transactions" ? "auto" : "none"}
                >
                  <TransactionsTab
                    title="Kantin FKI UPI"
                    balance={2000000000}
                    showBalance={false}
                    onToggleBalance={() => {}}
                    onBalanceDetailPress={() => {}}
                    isActive={activeTab === "transactions"}
                    isVisible={activeTab === "transactions"}
                    onRefreshRequested={(refreshFn) => {
                      registerTabRefresh("transactions", refreshFn);
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents="none"
                />
              )}

              {/* Analytics Page */}
              {shouldRenderTab("analytics", getTabIndex("analytics")) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === "analytics" ? "auto" : "none"}
                >
                  <AnalyticsTab
                    isActive={activeTab === "analytics"}
                    isVisible={activeTab === "analytics"}
                  />
                </View>
              ) : (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents="none"
                />
              )}

              {/* News Page */}
              {shouldRenderTab("news", getTabIndex("news")) ? (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === "news" ? "auto" : "none"}
                >
                  <NewsTab
                    isActive={activeTab === "news"}
                    isVisible={activeTab === "news"}
                    onRefreshRequested={(refreshFn) => {
                      registerTabRefresh("news", refreshFn);
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents="none"
                />
              )}
            </Animated.ScrollView>
          )}
        </View>
      </AnimatedRefreshWrapper>
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
    width: "100%",
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
