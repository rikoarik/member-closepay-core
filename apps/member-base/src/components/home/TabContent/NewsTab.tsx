/**
 * NewsTab Component
 * Tab content untuk news dengan filter dan pagination
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, Filter } from 'iconsax-react-nativejs';
import { NewsItem, type News } from '../news/NewsItem';
import { NewsItemSkeleton } from '../news/NewsItemSkeleton';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { CloseCircle } from 'iconsax-react-nativejs';
import { NewsFilterBottomSheet, type NewsFilterState, type SortByOption } from './NewsFilterBottomSheet';

interface NewsTabProps {
  isActive?: boolean; // Add prop to know if tab is active
  isVisible?: boolean; // Add prop to know if tab is visible (for lifecycle)
  onRefreshRequested?: (refreshFn: () => void) => void; // Callback to expose refresh function to parent
}

const PAGE_SIZE = 10;

// Generate dummy data 100 items
const generateDummyNews = (): News[] => {
  const titles = [
    'Pembukaan Gedung Baru Kampus',
    'Workshop Teknologi Terkini',
    'Seminar Kewirausahaan',
    'Festival Budaya Lokal',
    'Kompetisi Olahraga Antar Fakultas',
    'Peluncuran Program Beasiswa',
    'Konser Musik Akhir Tahun',
    'Pameran Seni Rupa',
    'Diskusi Panel Isu Terkini',
    'Acara Donor Darah',
  ];

  const descriptions = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ];

  const news: News[] = [];
  const baseDate = new Date();
  baseDate.setFullYear(2024, 0, 1); // Start from Jan 1, 2024

  for (let i = 0; i < 100; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    news.push({
      id: String(i + 1),
      title: `${titles[i % titles.length]} ${i + 1}`,
      description: descriptions[i % descriptions.length],
      date: formattedDate,
      imageUrl: `https://picsum.photos/id/${1018 + (i % 20)}/200/200`,
    } as News & { createdAt: Date });
  }

  return news;
};

export const NewsTab: React.FC<NewsTabProps> = ({ isActive = true, isVisible = true, onRefreshRequested }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const horizontalPadding = getHorizontalPadding();

  // Generate all dummy data - hanya jika tab aktif atau visible (conditional rendering)
  const allNewsData = useMemo(() => {
    // Skip heavy computation jika tab tidak aktif dan tidak visible
    if (!isActive && !isVisible) return [];
    return generateDummyNews();
  }, [isActive, isVisible]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<NewsFilterState>({
    dateRange: { startDate: null, endDate: null },
    sortBy: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollPositionRef = useRef(0); // Preserve scroll position
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList to restore scroll position

  // Filter and sort news - skip jika tab tidak aktif dan tidak visible
  const processedNews = useMemo(() => {
    // Skip processing jika tab tidak aktif dan tidak visible
    if (!isActive && !isVisible) return [];
    
    let result = [...allNewsData];

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply date range filter
    if (filter.dateRange.startDate || filter.dateRange.endDate) {
      result = result.filter(item => {
        const itemDate = (item as any).createdAt;
        if (!itemDate) return true;
        
        if (filter.dateRange.startDate && itemDate < filter.dateRange.startDate) return false;
        if (filter.dateRange.endDate) {
          const endDate = new Date(filter.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) return false;
        }
        return true;
      });
    }

    // Apply sort
    if (filter.sortBy) {
      result.sort((a, b) => {
        switch (filter.sortBy) {
          case 'newest':
            return ((b as any).createdAt?.getTime() || 0) - ((a as any).createdAt?.getTime() || 0);
          case 'oldest':
            return ((a as any).createdAt?.getTime() || 0) - ((b as any).createdAt?.getTime() || 0);
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allNewsData, searchQuery, filter, isActive, isVisible]);

  // Paginated data - hanya load sesuai currentPage (10 item per page)
  const paginatedNews = useMemo(() => {
    if (!isActive && !isVisible) return [];
    const startIndex = 0;
    const endIndex = currentPage * PAGE_SIZE;
    return processedNews.slice(startIndex, endIndex);
  }, [processedNews, currentPage, isActive, isVisible]);

  const hasMore = paginatedNews.length < processedNews.length;

  // Show shimmer when loading data (initial load or refresh, but not load more)
  useEffect(() => {
    // Show shimmer when initial load or refresh (not load more - load more uses footer shimmer)
    if (refreshing || isInitialLoad) {
      // Show shimmer with delay 300ms when loading data
      const timer = setTimeout(() => {
        setShowShimmer(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Hide shimmer after data is loaded
      const timer = setTimeout(() => {
        setShowShimmer(false);
        setIsInitialLoad(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [refreshing, isInitialLoad]);

  // Simulate initial data loading
  useEffect(() => {
    if (isInitialLoad) {
      // Simulate data loading delay
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const loadMore = useCallback(() => {
    // Hanya load more jika:
    // - Tidak sedang loading
    // - Masih ada data
    // - Tidak sedang refresh
    // - Tab aktif
    // - Bukan initial load (sudah ada data)
    if (!isLoadingMore && hasMore && !refreshing && isActive && !isInitialLoad && paginatedNews.length > 0) {
      setIsLoadingMore(true);
      // Simulate loading delay
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore, refreshing, isActive, isInitialLoad, paginatedNews.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(onRefresh);
    }
  }, [onRefreshRequested, onRefresh]);

  const handleFilterApply = useCallback((newFilter: NewsFilterState) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const renderItem = useCallback(({ item }: { item: News }) => (
    <NewsItem
      news={item}
      onPress={(news) => {
        // @ts-ignore - Navigation type definition is separate
        navigation.navigate('NewsDetail', { news });
      }}
    />
  ), [navigation]);

  const renderFooter = () => {
    // Show shimmer saat loading more
    if (isLoadingMore && hasMore) {
      return (
        <View style={styles.footerShimmer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <NewsItemSkeleton key={`skeleton-footer-${index}`} />
          ))}
        </View>
      );
    }
    
    return null;
  };

  // Render placeholder jika tab tidak aktif dan tidak visible untuk menghemat resources
  if (!isActive && !isVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SearchNormal size={scale(20)} color={colors.textSecondary} variant="Linear" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('news.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: filter.sortBy || filter.dateRange.startDate || filter.dateRange.endDate
                  ? colors.primary
                  : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFilterVisible(true)}
          >
            <Filter
              size={scale(20)}
              color={
                filter.sortBy || filter.dateRange.startDate || filter.dateRange.endDate
                  ? colors.surface
                  : colors.text
              }
              variant="Linear"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showShimmer && (refreshing || isInitialLoad) && paginatedNews.length === 0 ? (
        <View
          style={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <NewsItemSkeleton key={`skeleton-${index}`} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={showShimmer && (refreshing || isInitialLoad) ? [] : paginatedNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          disableVirtualization={false}
          onScroll={(event) => {
            // Save scroll position for state preservation
            scrollPositionRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={32}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
              ListEmptyComponent={
                showShimmer && (refreshing || isInitialLoad) ? (
                  <View style={styles.emptyContainer}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <NewsItemSkeleton key={`skeleton-loading-${index}`} />
                    ))}
                  </View>
                ) : paginatedNews.length === 0 && !refreshing && !isLoadingMore && !isInitialLoad ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('news.noNewsFound') || 'Tidak ada berita ditemukan.'}
                </Text>
              </View>
            ) : null
          }
          // Lazy loading optimizations - hanya render item yang terlihat di layar
          initialNumToRender={5} // Render hanya 6 item pertama saat initial load (yang terlihat di layar)
          maxToRenderPerBatch={3} // Render maksimal 3 item per batch (lebih sedikit = lebih ringan)
          updateCellsBatchingPeriod={50} // Update setiap 50ms
          windowSize={3} // Render hanya 3x viewport (1.5x di atas, 1.5x di bawah) - lebih agresif
          removeClippedSubviews={true} // Hapus view yang tidak terlihat dari memory
          nestedScrollEnabled={true} // Enable nested scroll untuk tab horizontal
          scrollEnabled={isActive} // Only enable scroll when tab is active
          bounces={false} // Disable bounce untuk mencegah scroll interference
          directionalLockEnabled={true} // Lock scroll direction untuk mencegah interference
          getItemLayout={(data, index) => {
            // Tinggi item: image (56) + padding top/bottom (12*2) + margin bottom (8)
            const itemHeight = scale(56) + scale(24) + moderateVerticalScale(8);
            return {
              length: itemHeight,
              offset: itemHeight * index,
              index,
            };
          }}
        />
      )}

      <NewsFilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        initialFilter={filter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden', // Prevent scroll interference with parent scroll views
  },
  searchContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(8),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  filterButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerShimmer: {
    paddingTop: moderateVerticalScale(8),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0, // Remove default padding
  },
  clearButton: {
    padding: scale(4),
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    paddingTop: moderateVerticalScale(16),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

