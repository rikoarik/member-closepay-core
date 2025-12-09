/**
 * NotificationScreen
 * Slicing UI notifikasi sesuai design
 */
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  NotificationList,
  useNotifications,
  type Notification,
} from "@core/notification";
import { useTheme } from "@core/theme";
import { useTranslation } from "@core/i18n";
import {
  getHorizontalPadding,
  moderateVerticalScale,
  NotificationItemSkeleton,
  ScreenHeader,
  scale,
  getResponsiveFontSize,
  FontFamily,
  DatePicker,
  BottomSheet,
  useDimensions,
  useRefreshWithConfig,
} from "@core/config";
import {
  SearchNormal,
  CloseCircle,
  Calendar,
  NotificationBing,
} from "iconsax-react-nativejs";

type ReadStatusFilter = "all" | "unread" | "read";

export const NotificationScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useDimensions();

  const { notifications, isLoading, refresh: refreshNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  // Wrap dengan useRefreshWithConfig untuk auto-refresh config
  const { refresh, isRefreshing } = useRefreshWithConfig({
    onRefresh: refreshNotifications,
    enableConfigRefresh: true,
  });

  // Selection states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [readStatusFilter, setReadStatusFilter] =
    useState<ReadStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // Auto ke bulan saat ini
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [isStartDate, setIsStartDate] = useState(true);
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<string | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  
  // Get selected notification from array to ensure it's always up-to-date
  const selectedNotification = useMemo(() => {
    if (!selectedNotificationId) return null;
    return notifications.find(n => n.id === selectedNotificationId) || null;
  }, [selectedNotificationId, notifications]);
  const monthScrollViewRef = useRef<ScrollView>(null);
  const monthLayouts = useRef<{ [key: number]: { x: number; width: number } }>(
    {}
  );
  const [containerWidth, setContainerWidth] = useState(0);

  // Generate months list
  const months = useMemo(() => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return monthNames.map((name, index) => ({ name, value: index + 1 }));
  }, []);

  // Handle month pill layout untuk mendapatkan posisi dan ukuran yang tepat
  const handleMonthLayout = useCallback((month: number, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    monthLayouts.current[month] = { x, width };
  }, []);

  // Handle container layout untuk mendapatkan lebar container
  const handleContainerLayout = useCallback((event: any) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Auto scroll to current month on mount atau saat selectedMonth berubah
  useEffect(() => {
    if (
      monthScrollViewRef.current &&
      monthLayouts.current[selectedMonth] &&
      containerWidth > 0
    ) {
      const layout = monthLayouts.current[selectedMonth];
      // Calculate scroll position: center the selected month in viewport
      // Available width = containerWidth - (horizontalPadding * 2)
      const availableWidth = containerWidth - horizontalPadding * 2;
      // Center position: pillX - (availableWidth - pillWidth) / 2
      const scrollPosition = Math.max(
        0,
        layout.x - (availableWidth - layout.width) / 2
      );

      setTimeout(() => {
        monthScrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 150);
    }
  }, [selectedMonth, containerWidth, horizontalPadding]);

  // Sync selectedMonth dengan dateRange
  const syncMonthToDateRange = useCallback((month: number) => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentYear, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);
    setDateRange({ startDate, endDate });
  }, []);

  // Sync dateRange ke selectedMonth
  const syncDateRangeToMonth = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      if (startDate && endDate) {
        const startMonth = startDate.getMonth() + 1;
        const startYear = startDate.getFullYear();
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        const currentYear = new Date().getFullYear();

        // Jika start dan end di bulan yang sama dan tahun yang sama dengan tahun sekarang, set selectedMonth
        if (
          startMonth === endMonth &&
          startYear === currentYear &&
          endYear === currentYear
        ) {
          // Check jika date range adalah awal dan akhir bulan
          const firstDayOfMonth = new Date(currentYear, startMonth - 1, 1);
          firstDayOfMonth.setHours(0, 0, 0, 0);
          const lastDayOfMonth = new Date(currentYear, startMonth, 0);
          lastDayOfMonth.setHours(23, 59, 59, 999);

          if (
            startDate.getTime() === firstDayOfMonth.getTime() &&
            endDate.getTime() === lastDayOfMonth.getTime()
          ) {
            setSelectedMonth(startMonth);
          }
        }
      } else if (!startDate && !endDate) {
        // Jika date range di-reset, reset juga selectedMonth ke bulan saat ini
        setSelectedMonth(new Date().getMonth() + 1);
      }
    },
    []
  );

  // Handle month selection
  const handleMonthSelect = useCallback(
    (month: number) => {
      setSelectedMonth(month);
      syncMonthToDateRange(month);
    },
    [syncMonthToDateRange]
  );

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      setDateRange({ startDate, endDate });
      syncDateRangeToMonth(startDate, endDate);
    },
    [syncDateRangeToMonth]
  );

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (readStatusFilter === "read") {
      filtered = filtered.filter((n) => n.isRead);
    } else if (readStatusFilter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((n) => {
        const notificationDate =
          n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt);

        if (dateRange.startDate && notificationDate < dateRange.startDate) {
          return false;
        }
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (notificationDate > endDate) {
            return false;
          }
        }
        return true;
      });
    }

    return filtered;
  }, [notifications, readStatusFilter, searchQuery, dateRange]);

  const handleNotificationPress = (notification: Notification) => {
    if (selectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedIds);
      if (newSelected.has(notification.id)) {
        newSelected.delete(notification.id);
      } else {
        newSelected.add(notification.id);
      }
      setSelectedIds(newSelected);
    } else {
      // Normal press - show detail in bottom sheet
      setSelectedNotificationId(notification.id);
      setShowDetailSheet(true);

      // Mark as read if not read
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  const handleSelectionChange = (notificationId: string, selected: boolean) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedIds(newSelected);

    // Auto exit selection mode jika tidak ada yang dipilih
    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.size === 0) return;

    // Mark all selected as read
    await Promise.all(Array.from(selectedIds).map((id) => markAsRead(id)));

    // Clear selection and exit selection mode
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleDatePickerOpen = (isStart: boolean) => {
    setIsStartDate(isStart);
    setShowDateRangePicker(true);
  };

  const handleDatePickerConfirm = (date: Date) => {
    if (isStartDate) {
      handleDateRangeChange(date, dateRange.endDate);
    } else {
      handleDateRangeChange(dateRange.startDate, date);
    }
    setShowDateRangePicker(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedTime = date
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", ".");

    return `${formattedDate}   |   ${formattedTime} WIB`;
  };

  const getTypeStyles = (type: Notification["type"]) => {
    // Semua icon menggunakan primary color untuk konsistensi
    return {
      iconBg: colors.primary,
      iconColor: colors.surface,
      highlight: colors.primaryLight,
    };
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={[]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScreenHeader
          title={
            selectionMode
              ? `${selectedIds.size} ${
                  t("notifications.selected") || "Dipilih"
                }`
              : t("notifications.title")
          }
          rightComponent={
            selectionMode ? (
              <TouchableOpacity onPress={handleCancelSelection}>
                <Text
                  style={[styles.headerActionText, { color: colors.primary }]}
                >
                  {t("common.cancel") || "Batal"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setSelectionMode(true)}>
                <Text
                  style={[styles.headerActionText, { color: colors.primary }]}
                >
                  {t("notifications.select") || "Pilih"}
                </Text>
              </TouchableOpacity>
            )
          }
        />

        {/* Filter Pills: Semua, Belum Dibaca, Dibaca */}
        <View
          style={[
            styles.filterContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
          >
            {(["all", "unread", "read"] as ReadStatusFilter[]).map((status) => {
              const labels = {
                all: t("notifications.filterAll") || "Semua",
                unread: t("notifications.filterUnread") || "Belum Dibaca",
                read: t("notifications.filterRead") || "Dibaca",
              };
              const isActive = readStatusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setReadStatusFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: isActive
                          ? colors.surface
                          : colors.text,
                        fontFamily: isActive
                          ? FontFamily.monasans.semiBold
                          : FontFamily.monasans.regular,
                      },
                    ]}
                  >
                    {labels[status]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search and Date Range */}
        <View
          style={[
            styles.searchContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <SearchNormal
                size={scale(20)}
                color={colors.textSecondary}
                variant="Linear"
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={
                  t("notifications.searchPlaceholder") || "Cari notifikasi..."
                }
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <CloseCircle
                    size={scale(20)}
                    color={colors.textSecondary}
                    variant="Linear"
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.dateRangeButton,
                {
                  backgroundColor:
                    dateRange.startDate || dateRange.endDate
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleDatePickerOpen(true)}
            >
              <Calendar
                size={scale(20)}
                color={
                  dateRange.startDate || dateRange.endDate
                    ? colors.surface
                    : colors.text
                }
                variant="Linear"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Pills */}
        <View
          style={[
            styles.monthContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
          onLayout={handleContainerLayout}
        >
          <ScrollView
            ref={monthScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthPills}
          >
            {months.map((month) => {
              const isActive = selectedMonth === month.value;
              return (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.monthPill,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleMonthSelect(month.value)}
                  onLayout={(event) => handleMonthLayout(month.value, event)}
                >
                  <Text
                    style={[
                      styles.monthPillText,
                      {
                        color: isActive
                          ? colors.surface
                          : colors.text,
                        fontFamily: isActive
                          ? FontFamily.monasans.semiBold
                          : FontFamily.monasans.regular,
                      },
                    ]}
                  >
                    {month.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading && notifications.length === 0 ? (
          <View
            style={[
              styles.loadingState,
              {
                backgroundColor: colors.background,
                flex: 1,
              },
            ]}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: moderateVerticalScale(16),
                paddingBottom: insets.bottom,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  {
                    paddingHorizontal: horizontalPadding,
                  },
                ]}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <NotificationItemSkeleton key={`skeleton-${index}`} />
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <>
            <NotificationList
              notifications={filteredNotifications}
              onNotificationPress={handleNotificationPress}
              refreshing={isLoading || isRefreshing}
              onRefresh={refresh}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
            />

            {/* Action Bar untuk Selection Mode */}
            {selectionMode && (
              <View
                style={[
                  styles.actionBar,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleMarkSelectedAsRead}
                  disabled={selectedIds.size === 0}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: colors.surface },
                    ]}
                  >
                    {t("notifications.markSelected") || "Tandai yang Dipilih"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionButtonSecondary,
                    { borderColor: colors.border },
                  ]}
                  onPress={handleMarkAllAsRead}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.primary }]}
                  >
                    {t("notifications.markAll") || "Tandai Semua"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Date Range Picker */}
        <DatePicker
          visible={showDateRangePicker}
          onClose={() => setShowDateRangePicker(false)}
          onConfirm={handleDatePickerConfirm}
          value={isStartDate ? dateRange.startDate : dateRange.endDate}
          minimumDate={
            isStartDate ? undefined : dateRange.startDate || undefined
          }
          maximumDate={isStartDate ? dateRange.endDate || undefined : undefined}
          title={
            isStartDate
              ? t("news.selectStartDate") || "Pilih Tanggal Mulai"
              : t("news.selectEndDate") || "Pilih Tanggal Akhir"
          }
          yearRange={100}
        />

        {/* Notification Detail Bottom Sheet */}
        <BottomSheet
          visible={showDetailSheet}
          onClose={() => {
            setShowDetailSheet(false);
            setSelectedNotificationId(null);
          }}
          snapPoints={[6000, 6000]}
          initialSnapPoint={0}
        >
          {selectedNotification && (
            <View
              style={[
                styles.detailContainer,
                { paddingHorizontal: horizontalPadding },
              ]}
            >
              <View style={styles.detailHeader}>
                <View
                  style={[
                    styles.detailIconWrapper,
                    {
                      backgroundColor: getTypeStyles(selectedNotification.type)
                        .iconBg,
                    },
                  ]}
                >
                  <NotificationBing
                    size={scale(32)}
                    color={getTypeStyles(selectedNotification.type).iconColor}
                    variant="Bold"
                  />
                </View>
                <View style={styles.detailHeaderText}>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    {selectedNotification.title}
                  </Text>
                  <Text
                    style={[styles.detailDate, { color: colors.textSecondary }]}
                  >
                    {formatDateTime(
                      selectedNotification.createdAt instanceof Date
                        ? selectedNotification.createdAt
                        : new Date(selectedNotification.createdAt)
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.detailContent}>
                <Text style={[styles.detailMessage, { color: colors.text }]}>
                  {selectedNotification.message}
                </Text>

                {selectedNotification.data &&
                  Object.keys(selectedNotification.data).length > 0 && (
                    <View
                      style={[
                        styles.detailDataContainer,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.detailDataTitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t("notifications.additionalInfo") ||
                          "Informasi Tambahan"}
                      </Text>
                      {Object.entries(selectedNotification.data).map(
                        ([key, value]) => (
                          <View key={key} style={styles.detailDataRow}>
                            <Text
                              style={[
                                styles.detailDataKey,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {key}:
                            </Text>
                            <Text
                              style={[
                                styles.detailDataValue,
                                { color: colors.text },
                              ]}
                            >
                              {String(value)}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
              </View>
            </View>
          )}
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  loadingState: {
    // flex: 1 moved to inline style
  },
  filterContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(8),
  },
  filterPills: {
    flexDirection: "row",
    gap: scale(8),
  },
  filterPill: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: getResponsiveFontSize("small"),
  },
  searchContainer: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(8),
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize("medium"),
    paddingVertical: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  dateRangeButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthContainer: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(8),
  },
  monthPills: {
    flexDirection: "row",
    gap: scale(8),
  },
  monthPill: {
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(6),
    borderRadius: scale(16),
    borderWidth: 1,
  },
  monthPillText: {
    fontSize: getResponsiveFontSize("small"),
  },
  headerActionText: {
    fontSize: getResponsiveFontSize("medium"),
    fontFamily: FontFamily.monasans.semiBold,
  },
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(12),
    borderTopWidth: 1,
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize("medium"),
    fontFamily: FontFamily.monasans.semiBold,
  },
  detailContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: moderateVerticalScale(24),
    gap: scale(16),
  },
  detailIconWrapper: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: "center",
    alignItems: "center",
  },
  detailHeaderText: {
    flex: 1,
  },
  detailTitle: {
    fontSize: getResponsiveFontSize("xlarge"),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  detailDate: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.regular,
  },
  detailContent: {
    gap: moderateVerticalScale(16),
  },
  detailMessage: {
    fontSize: getResponsiveFontSize("medium"),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: getResponsiveFontSize("medium") * 1.6,
  },
  detailDataContainer: {
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginTop: moderateVerticalScale(8),
  },
  detailDataTitle: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  detailDataRow: {
    flexDirection: "row",
    marginBottom: moderateVerticalScale(8),
    gap: scale(8),
  },
  detailDataKey: {
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.medium,
    minWidth: scale(100),
  },
  detailDataValue: {
    flex: 1,
    fontSize: getResponsiveFontSize("small"),
    fontFamily: FontFamily.monasans.regular,
  },
});
